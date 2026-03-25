"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Users,
  Vote,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Deal Flow", href: "/deals", icon: Briefcase },
  { name: "Portfolio", href: "/portfolio", icon: BarChart3 },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Meetings", href: "/meetings", icon: MessageSquare },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "IC Decisions", href: "/ic", icon: Vote },
  { name: "LP Portal", href: "/lp", icon: BookOpen },
  { name: "Settings", href: "/settings", icon: Settings },
];

const actions = [
  { name: "New Deal", action: "new-deal", icon: Plus },
  { name: "New Contact", action: "new-contact", icon: Plus },
  { name: "New Meeting", action: "new-meeting", icon: Plus },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    []
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setOpen(false)}
      />
      <div className="fixed left-1/2 top-[20%] w-full max-w-lg -translate-x-1/2">
        <Command
          className="rounded-xl border border-border bg-popover shadow-2xl"
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Command.Input
              placeholder="Search pages, actions..."
              className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group
              heading="Pages"
              className="text-xs text-muted-foreground px-2 py-1.5"
            >
              {navItems.map((item) => (
                <Command.Item
                  key={item.href}
                  value={item.name}
                  onSelect={() => runCommand(() => router.push(item.href))}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent aria-selected:bg-accent"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.name}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group
              heading="Actions"
              className="text-xs text-muted-foreground px-2 py-1.5"
            >
              {actions.map((item) => (
                <Command.Item
                  key={item.action}
                  value={item.name}
                  onSelect={() =>
                    runCommand(() => {
                      /* placeholder for future actions */
                    })
                  }
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent aria-selected:bg-accent"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.name}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
