import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Plus, Trash2, Edit2, Tag, Check } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../../types/index.js';

export function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory, t, getCategoryName } = useFinance();
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#10b981');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

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

  const handleStartAdd = () => {
    setEditingCategory(null);
    setNewCatName('');
    setNewCatColor('#10b981');
    setShowAddForm(!showAddForm);
  };

  const handleStartEdit = (cat) => {
    setEditingCategory(cat);
    // If name was corrupted to the raw id, leave it blank so user can type the real name
    const initialName = cat.name && !cat.name.startsWith('cat-') ? cat.name : '';
    setNewCatName(initialName);
    setNewCatColor(cat.color || '#10b981');
    setShowAddForm(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    if (editingCategory) {
      if (updateCategory) {
        updateCategory(editingCategory.id, {
          name: trimmed,
          color: newCatColor,
        });
      }
    } else {
      addCategory({
        name: trimmed,
        color: newCatColor,
        icon: 'Tag',
        isCustom: true,
      });
    }

    setNewCatName('');
    setEditingCategory(null);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setNewCatName('');
    setShowAddForm(false);
  };

  return (
    <Card padding="p-5" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('categoryManager.title')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('categoryManager.subtitle')}
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleStartAdd}
          icon={Plus}
          className="text-xs"
        >
          {showAddForm && !editingCategory ? t('categoryManager.close') : t('categoryManager.addCategory')}
        </Button>
      </div>

      {/* Add / Edit Category Form */}
      {showAddForm && (
        <form onSubmit={handleSave} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-3 animate-slide-up">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {editingCategory ? t('categoryManager.editCategory') : t('categoryManager.addCategory')}
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {t('categoryManager.nameLabel')}
            </label>
            <input
              type="text"
              placeholder={t('categoryManager.namePlaceholder')}
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t('categoryManager.colorLabel')}
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setNewCatColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center text-white ${
                    newCatColor === c ? 'scale-125 ring-2 ring-offset-2 ring-primary-500' : 'hover:scale-110'
                  }`}
                >
                  {newCatColor === c && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button size="sm" variant="secondary" onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <Button size="sm" variant="primary" type="submit">
              {t('common.save')}
            </Button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
        {categories.map((cat) => {
          const isCustom = cat.isCustom || cat.id.startsWith('cat-') || !DEFAULT_CATEGORIES.some((dc) => dc.id === cat.id);
          const displayName = getCategoryName(cat.id, cat.name);

          return (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2.5 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || '#10b981' }}
                />
                <span
                  className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate"
                  title={displayName}
                >
                  {displayName}
                </span>
              </div>

              {/* Actions for custom categories */}
              {isCustom && (
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(cat)}
                    className="p-1 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-all"
                    title={t('categoryManager.editCategory')}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-all"
                    title={t('common.delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
