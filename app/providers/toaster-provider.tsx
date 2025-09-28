"use client";

import { useTheme } from "next-themes";
import { createContext, type ReactNode } from "react";
import { Toaster } from "sonner";

const ToasterContext = createContext({});

const ToasterProvider = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme()
  return (
    <ToasterContext value={""}>
      {children}
      <Toaster
        closeButton={true}
        duration={6000}
        position={"top-center"}
        theme={theme}
      />
    </ToasterContext>
  );
};

export default ToasterProvider;
