import React, { useState } from 'react';
import { useGetProfile, useUpdateProfile, useChangePassword, useListActivities } from '@workspace/api-client-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { User, Mail, Building, MapPin, Phone, ShieldCheck, Key, Clock, Shield, Loader2, Save } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetProfile();
  const { data: activities } = useListActivities({ limit: 5 });
  const [isEditing, setIsEditing] = useState(false);
  const [passwordFormOpen, setPasswordFormOpen] = useState(false);
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const { toast } = useToast();

  const resetPasswordForm = () => {
    setPasswordFields({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordFormOpen(false);
  };

  const changePasswordMutation = useChangePassword({
    mutation: {
      onSuccess: () => {
        resetPasswordForm();
        toast({ title: 'Password updated', description: 'Your new password is ready to use.' });
      },
      onError: (error) => {
        const details = error.data;
        const message =
          details && typeof details === 'object' && 'error' in details && typeof details.error === 'string'
            ? details.error
            : 'Could not update your password. Please try again.';
        toast({ title: 'Password update failed', description: message, variant: 'destructive' });
      },
    },
  });

  const submitPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordFields.newPassword.length < 8) {
      toast({ title: 'Password too short', description: 'Use at least 8 characters.', variant: 'destructive' });
      return;
    }
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Re-enter the same new password.', variant: 'destructive' });
      return;
    }
    changePasswordMutation.mutate({
      data: {
        currentPassword: passwordFields.currentPassword,
        newPassword: passwordFields.newPassword,
      },
    });
  };

  const updateProfileMutation = useUpdateProfile({
    mutation: {
      onSuccess: () => {
        toast({ title: 'Profile Updated', description: 'Your identity parameters have been saved.' });
        setIsEditing(false);
      }
    }
  });

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      department: profile?.department || '',
      bio: profile?.bio || ''
    },
    values: {
      name: profile?.name || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      department: profile?.department || '',
      bio: profile?.bio || ''
    }
  });

  const onSubmit = (data: any) => {
    updateProfileMutation.mutate({ data });
  };

  if (isLoading || !profile) return <AppLayout><div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Operator Profile</h1>
            <p className="text-muted-foreground mt-1">Identity and clearance details.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Identity Card */}
          <div className="glass-card p-0 overflow-hidden lg:col-span-1">
            <div className="h-32 bg-gradient-to-r from-primary/20 to-[#0B1220] border-b border-primary/10 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBzdHJva2U9InJnYmEoNTksIDEzMCwgMjQ2LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] opacity-30"></div>
            </div>
            
            <div className="px-6 pb-6 relative">
              <div className="absolute -top-12 left-6 w-24 h-24 rounded-2xl bg-black border-2 border-primary/30 p-1 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center overflow-hidden">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-primary">{profile.name.charAt(0)}</span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end mt-4 mb-2">
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors border border-primary/20"
                >
                  {isEditing ? 'CANCEL' : 'EDIT IDENTITY'}
                </button>
              </div>

              <div className="mt-2">
                <h2 className="text-2xl font-black text-white">{profile.name}</h2>
                <div className="flex items-center mt-1 mb-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 font-mono">
                    {profile.role}
                  </span>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6 border-t border-primary/10 pt-4">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground uppercase font-bold">Full Name</label>
                      <input {...register('name')} className="w-full bg-black/40 border border-primary/20 rounded-lg h-9 px-3 text-sm text-white focus:border-primary/50 focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground uppercase font-bold">Department</label>
                      <input {...register('department')} className="w-full bg-black/40 border border-primary/20 rounded-lg h-9 px-3 text-sm text-white focus:border-primary/50 focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground uppercase font-bold">Location</label>
                      <input {...register('location')} className="w-full bg-black/40 border border-primary/20 rounded-lg h-9 px-3 text-sm text-white focus:border-primary/50 focus:outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-primary text-primary-foreground h-9 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                      {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> SAVE CHANGES</>}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4 mt-6 border-t border-primary/10 pt-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 mr-3 opacity-70" />
                      <span className="font-mono text-white">{profile.email}</span>
                    </div>
                    {profile.department && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Building className="w-4 h-4 mr-3 opacity-70" />
                        <span className="text-white">{profile.department}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-3 opacity-70" />
                        <span className="text-white">{profile.location}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="w-4 h-4 mr-3 opacity-70" />
                        <span className="font-mono text-white">{profile.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security Settings */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center border-b border-primary/10 pb-4">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Access Security
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Authentication Status</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-primary/5">
                      <div className="flex items-center">
                        <Key className="w-4 h-4 mr-3 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-white">Password</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Change your password</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-expanded={passwordFormOpen}
                        aria-controls="password-update-form"
                        onClick={() => passwordFormOpen ? resetPasswordForm() : setPasswordFormOpen(true)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        {passwordFormOpen ? 'Cancel' : 'Update'}
                      </button>
                    </div>
                    {passwordFormOpen && (
                      <form id="password-update-form" onSubmit={submitPassword} className="space-y-3 p-3 rounded-lg bg-black/20 border border-primary/10">
                        <div>
                          <label htmlFor="current-password" className="block text-xs font-bold text-muted-foreground mb-1">Current password</label>
                          <input
                            id="current-password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={passwordFields.currentPassword}
                            onChange={(event) => setPasswordFields({ ...passwordFields, currentPassword: event.target.value })}
                            className="w-full bg-black/40 border border-primary/20 rounded-lg h-10 px-3 text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="new-password" className="block text-xs font-bold text-muted-foreground mb-1">New password</label>
                          <input
                            id="new-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            value={passwordFields.newPassword}
                            onChange={(event) => setPasswordFields({ ...passwordFields, newPassword: event.target.value })}
                            className="w-full bg-black/40 border border-primary/20 rounded-lg h-10 px-3 text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="confirm-new-password" className="block text-xs font-bold text-muted-foreground mb-1">Confirm new password</label>
                          <input
                            id="confirm-new-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={passwordFields.confirmPassword}
                            onChange={(event) => setPasswordFields({ ...passwordFields, confirmPassword: event.target.value })}
                            className="w-full bg-black/40 border border-primary/20 rounded-lg h-10 px-3 text-white"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
                        <button
                          type="submit"
                          disabled={changePasswordMutation.isPending}
                          className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-70"
                        >
                          {changePasswordMutation.isPending ? 'Updating…' : 'Save password'}
                        </button>
                      </form>
                    )}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-primary/5">
                      <div className="flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-3 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-white">Two-Factor Auth</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Two-factor sign-in is not available yet.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Session Info</h4>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-black/20 border border-primary/5">
                      <p className="text-xs text-muted-foreground mb-1">Last Login</p>
                      <p className="text-sm font-mono text-white">{profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Unknown'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/20 border border-primary/5">
                      <p className="text-xs text-muted-foreground mb-1">Clearance Level</p>
                      <p className="text-sm font-bold text-amber-500 uppercase">{profile.role} (Tier 3)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Log */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center border-b border-primary/10 pb-4">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                Personal Audit Log
              </h3>
              
              <div className="space-y-4">
                {activities && activities.length > 0 ? (
                  activities.map(activity => (
                    <div key={activity.id} className="flex gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-primary/10">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm text-white">{activity.message}</p>
                        <p className="text-xs font-mono text-muted-foreground mt-1">
                          {new Date(activity.createdAt).toLocaleString()} • IP: 192.168.1.144
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No recent activity recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}