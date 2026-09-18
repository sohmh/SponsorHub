import { useAuth } from "./_core/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ActivityLog from "@/pages/ActivityLog";
import Contacts from "@/pages/Contacts";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Offers from "@/pages/Offers";
import SponsorPipeline from "@/pages/SponsorPipeline";
import Team from "@/pages/Team";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect } from "react";

function AuthenticatedRouter() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (loading) return;
    if (!user && location !== "/login") {
      setLocation("/login");
    }
  }, [user, loading, location, setLocation]);

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (loading) return;
    if (user && location === "/login") {
      setLocation("/");
    }
  }, [user, loading, location, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center animate-pulse">
            <img src="/aIDEAS.jpg" alt="aIDEAS" className="w-full h-full object-contain" />
          </div>
          <span className="text-xs font-semibold text-gray-500 font-mono tracking-wider uppercase">
            Loading SponsorHub CRM...
          </span>
        </div>
      </div>
    );
  }

  // While redirect is being processed
  if (!user && location !== "/login") {
    return null;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Home} />
      <Route path="/sponsor-pipeline" component={SponsorPipeline} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/activity-log" component={ActivityLog} />
      <Route path="/offers" component={Offers} />
      <Route path="/team" component={Team} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" richColors />
          <AuthenticatedRouter />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
