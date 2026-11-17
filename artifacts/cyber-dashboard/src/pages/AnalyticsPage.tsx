import React, { useState } from 'react';
import { useGetThreatHeatmap, useGetThreatTrends, useGetAttackDistribution, useGetNetworkTraffic, useGetDeviceHealth, useGetSecurityScore } from '@workspace/api-client-react';
import type { GetNetworkTrafficPeriod } from '@workspace/api-client-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThreatHeatmap } from '@/components/charts/ThreatHeatmap';
import { ThreatTrendsChart } from '@/components/charts/ThreatTrendsChart';
import { AttackDistributionChart } from '@/components/charts/AttackDistributionChart';
import { NetworkTrafficChart } from '@/components/charts/NetworkTrafficChart';
import { DeviceHealthChart } from '@/components/charts/DeviceHealthChart';
import { SecurityScoreGauge } from '@/components/charts/SecurityScoreGauge';
import { Activity, AlertTriangle, ShieldCheck, Target, Radio, Globe } from 'lucide-react';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<GetNetworkTrafficPeriod>('7d');
  const { data: heatmapData, isLoading: heatmapLoading, isError: heatmapError } = useGetThreatHeatmap();
  const { data: threatTrends, isLoading: trendsLoading, isError: trendsError } = useGetThreatTrends({ period: '30d' });
  const { data: attackDistribution, isLoading: attackLoading, isError: attackError } = useGetAttackDistribution();
  const { data: networkTraffic, isLoading: networkLoading, isError: networkError } = useGetNetworkTraffic({ period });
  const { data: deviceHealth, isLoading: healthLoading, isError: healthError } = useGetDeviceHealth();
  const { data: scoreData, isLoading: scoreLoading, isError: scoreError } = useGetSecurityScore();

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Intelligence & Analytics</h1>
            <p className="text-muted-foreground mt-1">Deep dive into security telemetry and risk patterns.</p>
          </div>

        </div>

        {(heatmapError || trendsError || attackError || networkError || healthError || scoreError) && (
          <p role="alert" className="text-sm text-amber-400">Some analytics could not load. Refresh to try again.</p>
        )}

        {/* Row 1: Heatmap */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center">
              <Target className="w-5 h-5 mr-2 text-cyan-400" />
              Temporal Threat Distribution (7 Days)
            </h3>
          </div>
          <ThreatHeatmap data={heatmapData} isLoading={heatmapLoading} />
        </div>

        {/* Row 2: Trends and Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-red-400" />
              Threat Velocity
            </h3>
            <ThreatTrendsChart data={threatTrends} isLoading={trendsLoading} />
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
              Attack Distribution
            </h3>
            <AttackDistributionChart data={attackDistribution} isLoading={attackLoading} />
          </div>
        </div>

        {/* Row 3: Network and Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-400" />
                Network Throughput (Simulated)
              </h3>
              <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-primary/10">
                {(['1h', '24h', '7d', '30d'] as const).map(option => (
                  <button type="button" key={option} onClick={() => setPeriod(option)} aria-pressed={option === period} className={`px-2 py-1 text-xs font-bold rounded ${option === period ? 'bg-primary text-white' : 'text-muted-foreground hover:text-white'}`}>
                    {option.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <NetworkTrafficChart data={networkTraffic} isLoading={networkLoading} />
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <Radio className="w-5 h-5 mr-2 text-green-400" />
              Endpoint Fleet Health
            </h3>
            <DeviceHealthChart data={deviceHealth} isLoading={healthLoading} />
          </div>
        </div>

        {/* Row 4: Security Posture Deep Dive */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center border-b border-primary/10 pb-4">
            <ShieldCheck className="w-5 h-5 mr-2 text-primary" />
            Security Posture Breakdown
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-1">
              <SecurityScoreGauge data={scoreData} isLoading={scoreLoading} />
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scoreLoading ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-primary/10 animate-pulse rounded-xl"></div>)
              ) : scoreData?.factors?.map((factor, i) => (
                <div key={i} className="p-4 rounded-xl bg-black/20 border border-primary/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm">{factor.name}</span>
                    <span className="font-mono font-bold text-primary">{factor.score}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full ${factor.score > 80 ? 'bg-green-500' : factor.score > 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                      style={{ width: `${factor.score}%` }} 
                    />
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>Weight: {factor.weight}%</span>
                    <span className={factor.status === 'optimal' ? 'text-green-500' : 'text-amber-500'}>{factor.status || 'Active'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}