"use client"

import { Card } from "@/components/ui/card"
import {
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts"
import { TrendingUp, AlertCircle, Leaf, Zap } from "lucide-react"

const healthData = [
  { month: "Jan", health: 75, yield: 68, efficiency: 72 },
  { month: "Feb", health: 78, yield: 71, efficiency: 74 },
  { month: "Mar", health: 82, yield: 74, efficiency: 78 },
  { month: "Apr", health: 85, yield: 78, efficiency: 80 },
  { month: "May", health: 88, yield: 82, efficiency: 84 },
  { month: "Jun", health: 91, yield: 86, efficiency: 87 },
]

const fieldData = [
  { name: "Field 1A", health: 92, yield: 95 },
  { name: "Field 1B", health: 85, yield: 82 },
  { name: "Field 2A", health: 78, yield: 75 },
  { name: "Field 2B", health: 88, yield: 90 },
  { name: "Field 3A", health: 81, yield: 78 },
]

const stats = [
  {
    label: "Avg. Health Score",
    value: "86.5%",
    change: "+2.3%",
    icon: Leaf,
    color: "from-emerald-500 to-teal-600",
    trend: "up",
  },
  {
    label: "Yield Projection",
    value: "+8.5%",
    change: "Above average",
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-600",
    trend: "up",
  },
  {
    label: "Active Alerts",
    value: "3",
    change: "Requires action",
    icon: AlertCircle,
    color: "from-orange-500 to-red-600",
    trend: "neutral",
  },
  {
    label: "Analysis Runs",
    value: "156",
    change: "This season",
    icon: Zap,
    color: "from-purple-500 to-pink-600",
    trend: "up",
  },
]

export function DashboardContent() {
  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6 hover:shadow-md transition-all duration-200 border border-border/50">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
              <p className="text-3xl font-bold mb-2">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Health Trend - Wider */}
        <Card className="lg:col-span-2 p-6 border border-border/50 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Crop Health Trend</h2>
              <p className="text-xs text-muted-foreground mt-1">Last 6 months performance</p>
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              +16% growth
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={healthData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="health"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#healthGradient)"
              />
              <Line type="monotone" dataKey="yield" stroke="hsl(var(--chart-2))" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Quick Stats Card */}
        <Card className="p-6 border border-border/50">
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200/50 dark:border-green-900/30">
              <p className="text-xs text-muted-foreground mb-1">Healthy Crops</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">42/48</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg border border-orange-200/50 dark:border-orange-900/30">
              <p className="text-xs text-muted-foreground mb-1">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">2</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200/50 dark:border-blue-900/30">
              <p className="text-xs text-muted-foreground mb-1">Avg. Health</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">86.5%</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 border border-border/50 hover:shadow-md transition-all">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Field Performance</h2>
          <p className="text-xs text-muted-foreground mt-1">Health and yield comparison</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={fieldData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Bar dataKey="health" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
            <Bar dataKey="yield" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6 border border-border/50">
        <h2 className="text-lg font-semibold mb-6">Recent Analysis Results</h2>
        <div className="space-y-3">
          {[
            { field: "Field 1A", status: "Healthy", confidence: 92, time: "2 hours ago" },
            { field: "Field 2B", status: "Warning", confidence: 78, time: "4 hours ago" },
            { field: "Field 3C", status: "Healthy", confidence: 89, time: "6 hours ago" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.field}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p
                    className={`font-semibold text-sm ${item.status === "Healthy" ? "text-green-600" : "text-orange-600"}`}
                  >
                    {item.status}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.confidence}% confidence</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
