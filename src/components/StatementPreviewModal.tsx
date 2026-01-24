import { useEffect } from 'react'
import { X } from 'lucide-react'

interface StatementItem {
  id: string
  transaction: string
  type: 'Invoice' | 'Payment' | 'Credit Note' | 'Refund'
  date: string
  amount: number
}

interface StatementPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  customerName: string
  customerAddress?: string
  dateFrom: string
  dateTo: string
  items: StatementItem[]
  totalDue: number
  companyName?: string
  companyAddress?: string
}

export default function StatementPreviewModal({
  isOpen,
  onClose,
  customerName,
  customerAddress,
  dateFrom,
  dateTo,
  items,
  totalDue,
  companyName = 'Inventive Lab Inc',
  companyAddress = '91 New Rd\nLondon\nE1 1HH'
}: StatementPreviewModalProps) {
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
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return date.toLocaleDateString('en-GB', options)
  }

  const formatDateShort = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const statementDate = new Date().toLocaleDateString('en-GB', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ cursor: 'pointer' }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: 'default', width: '500px', height: '890px' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center z-10">
          <h3 className="text-xl font-normal text-slate-800" style={{ fontSize: '25px', fontWeight: '400' }}>Statements Preview</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors leading-none text-slate-600 hover:text-slate-800"
            style={{ fontSize: '28px', lineHeight: '1', padding: '4px 8px' }}
          >
            ×
          </button>
        </div>

        {/* Statement Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-white" style={{ fontFamily: 'Roboto, sans-serif', padding: '15px' }}>
          <div className="mx-auto" style={{ fontSize: '16px', lineHeight: '18.4px', color: '#000' }}>
            {/* Statement Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontSize: '24px', marginBottom: '24px', fontWeight: '700' }}>Statement</h1>
              
              {/* Company and Customer Info */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1" style={{ fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>From</div>
                  <div className="text-sm text-slate-800" style={{ fontSize: '14px' }}>{companyName}</div>
                  <div className="text-sm text-slate-600 whitespace-pre-line mt-1" style={{ fontSize: '14px' }}>{companyAddress}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1" style={{ fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>To</div>
                  <div className="text-sm text-slate-800" style={{ fontSize: '14px' }}>{customerName}</div>
                  {customerAddress && (
                    <div className="text-sm text-slate-600 whitespace-pre-line mt-1" style={{ fontSize: '14px' }}>{customerAddress}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Statement Table */}
            <div className="mb-6">
              <table className="w-full border-collapse" style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ backgroundColor: '#EDEDED' }}>
                    <th className="text-left text-xs font-bold text-slate-700 uppercase" style={{ padding: '8px 10px', fontSize: '12px', fontWeight: '700', backgroundColor: '#EDEDED', textAlign: 'left' }}>Invoice Number</th>
                    <th className="text-left text-xs font-bold text-slate-700 uppercase" style={{ padding: '8px 10px', fontSize: '12px', fontWeight: '700', textAlign: 'left' }}>Date</th>
                    <th className="text-right text-xs font-bold text-slate-700 uppercase" style={{ padding: '8px 10px', fontSize: '12px', fontWeight: '700', textAlign: 'right' }}>Amount Due</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} style={{ borderBottom: index < items.length - 1 ? '1px solid #cbd5e1' : 'none' }}>
                      <td className="text-sm text-slate-800" style={{ padding: '8px 10px', fontSize: '14px', textAlign: 'left' }}>{item.transaction}</td>
                      <td className="text-sm text-slate-600" style={{ padding: '8px 10px', fontSize: '14px', textAlign: 'left' }}>{formatDate(item.date)}</td>
                      <td className="text-sm text-slate-800 text-right font-medium" style={{ padding: '8px 10px', fontSize: '14px', textAlign: 'right' }}>
                        {item.amount >= 0 ? '' : '-'}£{Math.abs(item.amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid #94a3b8', marginTop: '8px' }}>
                    <td colSpan={2} className="text-sm font-semibold text-slate-800 text-right" style={{ padding: '8px 10px', fontSize: '14px', textAlign: 'right' }}>Total Due:</td>
                    <td className="text-sm font-semibold text-slate-800 text-right" style={{ padding: '8px 10px', fontSize: '14px', textAlign: 'right' }}>£{totalDue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Statement Footer */}
            <div className="mt-6 pt-4 border-t border-slate-300" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #cbd5e1' }}>
              <div className="text-sm text-slate-600" style={{ fontSize: '14px' }}>
                <div className="mb-1" style={{ marginBottom: '4px' }}>
                  <span className="font-semibold">Date:</span> {statementDate}
                </div>
                <div>
                  <span className="font-semibold">Total Due:</span> £{totalDue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
