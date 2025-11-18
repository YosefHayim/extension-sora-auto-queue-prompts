# UX Redesign Implementation Quick Start

## Overview

This guide provides a rapid implementation path for the Shadcn UI redesign. Follow this checklist to get started quickly.

---

## Phase 1: Setup (Day 1)

### 1. Install Dependencies

```bash
# Core dependencies
npm install tailwindcss postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# Shadcn CLI (optional but recommended)
npx shadcn-ui@latest init
```

### 2. Initialize Tailwind Config

```bash
npx tailwindcss init -p
```

**Edit `tailwind.config.js`:**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{ts,tsx}',
    './assets/**/*.html',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
}
```

### 3. Create Global Styles

**Create `src/styles/globals.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Popup container */
.popup-container {
  @apply w-[600px] min-h-[500px] max-h-[700px] overflow-y-auto;
}
```

### 4. Create Utils Helper

**Create `src/lib/utils.ts`:**

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 5. Update esbuild Config

**Edit build script in `package.json`:**

```json
{
  "scripts": {
    "bundle": "esbuild src/background.ts --bundle --outfile=dist/background.js --format=iife --target=chrome90 && esbuild src/popup.tsx --bundle --outfile=dist/popup.js --format=iife --target=chrome90 --external:*.css && esbuild src/content.ts --bundle --outfile=dist/content.js --format=iife --target=chrome90",
    "build:css": "tailwindcss -i src/styles/globals.css -o dist/popup.css --minify",
    "build": "npm run clean && npm run build:css && npm run bundle && npm run copy-assets",
    "dev": "npm run build:css && npm run bundle -- --watch",
    "dev:css": "tailwindcss -i src/styles/globals.css -o dist/popup.css --watch"
  }
}
```

### 6. Update popup.html

**Edit `assets/popup.html`:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sora Auto Queue</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div id="root"></div>
  <script src="popup.js"></script>
</body>
</html>
```

---

## Phase 2: Install Shadcn Components (Day 2)

### Install Core Components

```bash
# Install one by one
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
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
```

This will create `src/components/ui/` folder with all components.

---

## Phase 3: Create Custom Components (Days 3-4)

### 1. StatusBar Component

**Create `src/components/StatusBar.tsx`:**

```tsx
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Check } from 'lucide-react';

interface StatusBarProps {
  pendingCount: number;
  processingCount: number;
  completedCount: number;
}

export function StatusBar({ pendingCount, processingCount, completedCount }: StatusBarProps) {
  return (
    <div className="flex items-center gap-3">
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        {pendingCount} Pending
      </Badge>

      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Play className="h-3 w-3 mr-1" />
        {processingCount} Processing
      </Badge>

      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Check className="h-3 w-3 mr-1" />
        {completedCount} Completed
      </Badge>
    </div>
  );
}
```

### 2. PromptCard Component

**Create `src/components/PromptCard.tsx`:**

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pencil, Copy, Sparkles, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GeneratedPrompt } from '@/types';

interface PromptCardProps {
  prompt: GeneratedPrompt;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRefine: (id: string) => void;
  onGenerateSimilar: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PromptCard({
  prompt,
  onEdit,
  onDuplicate,
  onRefine,
  onGenerateSimilar,
  onDelete,
}: PromptCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card
      className={cn(
        'group transition-all duration-200 hover:shadow-md',
        prompt.status === 'processing' && 'border-primary animate-pulse',
        prompt.status === 'completed' && 'opacity-70'
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {prompt.mediaType}
          </Badge>
          {prompt.aspectRatio && (
            <Badge variant="secondary" className="text-xs">
              {prompt.aspectRatio}
            </Badge>
          )}
          {prompt.enhanced && (
            <Badge variant="default" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              Enhanced
            </Badge>
          )}
        </div>
        <Badge className={cn('text-xs', getStatusColor(prompt.status))}>
          {prompt.status}
        </Badge>
      </CardHeader>

      <CardContent>
        <p className="text-sm leading-relaxed text-foreground">{prompt.text}</p>
        {prompt.variations && (
          <span className="text-xs text-muted-foreground mt-2 block">
            {prompt.variations} variations
          </span>
        )}
      </CardContent>

      <CardFooter className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(prompt.id)}
          title="Edit prompt"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDuplicate(prompt.id)}
          title="Duplicate"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRefine(prompt.id)}
          title="Refine with AI"
        >
          <Sparkles className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onGenerateSimilar(prompt.id)}>
              Generate Similar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(prompt.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
```

### 3. QueueControls Component

**Create `src/components/QueueControls.tsx`:**

```tsx
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square } from 'lucide-react';
import type { QueueState } from '@/types';

