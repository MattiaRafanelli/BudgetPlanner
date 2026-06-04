import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Category } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DynamicIcon } from '@/components/DynamicIcon';
import { useCategories } from '@/hooks/useCategories';
import { useBudget } from '@/hooks/useBudget';
import { CategoryForm } from './CategoryForm';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
  const { allCategories } = useCategories();
  const { dispatch } = useBudget();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');

  const handleAddNew = (type: 'income' | 'expense') => {
    setSelectedType(type);
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleSaveCategory = (category: Category) => {
    dispatch({ type: 'ADD_CATEGORY', payload: category });
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      dispatch({ type: 'DELETE_CATEGORY', payload: { id: categoryId } });
    }
  };

  const expenseCategories = allCategories.filter((c: Category) => c.type === 'expense');
  const incomeCategories = allCategories.filter((c: Category) => c.type === 'income');

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Categories" size="lg">
        <div className="space-y-6">
          {/* Expense Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                Expense Categories
              </h3>
              <Button
                size="sm"
                variant="secondary"
                icon={<Plus size={14} />}
                onClick={() => handleAddNew('expense')}
              >
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {expenseCategories.length === 0 ? (
                <p className="text-sm text-text-muted">No expense categories yet</p>
              ) : (
                expenseCategories.map((cat: Category) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-elevated border border-border hover:border-border-focus transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        <DynamicIcon
                          name={cat.icon}
                          size={16}
                          style={{ color: cat.color }}
                        />
                      </div>
                      <span className="text-sm font-medium text-text-primary">
                        {cat.name}
                      </span>
                      {cat.isBuiltIn && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary">
                          Built-in
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(cat)}
                      >
                        Edit
                      </Button>
                      {!cat.isBuiltIn && (
                        <button
                          type="button"
                          title="Delete category"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-text-muted hover:text-destructive transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Income Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                Income Categories
              </h3>
              <Button
                size="sm"
                variant="secondary"
                icon={<Plus size={14} />}
                onClick={() => handleAddNew('income')}
              >
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {incomeCategories.length === 0 ? (
                <p className="text-sm text-text-muted">No income categories yet</p>
              ) : (
                incomeCategories.map((cat: Category) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-elevated border border-border hover:border-border-focus transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        <DynamicIcon
                          name={cat.icon}
                          size={16}
                          style={{ color: cat.color }}
                        />
                      </div>
                      <span className="text-sm font-medium text-text-primary">
                        {cat.name}
                      </span>
                      {cat.isBuiltIn && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary">
                          Built-in
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(cat)}
                      >
                        Edit
                      </Button>
                      {!cat.isBuiltIn && (
                        <button
                          type="button"
                          title="Delete category"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-text-muted hover:text-destructive transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal>

      <CategoryForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSaveCategory}
        initial={editingCategory}
        defaultType={selectedType}
      />
    </>
  );
}
