"use client"

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'
import clsx from 'clsx'
import { Shield, Zap, Lock, Brain, ArrowRight, PlayCircle, Database, Cloud, Cpu, Server, Globe, Activity, Code, Network, MessageCircle, Code2, Briefcase, Mail } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import Orb from '@/components/Orb'
import FlowingMenu from '@/components/FlowingMenu'
import MagicBento from '@/components/MagicBento'
import DriftWall from '@/components/DriftWall'
import AccordionGallery from '@/components/AccordionGallery'
import InfiniteSpiral from '@/components/InfiniteSpiral'
import LogoLoop from '@/components/LogoLoop'

const integrationLogos = [
  { node: <Database className="w-8 h-8 text-white/70" />, title: "Database" },
  { node: <Cloud className="w-8 h-8 text-white/70" />, title: "Cloud Services" },
  { node: <Cpu className="w-8 h-8 text-white/70" />, title: "AI Models" },
  { node: <Server className="w-8 h-8 text-white/70" />, title: "Backend Infrastructure" },
  { node: <Globe className="w-8 h-8 text-white/70" />, title: "Edge Network" },
  { node: <Activity className="w-8 h-8 text-white/70" />, title: "Observability" },
  { node: <Code className="w-8 h-8 text-white/70" />, title: "Dev Frameworks" },
  { node: <Zap className="w-8 h-8 text-white/70" />, title: "Fast API" },
  { node: <Network className="w-8 h-8 text-white/70" />, title: "Mesh Networks" },
];

