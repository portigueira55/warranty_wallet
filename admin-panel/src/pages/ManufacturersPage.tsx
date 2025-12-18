/**
 * Página de gestión de fabricantes
 */

import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { API_ENDPOINTS } from '../config/api';
import { Building2, Search, Mail, Phone, Loader2 } from 'lucide-react';

interface Manufacturer {
  id: string;
  companyName: string;
  email: string;
  phone?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
}

export function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const fetchManufacturers = async () => {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.ADMIN.MANUFACTURERS);
      if (response.success && response.data) {
        setManufacturers(response.data);
      }
    } catch (error) {
      console.error('Error cargando fabricantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredManufacturers = manufacturers.filter(
    (manufacturer) =>
      manufacturer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manufacturer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Fabricantes</h1>
        </div>
        <p className="text-gray-500">
          Gestiona los fabricantes registrados en la plataforma
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar fabricantes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Manufacturers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredManufacturers.map((manufacturer) => (
          <div
            key={manufacturer.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
          >
            {/* Company Name */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {manufacturer.companyName}
                </h3>
                <span
                  className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                    manufacturer.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {manufacturer.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="bg-green-50 p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="truncate">{manufacturer.email}</span>
              </div>
              {manufacturer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{manufacturer.phone}</span>
                </div>
              )}
              {manufacturer.website && (
                <div className="text-sm text-blue-600 hover:underline">
                  <a
                    href={manufacturer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {manufacturer.website}
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Registrado:{' '}
                {new Date(manufacturer.createdAt).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredManufacturers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron fabricantes</p>
        </div>
      )}
    </div>
  );
}
