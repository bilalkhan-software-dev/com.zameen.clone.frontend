"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export const areaUnits = [
  { value: "SQUARE_FEET", label: "Sq. Ft.", factor: 1 },
  { value: "SQUARE_YARDS", label: "Sq. Yd.", factor: 9 },
  { value: "SQUARE_METERS", label: "Sq. M.", factor: 10.764 },
  { value: "MARLA", label: "Marla", factor: 272.25 },
  { value: "KANAL", label: "Kanal", factor: 5445 },
];

interface SettingsContextType {
  currency: "PKR" | "USD";
  areaUnit: (typeof areaUnits)[number];
  setCurrency: (c: "PKR" | "USD") => void;
  setAreaUnit: (unit: (typeof areaUnits)[number]) => void;
  formatPrice: (price: number) => string;
  formatArea: (sqFt: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<"PKR" | "USD">("PKR");
  const [areaUnit, setAreaUnitState] = useState(areaUnits[0]); // default Sq. Ft.

  // Load from localStorage on mount
  useEffect(() => {
    const storedCurrency = localStorage.getItem("currency");
    if (storedCurrency === "USD" || storedCurrency === "PKR") {
      setCurrencyState(storedCurrency);
    }
    const storedAreaUnit = localStorage.getItem("areaUnit");
    if (storedAreaUnit) {
      const found = areaUnits.find((u) => u.value === storedAreaUnit);
      if (found) setAreaUnitState(found);
    }
  }, []);

  const setCurrency = (c: "PKR" | "USD") => {
    localStorage.setItem("currency", c);
    setCurrencyState(c);
  };

  const setAreaUnit = (unit: (typeof areaUnits)[number]) => {
    localStorage.setItem("areaUnit", unit.value);
    setAreaUnitState(unit);
  };

  const formatPrice = (price: number) => {
    const converted = currency === "USD" ? price * 0.0036 : price; // approximate conversion
    const symbol = currency === "USD" ? "$" : "PKR";
    if (converted >= 10_000_000) return `${symbol} ${(converted / 10_000_000).toFixed(2)}Cr`;
    if (converted >= 100_000) return `${symbol} ${(converted / 100_000).toFixed(1)}L`;
    return `${symbol} ${converted.toLocaleString()}`;
  };

  const formatArea = (sqFt: number) => {
    const converted = sqFt / areaUnit.factor;
    // Round to 2 decimals for small units, otherwise 1 decimal
    const decimals = areaUnit.factor > 10 ? 2 : 1;
    return `${converted.toFixed(decimals)} ${areaUnit.label}`;
  };

  return (
    <SettingsContext.Provider value={{ currency, areaUnit, setCurrency, setAreaUnit, formatPrice, formatArea }}>
      {children}
    </SettingsContext.Provider>
  );
}