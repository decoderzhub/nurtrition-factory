import { useEffect, useState } from 'react';
import { supabase, Product } from '../lib/supabase';
import { TrendingUp, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface TopSellingProps {
  onProductClick: (product: Product) => void;
}

export default function TopSelling({ onProductClick }: TopSellingProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchTopSellingProducts();
  }, []);

  const fetchTopSellingProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_top_selling', true)
        .limit(4);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching top selling products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <div className="py-16 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="h-10 w-10 text-yellow-400" />
            <h2 className="text-4xl font-black text-white uppercase tracking-wider">Top Sellers</h2>
          </div>
          <p className="text-lg text-gray-400">Customer favorites flying off the shelves</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group relative bg-black border border-gray-800 overflow-hidden hover:border-yellow-400 transition-all duration-300"
            >
              <div className="absolute top-4 left-4 z-10 bg-yellow-400 text-black w-12 h-12 flex items-center justify-center font-black text-lg shadow-lg">
                #{index + 1}
              </div>

              <div
                className="relative aspect-square overflow-hidden bg-gray-900 cursor-pointer"
                onClick={() => onProductClick(product)}
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 uppercase tracking-wide">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-2xl font-black text-yellow-400">
                    ${product.price.toFixed(2)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product.id);
                    }}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black p-3 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
