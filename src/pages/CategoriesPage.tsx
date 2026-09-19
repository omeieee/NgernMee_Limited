import React, { useState, useEffect } from 'react';
import { Plus, ArrowDownCircle, ArrowUpCircle, FolderTree, AlertTriangle, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CategoryTree } from '../components/categories/CategoryTree';
import { CategoryForm } from '../components/categories/CategoryForm';
import { useCategories } from '../hooks/useCategories';
import { useAppStore } from '../stores/useAppStore';
import type { Category, TransactionType } from '../lib/types';
import { cn } from '../lib/utils';

export const CategoriesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

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

  const { initializeDefaultCategories, isLoading } = useAppStore();

  useEffect(() => {
    if (categories.length === 0) {
      initializeDefaultCategories();
    }
  }, [categories.length, initializeDefaultCategories]);

  const handleRestoreDefaults = async () => {
    setIsSeeding(true);
    try {
      await initializeDefaultCategories(true);
    } finally {
      setIsSeeding(false);
    }
  };

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
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80 w-full sm:max-w-sm">
          <button
            onClick={() => setActiveTab('expense')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-medium transition-all min-h-[44px] touch-manipulation active:scale-[0.98]',
              activeTab === 'expense'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <ArrowDownCircle className={cn('h-4 w-4', activeTab === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400')} />
            <span>รายจ่าย ({categories.filter((c) => c.type === 'expense').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('income')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-medium transition-all min-h-[44px] touch-manipulation active:scale-[0.98]',
              activeTab === 'income'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <ArrowUpCircle className={cn('h-4 w-4', activeTab === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400')} />
            <span>รายรับ ({categories.filter((c) => c.type === 'income').length})</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleRestoreDefaults}
            disabled={isSeeding || isLoading}
            className="min-h-[44px] touch-manipulation gap-1.5 flex-1 sm:flex-initial"
            title="รีเซ็ตและโหลดชุดหมวดหมู่เริ่มต้น (36 หมวดหมู่)"
          >
            <RotateCcw className={cn('h-4 w-4', (isSeeding || isLoading) && 'animate-spin text-emerald-600')} />
            <span>{isSeeding ? 'กำลังโหลด...' : 'โหลดหมวดหมู่เริ่มต้น'}</span>
          </Button>

          <Button
            onClick={() => handleOpenAdd(null)}
            className="min-h-[44px] touch-manipulation font-semibold flex-1 sm:flex-initial"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>เพิ่มหมวดหมู่{activeTab === 'expense' ? 'รายจ่าย' : 'รายรับ'}</span>
          </Button>
        </div>
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
          {currentTree.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400 space-y-4">
              <p>ยังไม่มีหมวดหมู่{activeTab === 'expense' ? 'รายจ่าย' : 'รายรับ'}ในรายการ</p>
              <Button
                onClick={handleRestoreDefaults}
                disabled={isSeeding || isLoading}
                className="gap-2 mx-auto"
              >
                <RotateCcw className={cn('h-4 w-4', (isSeeding || isLoading) && 'animate-spin')} />
                <span>{isSeeding ? 'กำลังโหลดชุดหมวดหมู่...' : 'โหลดชุดหมวดหมู่เริ่มต้นทันที (36 หมวดหมู่)'}</span>
              </Button>
            </div>
          ) : (
            <CategoryTree
              categories={currentTree}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteRequest}
              onAddSub={(parentId) => handleOpenAdd(parentId)}
            />
          )}
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
