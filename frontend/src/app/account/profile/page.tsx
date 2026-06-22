'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormData {
  name: string;
  phone: string;
  avatarUrl: string;
}

export default function ProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      avatarUrl: user?.avatarUrl || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.patch('/users/me', data);
      await fetchMe();
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Profile Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Account Information</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-600">Email</Label>
            <p className="text-lg text-slate-900">{user?.email}</p>
            <p className={`text-sm mt-1 ${user?.emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
              {user?.emailVerified ? '✓ Verified' : '⚠️ Not Verified'}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-600">Role</Label>
            <p className="text-lg text-slate-900 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 flex gap-3">
          <Button variant="outline" asChild>
            <a href="/account/security">Change Email</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/account/security">Change Password</a>
          </Button>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              {...register('name', { required: 'Name is required' })}
              disabled={loading}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+84 or 0xxx xxx xxxx"
              {...register('phone')}
              disabled={loading}
            />
            {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              {...register('avatarUrl')}
              disabled={loading}
            />
            {errors.avatarUrl && (
              <p className="text-sm text-red-500 mt-1">{errors.avatarUrl.message}</p>
            )}
            {user?.avatarUrl && (
              <div className="mt-2">
                <img
                  src={user.avatarUrl}
                  alt="Avatar preview"
                  className="h-12 w-12 rounded-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
