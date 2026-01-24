import { useEffect } from 'react'
import { X, Printer, Download, Send } from 'lucide-react'
import { useBusiness } from '../contexts/BusinessContext'

interface EstimatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  estimateData: any
}

export default function EstimatePreviewModal({ isOpen, onClose, estimateData }: EstimatePreviewModalProps) {
  const { currentBusiness } = useBusiness()
  
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const subtotal = estimateData.items?.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0) || 0
  const vatAmount = estimateData.vatAmount || 0
  const total = subtotal + vatAmount

  return (
    <div 
      className="no-print fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 print:relative print:inset-auto print:bg-transparent print:z-auto print:flex print:items-start print:justify-start print:p-0"
      onClick={onClose}
      style={{ cursor: 'pointer' }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col print:max-w-full print:max-h-none print:shadow-none print:rounded-none"
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: 'default' }}
      >
        {/* Header */}
        <div className="no-print sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
          <h3 className="text-xl font-semibold text-slate-800">Estimate Preview</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={() => alert('Download functionality')}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={() => alert('Send functionality')}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Estimate Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 print:p-0 print:overflow-visible print:bg-white">
          <div className="print-content bg-white p-4 rounded-lg shadow-sm print:shadow-none print:rounded-none">
            {/* Estimate Header */}
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
                  <div>nº {estimateData.estimateNumber || estimateData.number || 'EST00001'}</div>
                  <div className="mt-1">
                    <div>Estimate Date: {formatDate(estimateData.issueDate || estimateData.date) || '11 Jan 2026'}</div>
                    {estimateData.expiryDate && (
                      <div>Expiry Date: {formatDate(estimateData.expiryDate)}</div>
                    )}
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
                    <p className="font-medium">{estimateData.selectedCustomer || estimateData.customer || 'Customer Name'}</p>
                    {estimateData.customerAddress && (
                      <p className="mt-0.5">{estimateData.customerAddress}</p>
                    )}
                    {estimateData.customerEmail && (
                      <p className="mt-0.5">{estimateData.customerEmail}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Description</th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Qty</th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Price</th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {estimateData.items?.map((item: any, index: number) => {
                    // Split description into main and detail parts
                    const descriptionParts = (item.description || 'Item').split('\n')
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
                        <td className="text-right py-2 px-3 text-sm text-slate-700 align-top">{item.quantity || 1}</td>
                        <td className="text-right py-2 px-3 text-sm text-slate-700 align-top">{item.price?.toFixed(2) || '0.00'}</td>
                        <td className="text-right py-2 px-3 text-sm text-slate-700 align-top font-semibold">
                          {((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-4">
              <div className="w-80">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="py-1.5 px-3 text-right text-sm text-slate-700">Sub Total</td>
                      <td className="py-1.5 px-3 text-right text-sm font-semibold text-slate-800">{subtotal.toFixed(2)}</td>
                    </tr>
                    {vatAmount > 0 && (
                      <tr>
                        <td className="py-1.5 px-3 text-right text-sm text-slate-700">VAT</td>
                        <td className="py-1.5 px-3 text-right text-sm font-semibold text-slate-800">{vatAmount.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-1.5 px-3 text-right text-sm text-slate-700">Estimate Total</td>
                      <td className="py-1.5 px-3 text-right text-sm font-semibold text-slate-800">{total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms and Notes */}
            <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200">
              <div>
                <div className="text-xs text-slate-600 mb-1">Estimate valid for 30 days</div>
              </div>
              <div className="text-xs text-slate-600">
                {estimateData.terms && (
                  <div className="mb-1 leading-tight">{estimateData.terms}</div>
                )}
                {estimateData.expiryDate && (
                  <div className="leading-tight">This estimate is valid until {formatDate(estimateData.expiryDate)}.</div>
                )}
              </div>
            </div>

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
      </div>
    </div>
  )
}
