"use client";
import type React from "react";

import { SidebarProvider } from "@/components/ui/sidebar-provider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const router = useRouter();


  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setIsSidebarCollapsed(e.detail.isCollapsed);
    };

    window.addEventListener(
      "sidebarStateChange" as any,
      handleSidebarChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "sidebarStateChange" as any,
        handleSidebarChange as EventListener
      );
    };
  }, []);



  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div
          className={`transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
          }`}
        >
          <DashboardHeader />
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
