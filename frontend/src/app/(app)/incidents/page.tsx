"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/incidents')
      .then(res => res.json())
      .then(data => {
        setIncidents(data.items || [])
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
        <h1 className="text-3xl font-bold tracking-tight text-red-400 flex items-center">
          <AlertTriangle className="mr-3 h-8 w-8" /> Incident Explorer
        </h1>
        <p className="text-[hsl(var(--muted-foreground))]">Manage and review critical AI interceptions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>Escalated events requiring human review.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">Loading incidents...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[hsl(var(--muted-foreground))] uppercase bg-[#0a0a0a] border-b border-[hsl(var(--border))]">
                  <tr>
                    <th className="px-6 py-3">Incident ID</th>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Route</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Severity</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">{incident.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-[hsl(var(--muted-foreground))]">{new Date(incident.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 font-medium">{incident.route}</td>
                      <td className="px-6 py-4">{incident.category}</td>
                      <td className="px-6 py-4">
                        <Badge variant={incident.severity === 'CRITICAL' ? 'destructive' : incident.severity === 'HIGH' ? 'warning' : 'secondary'}>
                          {incident.severity}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={incident.status === 'OPEN' ? 'destructive' : 'outline'}>
                          {incident.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/queue?incident=${incident.id}`}>
                          <Button size="sm" variant={incident.status === 'OPEN' ? 'default' : 'outline'}>
                            {incident.status === 'OPEN' ? 'Review' : 'View'}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {incidents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-[hsl(var(--muted-foreground))]">No incidents found.</td>
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
