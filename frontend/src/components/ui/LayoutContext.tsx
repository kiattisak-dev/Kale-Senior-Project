"use client";

import { createContext, useContext, useState } from "react";

interface LayoutContextType {
  showNavAndFooter: boolean;
  setShowNavAndFooter: (show: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [showNavAndFooter, setShowNavAndFooter] = useState(true);

  return (
    <LayoutContext.Provider value={{ showNavAndFooter, setShowNavAndFooter }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}