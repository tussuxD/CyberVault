import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForgotPassword } from '@workspace/api-client-react';
import { Shield, Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const [mounted, setMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' }
  });

  const resetMutation = useForgotPassword({
    mutation: {
      onSuccess: () => {
        setIsSuccess(true);
      }
    }
  });

  const onSubmit = (data: FormValues) => {
    resetMutation.mutate({ data });
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center relative overflow-hidden selection:bg-primary/30">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBzdHJva2U9InJnYmEoNTksIDEzMCwgMjQ2LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className={cn(
        "relative z-10 w-full max-w-md p-8 sm:p-10 glass-card transition-all duration-1000",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}>
        
        {isSuccess ? (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Protocol Initiated</h2>
            <p className="text-muted-foreground mb-8">
              If the Operator ID exists in our system, recovery instructions have been transmitted to that channel.
            </p>
            <Link href="/login" className="px-6 py-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-xl font-bold transition-all w-full">
              RETURN TO AUTHENTICATION
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <Shield className="w-8 h-8 text-amber-500" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Access Recovery</h1>
              <p className="text-muted-foreground text-sm mt-2 font-mono uppercase tracking-widest text-center">Identity Verification Required</p>
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

              <button
                type="submit"
                disabled={resetMutation.isPending}
                className="w-full h-12 mt-6 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {resetMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'INITIATE RECOVERY'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-primary/10">
              <Link href="/login" className="flex items-center justify-center text-sm text-muted-foreground hover:text-white transition-colors group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Abort Recovery
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}