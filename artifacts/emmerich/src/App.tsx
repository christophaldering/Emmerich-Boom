import { Switch, Route } from "wouter";
import LandingPage from "@/pages/LandingPage";
import BoomerPartyPage from "@/pages/BoomerPartyPage";

function App() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/boomer-party" component={BoomerPartyPage} />
    </Switch>
  );
}

export default App;
