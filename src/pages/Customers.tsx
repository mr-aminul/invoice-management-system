import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import AddCustomerModal from '../components/AddCustomerModal'
import ImportModal from '../components/ImportModal'
import { Plus, Search, Download, Upload, ChevronDown, Edit, Trash2, Eye } from 'lucide-react'
import { useBusinessData } from '../hooks/useBusinessData'
import { useBusiness } from '../contexts/BusinessContext'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  balance: string
  address?: string
  city?: string
  postcode?: string
  country?: string
  vatNumber?: string
  businessId?: string
}

export default function Customers() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [modeFilter, setModeFilter] = useState('Active')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])
  
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  
  const {
    data: customers,
    setData: setCustomers,
    addItem: addCustomerItem,
    updateItem: updateCustomer,
    deleteItem: deleteCustomer,
    deleteItems: deleteCustomers,
  } = useBusinessData<Customer>('customers', [])
  
  const { data: invoices } = useBusinessData<any>('invoices', [])
  const { data: payments } = useBusinessData<any>('payments', [])
  const { currentBusiness } = useBusiness()

  // Calculate customer balance from invoices and payments
  const calculateCustomerBalance = (customerId: string): string => {
    if (!currentBusiness) return '£0.00'
    
    const currencySymbol = currentBusiness.currency === 'GBP' ? '£' : 
                          currentBusiness.currency === 'USD' ? '$' : 
                          currentBusiness.currency === 'EUR' ? '€' : '£'
    
    // Get all invoices for this customer
    const customerInvoices = invoices.filter((inv: any) => 
      inv.customerId === customerId || inv.customer === customerId
    )
    
    // Calculate total from invoices
    let totalOwed = 0
    customerInvoices.forEach((inv: any) => {
      if (inv.status !== 'Paid') {
        const amountStr = String(inv.total || inv.amount || 0)
        const amount = parseFloat(amountStr.replace(/[£$€,\s]/g, '')) || 0
        totalOwed += amount
      }
    })
    
    // Subtract payments
    const customerPayments = payments.filter((pay: any) => 
      pay.customerId === customerId || pay.customer === customerId
    )
    
    customerPayments.forEach((pay: any) => {
      const amountStr = String(pay.amount || 0)
      const amount = parseFloat(amountStr.replace(/[£$€,\s]/g, '')) || 0
      totalOwed -= amount
    })
    
    return `${currencySymbol}${Math.max(0, totalOwed).toFixed(2)}`
  }

  const handleAddCustomer = (customerData: any) => {
    if (editingCustomer) {
      // Calculate balance when updating
      const balance = calculateCustomerBalance(editingCustomer.id)
      updateCustomer(editingCustomer.id, { ...customerData, balance })
      setEditingCustomer(null)
    } else {
      // New customer starts with zero balance
      const currencySymbol = currentBusiness?.currency === 'GBP' ? '£' : 
                            currentBusiness?.currency === 'USD' ? '$' : 
                            currentBusiness?.currency === 'EUR' ? '€' : '£'
      addCustomerItem({
        ...customerData,
        balance: `${currencySymbol}0.00`,
      } as Omit<Customer, 'id'>)
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(id)
    }
  }

  const handleBulkDelete = () => {
    if (selectedCustomers.length === 0) {
      alert('Please select customers to delete')
      return
    }
    if (window.confirm(`Are you sure you want to delete ${selectedCustomers.length} customer(s)?`)) {
      deleteCustomers(selectedCustomers)
      setSelectedCustomers([])
    }
  }

  const handleBulkMarkInactive = () => {
    if (selectedCustomers.length === 0) {
      alert('Please select customers to mark as inactive')
      return
    }
    // In a real app, this would update the status
    alert(`${selectedCustomers.length} customer(s) marked as inactive`)
    setSelectedCustomers([])
  }

  const handleImport = (importedData: any[]) => {
    importedData.forEach((row) => {
      addCustomerItem({
        name: row.name || row.Name || '',
        email: row.email || row.Email || '',
        phone: row.phone || row.Phone || row.phone_number || '',
        balance: '£0.00',
        address: row.address || row.Address || '',
        city: row.city || row.City || '',
        postcode: row.postcode || row.Postcode || '',
        country: row.country || row.Country || '',
        vatNumber: row.vat_number || row.vatNumber || '',
      } as Omit<Customer, 'id'>)
    })
  }

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Balance'],
      ...customers.map((c) => [c.name, c.email, c.phone, c.balance]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'customers.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const toggleCustomerSelection = (id: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const toggleAllSelection = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(customers.map((c) => c.id))
    }
  }

  const filteredCustomers = (customers || []).filter((customer) => {
    if (!customer) return false
    const matchesSearch =
      (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone || '').includes(searchTerm)
    return matchesSearch
  })

  return (
    <Layout>
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        type="customers"
      />
      <AddCustomerModal
        isOpen={showAddModal || !!editingCustomer}
        onClose={() => {
          setShowAddModal(false)
          setEditingCustomer(null)
        }}
        onSave={handleAddCustomer}
        customer={editingCustomer || undefined}
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Customers</h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm flex-1 sm:flex-initial justify-center sm:justify-start"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm flex-1 sm:flex-initial justify-center sm:justify-start"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-gradient-orange flex items-center gap-2 text-sm w-full sm:w-auto justify-center sm:justify-start"
            >
              <i className="material-icons add-invoice-icon">add</i>
              <span className="hidden sm:inline">Add Customer</span>
              <span className="sm:hidden">Customer</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-wrap gap-4 flex-1">
              {/* Mode Filter */}
              <div className="relative">
                <label className="block text-xs font-medium text-slate-600 mb-1">Mode</label>
                <div className="relative">
                  <select
                    value={modeFilter}
                    onChange={(e) => setModeFilter(e.target.value)}
                    className="appearance-none px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 pr-8 min-w-[120px]"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Search and Reset */}
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setModeFilter('Active')
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBulkDelete}
                className="text-sm text-slate-600 hover:text-slate-800"
              >
                Delete customer
              </button>
              <button
                onClick={handleBulkMarkInactive}
                className="text-sm text-slate-600 hover:text-slate-800"
              >
                Mark as inactive
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-600 uppercase border-b border-slate-200 bg-slate-50">
                  <th className="px-2 sm:px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={toggleAllSelection}
                    />
                  </th>
                  <th className="px-2 sm:px-4 py-3">NAME</th>
                  <th className="px-2 sm:px-4 py-3 hidden md:table-cell">E-MAIL</th>
                  <th className="px-2 sm:px-4 py-3">PHONE NUMBER</th>
                  <th className="px-2 sm:px-4 py-3">BALANCE</th>
                  <th className="px-2 sm:px-4 py-3">ACTIONS</th>
                  <th className="px-2 sm:px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    // Calculate balance dynamically
                    const balance = calculateCustomerBalance(customer.id)
                    return (
                      <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-2 sm:px-4 py-3">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300"
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={() => toggleCustomerSelection(customer.id)}
                          />
                        </td>
                        <td className="px-2 sm:px-4 py-3">
                          <span className="text-slate-800 font-medium text-sm truncate max-w-[120px] sm:max-w-none block">{customer.name}</span>
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-slate-600 text-sm hidden md:table-cell truncate max-w-[200px]">{customer.email}</td>
                        <td className="px-2 sm:px-4 py-3 text-slate-600 text-sm">{customer.phone}</td>
                        <td className="px-2 sm:px-4 py-3 font-semibold text-slate-800 text-sm">{balance}</td>
                      <td className="px-2 sm:px-4 py-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => alert(`Viewing customer: ${customer.name}`)}
                            className="p-1 text-slate-600 hover:text-primary-600 transition-colors"
                            title="View customer"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => setEditingCustomer(customer)}
                            className="p-1 text-slate-600 hover:text-primary-600 transition-colors"
                            title="Edit customer"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="p-1 text-slate-600 hover:text-red-600 transition-colors"
                            title="Delete customer"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3"></td>
                    </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
