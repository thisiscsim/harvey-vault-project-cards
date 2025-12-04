"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { HeroUIProvider } from "@heroui/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <SidebarProvider defaultOpen={true}>
        {children}
      </SidebarProvider>
    </HeroUIProvider>
  );
}

