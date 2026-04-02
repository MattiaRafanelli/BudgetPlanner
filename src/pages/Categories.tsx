import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, Tag, FolderOpen } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { PageContainer } from '@/components/layout/PageContainer';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { DynamicIcon } from '@/components/DynamicIcon';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBudget } from '@/hooks/useBudget';
import { useCategories } from '@/hooks/useCategories';
import type { Category } from '@/types';

// ── Single category row ────────────────────────────────────────────────────

function CategoryRow({
  category,
  subcategories,
  onEdit,
  onDelete,
  onAddSub,
}: {
  category: Category;
  subcategories: Category[];
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onAddSub: (parent: Category) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      {/* Parent row */}
      <div className="flex items-center gap-3 px-4 py-3.5 bg-surface group hover:bg-elevated transition-colors">
        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`w-5 shrink-0 text-text-muted hover:text-text-primary transition-transform ${
            subcategories.length === 0 ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          <ChevronRight
            size={15}
            className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          />
        </button>

        {/* Icon */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <DynamicIcon name={category.icon} size={17} style={{ color: category.color }} />
        </div>

        {/* Name + badges */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-text-primary">{category.name}</span>
          {category.isBuiltIn && (
            <Badge color="#475569" className="text-[10px]">Built-in</Badge>
          )}
          {subcategories.length > 0 && (
            <span className="text-[11px] text-text-muted">{subcategories.length} sub</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddSub(category)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors"
            title="Add subcategory"
          >
            <Plus size={12} /> Sub
          </button>
          {!category.isBuiltIn && (
            <>
              <button
                onClick={() => onEdit(category)}
                className="p-1.5 text-text-muted hover:text-text-primary hover:bg-border rounded-lg transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(category)}
                className="p-1.5 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Subcategories */}
      {open && subcategories.length > 0 && (
        <div className="border-t border-border bg-base/40">
          {subcategories.map((child, idx) => (
            <div
              key={child.id}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-elevated transition-colors group ${
                idx < subcategories.length - 1 ? 'border-b border-border/50' : ''
              }`}
            >
              {/* Indent + connector */}
              <div className="w-5 shrink-0 flex justify-center">
                <div className="w-px h-4 bg-border rounded" />
              </div>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${child.color}20` }}
              >
                <DynamicIcon name={child.icon} size={13} style={{ color: child.color }} />
              </div>
              <span className="flex-1 text-sm text-text-secondary font-medium">{child.name}</span>
              <Badge color={child.color} className="text-[10px]">{child.type}</Badge>

              {!child.isBuiltIn && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(child)}
                    className="p-1.5 text-text-muted hover:text-text-primary hover:bg-border rounded-lg transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(child)}
                    className="p-1.5 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={13} />
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

// ── Column (Expense or Income) ─────────────────────────────────────────────

function CategoryColumn({
  title,
  color,
  topLevel,
  allOfType,
  onEdit,
  onDelete,
  onAdd,
  onAddSub,
}: {
  title: string;
  color: string;
  topLevel: Category[];
  allOfType: Category[];
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onAdd: () => void;
  onAddSub: (parent: Category) => void;
}) {
  const customCount = allOfType.filter((c) => !c.isBuiltIn).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Column header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">{title}</h2>
          <span className="text-xs text-text-muted">
            {topLevel.length} categories · {customCount} custom
          </span>
        </div>
        <Button size="sm" icon={<Plus size={14} />} onClick={onAdd}>
          New
        </Button>
      </div>

      {/* List */}
      {topLevel.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<Tag size={22} />}
            title={`No ${title.toLowerCase()} categories`}
            description="Create your first category to start organizing."
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {topLevel.map((parent) => (
            <CategoryRow
              key={parent.id}
              category={parent}
              subcategories={allOfType.filter((c) => c.parentId === parent.id)}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSub={onAddSub}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export function Categories() {
  const { dispatch } = useBudget();
  const {
    allCategories,
    topLevelExpense,
    topLevelIncome,
    expenseCategories,
    incomeCategories,
  } = useCategories();

  const [showForm, setShowForm]         = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [defaultType, setDefaultType]   = useState<'income' | 'expense'>('expense');
  const [defaultParent, setDefaultParent] = useState<string | null>(null);

  const openAdd = (type: 'income' | 'expense', parentId: string | null = null) => {
    setEditCategory(null);
    setDefaultType(type);
    setDefaultParent(parentId);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditCategory(cat);
    setDefaultType(cat.type);
    setDefaultParent(cat.parentId);
    setShowForm(true);
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

  const handleSave = (cat: Category) => {
    if (editCategory) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: cat });
    } else {
      dispatch({ type: 'ADD_CATEGORY', payload: cat });
    }
  };

  // Build a CategoryForm initial value that pre-selects the parent
  const formInitial: Category | null = editCategory
    ? editCategory
    : defaultParent
    ? ({
        id: '',
        name: '',
        type: defaultType,
        color: '#6C63FF',
        icon: 'Tag',
        parentId: defaultParent,
        isBuiltIn: false,
      } as Category)
    : null;

  return (
    <>
      <TopBar title="Categories" />
      <PageContainer>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <CategoryColumn
            title="Expense"
            color="#EF4444"
            topLevel={topLevelExpense}
            allOfType={expenseCategories}
            onEdit={openEdit}
            onDelete={handleDelete}
            onAdd={() => openAdd('expense')}
            onAddSub={(parent) => openAdd('expense', parent.id)}
          />
          <CategoryColumn
            title="Income"
            color="#22C55E"
            topLevel={topLevelIncome}
            allOfType={incomeCategories}
            onEdit={openEdit}
            onDelete={handleDelete}
            onAdd={() => openAdd('income')}
            onAddSub={(parent) => openAdd('income', parent.id)}
          />
        </div>
      </PageContainer>

      <CategoryForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setDefaultParent(null); }}
        onSave={handleSave}
        initial={formInitial}
        defaultType={defaultType}
      />
    </>
  );
}