const demoItems = [
  { link: '#', text: 'Fast Lane', image: 'https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=600&h=400&fit=crop&sat=-100&auto=format' },
  { link: '#', text: 'Live Feed', image: 'https://images.unsplash.com/photo-1781499455083-6ccc3beb20cd?q=80&w=600&h=400&fit=crop&sat=-100&auto=format' },
  { link: '#', text: 'Oversight', image: 'https://images.unsplash.com/photo-1776394254711-4a0d7345269a?q=80&w=600&h=400&fit=crop&sat=-100&auto=format' },
  { link: '#', text: 'Security', image: 'https://images.unsplash.com/photo-1781242629922-6f39cc3671cd?q=80&w=600&h=400&fit=crop&sat=-100&auto=format' }
];

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.1, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }
  })
}

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LandingPage() {
  const targetRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-indigo-500" />
            <span className="text-xl font-bold tracking-tight">Sentinel</span>
          </div>
          <div className="flex space-x-6 items-center">
            <Link href="/playground" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Playground</Link>
            <Link href="/dashboard" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={targetRef} className="relative pt-48 pb-32 flex items-center justify-center min-h-[90vh]">
        <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent z-10 pointer-events-none" />
          <Orb hoverIntensity={0.5} rotateOnHover={true} hue={250} forceHoverState={false} backgroundColor="#000000" />
        </motion.div>
        
        <div className="max-w-5xl mx-auto px-6 text-center z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-6"
          >

            
            <motion.h1 variants={fadeIn} custom={1} className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
              AI Oversight is a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Post-Mortem.</span><br />
              We Make it <span className="text-white">Live.</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} custom={2} className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
              A model-agnostic AI oversight layer that sits between your application and any LLM. Evaluate, redact, and block risks before they reach your users.
            </motion.p>
            
            <motion.div variants={fadeIn} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors flex items-center justify-center group">
                Enter Control Tower
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/playground" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-medium hover:bg-white/10 transition-colors flex items-center justify-center">
                <PlayCircle className="mr-2 w-4 h-4" /> Try Playground
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Integration Logos */}
      <section className="bg-black relative border-t border-white/5 py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center mb-8">
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest">Integrates with your entire stack</p>
        </div>
        <LogoLoop
          logos={integrationLogos}
          speed={60}
          direction="left"
          logoHeight={32}
          gap={60}
          hoverSpeed={0}
          scaleOnHover
          fadeOut
          fadeOutColor="#000000"
          ariaLabel="Technology integrations"
        />
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 bg-black relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Complete Oversight Pipeline</h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">Everything you need to secure and monitor AI interactions in production.</p>
          </motion.div>

          <MagicBento 
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            glowColor="132, 0, 255"
          />
        </div>
      </section>

      {/* Platform Capabilities Accordion */}
      <section className="bg-black relative border-t border-white/5 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Platform Capabilities</h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg">Explore the core features of Sentinel.</p>
        </div>
        <div className="max-w-5xl mx-auto px-6">
          <AccordionGallery
            defaultIndex={0}
            expandRatio={0.52}
            trigger="hover"
          />
        </div>
      </section>

      {/* Integrations Drift Wall */}
      <section className="bg-black relative border-t border-white/5 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Millions of Traces Monitored</h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg">See the live scale of Sentinel across our network.</p>
        </div>
        <div style={{ height: '600px', width: '100%', position: 'relative' }}>
          <DriftWall
            columns={5}
            tileWidth={200}
            tileHeight={132}
            gap={18}
            tilt={16}
            turn={-14}
            perspective={1200}
            depth={120}
            speed={42}
            direction="up"
            variance={0.45}
            parallax={0.6}
            lift={64}
            fade={0.6}
            dim={0.55}
            overlayColor="#060010"
          />
        </div>
      </section>

      {/* 360 Security Infinite Spiral */}
      <section className="bg-black relative border-t border-white/5 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">360° Security Coverage</h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg">Every vector, perfectly secured.</p>
        </div>
        <div style={{ height: '600px', width: '100%', position: 'relative', overflow: 'hidden' }}>
          <InfiniteSpiral
            animationMode="all"
            speed={0.55}
            radius={170}
            cardWidth={150}
            cardHeight={150}
            verticalSpacing={80}
            perspective={1000}
            cardRadius={12}
            centerScale={1.3}
            edgeBlur={8}
            cardsPerTurn={6}
            pauseOnHover
          />
        </div>
      </section>

      {/* Flowing Menu Section */}
      <section className="bg-black relative border-t border-white/5 pt-12 pb-12">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Explore Sentinel</h2>
        </div>
        <div style={{ height: '600px', position: 'relative' }}>
          <FlowingMenu items={demoItems} bgColor="#000000" />
        </div>
      </section>

      {/* High-End Footer */}
      <footer className="relative border-t border-white/10 bg-black pt-24 pb-12 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">Sentinel</span>
              </div>
              <p className="text-white/50 text-sm max-w-sm leading-relaxed">
                The enterprise control plane for modern AI applications. Block risks, monitor costs, and ensure compliance before the first token is generated.
              </p>
              <div className="flex items-center space-x-4 pt-2">
                <Link href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-indigo-400 transition-colors text-white/50">
                  <MessageCircle className="w-4 h-4" />
                </Link>
                <Link href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-indigo-400 transition-colors text-white/50">
                  <Code2 className="w-4 h-4" />
                </Link>
                <Link href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-indigo-400 transition-colors text-white/50">
                  <Briefcase className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-semibold tracking-wide">Platform</h4>
              <ul className="space-y-3">
                <li><Link href="/dashboard" className="text-white/50 hover:text-white transition-colors text-sm">Dashboard</Link></li>
                <li><Link href="/risk" className="text-white/50 hover:text-white transition-colors text-sm">Risk Explorer</Link></li>
                <li><Link href="/cost" className="text-white/50 hover:text-white transition-colors text-sm">Cost Management</Link></li>
                <li><Link href="/traces" className="text-white/50 hover:text-white transition-colors text-sm">Trace Logs</Link></li>
                <li><Link href="/playground" className="text-white/50 hover:text-indigo-400 transition-colors text-sm flex items-center">Playground <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">New</span></Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-semibold tracking-wide">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Documentation</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">API Reference</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Security Architecture</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Compliance Center</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Blog</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-semibold tracking-wide">Company</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">About</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Careers</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Contact</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
                <li><Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
            <p className="text-white/40 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Sentinel AI Security. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-white/40">
              <span>System Status: <span className="text-emerald-400 font-medium">All Systems Operational</span></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function BentoCard({ title, desc, icon, className, delay }: { title: string, desc: string, icon: React.ReactNode, className?: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className={cn("p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors group relative overflow-hidden", className)}
    >
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 group-hover:-rotate-12 duration-500">
        {icon}
      </div>
      <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white shadow-inner shadow-white/5">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold tracking-tight mb-3 text-white/90">{title}</h3>
      <p className="text-white/50 leading-relaxed font-light">{desc}</p>
    </motion.div>
  )
}
