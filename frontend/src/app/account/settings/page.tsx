'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface SettingsFormData {
  emailNotifications: boolean;
  emailOnOrderStatus: boolean;
  emailPromotions: boolean;
  profilePublic: boolean;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<SettingsFormData>({
    defaultValues: {
      emailNotifications: true,
      emailOnOrderStatus: true,
      emailPromotions: false,
      profilePublic: true,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/account-settings');
      reset(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    setSubmitting(true);
    try {
      await api.patch('/account-settings', data);
      toast.success('Settings updated successfully!');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to update settings';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Account Settings</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Notifications Section */}
        <div className="bg-background border border-border rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Email Notifications</h3>

          <div className="space-y-4">
            <Controller
              name="emailNotifications"
              control={control}
              render={({ field }) => (
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={submitting}
                    className="h-4 w-4 text-indigo-600 rounded mt-1"
                  />
                  <div className="ml-3 flex-1">
                    <label
                      htmlFor="emailNotifications"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Email Notifications
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive email notifications about your account activity
                    </p>
                  </div>
                </div>
              )}
            />

            <Controller
              name="emailOnOrderStatus"
              control={control}
              render={({ field }) => (
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="emailOnOrderStatus"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={submitting}
                    className="h-4 w-4 text-indigo-600 rounded mt-1"
                  />
                  <div className="ml-3 flex-1">
                    <label
                      htmlFor="emailOnOrderStatus"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Order Status Updates
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get notified when your orders are confirmed, shipped, or delivered
                    </p>
                  </div>
                </div>
              )}
            />

            <Controller
              name="emailPromotions"
              control={control}
              render={({ field }) => (
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="emailPromotions"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={submitting}
                    className="h-4 w-4 text-indigo-600 rounded mt-1"
                  />
                  <div className="ml-3 flex-1">
                    <label
                      htmlFor="emailPromotions"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Promotional Emails
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive emails about special offers, sales, and new products
                    </p>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-background border border-border rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Privacy Settings</h3>

          <div className="space-y-4">
            <Controller
              name="profilePublic"
              control={control}
              render={({ field }) => (
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="profilePublic"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={submitting}
                    className="h-4 w-4 text-indigo-600 rounded mt-1"
                  />
                  <div className="ml-3 flex-1">
                    <label
                      htmlFor="profilePublic"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Public Profile
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Allow others to view your public profile and reviews
                    </p>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={submitting || !isDirty}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
