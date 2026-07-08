import React from "react";
import { Activity } from "lucide-react";

export const Placeholder: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div style={{ padding: "40px", textAlign: "left", color: "#f8fafc", fontFamily: "Outfit, sans-serif" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 10px 0" }}>{title}</h1>
      <p style={{ color: "#94a3b8", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
        <Activity style={{ color: "#06b6d4", width: "18px", height: "18px" }} />
        Módulo en construcción. Se implementará en los siguientes Sprints.
      </p>
    </div>
  );
};
