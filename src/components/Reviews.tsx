import { useEffect, useState } from 'react';
import { supabase, Review } from '../lib/supabase';
import { Star, Quote } from 'lucide-react';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .is('product_id', null)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading || reviews.length === 0) {
    return null;
  }

  return (
    <div className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-white uppercase tracking-wider mb-4">What Our Customers Say</h2>
          <p className="text-lg text-gray-400">Real reviews from real customers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-900 border border-gray-800 p-8 hover:border-gray-700 transition-all relative"
            >
              <Quote className="absolute top-6 right-6 h-12 w-12 text-gray-800" />

              <div className="relative z-10">
                <div className="mb-4">{renderStars(review.rating)}</div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  "{review.comment}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-400 flex items-center justify-center text-black font-black text-lg">
                    {review.author_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-white uppercase tracking-wide">{review.author_name}</div>
                    <div className="text-sm text-gray-500 font-medium">Verified Customer</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
