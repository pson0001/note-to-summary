import { useParams, useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import c from "./trip.module.scss";
import { useState, useEffect } from "react";
import Icon from "../../../assets/Icon";
import { useTrips } from "../../../contexts/TripsContext";

function Trip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // If id is undefined and we're on /trips/new, treat it as "new"
  const effectiveId =
    id === undefined && location.pathname === "/trips/new" ? "new" : id;
  const tripsContext = useTrips();

  const {
    trips,
    handleAddLocation,
    updateLocationInTrip,
    createNewTrip = tripsContext.createNewTrip, // Fallback to direct access
    isProcessing,
    processingTime,
  } = tripsContext;
  const [trip, setTrip] = useState(null);
  const [locations, setLocations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [textareaValue, setTextareaValue] = useState("");
  const [editingLocationIndex, setEditingLocationIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    location: "",
    description: "",
    category: "other",
    dateRange: { start: "", end: "" },
    highlights: [],
  });

  // Load trip data from context based on trip id
  useEffect(() => {
    if (
      effectiveId === "new" ||
      (id === undefined && location.pathname === "/trips/new")
    ) {
      // For new trips, set empty state
      setTrip({
        id: "new",
        title: "...",
        image: null,
        startDate: new Date().toISOString().split("T")[0],
        endDate: null,
      });
      setLocations([]);
      return;
    }

    // Try to find by numeric ID first
    const numericId = parseInt(effectiveId);
    if (!isNaN(numericId)) {
      const tripData = trips.find((trip) => trip.destination.id === numericId);
      if (tripData) {
        setTrip(tripData.destination);
        setLocations(tripData.items);
        return;
      }
    }

    // Try to find by string ID (UUID)
    const tripData = trips.find((trip) => trip.destination.id === effectiveId);
    if (tripData) {
      setTrip(tripData.destination);
      setLocations(tripData.items);
    }
  }, [effectiveId, id, location.pathname, trips]);

  const handleToggleModal = () => {
    if (isModalOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsClosing(false);
        setModalMode("add");
        setTextareaValue(""); // Reset textarea when closing
        setEditingLocationIndex(null);
        setEditFormData({
          title: "",
          location: "",
          description: "",
          category: "other",
          dateRange: { start: "", end: "" },
          highlights: [],
        });
      }, 300); // Match animation duration
    } else {
      setModalMode("add");
      setIsModalOpen(true);
    }
  };

  const handleAddLocationClick = async () => {
    if (!textareaValue.trim()) {
      return;
    }

    if (isProcessing) {
      return;
    }

    let tripId;

    // Check if id is "new" (handle both exact match, undefined with /trips/new path, and trimmed)
    const isNewTrip =
      effectiveId === "new" ||
      id === "new" ||
      (typeof id === "string" && id.trim() === "new");

    if (isNewTrip) {
      // Use direct access if destructured version is undefined
      const createNewTripFn = createNewTrip || tripsContext.createNewTrip;

      // if (typeof createNewTripFn !== "function") {
      //   alert(
      //     "Error: createNewTrip is not available. Please refresh the page."
      //   );
      //   return;
      // }
      try {
        tripId = createNewTripFn("New Trip");

        if (!tripId) {
          alert("Failed to create new trip. Please try again.");
          return;
        }
      } catch (error) {
        alert(`Error creating new trip: ${error.message}`);
        return;
      }
    } else {
      // Try to parse as number first, otherwise use as string
      const numericId = parseInt(id);
      tripId = isNaN(numericId) ? id : numericId;

      // Check if trip exists in the trips array
      const tripExists = trips.some(
        (trip) => trip.destination.id === tripId || trip.destination.id === id
      );

      // If trip doesn't exist and id is not a number, create a new trip
      if (!tripExists && isNaN(numericId)) {
        // Use direct access if destructured version is undefined
        const createNewTripFn = createNewTrip || tripsContext.createNewTrip;

        if (typeof createNewTripFn !== "function") {
          alert(
            "Error: createNewTrip is not available. Please refresh the page."
          );
          return;
        }
        try {
          tripId = createNewTripFn("New Trip");
        } catch (error) {
          alert(`Error creating new trip: ${error.message}`);
          return;
        }
      } else if (!tripExists) {
        console.warn("Trip doesn't exist and id is numeric:", tripId);
      }
    }

    if (!tripId || tripId === "undefined" || tripId === "null") {
      console.error("Invalid trip ID detected:", tripId);
      return;
    }

    try {
      await handleAddLocation(tripId, textareaValue);
      setTextareaValue(""); // Clear textarea after successful processing

      // Navigate to the new trip if we just created it
      if (
        isNewTrip ||
        effectiveId === "new" ||
        (id === undefined && location.pathname === "/trips/new")
      ) {
        navigate(`/trips/${tripId}`);
      }

      handleToggleModal(); // Close modal after adding
    } catch (error) {
      console.error("Error in handleAddLocationClick:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleLocationClick = (index) => {
    const location = locations[index];
    setEditingLocationIndex(index);
    setEditFormData({
      title: location.title || "",
      location: location.location || "",
      description: location.description || "",
      category: location.category || "other",
      dateRange: {
        start: location.dateRange?.start || "",
        end: location.dateRange?.end || "",
      },
      highlights: location.highlights || [],
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSaveLocation = () => {
    if (editingLocationIndex === null) return;

    const tripId = parseInt(id);
    if (isNaN(tripId)) return;

    const updatedLocation = {
      title: editFormData.title,
      location: editFormData.location,
      description: editFormData.description,
      category: editFormData.category,
      dateRange: {
        start: editFormData.dateRange.start || null,
        end: editFormData.dateRange.end || null,
      },
      highlights: editFormData.highlights.filter((h) => h.trim() !== ""),
    };

    updateLocationInTrip(tripId, editingLocationIndex, updatedLocation);
    handleToggleModal(); // Use the unified close handler
  };

  const handleAddHighlight = () => {
    setEditFormData({
      ...editFormData,
      highlights: [...editFormData.highlights, ""],
    });
  };

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...editFormData.highlights];
    newHighlights[index] = value;
    setEditFormData({ ...editFormData, highlights: newHighlights });
  };

  const handleRemoveHighlight = (index) => {
    const newHighlights = editFormData.highlights.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, highlights: newHighlights });
  };

  return (
    <>
      <div className={c.trip}>
        <div>
          <button className={c.backButton} onClick={() => navigate("/trips")}>
            <Icon.ChevronLeft />
            <span>Back</span>
          </button>
        </div>
        <div className={c.tripHeader}>
          <h1>Trip to {trip?.title || id || "..."}</h1>
        </div>
        <div className={c.tripContent}>
          {locations.length > 0 ? (
            <div className={c.tripContentItems}>
              {locations.map((location, index) => (
                <div
                  key={index}
                  className={c.locationItem}
                  onClick={() => handleLocationClick(index)}
                >
                  <div className={c.locationHeader}>
                    <span
                      className={`${c.locationCategory} ${
                        c[
                          `category${
                            location.category.charAt(0).toUpperCase() +
                            location.category.slice(1)
                          }`
                        ]
                      }`}
                    >
                      {location.category}
                    </span>
                    <h3 className={c.locationTitle}>{location.title}</h3>
                  </div>
                  <div className={c.locationInfo}>
                    <span className={c.locationName}>{location.location}</span>
                    {location.dateRange.start && (
                      <span className={c.locationDate}>
                        {location.dateRange.start}
                        {location.dateRange.end &&
                          ` - ${location.dateRange.end}`}
                      </span>
                    )}
                  </div>
                  {location.description && (
                    <p className={c.locationDescription}>
                      {location.description}
                    </p>
                  )}
                  {location.highlights.length > 0 &&
                    location.highlights[0] !== "" && (
                      <ul className={c.locationHighlights}>
                        {location.highlights.map((highlight, idx) => (
                          <li key={idx}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                </div>
              ))}
            </div>
          ) : (
            <div className={c.tripContentEmpty}>
              <p>Waiting for its first entry...</p>
            </div>
          )}
        </div>
        <div className={c.tripFooter}>
          <button
            className={`${c.addButton} ${isModalOpen ? c.closeButton : ""}`}
            onClick={handleToggleModal}
          >
            <Icon.Add />
          </button>
        </div>
      </div>

      {isModalOpen &&
        createPortal(
          <div
            className={`${c.modalOverlay} ${
              isClosing ? c.modalOverlayClose : ""
            }`}
          >
            <div
              className={`${c.modalContent} ${
                modalMode === "edit" ? c.editModalContent : ""
              } ${isClosing ? c.modalContentClose : ""}`}
            >
              {modalMode === "edit" && (
                <div className={c.modalHeader}>
                  <h2>Edit Location</h2>
                </div>
              )}
              <div
                className={modalMode === "edit" ? c.editModalBody : c.modalBody}
              >
                {modalMode === "add" ? (
                  <>
                    <textarea
                      type="text"
                      placeholder="Add a place or paste any travel guide here. It will be organise it for you!"
                      className={c.modalInput}
                      value={textareaValue}
                      onChange={(e) => setTextareaValue(e.target.value)}
                    />
                    <button
                      className={c.modalButton}
                      disabled={!textareaValue.trim() || isProcessing}
                      onClick={handleAddLocationClick}
                    >
                      {isProcessing
                        ? `Processing... ${processingTime}s`
                        : "Add"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className={c.formContainer}>
                      <div className={c.formGroup}>
                        <label>Title</label>
                        <input
                          type="text"
                          value={editFormData.title}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              title: e.target.value,
                            })
                          }
                          className={c.formInput}
                        />
                      </div>

                      <div className={c.formGroup}>
                        <label>Location</label>
                        <input
                          type="text"
                          value={editFormData.location}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              location: e.target.value,
                            })
                          }
                          className={c.formInput}
                        />
                      </div>

                      <div className={c.formGroup}>
                        <label>Category</label>
                        <select
                          value={editFormData.category}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              category: e.target.value,
                            })
                          }
                          className={c.formSelect}
                        >
                          <option value="attraction">Attraction</option>
                          <option value="restaurant">Restaurant</option>
                          <option value="hotel">Hotel</option>
                          <option value="activity">Activity</option>
                          <option value="event">Event</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className={c.formRow}>
                        <div className={c.formGroup}>
                          <label>Start Date</label>
                          <input
                            type="text"
                            placeholder="MM-DD"
                            value={editFormData.dateRange.start}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                dateRange: {
                                  ...editFormData.dateRange,
                                  start: e.target.value,
                                },
                              })
                            }
                            className={c.formInput}
                          />
                        </div>

                        <div className={c.formGroup}>
                          <label>End Date</label>
                          <input
                            type="text"
                            placeholder="MM-DD"
                            value={editFormData.dateRange.end}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                dateRange: {
                                  ...editFormData.dateRange,
                                  end: e.target.value,
                                },
                              })
                            }
                            className={c.formInput}
                          />
                        </div>
                      </div>

                      <div className={c.formGroup}>
                        <label>Description</label>
                        <textarea
                          value={editFormData.description}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              description: e.target.value,
                            })
                          }
                          className={c.formTextarea}
                          rows={4}
                        />
                      </div>

                      <div className={c.formGroup}>
                        <div className={c.highlightsHeader}>
                          <label>Highlights</label>
                          <button
                            type="button"
                            onClick={handleAddHighlight}
                            className={c.addHighlightButton}
                          >
                            <Icon.Add /> Add Highlight
                          </button>
                        </div>
                        {editFormData.highlights.map((highlight, idx) => (
                          <div key={idx} className={c.highlightItem}>
                            <input
                              type="text"
                              value={highlight}
                              onChange={(e) =>
                                handleHighlightChange(idx, e.target.value)
                              }
                              className={c.formInput}
                              placeholder="Enter highlight"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveHighlight(idx)}
                              className={c.removeButton}
                            >
                              <Icon.Close />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={c.editModalActions}>
                      <button
                        className={c.cancelButton}
                        onClick={handleToggleModal}
                      >
                        Cancel
                      </button>
                      <button
                        className={c.saveButton}
                        onClick={handleSaveLocation}
                      >
                        Save
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default Trip;
