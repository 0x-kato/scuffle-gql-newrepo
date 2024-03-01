import React from "react";
import Banner from "../components/Banner";
import TipHistorySheet from "../components/TipHistory";

function TipHistoryPage() {
  return (
    <div style={{ backgroundColor: "#bba0a0", minHeight: "100vh" }}>
      <Banner />
      <TipHistorySheet />
    </div>
  );
}

export default TipHistoryPage;
