import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL = "llama3.2:3b"; // Fast, efficient model good for note generation and summarization

// Cache for model availability to avoid checking on every request
let modelAvailableCache = {
  status: null, // null = unknown, true = available, false = unavailable
  lastChecked: null,
};

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to check if Ollama is available and get model list
async function checkOllamaAndModels() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: "GET",
    });
    if (!response.ok) {
      return { available: false, models: [] };
    }
    const data = await response.json();
    const models = data.models || [];
    return { available: true, models };
  } catch (error) {
    return { available: false, models: [] };
  }
}

// Helper function to ensure model is available (with caching)
async function ensureModelAvailable() {
  // Use cache if recently checked (within last 5 minutes)
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  const now = Date.now();

  if (
    modelAvailableCache.status === true &&
    modelAvailableCache.lastChecked &&
    now - modelAvailableCache.lastChecked < CACHE_TTL
  ) {
    return true; // Model is cached as available
  }

  try {
    const { available, models } = await checkOllamaAndModels();

    if (!available) {
      modelAvailableCache = { status: false, lastChecked: now };
      throw new Error(
        "Ollama service is not available. Make sure it's running."
      );
    }

    const modelExists = models.some((m) => m.name === MODEL);

    if (!modelExists) {
      console.log(`Model ${MODEL} not found. Pulling...`);
      // Pull model - this is a streaming endpoint, so we need to handle it differently
      const pullResponse = await fetch(`${OLLAMA_URL}/api/pull`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: MODEL,
        }),
      });

      if (!pullResponse.ok) {
        modelAvailableCache = { status: false, lastChecked: now };
        throw new Error(`Failed to pull model: ${pullResponse.statusText}`);
      }

      // Read the stream to completion
      const reader = pullResponse.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim());
          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              if (json.status === "success") {
                console.log(`Model ${MODEL} pulled successfully`);
                modelAvailableCache = { status: true, lastChecked: now };
                return true;
              }
            } catch (e) {
              // Ignore parse errors for non-JSON lines
            }
          }
        }
      }
      console.log(`Model ${MODEL} pull completed`);
      modelAvailableCache = { status: true, lastChecked: now };
      return true;
    }

    // Model exists, cache the result
    modelAvailableCache = { status: true, lastChecked: now };
    return true;
  } catch (error) {
    console.error("Error ensuring model availability:", error);
    // Don't cache errors - they might be transient
    throw error;
  }
}

// Helper function to call Ollama API
async function callOllama(prompt, systemPrompt = null) {
  try {
    // Ensure model is available (with caching)
    await ensureModelAvailable();

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt,
        system: systemPrompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // If we get a model not found error, invalidate cache
      if (response.status === 404 || errorText.includes("model")) {
        modelAvailableCache = { status: null, lastChecked: null };
      }
      throw new Error(
        `Ollama API error (${response.status}): ${
          errorText || response.statusText
        }`
      );
    }

    const data = await response.json();
    if (!data.response) {
      throw new Error("No response from Ollama model");
    }
    return data.response;
  } catch (error) {
    console.error("Error calling Ollama:", error.message);
    throw error;
  }
}

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Health check endpoint that also checks Ollama
app.get("/api/health/ollama", async (req, res) => {
  try {
    const { available, models } = await checkOllamaAndModels();
    if (!available) {
      return res.status(503).json({
        status: "unhealthy",
        message: "Ollama service is not available",
      });
    }

    const modelExists = models.some((m) => m.name === MODEL);

    res.json({
      status: "healthy",
      ollama: "available",
      model: MODEL,
      modelAvailable: modelExists,
      availableModels: models.map((m) => m.name),
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});

// AI-powered travel text processing
app.post("/api/trip/process", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    const prompt = `
    Analyze the following travel text and extract structured information about locations, dates, and activities.
    Return ONLY a valid JSON object with this exact structure:
    {
      "city": "string | null",
      "items": [
    {
      "title": "string",
      "dateRange": { "start": "string", "end": "string | null" },
      "location": "string",
      "description": "string",
      "highlights": ["string"],
      "category": "string"
        }
      ]
    }
    
    Extract the main city or destination name from the text. If a city is mentioned, set "city" to that city name. If no clear city is mentioned, set "city" to null.
    Extract all locations mentioned in the text. If dates are mentioned, parse them. If no dates are found, use null for end date.
    Categories should be one of: "attraction", "restaurant", "hotel", "activity", "event", "other"
    
    Travel text:
    ${text}
    
    Return ONLY the JSON object, no other text.
    `;

    const systemPrompt =
      "You are a travel information extraction AI. Extract structured location data from travel guides, itineraries, or travel notes. Always return valid JSON objects with the exact structure specified. Parse dates in MM-DD format when possible. Identify the main city or destination name from the text.";

    const response = await callOllama(prompt, systemPrompt);

    // Try to extract JSON from the response
    let items = [];
    let city = null;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = response
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      // Try to parse as JSON
      const parsed = JSON.parse(cleanedResponse);

      // Handle both old format (array) and new format (object with city and items)
      if (Array.isArray(parsed)) {
        // Old format - backward compatibility
        items = parsed;
      } else if (parsed.items && Array.isArray(parsed.items)) {
        // New format
        items = parsed.items;
        city = parsed.city || null;
      } else {
        // Single item object
        items = [parsed];
      }

      // Validate structure to match sample-data format
      items = items.map((item) => ({
        title: item.title || "Untitled",
        dateRange: {
          start: item.dateRange?.start || null,
          end: item.dateRange?.end || null,
        },
        location: item.location || "Unknown",
        description: item.description || "",
        highlights: Array.isArray(item.highlights) ? item.highlights : [],
        category: item.category || "other",
      }));

      // Fallback: If no city was extracted by AI, try to extract from locations or text
      if (!city || !city.trim()) {
        // Try to find a common location across items (most frequently mentioned location word)
        const locationWords = {};
        items.forEach((item) => {
          if (item.location && item.location !== "Unknown") {
            // Extract potential city names (capitalized words before commas or at start)
            const matches = item.location.match(
              /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/
            );
            if (matches && matches[1]) {
              const potentialCity = matches[1].trim();
              locationWords[potentialCity] =
                (locationWords[potentialCity] || 0) + 1;
            }
          }
        });

        // Get the most common location word
        if (Object.keys(locationWords).length > 0) {
          const mostCommon = Object.entries(locationWords).sort(
            (a, b) => b[1] - a[1]
          )[0][0];
          city = mostCommon;
        } else {
          // Last resort: Try to extract from the original text
          const cityMatch = text.match(
            /(?:in|to|visit|visiting|explore|exploring)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
          );
          if (cityMatch && cityMatch[1]) {
            city = cityMatch[1].trim();
          }
        }
      }

      console.log("Final extracted city:", city);
      console.log("Items count:", items.length);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw response:", response);
      return res.status(500).json({
        error: "Failed to parse AI response",
        details: parseError.message,
      });
    }

    res.json({ items, city });
  } catch (error) {
    console.error("Error processing travel text:", error);
    res.status(500).json({
      error: `Failed to process travel text: ${error.message}`,
      details: "Check /api/health/ollama to verify Ollama status",
    });
  }
});

