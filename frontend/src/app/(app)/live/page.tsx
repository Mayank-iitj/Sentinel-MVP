"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LiveTrafficPage() {
  const [liveFeed, setLiveFeed] = useState<any[]>([])

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/api/v1/dashboard/live')
    ws.onmessage = (event) => {
      const newEvent = JSON.parse(event.data)
      setLiveFeed(prev => [newEvent, ...prev].slice(0, 100))
    }
    
    // Initial mock data
    const mock = []
    for(let i=0; i<20; i++) {
        mock.push({
            route: i % 3 === 0 ? "/internal/search" : "/support/chat",
            model: "gpt-4",
            action: i % 7 === 0 ? "BLOCK" : "OBSERVE",
            finding: i % 7 === 0 ? "PII Detected" : "Safe",
            risk: i % 7 === 0 ? "HIGH" : "SAFE",
            time: "Just now",
            trace_id: `req_${Math.random().toString(36).substring(7)}`
        })
    }
    setLiveFeed(mock)

    return () => ws.close()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400 flex items-center">
            <Activity className="mr-3 h-8 w-8 animate-pulse" /> Live Firehose
          </h1>
          <p className="text-[hsl(var(--muted-foreground))]">Real-time streaming view of all AI interactions across the network.</p>
        </div>
        <div>
            <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter Stream</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Traffic Stream</CardTitle>
          <CardDescription>Showing the last 100 requests in real-time.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[hsl(var(--muted-foreground))] uppercase bg-[#0a0a0a] border-b border-[hsl(var(--border))]">
                  <tr>
                    <th className="px-6 py-3">Trace ID</th>
                    <th className="px-6 py-3">Route</th>
                    <th className="px-6 py-3">Model</th>
                    <th className="px-6 py-3">Risk Level</th>
                    <th className="px-6 py-3">Action Taken</th>
                    <th className="px-6 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {liveFeed.map((item, i) => (
                    <tr key={i} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors">
                      <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">{item.trace_id || `req_${Math.random().toString(36).substring(7)}`}</td>
                      <td className="px-6 py-4 text-blue-400">{item.route}</td>
                      <td className="px-6 py-4">{item.model}</td>
                      <td className="px-6 py-4">
                        <span className={item.risk === 'SAFE' ? 'text-green-500' : 'text-red-500 font-bold'}>{item.risk}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={item.action === 'BLOCK' ? 'destructive' : item.action === 'EDIT' ? 'warning' : 'outline'}>{item.action}</Badge>
                      </td>
                      <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
