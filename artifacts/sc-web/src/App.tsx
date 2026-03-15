import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "wouter";
import { RecoveryProvider } from "@/context/RecoveryContext";
import { RestartProvider, useRestart } from "@/context/RestartContext";
import { LaunchScreen } from "@/components/LaunchScreen";
import { BottomNav } from "@/components/BottomNav";
import Home from "@/pages/Home";
import Onboarding from "@/pages/Onboarding";
import Profile from "@/pages/Profile";
import Progress from "@/pages/Progress";
import Community from "@/pages/Community";
import Coping from "@/pages/Coping";
import Emergency from "@/pages/Emergency";
import { useState } from "react";

const queryClient = new QueryClient();

const FULLSCREEN_ROUTES = ["/onboarding", "/emergency", "/coping"];

function AppShell() {
  const [location, navigate] = useLocation();
  const [showInitialLaunch, setShowInitialLaunch] = useState(true);
  const { showLaunch, launchKey, onLaunchFinish } = useRestart();

  const isFullscreen = FULLSCREEN_ROUTES.some((r) => location.startsWith(r));

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      justifyContent: "center",
      backgroundColor: "#F0EDE8",
    }}>
      <div style={{
        width: "100%", maxWidth: 430,
        backgroundColor: "#F8F6F3",
        display: "flex", flexDirection: "column",
        minHeight: "100dvh",
        position: "relative",
      }}>
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px", paddingTop: isFullscreen ? 20 : 0 }}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/onboarding" component={Onboarding} />
            <Route path="/profile" component={Profile} />
            <Route path="/progress" component={Progress} />
            <Route path="/community" component={Community} />
            <Route path="/coping" component={Coping} />
            <Route path="/emergency" component={Emergency} />
          </Switch>
        </div>

        {/* Bottom nav — hide on fullscreen routes */}
        {!isFullscreen && <BottomNav />}

        {/* Launch screens */}
        {showInitialLaunch && (
          <LaunchScreen key="initial" onFinish={() => setShowInitialLaunch(false)} />
        )}
        {showLaunch && (
          <LaunchScreen
            key={`restart-${launchKey}`}
            onFinish={() => {
              onLaunchFinish();
              navigate("/onboarding");
            }}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <RecoveryProvider>
          <RestartProvider>
            <AppShell />
          </RestartProvider>
        </RecoveryProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
