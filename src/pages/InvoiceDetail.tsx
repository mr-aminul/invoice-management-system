import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useBusiness } from '../contexts/BusinessContext'
import { useBusinessData } from '../hooks/useBusinessData'
import ReceivePaymentModal from '../components/ReceivePaymentModal'
import {
  ArrowLeft,
  Download,
  Printer,
  Mail,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
} from 'lucide-react'

interface Invoice {
  id: string
  customer: string
  customerId?: string
  customerEmail?: string
  customerAddress?: string
  issueDate: string
  dueDate?: string
  date?: string
  timeToPay?: string
  status: string
  amount: string
  balance: string
  paid?: string
  items?: Array<{
    description: string
    quantity: number
    price: number
    vat: number
    total?: number
  }>
  subtotal?: number
  vatAmount?: number
  vat?: number
  total?: number
  terms?: string
  notes?: string
  poReference?: string
  invoiceNumber?: string
  payments?: number
}

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentBusiness } = useBusiness()
  const { data: invoices, updateItem: updateInvoice, deleteItem: deleteInvoice } = useBusinessData<Invoice>('invoices', [])
  const { data: customers } = useBusinessData<any>('customers', [])
  const { data: payments, addItem: addPayment, deleteItem: deletePayment } = useBusinessData<any>('payments', [])
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Load invoice data
  useEffect(() => {
    if (!id || !currentBusiness) {
      setLoading(false)
      return
    }

    const foundInvoice = invoices.find((inv) => inv.id === id)
    if (foundInvoice) {
      // Get customer details
      const customer = customers.find((c: any) => c.id === foundInvoice.customer || c.name === foundInvoice.customer)
      
      // Calculate due date if not present
      let dueDate = foundInvoice.dueDate
      if (!dueDate && foundInvoice.date && foundInvoice.timeToPay) {
        const days = parseInt(foundInvoice.timeToPay) || 14
        const issueDate = new Date(foundInvoice.date)
        issueDate.setDate(issueDate.getDate() + days)
        dueDate = issueDate.toISOString().split('T')[0]
      }

      // Format dates for display
      const formatDate = (dateStr: string) => {
        if (!dateStr) return ''
        try {
          const date = new Date(dateStr)
          return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        } catch {
          return dateStr
        }
      }

      setInvoice({
        ...foundInvoice,
        customer: customer?.name || foundInvoice.customer,
        customerEmail: customer?.email || foundInvoice.customerEmail || '',
        customerAddress: customer?.address || customer?.deliveryAddress || customer?.billingAddress || foundInvoice.customerAddress || '',
        issueDate: formatDate(foundInvoice.issueDate || foundInvoice.date || ''),
        dueDate: dueDate ? formatDate(dueDate) : undefined,
      })
    }
    setLoading(false)
  }, [id, invoices, customers, currentBusiness])

  const handleMarkAsPaid = () => {
    if (!invoice || !currentBusiness) return
    
    const currencySymbol = getCurrencySymbol()
    const remainingBalance = parseFloat(String(invoice.balance || invoice.amount || 0).replace(/[£$€,\s]/g, ''))
    
    if (remainingBalance > 0) {
      // Add a payment for the remaining balance
      const customer = customers.find((c: any) => c.id === invoice.customerId || c.name === invoice.customer)
      addPayment({
        invoiceId: invoice.id,
        customerId: customer?.id || invoice.customerId,
        customer: customer?.name || invoice.customer,
        amount: `${currencySymbol}${remainingBalance.toFixed(2)}`,
        date: new Date().toISOString().split('T')[0],
        paymentDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        paymentNumber: `PAY${Date.now()}`,
        method: 'Manual',
        type: 'Payment',
      })
    }
    
      const updatedInvoice = {
        ...invoice,
        status: 'Paid',
      balance: `${currencySymbol}0.00`,
        paid: invoice.amount,
      }
      updateInvoice(invoice.id, updatedInvoice)
      setInvoice(updatedInvoice)
  }

  const handleReceivePayment = (paymentData: any) => {
    if (!invoice || !currentBusiness) return
    
    const currencySymbol = getCurrencySymbol()
    addPayment({
      ...paymentData,
      amount: `${currencySymbol}${paymentData.amount.toFixed(2)}`,
    })
    
    // Update invoice balance - calculate from total amount minus all payments
    const invoiceTotal = parseFloat(String(invoice.total || invoice.amount || 0).replace(/[£$€,\s]/g, ''))
    const allPayments = payments.filter((p: any) => p.invoiceId === invoice.id)
    const totalPaid = allPayments.reduce((sum: number, p: any) => {
      const amount = parseFloat(String(p.amount || 0).replace(/[£$€,\s]/g, ''))
      return sum + amount
    }, 0) + paymentData.amount
    const newBalance = Math.max(0, invoiceTotal - totalPaid)
    const newStatus = newBalance === 0 ? 'Paid' : invoice.status
    
    const updatedInvoice = {
      ...invoice,
      balance: `${currencySymbol}${newBalance.toFixed(2)}`,
      status: newStatus,
    }
    updateInvoice(invoice.id, updatedInvoice)
    setInvoice(updatedInvoice)
  }

  const handleDeletePayment = (paymentId: string) => {
    if (!invoice || !window.confirm('Are you sure you want to delete this payment?')) return
    
    const payment = payments.find((p: any) => p.id === paymentId)
    if (!payment) return
    
    deletePayment(paymentId)
    
    // Recalculate invoice balance - calculate from total amount minus remaining payments
    const currencySymbol = getCurrencySymbol()
    const invoiceTotal = parseFloat(String(invoice.total || invoice.amount || 0).replace(/[£$€,\s]/g, ''))
    const remainingPayments = payments.filter((p: any) => p.invoiceId === invoice.id && p.id !== paymentId)
    const totalPaid = remainingPayments.reduce((sum: number, p: any) => {
      const amount = parseFloat(String(p.amount || 0).replace(/[£$€,\s]/g, ''))
      return sum + amount
    }, 0)
    const newBalance = Math.max(0, invoiceTotal - totalPaid)
    const newStatus = newBalance >= invoiceTotal ? 'Unpaid' : (newBalance === 0 ? 'Paid' : invoice.status)
    
    const updatedInvoice = {
      ...invoice,
      balance: `${currencySymbol}${newBalance.toFixed(2)}`,
      status: newStatus,
    }
    updateInvoice(invoice.id, updatedInvoice)
    setInvoice(updatedInvoice)
  }

  const handleDelete = () => {
    if (!invoice) return
    
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(invoice.id)
      navigate('/invoices')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    alert('Downloading invoice PDF...')
  }

  const handleSendEmail = () => {
    if (!invoice) return
    alert(`Sending invoice to ${invoice.customerEmail}...`)
  }

  // Get currency symbol from business
  const getCurrencySymbol = () => {
    if (!currentBusiness) return '£'
    const currency = currentBusiness.currency || 'GBP'
    const currencyMap: Record<string, string> = {
      'GBP': '£',
      'USD': '$',
      'EUR': '€',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CNY': '¥',
      'INR': '₹',
      'SGD': 'S$',
      'HKD': 'HK$',
    }
    return currencyMap[currency] || currency
  }

  const currencySymbol = getCurrencySymbol()

  // Get payments for this invoice
  const invoicePayments = payments.filter((p: any) => p.invoiceId === invoice?.id)
  
  // Calculate remaining balance - ensure it's always calculated from total minus payments
  const remainingBalance = invoice ? (() => {
    const invoiceTotal = parseFloat(String(invoice.total || invoice.amount || 0).replace(/[£$€,\s]/g, ''))
    const totalPaid = invoicePayments.reduce((sum: number, p: any) => {
      const amount = parseFloat(String(p.amount || 0).replace(/[£$€,\s]/g, ''))
      return sum + amount
    }, 0)
    return Math.max(0, invoiceTotal - totalPaid)
  })() : 0
  
  // Update invoice balance if it doesn't match calculated balance
  useEffect(() => {
    if (invoice && currentBusiness) {
      const invoiceTotal = parseFloat(String(invoice.total || invoice.amount || 0).replace(/[£$€,\s]/g, ''))
      const totalPaid = invoicePayments.reduce((sum: number, p: any) => {
        const amount = parseFloat(String(p.amount || 0).replace(/[£$€,\s]/g, ''))
        return sum + amount
      }, 0)
      const calculatedBalance = Math.max(0, invoiceTotal - totalPaid)
      const currentBalance = parseFloat(String(invoice.balance || 0).replace(/[£$€,\s]/g, ''))
      
      // Only update if there's a discrepancy
      if (Math.abs(calculatedBalance - currentBalance) > 0.01) {
        const currencySymbol = getCurrencySymbol()
        const newStatus = calculatedBalance === 0 ? 'Paid' : invoice.status
        const updatedInvoice = {
          ...invoice,
          balance: `${currencySymbol}${calculatedBalance.toFixed(2)}`,
          status: newStatus,
        }
        updateInvoice(invoice.id, updatedInvoice)
        setInvoice(updatedInvoice)
      }
    }
  }, [invoicePayments.length, payments, invoice?.id, currentBusiness])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading invoice...</div>
        </div>
      </Layout>
    )
  }

  if (!invoice) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link
              to="/invoices"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Invoice Not Found</h2>
              <p className="text-slate-600 mt-1">The invoice you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Calculate totals if not present
  const subtotal = invoice.subtotal ?? (invoice.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0)
  const vatAmount = invoice.vatAmount ?? invoice.vat ?? (invoice.items?.reduce((sum, item) => sum + (item.quantity * item.price * item.vat) / 100, 0) || 0)
  const total = invoice.total ?? (subtotal + vatAmount)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="no-print flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              to="/invoices"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary-600" />
                {invoice.invoiceNumber || invoice.id}
              </h2>
              <p className="text-slate-600 mt-1">Invoice Details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                invoice.status === 'Paid'
                  ? 'bg-green-100 text-green-700'
                  : invoice.status === 'Unpaid'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-accent-100 text-accent-700'
              }`}
            >
              {invoice.status}
            </span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              title="Print invoice"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              title="Download invoice"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handleSendEmail}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              title="Send via email"
            >
              <Mail className="w-4 h-4" />
              Send
            </button>
            <button
              onClick={() => navigate(`/invoices/add?edit=${invoice.id}`)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              title="Edit invoice"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Delete invoice"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            {invoice.status !== 'Paid' && (
              <button
                onClick={handleMarkAsPaid}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                title="Mark as paid"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Paid
              </button>
            )}
          </div>
        </div>

        {/* Invoice Content */}
        <div className="print-content bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          {/* Invoice Header with Logo */}
          <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-200">
            <div className="flex items-start gap-3">
              {/* Company Logo - Prominently displayed */}
              {currentBusiness?.logo ? (
                <div className="w-24 h-24 flex items-center justify-center">
                  <img 
                    src={currentBusiness.logo} 
                    alt={currentBusiness?.name || 'Business'} 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-yellow-400 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {currentBusiness?.name?.charAt(0)?.toUpperCase() || 'B'}
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-blue-600 mb-1">Sales Invoice</h1>
              <div className="text-sm text-slate-600">
                <div>nº {invoice.invoiceNumber || invoice.id}</div>
                <div className="mt-1">
                  <div>Invoice Date: {invoice.issueDate}</div>
                  {invoice.dueDate && <div>Due date: {invoice.dueDate}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* From/To Section */}
          <div className="mb-4 pb-3 border-b border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">From:</h3>
                <div className="text-sm text-slate-600">
                  <p className="font-medium">{currentBusiness?.name || 'No Business Selected'}</p>
                  {currentBusiness?.address && <p className="mt-0.5">{currentBusiness.address}</p>}
                  {currentBusiness?.country && <p>{currentBusiness.country}</p>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">To:</h3>
                <div className="text-sm text-slate-600">
                  <p className="font-medium">{invoice.customer}</p>
                  {invoice.customerAddress && <p className="mt-0.5 whitespace-pre-line">{invoice.customerAddress}</p>}
                  {invoice.customerEmail && <p className="mt-0.5">{invoice.customerEmail}</p>}
                </div>
              </div>
            </div>
          </div>


          {/* Items Table */}
          {invoice.items && invoice.items.length > 0 && (
            <div className="mb-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Description</th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Quantity</th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Price</th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">VAT</th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => {
                    const itemTotal = item.total ?? (item.quantity * item.price * (1 + item.vat / 100))
                    // Split description into main and detail parts
                    const descriptionParts = (item.description || '').split('\n')
                    const mainDescription = descriptionParts[0]
                    const detailDescription = descriptionParts.slice(1).join('\n')
                    
                    return (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-2 px-3">
                          <div className="text-sm text-slate-800 font-medium">{mainDescription}</div>
                          {detailDescription && (
                            <div className="text-xs text-slate-500 mt-0.5 leading-tight">{detailDescription}</div>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right text-sm text-slate-600 align-top">{item.quantity}</td>
                        <td className="py-2 px-3 text-right text-sm text-slate-600 align-top">{currencySymbol}{item.price.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right text-sm text-slate-600 align-top">{item.vat}%</td>
                        <td className="py-2 px-3 text-right text-sm font-semibold text-slate-800 align-top">
                          {currencySymbol}{itemTotal.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div className="mb-4 flex justify-end">
            <div className="w-full md:w-80 space-y-1.5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>VAT</span>
                <span className="font-semibold">{currencySymbol}{vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-800 pt-2 border-t-2 border-slate-200">
                <span>Total</span>
                <span>{currencySymbol}{total.toFixed(2)}</span>
              </div>
              {invoice.status === 'Paid' && invoice.paid && (
                <div className="flex justify-between text-sm text-green-600 pt-1">
                  <span>Paid</span>
                  <span className="font-semibold">{invoice.paid}</span>
                </div>
              )}
              {invoice.balance && invoice.balance !== `${currencySymbol}0.00` && (
                <div className="flex justify-between text-sm text-red-600 pt-1">
                  <span>Balance</span>
                  <span className="font-semibold">{invoice.balance}</span>
                </div>
              )}
            </div>
          </div>

          {/* Terms and Notes */}
          {(invoice.terms || invoice.notes) && (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              {invoice.terms && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 mb-1">Terms</h4>
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-tight">{invoice.terms}</p>
                </div>
              )}
              {invoice.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 mb-1">Notes</h4>
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-tight">{invoice.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Payment Received Section */}
          <div className="no-print mt-4 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-teal-600 rounded"></div>
                <h3 className="text-lg font-bold text-teal-700">Payment Received</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-3 py-1.5 text-sm border border-teal-600 text-teal-600 rounded-full hover:bg-teal-50 transition-colors font-medium"
                >
                  Receive Payment
                </button>
                {remainingBalance > 0 && (
                  <button
                    onClick={handleMarkAsPaid}
                    className="px-3 py-1.5 text-sm border border-teal-600 text-teal-600 rounded-full hover:bg-teal-50 transition-colors font-medium"
                  >
                    Make Fully Paid
                  </button>
                )}
              </div>
            </div>

            {invoicePayments.length > 0 ? (
              <div className="mb-3">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-700">Date</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-700">Type</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-slate-700">Amount</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-slate-700"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicePayments.map((payment: any) => {
                      const paymentDate = payment.paymentDate || payment.date
                      const formattedDate = paymentDate 
                        ? new Date(paymentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'N/A'
                      
                      return (
                        <tr key={payment.id} className="border-b border-slate-100">
                          <td className="py-2 px-3 text-sm text-slate-700">{formattedDate}</td>
                          <td className="py-2 px-3 text-sm text-slate-700">{payment.type || 'Payment'}</td>
                          <td className="py-2 px-3 text-sm text-slate-700 text-right">{payment.amount || '£0.00'}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete payment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50">
                      <td colSpan={2} className="py-2 px-3 text-sm font-semibold text-slate-800">Balance</td>
                      <td className="py-2 px-3 text-sm font-bold text-slate-800 text-right">{invoice.balance}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-sm text-slate-500 py-4 text-center">
                No payments received yet
              </div>
            )}
                </div>

          <ReceivePaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onSave={handleReceivePayment}
            invoiceId={invoice.id}
            customerId={invoice.customerId}
            customerName={invoice.customer}
            remainingBalance={remainingBalance}
            currencySymbol={currencySymbol}
          />

          {/* Signature Section */}
          {currentBusiness?.signature && (
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="flex justify-end">
                <div className="text-right">
                  <div className="mb-2">
                    <img 
                      src={currentBusiness.signature} 
                      alt="Signature" 
                      className="h-12 object-contain"
                    />
                  </div>
                  <div className="text-xs text-slate-600">
                    <div className="font-medium text-slate-800">{currentBusiness?.name || 'Business'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
