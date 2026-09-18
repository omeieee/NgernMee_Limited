// src/hooks/useCategories.ts
// Category management hook with recursive tree construction and path utilities

import { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import type { Category, TransactionType } from '../lib/types';

export function useCategories() {
  const { categories, addCategory, updateCategory, deleteCategory, transactions } = useAppStore();

  /**
   * Recursively builds a tree from flat categories array
   */
  const buildTree = (flat: Category[], parentId: string | null = null): Category[] => {
    return flat
      .filter((c) => c.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((cat) => ({
        ...cat,
        children: buildTree(flat, cat.id),
      }));
  };

  const expenseTree = useMemo(() => {
    return buildTree(categories.filter((c) => c.type === 'expense'));
  }, [categories]);

  const incomeTree = useMemo(() => {
    return buildTree(categories.filter((c) => c.type === 'income'));
  }, [categories]);

  const categoriesMap = useMemo(() => {
    return new Map<string, Category>(categories.map((c) => [c.id, c]));
  }, [categories]);

  /**
   * Returns a breadcrumb array of category names from root to current node
   */
  const getCategoryPath = (categoryId: string | null | undefined): string[] => {
    if (!categoryId) return ['อื่นๆ'];
    const path: string[] = [];
    let current = categoriesMap.get(categoryId);
    const visited = new Set<string>();

    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      path.unshift(current.name);
      current = current.parent_id ? categoriesMap.get(current.parent_id) : undefined;
    }

    return path.length > 0 ? path : ['อื่นๆ'];
  };

  /**
   * Returns a formatted breadcrumb string, e.g. "อาหาร > อาหารประจำวัน"
   */
  const getCategoryPathString = (categoryId: string | null | undefined): string => {
    return getCategoryPath(categoryId).join(' › ');
  };

  /**
   * Derives recently used categories based on recent transactions
   */
  const recentlyUsedCategories = useMemo(() => {
    const recentIds = new Set<string>();
    const recentList: Category[] = [];

    for (const tx of transactions) {
      if (tx.category_id && !recentIds.has(tx.category_id)) {
        const cat = categoriesMap.get(tx.category_id);
        if (cat) {
          recentIds.add(tx.category_id);
          recentList.push(cat);
          if (recentList.length >= 6) break;
        }
      }
    }
    return recentList;
  }, [transactions, categoriesMap]);

  /**
   * Move category to a different parent or change sort order
   */
  const moveCategory = async (id: string, newParentId: string | null, newSortOrder?: number) => {
    await updateCategory(id, {
      parent_id: newParentId,
      ...(newSortOrder !== undefined ? { sort_order: newSortOrder } : {}),
    });
  };

  return {
    categories,
    categoriesMap,
    expenseTree,
    incomeTree,
    buildTree,
    getCategoryPath,
    getCategoryPathString,
    recentlyUsedCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
  };
}
