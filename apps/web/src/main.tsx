import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { Dev } from "./Dev.tsx";
import { Statystyki } from "./screens/Statystyki.tsx";
import "@fontsource-variable/geist-mono";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* /statystyki: ukryty raport gier, bez linku z aplikacji. */}
    {import.meta.env.DEV && location.pathname === "/dev" ? <Dev /> : location.pathname === "/statystyki" ? <Statystyki /> : <App />}
  </StrictMode>,
);
