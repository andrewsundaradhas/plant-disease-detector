"use client"

import type React from "react"

import { useState } from "react"
import { Leaf, Home, Crop, AlertCircle, BarChart3, Settings, Menu, X, Bug } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, href: "/" },
  { id: "farms", label: "Farms", icon: Crop, href: "/farms" },
  { id: "disease-detector", label: "Disease Detector", icon: Bug, href: "/plant-disease-detector" },
  { id: "alerts", label: "Alerts", icon: AlertCircle, href: "/alerts" },
  { id: "reports", label: "Reports", icon: BarChart3, href: "/reports" },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center w-full")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
              <Leaf className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            {sidebarOpen && <span className="text-lg font-bold text-sidebar-primary">CropHealth</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                title={item.label}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              "flex w-full items-center justify-center rounded-lg px-3 py-2",
              "text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            )}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 flex flex-col transition-all duration-300", sidebarOpen ? "ml-64" : "ml-20")}>
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Crop Health Prediction</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            <div className="h-10 w-10 rounded-full bg-sidebar-primary flex items-center justify-center">
              <span className="text-sm font-medium text-sidebar-primary-foreground">U</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
