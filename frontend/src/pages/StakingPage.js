import React from "react";
import Banner from "../components/Banner";
import StakingSheet from "../components/StakingSheet";

function StakingPage() {
  return (
    <div style={{ backgroundColor: "#bba0a0", minHeight: "100vh" }}>
      <Banner />
      <StakingSheet />
    </div>
  );
}

export default StakingPage;
