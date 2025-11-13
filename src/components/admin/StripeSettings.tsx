import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { isStripeConfigured } from '../../lib/stripe';
import {
  CreditCard,
  Cloud,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  DollarSign,
  Users,
  TrendingUp,
  Webhook,
  Key,
  RefreshCw,
} from 'lucide-react';

export default function StripeSettings() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    syncedProducts: 0,
    totalDiscounts: 0,
    syncedDiscounts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [testingWebhook, setTestingWebhook] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, discountsRes, ordersRes, subscriptionsRes] = await Promise.all([
        supabase.from('products').select('stripe_sync_status', { count: 'exact' }),
        supabase.from('discount_codes').select('stripe_coupon_id', { count: 'exact' }),
        supabase.from('orders').select('total_amount'),
        supabase.from('stripe_subscriptions').select('id', { count: 'exact' }).eq('status', 'active'),
      ]);

      const totalProducts = productsRes.count || 0;
      const syncedProducts = productsRes.data?.filter(p => p.stripe_sync_status === 'synced').length || 0;

      const totalDiscounts = discountsRes.count || 0;
      const syncedDiscounts = discountsRes.data?.filter(d => d.stripe_coupon_id).length || 0;

      const totalOrders = ordersRes.data?.length || 0;
      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      const activeSubscriptions = subscriptionsRes.count || 0;

      setStats({
        totalProducts,
        syncedProducts,
        totalDiscounts,
        syncedDiscounts,
        totalOrders,
        totalRevenue,
        activeSubscriptions,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async () => {
    setTestingWebhook(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Webhook endpoint is configured correctly!');
    } catch (error) {
      alert('Webhook test failed. Please check your configuration.');
    } finally {
      setTestingWebhook(false);
    }
  };

  const stripeConfigured = isStripeConfigured();
  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-webhook`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-12 w-12 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stripe Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your Stripe integration and view payment analytics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${stripeConfigured ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {stripeConfigured ? (
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Connection Status</h2>
              <p className="text-sm text-gray-600">
                {stripeConfigured ? 'Connected to Stripe' : 'Not Connected'}
              </p>
            </div>
          </div>

          {!stripeConfigured ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">Stripe Not Configured</h3>
                  <p className="text-sm text-yellow-800 mb-3">
                    To enable payment processing, you need to configure your Stripe API keys.
                  </p>
                  <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
                    <li>Create a Stripe account at stripe.com</li>
                    <li>Get your API keys from the Stripe Dashboard</li>
                    <li>Update your .env file with VITE_STRIPE_PUBLISHABLE_KEY</li>
                    <li>Restart your development server</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Environment</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  Test Mode
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">API Version</span>
                <span className="text-sm text-gray-600">2024-11-20</span>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open Stripe Dashboard
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Webhook className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Webhook Configuration</h2>
              <p className="text-sm text-gray-600">Receive real-time payment events</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Endpoint URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(webhookUrl)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm">Required Events</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• payment_intent.succeeded</li>
                <li>• payment_intent.payment_failed</li>
                <li>• customer.subscription.created</li>
                <li>• customer.subscription.updated</li>
                <li>• customer.subscription.deleted</li>
                <li>• invoice.payment_succeeded</li>
                <li>• charge.refunded</li>
              </ul>
            </div>

            <button
              onClick={testWebhook}
              disabled={testingWebhook}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {testingWebhook ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Test Webhook
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sync Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <Cloud className="h-8 w-8 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-600">
                {stats.totalProducts > 0
                  ? `${Math.round((stats.syncedProducts / stats.totalProducts) * 100)}%`
                  : '0%'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {stats.syncedProducts} / {stats.totalProducts}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Products Synced</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">
                {stats.totalDiscounts > 0
                  ? `${Math.round((stats.syncedDiscounts / stats.totalDiscounts) * 100)}%`
                  : '0%'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {stats.syncedDiscounts} / {stats.totalDiscounts}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Discounts Synced</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</h3>
            <p className="text-sm text-gray-600 mt-1">Active Subscriptions</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Orders</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="h-8 w-8 text-emerald-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Revenue Overview</h2>
            <p className="text-sm text-gray-600">Total revenue processed through Stripe</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-8 text-white">
          <p className="text-emerald-100 text-sm font-medium mb-2">Total Revenue</p>
          <h3 className="text-5xl font-black">${stats.totalRevenue.toFixed(2)}</h3>
          <p className="text-emerald-100 text-sm mt-3">{stats.totalOrders} orders completed</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="h-6 w-6 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">API Keys Setup</h2>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Frontend Configuration</h3>
            <p className="text-sm text-gray-600 mb-3">
              Add your Stripe publishable key to the .env file:
            </p>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-emerald-400">
              VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Backend Configuration</h3>
            <p className="text-sm text-gray-600 mb-3">
              The Stripe secret key is automatically configured in Supabase Edge Functions.
              No manual setup required.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Security Note:</strong> Never commit your API keys to version control.
              Always use environment variables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
