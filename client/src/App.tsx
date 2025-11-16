import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import QLearning from "./pages/QLearning";
import MultiAgent from "./pages/MultiAgent";
import SwarmIntelligence from "./pages/SwarmIntelligence";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/q-learning" component={QLearning} />
      <Route path="/multi-agent" component={MultiAgent} />
      <Route path="/swarm" component={SwarmIntelligence} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
