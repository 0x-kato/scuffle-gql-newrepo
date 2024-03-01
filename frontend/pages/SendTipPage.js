import React from "react";
import Banner from "../components/Banner";
import TipSheet from "../components/TipSheet";

function SendTipPage() {
  return (
    <div style={{ backgroundColor: "#bba0a0", minHeight: "100vh" }}>
      <div>
        <Banner />
        <TipSheet />
      </div>
    </div>
  );
}

export default SendTipPage;
