"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TracesPage() {
  const [traces, setTraces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/traces')
      .then(res => res.json())
      .then(data => {
        setTraces(data.items || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trace Explorer</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Search and filter historical AI interactions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Traces</CardTitle>
          <CardDescription>Viewing the last 50 processed requests.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">Loading traces...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[hsl(var(--muted-foreground))] uppercase bg-[#0a0a0a] border-b border-[hsl(var(--border))]">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Route</th>
                    <th className="px-6 py-3">Model</th>
                    <th className="px-6 py-3">Risk Score</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {traces.map((trace) => (
                    <tr key={trace.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap text-[hsl(var(--muted-foreground))]">{new Date(trace.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 font-medium">{trace.route}</td>
                      <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">{trace.model}</td>
                      <td className="px-6 py-4 font-medium">
                        <span className={trace.risk_score < 70 ? 'text-red-500' : 'text-green-500'}>
                          {trace.risk_score.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={trace.action === "BLOCK" ? "destructive" : trace.action === "EDIT" ? "warning" : "outline"}>
                          {trace.action}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {traces.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-[hsl(var(--muted-foreground))]">No traces found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
