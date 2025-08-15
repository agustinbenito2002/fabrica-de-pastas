import React from "react";

export function TopBar() {
  return (
    <div style={{
      width: "100%",
      height: 64,
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      boxShadow: "0 2px 8px #f0f1f2",
      position: "relative",
      zIndex: 1,
      padding: "0 32px"
    }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src="/welcome/logo-dark.svg" alt="Logo" style={{ height: 40, marginRight: 12 }} />
        <span style={{ fontWeight: "bold", fontSize: 20, color: "#333" }}>
          Fabrica de Pastas 2025
        </span>
      </div>
    </div>
  );
}
