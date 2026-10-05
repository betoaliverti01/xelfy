import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Edit2, Trash2, GripVertical } from 'lucide-react';

export default function CategoryManager() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Category.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Category.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setShowAddModal(false);
      setNewCategoryName('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Category.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setEditingCategory(null);
      setNewCategoryName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Category.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    },
  });

  const handleSave = () => {
    if (!newCategoryName.trim()) return;

    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory.id,
        data: { ...editingCategory, name: newCategoryName },
      });
    } else {
      createMutation.mutate({
        name: newCategoryName,
        order: categories.length,
      });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta categoria?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-bold text-[#333333]">Categorias</h1>
          <button
            onClick={() => {
              setEditingCategory(null);
              setNewCategoryName('');
              setShowAddModal(true);
            }}
            className="w-10 h-10 rounded-full bg-[#2d91a8] flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="px-5 py-6 space-y-3">
        {categories.length > 0 ? (
          categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[20px] p-4 flex items-center gap-3 shadow-sm"
            >
              <GripVertical className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="font-semibold text-[#333333]">{category.name}</p>
              </div>
              <button
                onClick={() => handleEdit(category)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </motion.div>
          ))
        ) : (
          <div className="bg-white rounded-[20px] p-8 text-center">
            <p className="text-gray-400 text-sm">Nenhuma categoria criada</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-2xl z-50 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-[#333333] mb-4">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nome da categoria"
                className="w-full px-4 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none mb-4"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-100 rounded-2xl font-semibold text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!newCategoryName.trim()}
                  className="flex-1 py-3 bg-[#2d91a8] rounded-2xl font-semibold text-white disabled:opacity-50"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}