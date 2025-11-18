# Shadcn UI Component Library Reference

## Complete Component Catalog for Sora Auto Queue Extension

This document provides a comprehensive reference for all Shadcn UI components used in the redesigned extension, including usage examples, props, and customization options.

---

## Table of Contents

1. [Installation Commands](#installation-commands)
2. [Core Components](#core-components)
3. [Form Components](#form-components)
4. [Layout Components](#layout-components)
5. [Feedback Components](#feedback-components)
6. [Navigation Components](#navigation-components)
7. [Custom Compositions](#custom-compositions)
8. [Tailwind Utility Classes](#tailwind-utility-classes)
9. [Design Tokens](#design-tokens)

---

## Installation Commands

### Install All Components at Once

```bash
# Core UI components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add label
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add command
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add tooltip
```

---

## Core Components

### 1. Button

**File**: `src/components/ui/button.tsx`

**Purpose**: Primary, secondary, and action buttons throughout the UI

**Variants**:
- `default`: Primary action buttons (blue)
- `destructive`: Dangerous actions (red)
- `outline`: Secondary actions (border only)
- `secondary`: Tertiary actions (gray)
- `ghost`: Minimal buttons (transparent)
- `link`: Text-only buttons

**Sizes**:
- `default`: Standard size (h-10 px-4)
- `sm`: Small (h-9 px-3)
- `lg`: Large (h-11 px-8)
- `icon`: Square icon button (h-10 w-10)

**Usage Example**:

```tsx
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

// Primary button
<Button onClick={handleGenerate}>
  <Sparkles className="mr-2 h-4 w-4" />
  Generate Prompts
</Button>

// Destructive button
<Button variant="destructive" onClick={handleDelete}>
  Delete All
</Button>

// Icon button
<Button variant="ghost" size="icon">
  <Settings className="h-4 w-4" />
</Button>

// Outline button
<Button variant="outline" onClick={handleCancel}>
  Cancel
</Button>
```

**Props**:
```ts
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}
```

**Use Cases in Extension**:
- "+ Generate" primary action
- "Start Queue", "Pause", "Stop" controls
- Prompt card actions (Edit, Duplicate, Delete)
- Modal actions (Save, Cancel)
- Settings save button

---

### 2. Card

**File**: `src/components/ui/card.tsx`

**Purpose**: Container for grouped content (prompt cards, queue controls)

**Components**:
- `Card`: Root container
- `CardHeader`: Top section (metadata, badges)
- `CardTitle`: Title text
- `CardDescription`: Subtitle text
- `CardContent`: Main content area
- `CardFooter`: Bottom section (actions)

**Usage Example**:

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

<Card className="hover:shadow-md transition-shadow">
  <CardHeader>
    <div className="flex justify-between">
      <CardTitle>Prompt Title</CardTitle>
      <Badge>pending</Badge>
    </div>
    <CardDescription>Media: Video | Aspect: 16:9</CardDescription>
  </CardHeader>

  <CardContent>
    <p className="text-sm">A cinematic shot of underwater coral reef...</p>
  </CardContent>

  <CardFooter className="gap-2">
    <Button size="sm">Edit</Button>
    <Button size="sm" variant="outline">Duplicate</Button>
  </CardFooter>
</Card>
```

**Use Cases**:
- Prompt cards (main queue list)
- Queue controls card
- Empty state card
- Settings sections
- Onboarding cards

---

### 3. Badge

**File**: `src/components/ui/badge.tsx`

**Purpose**: Status indicators, metadata labels, counts

**Variants**:
- `default`: Primary badges (blue)
- `secondary`: Neutral badges (gray)
- `destructive`: Error/warning badges (red)
- `outline`: Bordered badges (transparent)

**Usage Example**:

```tsx
import { Badge } from '@/components/ui/badge';

// Status badges
<Badge className="bg-yellow-100 text-yellow-800">pending</Badge>
<Badge className="bg-blue-100 text-blue-800">processing</Badge>
<Badge className="bg-green-100 text-green-800">completed</Badge>

// Metadata badges
<Badge variant="outline">Video</Badge>
<Badge variant="secondary">16:9</Badge>

// Enhanced badge
<Badge variant="default" className="gap-1">
  <Sparkles className="h-3 w-3" />
  Enhanced
</Badge>

// Count badge
<Badge variant="outline" className="bg-yellow-50">
  <Clock className="h-3 w-3 mr-1" />
  23 Pending
</Badge>
```

**Custom Colors** (add to Badge component):
```tsx
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
};

<Badge className={statusColors[status]}>{status}</Badge>
```

**Use Cases**:
- Prompt status (pending, processing, completed)
- Media type labels (video, image)
- Aspect ratio indicators
- Preset labels (cinematic, artistic)
- Enhanced prompt indicators
- Status bar counts

---

## Form Components

### 4. Input

**File**: `src/components/ui/input.tsx`

**Purpose**: Text inputs (API key, custom batch size, search)

**Usage Example**:

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="apiKey">OpenAI API Key</Label>
  <Input
    id="apiKey"
    type="password"
    placeholder="sk-..."
    value={apiKey}
    onChange={(e) => setApiKey(e.target.value)}
  />
</div>
```

**Props**:
```ts
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
```

**Use Cases**:
- OpenAI API key input
- Custom batch size input
- Search field in command palette
- Delay settings (as number input)

---

### 5. Textarea

**File**: `src/components/ui/textarea.tsx`

**Purpose**: Multi-line text inputs (context prompt, prompt editing)

**Usage Example**:

```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea
  placeholder="Describe what you want to create..."
  value={context}
  onChange={(e) => setContext(e.target.value)}
  rows={4}
  maxLength={500}
/>
<span className="text-xs text-muted-foreground">
  {context.length}/500 characters
</span>
```

**Props**:
```ts
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
```

**Use Cases**:
- Context prompt input (Generate modal)
- Manual prompt entry
- Inline prompt editing
- CSV preview text

---

### 6. Label

**File**: `src/components/ui/label.tsx`

**Purpose**: Accessible form field labels

**Usage Example**:

```tsx
import { Label } from '@/components/ui/label';

<Label htmlFor="batchSize">Batch Size</Label>
<Input id="batchSize" type="number" />
```

**Use Cases**:
- All form field labels
- Checkbox/switch labels
- Settings labels

---

### 7. Select

**File**: `src/components/ui/select.tsx`

**Purpose**: Dropdown selection (batch size, media type, aspect ratio)

**Usage Example**:

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select value={batchSize} onValueChange={setBatchSize}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select batch size" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="10">10 prompts</SelectItem>
    <SelectItem value="25">25 prompts</SelectItem>
    <SelectItem value="50">50 prompts</SelectItem>
    <SelectItem value="100">100 prompts</SelectItem>
    <SelectItem value="custom">Custom...</SelectItem>
  </SelectContent>
</Select>
```

**Use Cases**:
- Batch size selection
- Media type dropdown
- Aspect ratio selection
- Preset selection
- Variation count selection

---

### 8. Switch

**File**: `src/components/ui/switch.tsx`

**Purpose**: Toggle controls (enhanced prompts, auto-generate, dark mode)

**Usage Example**:

```tsx
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

<div className="flex items-center space-x-2">
  <Switch
    id="enhanced"
    checked={enhanced}
    onCheckedChange={setEnhanced}
  />
  <Label htmlFor="enhanced">
    Enhanced Prompts
    <span className="block text-xs text-muted-foreground">
      Add technical cinematography details
    </span>
  </Label>
</div>
```

**Props**:
```ts
interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}
```

**Use Cases**:
- Enhanced prompts toggle
- Auto-generate on empty toggle
- Auto-generate on received toggle
- Dark mode toggle
- Settings toggles

---

### 9. Slider

**File**: `src/components/ui/slider.tsx`

**Purpose**: Range inputs (delay settings)

**Usage Example**:

```tsx
import { Slider } from '@/components/ui/slider';

<div className="space-y-4">
  <Label>Anti-Bot Delay Range</Label>
  <Slider
    value={[minDelay, maxDelay]}
    onValueChange={([min, max]) => {
      setMinDelay(min);
      setMaxDelay(max);
    }}
    min={1000}
    max={60000}
    step={500}
    className="w-full"
  />
  <div className="flex justify-between text-xs text-muted-foreground">
    <span>Min: {minDelay / 1000}s</span>
    <span>Max: {maxDelay / 1000}s</span>
  </div>
</div>
```

**Use Cases**:
- Min/Max delay settings
- Batch size slider (alternative to select)

---

## Layout Components

### 10. Dialog (Modal)

**File**: `src/components/ui/dialog.tsx`

**Purpose**: Modal overlays (generate, settings, CSV import)

**Components**:
- `Dialog`: Root component
- `DialogTrigger`: Button to open modal
- `DialogContent`: Modal container
- `DialogHeader`: Top section
- `DialogTitle`: Modal title
- `DialogDescription`: Modal description
- `DialogFooter`: Bottom actions

**Usage Example**:

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Generate AI Prompts</DialogTitle>
      <DialogDescription>
        Describe what you want to create. AI will generate creative prompts.
      </DialogDescription>
    </DialogHeader>

    {/* Form content here */}

    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleGenerate}>Generate</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Use Cases**:
- Generate prompts modal
- Settings modal
- CSV import modal
- Confirmation dialogs (delete, clear)
- Onboarding wizard

---

### 11. Tabs

**File**: `src/components/ui/tabs.tsx`

**Purpose**: Tabbed sections within modals (settings sections)

**Usage Example**:

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="general">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="api">API</TabsTrigger>
    <TabsTrigger value="queue">Queue</TabsTrigger>
    <TabsTrigger value="advanced">Advanced</TabsTrigger>
  </TabsList>

  <TabsContent value="general">
    {/* General settings form */}
  </TabsContent>

  <TabsContent value="api">
    {/* API settings form */}
  </TabsContent>

  <TabsContent value="queue">
    {/* Queue settings form */}
  </TabsContent>

  <TabsContent value="advanced">
    {/* Advanced settings + danger zone */}
  </TabsContent>
</Tabs>
```

**Use Cases**:
- Settings modal sections
- Future: Multiple import methods (CSV, JSON, API)

---

### 12. Accordion

**File**: `src/components/ui/accordion.tsx`

**Purpose**: Collapsible sections (completed prompts)

**Usage Example**:

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

<Accordion type="single" collapsible>
  <AccordionItem value="completed">
    <AccordionTrigger>
      Completed Prompts ({completedCount})
    </AccordionTrigger>
    <AccordionContent>
      {completedPrompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

**Use Cases**:
- Collapsible completed prompts section
- Advanced settings sections
- FAQ/Help sections

---

### 13. Separator

**File**: `src/components/ui/separator.tsx`

**Purpose**: Visual dividers between sections

**Usage Example**:

```tsx
import { Separator } from '@/components/ui/separator';

<div>
  <h3>General Settings</h3>
  <form>{/* Settings fields */}</form>

  <Separator className="my-6" />

  <h3>Queue Settings</h3>
  <form>{/* Queue settings */}</form>
</div>
```

**Use Cases**:
- Settings section dividers
- Dropdown menu separators
- Content section dividers

---

### 14. ScrollArea

**File**: `src/components/ui/scroll-area.tsx`

**Purpose**: Styled scrollable containers (prompt list, logs)

**Usage Example**:

```tsx
import { ScrollArea } from '@/components/ui/scroll-area';

<ScrollArea className="h-[500px] w-full">
  {prompts.map((prompt) => (
    <PromptCard key={prompt.id} prompt={prompt} />
  ))}
</ScrollArea>
```

**Use Cases**:
- Prompt list scrolling
- Debug log viewer
- Modal content scrolling

---

## Feedback Components

### 15. Toast

**File**: `src/components/ui/toast.tsx`

**Purpose**: Temporary notifications (success, error, info)

**Usage Example**:

```tsx
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

function MyComponent() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Prompts generated!",
      description: "25 new prompts added to your queue.",
      duration: 3000,
    });
  };

  const handleError = () => {
    toast({
      title: "Error",
      description: "Failed to generate prompts. Check your API key.",
      variant: "destructive",
      duration: 5000,
    });
  };

  return (
    <>
      <Button onClick={handleSuccess}>Show Success</Button>
      <Toaster />
    </>
  );
}
```

**Props**:
```ts
interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
  action?: React.ReactNode;
}
```

**Use Cases**:
- Success messages (prompts generated, imported, deleted)
- Error messages (API failures, network errors)
- Warning messages (rate limits, validation errors)
- Info messages (queue started, paused)

---

### 16. Progress

**File**: `src/components/ui/progress.tsx`

**Purpose**: Progress bars (generation progress, queue progress)

**Usage Example**:

```tsx
import { Progress } from '@/components/ui/progress';

<Progress value={progress} className="w-full" />
<p className="text-sm text-center text-muted-foreground">
  Generating {generatedCount}/{batchSize} prompts...
</p>
```

**Use Cases**:
- Generation progress (modal)
- Queue processing progress (controls card)
- CSV import progress

---

### 17. Skeleton

**File**: `src/components/ui/skeleton.tsx`

**Purpose**: Loading placeholders

**Usage Example**:

```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Loading state for prompt cards
<div className="space-y-3">
  {[...Array(5)].map((_, i) => (
    <Card key={i}>
      <CardHeader>
        <Skeleton className="h-4 w-[250px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  ))}
</div>
```

**Use Cases**:
- Loading state for prompt list
- Loading state for generation
- Loading state for settings

---

## Navigation Components

### 18. DropdownMenu

**File**: `src/components/ui/dropdown-menu.tsx`

**Purpose**: Context menus (prompt actions, settings menu)

**Usage Example**:

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuItem onClick={() => onEdit(prompt.id)}>
      <Pencil className="h-4 w-4 mr-2" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => onDuplicate(prompt.id)}>
      <Copy className="h-4 w-4 mr-2" />
      Duplicate
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={() => onDelete(prompt.id)} className="text-destructive">
      <Trash2 className="h-4 w-4 mr-2" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Use Cases**:
- Prompt card more actions menu
- Settings dropdown (gear icon)
- Export options (CSV, JSON)

---

### 19. Command

**File**: `src/components/ui/command.tsx`

**Purpose**: Command palette (Cmd+K quick actions)

**Usage Example**:

```tsx
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => {
            handleGenerate();
            setOpen(false);
          }}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Prompts
          </CommandItem>

          <CommandItem onSelect={() => {
            handleImport();
            setOpen(false);
          }}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </CommandItem>

          <CommandItem onSelect={() => {
            handleExport();
            setOpen(false);
          }}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Queue">
          <CommandItem onSelect={() => handleStart()}>
            <Play className="mr-2 h-4 w-4" />
            Start Queue
          </CommandItem>

          <CommandItem onSelect={() => handlePause()}>
            <Pause className="mr-2 h-4 w-4" />
            Pause Queue
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
```

**Use Cases**:
- Quick actions (Cmd+K)
- Power user shortcuts
- Search through prompts

---

### 20. Tooltip

**File**: `src/components/ui/tooltip.tsx`

**Purpose**: Hover hints for icon buttons

**Usage Example**:

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <Settings className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Open Settings</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**Use Cases**:
- Icon button labels
- Feature explanations
- Keyboard shortcuts hints

---

## Custom Compositions

### 21. PromptCard (Custom)

Combines: Card + Badge + Button + DropdownMenu

See [IMPLEMENTATION-QUICKSTART.md](./IMPLEMENTATION-QUICKSTART.md) for full code.

---

### 22. QueueControls (Custom)

Combines: Card + Badge + Button + Progress

See [IMPLEMENTATION-QUICKSTART.md](./IMPLEMENTATION-QUICKSTART.md) for full code.

---

### 23. StatusBar (Custom)

Combines: Badge + Icons (Lucide)

See [IMPLEMENTATION-QUICKSTART.md](./IMPLEMENTATION-QUICKSTART.md) for full code.

---

### 24. EmptyState (Custom)

Combines: Card + Button + Icons

See [IMPLEMENTATION-QUICKSTART.md](./IMPLEMENTATION-QUICKSTART.md) for full code.

---

## Tailwind Utility Classes

### Common Utility Patterns

**Spacing**:
```tsx
<div className="space-y-4">        // Vertical spacing (4 * 4px = 16px)
<div className="gap-2">            // Gap between flex/grid items (2 * 4px = 8px)
<div className="p-4">              // Padding all sides (16px)
<div className="py-2 px-4">        // Padding vertical 8px, horizontal 16px
```

**Typography**:
```tsx
<h1 className="text-xl font-semibold">     // 20px, 600 weight
<p className="text-sm text-muted-foreground"> // 14px, gray color
<span className="text-xs">                 // 12px
```

**Layout**:
```tsx
<div className="flex items-center justify-between"> // Flexbox with space-between
<div className="grid grid-cols-3 gap-4">           // 3-column grid
<div className="w-full max-w-[600px]">             // Full width with max
```

**Colors**:
```tsx
<div className="bg-background">              // HSL background color
<div className="text-foreground">            // HSL text color
<div className="border-border">              // HSL border color
<Button className="bg-primary text-primary-foreground"> // Primary theme colors
```

**States**:
```tsx
<button className="hover:bg-accent">         // Hover state
<input className="focus:ring-2">             // Focus ring
<div className="transition-all duration-200"> // Smooth transition
<div className="opacity-70">                 // 70% opacity
```

**Responsive**:
```tsx
<div className="sm:max-w-[600px]">           // Max width on small screens
<div className="md:grid-cols-2">             // 2 columns on medium screens
```

---

## Design Tokens

### Color System (HSL)

**Light Mode**:
```css
:root {
  --background: 0 0% 100%;           /* White */
  --foreground: 222.2 84% 4.9%;      /* Almost black */
  --primary: 221.2 83.2% 53.3%;      /* Blue */
  --secondary: 210 40% 96.1%;        /* Light gray */
  --muted: 210 40% 96.1%;            /* Muted gray */
  --accent: 210 40% 96.1%;           /* Accent gray */
  --destructive: 0 84.2% 60.2%;      /* Red */
  --border: 214.3 31.8% 91.4%;       /* Border gray */
}
```

**Dark Mode**:
```css
.dark {
  --background: 222.2 84% 4.9%;      /* Dark blue-gray */
  --foreground: 210 40% 98%;         /* Almost white */
  --primary: 217.2 91.2% 59.8%;      /* Lighter blue */
  --secondary: 217.2 32.6% 17.5%;    /* Dark gray */
  --muted: 217.2 32.6% 17.5%;        /* Muted dark gray */
  --accent: 217.2 32.6% 17.5%;       /* Accent dark gray */
  --destructive: 0 62.8% 30.6%;      /* Dark red */
  --border: 217.2 32.6% 17.5%;       /* Border dark gray */
}
```

### Typography Scale

```css
text-xs:    12px / 1rem
text-sm:    14px / 1.25rem
text-base:  16px / 1.5rem
text-lg:    18px / 1.75rem
text-xl:    20px / 1.75rem
text-2xl:   24px / 2rem
```

### Font Weights

```css
font-normal:    400
font-medium:    500
font-semibold:  600
font-bold:      700
```

### Border Radius

```css
rounded-sm:  calc(var(--radius) - 4px)  /* 4px */
rounded-md:  calc(var(--radius) - 2px)  /* 6px */
rounded-lg:  var(--radius)               /* 8px */
rounded-full: 9999px
```

### Shadows

```css
shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow:     0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
```

---

## Lucide Icons Reference

**Commonly Used Icons**:

```tsx
import {
  Sparkles,      // AI/Enhanced prompts
  Play,          // Start queue
  Pause,         // Pause queue
  Square,        // Stop queue
  Clock,         // Pending status
  Check,         // Completed status
  Pencil,        // Edit action
  Copy,          // Duplicate action
  Trash2,        // Delete action
  MoreVertical,  // More actions menu
  Settings,      // Settings
  Upload,        // Import CSV
  Download,      // Export CSV
  Inbox,         // Empty state
  Search,        // Search/command palette
  X,             // Close modal
  ChevronDown,   // Dropdown indicator
  ChevronRight,  // Expand indicator
} from 'lucide-react';
```

**Icon Size Convention**:
- `h-3 w-3`: Small icons (12px) - badges, inline text
- `h-4 w-4`: Default icons (16px) - buttons, cards
- `h-5 w-5`: Medium icons (20px) - headers
- `h-6 w-6`: Large icons (24px) - empty states

---

## Animation Classes

**Transitions**:
```tsx
<div className="transition-all duration-200">  // All properties, 200ms
<div className="transition-opacity">           // Opacity only
<div className="transition-transform">         // Transform only
```

**Hover Animations**:
```tsx
<div className="hover:shadow-md">              // Shadow on hover
<div className="hover:scale-105">              // Scale up 5% on hover
<div className="hover:bg-accent">              // Background change on hover
```

**Loading Animations**:
```tsx
<div className="animate-pulse">                // Pulsing (loading)
<div className="animate-spin">                 // Spinning (loader)
```

**Custom Animations** (add to tailwind.config.js):
```js
keyframes: {
  'pulse-border': {
    '0%, 100%': { borderColor: 'hsl(var(--primary))' },
    '50%': { borderColor: 'hsl(var(--primary) / 0.5)' },
  },
},
animation: {
  'pulse-border': 'pulse-border 2s ease-in-out infinite',
}
```

---

## Accessibility Checklist

- [ ] All buttons have `aria-label` or visible text
- [ ] Form inputs have associated `<Label>` with `htmlFor`
- [ ] Modals trap focus (Shadcn Dialog does this automatically)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators visible (Tailwind `ring` classes)
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Screen reader announcements (use `aria-live` for dynamic content)
- [ ] Icon-only buttons have tooltips

---

## Component Checklist for Extension

**Phase 1: Core Components** (Week 2)
- [x] Button (all variants)
- [x] Card (with header, content, footer)
- [x] Badge (status colors)
- [x] Input
- [x] Textarea
- [x] Label

**Phase 2: Form Components** (Week 2)
- [ ] Select
- [ ] Switch
- [ ] Slider

**Phase 3: Layout Components** (Week 3)
- [ ] Dialog
- [ ] Tabs
- [ ] Accordion
- [ ] Separator
- [ ] ScrollArea

**Phase 4: Feedback Components** (Week 4)
- [ ] Toast
- [ ] Progress
- [ ] Skeleton

**Phase 5: Navigation Components** (Week 5)
- [ ] DropdownMenu
- [ ] Command
- [ ] Tooltip

**Phase 6: Custom Compositions** (Week 3-4)
- [ ] PromptCard
- [ ] QueueControls
- [ ] StatusBar
- [ ] EmptyState
- [ ] GenerateModal
- [ ] SettingsModal

---

## Summary

This component library provides:

1. **20 Shadcn UI components** - Production-ready, accessible
2. **6 custom compositions** - Purpose-built for extension
3. **Design token system** - Consistent colors, spacing, typography
4. **Icon library** - Lucide React (100+ icons)
5. **Utility classes** - Tailwind CSS for rapid development

**Total Bundle Size**: ~10KB minified (after PurgeCSS)

**Browser Support**: Chrome 90+ (ES2020 + CSS Grid + CSS Custom Properties)

**Accessibility**: WCAG AA compliant (4.5:1 contrast, keyboard navigation, screen reader support)

---

**Document Version**: 1.0
**Date**: 2025-01-18
**Status**: Complete Reference
