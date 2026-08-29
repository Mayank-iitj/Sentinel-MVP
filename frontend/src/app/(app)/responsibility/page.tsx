"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, FileText, Scale } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export default function ResponsibilityPage() {
  const [compliance, setCompliance] = useState<any[]>([])
  const [biasMetrics, setBiasMetrics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/dashboard/responsibility`)
      .then(res => res.json())
      .then(data => {
        setCompliance(data.compliance || [])
        setBiasMetrics(data.biasMetrics || [])
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
        <h1 className="text-3xl font-bold tracking-tight text-fuchsia-400 flex items-center">
          <Users className="mr-3 h-8 w-8" /> AI Responsibility
        </h1>
        <p className="text-[hsl(var(--muted-foreground))]">Monitor compliance, fairness, and safety across all AI interactions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-fuchsia-400" /> Regulatory Compliance
            </CardTitle>
            <CardDescription>Automated auditing against global standards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {compliance.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="font-medium">{c.standard}</span>
                  <Badge variant={c.status === 'Compliant' ? 'default' : 'destructive'}>{c.status}</Badge>
                </div>
                <Progress value={c.score} className={c.score > 90 ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
                <Scale className="w-5 h-5 mr-2 text-fuchsia-400" /> Fairness & Bias Monitors
            </CardTitle>
            <CardDescription>Live detection of skewed model behaviors.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">Loading metrics...</div>
            ) : (
              <div className="overflow-hidden rounded-md border border-[hsl(var(--border))]">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-[#050505] border-b border-[hsl(var(--border))]">
                          <tr>
                              <th className="px-4 py-3 text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Category</th>
                              <th className="px-4 py-3 text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Severity</th>
                              <th className="px-4 py-3 text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Incidents (30d)</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-[hsl(var(--border))]">
                          {biasMetrics.map((b, i) => (
                              <tr key={i} className="hover:bg-[hsl(var(--accent))] transition-colors">
                                  <td className="px-4 py-3 font-medium">{b.category}</td>
                                  <td className="px-4 py-3">
                                      <Badge variant={b.severity === 'Low' ? 'outline' : 'warning'}>{b.severity}</Badge>
                                  </td>
                                  <td className="px-4 py-3 font-mono text-[hsl(var(--muted-foreground))]">{b.value}</td>
                              </tr>
                          ))}
                          {biasMetrics.length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))]">No bias metrics reported.</td>
                            </tr>
                          )}
                      </tbody>
                  </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
