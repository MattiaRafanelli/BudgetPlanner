import React, { useState, useEffect, useCallback } from 'react';
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

interface FormState {
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  parentId: string;
  iconSearch: string;
  error: string;
}

const getInitialState = (
  initial: Category | null | undefined,
  defaultType: 'income' | 'expense' = 'expense'
): FormState => {
  if (initial) {
    return {
      name: initial.name,
      type: initial.type,
      color: initial.color,
      icon: initial.icon,
      parentId: initial.parentId ?? 'none',
      iconSearch: '',
      error: '',
    };
  }

  return {
    name: '',
    type: defaultType,
    color: COLOR_PRESETS[0],
    icon: 'Tag',
    parentId: 'none',
    iconSearch: '',
    error: '',
  };
};

export function CategoryForm({
  isOpen,
  onClose,
  onSave,
  initial,
  defaultType = 'expense',
}: CategoryFormProps) {
  const { topLevelExpense, topLevelIncome } = useCategories();

  const [formState, setFormState] = useState<FormState>(
    getInitialState(initial, defaultType)
  );

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormState(getInitialState(initial, defaultType));
    }
  }, [isOpen]); // ← NUR isOpen, NOT defaultType!

  const parentOptions =
    formState.type === 'expense' ? topLevelExpense : topLevelIncome;

  const filteredIcons = formState.iconSearch
    ? ICON_OPTIONS.filter((i) =>
        i.toLowerCase().includes(formState.iconSearch.toLowerCase())
      )
    : ICON_OPTIONS;

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      name: e.target.value,
      error: '',
    }));
  }, []);

  const handleTypeChange = useCallback((newType: 'income' | 'expense') => {
    setFormState((prev) => ({
      ...prev,
      type: newType,
      parentId: 'none', // Reset parent when changing type
    }));
  }, []);

  const handleColorChange = useCallback((newColor: string) => {
    setFormState((prev) => ({
      ...prev,
      color: newColor,
    }));
  }, []);

  const handleIconChange = useCallback((newIcon: string) => {
    setFormState((prev) => ({
      ...prev,
      icon: newIcon,
    }));
  }, []);

  const handleParentIdChange = useCallback((newParentId: string) => {
    setFormState((prev) => ({
      ...prev,
      parentId: newParentId,
    }));
  }, []);

  const handleIconSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({
        ...prev,
        iconSearch: e.target.value,
      }));
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.name.trim()) {
      setFormState((prev) => ({
        ...prev,
        error: 'Name is required',
      }));
      return;
    }

    const slug = formState.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    const category: Category = {
      id: initial?.id ?? `custom_${slug}_${uuidv4().slice(0, 6)}`,
      name: formState.name.trim(),
      type: formState.type,
      color: formState.color,
      icon: formState.icon,
      parentId: formState.parentId === 'none' ? null : formState.parentId,
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
              onClick={() => handleTypeChange(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                formState.type === t
                  ? 'bg-accent-primary text-white'
                  : 'text-text-muted hover:text-text-primary'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t}
            </button>
          ))}
        </div>

        <Input
          label="Category Name"
          placeholder="e.g. Gym, Groceries, Freelance Design…"
          value={formState.name}
          onChange={handleNameChange}
          error={formState.error}
        />

        {/* Parent category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            Subcategory of (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleParentIdChange('none')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                formState.parentId === 'none'
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
                onClick={() => handleParentIdChange(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  formState.parentId === p.id
                    ? 'border-opacity-40 text-white'
                    : 'border-border text-text-muted hover:text-text-primary'
                }`}
                style={
                  formState.parentId === p.id
                    ? {
                        backgroundColor: `${p.color}20`,
                        borderColor: `${p.color}60`,
                        color: p.color,
                      }
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
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleColorChange(c)}
                className={`w-7 h-7 rounded-full transition-all ${
                  formState.color === c
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110'
                    : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Icon picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            Icon
          </label>
          <Input
            placeholder="Search icons…"
            value={formState.iconSearch}
            onChange={handleIconSearchChange}
          />
          <div className="grid grid-cols-8 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {filteredIcons.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => handleIconChange(ic)}
                title={ic}
                className={`w-full aspect-square flex items-center justify-center rounded-xl transition-all ${
                  formState.icon === ic
                    ? 'ring-2 ring-offset-1 ring-offset-surface'
                    : 'hover:bg-elevated'
                }`}
                style={
                  formState.icon === ic
                    ? { backgroundColor: `${formState.color}20` }
                    : {}
                }
              >
                <DynamicIcon
                  name={ic}
                  size={16}
                  style={{
                    color:
                      formState.icon === ic ? formState.color : '#94A3B8',
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 p-3 bg-elevated rounded-xl border border-border">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${formState.color}20` }}
          >
            <DynamicIcon
              name={formState.icon}
              size={20}
              style={{ color: formState.color }}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {formState.name || 'Category Name'}
            </p>
            <p className="text-xs text-text-muted capitalize">
              {formState.type}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initial ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}