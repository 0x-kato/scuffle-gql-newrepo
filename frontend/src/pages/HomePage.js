import React from "react";
import LoginSheet from "../components/LoginSheet";
import LogBanner from "../components/LogBanner";

function HomePage() {
  return (
    <div style={{ backgroundColor: "#bba0a0", minHeight: "100vh" }}>
      <LogBanner />
      <LoginSheet />
    </div>
  );
}

export default HomePage;
