import React from "react";

interface PlanCardProps {
  planName: string;
  description: string;
  isActive: boolean;
  className?: string;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  planName,
  description,
  isActive,
  className = "",
}) => {
  return (
    <div
      className={`w-full p-3 rounded-md flex items-center justify-between bg-green-500/10 ${className}`}
    >
      <div className="flex flex-col gap-0.5 flex-1">
        <div className="text-[13px] font-semibold text-green-600">
          {planName}
        </div>
        <div className="text-[11px] text-muted-foreground">{description}</div>
      </div>
      {isActive && (
        <div className="px-2 py-1 bg-green-600 rounded-full ml-3 flex-shrink-0">
          <div className="text-[10px] font-semibold text-white">Active</div>
        </div>
      )}
    </div>
  );
};
