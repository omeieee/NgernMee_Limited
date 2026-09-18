// src/components/categories/CategoryForm.tsx
// Dialog form for creating or editing a category / subcategory

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { CategoryIcon } from '../ui/CategoryIcon';
import { AVAILABLE_ICONS, DEFAULT_CATEGORY_COLORS } from '../../lib/constants';
import type { Category, TransactionType } from '../../lib/types';
import { cn } from '../../lib/utils';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryData: Omit<Category, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  initialCategory?: Category | null;
  defaultType?: TransactionType;
  defaultParentId?: string | null;
  availableParents: Category[];
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialCategory,
  defaultType = 'expense',
  defaultParentId = null,
  availableParents,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>(defaultType);
  const [parentId, setParentId] = useState<string | null>(defaultParentId);
  const [icon, setIcon] = useState('circle');
  const [color, setColor] = useState(DEFAULT_CATEGORY_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setName(initialCategory.name);
      setType(initialCategory.type);
      setParentId(initialCategory.parent_id);
      setIcon(initialCategory.icon || 'circle');
      setColor(initialCategory.color || DEFAULT_CATEGORY_COLORS[0]);
    } else {
      setName('');
      setType(defaultType);
      setParentId(defaultParentId);
      setIcon(defaultType === 'income' ? 'briefcase' : 'utensils');
      setColor(DEFAULT_CATEGORY_COLORS[0]);
    }
    setError(null);
  }, [initialCategory, defaultType, defaultParentId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณาระบุชื่อหมวดหมู่');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        type,
        parent_id: parentId,
        icon,
        color,
        sort_order: initialCategory?.sort_order ?? 99,
        is_active: true,
      });
      onClose();
    } catch {
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out the category itself from parent options to avoid circular nesting
  const validParents = availableParents.filter(
    (p) => p.id !== initialCategory?.id && p.type === type
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
      description="กำหนดชื่อ สี ไอคอน และโครงสร้างหมวดหมู่"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/60 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        {/* Type Selector (Only if new) */}
        {!initialCategory && (
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setParentId(null);
              }}
              className={cn(
                'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all',
                type === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              )}
            >
              รายจ่าย
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setParentId(null);
              }}
              className={cn(
                'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all',
                type === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              )}
            >
              รายรับ
            </button>
          </div>
        )}

        {/* Name */}
        <Input
          label="ชื่อหมวดหมู่"
          placeholder="เช่น อาหารประจำวัน, ค่าน้ำมัน, ชาบู"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          autoFocus
        />

        {/* Parent Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            หมวดหมู่หลัก (ลำดับขั้น)
          </label>
          <select
            value={parentId || ''}
            onChange={(e) => setParentId(e.target.value ? e.target.value : null)}
            className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <option value="">(ไม่มี — เป็นหมวดหมู่หลักระดับบนสุด)</option>
            {validParents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.name} {parent.parent_id ? '(หมวดย่อย)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            สีหมวดหมู่
          </label>
          <div className="flex flex-wrap gap-2.5">
            {DEFAULT_CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={cn(
                  'h-7 w-7 rounded-full transition-transform cursor-pointer',
                  color === c ? 'ring-2 ring-offset-2 ring-emerald-600 scale-110' : 'hover:scale-105'
                )}
              />
            ))}
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            ไอคอนหมวดหมู่
          </label>
          <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
            {AVAILABLE_ICONS.map((item) => (
              <button
                key={item.name}
                type="button"
                title={item.label}
                onClick={() => setIcon(item.name)}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-xl transition-all',
                  icon === item.name
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                <CategoryIcon name={item.name} className="h-5 w-5" />
                <span className="text-[10px] truncate max-w-full mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            ยกเลิก
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialCategory ? 'บันทึกการแก้ไข' : 'สร้างหมวดหมู่'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
