import React, { useState } from 'react';
import { useGetSettings, useUpdateSettings, SettingsUpdate } from '@workspace/api-client-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Settings as SettingsIcon, Bell, Shield, Key, Sliders, Loader2, Save, Eye, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { data: settings, isLoading } = useGetSettings();
  const [activeTab, setActiveTab] = useState('notifications');
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // Local state for toggles to avoid delay
  const [localSettings, setLocalSettings] = useState<Partial<SettingsUpdate>>({});

  // Sync when data loads
  React.useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const updateMutation = useUpdateSettings({
    mutation: {
      onSuccess: () => {
        toast({ title: 'Settings Applied', description: 'System configuration updated.' });
      }
    }
  });

  const handleToggle = (key: keyof SettingsUpdate, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    // Auto-save on toggle
    updateMutation.mutate({ data: newSettings });
  };

  const copyApiKey = () => {
    if (settings?.apiKey) {
      navigator.clipboard.writeText(settings.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Key Copied', description: 'API key copied to clipboard.' });
    }
  };

  if (isLoading) return <AppLayout><div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  const tabs = [
    { id: 'notifications', label: 'Alert Routing', icon: Bell },
    { id: 'security', label: 'Security Policy', icon: Shield },
    { id: 'api', label: 'API Access', icon: Key },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 h-full min-h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">System Configuration</h1>
            <p className="text-muted-foreground mt-1">Manage global preferences and routing rules.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1">
          {/* Sidebar Tabs */}
          <div className="md:col-span-1 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  activeTab === tab.id 
                    ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : ''}`} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3">
            <div className="glass-card p-6 h-full">
              
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6 animate-in fade-in">
                  <h3 className="text-xl font-bold border-b border-primary/10 pb-4">Alert Routing</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-primary/5 hover:border-primary/20 transition-colors">
                      <div>
                        <h4 className="font-bold text-white mb-1">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive daily digest and important updates.</p>
                      </div>
                      <Switch 
                        checked={localSettings.emailNotifications} 
                        onChange={(v) => handleToggle('emailNotifications', v)} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-primary/5 hover:border-primary/20 transition-colors">
                      <div>
                        <h4 className="font-bold text-white mb-1">Critical Threat Push</h4>
                        <p className="text-sm text-muted-foreground">Immediate push notifications for severity: CRITICAL alerts.</p>
                      </div>
                      <Switch 
                        checked={localSettings.criticalAlertEmail} 
                        onChange={(v) => handleToggle('criticalAlertEmail', v)} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-primary/5 hover:border-primary/20 transition-colors">
                      <div>
                        <h4 className="font-bold text-white mb-1">Weekly Telemetry Report</h4>
                        <p className="text-sm text-muted-foreground">Automated PDF report of network activity sent every Monday.</p>
                      </div>
                      <Switch 
                        checked={localSettings.weeklyReport} 
                        onChange={(v) => handleToggle('weeklyReport', v)} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6 animate-in fade-in">
                  <h3 className="text-xl font-bold border-b border-primary/10 pb-4">Security Policy</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-primary/5 hover:border-primary/20 transition-colors">
                      <div>
                        <h4 className="font-bold text-white mb-1">Strict Two-Factor Auth</h4>
                        <p className="text-sm text-muted-foreground">Two-factor sign-in is not available yet.</p>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground uppercase">Unavailable</span>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-black/20 border border-primary/5 hover:border-primary/20 transition-colors">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-bold text-white mb-1">Session Timeout</h4>
                          <p className="text-sm text-muted-foreground">Automatically log out inactive operators.</p>
                        </div>
                        <span className="font-mono text-primary font-bold">{localSettings.sessionTimeout || 30} mins</span>
                      </div>
                      <input 
                        type="range" 
                        min="5" max="120" step="5"
                        value={localSettings.sessionTimeout || 30}
                        onChange={(e) => handleToggle('sessionTimeout', parseInt(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* API Tab */}
              {activeTab === 'api' && (
                <div className="space-y-6 animate-in fade-in">
                  <h3 className="text-xl font-bold border-b border-primary/10 pb-4">API Access Keys</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-black/20 border border-primary/10">
                      <h4 className="font-bold text-white mb-2">Personal Access Token</h4>
                      <p className="text-sm text-muted-foreground mb-4">Use this token to authenticate external scripts against the CyberVault API.</p>
                      
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input 
                            type={showApiKey ? 'text' : 'password'} 
                            value={settings?.apiKey || 'sk_test_1234567890abcdef1234567890abcdef'} 
                            readOnly
                            className="w-full h-10 pl-3 pr-10 bg-black/60 border border-primary/20 rounded-lg text-primary font-mono text-sm focus:outline-none"
                          />
                          <button 
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          onClick={copyApiKey}
                          className="h-10 px-4 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg font-bold flex items-center transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-amber-500 mt-3 flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Treat this token like a password. Do not share it or commit it to version control.
                      </p>
                    </div>
                    
                    <button className="w-full py-3 border border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl font-bold text-sm transition-colors mt-4">
                      REVOKE CURRENT TOKEN & GENERATE NEW
                    </button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6 animate-in fade-in">
                  <h3 className="text-xl font-bold border-b border-primary/10 pb-4">Operator Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-black/20 border border-primary/5 hover:border-primary/20 transition-colors">
                      <h4 className="font-bold text-white mb-3">UI Theme</h4>
                      <div className="flex gap-4">
                        {['dark', 'light', 'system'].map(theme => (
                          <label key={theme} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${localSettings.theme === theme ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20 bg-black/40'}`}>
                            <input 
                              type="radio" 
                              name="theme" 
                              value={theme} 
                              checked={localSettings.theme === theme}
                              onChange={() => handleToggle('theme', theme)}
                              className="sr-only" 
                            />
                            <div className="w-8 h-8 rounded-full mb-2 bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center">
                              {localSettings.theme === theme && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                            </div>
                            <span className="text-sm font-bold uppercase tracking-wider">{theme}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Simple custom switch component to avoid pulling in full shadcn switch for this file
const Switch = ({ checked, onChange }: { checked?: boolean, onChange: (val: boolean) => void }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full border-2 transition-colors relative ${checked ? 'bg-primary border-primary' : 'bg-black/60 border-white/20'}`}
  >
    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'left-[22px]' : 'left-[3px]'}`} />
  </button>
);