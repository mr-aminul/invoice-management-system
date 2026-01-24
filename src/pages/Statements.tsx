import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import StatementPreviewModal from '../components/StatementPreviewModal'
import { Calendar, FileText, CheckSquare } from 'lucide-react'
import { useBusinessData } from '../hooks/useBusinessData'
import { useBusiness } from '../contexts/BusinessContext'

interface StatementItem {
  id: string
  transaction: string
  type: 'Invoice' | 'Payment' | 'Credit Note' | 'Refund'
  date: string
  amount: number
}

interface Customer {
  id: string
  name: string
  email: string
  address?: string
}

export default function Statements() {
  const { currentBusiness } = useBusiness()
  const { data: customers } = useBusinessData<Customer>('customers', [])
  const { data: invoices } = useBusinessData<any>('invoices', [])
  const { data: payments } = useBusinessData<any>('payments', [])
  const { data: creditNotes } = useBusinessData<any>('creditNotes', [])
  const { data: refunds } = useBusinessData<any>('refunds', [])
  
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showItems, setShowItems] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // Generate statement items from invoices and payments for selected customer and date range
  const [statementItems, setStatementItems] = useState<StatementItem[]>([])
  
  // Generate statement items when customer and dates are selected
  useEffect(() => {
    if (!selectedCustomer || !startDate || !endDate || !currentBusiness) {
      setStatementItems([])
      setShowItems(false)
      return
    }

    try {
      const selectedCustomerName = customers.find(c => c.id === selectedCustomer)?.name
      
      // Filter invoices for selected customer and date range
      const filteredInvoices = invoices.filter((inv: any) => {
        const customerMatch = inv.customerId === selectedCustomer || inv.customer === selectedCustomer || inv.customer === selectedCustomerName
        if (!customerMatch) return false
        
        const invDateStr = inv.issueDate || inv.date || ''
        if (!invDateStr) return false
        
        try {
          // Parse date - handle both formatted dates and ISO strings
          let invDate: Date
          if (invDateStr.includes(' ')) {
            // Formatted date like "11 Jan 2026"
            invDate = new Date(invDateStr)
          } else {
            // ISO string
            invDate = new Date(invDateStr)
          }
          
          const start = new Date(startDate)
          const end = new Date(endDate)
          end.setHours(23, 59, 59, 999) // Include end date
          return invDate >= start && invDate <= end
        } catch {
          return false
        }
      })

      // Generate statement items from invoices
      const items: StatementItem[] = filteredInvoices.map((inv: any) => {
        const amountStr = String(inv.total || inv.amount || 0)
        const amount = parseFloat(amountStr.replace(/[£$€,\s]/g, '')) || 0
        return {
          id: `inv-${inv.id}`,
          transaction: inv.invoiceNumber || inv.number || inv.id || `INV${inv.id}`,
          type: 'Invoice' as const,
          date: inv.date || inv.issueDate || new Date().toISOString().split('T')[0],
          amount: amount,
        }
      })

      // Add payment items
      const filteredPayments = (payments || []).filter((pay: any) => {
        const customerMatch = pay.customerId === selectedCustomer || pay.customer === selectedCustomer || pay.customer === selectedCustomerName
        if (!customerMatch) return false
        
        const payDateStr = pay.date || pay.paymentDate || ''
        if (!payDateStr) return false
        
        try {
          const payDate = new Date(payDateStr)
          const start = new Date(startDate)
          const end = new Date(endDate)
          end.setHours(23, 59, 59, 999)
          return payDate >= start && payDate <= end
        } catch {
          return false
        }
      })

      filteredPayments.forEach((pay: any) => {
        const amountStr = String(pay.amount || 0)
        const amount = parseFloat(amountStr.replace(/[£$€,\s]/g, '')) || 0
        items.push({
          id: `pay-${pay.id}`,
          transaction: pay.paymentNumber || pay.id || `PAY${pay.id}`,
          type: 'Payment' as const,
          date: pay.date || pay.paymentDate || new Date().toISOString().split('T')[0],
          amount: -Math.abs(amount), // Payments are negative
        })
      })

      // Add credit notes
      const filteredCreditNotes = (creditNotes || []).filter((cn: any) => {
        const customerMatch = cn.customerId === selectedCustomer || cn.customer === selectedCustomer || cn.customer === selectedCustomerName
        if (!customerMatch) return false
        
        const cnDateStr = cn.date || cn.issueDate || ''
        if (!cnDateStr) return false
        
        try {
          const cnDate = new Date(cnDateStr)
          const start = new Date(startDate)
          const end = new Date(endDate)
          end.setHours(23, 59, 59, 999)
          return cnDate >= start && cnDate <= end
        } catch {
          return false
        }
      })

      filteredCreditNotes.forEach((cn: any) => {
        const amountStr = String(cn.total || cn.amount || 0)
        const amount = parseFloat(amountStr.replace(/[£$€,\s]/g, '')) || 0
        items.push({
          id: `cn-${cn.id}`,
          transaction: cn.creditNoteNumber || cn.id || `CN${cn.id}`,
          type: 'Credit Note' as const,
          date: cn.date || cn.issueDate || new Date().toISOString().split('T')[0],
          amount: -Math.abs(amount), // Credit notes are negative
        })
      })

      // Add refunds
      const filteredRefunds = (refunds || []).filter((ref: any) => {
        const customerMatch = ref.customerId === selectedCustomer || ref.customer === selectedCustomer || ref.customer === selectedCustomerName
        if (!customerMatch) return false
        
        const refDateStr = ref.date || ref.issueDate || ''
        if (!refDateStr) return false
        
        try {
          const refDate = new Date(refDateStr)
          const start = new Date(startDate)
          const end = new Date(endDate)
          end.setHours(23, 59, 59, 999)
          return refDate >= start && refDate <= end
        } catch {
          return false
        }
      })

      filteredRefunds.forEach((ref: any) => {
        const amountStr = String(ref.total || ref.amount || 0)
        const amount = parseFloat(amountStr.replace(/[£$€,\s]/g, '')) || 0
        items.push({
          id: `ref-${ref.id}`,
          transaction: ref.refundNumber || ref.id || `REF${ref.id}`,
          type: 'Refund' as const,
          date: ref.date || ref.issueDate || new Date().toISOString().split('T')[0],
          amount: -Math.abs(amount), // Refunds are negative
        })
      })

      // Sort by date
      items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      setStatementItems(items)
      
      // Auto-select all items when they're loaded and showItems is true
      if (showItems && items.length > 0) {
        setSelectedItems(new Set(items.map(item => item.id)))
      }
    } catch (e) {
      console.error('Error loading statement items:', e)
      setStatementItems([])
    }
  }, [selectedCustomer, startDate, endDate, customers, invoices, payments, creditNotes, refunds, currentBusiness, showItems])

  // Calculate totals
  const totalCustomerBalance = statementItems.reduce((sum, item) => sum + item.amount, 0)
  const statementItemsBalance = Array.from(selectedItems).reduce((sum, itemId) => {
    const item = statementItems.find(i => i.id === itemId)
    return sum + (item ? item.amount : 0)
  }, 0)

  const handleShowItems = () => {
    if (!selectedCustomer || !startDate || !endDate) {
      alert('Please fill in all required fields (Customer, Date from, Date to)')
      return
    }
    setShowItems(true)
    // Select all items by default when showing items
    if (statementItems.length > 0) {
      setSelectedItems(new Set(statementItems.map(item => item.id)))
    }
  }

  const handlePreview = () => {
    if (!selectedCustomer || !startDate || !endDate) {
      alert('Please fill in all required fields (Customer, Date from, Date to)')
      return
    }
    if (selectedItems.size === 0) {
      alert('Please select at least one item')
      return
    }
    setShowPreview(true)
  }

  const handleSharePDF = () => {
    if (!selectedCustomer || !startDate || !endDate) {
      alert('Please fill in all required fields (Customer, Date from, Date to)')
      return
    }
    if (selectedItems.size === 0) {
      alert('Please select at least one item')
      return
    }
    alert('Share PDF functionality - would generate and share PDF statement')
  }

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer)
  const previewItems = statementItems.filter(item => selectedItems.has(item.id))
  const previewTotal = previewItems.reduce((sum, item) => sum + item.amount, 0)

  // Set today's date as default for end date
  useEffect(() => {
    if (!endDate) {
      const today = new Date()
      setEndDate(today.toISOString().split('T')[0])
    }
  }, [endDate])

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Statements</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreview}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium text-sm"
            >
              Preview
            </button>
            <button
              onClick={handleSharePDF}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm"
            >
              Share PDF
            </button>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Customer <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 appearance-none pr-8"
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date from <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
                <button
                  onClick={() => {
                    const today = new Date()
                    setStartDate(today.toISOString().split('T')[0])
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary-600 hover:text-primary-700"
                >
                  Today
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date to <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
                <button
                  onClick={() => {
                    const today = new Date()
                    setEndDate(today.toISOString().split('T')[0])
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary-600 hover:text-primary-700"
                >
                  Today
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleShowItems}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-sm"
          >
            Show items
          </button>
        </div>

        {/* Statement Preview Section */}
        {showItems && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            {/* Balance Summary */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-slate-200">
              <div className="text-sm text-slate-700">
                <span className="font-medium">Total customer balance due</span>{' '}
                <span className="font-semibold text-slate-900">£{totalCustomerBalance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="text-sm text-slate-700">
                <span className="font-medium">Statement Items balance</span>{' '}
                <span className="font-semibold text-slate-900">£{statementItemsBalance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Notes
              </button>
            </div>

            {/* Statement Items Table */}
            {statementItems.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase border-b border-slate-300"></th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase border-b border-slate-300">Transactions</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase border-b border-slate-300">Type</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase border-b border-slate-300">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase border-b border-slate-300">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statementItems.map((item) => (
                        <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="px-3 py-3">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(item.id)}
                              onChange={() => toggleItemSelection(item.id)}
                              className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                            />
                          </td>
                          <td className="px-3 py-3 text-sm text-slate-800 font-medium">{item.transaction}</td>
                          <td className="px-3 py-3 text-sm text-slate-600">{item.type}</td>
                          <td className="px-3 py-3 text-sm text-slate-600">{formatDate(item.date)}</td>
                          <td className="px-3 py-3 text-sm text-slate-800 font-medium">
                            {item.amount >= 0 ? '' : '-'}£{Math.abs(item.amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  {selectedItems.size} of {statementItems.length} item(s) selected
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-slate-500">No statements.</div>
            )}
          </div>
        )}

        {/* Statement Preview Modal */}
        <StatementPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          customerName={selectedCustomerData?.name || ''}
          customerAddress={selectedCustomerData?.address}
          dateFrom={startDate}
          dateTo={endDate}
          items={previewItems}
          totalDue={previewTotal}
        />
      </div>
    </Layout>
  )
}