// AI-powered experiment summary generation
app.post("/api/experiment/summarize", async (req, res) => {
  try {
    const { performance, description, dataSources, notes } = req.body;

    if (!performance && !description && !dataSources && !notes) {
      return res
        .status(400)
        .json({ error: "At least one section is required" });
    }

    // Combine all text content (limit length to avoid slow processing)
    let combinedText = "";

    if (performance) {
      combinedText += `PERFORMANCE DATA:\n${performance}\n\n`;
    }

    if (description) {
      combinedText += `EXPERIMENT DESCRIPTION:\n${description}\n\n`;
    }

    if (dataSources) {
      combinedText += `DATA SOURCES:\n${dataSources}\n\n`;
    }

    if (notes) {
      combinedText += `ADDITIONAL NOTES:\n${notes}\n\n`;
    }

    // Truncate if too long to avoid slow processing (keep last 4000 chars)
    if (combinedText.length > 4000) {
      combinedText = combinedText.slice(-4000);
    }

    const prompt = `
    You must always explicitly reference and incorporate insights from the "ADDITIONAL NOTES" section if it exists.
  
    Based on the following experiment information, generate a concise cross-source insight summary (2-3 sentences)
    that highlights key findings and correlations across sources.
    
    ${combinedText}
    `;
    const systemPrompt =
      "You are an AI assistant that analyzes experiment data from multiple sources (Jira, Confluence, Slack, Snowflake, GitHub and additional notes(must use on the ADDITIONAL NOTES if provided))) and generates insightful summaries that connect findings across different platforms. Focus on identifying patterns, correlations, and key insights. Keep responses concise (2-3 sentences).";

    // Call Ollama without streaming - wait for complete response
    // callOllama already ensures model is available, so no need to call it separately
    const summary = await callOllama(prompt, systemPrompt);

    // Return complete response as JSON
    res.json({ summary });
  } catch (error) {
    console.error("Error generating experiment summary:", error);
    res.status(500).json({
      error: `Failed to generate summary: ${error.message}`,
      details: "Check /api/health/ollama to verify Ollama status",
    });
  }
});

// Initialize Ollama model on startup
async function initializeOllama() {
  let retries = 10;
  let delay = 3000; // Start with 3 seconds

  while (retries > 0) {
    try {
      console.log(`Checking Ollama availability (${11 - retries}/10)...`);
      const { available } = await checkOllamaAndModels();

      if (available) {
        console.log("Ollama is available. Checking model...");
        try {
          await ensureModelAvailable();
          console.log(`✓ Model ${MODEL} is ready`);
          return;
        } catch (error) {
          console.error(`Error ensuring model: ${error.message}`);
          console.log("Model will be pulled on first use");
          return;
        }
      }
    } catch (error) {
      console.log(`Ollama not ready yet: ${error.message}`);
    }

    retries--;
    if (retries > 0) {
      console.log(`Waiting ${delay / 1000}s before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 1.5, 10000); // Exponential backoff, max 10s
    }
  }

  console.log("⚠ Ollama initialization timeout. It may still be starting up.");
  console.log("The model will be pulled automatically on first AI request.");
}

const server = app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Ollama URL: ${OLLAMA_URL}`);
  console.log(`Model: ${MODEL}`);
  // Wait a bit for Ollama to start, then initialize
  setTimeout(initializeOllama, 2000);
});

// Remove headers timeout
server.headersTimeout = 0;
