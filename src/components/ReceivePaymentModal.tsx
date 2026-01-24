import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface ReceivePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payment: any) => void
  invoiceId: string
  customerId?: string
  customerName?: string
  remainingBalance: number
  currencySymbol: string
}

export default function ReceivePaymentModal({
  isOpen,
  onClose,
  onSave,
  invoiceId,
  customerId,
  customerName,
  remainingBalance,
  currencySymbol,
}: ReceivePaymentModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: remainingBalance,
    type: 'Payment',
    method: 'Bank Transfer',
    notes: '',
  })

  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: remainingBalance,
        type: 'Payment',
        method: 'Bank Transfer',
        notes: '',
      })
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, remainingBalance])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.amount <= 0) {
      alert('Please enter a valid payment amount')
      return
    }
    if (formData.amount > remainingBalance) {
      alert(`Payment amount cannot exceed remaining balance of ${currencySymbol}${remainingBalance.toFixed(2)}`)
      return
    }
    onSave({
      ...formData,
      invoiceId,
      customerId,
      customer: customerName,
      paymentNumber: `PAY${Date.now()}`,
      paymentDate: new Date(formData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800">Receive Payment</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
              >
                <option value="Payment">Payment</option>
                <option value="Deposit">Deposit</option>
                <option value="Partial Payment">Partial Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount <span className="text-red-500">*</span>
                <span className="text-xs text-slate-500 ml-2">
                  (Remaining: {currencySymbol}{remainingBalance.toFixed(2)})
                </span>
              </label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                step="0.01"
                min="0"
                max={remainingBalance}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Method
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="PayPal">PayPal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                rows={3}
                placeholder="Optional notes about this payment"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
