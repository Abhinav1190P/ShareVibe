import React, { createContext, useState, useContext } from 'react';

const TabContext = createContext();

export const useTab = () => {
  return useContext(TabContext);
};

export const TabProvider = ({ children }) => {
  const [currentTab, setCurrentTab] = useState(0);

  const setTab = (index) => {
    setCurrentTab(index);
  };

  return (
    <TabContext.Provider value={{ currentTab, setTab }}>
      {children}
    </TabContext.Provider>
  );
};
