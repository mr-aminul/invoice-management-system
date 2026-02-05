import { useState, useEffect } from 'react'
import { Eye, GripVertical, Plus as PlusIcon, Trash2 } from 'lucide-react'
import { useBusiness } from '../contexts/BusinessContext'

interface AddEstimateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (estimate: any) => void
  estimate?: any
}

interface EstimateItem {
  id: string
  itemName: string
  description: string
  quantity: number
  discount: number
  discountType: 'percentage' | 'fixed'
  price: number
}

export default function AddEstimateModal({ isOpen, onClose, onSave, estimate }: AddEstimateModalProps) {
  const { currentBusiness } = useBusiness()
  const [formData, setFormData] = useState({
    estimateNumber: estimate?.estimateNumber || 'EST00001',
    customer: estimate?.customer || '',
    issueDate: estimate?.issueDate || new Date().toISOString().split('T')[0],
    expiryDate: estimate?.expiryDate || '',
    referenceNote: estimate?.referenceNote || '',
    terms: estimate?.terms || 'Estimate valid for 30 days, includes all parts and materials.',
    items: estimate?.items || [
      { id: '1', itemName: '', description: '', quantity: 1, discount: 0, discountType: 'percentage' as const, price: 0 },
    ],
  })

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

  const setToday = (field: 'issueDate' | 'expiryDate') => {
    const today = new Date().toISOString().split('T')[0]
    setFormData({ ...formData, [field]: today })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { id: Date.now().toString(), itemName: '', description: '', quantity: 1, discount: 0, discountType: 'percentage' as const, price: 0 },
      ],
    })
  }

  const removeItem = (id: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item: EstimateItem) => item.id !== id),
    })
  }

  const updateItem = (id: string, field: keyof EstimateItem, value: any) => {
    const newItems = formData.items.map((item: EstimateItem) => (item.id === id ? { ...item, [field]: value } : item))
    setFormData({ ...formData, items: newItems })
  }

  const discountTotal = formData.items.reduce((sum: number, item: EstimateItem) => {
    const itemTotal = item.quantity * item.price
    const discountAmount = item.discountType === 'percentage' 
      ? (itemTotal * item.discount) / 100 
      : item.discount
    return sum + discountAmount
  }, 0)

  const subtotal = formData.items.reduce((sum: number, item: EstimateItem) => sum + item.quantity * item.price, 0)
  const total = subtotal - discountTotal

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, discountTotal, total })
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ cursor: 'pointer' }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: 'default' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-slate-800">Add new Estimate</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Save
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* From/To Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-800">From</h3>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center">
                  <span className="text-xs text-slate-600">Logo</span>
                </div>
                <div className="font-medium text-slate-800">{currentBusiness?.name || 'No Business Selected'}</div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <div className="w-5 h-5 text-blue-500 mt-0.5">ℹ️</div>
                <p className="text-sm text-slate-600">Add your business details to display them on your estimate.</p>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-800">To</h3>
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
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <div className="w-5 h-5 text-blue-500 mt-0.5">ℹ️</div>
                <p className="text-sm text-slate-600">Customer information will be displayed here</p>
              </div>
            </div>
          </div>

          {/* General Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">General Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <span className="text-red-500">*</span> Estimate number
                </label>
                <input
                  type="text"
                  required
                  value={formData.estimateNumber}
                  onChange={(e) => setFormData({ ...formData, estimateNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <span className="text-red-500">*</span> Issue Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    required
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setToday('issueDate')}
                    className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Today
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <span className="text-red-500">*</span> Expiry Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setToday('expiryDate')}
                    className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Today
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Reference note</label>
                <input
                  type="text"
                  value={formData.referenceNote}
                  onChange={(e) => setFormData({ ...formData, referenceNote: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Items</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                      <span className="text-red-500">*</span> ITEM NAME
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                      <span className="text-red-500">*</span> QTY
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">DISCOUNT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                      PRICE (GBP)
                      <br />
                      EX. TAX
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item: EstimateItem) => (
                    <tr key={item.id} className="border-t border-slate-200">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={item.itemName}
                              onChange={(e) => updateItem(item.id, 'itemName', e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                              placeholder="Item name"
                            />
                            <button
                              type="button"
                              className="flex items-center gap-1 px-2 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded"
                            >
                              <PlusIcon className="w-4 h-4" />
                              Description
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          min="1"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                            min="0"
                          />
                          <span className="text-slate-600">%</span>
                          <select
                            value={item.discountType}
                            onChange={(e) => updateItem(item.id, 'discountType', e.target.value)}
                            className="px-2 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          >
                            <option value="percentage">%</option>
                            <option value="fixed">£</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-4 border-t border-slate-200 bg-slate-50">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add item
                  </button>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-600">Discount Total</span>
                      <span className="text-sm font-semibold text-slate-800">£{discountTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-slate-800">Total (GBP)</span>
                      <span className="text-lg font-bold text-slate-800">£{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-800">Terms</h3>
            <textarea
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
              rows={3}
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
