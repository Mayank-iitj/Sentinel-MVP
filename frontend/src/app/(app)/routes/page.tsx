"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Route, CheckCircle2, ShieldAlert } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

import { useEffect, useState } from 'react'

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/dashboard/routes`)
      .then(res => res.json())
      .then(data => {
        setRoutes(data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">Loading route metrics...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-400 flex items-center">
          <Route className="mr-3 h-8 w-8" /> Monitored Routes
        </h1>
        <p className="text-[hsl(var(--muted-foreground))]">Application endpoints currently protected by Sentinel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((r, i) => (
          <Card key={i} className="hover:border-blue-500/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-mono">{r.name}</CardTitle>
                <Badge variant={r.health > 95 ? 'default' : 'warning'}>{r.type}</Badge>
              </div>
              <CardDescription>Traffic: {r.traffic}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-[hsl(var(--muted-foreground))] flex items-center"><CheckCircle2 className="w-4 h-4 mr-1 text-green-500" /> Route Health</span>
                  <span className="font-bold">{r.health}%</span>
                </div>
                <Progress value={r.health} className={r.health > 95 ? "[&>div]:bg-green-500" : "[&>div]:bg-yellow-500"} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[hsl(var(--border))]">
                <div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Intercepts</div>
                  <div className="text-xl font-bold flex items-center mt-1">
                    <ShieldAlert className="w-4 h-4 mr-1 text-red-400" /> {r.intercepts}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Avg Latency</div>
                  <div className="text-xl font-bold mt-1 text-[hsl(var(--muted-foreground))]">{r.latency}ms</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
