import { useEffect, useState } from 'react';
import { supabase, Product } from '../lib/supabase';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface FeaturedProductsProps {
  onProductClick: (product: Product) => void;
}

export default function FeaturedProducts({ onProductClick }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .limit(6);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white uppercase tracking-wider">Featured Products</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 h-96 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-white uppercase tracking-wider mb-4">Featured Products</h2>
          <p className="text-lg text-gray-400">Handpicked selections for your fitness journey</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-gray-900 border border-gray-800 overflow-hidden hover:border-yellow-400 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div
                className="relative aspect-square overflow-hidden bg-gray-800 cursor-pointer"
                onClick={() => onProductClick(product)}
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {product.is_top_selling && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Best Seller
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 uppercase tracking-wide">
                  {product.name}
                </h3>
                <p className="text-gray-400 mb-4 line-clamp-2 text-sm leading-relaxed">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-3xl font-black text-yellow-400">
                    ${product.price.toFixed(2)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product.id);
                    }}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 font-black uppercase text-sm tracking-wider transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add
                  </button>
                </div>

                {product.stock_quantity > 0 && product.stock_quantity < 10 && (
                  <div className="mt-3 text-orange-400 text-sm font-bold uppercase tracking-wide">
                    Only {product.stock_quantity} left!
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
