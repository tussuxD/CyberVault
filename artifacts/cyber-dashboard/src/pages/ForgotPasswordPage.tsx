import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Shield } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#0B1220] flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 sm:p-10 glass-card text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <p className="text-sm text-primary font-bold mb-2">CyberVault</p>
        <h1 className="text-3xl font-black text-white">Access Recovery</h1>
        <p className="text-muted-foreground mt-4">
          Email password recovery is not configured yet. If you can still sign in, change your password from your profile.
        </p>
        <Link href="/login" className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">
          <ArrowLeft className="w-4 h-4" /> Return to sign in
        </Link>
      </div>
    </main>
  );
}
