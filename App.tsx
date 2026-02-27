import React from "react";
import { StatusBar } from "expo-status-bar";
import AppEntry from "./src/app/AppEntry";

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AppEntry />
    </>
  );
}
