"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { z } from "zod";
// shadcn/ui
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types
type Mode = "light" | "dark" | "mixed";

// Utils
const USERS = [
  { id: 1, name: "Ada Lovelace", email: "ada@predicto.ai", role: "Admin" },
  { id: 2, name: "Alan Turing", email: "alan@predicto.ai", role: "Editor" },
  { id: 3, name: "Grace Hopper", email: "grace@predicto.ai", role: "Viewer" },
];

const LIPSUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae ligula et elit luctus gravida. Vestibulum non augue id tellus fermentum tempor. ".repeat(
    2
  );

const CHART = [
  { name: "Mon", value: 24 },
  { name: "Tue", value: 18 },
  { name: "Wed", value: 32 },
  { name: "Thu", value: 27 },
  { name: "Fri", value: 42 },
  { name: "Sat", value: 38 },
  { name: "Sun", value: 45 },
];

const Schema = z.object({ project: z.string().min(1, "Project is required") });
type FormValues = z.infer<typeof Schema>;

function useRootTheme(mode: Mode) {
  useEffect(() => {
    const root = document.documentElement;
    if (mode === "mixed") {
      return root.classList.add('light')
    }
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("light");
    }
  }, [mode]);
}

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden" id={id}>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
            {description ? <CardDescription className="mt-1 text-xs sm:text-sm">{description}</CardDescription> : null}
          </div>
          <a className="text-muted-foreground text-xs hover:underline" href={`#${id}`}>
            #
          </a>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">{children}</CardContent>
    </Card>
  );
}