interface QueueControlsProps {
  queueState: QueueState;
  totalCount: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function QueueControls({
  queueState,
  totalCount,
  onStart,
  onPause,
  onResume,
  onStop,
}: QueueControlsProps) {
  const progress = totalCount > 0 ? (queueState.processedCount / totalCount) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge
              variant={queueState.isRunning ? 'default' : 'secondary'}
              className="text-sm"
            >
              {queueState.isRunning
                ? queueState.isPaused
                  ? '⏸ Paused'
                  : '▶ Running'
                : '⏹ Stopped'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {queueState.processedCount} / {totalCount} prompts
            </span>
          </div>

          <div className="flex gap-2">
            {!queueState.isRunning && (
              <Button onClick={onStart} className="w-32">
                <Play className="h-4 w-4 mr-2" />
                Start Queue
              </Button>
            )}
            {queueState.isRunning && !queueState.isPaused && (
              <Button variant="secondary" onClick={onPause}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            {queueState.isRunning && queueState.isPaused && (
              <Button onClick={onResume}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
            {queueState.isRunning && (
              <Button variant="destructive" onClick={onStop}>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {queueState.isRunning && (
        <CardContent>
          <Progress value={progress} className="w-full" />
        </CardContent>
      )}
    </Card>
  );
}
```

### 4. EmptyState Component

**Create `src/components/EmptyState.tsx`:**

```tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Inbox, Sparkles, Upload } from 'lucide-react';

interface EmptyStateProps {
  onGenerate: () => void;
  onImport: () => void;
}

export function EmptyState({ onGenerate, onImport }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No prompts yet</h3>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
          Generate AI prompts or import from CSV to get started with your queue
        </p>
        <div className="flex gap-3">
          <Button onClick={onGenerate}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Prompts
          </Button>
          <Button variant="outline" onClick={onImport}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Phase 4: Update Main Popup Component (Day 5)

**Edit `src/popup.tsx` (simplified version):**

```tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { StatusBar } from './components/StatusBar';
import { QueueControls } from './components/QueueControls';
import { PromptCard } from './components/PromptCard';
import { EmptyState } from './components/EmptyState';
import { Button } from './components/ui/button';
import { Sparkles, Settings } from 'lucide-react';
import { storage } from './utils/storage';
import type { PromptConfig, GeneratedPrompt, QueueState } from './types';
import './styles/globals.css';

function IndexPopup() {
  const [config, setConfig] = useState<PromptConfig | null>(null);
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [queueState, setQueueState] = useState<QueueState | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    const [loadedConfig, loadedPrompts, loadedQueueState] = await Promise.all([
      storage.getConfig(),
      storage.getPrompts(),
      storage.getQueueState(),
    ]);
    setConfig(loadedConfig);
    setPrompts(loadedPrompts);
    setQueueState(loadedQueueState);
  }

  // Count prompts by status
  const pendingCount = prompts.filter((p) => p.status === 'pending').length;
  const processingCount = prompts.filter((p) => p.status === 'processing').length;
  const completedCount = prompts.filter((p) => p.status === 'completed').length;

  if (!config || !queueState) {
    return <div className="popup-container flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="popup-container p-4 space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Sora Auto Queue</h1>
          <StatusBar
            pendingCount={pendingCount}
            processingCount={processingCount}
            completedCount={completedCount}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={() => {/* Open generate modal */}}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Queue Controls */}
      <QueueControls
        queueState={queueState}
        totalCount={prompts.length}
        onStart={async () => {
          await chrome.runtime.sendMessage({ action: 'startQueue' });
          await loadData();
        }}
        onPause={async () => {
          await chrome.runtime.sendMessage({ action: 'pauseQueue' });
          await loadData();
        }}
        onResume={async () => {
          await chrome.runtime.sendMessage({ action: 'resumeQueue' });
          await loadData();
        }}
        onStop={async () => {
          await chrome.runtime.sendMessage({ action: 'stopQueue' });
          await loadData();
        }}
      />

      {/* Prompt List */}
      <div className="space-y-3">
        {prompts.length === 0 ? (
          <EmptyState
            onGenerate={() => {/* Open generate modal */}}
            onImport={() => {/* Open import modal */}}
          />
        ) : (
          prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={(id) => console.log('Edit', id)}
              onDuplicate={(id) => console.log('Duplicate', id)}
              onRefine={(id) => console.log('Refine', id)}
              onGenerateSimilar={(id) => console.log('Generate similar', id)}
              onDelete={(id) => console.log('Delete', id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Mount the React app
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<IndexPopup />);
}
```

---

## Phase 5: Build and Test (Day 6)

### 1. Build the Extension

```bash
# Build CSS and JS
npm run build

# For development with watch mode
npm run dev
```

### 2. Load in Chrome

1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

### 3. Test Core Functionality

- [ ] Extension loads without errors
- [ ] Tailwind CSS is applied
- [ ] Components render correctly
- [ ] Buttons are clickable
- [ ] Queue controls work
- [ ] Prompt cards display properly

---

## Next Steps

After Phase 5, continue with:

1. **Add GenerateModal component** (Phase 4 from main doc)
2. **Add SettingsModal component** (Phase 4)
3. **Implement command palette** (Phase 5)
4. **Add keyboard shortcuts** (Phase 5)
5. **Polish animations and transitions** (Phase 6)
6. **Run accessibility audit** (Phase 6)
7. **Write tests** (Phase 7)

---

## Troubleshooting

### Tailwind CSS Not Working

**Issue**: Styles not applied

**Solution**:
1. Check `globals.css` is imported in `popup.tsx`
2. Verify `tailwind.config.js` content paths include `src/**/*.{ts,tsx}`
3. Run `npm run build:css` to regenerate CSS
4. Hard refresh Chrome extension (Cmd+Shift+R)

### Components Not Found

**Issue**: Import errors for Shadcn components

**Solution**:
1. Verify `components.json` has correct paths
2. Re-run `npx shadcn-ui@latest add <component-name>`
3. Check `tsconfig.json` has path alias:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

### Build Errors

**Issue**: esbuild fails with CSS errors

**Solution**:
1. Build CSS separately: `npm run build:css`
2. Then build JS: `npm run bundle`
3. Or use external CSS flag in esbuild: `--external:*.css`

---

## Resources

- [Shadcn UI Docs](https://ui.shadcn.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)

---

## Summary

This quick start gets you from zero to a working Shadcn UI prototype in 6 days:

- **Day 1**: Setup Tailwind + dependencies
- **Day 2**: Install Shadcn components
- **Days 3-4**: Build custom components
- **Day 5**: Integrate into main popup
- **Day 6**: Build, test, iterate

Total time: 1 week for MVP, 8 weeks for full implementation (per main doc).
