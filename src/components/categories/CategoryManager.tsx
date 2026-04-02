import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Tag, ChevronRight } from 'lucide-react';
import type { Category } from '@/types';
import { useBudget } from '@/hooks/useBudget';
import { useCategories } from '@/hooks/useCategories';
import { CategoryForm } from './CategoryForm';
import { DynamicIcon } from '@/components/DynamicIcon';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

function CategoryRow({
  category,
  children,
  onEdit,
  onDelete,
}: {
  category: Category;
  children?: Category[];
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = children && children.length > 0;

  return (
    <div>
      <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-elevated rounded-xl transition-colors group">
        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => hasChildren && setExpanded((v) => !v)}
          className={`w-4 shrink-0 ${hasChildren ? 'text-text-muted hover:text-text-primary' : 'text-transparent'}`}
        >
          <ChevronRight
            size={14}
            className={`transition-transform ${expanded && hasChildren ? 'rotate-90' : ''}`}
          />
        </button>

        {/* Icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <DynamicIcon name={category.icon} size={15} style={{ color: category.color }} />
        </div>

        {/* Name */}
        <span className="flex-1 text-sm font-medium text-text-primary">{category.name}</span>

        {/* Badges */}
        <div className="flex items-center gap-2">
          {category.isBuiltIn && (
            <Badge color="#475569" className="text-[10px]">Built-in</Badge>
          )}
          <Badge color={category.color} className="text-[10px] capitalize">{category.type}</Badge>
        </div>

        {/* Actions — only for custom categories */}
        {!category.isBuiltIn && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(category)}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-border rounded-lg transition-colors"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(category)}
              className="p-1.5 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Subcategories */}
      {hasChildren && expanded && (
        <div className="ml-7 pl-4 border-l border-border space-y-0 mt-0.5 mb-1">
          {children!.map((child) => (
            <div
              key={child.id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-elevated rounded-xl transition-colors group"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${child.color}20` }}
              >
                <DynamicIcon name={child.icon} size={13} style={{ color: child.color }} />
              </div>
              <span className="flex-1 text-xs font-medium text-text-secondary">{child.name}</span>
              <Badge color={child.color} className="text-[10px] capitalize">{child.type}</Badge>
              {!child.isBuiltIn && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(child)}
                    className="p-1 text-text-muted hover:text-text-primary hover:bg-border rounded-lg transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => onDelete(child)}
                    className="p-1 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
  const { dispatch } = useBudget();
  const {
    allCategories,
    topLevelExpense,
    topLevelIncome,
    expenseCategories,
    incomeCategories,
  } = useCategories();

  const [showForm, setShowForm]           = useState(false);
  const [editCategory, setEditCategory]   = useState<Category | null>(null);
  const [defaultType, setDefaultType]     = useState<'income' | 'expense'>('expense');
  const [activeTab, setActiveTab]         = useState<'expense' | 'income'>('expense');

  const handleSave = (cat: Category) => {
    if (editCategory) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: cat });
    } else {
      dispatch({ type: 'ADD_CATEGORY', payload: cat });
    }
  };

  const handleDelete = (cat: Category) => {
    const hasChildren = allCategories.some((c) => c.parentId === cat.id);
    const msg = hasChildren
      ? `Delete "${cat.name}" and all its subcategories?`
      : `Delete "${cat.name}"?`;
    if (window.confirm(msg)) {
      dispatch({ type: 'DELETE_CATEGORY', payload: { id: cat.id } });
    }
  };

  const openAdd = (type: 'income' | 'expense') => {
    setEditCategory(null);
    setDefaultType(type);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditCategory(cat);
    setDefaultType(cat.type);
    setShowForm(true);
  };

  const topLevel     = activeTab === 'expense' ? topLevelExpense : topLevelIncome;
  const allOfType    = activeTab === 'expense' ? expenseCategories : incomeCategories;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Categories" size="lg">
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-elevated rounded-xl">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeTab === t ? 'bg-accent-primary text-white' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-0.5 max-h-[420px] overflow-y-auto pr-1">
            {topLevel.length === 0 ? (
              <EmptyState icon={<Tag size={22} />} title="No categories" />
            ) : (
              topLevel.map((parent) => (
                <CategoryRow
                  key={parent.id}
                  category={parent}
                  children={allOfType.filter((c) => c.parentId === parent.id)}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <p className="text-xs text-text-muted">
              {allOfType.filter((c) => !c.isBuiltIn).length} custom {activeTab} categories
            </p>
            <Button
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => openAdd(activeTab)}
            >
              New {activeTab === 'expense' ? 'Expense' : 'Income'} Category
            </Button>
          </div>
        </div>
      </Modal>

      <CategoryForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        initial={editCategory}
        defaultType={defaultType}
      />
    </>
  );
}
