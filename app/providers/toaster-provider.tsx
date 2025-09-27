"use client";

import { createContext, type ReactNode } from "react";
import { Toaster } from "sonner";
import { useTheme } from "./theme-provider";

const ToasterContext = createContext({});

const ToasterProvider = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();
  return (
    <ToasterContext value={''}>
      {children}
      <Toaster closeButton={true} duration={3000} position={"top-center"} theme={theme} />
    </ToasterContext>
  );
};

export default ToasterProvider;
