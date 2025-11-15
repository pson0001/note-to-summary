import { createContext, useContext, useState, useCallback } from "react";
import sampleData from "../pages/trips/sample-data";

const TripsContext = createContext();

// Simple UUID generator
const generateUUID = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export function TripsProvider({ children }) {
  const [trips, setTrips] = useState(sampleData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const addLocationToTrip = (tripId, newItems) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) =>
        trip.destination.id === tripId
          ? { ...trip, items: [...trip.items, ...newItems] }
          : trip
      )
    );
  };

  const updateLocationInTrip = (tripId, locationIndex, updatedLocation) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) =>
        trip.destination.id === tripId
          ? {
              ...trip,
              items: trip.items.map((item, idx) =>
                idx === locationIndex ? updatedLocation : item
              ),
            }
          : trip
      )
    );
  };

  const updateTripTitle = (tripId, newTitle) => {
    console.log(newTitle);
    setTrips((prevTrips) =>
      prevTrips.map((trip) =>
        trip.destination.id === tripId
          ? {
              ...trip,
              destination: {
                ...trip.destination,
                title: newTitle,
              },
            }
          : trip
      )
    );
  };

  const createNewTrip = useCallback((title = "New Trip") => {
    const newTripId = generateUUID();

    if (!newTripId) {
      throw new Error("Failed to generate trip ID");
    }

    const newTrip = {
      destination: {
        id: newTripId,
        title: title,
        image: null,
        startDate: new Date().toISOString().split("T")[0],
        endDate: null,
      },
      items: [],
    };

    setTrips((prevTrips) => {
      const updated = [...prevTrips, newTrip];
      return updated;
    });

    return newTripId;
  }, []);

  const handleAddLocation = async (tripId, text) => {
    if (!text.trim() || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setProcessingTime(0);
    const startTime = Date.now();

    // Start timer interval
    const timerInterval = setInterval(() => {
      setProcessingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      const response = await fetch(`${API_URL}/api/trip/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process travel text");
      }

      const data = await response.json();

      if (data.items && Array.isArray(data.items)) {
        // Update trip with new items and potentially update title if city is detected
        setTrips((prevTrips) => {
          return prevTrips.map((trip) => {
            if (trip.destination.id === tripId) {
              const shouldUpdateTitle =
                data.city &&
                data.city.trim() &&
                (trip.destination.title === "New Trip" ||
                  !trip.destination.title ||
                  trip.destination.title.trim() === "");

              return {
                ...trip,
                items: [...trip.items, ...data.items],
                destination: {
                  ...trip.destination,
                  title: shouldUpdateTitle
                    ? data.city.trim()
                    : trip.destination.title,
                },
              };
            }
            return trip;
          });
        });

        return { success: true };
      }
    } catch (error) {
      console.error("Error processing travel text:", error);
      throw error;
    } finally {
      clearInterval(timerInterval);
      setIsProcessing(false);
      setProcessingTime(0);
    }
  };

  // Verify createNewTrip is defined before creating context value
  if (typeof createNewTrip !== "function") {
    console.error(
      "ERROR: createNewTrip is not a function! Type:",
      typeof createNewTrip
    );
  }

  const contextValue = {
    trips,
    setTrips,
    addLocationToTrip,
    updateLocationInTrip,
    updateTripTitle,
    handleAddLocation,
    createNewTrip,
    isProcessing,
    processingTime,
  };

  return (
    <TripsContext.Provider value={contextValue}>
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips() {
  const context = useContext(TripsContext);
  if (!context) {
    throw new Error("useTrips must be used within a TripsProvider");
  }
  return context;
}
