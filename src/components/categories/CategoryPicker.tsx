// src/components/categories/CategoryPicker.tsx
// Searchable category picker with hierarchy, breadcrumbs, and recently used shortcuts

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Sparkles, FolderTree } from 'lucide-react';
import { CategoryIcon } from '../ui/CategoryIcon';
import { useCategories } from '../../hooks/useCategories';
import type { Category, TransactionType } from '../../lib/types';
import { cn } from '../../lib/utils';

interface CategoryPickerProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
  type?: TransactionType;
  error?: string;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  value,
  onChange,
  type = 'expense',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const { categories, categoriesMap, getCategoryPathString, recentlyUsedCategories } = useCategories();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedCategory = value ? categoriesMap.get(value) : null;
  const filteredCategories = categories.filter((c) => {
    if (c.type !== type) return false;
    if (!searchQuery.trim()) return true;
    const fullPath = getCategoryPathString(c.id).toLowerCase();
    return fullPath.includes(searchQuery.toLowerCase());
  });

  const recentForType = recentlyUsedCategories.filter((c) => c.type === type);

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        หมวดหมู่
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-11 sm:h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-base sm:text-sm transition-colors dark:border-slate-800 dark:bg-slate-900 min-h-[44px] touch-manipulation',
          error && 'border-rose-500',
          isOpen && 'ring-2 ring-emerald-500'
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedCategory ? (
            <>
              <div
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white shadow-2xs"
                style={{ backgroundColor: selectedCategory.color || '#10b981' }}
              >
                <CategoryIcon name={selectedCategory.icon} className="h-3 w-3" />
              </div>
              <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {getCategoryPathString(selectedCategory.id)}
              </span>
            </>
          ) : (
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FolderTree className="h-4 w-4" />
              <span>อื่นๆ (ไม่ระบุหมวดหมู่)</span>
            </span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
      </button>

      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-80 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Search Box */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาหมวดหมู่..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="h-10 w-full rounded-xl bg-slate-50 pl-8 pr-3 text-base sm:text-xs text-slate-900 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 touch-manipulation"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {/* Recently Used Shortcuts */}
            {!searchQuery && recentForType.length > 0 && (
              <div className="mb-2 px-2 pt-1">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>ใช้ล่าสุด</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentForType.map((rc) => (
                    <button
                      key={rc.id}
                      type="button"
                      onClick={() => {
                        onChange(rc.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors border',
                        value === rc.id
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-200'
                          : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      )}
                    >
                      <CategoryIcon name={rc.icon} className="h-3 w-3" />
                      <span>{rc.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* "Other" (Null category) */}
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors',
                value === null
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              )}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <FolderTree className="h-3.5 w-3.5" />
                </div>
                <span>อื่นๆ (ไม่ระบุหมวดหมู่)</span>
              </div>
              {value === null && <Check className="h-4 w-4 text-emerald-600" />}
            </button>

            {/* Filtered Category List with breadcrumbs */}
            {filteredCategories.map((cat) => {
              const isSelected = value === cat.id;
              const pathString = getCategoryPathString(cat.id);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onChange(cat.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors',
                    isSelected
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs"
                      style={{ backgroundColor: cat.color || '#10b981' }}
                    >
                      <CategoryIcon name={cat.icon} className="h-3.5 w-3.5" />
                    </div>
                    <span className="truncate">{pathString}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />}
                </button>
              );
            })}

            {filteredCategories.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400">
                ไม่พบหมวดหมู่ที่ตรงกับการค้นหา
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
