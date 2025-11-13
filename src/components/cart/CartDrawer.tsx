import { X, Plus, Minus, Trash2, ShoppingBag, AlertCircle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, updateQuantity, removeFromCart, getTotalPrice, loading } = useCart();
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    onCheckout();
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-75 z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-800 z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-black text-white">YOUR CART</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Loading cart...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <ShoppingBag className="h-16 w-16 text-gray-700 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-400 text-center mb-6">
              Add some products to get started!
            </p>
            <button
              onClick={onClose}
              className="bg-yellow-400 text-black px-6 py-3 font-black uppercase tracking-wider hover:bg-yellow-300 transition-colors"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.filter(item => item.product).map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-black border border-gray-800 p-4"
                >
                  <img
                    src={item.product?.image_url || 'https://via.placeholder.com/80'}
                    alt={item.product?.name || 'Product'}
                    className="w-20 h-20 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm mb-1 truncate">
                      {item.product?.name || 'Unknown Product'}
                    </h3>
                    <p className="text-yellow-400 font-black text-lg mb-2">
                      ${Number(item.product?.price || 0).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 bg-gray-800 hover:bg-gray-700 transition-colors"
                      >
                        <Minus className="h-4 w-4 text-white" />
                      </button>
                      <span className="text-white font-bold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 bg-gray-800 hover:bg-gray-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {!user && (
                <div className="flex items-start gap-3 p-4 bg-yellow-900 border border-yellow-700">
                  <AlertCircle className="h-5 w-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-100">
                    <p className="font-bold mb-1">Pro tip!</p>
                    <p>
                      Create an account to save your cart, view order history, and unlock membership discounts!
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-800 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase text-sm">Subtotal</span>
                <span className="text-white font-black text-xl">
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full bg-yellow-400 text-black py-4 font-black uppercase tracking-wider hover:bg-yellow-300 transition-colors"
              >
                PROCEED TO CHECKOUT
              </button>

              <button
                onClick={onClose}
                className="w-full border-2 border-gray-700 text-white py-3 font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
