import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLogin } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        setAuth(data.token, data.user);
        toast({
          title: "Authentication Successful",
          description: "Welcome back, Analyst.",
        });
        setLocation('/dashboard');
      },
      onError: (error) => {
        toast({
          title: "Access Denied",
          description: error.data?.error || "Invalid credentials provided.",
          variant: "destructive",
        });
      }
    }
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ data });
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center relative overflow-hidden selection:bg-primary/30">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBzdHJva2U9InJnYmEoNTksIDEzMCwgMjQ2LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Animated Scanline */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-1 bg-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_4s_linear_infinite]" />
      </div>

      <div className={cn(
        "relative z-10 w-full max-w-md p-8 sm:p-10 glass-card transition-all duration-1000",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">CyberVault</h1>
          <p className="text-muted-foreground text-sm mt-2 font-mono uppercase tracking-widest">Secure Access Portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Operator ID (Email)</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                {...register("email")}
                type="email"
                className="w-full bg-black/40 border border-primary/20 rounded-xl h-12 pl-11 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                placeholder="analyst@cybervault.local"
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Access Code</label>
              <Link href="/forgot-password" className="text-xs text-primary hover:text-primary-foreground transition-colors">Recover Access</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                {...register("password")}
                type="password"
                className="w-full bg-black/40 border border-primary/20 rounded-xl h-12 pl-11 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono tracking-widest"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-12 mt-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loginMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                AUTHENTICATE
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-primary/10 text-center">
          <p className="text-sm text-muted-foreground">
            Unregistered operative?{' '}
            <Link href="/register" className="text-primary font-bold hover:underline">Request Access</Link>
          </p>
        </div>
      </div>
    </div>
  );
}