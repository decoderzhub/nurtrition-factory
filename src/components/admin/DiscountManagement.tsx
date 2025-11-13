import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Search, Tag, Check, X as XIcon, Cloud } from 'lucide-react';

interface DiscountCode {
  id: string;
  code: string;
  stripe_coupon_id: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  duration: 'once' | 'repeating' | 'forever';
  duration_in_months: number | null;
  is_active: boolean;
  max_redemptions: number | null;
  redemptions_count: number;
  expires_at: string | null;
  created_at: string;
}

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_amount',
    discount_value: '',
    duration: 'once' as 'once' | 'repeating' | 'forever',
    duration_in_months: '',
    max_redemptions: '',
    expires_at: '',
  });
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscounts(data || []);
    } catch (err) {
      console.error('Error fetching discounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const discountData = {
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        duration: formData.duration,
        duration_in_months: formData.duration === 'repeating' && formData.duration_in_months
          ? parseInt(formData.duration_in_months)
          : null,
        max_redemptions: formData.max_redemptions ? parseInt(formData.max_redemptions) : null,
        expires_at: formData.expires_at || null,
        is_active: true,
      };

      if (editingDiscount) {
        const { error } = await supabase
          .from('discount_codes')
          .update(discountData)
          .eq('id', editingDiscount.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('discount_codes').insert([discountData]);
        if (error) throw error;
      }

      await fetchDiscounts();
      closeModal();
    } catch (err: any) {
      setError(err.message || 'Failed to save discount code');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return;

    try {
      const { error } = await supabase.from('discount_codes').delete().eq('id', id);
      if (error) throw error;
      await fetchDiscounts();
    } catch (err: any) {
      alert('Failed to delete discount code: ' + err.message);
    }
  };

  const toggleActive = async (discount: DiscountCode) => {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({ is_active: !discount.is_active })
        .eq('id', discount.id);

      if (error) throw error;
      await fetchDiscounts();
    } catch (err: any) {
      alert('Failed to update discount status: ' + err.message);
    }
  };

  const syncToStripe = async (discountId: string) => {
    setSyncing(discountId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-discount-to-stripe`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ discountId }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to sync discount');
      }

      await fetchDiscounts();
      alert('Discount synced to Stripe successfully!');
    } catch (err: any) {
      alert('Failed to sync discount: ' + err.message);
    } finally {
      setSyncing(null);
    }
  };

  const openModal = (discount?: DiscountCode) => {
    if (discount) {
      setEditingDiscount(discount);
      setFormData({
        code: discount.code,
        discount_type: discount.discount_type,
        discount_value: discount.discount_value.toString(),
        duration: discount.duration,
        duration_in_months: discount.duration_in_months?.toString() || '',
        max_redemptions: discount.max_redemptions?.toString() || '',
        expires_at: discount.expires_at ? discount.expires_at.split('T')[0] : '',
      });
    } else {
      setEditingDiscount(null);
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        duration: 'once',
        duration_in_months: '',
        max_redemptions: '',
        expires_at: '',
      });
    }
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDiscount(null);
    setError(null);
  };

  const filteredDiscounts = discounts.filter((discount) =>
    discount.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-12 w-12 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discount Codes</h1>
          <p className="text-gray-600 mt-2">
            Create and manage discount codes for your customers
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Discount Code
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search discount codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Code
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Discount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Duration
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Usage
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Stripe
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDiscounts.map((discount) => (
                <tr key={discount.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-emerald-600" />
                      <span className="font-mono font-bold text-gray-900">
                        {discount.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {discount.discount_type === 'percentage'
                      ? `${discount.discount_value}% off`
                      : `$${discount.discount_value.toFixed(2)} off`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {discount.duration === 'once' && 'Once'}
                    {discount.duration === 'forever' && 'Forever'}
                    {discount.duration === 'repeating' &&
                      `${discount.duration_in_months} months`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {discount.redemptions_count}
                    {discount.max_redemptions && ` / ${discount.max_redemptions}`}
                  </td>
                  <td className="px-6 py-4">
                    {discount.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        <Check className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <XIcon className="h-3 w-3" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {discount.stripe_coupon_id ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        <Check className="h-3 w-3" />
                        Synced
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Not Synced
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!discount.stripe_coupon_id && (
                        <button
                          onClick={() => syncToStripe(discount.id)}
                          disabled={syncing === discount.id}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Sync to Stripe"
                        >
                          <Cloud className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleActive(discount)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title={discount.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {discount.is_active ? (
                          <XIcon className="h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => openModal(discount)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(discount.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingDiscount ? 'Edit Discount Code' : 'Add New Discount Code'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                    placeholder="SUMMER2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_type: e.target.value as 'percentage' | 'fixed_amount',
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    max={formData.discount_type === 'percentage' ? '100' : undefined}
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_value: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder={formData.discount_type === 'percentage' ? '10' : '5.00'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: e.target.value as 'once' | 'repeating' | 'forever',
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="once">Once</option>
                    <option value="repeating">Repeating</option>
                    <option value="forever">Forever</option>
                  </select>
                </div>

                {formData.duration === 'repeating' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (Months) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.duration_in_months}
                      onChange={(e) =>
                        setFormData({ ...formData, duration_in_months: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_redemptions}
                    onChange={(e) =>
                      setFormData({ ...formData, max_redemptions: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expires At
                  </label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) =>
                      setFormData({ ...formData, expires_at: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingDiscount
                    ? 'Update Discount'
                    : 'Add Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
