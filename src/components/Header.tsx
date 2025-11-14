import { Search, ShoppingCart, Menu, X, User, Package, Settings, LogOut, Shield } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import LoginModal from './auth/LoginModal';
import RegisterModal from './auth/RegisterModal';
import ForgotPasswordModal from './auth/ForgotPasswordModal';
import CartDrawer from './cart/CartDrawer';

interface HeaderProps {
  onSearch: (query: string) => void;
  onNavigate: (section: string) => void;
  currentSection: string;
}

export default function Header({ onSearch, onNavigate, currentSection }: HeaderProps) {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { getTotalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    onNavigate('products');
  };

  const navItems = [
    { name: 'Home', section: 'home' },
    { name: 'Products', section: 'products', hasDropdown: true },
    { name: 'Smoothie Bar', section: 'smoothie' },
    { name: 'Blog', section: 'blog' },
    { name: 'Contact', section: 'contact' },
  ];

  const productCategories = [
    { name: 'Pre Workout', slug: 'pre-workout' },
    { name: 'Protein', slug: 'protein-powders' },
    { name: 'Basics', slug: 'supplements' },
    { name: 'Health and Wellness', slug: 'vitamins' },
    { name: 'Energy Drinks', slug: 'energy-drinks' },
    { name: 'Snacks', slug: 'healthy-snacks' },
  ];

  const handleCategoryClick = async (slug: string) => {
    const { data } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (data) {
      onSearch('');
      onNavigate('products');
      setTimeout(() => {
        const event = new CustomEvent('categoryFilter', { detail: data.id });
        window.dispatchEvent(event);
      }, 100);
    }
    setShowProductsDropdown(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const handleNavigateToProfile = () => {
    onNavigate('profile');
    setShowUserMenu(false);
  };

  const handleNavigateToAdmin = () => {
    onNavigate('admin');
    setShowUserMenu(false);
  };

  const handleCheckout = () => {
    onNavigate('checkout');
  };

  const cartItemCount = getTotalItems();

  return (
    <>
      <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
              <img src="/images/favicon.png" alt="Nutrition Factory" className="h-12 w-12" />
              <div className="text-2xl font-black tracking-wider text-white">
                NUTRITION FACTORY
              </div>
            </div>

            <nav className="hidden md:flex space-x-8 items-center">
              {navItems.map((item) => {
                if (item.hasDropdown) {
                  return (
                    <div
                      key={item.section}
                      className="relative"
                      onMouseEnter={() => setShowProductsDropdown(true)}
                      onMouseLeave={() => setShowProductsDropdown(false)}
                    >
                      <button
                        onClick={() => onNavigate(item.section)}
                        className={`text-sm font-bold uppercase tracking-wider transition-colors ${
                          currentSection === item.section
                            ? 'text-yellow-400'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        {item.name}
                      </button>

                      {showProductsDropdown && (
                        <div className="absolute top-full left-0 pt-2 -ml-4">
                          <div className="w-56 bg-gray-900 border border-gray-800 shadow-2xl">
                            {productCategories.map((category) => (
                              <button
                                key={category.slug}
                                onClick={() => handleCategoryClick(category.slug)}
                                className="block w-full text-left px-6 py-3 text-sm font-bold uppercase tracking-wide text-gray-300 hover:bg-black hover:text-yellow-400 transition-colors border-b border-gray-800 last:border-b-0"
                              >
                                {category.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.section}
                    onClick={() => onNavigate(item.section)}
                    className={`text-sm font-bold uppercase tracking-wider transition-colors ${
                      currentSection === item.section
                        ? 'text-yellow-400'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 pl-10 pr-4 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
              </form>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 hover:border-yellow-400 transition-colors"
                  >
                    <User className="h-5 w-5 text-white" />
                    <span className="text-white font-bold text-sm">
                      {profile?.full_name?.split(' ')[0] || 'Account'}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-800 shadow-2xl">
                      <button
                        onClick={handleNavigateToProfile}
                        className="flex items-center gap-3 w-full text-left px-6 py-3 text-sm font-bold text-gray-300 hover:bg-black hover:text-yellow-400 transition-colors border-b border-gray-800"
                      >
                        <User className="h-4 w-4" />
                        MY PROFILE
                      </button>
                      {isAdmin && (
                        <button
                          onClick={handleNavigateToAdmin}
                          className="flex items-center gap-3 w-full text-left px-6 py-3 text-sm font-bold text-gray-300 hover:bg-black hover:text-yellow-400 transition-colors border-b border-gray-800"
                        >
                          <Shield className="h-4 w-4" />
                          ADMIN DASHBOARD
                        </button>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full text-left px-6 py-3 text-sm font-bold text-gray-300 hover:bg-black hover:text-red-400 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        SIGN OUT
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-6 py-2 bg-yellow-400 text-black font-black uppercase tracking-wider hover:bg-yellow-300 transition-colors"
                >
                  SIGN IN
                </button>
              )}

              <button
                onClick={() => setShowCartDrawer(true)}
                className="relative p-2 hover:bg-gray-900 transition-colors"
              >
                <ShoppingCart className="h-6 w-6 text-white" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-black">
            <div className="px-4 py-4 space-y-3">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
              </form>

              {user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 bg-gray-900 text-white font-bold">
                    {profile?.full_name || 'Account'}
                  </div>
                  <button
                    onClick={() => {
                      handleNavigateToProfile();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-900 font-bold"
                  >
                    <User className="h-4 w-4" />
                    MY PROFILE
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        handleNavigateToAdmin();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-900 font-bold"
                    >
                      <Shield className="h-4 w-4" />
                      ADMIN DASHBOARD
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-400 hover:bg-gray-900 font-bold"
                  >
                    <LogOut className="h-4 w-4" />
                    SIGN OUT
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-yellow-400 text-black py-2 font-black uppercase tracking-wider hover:bg-yellow-300 transition-colors"
                >
                  SIGN IN
                </button>
              )}

              <button
                onClick={() => {
                  setShowCartDrawer(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                <span className="flex items-center gap-2 font-bold">
                  <ShoppingCart className="h-5 w-5" />
                  VIEW CART
                </span>
                {cartItemCount > 0 && (
                  <span className="bg-yellow-400 text-black text-xs font-black px-2 py-1 rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {navItems.map((item) => (
                <div key={item.section}>
                  <button
                    onClick={() => {
                      if (!item.hasDropdown) {
                        onNavigate(item.section);
                        setMobileMenuOpen(false);
                      }
                    }}
                    className={`block w-full text-left px-4 py-2 font-bold uppercase tracking-wider text-sm transition-colors ${
                      currentSection === item.section
                        ? 'bg-gray-900 text-yellow-400'
                        : 'text-gray-300 hover:bg-gray-900'
                    }`}
                  >
                    {item.name}
                  </button>
                  {item.hasDropdown && (
                    <div className="pl-4 space-y-1">
                      {productCategories.map((category) => (
                        <button
                          key={category.slug}
                          onClick={() => {
                            handleCategoryClick(category.slug);
                            setMobileMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-400 hover:text-yellow-400 hover:bg-gray-900 transition-colors"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
        onSwitchToForgotPassword={() => {
          setShowLoginModal(false);
          setShowForgotPasswordModal(true);
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onSwitchToLogin={() => {
          setShowForgotPasswordModal(false);
          setShowLoginModal(true);
        }}
      />

      <CartDrawer
        isOpen={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
        onCheckout={handleCheckout}
      />
    </>
  );
}
