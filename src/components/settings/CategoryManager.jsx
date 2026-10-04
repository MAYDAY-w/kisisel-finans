import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Plus, Trash2, Tag } from 'lucide-react';

export function CategoryManager() {
  const { categories, addCategory, deleteCategory } = useFinance();
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#10b981');
  const [showAddForm, setShowAddForm] = useState(false);

  const colors = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#f97316', // orange
    '#ec4899', // pink
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#eab308', // yellow
    '#64748b', // slate
  ];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      color: newCatColor,
      icon: 'Tag',
    });

    setNewCatName('');
    setShowAddForm(false);
  };

  return (
    <Card padding="p-5" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Kategoriler</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            İşlemlerinizi sınıflandırmak için kategorileri özelleştirin
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddForm(!showAddForm)}
          icon={Plus}
          className="text-xs"
        >
          {showAddForm ? 'Kapat' : 'Kategori Ekle'}
        </Button>
      </div>

      {/* Add New Category Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 animate-slide-up">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Kategori Adı
            </label>
            <input
              type="text"
              placeholder="Örn: Evcil Hayvan, Kitap, Kira..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Renk Seçimi
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setNewCatColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    newCatColor === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button size="sm" variant="secondary" onClick={() => setShowAddForm(false)}>
              İptal
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Kaydet
            </Button>
          </div>
        </form>
      )}

      {/* Category List Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 transition-colors"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: cat.color || '#64748b' }}
            />
            <span>{cat.name}</span>
            {/* Allow delete only if more than 3 categories exist */}
            {categories.length > 3 && (
              <button
                type="button"
                onClick={() => deleteCategory(cat.id)}
                title="Kategoriyi Sil"
                className="text-slate-400 hover:text-rose-600 ml-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
