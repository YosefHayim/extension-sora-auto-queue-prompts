import React from "react";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <div className={`w-full flex flex-col gap-3 ${className}`.trim()}>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
};

export default SettingsSection;
