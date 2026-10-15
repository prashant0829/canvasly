import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource/caveat/500.css";
import "@fontsource/caveat/700.css";
import "./styles/global.scss";
import App from "./App/App.jsx";

createRoot(document.getElementById("root")).render(<App />);
