"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, MapPin, Leaf, AlertCircle, MoreVertical, Droplets } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Farm {
  id: string
  name: string
  location: string
  area: number
  crops: string[]
  health: number
  lastAnalysis: string
  alerts: number
}

const mockFarms: Farm[] = [
  {
    id: "1",
    name: "North Field Farm",
    location: "Iowa, USA",
    area: 250,
    crops: ["Corn", "Soybean"],
    health: 92,
    lastAnalysis: "2 hours ago",
    alerts: 0,
  },
  {
    id: "2",
    name: "Valley Green Farm",
    location: "Illinois, USA",
    area: 180,
    crops: ["Wheat", "Oats"],
    health: 78,
    lastAnalysis: "5 hours ago",
    alerts: 2,
  },
  {
    id: "3",
    name: "Harvest Ridge",
    location: "Nebraska, USA",
    area: 320,
    crops: ["Corn", "Soybean", "Wheat"],
    health: 85,
    lastAnalysis: "1 hour ago",
    alerts: 1,
  },
  {
    id: "4",
    name: "Sunset Acres",
    location: "Minnesota, USA",
    area: 150,
    crops: ["Corn"],
    health: 88,
    lastAnalysis: "3 hours ago",
    alerts: 0,
  },
]

export function FarmsContent() {
  const [farms, setFarms] = useState<Farm[]>(mockFarms)
  const [isOpen, setIsOpen] = useState(false)
  const [newFarm, setNewFarm] = useState({
    name: "",
    location: "",
    area: "",
  })

  const handleAddFarm = () => {
    if (newFarm.name && newFarm.location && newFarm.area) {
      const farm: Farm = {
        id: String(farms.length + 1),
        name: newFarm.name,
        location: newFarm.location,
        area: Number(newFarm.area),
        crops: [],
        health: 0,
        lastAnalysis: "Never",
        alerts: 0,
      }
      setFarms([...farms, farm])
      setNewFarm({ name: "", location: "", area: "" })
      setIsOpen(false)
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 85) return "text-green-600"
    if (health >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getHealthBg = (health: number) => {
    if (health >= 85)
      return "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-900/30"
    if (health >= 70)
      return "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200/50 dark:border-yellow-900/30"
    return "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200/50 dark:border-red-900/30"
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Farms</h1>
          <p className="text-muted-foreground">Manage and monitor all your farms</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Add Farm
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Farm</DialogTitle>
              <DialogDescription>Enter the details of your new farm to get started with monitoring.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Farm Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., North Field Farm"
                  value={newFarm.name}
                  onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Iowa, USA"
                  value={newFarm.location}
                  onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area (acres)</Label>
                <Input
                  id="area"
                  type="number"
                  placeholder="e.g., 250"
                  value={newFarm.area}
                  onChange={(e) => setNewFarm({ ...newFarm, area: e.target.value })}
                />
              </div>
              <Button onClick={handleAddFarm} className="w-full bg-primary hover:bg-primary/90">
                Create Farm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {farms.map((farm) => (
          <Card
            key={farm.id}
            className="p-6 hover:shadow-lg transition-all duration-200 border border-border/50 overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{farm.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {farm.location}
                </div>
              </div>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Farm Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Area</p>
                <p className="font-semibold">{farm.area}</p>
                <p className="text-xs text-muted-foreground">acres</p>
              </div>
              <div className={`p-3 rounded-lg border ${getHealthBg(farm.health)}`}>
                <p className="text-xs text-muted-foreground mb-1">Health</p>
                <p className={`font-semibold ${getHealthColor(farm.health)}`}>{farm.health}%</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Moisture</p>
                <div className="flex items-center gap-1">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  <p className="font-semibold">65%</p>
                </div>
              </div>
            </div>

            {/* Crops */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground font-medium mb-2">Crops</p>
              <div className="flex flex-wrap gap-2">
                {farm.crops.length > 0 ? (
                  farm.crops.map((crop, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/40 dark:to-emerald-950/40 text-green-700 dark:text-green-300 text-xs rounded-full font-medium flex items-center gap-1 border border-green-200/50 dark:border-green-900/30"
                    >
                      <Leaf className="h-3 w-3" />
                      {crop}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">No crops added yet</span>
                )}
              </div>
            </div>

            {/* Status and Actions */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Last analysis</p>
                  <p className="text-sm font-medium">{farm.lastAnalysis}</p>
                </div>
                {farm.alerts > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-100/50 dark:bg-red-950/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-700 dark:text-red-400">{farm.alerts}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
                  View Details
                </button>
                <button className="flex-1 px-3 py-2 border border-border text-foreground rounded-lg font-medium text-sm hover:bg-muted transition-colors">
                  Analyze
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {farms.length === 0 && (
        <div className="text-center py-12">
          <Leaf className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-1">No farms yet</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first farm to begin monitoring crop health.</p>
        </div>
      )}
    </div>
  )
}
