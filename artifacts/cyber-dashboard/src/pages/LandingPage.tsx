import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Shield, ArrowRight, ShieldCheck, Lock, Eye, Terminal, Activity, ChevronRight, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1220] text-foreground overflow-x-hidden selection:bg-primary/30">
      {/* Navbar */}
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        scrolled ? "bg-[#0B1220]/90 backdrop-blur-xl border-primary/10 py-3" : "bg-transparent border-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/30 flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-primary/20 blur group-hover:bg-primary/40 transition-colors rounded-xl"></div>
              <Shield className="w-6 h-6 text-primary relative z-10" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">CyberVault</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted-foreground">
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            <a href="#intelligence" className="hover:text-white transition-colors">Intelligence</a>
            <a href="#defense" className="hover:text-white transition-colors">Active Defense</a>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold hover:text-white transition-colors hidden sm:block">Operator Login</Link>
            <Link href="/register" className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              Request Clearance
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+CjxwYXRoIGQ9Ik0wIDBoODB2ODBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMjBoODBNMCA0MGg4ME0wIDYwaDgwTTIwIDB2ODBkTTQwIDB2ODBNNjAgMHY4MCIgc3Ryb2tlPSJyZ2JhKDU5LCAxMzAsIDI0NiwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-50" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold tracking-widest mb-6 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                SYSTEM OMEGA IS ONLINE
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
                Absolute <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  Network Superiority.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 font-medium">
                The apex command center for elite security operations. Real-time telemetry, automated threat neutralization, and total visibility across your global infrastructure.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-black text-sm tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(59,130,246,0.4)] group">
                  INITIALIZE CONSOLE
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#platform" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center">
                  VIEW SCHEMATICS
                </a>
              </div>
            </div>

            {/* Right Visual (Radar/Scanner Concept) */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none relative aspect-square">
              {/* Central Core */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-dashed animate-[spin_20s_linear_infinite]"></div>
                  <div className="absolute inset-4 rounded-full border-2 border-cyan-400/20 border-dotted animate-[spin_15s_linear_reverse_infinite]"></div>
                  <div className="absolute inset-12 rounded-full border border-primary/40 bg-primary/5 backdrop-blur-sm flex items-center justify-center">
                    <Shield className="w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                  </div>
                  
                  {/* Radar Sweep Line */}
                  <div className="absolute top-1/2 left-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent origin-left animate-[spin_4s_linear_infinite] shadow-[0_0_15px_rgba(6,182,212,0.8)]" style={{ zIndex: 2 }}></div>
                  
                  {/* Blips */}
                  <div className="absolute top-8 left-12 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-ping"></div>
                  <div className="absolute bottom-16 right-10 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-pulse delay-100"></div>
                  <div className="absolute top-1/2 right-4 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse delay-300"></div>
                </div>
              </div>
              
              {/* Floating Data Cards */}
              <div className="absolute top-10 right-0 glass-card p-4 rounded-xl border border-red-500/30 animate-bounce duration-[3000ms] shadow-[0_0_20px_rgba(239,68,68,0.15)] bg-[#111827]/90 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-xs font-mono font-bold text-red-500">INTRUSION DETECTED</span>
                </div>
                <p className="text-white text-sm font-bold">Brute Force Attack</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">IP: 192.168.1.104</p>
              </div>
              
              <div className="absolute bottom-20 left-0 glass-card p-4 rounded-xl border border-green-500/30 animate-bounce duration-[4000ms] delay-500 shadow-[0_0_20px_rgba(34,197,94,0.15)] bg-[#111827]/90 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-mono font-bold text-green-500">THREAT NEUTRALIZED</span>
                </div>
                <p className="text-white text-sm font-bold">Auto-Isolation Active</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">0.4s response time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="border-y border-primary/10 bg-black/40 backdrop-blur-sm relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-primary/10">
            {[
              { label: "Data Analyzed / Day", value: "4.2 PB" },
              { label: "Avg Response Time", value: "0.8s" },
              { label: "Threats Blocked", value: "99.9%" },
              { label: "Global Nodes", value: "14,000+" }
            ].map((metric, i) => (
              <div key={i} className="text-center px-4">
                <div className="text-3xl font-black font-mono text-white tracking-tight">{metric.value}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="platform" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Tactical Capabilities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Engineered for security operation centers that demand uncompromised performance and total authority over their digital airspace.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Omniscient Visibility</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Correlate telemetry across endpoints, network traffic, and cloud infrastructure into a single unified battle-space view.
              </p>
            </div>
            
            <div className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Predictive Intelligence</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Machine learning models continuously analyze behavioral patterns to identify zero-day threats before traditional signatures catch them.
              </p>
            </div>
            
            <div className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
                <Lock className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Autonomous Defense</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Programmable response playbooks instantly isolate compromised assets and sever malicious connections without human intervention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal Preview Section */}
      <section className="py-24 bg-black/60 border-y border-primary/10 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
          
          <div className="flex-1 w-full relative">
            <div className="rounded-xl overflow-hidden border border-primary/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-[#0A0E17]">
              <div className="h-10 bg-[#111827] border-b border-primary/10 flex items-center px-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="mx-auto text-xs font-mono text-muted-foreground">operator@cybervault:~</div>
              </div>
              <div className="p-6 font-mono text-sm leading-relaxed text-muted-foreground/80 min-h-[300px]">
                <p><span className="text-green-500">➜</span> <span className="text-cyan-400">~</span> ./cybervault init --mode=tactical</p>
                <p className="text-white mt-2">Initializing defense matrix...</p>
                <p>[OK] Connecting to global telemetry network</p>
                <p>[OK] Loading behavioral baselines (v4.9.2)</p>
                <p>[OK] Arming response playbooks</p>
                <br/>
                <p className="text-red-400">[ALERT] Anomalous traffic pattern detected on node_0x4f</p>
                <p>Analyzing packet headers...</p>
                <p className="text-white">Match found: MITRE ATT&CK T1059.001</p>
                <br/>
                <p><span className="text-green-500">➜</span> <span className="text-cyan-400">~</span> execute playbook isolate_node node_0x4f</p>
                <p className="text-green-400">[SUCCESS] Target node isolated. Threat neutralized.</p>
                <p className="mt-4"><span className="text-green-500">➜</span> <span className="text-cyan-400">~</span> <span className="animate-pulse">_</span></p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 lg:pl-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest mb-6">
              <Terminal className="w-4 h-4" /> Power User Ready
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tight">GUI Optional.</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              While the dashboard provides comprehensive visual analysis, the entire platform can be driven via our CLI tool and REST API. Integrate CyberVault directly into your existing CI/CD pipelines and infrastructure as code workflows.
            </p>
            <ul className="space-y-4 mb-8">
              {['Full API parity with the web interface', 'Webhook integrations for Slack/PagerDuty', 'Export telemetry to SIEM solutions'].map((item, i) => (
                <li key={i} className="flex items-center text-white font-medium">
                  <ChevronRight className="w-5 h-5 text-primary mr-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <Shield className="w-16 h-16 text-primary mx-auto mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Ready to take control?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join elite security teams defending critical infrastructure worldwide.
          </p>
          <Link href="/register" className="inline-flex items-center justify-center px-10 py-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-black tracking-widest text-sm transition-all shadow-[0_0_30px_rgba(59,130,246,0.4)] group hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:-translate-y-1">
            REQUEST SYSTEM ACCESS
            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 bg-black/80 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-lg font-black tracking-tight text-white">CyberVault</span>
          </div>
          <div className="flex gap-6 text-sm font-bold text-muted-foreground">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">API Reference</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            © {new Date().getFullYear()} CyberVault Security Systems.
          </p>
        </div>
      </footer>
    </div>
  );
}