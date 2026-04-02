import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Category } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DynamicIcon } from '@/components/DynamicIcon';
import { COLOR_PRESETS, ICON_OPTIONS } from '@/constants';
import { useCategories } from '@/hooks/useCategories';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  initial?: Category | null;
  defaultType?: 'income' | 'expense';
}

export function CategoryForm({
  isOpen,
  onClose,
  onSave,
  initial,
  defaultType = 'expense',
}: CategoryFormProps) {
  const { topLevelExpense, topLevelIncome } = useCategories();

  const [name, setName]       = useState('');
  const [type, setType]       = useState<'income' | 'expense'>(defaultType);
  const [color, setColor]     = useState(COLOR_PRESETS[0]);
  const [icon, setIcon]       = useState('Tag');
  const [parentId, setParentId] = useState<string>('none');
  const [iconSearch, setIconSearch] = useState('');
  const [error, setError]     = useState('');

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setType(initial.type);
      setColor(initial.color);
      setIcon(initial.icon);
      setParentId(initial.parentId ?? 'none');
    } else {
      setName('');
      setType(defaultType);
      setColor(COLOR_PRESETS[0]);
      setIcon('Tag');
      setParentId('none');
    }
    setError('');
    setIconSearch('');
  }, [isOpen, initial, defaultType]);

  const parentOptions = type === 'expense' ? topLevelExpense : topLevelIncome;

  const filteredIcons = iconSearch
    ? ICON_OPTIONS.filter((i) => i.toLowerCase().includes(iconSearch.toLowerCase()))
    : ICON_OPTIONS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }

    const slug = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const category: Category = {
      id: initial?.id ?? `custom_${slug}_${uuidv4().slice(0, 6)}`,
      name: name.trim(),
      type,
      color,
      icon,
      parentId: parentId === 'none' ? null : parentId,
      isBuiltIn: false,
    };
    onSave(category);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Edit Category' : 'New Category'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Type toggle */}
        <div className="flex gap-2 p-1 bg-elevated rounded-xl">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              type="button"
              disabled={!!initial}
              onClick={() => { setType(t); setParentId('none'); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                type === t ? 'bg-accent-primary text-white' : 'text-text-muted hover:text-text-primary'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t}
            </button>
          ))}
        </div>

        <Input
          label="Category Name"
          placeholder="e.g. Gym, Groceries, Freelance Design…"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          error={error}
        />

        {/* Parent category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            Subcategory of (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setParentId('none')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                parentId === 'none'
                  ? 'bg-accent-primary/15 border-accent-primary/40 text-accent-primary'
                  : 'border-border text-text-muted hover:text-text-primary hover:border-border'
              }`}
            >
              Top-level
            </button>
            {parentOptions.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setParentId(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  parentId === p.id
                    ? 'border-opacity-40 text-white'
                    : 'border-border text-text-muted hover:text-text-primary'
                }`}
                style={
                  parentId === p.id
                    ? { backgroundColor: `${p.color}20`, borderColor: `${p.color}60`, color: p.color }
                    : {}
                }
              >
                <DynamicIcon name={p.icon} size={12} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-all ${
                  color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Icon picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Icon</label>
          <Input
            placeholder="Search icons…"
            value={iconSearch}
            onChange={(e) => setIconSearch(e.target.value)}
          />
          <div className="grid grid-cols-8 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {filteredIcons.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                title={ic}
                className={`w-full aspect-square flex items-center justify-center rounded-xl transition-all ${
                  icon === ic
                    ? 'ring-2 ring-offset-1 ring-offset-surface'
                    : 'hover:bg-elevated'
                }`}
                style={icon === ic ? { backgroundColor: `${color}20`, ringColor: color } : {}}
              >
                <DynamicIcon
                  name={ic}
                  size={16}
                  style={{ color: icon === ic ? color : '#94A3B8' }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 p-3 bg-elevated rounded-xl border border-border">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <DynamicIcon name={icon} size={20} style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{name || 'Category Name'}</p>
            <p className="text-xs text-text-muted capitalize">{type}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? 'Save Changes' : 'Create Category'}</Button>
        </div>
      </form>
    </Modal>
  );
}
