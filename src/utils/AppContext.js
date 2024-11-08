import React, { createContext, useContext, useState, useEffect, version } from 'react';

const AppContext = createContext();
export default AppContext;

// basic context provider
export const AppProvider = ({ children }) => {
    // define state
    const [showMainNets, setShowMainNets] = useState(true);

    return (
        <AppContext.Provider value={{ showMainNets, setShowMainNets }}>
            {children}
        </AppContext.Provider>
    );
};

// custom hook
export const useAppContext = () => useContext(AppContext);


