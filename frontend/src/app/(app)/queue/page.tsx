"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

function QueueContent() {
  const searchParams = useSearchParams()
  const incidentId = searchParams.get('incident')
  
  const [incident, setIncident] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!incidentId) {
      setLoading(false)
      return
    }
    
    fetch(`http://localhost:8000/api/v1/incidents/${incidentId}`)
      .then(res => res.json())
      .then(data => {
        setIncident(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [incidentId])

  const handleVerdict = async (verdict: 'APPROVED' | 'REJECTED') => {
    if (!incident || !incident.reviews?.[0]?.id) return
    
    setSubmitting(true)
    try {
      const res = await fetch(`http://localhost:8000/api/v1/reviews/${incident.reviews[0].id}/verdict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verdict })
      })
      if (res.ok) {
        setIncident({ ...incident, status: verdict === 'APPROVED' ? 'RESOLVED' : 'OPEN' })
      }
    } catch (e) {
      console.error(e)
    }
    setSubmitting(false)
  }

  if (loading) return <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">Loading...</div>

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-dashed border-[hsl(var(--border))] rounded-md">
        <Clock className="w-10 h-10 text-[hsl(var(--muted-foreground))] mb-4" />
        <h3 className="text-lg font-medium">Review Queue is Empty</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Select an incident from the Incidents page to review.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Incident Details</span>
              <Badge variant={incident.severity === 'CRITICAL' ? 'destructive' : 'warning'}>{incident.severity}</Badge>
            </CardTitle>
            <CardDescription>ID: {incident.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase mb-1">User Prompt</div>
              <div className="p-3 bg-[hsl(var(--accent))] border border-[hsl(var(--border))] rounded-md font-mono text-sm">
                {incident.trace?.request || 'No prompt recorded'}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase mb-1">Model Response (Intercepted)</div>
              <div className="p-3 bg-[#0a0a0a] border border-red-900/30 rounded-md font-mono text-sm text-red-200">
                {incident.trace?.response || 'No response recorded'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Human Verdict</CardTitle>
            <CardDescription>Determine if Sentinel correctly flagged this.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-md">
              <div className="font-medium text-sm text-red-400 mb-1">Detector Triggered: {incident.category}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Review the evidence and provide a verdict.</div>
            </div>
            
            {incident.status === 'RESOLVED' && (
              <div className="p-3 bg-green-950/20 border border-green-900/50 rounded-md text-green-400 text-sm font-medium">
                Review completed. Incident resolved.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex space-x-3">
            <Button 
              className="flex-1 bg-green-700 hover:bg-green-600 text-white" 
              onClick={() => handleVerdict('APPROVED')}
              disabled={submitting || incident.status === 'RESOLVED'}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Flag Correct
            </Button>
            <Button 
              variant="outline"
              className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-950/30"
              onClick={() => handleVerdict('REJECTED')}
              disabled={submitting || incident.status === 'RESOLVED'}
            >
              <XCircle className="mr-2 h-4 w-4" /> False Positive
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function QueuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review Queue</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Human-in-the-loop oversight for escalated events.</p>
      </div>
      <Suspense fallback={<div className="text-[hsl(var(--muted-foreground))]">Loading...</div>}>
        <QueueContent />
      </Suspense>
    </div>
  )
}
