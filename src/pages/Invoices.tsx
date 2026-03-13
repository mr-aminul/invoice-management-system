import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Search, ChevronDown, FileText, Edit, Trash2, Eye } from 'lucide-react'
import { useBusinessData } from '../hooks/useBusinessData'
import { useBusiness } from '../contexts/BusinessContext'

interface Invoice {
  id: string
  customer: string
  issueDate: string
  amount: string
  balance: string
  due: string
  status: string
  invoiceNumber?: string
  businessId?: string
  date?: string
  isActive?: boolean
  archived?: boolean
}

export default function Invoices() {
  const navigate = useNavigate()
  const { currentBusiness } = useBusiness()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [modeFilter, setModeFilter] = useState('Active')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  
  const {
    data: invoices,
    deleteItem: deleteInvoice,
  } = useBusinessData<Invoice>('invoices', [])
  
  // Business validation
  useEffect(() => {
    if (!currentBusiness) {
      alert('Please select a business first')
      navigate('/dashboard')
    }
  }, [currentBusiness, navigate])

  // Debug: Log invoices when they change
  useEffect(() => {
    console.log('Invoices loaded:', invoices)
    console.log('Current business:', currentBusiness?.id)
  }, [invoices, currentBusiness])

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id)
    }
  }

  const handleBulkMarkInactive = () => {
    if (selectedInvoices.length === 0) {
      alert('Please select invoices to mark as inactive')
      return
    }
    alert(`${selectedInvoices.length} invoice(s) marked as inactive`)
    setSelectedInvoices([])
  }

  const toggleInvoiceSelection = (id: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(id) ? prev.filter((inv) => inv !== id) : [...prev, id]
    )
  }

  const filteredInvoices = (invoices || []).filter((invoice) => {
    if (!invoice) {
      return false
    }
    const matchesSearch =
      (invoice.invoiceNumber || invoice.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.customer || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter
    const matchesDate = !dateFilter || (invoice.issueDate || invoice.date || '').includes(dateFilter)
    // Mode filter: Active means not deleted/archived, Inactive means archived
    const matchesMode = modeFilter === 'Active' ? (invoice.isActive !== false && !invoice.archived) : (invoice.isActive === false || invoice.archived === true)
    const result = matchesSearch && matchesStatus && matchesDate && matchesMode
    return result
  })

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Invoices</h2>
          <Link
            to="/invoices/add"
            className="btn-gradient-orange flex items-center gap-2 text-sm w-full sm:w-auto justify-center sm:justify-start"
          >
            <i className="material-icons add-invoice-icon">add</i>
            <span className="hidden sm:inline">Add Invoice</span>
            <span className="sm:hidden">Invoice</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-wrap gap-4 flex-1">
              {/* Status Filter */}
              <div className="relative">
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 pr-8 min-w-[120px]"
                  >
                    <option>All</option>
                    <option>Paid</option>
                    <option>Unpaid</option>
                    <option>Overdue</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

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

              {/* Date Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
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
                  setStatusFilter('All')
                  setModeFilter('Active')
                  setDateFilter('')
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <button
              onClick={handleBulkMarkInactive}
              className="text-sm text-slate-600 hover:text-slate-800"
            >
              Mark as inactive
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-600 uppercase border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                      checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                      onChange={() => {
                        if (selectedInvoices.length === filteredInvoices.length) {
                          setSelectedInvoices([])
                        } else {
                          setSelectedInvoices(filteredInvoices.map((inv) => inv.id))
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3">INVOICE</th>
                  <th className="px-4 py-3">CUSTOMER</th>
                  <th className="px-4 py-3 hidden md:table-cell">ISSUE DATE</th>
                  <th className="px-4 py-3">AMOUNT</th>
                  <th className="px-4 py-3 hidden lg:table-cell">BALANCE</th>
                  <th className="px-4 py-3">DUE</th>
                  <th className="px-4 py-3">STATUS</th>
                  <th className="px-4 py-3">ACTIONS</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                      {invoices.length === 0 
                        ? 'No invoices found' 
                        : `No invoices match filters (${invoices.length} total)`}
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => toggleInvoiceSelection(invoice.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/invoices/${invoice.id}`}
                          className="flex items-center gap-1 sm:gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{invoice.invoiceNumber || invoice.id}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-sm truncate max-w-[150px]">{invoice.customer}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm hidden md:table-cell">{invoice.issueDate}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 text-sm">{invoice.amount}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 text-sm hidden lg:table-cell">{invoice.balance}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{invoice.due}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                          invoice.status === 'Paid' 
                            ? 'bg-green-100 text-green-700' 
                            : invoice.status === 'Unpaid'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => navigate(`/invoices/${invoice.id}`)}
                            className="p-1 text-slate-600 hover:text-primary-600 transition-colors"
                            title="View invoice"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/invoices/add?edit=${invoice.id}`)}
                            className="p-1 text-slate-600 hover:text-primary-600 transition-colors"
                            title="Edit invoice"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="p-1 text-slate-600 hover:text-red-600 transition-colors"
                            title="Delete invoice"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
