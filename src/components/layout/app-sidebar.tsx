"use client";

import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  Vote,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navMain = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Investment",
    items: [
      { title: "Deal Flow", href: "/deals", icon: Briefcase },
      { title: "Portfolio", href: "/portfolio", icon: BarChart3 },
      { title: "Companies", href: "/companies", icon: Building2 },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Contacts", href: "/contacts", icon: Users },
      { title: "Meetings", href: "/meetings", icon: MessageSquare },
      { title: "Documents", href: "/documents", icon: FileText },
      { title: "IC Decisions", href: "/ic", icon: Vote },
    ],
  },
  {
    label: "Reporting",
    items: [
      { title: "LP Portal", href: "/lp", icon: BookOpen },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" aria-label="Main navigation">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
            V
          </div>
          <span className="font-semibold text-sm group-data-[collapsible=icon]:hidden">
            VentureMind
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navMain.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/settings" />}
              isActive={pathname === "/settings"}
              tooltip="Settings"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
