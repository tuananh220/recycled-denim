'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface EmailFormData {
  newEmail: string;
}

export default function SecurityPage() {
  const { user } = useAuthStore();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const passwordForm = useForm<PasswordFormData>();
  const emailForm = useForm<EmailFormData>();

  const newPassword = passwordForm.watch('newPassword');

  const onChangePassword = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.patch('/users/me/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordDialogOpen(false);
      passwordForm.reset();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const onRequestEmailChange = async (data: EmailFormData) => {
    setEmailLoading(true);
    try {
      await api.patch('/users/me/email', {
        newEmail: data.newEmail,
      });
      toast.success('Verification email sent! Please check your new email address.');
      setEmailDialogOpen(false);
      emailForm.reset();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to request email change';
      toast.error(message);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Security Settings</h2>

      {/* Email Section */}
      <div className="bg-background border border-border rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Email Address</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Current Email</Label>
            <p className="text-lg text-foreground font-mono">{user?.email}</p>
            <p className={`text-sm mt-1 ${user?.emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
              {user?.emailVerified ? '✓ Verified' : '⚠️ Not Verified'}
            </p>
          </div>

          <Button
            onClick={() => setEmailDialogOpen(true)}
            variant="outline"
            className="w-full"
          >
            Change Email
          </Button>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-background border border-border rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Password</h3>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Keep your password strong and unique to protect your account.
          </p>

          <Button
            onClick={() => setPasswordDialogOpen(true)}
            variant="outline"
            className="w-full"
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Login Activity - Placeholder */}
      <div className="bg-background border border-border rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Connected Devices</h3>
        <p className="text-muted-foreground text-sm mb-4">
          View and manage devices and apps that have access to your account.
        </p>
        <div className="bg-muted rounded p-4 text-center text-muted-foreground text-sm">
          This feature will be available soon
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={passwordForm.handleSubmit(onChangePassword)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter your current password"
                {...passwordForm.register('currentPassword', {
                  required: 'Current password is required',
                })}
                disabled={passwordLoading}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="At least 8 characters"
                {...passwordForm.register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
                disabled={passwordLoading}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                {...passwordForm.register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === newPassword || 'Passwords do not match',
                })}
                disabled={passwordLoading}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={passwordLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordDialogOpen(false)}
                disabled={passwordLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={emailForm.handleSubmit(onRequestEmailChange)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="currentEmail">Current Email</Label>
              <Input
                id="currentEmail"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="Enter your new email"
                {...emailForm.register('newEmail', {
                  required: 'New email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                disabled={emailLoading}
              />
              {emailForm.formState.errors.newEmail && (
                <p className="text-sm text-red-500 mt-1">
                  {emailForm.formState.errors.newEmail.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                A verification link will be sent to your new email address.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={emailLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {emailLoading ? 'Sending...' : 'Send Verification Link'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEmailDialogOpen(false)}
                disabled={emailLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
