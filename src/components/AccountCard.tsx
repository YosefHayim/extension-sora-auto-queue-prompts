import React from "react";

interface AccountCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
  className?: string;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const AccountCard: React.FC<AccountCardProps> = ({
  name,
  email,
  avatarUrl,
  className = "",
}) => {
  const initials = getInitials(name);

  return (
    <div
      className={`flex items-center w-full gap-3 p-3 bg-muted rounded-md ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-primary-foreground">
            {initials}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">
          {name}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">{email}</p>
      </div>
    </div>
  );
};

export default AccountCard;
