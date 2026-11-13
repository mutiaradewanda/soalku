import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./AppRoutes";
import "./index.css";

// Service Worker Registration for PWA Installation & Offline Support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[SoalKu PWA] ServiceWorker aktif dengan scope:", registration.scope);
      })
      .catch((error) => {
        console.warn("[SoalKu PWA] ServiceWorker pendaftaran ditunda:", error);
      });
  });
}

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppRoutes />
    </React.StrictMode>
  );
}
