"use client";

import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function TopBar() {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />

      <div className="flex-1" />

      <OrganizationSwitcher
        appearance={{ baseTheme: dark }}
        afterCreateOrganizationUrl="/dashboard"
        afterSelectOrganizationUrl="/dashboard"
      />

      <UserButton
        appearance={{ baseTheme: dark }}
      />
    </header>
  );
}