function MixedPreview({ children }: { children: React.ReactNode }) {
  // Left: light, Right: dark (scoped)
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <div className="mb-2 font-medium text-muted-foreground text-xs">Light</div>
        <div className="rounded-xl border p-4">{children}</div>
      </div>
      <div>
        <div className="mb-2 font-medium text-muted-foreground text-xs">Dark</div>
        <div className="dark rounded-xl border p-4">
          {/* scoped dark theme */}
          <div className="dark">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function ShowcasePage() {
  const [mode, setMode] = useState<Mode>("light");
  useRootTheme(mode);

  // demo state
  const [checked, setChecked] = useState(true);
  const [switchOn, setSwitchOn] = useState(true);
  const [progress, setProgress] = useState(42);
  const [otp, setOtp] = useState("123456");
  const [selectedRole, setSelectedRole] = useState("editor");

  // rotating alerts/dialogs
  const [showAlert, setShowAlert] = useState(true);
  const [alertVariantDestructive, setAlertVariantDestructive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // interval refs to ensure cleanup
  const progressTimer = useRef<number | null>(null);
  const alertTimer = useRef<number | null>(null);
  const dialogTimer = useRef<number | null>(null);

  // useEffect(() => {
  //   progressTimer.current = window.setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 5)), 900);
  //   return () => {
  //     if (progressTimer.current) {
  //       window.clearInterval(progressTimer.current);
  //     }
  //   };
  // }, []);

  // useEffect(() => {
  //   alertTimer.current = window.setInterval(() => {
  //     setAlertVariantDestructive((v) => !v);
  //     setShowAlert(true);
  //     const hide = window.setTimeout(() => setShowAlert(false), 2400);
  //     return () => window.clearTimeout(hide);
  //   }, 5200) as unknown as number;
  //   return () => {
  //     if (alertTimer.current) {
  //       window.clearInterval(alertTimer.current);
  //     }
  //   };
  // }, []);

  // useEffect(() => {
  //   dialogTimer.current = window.setInterval(() => {
  //     setDialogOpen(true);
  //     const close = window.setTimeout(() => setDialogOpen(false), 2200);
  //     return () => window.clearTimeout(close);
  //   }, 9000) as unknown as number;
  //   return () => {
  //     if (dialogTimer.current) {
  //       window.clearInterval(dialogTimer.current);
  //     }
  //   };
  // }, []);

  const chartConfig = useMemo(() => ({ value: { label: "Requests" } }), []);

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { project: "predicto-app" },
  });
  const onSubmit = (values: FormValues) => {
    // eslint-disable-next-line no-console
    console.log(values);
  };

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div>
        <h2>Logo</h2>
        <Image className="object-contain" height={100} src={"/logo/logo.png"} width={100} />
      </div>
      {/* Top bar */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="#">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="#">UI</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Catalog</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-3">
          <Label className="text-sm" htmlFor="mode">
            Preview
          </Label>
          <Select onValueChange={(v) => setMode(v as Mode)} value={mode}>
            <SelectTrigger className="w-[160px]" id="mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                <NavigationMenuContent className="p-4">
                  <div className="grid w-[360px] gap-2 sm:w-[420px] sm:grid-cols-2">
                    {[
                      ["Buttons", "#buttons"],
                      ["Inputs", "#inputs"],
                      ["Feedback", "#feedback"],
                      ["Overlays", "#overlays"],
                      ["Navigation", "#navigation"],
                      ["Layout", "#layout"],
                      ["Data Display", "#data"],
                      ["Forms", "#forms"],
                      ["Charts", "#charts"],
                    ].map(([label, href]) => (
                      <NavigationMenuLink className="rounded-md p-2 hover:bg-muted" href={href as string} key={label}>
                        {label}
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>

      {children}
    </div>
  );

  const Catalog = (
    <div className="grid gap-6">
      {/* Feedback */}
      <Section description="Alerts, progress, skeletons, tooltips; auto-rotating demo." id="feedback" title="Feedback">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {showAlert && (
              <Alert variant={alertVariantDestructive ? "destructive" : "default"}>
                <AlertTitle>{alertVariantDestructive ? "Destructive" : "Information"}</AlertTitle>
                <AlertDescription>{alertVariantDestructive ? "This is a destructive alert." : "This is a default alert."}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <Alert>
                <AlertTitle>Default</AlertTitle>
                <AlertDescription>Static default alert.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTitle>Destructive</AlertTitle>
                <AlertDescription>Static destructive alert.</AlertDescription>
              </Alert>
            </div>

            <div className="space-y-2">
              <Label>Progress</Label>
              <Progress value={progress} />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-24" />
            </div>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>Helpful hint</TooltipContent>
              </Tooltip>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button className="px-0" variant="link">
                    Hover
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-72">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Predicto Workspace</h4>
                    <p className="text-muted-foreground text-sm">Real-time analytics and automation.</p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Alert Dialog (auto-open)</CardTitle>
                <CardDescription>Opens briefly on a timer; manual controls below.</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog onOpenChange={setDialogOpen} open={dialogOpen}>
                  <div className="flex gap-2">
                    <Button onClick={() => setDialogOpen(true)}>Open now</Button>
                    <Button onClick={() => setDialogOpen(false)} variant="outline">
                      Close
                    </Button>
                  </div>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm action</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sheet</CardTitle>
                <CardDescription>Side panel for settings/context.</CardDescription>
              </CardHeader>
              <CardContent>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="secondary">Open sheet</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Side Panel</SheetTitle>
                      <SheetDescription>Use sheets for context or settings.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 space-y-3">
                      <Label>Quick setting</Label>
                      <Input placeholder="Type here" />
                      <Button>Save</Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* Buttons & Inputs */}
      <Section description="Variants, sizes, and badges." id="buttons" title="Buttons & Badges">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Variants</Label>
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Sizes</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button aria-label="Icon only" size="icon">
                ⚙️
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Badges</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>
        </div>
      </Section>

      <Section description="Text, OTP, checkbox, switch, select." id="inputs" title="Inputs">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="m@example.com" type="email" />
            <div className="flex items-center gap-2">
              <Checkbox checked={checked} id="remember" onCheckedChange={(v) => setChecked(Boolean(v))} />
              <Label htmlFor="remember">Remember me</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={switchOn} id="switch" onCheckedChange={(v) => setSwitchOn(Boolean(v))} />
              <Label htmlFor="switch">{switchOn ? "Enabled" : "Disabled"}</Label>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select onValueChange={setSelectedRole} value={selectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label>One-Time Passcode</Label>
            <InputOTP maxLength={6} onChange={setOtp} value={otp}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot index={i} key={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
      </Section>

      {/* Overlays */}
      <Section description="Accordion, Tabs, Sheet shown above; Tooltip & HoverCard in Feedback." id="overlays" title="Overlays">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Accordion</CardTitle>
              <CardDescription>Collapsible sections</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion className="w-full" collapsible type="single">
                <AccordionItem value="a">
                  <AccordionTrigger>Section A</AccordionTrigger>
                  <AccordionContent>{LIPSUM}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="b">
                  <AccordionTrigger>Section B</AccordionTrigger>
                  <AccordionContent>{LIPSUM}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Tabs</CardTitle>
              <CardDescription>Switch content</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="account">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent className="space-y-3 pt-4" value="account">
                  <Label>Name</Label>
                  <Input defaultValue="Yosef" />
                </TabsContent>
                <TabsContent className="space-y-3 pt-4" value="password">
                  <Label>New Password</Label>
                  <Input placeholder="••••••••" type="password" />
                </TabsContent>
                <TabsContent className="space-y-3 pt-4" value="security">
                  <Label>2FA Method</Label>
                  <Select defaultValue="otp">
                    <SelectTrigger>
                      <SelectValue placeholder="Pick one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="otp">OTP</SelectItem>
                      <SelectItem value="key">Security Key</SelectItem>
                    </SelectContent>
                  </Select>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Navigation */}
      <Section description="Breadcrumbs, menu, pagination." id="navigation" title="Navigation">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Breadcrumb</CardTitle>
            </CardHeader>
            <CardContent>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="#">Home</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="#">UI</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Catalog</BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbList>
              </Breadcrumb>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pagination</CardTitle>
            </CardHeader>
            <CardContent>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Layout */}
      <Section description="Resizable panels, scroll areas, separators, cards." id="layout" title="Layout">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Resizable + Scroll Area</CardTitle>
              <CardDescription>Layout primitives</CardDescription>
            </CardHeader>
            <CardContent>
              <ResizablePanelGroup className="min-h-[220px] rounded-lg border" direction="horizontal">
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="h-full p-4">
                    <h4 className="mb-2 font-medium text-sm">Left</h4>
                    <ScrollArea className="h-40 rounded border p-3">
                      <p className="text-sm leading-6">{LIPSUM.repeat(2)}</p>
                    </ScrollArea>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel minSize={20}>
                  <div className="h-full p-4">
                    <h4 className="mb-2 font-medium text-sm">Right</h4>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Input placeholder="Type…" />
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Separators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-sm">Above</div>
                <Separator />
                <div className="text-sm">Between</div>
                <Separator />
                <div className="text-sm">Below</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Data Display */}
      <Section description="Tables and cards." id="data" title="Data Display">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Table</CardTitle>
              <CardDescription>Mock users</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Example dataset</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {USERS.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.id}</TableCell>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="flex items-center gap-2">
                <Badge>Users</Badge>
                <Badge variant="secondary">Active</Badge>
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
        </div>
      </Section>

      {/* Forms */}
      <Section description="react-hook-form + zod." id="forms" title="Forms">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="project"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <FormControl>
                    <Input placeholder="predicto-app" {...field} />
                  </FormControl>
                  <FormDescription>Repository or service name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit">Create</Button>
              <Button onClick={() => form.reset()} type="button" variant="outline">
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </Section>

      {/* Charts & Media */}
      <Section description="Carousel and Recharts line chart inside ChartContainer." id="charts" title="Charts & Media">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Carousel</CardTitle>
              <CardDescription>Slides</CardDescription>
            </CardHeader>
            <CardContent>
              <Carousel className="w-full max-w-md">
                <CarouselContent>
                  {[1, 2, 3].map((i) => (
                    <CarouselItem key={i}>
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex aspect-video items-center justify-center">
                            <span className="font-semibold text-2xl">Slide {i}</span>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Chart</CardTitle>
              <CardDescription>LineChart (Recharts)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-56 w-full" config={chartConfig}>
                <ResponsiveContainer>
                  <LineChart data={CHART} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line dataKey="value" dot={false} strokeWidth={2} type="monotone" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </Section>
    </div>
  );

  return (
    <TooltipProvider delayDuration={150}>
      {mode === "mixed" ? (
        <Shell>
          <MixedPreview>{Catalog}</MixedPreview>
        </Shell>
      ) : (
        <Shell>{Catalog}</Shell>
      )}
    </TooltipProvider>
  );
}
