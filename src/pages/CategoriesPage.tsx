// src/pages/CategoriesPage.tsx
// Category Management Page with Income/Expense tabs and recursive tree editor

import React, { useState } from 'react';
import { Plus, ArrowDownCircle, ArrowUpCircle, FolderTree, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CategoryTree } from '../components/categories/CategoryTree';
import { CategoryForm } from '../components/categories/CategoryForm';
import { useCategories } from '../hooks/useCategories';
import type { Category, TransactionType } from '../lib/types';
import { cn } from '../lib/utils';

export const CategoriesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; childCount: number } | null>(null);

  const {
    categories,
    expenseTree,
    incomeTree,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const handleOpenAdd = (parentId: string | null = null) => {
    setEditingCategory(null);
    setSelectedParentId(parentId);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setSelectedParentId(cat.parent_id);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (id: string, name: string, childCount: number) => {
    setDeleteTarget({ id, name, childCount });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteCategory(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleFormSubmit = async (
    categoryData: Omit<Category, 'id' | 'created_at' | 'user_id'>
  ) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, categoryData);
    } else {
      await addCategory(categoryData);
    }
  };

  const currentTree = activeTab === 'expense' ? expenseTree : incomeTree;

  return (
    <div className="space-y-6">
      {/* Page Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/80 max-w-sm">
          <button
            onClick={() => setActiveTab('expense')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl py-2 px-4 text-xs font-semibold transition-all',
              activeTab === 'expense'
                ? 'bg-white text-rose-600 shadow-xs dark:bg-slate-900 dark:text-rose-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            )}
          >
            <ArrowDownCircle className="h-4 w-4" />
            <span>หมวดหมู่รายจ่าย ({categories.filter((c) => c.type === 'expense').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('income')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl py-2 px-4 text-xs font-semibold transition-all',
              activeTab === 'income'
                ? 'bg-white text-emerald-600 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            )}
          >
            <ArrowUpCircle className="h-4 w-4" />
            <span>หมวดหมู่รายรับ ({categories.filter((c) => c.type === 'income').length})</span>
          </button>
        </div>

        {/* Add Category Button */}
        <Button onClick={() => handleOpenAdd(null)}>
          <Plus className="h-4 w-4 mr-1.5" />
          เพิ่มหมวดหมู่{activeTab === 'expense' ? 'รายจ่าย' : 'รายรับ'}
        </Button>
      </div>

      {/* Categories Tree Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-emerald-600" />
              <span>โครงสร้างหมวดหมู่{activeTab === 'expense' ? 'รายจ่าย' : 'รายรับ'}</span>
            </CardTitle>
            <CardDescription>
              จัดเรียงลำดับขั้น ย่อ-ขยาย หรือเพิ่มหมวดย่อยได้ไม่จำกัดระดับชั้น
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <CategoryTree
            categories={currentTree}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteRequest}
            onAddSub={(parentId) => handleOpenAdd(parentId)}
          />
        </CardContent>
      </Card>

      {/* Category Create/Edit Form Dialog */}
      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialCategory={editingCategory}
        defaultType={activeTab}
        defaultParentId={selectedParentId}
        availableParents={categories}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="ยืนยันการลบหมวดหมู่"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">คุณต้องการลบ "{deleteTarget?.name}" ใช่หรือไม่?</p>
              {deleteTarget && deleteTarget.childCount > 0 && (
                <p className="mt-1">
                  หมวดหมู่นี้มีหมวดย่อยอีก <strong>{deleteTarget.childCount} รายการ</strong>{' '}
                  ซึ่งจะถูกลบออกทั้งหมดด้วยเช่นกัน
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              ยกเลิก
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              ยืนยันการลบ
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
