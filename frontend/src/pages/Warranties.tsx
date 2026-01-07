import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  Camera,
  Upload,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { warrantiesAPI } from '../lib/api';
import type { Warranty } from '../types';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import Tesseract from 'tesseract.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Warranties() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);

  const { data: warranties = [], isLoading } = useQuery({
    queryKey: ['warranties'],
    queryFn: warrantiesAPI.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: warrantiesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties'] });
      toast.success('Garantía eliminada correctamente');
    },
    onError: () => {
      toast.error('Error al eliminar la garantía');
    },
  });

  // Filter warranties
  const filteredWarranties = warranties.filter((w) => {
    const matchesSearch =
      w.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.model?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || w.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || w.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories
  const categories = Array.from(new Set(warranties.map((w) => w.category).filter(Boolean)));

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta garantía?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleView = (warranty: Warranty) => {
    setSelectedWarranty(warranty);
    setIsViewModalOpen(true);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Mis Garantías', 14, 22);

    const tableData = filteredWarranties.map((w) => [
      w.product_name,
      w.brand || '-',
      format(new Date(w.purchase_date), 'dd/MM/yyyy'),
      format(new Date(w.expiry_date), 'dd/MM/yyyy'),
      w.status === 'active' ? 'Activa' : w.status === 'expired' ? 'Expirada' : 'Reclamada',
    ]);

    autoTable(doc, {
      head: [['Producto', 'Marca', 'Compra', 'Vencimiento', 'Estado']],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save(`garantias_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('PDF generado correctamente');
  };

  const handleOCRScan = async (file: File) => {
    setIsOCRProcessing(true);
    toast.info('Procesando imagen con OCR...');

    try {
      const result = await Tesseract.recognize(file, 'spa', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const text = result.data.text;
      console.log('OCR Text:', text);

      // Try to extract information from OCR
      // This is a simple example - you would improve this with better parsing
      const productNameMatch = text.match(/producto[:\s]+([^\n]+)/i);
      const brandMatch = text.match(/marca[:\s]+([^\n]+)/i);
      const priceMatch = text.match(/(\$|precio)[:\s]*(\d+[.,]?\d*)/i);
      const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);

      toast.success('OCR completado. Revisa los datos extraídos.');

      // You would populate a form here with extracted data
      console.log({
        productName: productNameMatch?.[1],
        brand: brandMatch?.[1],
        price: priceMatch?.[2],
        date: dateMatch?.[0],
      });
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Error al procesar la imagen');
    } finally {
      setIsOCRProcessing(false);
    }
  };

  const getStatusBadge = (warranty: Warranty) => {
    const daysLeft = differenceInDays(new Date(warranty.expiry_date), new Date());

    if (warranty.status === 'expired' || daysLeft < 0) {
      return <Badge variant="danger">Expirada</Badge>;
    }

    if (daysLeft <= 30) {
      return <Badge variant="warning">Por vencer ({daysLeft}d)</Badge>;
    }

    return <Badge variant="success">Activa</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando garantías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Garantías</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestiona y organiza todas tus garantías
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Garantía
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por producto, marca, modelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="expired">Expiradas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Warranties Grid */}
      {filteredWarranties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {warranties.length === 0
                ? 'No tienes garantías aún. ¡Agrega tu primera garantía!'
                : 'No se encontraron garantías con los filtros seleccionados.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWarranties.map((warranty) => (
            <Card key={warranty.id} hover>
              <CardContent className="space-y-4">
                {warranty.product_image && (
                  <img
                    src={warranty.product_image}
                    alt={warranty.product_name}
                    className="h-48 w-full rounded-lg object-cover"
                  />
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {warranty.product_name}
                  </h3>
                  {warranty.brand && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {warranty.brand} {warranty.model}
                    </p>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Compra:</span>
                    <span className="font-medium">
                      {format(new Date(warranty.purchase_date), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Vence:</span>
                    <span className="font-medium">
                      {format(new Date(warranty.expiry_date), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                  {warranty.price && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Valor:</span>
                      <span className="font-medium">${warranty.price.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  {getStatusBadge(warranty)}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(warranty)}
                      className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                      aria-label="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(warranty.id)}
                      className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Modal */}
      {selectedWarranty && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Detalles de la Garantía"
          size="lg"
        >
          <div className="space-y-6">
            {selectedWarranty.product_image && (
              <img
                src={selectedWarranty.product_image}
                alt={selectedWarranty.product_name}
                className="h-64 w-full rounded-lg object-cover"
              />
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Producto
                </label>
                <p className="mt-1 text-lg font-semibold">{selectedWarranty.product_name}</p>
              </div>

              {selectedWarranty.brand && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Marca/Modelo
                  </label>
                  <p className="mt-1">
                    {selectedWarranty.brand} {selectedWarranty.model}
                  </p>
                </div>
              )}

              {selectedWarranty.serial_number && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Número de Serie
                  </label>
                  <p className="mt-1">{selectedWarranty.serial_number}</p>
                </div>
              )}

              {selectedWarranty.category && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Categoría
                  </label>
                  <p className="mt-1">{selectedWarranty.category}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Fecha de Compra
                </label>
                <p className="mt-1">
                  {format(new Date(selectedWarranty.purchase_date), 'dd MMMM yyyy', {
                    locale: es,
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Vencimiento
                </label>
                <p className="mt-1">
                  {format(new Date(selectedWarranty.expiry_date), 'dd MMMM yyyy', { locale: es })}
                </p>
              </div>

              {selectedWarranty.store && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Tienda
                  </label>
                  <p className="mt-1">{selectedWarranty.store}</p>
                </div>
              )}

              {selectedWarranty.price && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Precio
                  </label>
                  <p className="mt-1 text-lg font-semibold">
                    ${selectedWarranty.price.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {selectedWarranty.notes && (
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Notas
                </label>
                <p className="mt-1 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  {selectedWarranty.notes}
                </p>
              </div>
            )}

            {selectedWarranty.receipt_image && (
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Recibo
                </label>
                <img
                  src={selectedWarranty.receipt_image}
                  alt="Recibo"
                  className="mt-2 rounded-lg border border-gray-200 dark:border-gray-800"
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
