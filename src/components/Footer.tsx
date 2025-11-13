import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (section: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-4">
              Nutrition Factory
            </h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Your trusted source for premium supplements, energy drinks, and nutrition products.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-900 hover:bg-yellow-400 hover:text-black p-3 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-900 hover:bg-yellow-400 hover:text-black p-3 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-900 hover:bg-yellow-400 hover:text-black p-3 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-900 hover:bg-yellow-400 hover:text-black p-3 transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-black uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('smoothie')}
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  Smoothie Bar
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('blog')}
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  Blog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-black uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <button className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Energy Drinks
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Supplements
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Protein Powders
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Pre-Workout
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Vitamins
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-black uppercase tracking-wider mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-1" />
                <span>123 Fitness Street<br />Wellness City, WC 12345</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <a href="tel:+15551234567" className="hover:text-emerald-400 transition-colors">
                  (555) 123-4567
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <a
                  href="mailto:info@nutritionfactory.com"
                  className="hover:text-emerald-400 transition-colors"
                >
                  info@nutritionfactory.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} Nutrition Factory LLC. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <button className="text-gray-400 hover:text-emerald-400 transition-colors">
                Privacy Policy
              </button>
              <button className="text-gray-400 hover:text-emerald-400 transition-colors">
                Terms of Service
              </button>
              <button className="text-gray-400 hover:text-emerald-400 transition-colors">
                Shipping Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
