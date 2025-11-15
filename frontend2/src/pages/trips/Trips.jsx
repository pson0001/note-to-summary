import { useNavigate } from "react-router-dom";
import Icon from "../../assets/Icon";
import c from "./trips.module.scss";
import { useTrips } from "../../contexts/TripsContext";

function Trips() {
  const navigate = useNavigate();
  const { trips } = useTrips();

  const handleCreateTrip = () => {
    navigate("/trips/new");
  };

  return (
    <div className={c.trips}>
      <div className={c.ctaButton} onClick={handleCreateTrip}>
        <Icon.Add />
        <span>Create a new trip</span>
      </div>
      <div className={c.tripsList}>
        {trips.map((trip) => (
          <div
            className={c.tripItem}
            key={trip.destination?.id}
            onClick={() => navigate(`/trips/${trip.destination?.id}`)}
          >
            {trip.destination?.image && (
              <img
                src={trip.destination.image}
                alt={trip.destination?.title || "Trip"}
              />
            )}
            <div className={c.tripItemContent}>
              <div className={c.tripItemTitle}>
                Trip to {trip.destination?.title || "..."}
              </div>
              <div className={c.tripItemDate}>
                {trip.destination?.startDate} - {trip.destination?.endDate}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Trips;
