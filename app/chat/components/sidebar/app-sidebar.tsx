'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { SidebarHistory } from './sidebar-history';
import { SidebarUserNav } from './sidebar-user-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

export function AppSidebar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const { state, toggleSidebar } = useSidebar();
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  return (
    <Sidebar collapsible="icon"  className="">
      <SidebarHeader className="pb-0">
        <div className={`flex items-center py-2 `}>
          <div className="flex rounded-full items-center">
            <span className="text-lg bg-white drop-shadow-md border border-gray-200 rounded-full font-semibold"><Image src="/socr_logo.png" alt="logo" width={32} height={32} /></span>
          </div>
          <span
            className={`text-xl font-bold whitespace-nowrap transition-all duration-300 ease-in-out ${
              state === "collapsed"
                ? 'opacity-0 max-w-0 overflow-hidden'
                : 'opacity-100 max-w-full ml-2'
            }`}
          >
            TCIU Assistant
          </span>
        </div>
      </SidebarHeader>
      
      <SidebarHeader className="pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="New Chat"
              onClick={() => {
                router.push('/chat');
                router.refresh();
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/20"
            >
              <PlusIcon className="mr-1" />
              <span className="font-medium">New Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarHistory user={user} sidebarState={state} />
      </SidebarContent>
      
      <SidebarFooter className="text-xs text-center p-2 border-none">
        <div className="flex flex-col items-center gap-1">
          <div
            className={`flex flex-col items-center gap-1 overflow-hidden transition-all duration-300 ease-in-out ${
              state === "collapsed"
                ? 'opacity-0 max-h-16 invisible'
                : 'opacity-100 max-h-16 visible'
            }`}
          >
            <a 
              href="https://www.socr.umich.edu/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              SOCR Resource
            </a>
            <div className="flex items-center gap-1">
              <span>| {currentYear} |</span>
              <a href="mailto:statistics@umich.edu" target="_blank" rel="noopener noreferrer">
                statistics@umich.edu
              </a>
            </div>
          </div>
          <div className="mt-1 font-semibold">V 1.0</div>
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
