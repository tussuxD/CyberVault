import React, { useState } from 'react';
import { useListLogs, LogEntry } from '@workspace/api-client-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable } from '@/components/shared/DataTable';
import { Terminal, Download, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [levelFilter, setLevelFilter] = useState<string>('');

  const { data, isLoading } = useListLogs({
    search: searchTerm,
    level: levelFilter as any || undefined,
    page,
    limit: 50,
  });

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'error': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'warning': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'info': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
      default: return 'text-muted-foreground bg-white/5 border-white/10';
    }
  };

  const columns = [
    {
      header: 'Timestamp',
      className: 'w-[180px]',
      accessor: (row: LogEntry) => {
        const date = new Date(row.createdAt);
        return (
          <span className="font-mono text-xs text-muted-foreground">
            {date.toISOString().replace('T', ' ').substring(0, 19)}
          </span>
        );
      }
    },
    {
      header: 'Level',
      className: 'w-[100px]',
      accessor: (row: LogEntry) => (
        <span className={cn("px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider font-mono", getLevelColor(row.level))}>
          {row.level}
        </span>
      )
    },
    {
      header: 'Source',
      className: 'w-[150px]',
      accessor: (row: LogEntry) => (
        <span className="font-mono text-xs text-primary">{row.source}</span>
      )
    },
    {
      header: 'Event Message',
      accessor: (row: LogEntry) => (
        <span className="font-mono text-sm text-white/90">{row.message}</span>
      )
    }
  ];

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black/40 rounded-xl border border-primary/20">
              <Terminal className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight font-mono uppercase">System_Logs</h1>
              <p className="text-muted-foreground mt-1 text-sm">Raw telemetry and event stream.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-primary/30 hover:bg-primary/10 text-primary rounded-xl font-bold transition-all text-sm font-mono">
            <Download className="w-4 h-4" />
            EXPORT .CSV
          </button>
        </div>

        <div className="flex-1 min-h-0 bg-[#0A0E17] rounded-xl border border-primary/20 overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          {/* Terminal Header */}
          <div className="h-8 bg-black/60 border-b border-primary/10 flex items-center px-4 gap-2 flex-shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground ml-2">tail -f /var/log/cybervault.log</span>
          </div>

          {/* Filter Bar */}
          <div className="p-3 bg-black/40 border-b border-primary/10 flex gap-4 items-center flex-shrink-0">
            <div className="relative w-64 group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                placeholder="grep..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 pl-9 pr-3 bg-black border border-primary/20 rounded font-mono text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="flex gap-1 bg-black p-1 rounded border border-primary/10">
              {['All', 'Info', 'Warning', 'Error', 'Critical'].map(lvl => {
                const val = lvl === 'All' ? '' : lvl.toLowerCase();
                const isActive = levelFilter === val;
                return (
                  <button
                    key={lvl}
                    onClick={() => setLevelFilter(val)}
                    className={cn(
                      "px-3 py-1 rounded text-[10px] font-bold uppercase font-mono transition-colors",
                      isActive ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-white border border-transparent"
                    )}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Log Data */}
          <div className="flex-1 min-h-0 relative">
            {/* Terminal glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/5 to-transparent pointer-events-none z-10"></div>
            
            <DataTable
              data={data?.data || []}
              columns={columns}
              keyExtractor={(row) => row.id}
              isLoading={isLoading}
              page={page}
              totalPages={data?.totalPages || 1}
              onPageChange={setPage}
              className="h-full bg-transparent [&_.glass-card]:bg-transparent [&_.glass-card]:border-0 [&_thead]:bg-black/60 [&_tr]:border-primary/5 hover:[&_tr]:bg-white/5 [&_td]:py-2"
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
