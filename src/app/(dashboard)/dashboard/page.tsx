'use client';

import React, { useState } from 'react';
import AppLayout from '../../../components/AppLayout';
import DashboardView from '../../../components/DashboardView';
import InventoryView from '../../../components/InventoryView';
import ListsView from '../../../components/ListsView';
import SocialView from '../../../components/SocialView';
import TrashView from '../../../components/TrashView';
import BookForm from '../../../components/BookForm';
import { useBookerStore } from '../../../store/useBookerStore';
import { AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const { activeTab } = useBookerStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBookId, setEditBookId] = useState<string | null>(null);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onOpenAddModal={() => setShowAddModal(true)} />;
      case 'inventory':
        return (
          <InventoryView
            onOpenEditModal={(id: string) => {
              setEditBookId(id);
            }}
          />
        );
      case 'lists':
        return <ListsView />;
      case 'social':
        return <SocialView />;
      case 'trash':
        return <TrashView />;
      default:
        return <DashboardView onOpenAddModal={() => setShowAddModal(true)} />;
    }
  };

  return (
    <AppLayout>
      {renderActiveView()}

      {/* Book Form Modals */}
      <AnimatePresence>
        {showAddModal && (
          <BookForm
            onClose={() => setShowAddModal(false)}
          />
        )}
        {editBookId && (
          <BookForm
            bookId={editBookId}
            onClose={() => setEditBookId(null)}
          />
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
