import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onNavigate: (section: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  return (
    <div className="relative bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90"></div>
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg')] bg-cover bg-center opacity-30"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none uppercase tracking-tight">
            Fuel Your <span className="text-yellow-400">Fitness</span> Journey
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-300 leading-relaxed font-medium">
            Premium supplements, energy drinks, and nutrition products to help you reach your goals.
            Quality you can trust, results you can see.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onNavigate('products')}
              className="group px-10 py-4 bg-yellow-400 text-black font-black uppercase tracking-wider hover:bg-yellow-300 transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center justify-center gap-2"
            >
              Shop Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('smoothie')}
              className="px-10 py-4 bg-transparent border-2 border-white text-white font-black uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300"
            >
              Smoothie Bar
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
