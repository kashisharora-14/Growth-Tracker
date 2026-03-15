import React, { createContext, useCallback, useContext, useState } from "react";

type RestartContextType = {
  triggerRestart: () => void;
  showLaunch: boolean;
  launchKey: number;
  onLaunchFinish: () => void;
};

const RestartContext = createContext<RestartContextType>({
  triggerRestart: () => {},
  showLaunch: false,
  launchKey: 0,
  onLaunchFinish: () => {},
});

export function useRestart() {
  return useContext(RestartContext);
}

export function RestartProvider({ children }: { children: React.ReactNode }) {
  const [showLaunch, setShowLaunch] = useState(false);
  const [launchKey, setLaunchKey] = useState(0);

  const triggerRestart = useCallback(() => {
    setLaunchKey((k) => k + 1);
    setShowLaunch(true);
  }, []);

  const onLaunchFinish = useCallback(() => {
    setShowLaunch(false);
  }, []);

  return (
    <RestartContext.Provider value={{ triggerRestart, showLaunch, launchKey, onLaunchFinish }}>
      {children}
    </RestartContext.Provider>
  );
}
