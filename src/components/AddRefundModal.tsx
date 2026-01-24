import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface AddRefundModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (refund: any) => void
  refund?: any
}

export default function AddRefundModal({ isOpen, onClose, onSave, refund }: AddRefundModalProps) {
  const [formData, setFormData] = useState({
    customer: refund?.customer || '',
    invoiceNumber: refund?.invoiceNumber || '',
    date: refund?.date || new Date().toISOString().split('T')[0],
    amount: refund?.amount || 0,
    reason: refund?.reason || '',
    paymentMethod: refund?.paymentMethod || '',
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

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

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ cursor: 'pointer' }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: 'default' }}
      >
        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">
            {refund ? 'Edit Refund' : 'Add Refund'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
              >
                <option value="">Select Customer</option>
                <option value="customer1">Customer 1</option>
                <option value="customer2">Customer 2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Number</label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                placeholder="Related invoice"
              />
            </div>
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
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
              >
                <option value="">Select Method</option>
                <option value="bank">Bank Transfer</option>
                <option value="card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
              rows={3}
              placeholder="Reason for refund"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              {refund ? 'Update' : 'Save'} Refund
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
