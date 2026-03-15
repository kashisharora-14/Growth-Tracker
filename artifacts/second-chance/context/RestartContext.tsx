import React, { createContext, useContext, useCallback, useState } from "react";

type RestartContextType = {
  triggerRestart: () => void;
};

const RestartContext = createContext<RestartContextType>({
  triggerRestart: () => {},
});

export function useRestart() {
  return useContext(RestartContext);
}

type Props = {
  children: (opts: {
    showLaunch: boolean;
    launchKey: number;
    onLaunchFinish: () => void;
  }) => React.ReactNode;
};

export function RestartProvider({ children }: Props) {
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
    <RestartContext.Provider value={{ triggerRestart }}>
      {children({ showLaunch, launchKey, onLaunchFinish })}
    </RestartContext.Provider>
  );
}
