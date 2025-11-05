"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, BarChart3, PieChart, LineChart } from "lucide-react"
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const cropHealthData = [
  { month: "January", health: 75, yield: 68 },
  { month: "February", health: 78, yield: 71 },
  { month: "March", health: 82, yield: 74 },
  { month: "April", health: 85, yield: 78 },
  { month: "May", health: 88, yield: 82 },
  { month: "June", health: 91, yield: 86 },
]

const diseaseData = [
  { name: "Healthy", value: 65, color: "#16a34a" },
  { name: "Early Blight", value: 15, color: "#ea580c" },
  { name: "Powdery Mildew", value: 12, color: "#f97316" },
  { name: "Other", value: 8, color: "#fbbf24" },
]

const fieldPerformance = [
  { field: "Field 1A", health: 92, yield: 95, efficiency: 88 },
  { field: "Field 1B", health: 85, yield: 82, efficiency: 79 },
  { field: "Field 2A", health: 78, yield: 75, efficiency: 71 },
  { field: "Field 2B", health: 88, yield: 90, efficiency: 85 },
  { field: "Field 3A", health: 81, yield: 78, efficiency: 73 },
]

const soilMetrics = [
  { parameter: "pH Level", value: 6.8, optimal: "6.5-7.0", status: "Good" },
  { parameter: "Nitrogen", value: 45, optimal: "40-60", status: "Good" },
  { parameter: "Phosphorus", value: 25, optimal: "20-30", status: "Good" },
  { parameter: "Potassium", value: 180, optimal: "150-200", status: "Good" },
  { parameter: "Moisture", value: 65, optimal: "60-80", status: "Optimal" },
  { parameter: "Organic Matter", value: 3.2, optimal: "3-4", status: "Good" },
]

export function ReportsContent() {
  const [selectedFarm, setSelectedFarm] = useState("all")
  const [timeRange, setTimeRange] = useState("6months")

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your crop health and farm performance</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Card className="p-4 border border-border/50">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Farm</label>
            <Select value={selectedFarm} onValueChange={setSelectedFarm}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Farms</SelectItem>
                <SelectItem value="north">North Field Farm</SelectItem>
                <SelectItem value="valley">Valley Green Farm</SelectItem>
                <SelectItem value="harvest">Harvest Ridge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Time Range</label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border border-border/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <p className="text-sm text-muted-foreground mb-2">Average Health Score</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-400">86.5%</p>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +2.3% from last month
          </p>
        </Card>

        <Card className="p-6 border border-border/50 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <p className="text-sm text-muted-foreground mb-2">Yield Projection</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">+8.5%</p>
          <p className="text-xs text-muted-foreground mt-2">Above seasonal average</p>
        </Card>

        <Card className="p-6 border border-border/50 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
          <p className="text-sm text-muted-foreground mb-2">Active Issues</p>
          <p className="text-3xl font-bold text-red-700 dark:text-red-400">3</p>
          <p className="text-xs text-muted-foreground mt-2">Requires attention</p>
        </Card>

        <Card className="p-6 border border-border/50 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <p className="text-sm text-muted-foreground mb-2">Analysis Count</p>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">156</p>
          <p className="text-xs text-muted-foreground mt-2">This season</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health and Yield Trend */}
        <Card className="p-6 border border-border/50 hover:shadow-md transition-all">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            Health & Yield Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={cropHealthData}>
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
              <Line
                type="monotone"
                dataKey="health"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="yield"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </Card>

        {/* Disease Distribution */}
        <Card className="p-6 border border-border/50 hover:shadow-md transition-all">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Disease Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={diseaseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {diseaseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Field Performance Comparison */}
      <Card className="p-6 border border-border/50 hover:shadow-md transition-all">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Field Performance Comparison
        </h2>
        <div className="overflow-x-auto">
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={fieldPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="field" stroke="hsl(var(--muted-foreground))" />
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
              <Bar dataKey="efficiency" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Soil Metrics Table */}
      <Card className="p-6 border border-border/50 hover:shadow-md transition-all">
        <h2 className="text-lg font-semibold mb-4">Soil Quality Metrics</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Parameter</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Current Value</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Optimal Range</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {soilMetrics.map((metric, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium">{metric.parameter}</td>
                  <td className="py-3 px-4">{metric.value}</td>
                  <td className="py-3 px-4 text-muted-foreground">{metric.optimal}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-green-100/50 dark:bg-green-950/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full border border-green-200/50 dark:border-green-900/30">
                      {metric.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6 border border-border/50 hover:shadow-md transition-all">
        <h2 className="text-lg font-semibold mb-4">Seasonal Recommendations</h2>
        <div className="space-y-3">
          {[
            "Apply fungicide treatment to Field 1B within next 7 days",
            "Increase nitrogen fertilizer by 15% in Field 2A",
            "Schedule irrigation for Field 2A - soil moisture at 65%",
            "Prepare for post-harvest cleanup - crops at 95% maturity",
            "Consider cover crop planting for Field 3B in off-season",
          ].map((rec, idx) => (
            <div
              key={idx}
              className="flex gap-3 p-4 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <span className="text-primary font-bold flex-shrink-0 text-lg">✓</span>
              <span className="text-sm">{rec}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
