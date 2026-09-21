import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, Sparkles, FolderTree, CornerDownRight } from 'lucide-react';
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

  const { categoriesMap, getCategoryPathString, recentlyUsedCategories, getOrderedCategories } =
    useCategories();

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
  const orderedCategories = useMemo(() => getOrderedCategories(type), [getOrderedCategories, type]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return orderedCategories;
    const clean = searchQuery.toLowerCase().trim();
    return orderedCategories.filter((c) => {
      const fullPath = (c.pathString || getCategoryPathString(c.id)).toLowerCase();
      return fullPath.includes(clean) || c.name.toLowerCase().includes(clean);
    });
  }, [orderedCategories, searchQuery, getCategoryPathString]);

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
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-96 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in-50 zoom-in-95 duration-150">
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

          <div className="max-h-72 sm:max-h-80 overflow-y-auto p-1.5 space-y-0.5">
            {/* Recently Used Shortcuts */}
            {!searchQuery && recentForType.length > 0 && (
              <div className="mb-2 px-2 pt-1 pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
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
                        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors border touch-manipulation active:scale-95',
                        value === rc.id
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-600 dark:text-emerald-200 font-medium'
                          : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
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
                'flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors touch-manipulation',
                value === null
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              )}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <FolderTree className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium">อื่นๆ (ไม่ระบุหมวดหมู่)</span>
              </div>
              {value === null && <Check className="h-4 w-4 text-emerald-600" />}
            </button>

            {/* Hierarchically Ordered Categories List */}
            {filteredCategories.map((cat) => {
              const isSelected = value === cat.id;
              const isSearching = Boolean(searchQuery.trim());
              const depth = isSearching ? 0 : cat.depth || 0;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onChange(cat.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-colors touch-manipulation',
                    depth === 0 &&
                      !isSearching &&
                      'mt-1 font-semibold text-slate-900 dark:text-slate-100',
                    depth === 1 && !isSearching && 'pl-6 text-slate-700 dark:text-slate-300',
                    depth >= 2 && !isSearching && 'pl-10 text-slate-600 dark:text-slate-400',
                    isSelected
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {/* Tree branch connector for subcategories */}
                    {depth > 0 && !isSearching && (
                      <CornerDownRight className="h-3 w-3 text-slate-400 dark:text-slate-600 shrink-0" />
                    )}

                    <div
                      className={cn(
                        'flex shrink-0 items-center justify-center rounded-lg text-white shadow-2xs',
                        depth === 0 ? 'h-6 w-6' : 'h-5 w-5'
                      )}
                      style={{ backgroundColor: cat.color || '#10b981' }}
                    >
                      <CategoryIcon
                        name={cat.icon}
                        className={cn(depth === 0 ? 'h-3.5 w-3.5' : 'h-3 w-3')}
                      />
                    </div>

                    <span className="truncate">
                      {isSearching ? cat.pathString || getCategoryPathString(cat.id) : cat.name}
                    </span>
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
