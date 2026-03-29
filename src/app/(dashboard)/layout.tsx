import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { AiChatPanel } from "@/components/layout/ai-chat-panel";
import { CommandPalette } from "@/components/layout/command-palette";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopBar />
          <main id="main-content" role="main" className="flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
        <AiChatPanel />
        <CommandPalette />
      </SidebarProvider>
    </TooltipProvider>
  );
}
