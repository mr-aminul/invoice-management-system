import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'

interface AddCreditNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (creditNote: any) => void
  creditNote?: any
}

type CreditNoteItem = { description: string; quantity: number; price: number }

export default function AddCreditNoteModal({
  isOpen,
  onClose,
  onSave,
  creditNote,
}: AddCreditNoteModalProps) {
  const [formData, setFormData] = useState<{
    customer: string
    invoiceNumber: string
    date: string
    reason: string
    items: CreditNoteItem[]
  }>({
    customer: creditNote?.customer || '',
    invoiceNumber: creditNote?.invoiceNumber || '',
    date: creditNote?.date || new Date().toISOString().split('T')[0],
    reason: creditNote?.reason || '',
    items: creditNote?.items || [{ description: '', quantity: 1, price: 0 }],
  })

  if (!isOpen) return null

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, price: 0 }],
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_: CreditNoteItem, i: number) => i !== index),
    })
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const total = formData.items.reduce((sum: number, item: CreditNoteItem) => sum + item.quantity * item.price, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, total })
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
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: 'default' }}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">
            {creditNote ? 'Edit Credit Note' : 'Add Credit Note'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                placeholder="Related invoice number"
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                placeholder="Reason for credit note"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Items</label>
            <div className="space-y-4">
              {formData.items.map((item: CreditNoteItem, index: number) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 bg-slate-50 rounded-lg">
                  <div className="col-span-12 md:col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 bg-white"
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 bg-white"
                      placeholder="Quantity"
                      min="1"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 bg-white"
                      placeholder="Price"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <div className="col-span-12 md:col-span-1">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5 mx-auto" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-primary-600 font-medium"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Add Item
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-full md:w-96">
              <div className="flex justify-between text-xl font-bold text-slate-800">
                <span>Total</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
            >
              {creditNote ? 'Update' : 'Save'} Credit Note
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
