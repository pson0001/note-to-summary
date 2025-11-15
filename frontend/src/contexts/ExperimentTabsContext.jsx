import { createContext, useContext, useState, useCallback } from "react";

const ExperimentTabsContext = createContext();

export const useExperimentTabs = () => {
  const context = useContext(ExperimentTabsContext);
  if (!context) {
    throw new Error("useExperimentTabs must be used within ExperimentTabsProvider");
  }
  return context;
};

export const ExperimentTabsProvider = ({ children }) => {
  const [openTabs, setOpenTabs] = useState([]);

  const addTab = useCallback((experimentName) => {
    setOpenTabs((prev) => {
      // Don't add if already exists
      if (prev.includes(experimentName)) {
        return prev;
      }
      return [...prev, experimentName];
    });
  }, []);

  const removeTab = useCallback((experimentName) => {
    setOpenTabs((prev) => prev.filter((name) => name !== experimentName));
  }, []);

  return (
    <ExperimentTabsContext.Provider value={{ openTabs, addTab, removeTab }}>
      {children}
    </ExperimentTabsContext.Provider>
  );
};

