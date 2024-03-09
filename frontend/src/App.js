import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import SignUpPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import SendTipPage from "./pages/SendTipPage";
import TipHistoryPage from "./pages/TipHistoryPage";
import StakingPage from "./pages/StakingPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<SignUpPage />} />
        <Route path="/tips" element={<SendTipPage />} />
        <Route path="/tip-history" element={<TipHistoryPage />} />
        <Route path="/staking" element={<StakingPage />} />
      </Routes>
    </Router>
  );
};

export default App;
