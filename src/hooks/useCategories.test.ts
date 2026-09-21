import { describe, it, expect } from 'vitest';
import { buildCategoryTree, flattenCategoryTree } from './useCategories';
import type { Category } from '../lib/types';

describe('Category Tree & Ordering Logic', () => {
  const mockCategories: Category[] = [
    // Unsorted order intentionally to verify sort_order & tree traversal
    {
      id: 'cat-transport',
      user_id: 'u1',
      parent_id: null,
      name: 'เดินทาง',
      icon: 'car',
      color: '#3b82f6',
      type: 'expense',
      sort_order: 2,
      is_active: true,
      created_at: '2026-01-01',
    },
    {
      id: 'cat-food',
      user_id: 'u1',
      parent_id: null,
      name: 'อาหาร',
      icon: 'utensils',
      color: '#f97316',
      type: 'expense',
      sort_order: 1,
      is_active: true,
      created_at: '2026-01-01',
    },
    {
      id: 'cat-snack',
      user_id: 'u1',
      parent_id: 'cat-food',
      name: 'ของว่าง / เครื่องดื่ม',
      icon: 'coffee',
      color: '#f97316',
      type: 'expense',
      sort_order: 2,
      is_active: true,
      created_at: '2026-01-01',
    },
    {
      id: 'cat-daily-food',
      user_id: 'u1',
      parent_id: 'cat-food',
      name: 'อาหารประจำวัน',
      icon: 'utensils',
      color: '#f97316',
      type: 'expense',
      sort_order: 1,
      is_active: true,
      created_at: '2026-01-01',
    },
    {
      id: 'cat-greentea',
      user_id: 'u1',
      parent_id: 'cat-snack',
      name: 'ชาเขียว',
      icon: 'utensils',
      color: '#10b981',
      type: 'expense',
      sort_order: 1,
      is_active: true,
      created_at: '2026-01-01',
    },
    {
      id: 'cat-gas',
      user_id: 'u1',
      parent_id: 'cat-transport',
      name: 'ค่าน้ำมันรถ',
      icon: 'fuel',
      color: '#3b82f6',
      type: 'expense',
      sort_order: 1,
      is_active: true,
      created_at: '2026-01-01',
    },
  ];

  it('buildCategoryTree builds a nested tree sorted by sort_order at every level', () => {
    const tree = buildCategoryTree(mockCategories);

    expect(tree.length).toBe(2);
    // Root 1 should be อาหาร (sort_order = 1)
    expect(tree[0].name).toBe('อาหาร');
    expect(tree[0].children?.length).toBe(2);
    // Children of อาหาร: อาหารประจำวัน (1), ของว่าง / เครื่องดื่ม (2)
    expect(tree[0].children?.[0].name).toBe('อาหารประจำวัน');
    expect(tree[0].children?.[1].name).toBe('ของว่าง / เครื่องดื่ม');
    // Grandchild: ชาเขียว under ของว่าง / เครื่องดื่ม
    expect(tree[0].children?.[1].children?.[0].name).toBe('ชาเขียว');

    // Root 2 should be เดินทาง (sort_order = 2)
    expect(tree[1].name).toBe('เดินทาง');
    expect(tree[1].children?.[0].name).toBe('ค่าน้ำมันรถ');
  });

  it('flattenCategoryTree flattens the tree depth-first in exact hierarchy order with depth levels', () => {
    const tree = buildCategoryTree(mockCategories);
    const pathResolver = (catId: string) => {
      const map: Record<string, string> = {
        'cat-food': 'อาหาร',
        'cat-daily-food': 'อาหาร › อาหารประจำวัน',
        'cat-snack': 'อาหาร › ของว่าง / เครื่องดื่ม',
        'cat-greentea': 'อาหาร › ของว่าง / เครื่องดื่ม › ชาเขียว',
        'cat-transport': 'เดินทาง',
        'cat-gas': 'เดินทาง › ค่าน้ำมันรถ',
      };
      return map[catId] || '';
    };

    const ordered = flattenCategoryTree(tree, pathResolver);

    // Verify exact sequence
    const namesInOrder = ordered.map((item) => ({ name: item.name, depth: item.depth }));
    expect(namesInOrder).toEqual([
      { name: 'อาหาร', depth: 0 },
      { name: 'อาหารประจำวัน', depth: 1 },
      { name: 'ของว่าง / เครื่องดื่ม', depth: 1 },
      { name: 'ชาเขียว', depth: 2 },
      { name: 'เดินทาง', depth: 0 },
      { name: 'ค่าน้ำมันรถ', depth: 1 },
    ]);
  });
});
