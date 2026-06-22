'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
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

interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface FormData {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      fullName: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'Vietnam',
      isDefault: false,
    },
  });

  const isDefault = watch('isDefault');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/addresses?page=1&pageSize=50');
      setAddresses(response.data.data);
    } catch (error) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/addresses/${editingId}`, data);
        toast.success('Address updated successfully');
      } else {
        await api.post('/addresses', data);
        toast.success('Address created successfully');
      }
      setDialogOpen(false);
      setEditingId(null);
      reset();
      await fetchAddresses();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to save address';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (address: Address) => {
    reset(address);
    setEditingId(address.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      toast.success('Address deleted');
      await fetchAddresses();
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/addresses/${id}/set-default`);
      toast.success('Address set as default');
      await fetchAddresses();
    } catch (error) {
      toast.error('Failed to set default address');
    }
  };

  const handleOpenNew = () => {
    reset({
      fullName: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'Vietnam',
      isDefault: false,
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading addresses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Shipping Addresses</h2>
        <Button onClick={handleOpenNew} className="bg-indigo-600 hover:bg-indigo-700">
          + Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-slate-600 mb-4">No addresses yet</p>
          <Button onClick={handleOpenNew}>Add First Address</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
              {address.isDefault && (
                <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mb-3">
                  Default Address
                </span>
              )}
              <div className="space-y-2 mb-4">
                <p className="font-semibold text-slate-900">{address.fullName}</p>
                <p className="text-slate-600">{address.line1}</p>
                {address.line2 && <p className="text-slate-600">{address.line2}</p>}
                <p className="text-slate-600">
                  {address.city}
                  {address.region && `, ${address.region}`}
                </p>
                <p className="text-slate-600">{address.postalCode}, {address.country}</p>
                <p className="text-slate-600">📞 {address.phone}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(address)}
                  className="flex-1"
                >
                  Edit
                </Button>
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(address.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  {...register('fullName', { required: 'Name is required' })}
                  disabled={submitting}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  {...register('phone', {
                    required: 'Phone is required',
                    pattern: {
                      value: /^[0-9]{10,11}$|^\+84[0-9]{9,10}$/,
                      message: 'Invalid Vietnamese phone format',
                    },
                  })}
                  placeholder="0xxx xxx xxxx or +84xxx xxx xxxx"
                  disabled={submitting}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="line1">Address Line 1 *</Label>
              <Input
                id="line1"
                {...register('line1', { required: 'Address line 1 is required' })}
                disabled={submitting}
              />
              {errors.line1 && (
                <p className="text-sm text-red-500 mt-1">{errors.line1.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="line2">Address Line 2</Label>
              <Input
                id="line2"
                {...register('line2')}
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  {...register('city', { required: 'City is required' })}
                  disabled={submitting}
                />
                {errors.city && (
                  <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="region">Region/Province</Label>
                <Input
                  id="region"
                  {...register('region')}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  {...register('postalCode', { required: 'Postal code is required' })}
                  disabled={submitting}
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-500 mt-1">{errors.postalCode.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  {...register('country', { required: 'Country is required' })}
                  disabled={submitting}
                />
                {errors.country && (
                  <p className="text-sm text-red-500 mt-1">{errors.country.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                {...register('isDefault')}
                disabled={submitting}
                className="h-4 w-4 text-indigo-600 rounded"
              />
              <label htmlFor="isDefault" className="ml-2 text-sm text-slate-600">
                Set as default address
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {submitting ? 'Saving...' : 'Save Address'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
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
