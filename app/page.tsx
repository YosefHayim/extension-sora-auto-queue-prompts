"use client";

import { BarChart, Database, Layers, PieChart, SquareKanban } from "lucide-react";
import { useState } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarqueeDemo } from "@/custom-components/Testimonials/Testimonials";
import { cn } from "@/lib/utils";

export type Tab = {
  title: string;
  icon: React.ReactNode;
  image: string;
};

export type HomepageProps = {
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText?: string;
  primaryButtonUrl: string;
  secondaryButtonUrl?: string;
  tabs?: Tab[];
};

const defaultTabs: Tab[] = [
  {
    title: "Insights",
    icon: <SquareKanban />,
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/dashboard/admin-dashboard-1.png",
  },
  {
    title: "Metrics",
    icon: <BarChart />,
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/dashboard/admin-dashboard-2.png",
  },
  {
    title: "Trends",
    icon: <PieChart />,
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/dashboard/admin-dashboard-3.png",
  },
  {
    title: "Sources",
    icon: <Database />,
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/dashboard/admin-users.png",
  },
  {
    title: "Models",
    icon: <Layers />,
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/dashboard/admin-developer.png",
  },
];

const Homepage = ({
  title = "Beautiful blocks for Shadcn UI.",
  description = "Shadcnblocks.com offers the best collection of components and blocks for shadcn/ui.",
  primaryButtonText = "Download",
  primaryButtonUrl = "https://shadcnblocks.com",
  secondaryButtonUrl,
  secondaryButtonText,
  tabs = defaultTabs,
}: HomepageProps) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.title || "");

  return (
    <div className="flex items-center justify-center overflow-hidden">
      <div className="container">
        <div className="border-border border-x py-20">
          <div className="relative mx-auto max-w-2xl p-2">
            <h1 className="mx-1 mt-6 text-center font-bold text-5xl tracking-tighter md:text-7xl">{title}</h1>
            <p className="mx-2 mt-6 max-w-xl text-center font-medium text-lg text-muted-foreground md:text-xl">{description}</p>
            <div className="mx-2 mt-6 flex justify-center gap-2">
              <Button asChild>
                <a href={primaryButtonUrl}>{primaryButtonText}</a>
              </Button>
              {secondaryButtonText && (
                <Button asChild variant="outline">
                  <a href={secondaryButtonUrl}>{secondaryButtonText}</a>
                </Button>
              )}
            </div>
          </div>
          <div className="mt-16 md:mt-20">
            <Tabs defaultValue={tabs[0]?.title} onValueChange={setActiveTab}>
              <div className="px-2">
                <TabsList className="mx-auto mb-6 flex h-auto w-fit max-w-xs flex-wrap justify-center gap-2 md:max-w-none">
                  {tabs.map((tab) => (
                    <TabsTrigger className="font-normal text-muted-foreground" key={tab.title} value={tab.title}>
                      {tab.icon}
                      {tab.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <div className="relative isolate">
                <div className="relative z-10">
                  {tabs.map((tab) => (
                    <TabsContent
                      className={cn("-mx-px bg-background transition-opacity duration-500", {
                        "fade-in animate-in opacity-100": activeTab === tab.title,
                        "opacity-0": activeTab !== tab.title,
                      })}
                      key={tab.title}
                      value={tab.title}
                    >
                      <img
                        alt={tab.title}
                        className="aspect-[16/10] w-full border border-border object-top shadow-[0_6px_20px_rgb(0,0,0,0.12)]"
                        src={tab.image}
                      />
                    </TabsContent>
                  ))}
                </div>
                <span className="-inset-x-1/5 -z-10 absolute top-0 h-px bg-border [mask-image:linear-gradient(to_right,transparent_1%,black_10%,black_90%,transparent_99%)]" />
                <span className="-inset-x-1/5 -z-10 absolute bottom-0 h-px bg-border [mask-image:linear-gradient(to_right,transparent_1%,black_10%,black_90%,transparent_99%)]" />

                <span className="-inset-x-1/5 absolute top-12 h-px border-border border-t border-dashed [mask-image:linear-gradient(to_right,transparent_1%,black_10%,black_90%,transparent_99%)]" />
                <span className="-inset-x-1/5 absolute bottom-12 h-px border-border border-t border-dashed [mask-image:linear-gradient(to_right,transparent_1%,black_10%,black_90%,transparent_99%)]" />

                <span className="-inset-y-1/5 absolute left-1/6 w-px border-border border-r border-dashed [mask-image:linear-gradient(to_bottom,transparent_1%,black_10%,black_90%,transparent_99%)]" />
                <span className="-inset-y-1/5 absolute right-1/6 w-px border-border border-r border-dashed [mask-image:linear-gradient(to_bottom,transparent_1%,black_10%,black_90%,transparent_99%)]" />
              </div>
            </Tabs>
          </div>
        </div>
        <MarqueeDemo />
      </div>
    </div>
  );
};

export default Homepage;
