import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from 'react-beautiful-dnd';
import { toast } from 'react-hot-toast';
import { 
  getAllBanners, 
  createBanner, 
  updateBanner, 
  deleteBanner, 
  updateBannersOrder,
  HeroBanner 
} from '../../lib/services/bannerService';

const GerenciarBanners = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await getAllBanners();
      setBanners(data);
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
      toast.error('Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(banners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBanners(items);

    try {
      await updateBannersOrder(items.map(item => item.id));
      toast.success('Ordem dos banners atualizada');
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      toast.error('Erro ao atualizar ordem dos banners');
      fetchBanners(); // Recarrega a ordem original em caso de erro
    }
  };

  const handleSaveBanner = async (banner: HeroBanner) => {
    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, banner);
        toast.success('Banner atualizado com sucesso');
      } else {
        await createBanner(banner);
        toast.success('Banner criado com sucesso');
      }
      setIsModalOpen(false);
      setEditingBanner(null);
      fetchBanners();
    } catch (error) {
      console.error('Erro ao salvar banner:', error);
      toast.error('Erro ao salvar banner');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este banner?')) return;

    try {
      await deleteBanner(id);
      toast.success('Banner excluído com sucesso');
      fetchBanners();
    } catch (error) {
      console.error('Erro ao excluir banner:', error);
      toast.error('Erro ao excluir banner');
    }
  };

  const BannerForm = ({ banner, onSave, onCancel }: { 
    banner?: HeroBanner, 
    onSave: (banner: HeroBanner) => void,
    onCancel: () => void 
  }) => {
    const [formData, setFormData] = useState<Partial<HeroBanner>>(
      banner || {
        title: '',
        description: '',
        image_url: '',
        button_text: '',
        button_link: '',
        is_active: true,
        order_index: banners.length + 1
      }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData as HeroBanner);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
          <h2 className="text-2xl font-light mb-6">
            {banner ? 'Editar Banner' : 'Novo Banner'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL da Imagem
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texto do Botão
              </label>
              <input
                type="text"
                name="button_text"
                value={formData.button_text || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link do Botão
              </label>
              <input
                type="text"
                name="button_link"
                value={formData.button_link || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-champagne-500 rounded border-gray-300"
              />
              <label className="ml-2 text-sm text-gray-700">
                Banner ativo
              </label>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-champagne-500 text-white rounded-md hover:bg-champagne-600"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light text-gray-900">
            Gerenciar <span className="text-champagne-500">Banners</span>
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-champagne-500">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-light text-gray-900">
          Gerenciar <span className="text-champagne-500">Banners</span>
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/admin/configuracoes')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={() => {
              setEditingBanner(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-champagne-500 text-white rounded-md hover:bg-champagne-600 transition-colors"
          >
            Novo Banner
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="banners">
          {(provided: DroppableProvided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {banners.map((banner, index) => (
                <Draggable key={banner.id} draggableId={banner.id} index={index}>
                  {(provided: DraggableProvided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={banner.image_url}
                            alt={banner.title}
                            className="w-24 h-16 object-cover rounded"
                          />
                          <div>
                            <h3 className="text-lg font-medium">{banner.title}</h3>
                            <p className="text-gray-600 text-sm">{banner.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingBanner(banner);
                              setIsModalOpen(true);
                            }}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {isModalOpen && (
        <BannerForm
          banner={editingBanner || undefined}
          onSave={handleSaveBanner}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingBanner(null);
          }}
        />
      )}
    </div>
  );
};

export default GerenciarBanners; 