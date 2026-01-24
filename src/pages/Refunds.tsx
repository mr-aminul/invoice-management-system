import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import AddRefundModal from '../components/AddRefundModal'
import { Plus, Search, ChevronDown, Calendar, Edit, Trash2, Eye, FileText } from 'lucide-react'
import { useBusinessData } from '../hooks/useBusinessData'

interface Refund {
  id: string
  number: string
  customer: string
  invoiceNumber: string
  date: string
  amount: string
  paymentMethod: string
  status: string
  businessId?: string
}

export default function Refunds() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [modeFilter, setModeFilter] = useState('Active')
  const [dateFilter, setDateFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRefund, setEditingRefund] = useState<Refund | null>(null)
  const [selectedRefunds, setSelectedRefunds] = useState<string[]>([])
  
  const {
    data: refunds,
    addItem: addRefund,
    updateItem: updateRefund,
    deleteItem: deleteRefund,
  } = useBusinessData<Refund>('refunds', [])
  
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleAddRefund = (refundData: any) => {
    if (editingRefund) {
      updateRefund(editingRefund.id, {
        ...refundData,
        number: editingRefund.number,
      })
      setEditingRefund(null)
    } else {
      addRefund({
        number: `REF${String((refunds || []).length + 1).padStart(5, '0')}`,
        customer: refundData.customer,
        invoiceNumber: refundData.invoiceNumber,
        date: refundData.date,
        amount: `£${refundData.amount.toFixed(2)}`,
        paymentMethod: refundData.paymentMethod,
        status: 'Completed',
      } as Omit<Refund, 'id'>)
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this refund?')) {
      deleteRefund(id)
    }
  }

  const toggleRefundSelection = (id: string) => {
    setSelectedRefunds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const filteredRefunds = (refunds || []).filter((refund) => {
    if (!refund) return false
    const matchesSearch =
      (refund.number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (refund.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (refund.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = !dateFilter || refund.date === dateFilter
    return matchesSearch && matchesDate
  })

  return (
    <Layout>
      <AddRefundModal
        isOpen={showAddModal || !!editingRefund}
        onClose={() => {
          setShowAddModal(false)
          setEditingRefund(null)
        }}
        onSave={handleAddRefund}
        refund={editingRefund || undefined}
      />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-slate-800">Refunds</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-gradient-orange flex items-center gap-2"
          >
            <i className="material-icons add-invoice-icon">add</i>
            Add Refund
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-wrap gap-4 flex-1">
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
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
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
                  setDateFilter('')
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Refunds Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          {filteredRefunds.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No refunds yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-600 uppercase border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 w-12">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={selectedRefunds.length === filteredRefunds.length && filteredRefunds.length > 0}
                        onChange={() => {
                          if (selectedRefunds.length === filteredRefunds.length) {
                            setSelectedRefunds([])
                          } else {
                            setSelectedRefunds(filteredRefunds.map((r) => r.id))
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-3">REFUND</th>
                    <th className="px-4 py-3">CUSTOMER</th>
                    <th className="px-4 py-3">INVOICE</th>
                    <th className="px-4 py-3">DATE</th>
                    <th className="px-4 py-3">AMOUNT</th>
                    <th className="px-4 py-3">PAYMENT METHOD</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3">ACTIONS</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRefunds.map((refund) => {
                    if (!refund) return null
                    return (
                      <tr key={refund.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300"
                            checked={selectedRefunds.includes(refund.id)}
                            onChange={() => toggleRefundSelection(refund.id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {refund.number}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{refund.customer}</td>
                        <td className="px-4 py-3 text-slate-600">{refund.invoiceNumber}</td>
                        <td className="px-4 py-3 text-slate-600">{refund.date}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{refund.amount}</td>
                        <td className="px-4 py-3 text-slate-600">{refund.paymentMethod}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            {refund.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => alert(`Viewing refund: ${refund.number}`)}
                              className="p-1 text-slate-600 hover:text-primary-600 transition-colors"
                              title="View refund"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingRefund(refund)}
                              className="p-1 text-slate-600 hover:text-primary-600 transition-colors"
                              title="Edit refund"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(refund.id)}
                              className="p-1 text-slate-600 hover:text-red-600 transition-colors"
                              title="Delete refund"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                      </td>
                      <td className="px-4 py-3"></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
