import { useEffect, useState } from 'react';
import { supabase, Category } from '../lib/supabase';
import { ArrowRight } from 'lucide-react';

interface CategoriesProps {
  onCategorySelect: (categoryId: string) => void;
}

export default function Categories({ onCategorySelect }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white uppercase tracking-wider">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-48 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-white uppercase tracking-wider mb-4">Shop by Category</h2>
          <p className="text-lg text-gray-400">Find exactly what you need for your fitness goals</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className="group relative bg-gray-800 border border-gray-700 overflow-hidden hover:border-yellow-400 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-black text-sm mb-1 uppercase tracking-wide">{category.name}</h3>
                <div className="flex items-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity text-yellow-400">
                  <span>Shop Now</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
