"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

import { useEffect, useState } from 'react'

export default function RiskExplorerPage() {
  const [vulnerabilityData, setVulnerabilityData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/dashboard/risk')
      .then(res => res.json())
      .then(data => {
        setVulnerabilityData(data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const policies = [
    { name: "Strict PII Redaction", status: "Active", impact: "High", routes: "All" },
    { name: "Toxicity Filter (Hate Speech)", status: "Active", impact: "Critical", routes: "Publicly Facing" },
    { name: "System Prompt Lock", status: "Active", impact: "High", routes: "/internal/admin" },
    { name: "Competitor Mention Alert", status: "Observation Mode", impact: "Low", routes: "/sales/chat" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-red-400 flex items-center">
          <Shield className="mr-3 h-8 w-8" /> Risk Explorer
        </h1>
        <p className="text-[hsl(var(--muted-foreground))]">Deep dive into vulnerabilities, policy enforcement, and AI security posture.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-[hsl(var(--muted-foreground))]">Loading risk metrics...</div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vulnerability Distribution</CardTitle>
            <CardDescription>Breakdown of intercepted risks over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vulnerabilityData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                <XAxis type="number" stroke="#666" fontSize={12} />
                <YAxis dataKey="category" type="category" stroke="#666" fontSize={12} width={100} />
                <Tooltip cursor={{fill: '#222'}} contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                <Bar dataKey="incidents" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Security Policies</CardTitle>
            <CardDescription>Currently enforced organizational policies.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {policies.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#050505] rounded-md border border-[hsl(var(--border))]">
                  <div>
                    <div className="font-semibold text-sm">{p.name}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Routes: {p.routes}</div>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="outline">{p.impact} Impact</Badge>
                    <Badge variant={p.status === 'Active' ? 'default' : 'secondary'}>{p.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  )
}
