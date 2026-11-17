import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRegister } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Lock, Mail, User, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [pwdStrength, setPwdStrength] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  });

  const password = watch("password");

  useEffect(() => {
    if (!password) {
      setPwdStrength(0);
      return;
    }
    let strength = 0;
    if (password.length > 7) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPwdStrength(strength);
  }, [password]);

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        setAuth(data.token, data.user);
        toast({
          title: "Registration Successful",
          description: "Clearance granted. Welcome to CyberVault.",
        });
        setLocation('/dashboard');
      },
      onError: (error) => {
        toast({
          title: "Registration Failed",
          description: error.data?.error || "Unable to process request.",
          variant: "destructive",
        });
      }
    }
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({ 
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'Analyst' // Default role
      } 
    });
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center relative overflow-hidden selection:bg-primary/30 py-12">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBzdHJva2U9InJnYmEoNTksIDEzMCwgMjQ2LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className={cn(
        "relative z-10 w-full max-w-md p-8 sm:p-10 glass-card transition-all duration-1000",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Clearance Request</h1>
          <p className="text-muted-foreground text-sm mt-2 font-mono uppercase tracking-widest">New Operator Enrollment</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                {...register("name")}
                type="text"
                className="w-full bg-black/40 border border-primary/20 rounded-xl h-12 pl-11 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

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
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Access Code (Password)</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                {...register("password")}
                type="password"
                className="w-full bg-black/40 border border-primary/20 rounded-xl h-12 pl-11 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono tracking-widest"
                placeholder="••••••••"
              />
            </div>
            {password && (
              <div className="mt-2 flex gap-1 h-1.5">
                {[25, 50, 75, 100].map((step) => (
                  <div 
                    key={step} 
                    className={cn(
                      "flex-1 rounded-full transition-all duration-300",
                      pwdStrength >= step ? (
                        pwdStrength === 100 ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : 
                        pwdStrength >= 50 ? "bg-amber-500" : "bg-red-500"
                      ) : "bg-primary/10"
                    )}
                  />
                ))}
              </div>
            )}
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Verify Access Code</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                {...register("confirmPassword")}
                type="password"
                className="w-full bg-black/40 border border-primary/20 rounded-xl h-12 pl-11 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono tracking-widest"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full h-12 mt-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {registerMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                SUBMIT REQUEST
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-primary/10 text-center">
          <p className="text-sm text-muted-foreground">
            Already registered?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">Authenticate Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}