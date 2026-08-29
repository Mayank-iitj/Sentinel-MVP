"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, ShieldAlert, DollarSign, ListOrdered, CheckCircle2, TrendingUp, AlertTriangle, PlayCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Button } from '@/components/ui/button'
import Orb from '@/components/Orb'

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null)
  const [timeseries, setTimeseries] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [liveFeed, setLiveFeed] = useState<any[]>([])
  const [simulating, setSimulating] = useState(false)
  const [simulatingIncident, setSimulatingIncident] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`${NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/dashboard/summary`).then(res => res.json()),
      fetch(`${NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/dashboard/timeseries`).then(res => res.json())
    ]).then(([summaryData, timeseriesData]) => {
      setSummary(summaryData)
      setTimeseries(timeseriesData)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })

    const ws = new WebSocket(`${NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/api/v1/dashboard/live`)
    ws.onmessage = (event) => {
      const newEvent = JSON.parse(event.data)
      setLiveFeed(prev => [newEvent, ...prev].slice(0, 50)) // Keep last 50
    }
    
    // Fallback initial data
    setLiveFeed([
      { route: "/support/refund", model: "gpt-style-premium", action: "EDIT", finding: "PII detected", risk: "HIGH", time: "2m ago" },
      { route: "/internal/search", model: "claude-style-model", action: "BLOCK", finding: "Unauthorized document", risk: "CRITICAL", time: "5m ago" }
    ])

    return () => ws.close()
  }, [])

  const runSimulation = async () => {
    setSimulating(true)
    const scenarios = ["safe", "safe", "safe", "pii_leak", "safe"]
    for (let i = 0; i < 10; i++) {
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)]
      try {
        await fetch(`${NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/intercept`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            application: "LiveDemo",
            route: `/api/v1/chat/${Math.floor(Math.random() * 100)}`,
            user_id: `user_${Math.floor(Math.random() * 1000)}`,
            user_clearance: "PUBLIC",
            prompt: "Simulated traffic...",
            simulate_scenario: scenario === "safe" ? null : scenario
          })
        })
      } catch (e) {
        console.error(e)
      }
      await new Promise(r => setTimeout(r, 300)) // delay between requests
    }
    setSimulating(false)
    // Refresh stats
    fetch(`${NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/dashboard/summary`).then(res => res.json()).then(setSummary)
  }

  const runIncident = async () => {
    setSimulatingIncident(true)
    try {
      await fetch(`${NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/intercept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application: "LiveDemo",
          route: `/internal/admin`,
          user_id: `admin_user`,
          user_clearance: "PUBLIC",
          prompt: "Simulated signature incident...",
          simulate_scenario: "cc_leak"
        })
      })
    } catch (e) {
      console.error(e)
    }
    setSimulatingIncident(false)
    fetch(`${NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/dashboard/summary`).then(res => res.json()).then(setSummary)
  }

  if (loading) return <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">Loading Sentinel Dashboard...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Control Tower</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Live AI infrastructure observability and risk interception.</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={runSimulation} disabled={simulating} variant="outline" className="text-emerald-400 border-emerald-900 bg-emerald-950/20 hover:bg-emerald-900/30">
            <PlayCircle className="mr-2 h-4 w-4" /> {simulating ? "Simulating..." : "Start Live Simulation"}
          </Button>
          <Button onClick={runIncident} disabled={simulatingIncident} variant="outline" className="text-indigo-400 border-indigo-900 bg-indigo-950/20 hover:bg-indigo-900/30">
            <AlertTriangle className="mr-2 h-4 w-4" /> {simulatingIncident ? "Triggering..." : "Replay Signature Incident"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <KPICard title="AI Traffic" value={summary?.total_calls.toLocaleString() || '1.02M'} subtitle="calls" icon={<Activity />} />
        <KPICard title="Coverage" value={summary?.coverage || '100%'} subtitle="all routes protected" icon={<CheckCircle2 />} />
        <KPICard title="Risk Interceptions" value={summary?.risk_interceptions.toLocaleString() || '30,412'} subtitle="responses blocked/edited" icon={<ShieldAlert className="text-amber-500" />} />
        <KPICard title="Cost Index" value={summary?.cost_index || '1.14×'} subtitle="vs baseline model" icon={<DollarSign />} />
        <KPICard title="Open Issues" value={summary?.open_issues.toLocaleString() || '3'} subtitle="requires review" icon={<ListOrdered />} />
        <KPICard title="Route Health" value={summary?.route_health || '98.2%'} subtitle="within thresholds" icon={<TrendingUp />} />
      </div>

      <div className="w-full h-[300px] relative rounded-xl overflow-hidden border border-[hsl(var(--border))]">
         <Orb hoverIntensity={0.5} rotateOnHover={true} hue={250} forceHoverState={false} backgroundColor="#000000" />
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <h2 className="text-4xl font-bold text-white opacity-80 mix-blend-overlay">Sentinel Core</h2>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Live Traffic & Risk Distribution</CardTitle>
            <CardDescription>Request volume across all models and environments.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {timeseries && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeseries.traffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                  <Area type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Live Activity Feed</CardTitle>
            <CardDescription>Real-time intercept stream.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto pr-2 space-y-4 custom-scrollbar">
            {liveFeed.map((item, i) => (
              <FeedItem key={i} {...item} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KPICard({ title, value, subtitle, icon }: any) {
  return (
    <Card>
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{title}</p>
          <div className="text-[hsl(var(--muted-foreground))] opacity-50">{icon}</div>
        </div>
        <div>
          <h3 className="text-2xl font-bold tracking-tight mb-1">{value}</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function FeedItem({ route, model, action, finding, risk, time }: any) {
  let badgeVariant: any = "default"
  if (action === "BLOCK") badgeVariant = "destructive"
  if (action === "EDIT") badgeVariant = "warning"
  if (action === "OBSERVE" && risk === "SAFE") badgeVariant = "outline"
  
  return (
    <div className="flex items-start justify-between border-b border-[hsl(var(--border))] pb-3 last:border-0 last:pb-0">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{route}</span>
          <Badge variant={badgeVariant}>{action}</Badge>
        </div>
        <div className="text-xs text-[hsl(var(--muted-foreground))] flex items-center space-x-2">
          <span>{model}</span>
          <span>•</span>
          <span className={risk === 'CRITICAL' ? 'text-red-500 font-medium' : risk === 'HIGH' ? 'text-orange-500 font-medium' : ''}>{finding}</span>
        </div>
      </div>
      <div className="text-xs text-[hsl(var(--muted-foreground))]">{time}</div>
    </div>
  )
}
