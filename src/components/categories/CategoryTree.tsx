// src/components/categories/CategoryTree.tsx
// Recursive tree component supporting unlimited depth, expand/collapse, and node actions

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  CornerDownRight,
} from 'lucide-react';
import { CategoryIcon } from '../ui/CategoryIcon';
import type { Category } from '../../lib/types';
import { cn } from '../../lib/utils';

interface CategoryNodeProps {
  category: Category;
  level?: number;
  onEdit: (cat: Category) => void;
  onDelete: (id: string, name: string, childCount: number) => void;
  onAddSub: (parentId: string, parentCategory: Category) => void;
}

const CategoryTreeNode: React.FC<CategoryNodeProps> = ({
  category,
  level = 0,
  onEdit,
  onDelete,
  onAddSub,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;
  const childCount = category.children ? category.children.length : 0;

  return (
    <div className="flex flex-col select-none">
      <div
        className={cn(
          'group flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-all hover:bg-slate-100/80 dark:hover:bg-slate-800/60',
          level > 0 && 'ml-4 sm:ml-6 border-l-2 border-slate-200 dark:border-slate-800'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Expand / Collapse toggle */}
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6 flex items-center justify-center text-slate-300 dark:text-slate-700">
              {level > 0 && <CornerDownRight className="h-3 w-3" />}
            </div>
          )}

          {/* Category Icon with custom background color */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-xs"
            style={{ backgroundColor: category.color || '#10b981' }}
          >
            <CategoryIcon name={category.icon} className="h-4 w-4" />
          </div>

          {/* Category Name & child badge */}
          <div className="min-w-0">
            <span className="font-medium text-slate-900 dark:text-slate-100 truncate block">
              {category.name}
            </span>
          </div>

          {hasChildren && (
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full px-1.5 py-0.2">
              {childCount}
            </span>
          )}
        </div>

        {/* Action buttons (hover visible) */}
        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddSub(category.id, category)}
            title="เพิ่มหมวดย่อย"
            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onEdit(category)}
            title="แก้ไขหมวดหมู่"
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(category.id, category.name, childCount)}
            title="ลบหมวดหมู่"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Children recursive render */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col space-y-1 mt-1">
          {category.children!.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSub={onAddSub}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (cat: Category) => void;
  onDelete: (id: string, name: string, childCount: number) => void;
  onAddSub: (parentId: string, parentCategory: Category) => void;
}

export const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  onEdit,
  onDelete,
  onAddSub,
}) => {
  if (categories.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
        ยังไม่มีหมวดหมู่ในรายการ คลิก "เพิ่มหมวดหมู่ใหม่" เพื่อเริ่มต้น
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {categories.map((cat) => (
        <CategoryTreeNode
          key={cat.id}
          category={cat}
          level={0}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddSub={onAddSub}
        />
      ))}
    </div>
  );
};
