'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AppSidebar } from "./components/sidebar/app-sidebar";
import { ThemeProvider } from "next-themes";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeSwitcher } from '@/components/theme-switcher';
import AuthButton from '@/components/header-auth';
import { EbookProvider, useEbookContext } from '@/app/chat/lib/context/ebook-context';
import EbookPanel from './components/ebook/EbookPanel';
import { chapters } from './lib/data/ebook-chapters'; // Import chapters for default URL
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Inner component to access context after Provider
function ChatLayoutContent({ children }: { children: React.ReactNode }) {
  const { isEbookPanelOpen, openEbookPanel } = useEbookContext();
  const [showEbookHint, setShowEbookHint] = useState(false);

  useEffect(() => {
    const hintShown = localStorage.getItem('ebookHintShown');
    if (!hintShown) {
      setShowEbookHint(true);
      localStorage.setItem('ebookHintShown', 'true');
    }
  }, []);

  const handleOpenEbook = () => {
    // Open with the first chapter by default if none is set
    openEbookPanel(); 
  };

  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen overflow-hidden">
          <header className="flex justify-between items-center h-14 shrink-0 px-4 border-b">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-3 pr-4">
              <TooltipProvider>
                <Tooltip open={showEbookHint} onOpenChange={(open) => {
                  if (!open) setShowEbookHint(false);
                }}>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={handleOpenEbook} 
                      className="p-1 px-2 text-sm bg-secondary hover:bg-secondary/80 rounded relative"
                    >
                      TCIU Ebook
                    </button>
                  </TooltipTrigger>
                  {showEbookHint && (
                    <TooltipContent 
                      side="bottom" 
                      align="center" 
                      className="bg-slate-800 text-white p-2 rounded-md shadow-lg border border-slate-700"
                    >
                      <p className="text-sm">Check out the TCIU Ebook here!</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <ThemeSwitcher />
              <AuthButton />
            </div>
          </header>
          <PanelGroup direction="horizontal" className="flex-grow w-full overflow-hidden">
            <Panel defaultSize={isEbookPanelOpen ? 70 : 100} minSize={30}>
              <div className="h-full w-full overflow-y-auto bg-background">
                {children}
              </div>
            </Panel>
            {isEbookPanelOpen && (
              <>
                <PanelResizeHandle className="w-0.5 bg-transparent hover:bg-muted-foreground/20 transition-colors data-[resize-handle-state=drag]:bg-muted-foreground/30" />
                <Panel defaultSize={70} minSize={20} collapsible={false} collapsedSize={0} >
                  <EbookPanel />
                </Panel>
              </>
            )}
          </PanelGroup>
        </SidebarInset>
    </SidebarProvider>
  );
}

export default function ChatLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <EbookProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ChatLayoutContent>{children}</ChatLayoutContent>
        </ThemeProvider>
      </EbookProvider>
    </QueryClientProvider>
  );
}
