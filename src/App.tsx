import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import FeaturedProducts from './components/FeaturedProducts';
import TopSelling from './components/TopSelling';
import Reviews from './components/Reviews';
import Products from './components/Products';
import Blog from './components/Blog';
import SmoothieBar from './components/SmoothieBar';
import Contact from './components/Contact';
import Footer from './components/Footer';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/admin/AdminDashboard';
import CheckoutPage from './components/checkout/CheckoutPage';
import { Product } from './lib/supabase';

function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCategoryFilter('');
  };

  const handleCategorySelect = (categoryId: string) => {
    setCategoryFilter(categoryId);
    setSearchQuery('');
    setCurrentSection('products');
  };

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product);
  };

  return (
    <div className="min-h-screen bg-black">
      <Header
        onSearch={handleSearch}
        onNavigate={handleNavigate}
        currentSection={currentSection}
      />

      {currentSection === 'home' && (
        <>
          <Hero onNavigate={handleNavigate} />
          <TopSelling onProductClick={handleProductClick} />
          <FeaturedProducts onProductClick={handleProductClick} />
          <Categories onCategorySelect={handleCategorySelect} />
          <Reviews />
        </>
      )}

      {currentSection === 'products' && (
        <Products searchQuery={searchQuery} categoryFilter={categoryFilter} />
      )}

      {currentSection === 'blog' && <Blog />}

      {currentSection === 'smoothie' && <SmoothieBar />}

      {currentSection === 'contact' && <Contact />}

      {currentSection === 'profile' && <UserProfile />}

      {currentSection === 'checkout' && (
        <CheckoutPage onBack={() => handleNavigate('home')} />
      )}

      {currentSection === 'admin' && <AdminDashboard />}

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
