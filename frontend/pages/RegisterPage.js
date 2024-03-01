import React from "react";
import RegisterSheet from "../components/RegisterSheet";
import LogBanner from "../components/LogBanner";

function RegisterPage() {
  return (
    <div style={{ backgroundColor: "#bba0a0", minHeight: "100vh" }}>
      <LogBanner />
      <RegisterSheet />
    </div>
  );
}

export default RegisterPage;
