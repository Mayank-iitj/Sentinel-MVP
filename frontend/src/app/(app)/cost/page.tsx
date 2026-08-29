"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Cpu } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

import { useEffect, useState } from 'react'

export default function CostPage() {
  const [costData, setCostData] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/dashboard/cost`)
      .then(res => res.json())
      .then(data => {
        setCostData(data.costData || [])
        setModels(data.models || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">Loading cost metrics...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-amber-400 flex items-center">
          <DollarSign className="mr-3 h-8 w-8" /> Models & Cost
        </h1>
        <p className="text-[hsl(var(--muted-foreground))]">Track token consumption and infrastructure overhead.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Spend Over Time</CardTitle>
            <CardDescription>Provider API cost vs Sentinel Processing cost.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProvider" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSentinel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                <Area type="monotone" dataKey="providerCost" stroke="#fbbf24" fillOpacity={1} fill="url(#colorProvider)" name="LLM Provider Cost" />
                <Area type="monotone" dataKey="sentinelCost" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSentinel)" name="Sentinel Overhead" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Model Utilization</CardTitle>
            <CardDescription>Active models in your network.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {models.map((m, i) => (
                <div key={i} className="flex flex-col p-4 bg-[#050505] rounded-md border border-[hsl(var(--border))]">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-sm flex items-center">
                        <Cpu className="w-4 h-4 mr-2 text-[hsl(var(--muted-foreground))]" /> {m.name}
                    </div>
                    <Badge variant="outline">{m.provider}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                    <div>
                        <div className="uppercase tracking-wider opacity-50 mb-1">Usage</div>
                        <div className="text-white font-medium">{m.usage}</div>
                    </div>
                    <div>
                        <div className="uppercase tracking-wider opacity-50 mb-1">Tokens</div>
                        <div className="text-white font-medium">{m.tokens}</div>
                    </div>
                    <div>
                        <div className="uppercase tracking-wider opacity-50 mb-1">Cost</div>
                        <div className="text-white font-medium">{m.cost}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
