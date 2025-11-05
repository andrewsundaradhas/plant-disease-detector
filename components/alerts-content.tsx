"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, AlertTriangle, Info, CheckCircle, Trash2, Clock, Leaf } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Alert {
  id: string
  type: "critical" | "warning" | "info"
  title: string
  description: string
  farm: string
  field: string
  timestamp: string
  read: boolean
  action?: string
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "Disease Detection: Early Blight",
    description: "Early blight detected in North Field with 87% confidence. Immediate treatment recommended.",
    farm: "North Field Farm",
    field: "Field 1A",
    timestamp: "2 hours ago",
    read: false,
    action: "View Analysis",
  },
  {
    id: "2",
    type: "warning",
    title: "Nutrient Deficiency Alert",
    description: "Nitrogen levels are 15% below optimal range in Valley Green Farm. Fertilization recommended.",
    farm: "Valley Green Farm",
    field: "Field 2B",
    timestamp: "4 hours ago",
    read: false,
    action: "View Recommendations",
  },
  {
    id: "3",
    type: "warning",
    title: "Soil Moisture Low",
    description: "Soil moisture dropped below 40% in Harvest Ridge. Irrigation advised within 24 hours.",
    farm: "Harvest Ridge",
    field: "Field 3C",
    timestamp: "6 hours ago",
    read: true,
    action: "Schedule Irrigation",
  },
  {
    id: "4",
    type: "info",
    title: "Weather Alert: Rainfall Expected",
    description: "Light rainfall expected in your area. Good opportunity for natural watering.",
    farm: "Sunset Acres",
    field: "All Fields",
    timestamp: "8 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "critical",
    title: "Pest Infestation Detected",
    description: "Armyworm infestation detected with moderate severity. Consider pesticide application.",
    farm: "North Field Farm",
    field: "Field 1B",
    timestamp: "12 hours ago",
    read: true,
    action: "View Options",
  },
  {
    id: "6",
    type: "info",
    title: "Crop Health Analysis Complete",
    description: "Analysis completed for North Field Farm. Overall health score: 92%",
    farm: "North Field Farm",
    field: "Field 1A",
    timestamp: "1 day ago",
    read: true,
  },
]

export function AlertsContent() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [filterType, setFilterType] = useState<"all" | "unread" | "critical">("all")

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getAlertBg = (type: string, read: boolean) => {
    if (!read) {
      switch (type) {
        case "critical":
          return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        case "warning":
          return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
        case "info":
          return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
      }
    }
    return "border-border"
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "text-red-700 dark:text-red-300"
      case "warning":
        return "text-orange-700 dark:text-orange-300"
      case "info":
        return "text-blue-700 dark:text-blue-300"
      default:
        return "text-foreground"
    }
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (filterType === "unread") return !alert.read
    if (filterType === "critical") return alert.type === "critical"
    return true
  })

  const unreadCount = alerts.filter((a) => !a.read).length
  const criticalCount = alerts.filter((a) => a.type === "critical").length

  const markAsRead = (id: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)))
  }

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, read: true })))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
          <p className="text-muted-foreground">Monitor important updates and issues across your farms</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs value={filterType} onValueChange={(value) => setFilterType(value as any)}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="critical">
            Critical
            {criticalCount > 0 && (
              <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                {criticalCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Alerts List */}
        <TabsContent value={filterType} className="space-y-3 mt-6">
          {filteredAlerts.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
              <p className="font-semibold mb-1">All clear!</p>
              <p className="text-sm text-muted-foreground">
                No {filterType === "unread" ? "unread" : filterType === "critical" ? "critical" : ""} alerts at this
                moment.
              </p>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`p-4 border-l-4 transition-all ${getAlertBg(alert.type, alert.read)} ${
                  alert.type === "critical"
                    ? "border-l-red-600"
                    : alert.type === "warning"
                      ? "border-l-orange-600"
                      : "border-l-blue-600"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">{getAlertIcon(alert.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-1 ${getAlertColor(alert.type)}`}>{alert.title}</h3>
                        <p className="text-sm text-foreground mb-2">{alert.description}</p>

                        {/* Farm and Field Info */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Leaf className="h-3 w-3" />
                            {alert.farm}
                          </div>
                          <span>•</span>
                          <span>{alert.field}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.timestamp}
                          </div>
                        </div>

                        {/* Action Button */}
                        {alert.action && (
                          <button className="text-xs font-semibold text-sidebar-primary hover:underline">
                            {alert.action} →
                          </button>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!alert.read && (
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Delete alert"
                        >
                          <Trash2 className="h-5 w-5 text-muted-foreground hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical Alerts</p>
              <p className="text-2xl font-bold">{criticalCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Warnings</p>
              <p className="text-2xl font-bold">{alerts.filter((a) => a.type === "warning").length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unread Alerts</p>
              <p className="text-2xl font-bold">{unreadCount}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
