import { useState, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Upload, Loader } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { warrantiesAPI } from '../lib/api';
import type { Warranty } from '../types';
import { toast } from 'sonner';
import { addMonths, format } from 'date-fns';
import Tesseract from 'tesseract.js';

interface WarrantyFormProps {
  warranty?: Warranty;
  onSuccess: () => void;
}

export function WarrantyForm({ warranty, onSuccess }: WarrantyFormProps) {
  const queryClient = useQueryClient();
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);

  const [formData, setFormData] = useState({
    product_name: warranty?.product_name || '',
    brand: warranty?.brand || '',
    model: warranty?.model || '',
    serial_number: warranty?.serial_number || '',
    purchase_date: warranty?.purchase_date || format(new Date(), 'yyyy-MM-dd'),
    warranty_duration: warranty?.warranty_duration || 12,
    category: warranty?.category || '',
    store: warranty?.store || '',
    price: warranty?.price || '',
    notes: warranty?.notes || '',
  });

  const createMutation = useMutation({
    mutationFn: warrantiesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties'] });
      toast.success('Garantía creada correctamente');
      onSuccess();
    },
    onError: () => {
      toast.error('Error al crear la garantía');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Warranty> }) =>
      warrantiesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties'] });
      toast.success('Garantía actualizada correctamente');
      onSuccess();
    },
    onError: () => {
      toast.error('Error al actualizar la garantía');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOCRScan = async (file: File) => {
    setIsOCRProcessing(true);
    toast.info('Escaneando recibo con OCR...');

    try {
      const result = await Tesseract.recognize(file, 'spa', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100);
            console.log(`OCR Progress: ${progress}%`);
          }
        },
      });

      const text = result.data.text.toLowerCase();
      console.log('OCR Text:', text);

      // Extract product info
      const productMatch = text.match(/(?:producto|product|item)[:\s]+([^\n]+)/i);
      const brandMatch = text.match(/(?:marca|brand)[:\s]+([^\n]+)/i);
      const modelMatch = text.match(/(?:modelo|model)[:\s]+([^\n]+)/i);
      const serialMatch = text.match(/(?:serial|s\/n|numero de serie)[:\s]+([^\n]+)/i);
      const priceMatch = text.match(/(?:\$|total|precio)[:\s]*(\d+[.,]?\d*)/i);
      const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);

      const updates: any = {};
      if (productMatch?.[1]) updates.product_name = productMatch[1].trim();
      if (brandMatch?.[1]) updates.brand = brandMatch[1].trim();
      if (modelMatch?.[1]) updates.model = modelMatch[1].trim();
      if (serialMatch?.[1]) updates.serial_number = serialMatch[1].trim();
      if (priceMatch?.[2]) updates.price = priceMatch[2].replace(',', '.');
      if (dateMatch?.[0]) {
        // Convert DD/MM/YYYY to YYYY-MM-DD
        const parts = dateMatch[0].split(/[\/\-]/);
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
          updates.purchase_date = `${year}-${month}-${day}`;
        }
      }

      setFormData({ ...formData, ...updates });
      toast.success('OCR completado. Verifica los datos extraídos.');
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Error al procesar la imagen');
    } finally {
      setIsOCRProcessing(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Calculate expiry date
    const purchaseDate = new Date(formData.purchase_date);
    const expiryDate = addMonths(purchaseDate, parseInt(formData.warranty_duration.toString()));

    const data = {
      ...formData,
      expiry_date: format(expiryDate, 'yyyy-MM-dd'),
      price: formData.price ? parseFloat(formData.price.toString()) : undefined,
    };

    if (warranty) {
      updateMutation.mutate({ id: warranty.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const categories = [
    'Electrónica',
    'Electrodomésticos',
    'Computación',
    'Hogar',
    'Vehículos',
    'Herramientas',
    'Otro',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* OCR Section */}
      {!warranty && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="text-center">
            <Camera className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
              Escanear Recibo con OCR
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Sube una foto del recibo para extraer información automáticamente
            </p>
            <div className="mt-4">
              <label className="cursor-pointer">
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleOCRScan(file);
                  }}
                  disabled={isOCRProcessing}
                />
                <Button
                  type="button"
                  variant="outline"
                  isLoading={isOCRProcessing}
                  onClick={() => document.getElementById('receipt-upload')?.click()}
                  disabled={isOCRProcessing}
                >
                  {isOCRProcessing ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Subir Recibo
                    </>
                  )}
                </Button>
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nombre del Producto *"
          name="product_name"
          value={formData.product_name}
          onChange={handleChange}
          required
        />

        <Input
          label="Marca"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
        />

        <Input
          label="Modelo"
          name="model"
          value={formData.model}
          onChange={handleChange}
        />

        <Input
          label="Número de Serie"
          name="serial_number"
          value={formData.serial_number}
          onChange={handleChange}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Categoría
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Tienda"
          name="store"
          value={formData.store}
          onChange={handleChange}
        />

        <Input
          label="Fecha de Compra *"
          name="purchase_date"
          type="date"
          value={formData.purchase_date}
          onChange={handleChange}
          required
        />

        <Input
          label="Duración (meses) *"
          name="warranty_duration"
          type="number"
          min="1"
          value={formData.warranty_duration}
          onChange={handleChange}
          required
        />

        <Input
          label="Precio"
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Notas
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          placeholder="Información adicional..."
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
          {warranty ? 'Actualizar' : 'Crear'} Garantía
        </Button>
      </div>
    </form>
  );
}
