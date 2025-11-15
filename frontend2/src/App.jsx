import { Routes, Route } from "react-router-dom";
import Landing from "./pages/landing/Landing";
import Trips from "./pages/trips/Trips";
import Trip from "./pages/trips/trip/Trip";
import { TripsProvider } from "./contexts/TripsContext";
import c from "./App.module.scss";

function App() {
  return (
    <div className={c.app}>
      <TripsProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/new" element={<Trip />} />
          <Route path="/trips/:id" element={<Trip />} />
        </Routes>
      </TripsProvider>
    </div>
  );
}

export default App;
