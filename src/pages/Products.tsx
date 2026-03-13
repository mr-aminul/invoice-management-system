import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import AddProductModal from '../components/AddProductModal'
import ImportModal from '../components/ImportModal'
import { Upload, Download, Edit, Trash2 } from 'lucide-react'
import { useBusinessData } from '../hooks/useBusinessData'

interface Product {
  id: string
  name: string
  description: string
  price: number
  vat: number
  sku: string
  businessId?: string
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  const {
    data: products,
    addItem: addProduct,
    updateItem: updateProduct,
    deleteItem: deleteProduct,
  } = useBusinessData<Product>('products', [])
  
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleAddProduct = (productData: any) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData)
      setEditingProduct(null)
    } else {
      addProduct(productData as Omit<Product, 'id'>)
    }
  }

  const handleImport = (importedData: any[]) => {
    importedData.forEach((row) => {
      addProduct({
        name: row.name || row.Name || '',
        description: row.description || row.Description || '',
        price: parseFloat(row.price || row.Price || 0),
        vat: parseFloat(row.vat || row.VAT || 0),
        sku: row.sku || row.SKU || '',
      } as Omit<Product, 'id'>)
    })
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id)
    }
  }

  const handleExport = () => {
    const csv = [
      ['Name', 'Description', 'Price', 'VAT', 'SKU'],
      ...products.map((p) => [p.name, p.description, p.price, p.vat, p.sku]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        type="products"
      />
      <AddProductModal
        isOpen={showAddModal || !!editingProduct}
        onClose={() => {
          setShowAddModal(false)
          setEditingProduct(null)
        }}
        onSave={handleAddProduct}
        product={editingProduct || undefined}
      />
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Products</h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
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
              className="btn-gradient-orange flex items-center gap-2 text-sm"
            >
              <i className="material-icons add-invoice-icon">add</i>
              Add Product
            </button>
          </div>
        </div>
        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-8 text-center text-slate-500">
            No products yet. Add your first product to get started.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-600 uppercase border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3">NAME</th>
                    <th className="px-4 py-3">DESCRIPTION</th>
                    <th className="px-4 py-3">PRICE</th>
                    <th className="px-4 py-3">VAT</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {(products || []).map((product) => (
                    <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 text-sm">{product.name}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{product.description}</td>
                      <td className="px-4 py-3 text-sm">£{product.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">{product.vat}%</td>
                      <td className="px-4 py-3 text-sm">{product.sku}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="p-1 text-slate-600 hover:text-primary-600 transition-colors"
                            title="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1 text-slate-600 hover:text-red-600 transition-colors"
                            title="Delete product"
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
