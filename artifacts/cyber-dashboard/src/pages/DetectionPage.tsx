import { useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import {
  getGetMlHealthQueryKey,
  getGetMlModelInfoQueryKey,
  getListMlAlertsQueryKey,
  useGetMlHealth,
  useGetMlModelInfo,
  useListMlAlerts,
  usePredictThreat,
  useUpdateMlAlertStatus,
  type MlAlert,
  type MlPrediction,
} from '@workspace/api-client-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Cpu,
  Crosshair,
  Play,
  ShieldAlert,
  Siren,
  TriangleAlert,
  WifiOff,
} from 'lucide-react';

import { EvidenceActions } from './EvidenceActions';

const PERCENT_KEYS = new Set(['accuracy', 'weighted_f1', 'macro_f1']);

function formatModelValue(key: string, value: unknown): string {
  if (value == null) return '—';

  if (typeof value === 'number' && PERCENT_KEYS.has(key)) {
    return `${(value * 100).toFixed(2)}%`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return 'none';

    return value
      .map((item) =>
        typeof item === 'object' && item !== null
          ? Object.entries(item as Record<string, unknown>)
              .map(([key, entry]) => `${key}: ${String(entry)}`)
              .join(', ')
          : String(item),
      )
      .join('; ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

const SAMPLE_FLOW = {
  "Destination Port": 80,
  "Flow Duration": 1032460,
  "Total Fwd Packets": 4,
  "Total Backward Packets": 6,
  "Total Length of Fwd Packets": 371,
  "Total Length of Bwd Packets": 11595,
  "Fwd Packet Length Max": 371,
  "Fwd Packet Length Min": 0,
  "Fwd Packet Length Mean": 92.75,
  "Fwd Packet Length Std": 185.5,
  "Bwd Packet Length Max": 4344,
  "Bwd Packet Length Min": 0,
  "Bwd Packet Length Mean": 1932.5,
  "Bwd Packet Length Std": 1754.831473,
  "Flow Bytes/s": 11589.79525,
  "Flow Packets/s": 9.685605253,
  "Flow IAT Mean": 114717.7778,
  "Flow IAT Std": 332033.2882,
  "Flow IAT Max": 999964,
  "Flow IAT Min": 47,
  "Fwd IAT Total": 1016962,
  "Fwd IAT Mean": 338987.3333,
  "Fwd IAT Std": 572471.8076,
  "Fwd IAT Max": 999964,
  "Fwd IAT Min": 992,
  "Bwd IAT Total": 32442,
  "Bwd IAT Mean": 6488.4,
  "Bwd IAT Std": 8783.754254,
  "Bwd IAT Max": 17095,
  "Bwd IAT Min": 47,
  "Fwd PSH Flags": 0,
  "Bwd PSH Flags": 0,
  "Fwd URG Flags": 0,
  "Bwd URG Flags": 0,
  "Fwd Header Length": 144,
  "Bwd Header Length": 200,
  "Fwd Packets/s": 3.874242101,
  "Bwd Packets/s": 5.811363152,
  "Min Packet Length": 0,
  "Max Packet Length": 4344,
  "Packet Length Mean": 1087.818182,
  "Packet Length Std": 1578.775273,
  "Packet Length Variance": 2492531.364,
  "FIN Flag Count": 0,
  "SYN Flag Count": 0,
  "RST Flag Count": 0,
  "PSH Flag Count": 1,
  "ACK Flag Count": 0,
  "URG Flag Count": 0,
  "CWE Flag Count": 0,
  "ECE Flag Count": 0,
  "Down/Up Ratio": 1,
  "Average Packet Size": 1196.6,
  "Avg Fwd Segment Size": 92.75,
  "Avg Bwd Segment Size": 1932.5,
  "Fwd Header Length.1": 144,
  "Fwd Avg Bytes/Bulk": 0,
  "Fwd Avg Packets/Bulk": 0,
  "Fwd Avg Bulk Rate": 0,
  "Bwd Avg Bytes/Bulk": 0,
  "Bwd Avg Packets/Bulk": 0,
  "Bwd Avg Bulk Rate": 0,
  "Subflow Fwd Packets": 4,
  "Subflow Fwd Bytes": 371,
  "Subflow Bwd Packets": 6,
  "Subflow Bwd Bytes": 11595,
  "Init_Win_bytes_forward": 29200,
  "Init_Win_bytes_backward": 235,
  "act_data_pkt_fwd": 1,
  "min_seg_size_forward": 32,
  "Active Mean": 0,
  "Active Std": 0,
  "Active Max": 0,
  "Active Min": 0,
  "Idle Mean": 0,
  "Idle Std": 0,
  "Idle Max": 0,
  "Idle Min": 0
};

const SAMPLE_JSON = JSON.stringify(SAMPLE_FLOW, null, 2);

const riskColor = (score: number) => {
  if (score >= 90) return 'text-red-500';
  if (score >= 75) return 'text-amber-500';
  if (score >= 50) return 'text-yellow-500';
  return 'text-blue-400';
};

const riskBar = (score: number) => {
  if (score >= 90) return 'bg-red-500';
  if (score >= 75) return 'bg-amber-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-blue-500';
};

export default function DetectionPage() {
  const queryClient = useQueryClient();
  const [flowInput, setFlowInput] = useState(SAMPLE_JSON);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<MlPrediction | null>(null);
  const { toast } = useToast();

  // `online: false` is a 503 response, so react-query treats it as an error.
  const health = useGetMlHealth({
    query: { queryKey: getGetMlHealthQueryKey(), retry: false, refetchInterval: 30000 },
  });
  const modelInfo = useGetMlModelInfo({
    query: {
      queryKey: getGetMlModelInfoQueryKey(),
      retry: false,
      enabled: !health.isError,
    },
  });
  const alerts = useListMlAlerts({
    query: { queryKey: getListMlAlertsQueryKey(), retry: false, refetchInterval: 30000 },
  });

  const predictMutation = usePredictThreat({
    mutation: {
      onSuccess: (data) => {
        setResult(data.prediction);
        void queryClient.invalidateQueries({
          predicate: ({ queryKey }) => typeof queryKey[0] === 'string' &&
            ['/api/ml/alerts', '/api/alerts', '/api/analytics/', '/api/logs', '/api/activities']
              .some((prefix) => (queryKey[0] as string).startsWith(prefix)),
        });
        toast({
          title: data.prediction.threat === 'ATTACK' ? 'Threat detected' : 'Traffic classified',
          description: `${data.prediction.threat} · risk ${data.prediction.risk_score}`,
        });
      },
      onError: (error) => {
        toast({
          title: 'ML service error',
          description: (error as Error).message,
        });
      },
    },
  });

  const statusMutation = useUpdateMlAlertStatus({
    mutation: {
      onSuccess: () => {
        alerts.refetch();
        toast({ title: 'Incident updated' });
      },
      onError: (error) => {
        toast({ title: 'Update failed', description: (error as Error).message });
      },
    },
  });

  const online = health.isSuccess && health.data?.online !== false;
  const modelsLoaded = health.data?.models_loaded;
  const canPredict = online && modelsLoaded !== false;
  const missingArtifacts = health.data?.missing_artifacts ?? [];
  const mlAlerts = alerts.data?.alerts ?? [];

  const serviceLabel = useMemo(() => {
    if (health.isLoading) return 'Checking…';
    if (online) return `${health.data?.service ?? 'CyberVault API'} · online`;
    return 'ML service offline';
  }, [health.isLoading, health.data, online]);

  const handlePredict = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(flowInput);
    } catch {
      setParseError('Invalid JSON — fix the syntax and try again.');
      return;
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      setParseError('Flow must be a JSON object, e.g. { "Destination Port": 80, … }');
      return;
    }

    setParseError(null);
    predictMutation.mutate({ data: parsed as Record<string, unknown> });
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
              <BrainCircuit className="w-8 h-8 mr-3 text-primary" />
              ML Threat Detection
            </h1>
            <p className="text-muted-foreground mt-1">
              Random Forest flow classifier with rule-based risk scoring.
            </p>
          </div>

          <div
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider',
              online
                ? 'bg-green-500/10 border-green-500/30 text-green-500'
                : 'bg-red-500/10 border-red-500/30 text-red-400',
            )}
          >
            {online ? <Activity className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {serviceLabel}
          </div>
        </div>

        {!online && !health.isLoading && (
          <div className="glass-card p-4 border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
            <TriangleAlert className="w-5 h-5 text-amber-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-amber-500">Python ML service is not reachable</p>
              <p className="text-muted-foreground mt-1">
                Start it with{' '}
                <code className="font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">
                  python src/app.py
                </code>{' '}
                inside <code className="font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">ml-backend/</code>,
                then point <code className="font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">ML_SERVICE_URL</code>{' '}
                at it (defaults to http://127.0.0.1:5000).
              </p>
            </div>
          </div>
        )}

        {online && modelsLoaded === false && (
          <div className="glass-card p-4 border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
            <TriangleAlert className="w-5 h-5 text-amber-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-amber-500">
                ML service is running, but no trained model is loaded
              </p>
              <p className="text-muted-foreground mt-1">
                {missingArtifacts.length > 0
                  ? `${missingArtifacts.length} artifact(s) missing: ${missingArtifacts.join(', ')}. `
                  : 'Trained artifacts are missing. '}
                Place the <code className="font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">.pkl</code> files in{' '}
                <code className="font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">ml-backend/models/</code> and{' '}
                <code className="font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">ml-backend/dataset/processed/</code>.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Flow input */}
          <div className="glass-card p-5 xl:col-span-3 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-white uppercase tracking-wider text-sm flex items-center">
                <Crosshair className="w-4 h-4 mr-2 text-primary" />
                Network Flow
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFlowInput(SAMPLE_JSON);
                    setParseError(null);
                  }}
                  className="px-3 py-1.5 rounded-md text-xs font-bold bg-black/40 border border-primary/20 text-muted-foreground hover:text-white hover:border-primary/50 transition-colors"
                >
                  Load sample
                </button>
                <button
                  onClick={() => setFlowInput('{}')}
                  className="px-3 py-1.5 rounded-md text-xs font-bold bg-black/40 border border-primary/20 text-muted-foreground hover:text-white hover:border-primary/50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <textarea
              value={flowInput}
              onChange={(event) => {
                setFlowInput(event.target.value);
                setParseError(null);
              }}
              spellCheck={false}
              className="flex-1 min-h-[320px] w-full bg-black/40 border border-primary/15 rounded-lg p-4 font-mono text-xs text-green-300/90 focus:outline-none focus:border-primary/50 resize-y"
            />

            {parseError && (
              <p className="text-xs text-red-400 mt-2 flex items-center">
                <TriangleAlert className="w-3.5 h-3.5 mr-1.5" />
                {parseError}
              </p>
            )}

            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">
                Missing CIC-IDS2017 features are imputed server-side.
              </span>
              <button
                onClick={handlePredict}
                disabled={predictMutation.isPending || !canPredict}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                {predictMutation.isPending ? 'Analyzing…' : 'Run Analysis'}
              </button>
            </div>
          </div>

          {/* Result */}
          <div className="glass-card p-5 xl:col-span-2 flex flex-col">
            <h2 className="font-bold text-white uppercase tracking-wider text-sm flex items-center mb-3">
              <Siren className="w-4 h-4 mr-2 text-primary" />
              Verdict
            </h2>

            {predictMutation.isPending ? (
              <div className="flex-1 flex flex-col gap-3">
                <LoadingSkeleton className="h-20 w-full" />
                <LoadingSkeleton className="h-6 w-2/3" />
                <LoadingSkeleton className="h-24 w-full" />
              </div>
            ) : result ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-baseline justify-between">
                  <span
                    className={cn(
                      'text-2xl font-black tracking-tight',
                      result.threat === 'ATTACK' ? 'text-red-500' : 'text-green-500',
                    )}
                  >
                    {result.threat}
                  </span>
                  <SeverityBadge severity={result.severity} />
                </div>

                {result.attack_type && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Attack type</span>
                    <p className="font-bold text-white">{result.attack_type}</p>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground uppercase tracking-wider font-semibold">
                      Risk score
                    </span>
                    <span className={cn('font-mono font-black text-lg', riskColor(result.risk_score))}>
                      {result.risk_score}/100
                    </span>
                  </div>
                  <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', riskBar(result.risk_score))}
                      style={{ width: `${Math.min(100, Math.max(0, result.risk_score))}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-black/30 rounded-lg p-3 border border-primary/10">
                    <span className="text-muted-foreground block mb-1">Model confidence</span>
                    <span className="font-mono text-white text-base">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-primary/10">
                    <span className="text-muted-foreground block mb-1">Binary confidence</span>
                    <span className="font-mono text-white text-base">
                      {result.binary_confidence != null
                        ? `${(result.binary_confidence * 100).toFixed(1)}%`
                        : '—'}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                    Recommended actions
                  </p>
                  <ul className="space-y-1.5">
                    {result.recommended_actions.map((action, index) => (
                      <li key={index} className="text-xs text-white/80 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {result.alert_id != null && (
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Saved as ML alert #{result.alert_id}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <Cpu className="w-12 h-12 text-muted-foreground opacity-20 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Submit a flow to see the model verdict, risk score and response playbook.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Model + alert list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-5">
            <h2 className="font-bold text-white uppercase tracking-wider text-sm flex items-center mb-4">
              <Cpu className="w-4 h-4 mr-2 text-primary" />
              Model
            </h2>
            {modelInfo.isLoading ? (
              <LoadingSkeleton className="h-24 w-full" />
            ) : modelInfo.isError ? (
              <p className="text-xs text-muted-foreground">Model info unavailable.</p>
            ) : (
              <dl className="space-y-2 text-xs">
                {Object.entries(modelInfo.data ?? {}).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-4 border-b border-white/5 pb-2 last:border-0">
                    <dt className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</dt>
                    <dd className="text-white font-mono text-right break-all">{formatModelValue(key, value)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div className="glass-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white uppercase tracking-wider text-sm flex items-center">
                <ShieldAlert className="w-4 h-4 mr-2 text-primary" />
                ML Alerts
              </h2>
              <span className="text-xs font-mono text-muted-foreground">
                {alerts.data?.count ?? 0} stored
              </span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {alerts.isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <LoadingSkeleton key={index} className="h-16 w-full" />
                ))
              ) : mlAlerts.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">
                  No ML alerts yet — run an analysis to generate one.
                </p>
              ) : (
                mlAlerts.map((alert: MlAlert) => (
                  <div
                    key={alert.id}
                    className="flex flex-wrap items-center gap-3 bg-black/25 border border-primary/10 rounded-lg p-3"
                  >
                    <SeverityBadge severity={alert.severity || 'low'} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">
                        {alert.attack_type || alert.threat}
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                        <span className="font-mono">· risk {alert.risk_score ?? '—'}</span>
                      </p>
                    </div>
                    <select
                      value={alert.status}
                      onChange={(event) =>
                        statusMutation.mutate({
                          id: alert.id,
                          data: { status: event.target.value as 'NEW' | 'INVESTIGATING' | 'RESOLVED' },
                        })
                      }
                      disabled={statusMutation.isPending}
                      className="bg-black/50 border border-primary/20 rounded-md px-2 py-1 text-[11px] font-bold text-white focus:outline-none focus:border-primary/50"
                    >
                      <option value="NEW">NEW</option>
                      <option value="INVESTIGATING">INVESTIGATING</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                    <EvidenceActions alertId={alert.id} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
