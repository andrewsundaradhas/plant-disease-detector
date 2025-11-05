'use client';

import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import { Button } from "./ui/button";

type Prediction = {
  label: string;
  confidence: number;
  disease: string;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
};

interface PlantHealthChartProps {
  predictions: Prediction[];
  healthScore: number;
  timestamp: string;
  onExport?: () => void;
}

const COLORS = {
  healthy: '#10b981',
  low: '#f59e0b',
  medium: '#f97316',
  high: '#ef4444',
  grid: '#e5e7eb',
  text: '#6b7280',
};

export function PlantHealthChart({ predictions, healthScore, timestamp, onExport }: PlantHealthChartProps) {
  // Prepare data for charts
  const severityData = predictions.reduce((acc, pred) => {
    const severity = pred.severity;
    const existing = acc.find(item => item.name === severity);
    if (existing) {
      existing.value += 1;
    } else if (severity) {
      acc.push({ name: severity, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const confidenceData = predictions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
    .map(pred => ({
      name: pred.label.split(' ').slice(0, 3).join(' '),
      confidence: pred.confidence,
      severity: pred.severity,
    }));

  const healthTrendData = [
    { day: 'Mon', health: Math.max(20, healthScore - 20) },
    { day: 'Tue', health: Math.max(30, healthScore - 15) },
    { day: 'Wed', health: Math.max(40, healthScore - 5) },
    { day: 'Thu', health: Math.max(50, healthScore + 5) },
    { day: 'Fri', health: Math.max(60, healthScore - 10) },
    { day: 'Sat', health: Math.max(70, healthScore) },
    { day: 'Sun', health: healthScore },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return COLORS.high;
      case 'medium': return COLORS.medium;
      case 'low': return COLORS.low;
      default: return COLORS.healthy;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].payload.name || label}</p>
          <p className="text-sm">
            Confidence: <span className="font-medium">{payload[0].value}%</span>
          </p>
          {payload[0].payload.severity && (
            <p className="text-sm">
              Severity: <span className="font-medium capitalize">{payload[0].payload.severity}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
      return;
    }
    
    // Default export behavior
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        healthScore,
        predictions,
      }, null, 2)
    )}`;
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `plant-health-analysis-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Plant Health Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Analyzed on {new Date(timestamp).toLocaleString()}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-muted/30 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold mb-1" style={{ color: getSeverityColor(healthScore > 70 ? 'healthy' : healthScore > 40 ? 'low' : 'high') }}>
            {healthScore}%
          </div>
          <div className="text-sm text-muted-foreground">Overall Health</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold mb-1">
            {predictions.length}
          </div>
          <div className="text-sm text-muted-foreground">Conditions Detected</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold mb-1" style={{ color: predictions.some(p => p.severity === 'high') ? COLORS.high : COLORS.healthy }}>
            {predictions.filter(p => p.severity === 'high').length}
          </div>
          <div className="text-sm text-muted-foreground">Critical Issues</div>
        </div>
      </div>

      <Tabs defaultValue="confidence" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="confidence" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Confidence</span>
            </TabsTrigger>
            <TabsTrigger value="trend" className="flex items-center gap-2">
              <LineChartIcon className="h-4 w-4" />
              <span>Health Trend</span>
            </TabsTrigger>
            <TabsTrigger value="severity" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              <span>Severity</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="confidence" className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={confidenceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: COLORS.text }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fill: COLORS.text }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="confidence" name="Confidence">
                {confidenceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="trend" className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={healthTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis dataKey="day" tick={{ fill: COLORS.text }} />
              <YAxis domain={[0, 100]} tick={{ fill: COLORS.text }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  borderColor: COLORS.grid,
                }}
                labelStyle={{ color: COLORS.text, fontWeight: 500 }}
              />
              <Line 
                type="monotone" 
                dataKey="health" 
                name="Health Score"
                stroke={COLORS.healthy} 
                strokeWidth={2} 
                dot={{ r: 4 }}
                activeDot={{ r: 6, fill: COLORS.healthy }}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="severity" className="h-80">
          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-1/2 h-64 md:h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(props: any) => {
                      const { name, percent } = props;
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getSeverityColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [`${value} ${value === 1 ? 'issue' : 'issues'}`, name]}
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '0.5rem',
                      borderColor: COLORS.grid,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center pl-0 md:pl-6 mt-4 md:mt-0">
              <h4 className="font-medium mb-3">Severity Distribution</h4>
              <div className="space-y-3">
                {severityData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: getSeverityColor(item.name) }}
                    />
                    <span className="text-sm capitalize">{item.name}</span>
                    <span className="ml-auto text-sm font-medium">{item.value}</span>
                  </div>
                ))}
                {severityData.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No severity data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
