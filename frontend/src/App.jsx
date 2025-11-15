import { Routes, Route } from "react-router-dom";
import c from "./App.module.scss";
import Landing from "./pages/landing/Landing";
import Home from "./pages/home/Home";
import Experiment from "./pages/experiment/Experiment";
import NotFound from "./pages/notfound/NotFound";
import Layout from "./components/layout/Layout";
import { ExperimentTabsProvider } from "./contexts/ExperimentTabsContext";

function App() {
  return (
    <div className={c.app}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          element={
            <ExperimentTabsProvider>
              <Layout />
            </ExperimentTabsProvider>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/experiment/:experimentId" element={<Experiment />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
