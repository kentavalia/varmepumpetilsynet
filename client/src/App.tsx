import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CustomerSimple from "@/pages/customer-simple";
import AuthPage from "@/pages/auth-page";
import SearchInstallers from "@/pages/search-installers";
import Admin from "@/pages/admin";
import InstallerDashboard from "@/pages/installer-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/customer" component={CustomerSimple} />
      <Route path="/search" component={SearchInstallers} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/installer" component={InstallerDashboard} />

      <Route path="/admin" component={Admin} />
      <Route path="/admin/:tab" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
