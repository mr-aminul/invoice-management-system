import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import AddProductModal from '../components/AddProductModal'
import ImportModal from '../components/ImportModal'
import { Upload, Download, Edit, Trash2 } from 'lucide-react'
import { useBusinessData } from '../hooks/useBusinessData'

interface Service {
  id: string
  name: string
  description: string
  price: number
  vat: number
  businessId?: string
}

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  
  const {
    data: services,
    addItem: addService,
    updateItem: updateService,
    deleteItem: deleteService,
  } = useBusinessData<Service>('services', [])
  
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleAddService = (serviceData: any) => {
    if (editingService) {
      updateService(editingService.id, serviceData)
      setEditingService(null)
    } else {
      addService(serviceData as Omit<Service, 'id'>)
    }
  }

  const handleImport = (importedData: any[]) => {
    importedData.forEach((row) => {
      addService({
        name: row.name || row.Name || '',
        description: row.description || row.Description || '',
        price: parseFloat(row.price || row.Price || 0),
        vat: parseFloat(row.vat || row.VAT || 0),
      } as Omit<Service, 'id'>)
    })
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteService(id)
    }
  }

  const handleExport = () => {
    const csv = [
      ['Name', 'Description', 'Price', 'VAT'],
      ...services.map((s) => [s.name, s.description, s.price, s.vat]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'services.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        type="services"
      />
      <AddProductModal
        isOpen={showAddModal || !!editingService}
        onClose={() => {
          setShowAddModal(false)
          setEditingService(null)
        }}
        onSave={handleAddService}
        product={editingService || undefined}
      />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-slate-800">Services</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-gradient-orange flex items-center gap-2"
            >
              <i className="material-icons add-invoice-icon">add</i>
              Add Service
            </button>
          </div>
        </div>
        {services.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center text-slate-500">
            No services yet. Add your first service to get started.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-600 uppercase border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3">NAME</th>
                    <th className="px-4 py-3">DESCRIPTION</th>
                    <th className="px-4 py-3">PRICE</th>
                    <th className="px-4 py-3">VAT</th>
                    <th className="px-4 py-3">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {(services || []).map((service) => (
                    <tr key={service.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{service.name}</td>
                      <td className="px-4 py-3 text-slate-600">{service.description}</td>
                      <td className="px-4 py-3">£{service.price.toFixed(2)}</td>
                      <td className="px-4 py-3">{service.vat}%</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingService(service)}
                            className="p-1 text-slate-600 hover:text-primary-600 transition-colors"
                            title="Edit service"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="p-1 text-slate-600 hover:text-red-600 transition-colors"
                            title="Delete service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
