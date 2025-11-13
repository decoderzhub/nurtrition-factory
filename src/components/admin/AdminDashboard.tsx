import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  MessageSquare,
  Users,
  Mail,
  Star,
  Menu,
  X,
  LogOut,
  Coffee,
  Tag,
  Settings,
} from 'lucide-react';
import DashboardOverview from './DashboardOverview';
import ProductsManagement from './ProductsManagement';
import OrdersManagement from './OrdersManagement';
import BlogManagement from './BlogManagement';
import SmoothieManagement from './SmoothieManagement';
import ReviewsManagement from './ReviewsManagement';
import UsersManagement from './UsersManagement';
import ContactManagement from './ContactManagement';
import DiscountManagement from './DiscountManagement';
import StripeSettings from './StripeSettings';

type Section =
  | 'overview'
  | 'products'
  | 'orders'
  | 'smoothies'
  | 'blog'
  | 'reviews'
  | 'users'
  | 'contact'
  | 'discounts'
  | 'stripe-settings';

export default function AdminDashboard() {
  const { isAdmin, profile, signOut } = useAuth();
  const [currentSection, setCurrentSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <p className="text-sm text-gray-500">
            Contact an administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview' as Section, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as Section, label: 'Products', icon: Package },
    { id: 'orders' as Section, label: 'Orders', icon: ShoppingCart },
    { id: 'discounts' as Section, label: 'Discount Codes', icon: Tag },
    { id: 'smoothies' as Section, label: 'Smoothie Menu', icon: Coffee },
    { id: 'blog' as Section, label: 'Blog Posts', icon: FileText },
    { id: 'reviews' as Section, label: 'Reviews', icon: Star },
    { id: 'users' as Section, label: 'Users', icon: Users },
    { id: 'contact' as Section, label: 'Contact Forms', icon: Mail },
    { id: 'stripe-settings' as Section, label: 'Stripe Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h2 className="font-bold text-lg">Admin Panel</h2>
              <p className="text-xs text-gray-400 truncate">{profile?.full_name}</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            title={!sidebarOpen ? 'Sign Out' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {currentSection === 'overview' && <DashboardOverview />}
          {currentSection === 'products' && <ProductsManagement />}
          {currentSection === 'orders' && <OrdersManagement />}
          {currentSection === 'discounts' && <DiscountManagement />}
          {currentSection === 'smoothies' && <SmoothieManagement />}
          {currentSection === 'blog' && <BlogManagement />}
          {currentSection === 'reviews' && <ReviewsManagement />}
          {currentSection === 'users' && <UsersManagement />}
          {currentSection === 'contact' && <ContactManagement />}
          {currentSection === 'stripe-settings' && <StripeSettings />}
        </div>
      </main>
    </div>
  );
}
