import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useBusiness } from '../contexts/BusinessContext'
import { useBusinessData } from '../hooks/useBusinessData'
import {
  ArrowLeft,
  Download,
  Printer,
  Mail,
  Edit,
  Trash2,
  FileText,
} from 'lucide-react'

interface Estimate {
  id: string
  customer: string
  customerId?: string
  customerEmail?: string
  customerAddress?: string
  date: string
  expiryDate?: string
  issueDate?: string
  status: string
  amount: string
  number?: string
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
  estimateNumber?: string
}

export default function EstimateDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentBusiness } = useBusiness()
  const { data: estimates, deleteItem: deleteEstimate } = useBusinessData<Estimate>('estimates', [])
  const { data: customers } = useBusinessData<any>('customers', [])
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [loading, setLoading] = useState(true)

  // Load estimate data
  useEffect(() => {
    if (!id || !currentBusiness) {
      setLoading(false)
      return
    }

    const foundEstimate = estimates.find((est) => est.id === id)
    if (foundEstimate) {
      // Get customer details
      const customer = customers.find((c: any) => c.id === foundEstimate.customer || c.name === foundEstimate.customer)
      
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

      setEstimate({
        ...foundEstimate,
        customer: customer?.name || foundEstimate.customer,
        customerEmail: customer?.email || foundEstimate.customerEmail || '',
        customerAddress: customer?.address || customer?.deliveryAddress || customer?.billingAddress || foundEstimate.customerAddress || '',
        date: formatDate(foundEstimate.date || foundEstimate.issueDate || ''),
        expiryDate: foundEstimate.expiryDate ? formatDate(foundEstimate.expiryDate) : undefined,
        issueDate: formatDate(foundEstimate.issueDate || foundEstimate.date || ''),
      })
    }
    setLoading(false)
  }, [id, estimates, customers, currentBusiness])


  const handleDelete = () => {
    if (!estimate) return
    
    if (window.confirm('Are you sure you want to delete this estimate?')) {
      deleteEstimate(estimate.id)
      navigate('/estimates')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    alert('Downloading estimate PDF...')
  }

  const handleSendEmail = () => {
    if (!estimate) return
    alert(`Sending estimate to ${estimate.customerEmail}...`)
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading estimate...</div>
        </div>
      </Layout>
    )
  }

  if (!estimate) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link
              to="/estimates"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Estimate Not Found</h2>
              <p className="text-slate-600 mt-1">The estimate you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Calculate totals if not present
  const subtotal = estimate.subtotal ?? (estimate.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0)
  const vatAmount = estimate.vatAmount ?? estimate.vat ?? (estimate.items?.reduce((sum, item) => sum + (item.quantity * item.price * item.vat) / 100, 0) || 0)
  const total = estimate.total ?? (subtotal + vatAmount)

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="no-print flex flex-wrap justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/estimates"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary-600" />
                {estimate.estimateNumber || estimate.number || estimate.id}
              </h2>
              <p className="text-slate-600 mt-1">Estimate Details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              title="Print estimate"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              title="Download estimate"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handleSendEmail}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              title="Send via email"
            >
              <Mail className="w-4 h-4" />
              Send
            </button>
            <button
              onClick={() => navigate(`/estimates/add?edit=${estimate.id}`)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              title="Edit estimate"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
              title="Delete estimate"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Estimate Content */}
        <div className="print-content bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
          {/* Estimate Header with Logo */}
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
              <h1 className="text-3xl font-bold text-blue-600 mb-1">Estimate</h1>
              <div className="text-sm text-slate-600">
                <div>nº {estimate.estimateNumber || estimate.number || estimate.id}</div>
                <div className="mt-1">
                  <div>Estimate Date: {estimate.issueDate || estimate.date}</div>
                  {estimate.expiryDate && <div>Expiry Date: {estimate.expiryDate}</div>}
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
                  <p className="font-medium">{estimate.customer}</p>
                  {estimate.customerAddress && <p className="mt-0.5 whitespace-pre-line">{estimate.customerAddress}</p>}
                  {estimate.customerEmail && <p className="mt-0.5">{estimate.customerEmail}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          {estimate.items && estimate.items.length > 0 && (
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
                  {estimate.items.map((item, index) => {
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
            </div>
          </div>

          {/* Terms and Notes */}
          {(estimate.terms || estimate.notes) && (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              {estimate.terms && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 mb-1">Terms</h4>
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-tight">{estimate.terms}</p>
                </div>
              )}
              {estimate.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 mb-1">Notes</h4>
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-tight">{estimate.notes}</p>
                </div>
              )}
            </div>
          )}

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
