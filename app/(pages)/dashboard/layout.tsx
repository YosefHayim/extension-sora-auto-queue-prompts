import type { ReactNode } from "react";
import { SidebarProviderWrapper } from "@/app/providers/sidebar-wrapper";
import { SiteHeader } from "@/components/site-header";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <SidebarProviderWrapper>
        <SiteHeader />
        {children}
      </SidebarProviderWrapper>
    </div>
  );
};

export default DashboardLayout;
