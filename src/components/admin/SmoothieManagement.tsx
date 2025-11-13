import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface SmoothieItem {
  id: string;
  name: string;
  description: string;
  price: number;
  ingredients: string[];
  image_url: string;
  available: boolean;
  category: string;
  created_at: string;
}

export default function SmoothieManagement() {
  const [smoothies, setSmoothies] = useState<SmoothieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSmoothie, setEditingSmoothie] = useState<SmoothieItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    ingredients: [] as string[],
    image_url: '',
    available: true,
    category: 'smoothie',
  });
  const [ingredientInput, setIngredientInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSmoothies();
  }, []);

  const fetchSmoothies = async () => {
    try {
      const { data, error } = await supabase
        .from('smoothie_menu_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSmoothies(data || []);
    } catch (err) {
      console.error('Error fetching smoothies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const smoothieData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        ingredients: formData.ingredients,
        image_url: formData.image_url,
        available: formData.available,
        category: formData.category,
      };

      if (editingSmoothie) {
        const { error } = await supabase
          .from('smoothie_menu_items')
          .update(smoothieData)
          .eq('id', editingSmoothie.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('smoothie_menu_items')
          .insert([smoothieData]);
        if (error) throw error;
      }

      await fetchSmoothies();
      closeModal();
    } catch (err: any) {
      setError(err.message || 'Failed to save smoothie');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this smoothie?')) return;

    try {
      const { error } = await supabase
        .from('smoothie_menu_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchSmoothies();
    } catch (err: any) {
      alert('Failed to delete smoothie: ' + err.message);
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('smoothie_menu_items')
        .update({ available: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await fetchSmoothies();
    } catch (err: any) {
      alert('Failed to update availability: ' + err.message);
    }
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, ingredientInput.trim()],
      });
      setIngredientInput('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const openModal = (smoothie?: SmoothieItem) => {
    if (smoothie) {
      setEditingSmoothie(smoothie);
      setFormData({
        name: smoothie.name,
        description: smoothie.description,
        price: smoothie.price.toString(),
        ingredients: smoothie.ingredients || [],
        image_url: smoothie.image_url,
        available: smoothie.available,
        category: smoothie.category,
      });
    } else {
      setEditingSmoothie(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        ingredients: [],
        image_url: '',
        available: true,
        category: 'smoothie',
      });
    }
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSmoothie(null);
    setError(null);
    setIngredientInput('');
  };

  const filteredSmoothies = smoothies.filter((smoothie) =>
    smoothie.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-12 w-12 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smoothie Menu Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your smoothie bar menu items and ingredients
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Smoothie
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search smoothies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSmoothies.map((smoothie) => (
          <div
            key={smoothie.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <img
                src={smoothie.image_url}
                alt={smoothie.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                {smoothie.available ? (
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Available
                  </span>
                ) : (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Unavailable
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {smoothie.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {smoothie.description}
              </p>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Ingredients:</p>
                <div className="flex flex-wrap gap-2">
                  {smoothie.ingredients?.slice(0, 3).map((ingredient, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {ingredient}
                    </span>
                  ))}
                  {smoothie.ingredients?.length > 3 && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      +{smoothie.ingredients.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-emerald-600">
                  ${smoothie.price.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleAvailability(smoothie.id, smoothie.available)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    smoothie.available
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  {smoothie.available ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                <button
                  onClick={() => openModal(smoothie)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(smoothie.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingSmoothie ? 'Edit Smoothie' : 'Add New Smoothie'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Smoothie Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredients
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={ingredientInput}
                      onChange={(e) => setIngredientInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addIngredient();
                        }
                      }}
                      placeholder="Add an ingredient..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {ingredient}
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="hover:text-emerald-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Smoothie Image
                  </label>
                  <ImageUpload
                    bucket="smoothie-images"
                    currentImageUrl={formData.image_url}
                    onImageUploaded={(url) =>
                      setFormData({ ...formData, image_url: url })
                    }
                    onRemove={() => setFormData({ ...formData, image_url: '' })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) =>
                        setFormData({ ...formData, available: e.target.checked })
                      }
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Available for order
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingSmoothie
                    ? 'Update Smoothie'
                    : 'Add Smoothie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
