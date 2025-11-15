import c from "./Experiment.module.scss";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Performance from "./Performance";
import Description from "./Description";
import DataSources from "./DataSources";
import Note from "./Note";
import { experimentData } from "./data";

function Experiment() {
  const { experimentId } = useParams();
  const [activeTab, setActiveTab] = useState("Performance");
  const [summary, setSummary] = useState("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [notesUpdated, setNotesUpdated] = useState(0);
  const intervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Generate summary using data from data.js
  useEffect(() => {
    // Abort any pending request if component re-renders
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const generateSummary = async () => {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      setIsLoadingSummary(true);
      setElapsedTime(0);
      const startTime = Date.now();

      // Start timer
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Get all text content from data.js
      const summaryTexts = experimentData.getSummaryText();

      console.log(summaryTexts);

      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3000"
          }/api/experiment/summarize`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              performance: summaryTexts.performance,
              description: summaryTexts.description,
              dataSources: summaryTexts.dataSources,
              notes: summaryTexts.notes,
            }),
            signal: signal,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Handle JSON response - wait for complete response
        const data = await response.json();
        if (data.summary) {
          setSummary(data.summary);
        }

        setIsLoadingSummary(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } catch (error) {
        // Ignore abort errors (happens when component unmounts or re-renders)
        if (error.name === "AbortError") {
          return;
        }
        console.error("Error generating summary:", error);
        setIsLoadingSummary(false);
        // Clear timer
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        // Keep default summary on error
      }
    };

    generateSummary();

    // Cleanup interval and abort pending requests on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [experimentId, notesUpdated]);

  const tabs = [
    "Performance",
    "Experiment Description",
    "Data Sources",
    "Additional notes",
  ];

  return (
    <div className={c.page}>
      <div className={c.container}>
        {/* Title */}
        <h1 className={c.title}>{experimentId || "Exp-231"}</h1>

        {/* AI Summary Card */}
        <div
          className={`${c.summaryCard} ${isLoadingSummary ? c.loading : ""}`}
        >
          <h2 className={c.summaryTitle}>
            AI Summary — Cross sources insight:
          </h2>
          {isLoadingSummary ? (
            <p className={c.summaryText}>
              Generating summary... ({elapsedTime}s)
            </p>
          ) : (
            <p className={c.summaryText}>{summary}</p>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className={c.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`${c.tab} ${activeTab === tab ? c.activeTab : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Performance" && <Performance />}
        {activeTab === "Experiment Description" && <Description />}
        {activeTab === "Data Sources" && <DataSources />}
        {activeTab === "Additional notes" && (
          <Note onNoteAdded={() => setNotesUpdated((prev) => prev + 1)} />
        )}
      </div>
    </div>
  );
}

export default Experiment;
