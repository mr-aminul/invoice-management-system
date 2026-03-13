import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import EstimatePreviewModal from '../components/EstimatePreviewModal'
import { Eye, Save, Plus, Trash2, Sparkles } from 'lucide-react'
import { useBusinessData } from '../hooks/useBusinessData'
import { useBusiness } from '../contexts/BusinessContext'

interface EstimateItem {
  id: string
  itemName: string
  description: string
  quantity: number
  price: number
  vat: number
  discount: number
  discountType: 'percentage' | 'fixed'
}

export default function CreateEstimate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditMode = !!editId
  
  const [estimateNumber, setEstimateNumber] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [expiryDate, setExpiryDate] = useState(() => {
    // Default to 30 days from today
    const defaultExpiry = new Date()
    defaultExpiry.setDate(defaultExpiry.getDate() + 30)
    return defaultExpiry.toISOString().split('T')[0]
  })
  const [poReference, setPoReference] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [items, setItems] = useState<EstimateItem[]>([
    { id: '1', itemName: '', description: '', quantity: 1, price: 0, vat: 0, discount: 0, discountType: 'percentage' },
  ])
  const [, _setExpandedDescriptions] = useState<Set<string>>(new Set())
  const [terms, setTerms] = useState('Estimate valid for 30 days, includes all parts and materials.')
  const [notes, setNotes] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), itemName: '', description: '', quantity: 1, price: 0, vat: 0, discount: 0, discountType: 'percentage' }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof EstimateItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
    // Clear item errors when user updates
    if (errors[`item-${id}-${field}`]) {
      const newErrors = { ...errors }
      delete newErrors[`item-${id}-${field}`]
      setErrors(newErrors)
    }
  }

  const { currentBusiness } = useBusiness()
  const { data: estimates, addItem: addEstimate, updateItem: updateEstimate } = useBusinessData<any>('estimates', [])
  const { data: customers } = useBusinessData<any>('customers', [])

  // Get currency symbol helper
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

  // Load estimate data for editing
  useEffect(() => {
    if (isEditMode && editId && estimates.length > 0) {
      const estimateToEdit = estimates.find((est: any) => est.id === editId)
      if (estimateToEdit) {
        setEstimateNumber(estimateToEdit.estimateNumber || estimateToEdit.number || '')
        // Parse date - handle both formatted and ISO
        if (estimateToEdit.date || estimateToEdit.issueDate) {
          try {
            const dateStr = estimateToEdit.date || estimateToEdit.issueDate
            const dateObj = new Date(dateStr)
            if (!isNaN(dateObj.getTime())) {
              setDate(dateObj.toISOString().split('T')[0])
            } else {
              // Try parsing formatted date
              const parsed = new Date(dateStr)
              if (!isNaN(parsed.getTime())) {
                setDate(parsed.toISOString().split('T')[0])
              }
            }
          } catch {
            // If parsing fails, try to use the date as-is if it's already in ISO format
            const dateStr = estimateToEdit.date || estimateToEdit.issueDate
            if (dateStr && dateStr.includes('-')) {
              setDate(dateStr.split('T')[0])
            }
          }
        }
        // Set expiry date
        if (estimateToEdit.expiryDate) {
          setExpiryDate(estimateToEdit.expiryDate)
        } else {
          // Default to 30 days from estimate date
          const defaultExpiryDate = new Date(estimateToEdit.date || date)
          defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 30)
          setExpiryDate(defaultExpiryDate.toISOString().split('T')[0])
        }
        setPoReference(estimateToEdit.poReference || '')
        setSelectedCustomer(estimateToEdit.customerId || estimateToEdit.customer || '')
        setItems(estimateToEdit.items?.map((item: any) => ({
          ...item,
          itemName: item.itemName || item.description?.split('\n')[0] || '',
          description: item.description || '',
          discount: item.discount || 0,
          discountType: item.discountType || 'percentage',
        })) || [{ id: '1', itemName: '', description: '', quantity: 1, price: 0, vat: 0, discount: 0, discountType: 'percentage' }])
        setTerms(estimateToEdit.terms || 'Estimate valid for 30 days, includes all parts and materials.')
        setNotes(estimateToEdit.notes || '')
      }
    }
  }, [isEditMode, editId, estimates])

  // Ensure expiry date is always after estimate date
  useEffect(() => {
    if (date && expiryDate && new Date(expiryDate) < new Date(date)) {
      // If expiry date is before estimate date, set it to 30 days after estimate date
      const newExpiryDate = new Date(date)
      newExpiryDate.setDate(newExpiryDate.getDate() + 30)
      setExpiryDate(newExpiryDate.toISOString().split('T')[0])
    }
  }, [date])

  // Calculate item totals with discounts
  const calculateItemTotal = (item: EstimateItem) => {
    const itemSubtotal = item.quantity * item.price
    const discountAmount = item.discountType === 'percentage' 
      ? (itemSubtotal * item.discount) / 100 
      : item.discount
    return itemSubtotal - discountAmount
  }

  const discountTotal = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.price
    const discountAmount = item.discountType === 'percentage' 
      ? (itemSubtotal * item.discount) / 100 
      : item.discount
    return sum + discountAmount
  }, 0)

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const subtotalAfterDiscount = subtotal - discountTotal
  const vatAmount = items.reduce((sum, item) => {
    const itemTotal = calculateItemTotal(item)
    return sum + (itemTotal * item.vat) / 100
  }, 0)
  const total = subtotalAfterDiscount + vatAmount

  const validate = () => {
    const newErrors: Record<string, string> = {}

    // Business validation
    if (!currentBusiness) {
      newErrors.business = 'Please select a business first'
    }

    // Customer validation
    if (!selectedCustomer) {
      newErrors.customer = 'Please select a customer'
    }

    // Date validation
    if (!date) {
      newErrors.date = 'Estimate date is required'
    }

    // Expiry date validation
    if (!expiryDate) {
      newErrors.expiryDate = 'Expiry date is required'
    } else if (new Date(expiryDate) < new Date(date)) {
      newErrors.expiryDate = 'Expiry date must be after estimate date'
    }

    // Items validation
    if (items.length === 0) {
      newErrors.items = 'At least one item is required'
    } else {
      items.forEach((item) => {
        if (!item.itemName || !item.itemName.trim()) {
          newErrors[`item-${item.id}-itemName`] = 'Item name is required'
        }
        if (item.quantity <= 0) {
          newErrors[`item-${item.id}-quantity`] = 'Quantity must be greater than 0'
        }
        if (item.price < 0) {
          newErrors[`item-${item.id}-price`] = 'Price cannot be negative'
        }
        if (item.vat < 0 || item.vat > 100) {
          newErrors[`item-${item.id}-vat`] = 'VAT must be between 0 and 100'
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) {
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0]
      if (firstErrorKey) {
        const element = document.querySelector(`[data-error="${firstErrorKey}"]`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      return
    }

    // Get customer object
    const customer = customers.find((c: any) => c.id === selectedCustomer || c.name === selectedCustomer)
    const customerId = customer?.id || selectedCustomer
    const customerName = customer?.name || selectedCustomer

    // Format date for display
    const formattedDate = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    const formattedExpiryDate = expiryDate ? new Date(expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

    const estimateData = {
      customer: customerName,
      customerId: customerId,
      date: formattedDate,
      issueDate: formattedDate,
      expiryDate: formattedExpiryDate,
      amount: `${currencySymbol}${total.toFixed(2)}`,
      status: 'Pending',
      number: estimateNumber || `EST${String((estimates || []).length + 1).padStart(5, '0')}`,
      estimateNumber: estimateNumber || `EST${String((estimates || []).length + 1).padStart(5, '0')}`,
      poReference,
      items,
      subtotal,
      vatAmount,
      total,
      terms,
      notes,
      businessId: currentBusiness?.id,
    }

    if (isEditMode && editId) {
      // Update existing estimate
      updateEstimate(editId, estimateData)
      alert('Estimate updated successfully!')
      navigate('/estimates')
    } else {
      // Create new estimate
      const savedEstimate = addEstimate(estimateData)
      if (savedEstimate) {
        setTimeout(() => {
          alert('Estimate saved successfully!')
          navigate('/estimates')
        }, 100)
      } else {
        alert('Failed to save estimate. Please try again.')
      }
    }
  }

  const handleAutoFill = () => {
    // Generate random estimate number
    const randomNum = Math.floor(Math.random() * 10000)
    setEstimateNumber(`EST${String(randomNum).padStart(5, '0')}`)
    
    // Set date to today
    setDate(new Date().toISOString().split('T')[0])
    
    // Random expiry date (30, 45, 60 days from today)
    const daysOptions = [30, 45, 60]
    const randomDays = daysOptions[Math.floor(Math.random() * daysOptions.length)]
    const randomExpiryDate = new Date()
    randomExpiryDate.setDate(randomExpiryDate.getDate() + randomDays)
    setExpiryDate(randomExpiryDate.toISOString().split('T')[0])
    
    // Random PO reference
    const poRefs = ['PO-2024-001', 'PO-2024-002', 'PO-2024-003', 'REF-2024-001', 'REF-2024-002']
    setPoReference(poRefs[Math.floor(Math.random() * poRefs.length)])
    
    // Select first available customer
    if (customers && customers.length > 0) {
      setSelectedCustomer(customers[0].id || customers[0].name || 'customer1')
    } else {
      setSelectedCustomer('customer1')
    }
    
    // Generate 2-4 random items
    const itemDescriptions = [
      'Web Development Services',
      'Consulting Hours',
      'Software License',
      'Design Services',
      'Hosting & Maintenance',
      'Training Sessions',
      'Support Package',
      'Custom Development',
      'API Integration',
      'Database Setup'
    ]
    
    const numItems = Math.floor(Math.random() * 3) + 2 // 2-4 items
    const newItems: EstimateItem[] = []
    
    for (let i = 0; i < numItems; i++) {
      const description = itemDescriptions[Math.floor(Math.random() * itemDescriptions.length)]
      const quantity = Math.floor(Math.random() * 10) + 1 // 1-10
      const price = Math.floor(Math.random() * 500) + 50 // 50-550
      const vat = [0, 5, 10, 20][Math.floor(Math.random() * 4)] // 0%, 5%, 10%, 20%
      
      newItems.push({
        id: Date.now().toString() + i,
        itemName: description,
        description,
        quantity,
        price,
        vat,
        discount: 0,
        discountType: 'percentage' as const,
      })
    }
    
    setItems(newItems)
    
    // Set terms
    setTerms('Estimate valid for 30 days, includes all parts and materials. Prices are subject to change.')
    
    // Set notes
    const notesOptions = [
      'Thank you for your interest!',
      'Please contact us if you have any questions.',
      'We look forward to working with you.',
      'This estimate is valid for the specified period.',
      'Thank you for considering our services!'
    ]
    setNotes(notesOptions[Math.floor(Math.random() * notesOptions.length)])
  }

  return (
    <Layout>
      <EstimatePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        estimateData={{
          estimateNumber: estimateNumber || 'EST00001',
          number: estimateNumber || 'EST00001',
          selectedCustomer,
          customer: selectedCustomer,
          date,
          issueDate: date,
          expiryDate,
          items,
          subtotal,
          vatAmount,
          total,
          terms,
          notes,
        }}
      />
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">{isEditMode ? 'Edit Estimate' : 'Add new Estimate'}</h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleAutoFill}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-purple-300 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm flex-1 sm:flex-initial justify-center sm:justify-start"
              title="Auto-fill form with dummy data for testing"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Auto Fill</span>
              <span className="sm:hidden">Fill</span>
            </button>
            <Link
              to="/estimates"
              className="px-3 sm:px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm flex-1 sm:flex-initial justify-center sm:justify-start"
            >
              Cancel
            </Link>
            <button 
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm flex-1 sm:flex-initial justify-center sm:justify-start"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm w-full sm:w-auto justify-center sm:justify-start"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* From/To Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">From</h3>
              <div className="mb-4">
                <div className="text-slate-800 font-medium">{currentBusiness?.name || 'No Business Selected'}</div>
                {errors.business && (
                  <p className="text-red-500 text-sm mt-1">{errors.business}</p>
                )}
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">Ei</span>
                </div>
                <p className="text-sm text-slate-600">
                  Add your business details to display them on your estimate.
                </p>
              </div>
            </div>

            {/* To */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">To</h3>
              <div className="mb-4">
                <select
                  value={selectedCustomer}
                  onChange={(e) => {
                    setSelectedCustomer(e.target.value)
                    if (errors.customer) {
                      const newErrors = { ...errors }
                      delete newErrors.customer
                      setErrors(newErrors)
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.customer ? 'border-red-500' : 'border-slate-300 focus:border-primary-500'
                  }`}
                  data-error="customer"
                >
                  <option value="">Select Customer</option>
                  {customers && customers.length > 0 ? (
                    customers.map((customer: any) => (
                      <option key={customer.id} value={customer.id || customer.name}>
                        {customer.name || customer.id}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="customer1">Customer 1</option>
                      <option value="customer2">Customer 2</option>
                    </>
                  )}
                </select>
                {errors.customer && (
                  <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
                )}
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">Ei</span>
                </div>
                <p className="text-sm text-slate-600">Customer information will be displayed here</p>
              </div>
            </div>
          </div>

          {/* General Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">General Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estimate number
                </label>
                <input
                  type="text"
                  value={estimateNumber}
                  onChange={(e) => setEstimateNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="Auto-generated"
                />
                <p className="text-xs text-slate-500 mt-1">Estimate numbers will not be generated</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <span className="text-red-500">*</span> Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value)
                      if (errors.date) {
                        const newErrors = { ...errors }
                        delete newErrors.date
                        setErrors(newErrors)
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none pr-20 ${
                      errors.date ? 'border-red-500' : 'border-slate-300 focus:border-primary-500'
                    }`}
                    data-error="date"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0]
                      setDate(today)
                      // If expiry date is before today or not set, update it to 30 days from today
                      if (!expiryDate || new Date(expiryDate) < new Date(today)) {
                        const newExpiryDate = new Date(today)
                        newExpiryDate.setDate(newExpiryDate.getDate() + 30)
                        setExpiryDate(newExpiryDate.toISOString().split('T')[0])
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary-600 hover:text-primary-700"
                  >
                    Today
                  </button>
                </div>
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <span className="text-red-500">*</span> Expiry Date
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => {
                    setExpiryDate(e.target.value)
                    if (errors.expiryDate) {
                      const newErrors = { ...errors }
                      delete newErrors.expiryDate
                      setErrors(newErrors)
                    }
                  }}
                  min={date}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.expiryDate ? 'border-red-500' : 'border-slate-300 focus:border-primary-500'
                  }`}
                  data-error="expiryDate"
                />
                {errors.expiryDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">P. O. Reference</label>
                <input
                  type="text"
                  value={poReference}
                  onChange={(e) => setPoReference(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-teal-700">Items</h3>
            </div>
            {errors.items && (
              <p className="text-red-500 text-sm mb-4">{errors.items}</p>
            )}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 sm:gap-4 items-end p-3 sm:p-4 bg-slate-50 rounded-lg">
                  <div className="col-span-12 md:col-span-5">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <span className="text-red-500">*</span> Description
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none bg-white text-sm resize-y min-h-[2.5rem] ${
                        errors[`item-${item.id}-description`] ? 'border-red-500' : 'border-slate-300 focus:border-primary-500'
                      }`}
                      placeholder="Item description (press Enter for detail text)"
                      rows={2}
                      data-error={`item-${item.id}-description`}
                    />
                    {errors[`item-${item.id}-description`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`item-${item.id}-description`]}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">First line is the main description. Additional lines appear as detail text.</p>
                  </div>
                  <div className="col-span-6 sm:col-span-4 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <span className="text-red-500">*</span> Quantity
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none bg-white text-sm ${
                        errors[`item-${item.id}-quantity`] ? 'border-red-500' : 'border-slate-300 focus:border-primary-500'
                      }`}
                      min="1"
                      data-error={`item-${item.id}-quantity`}
                    />
                    {errors[`item-${item.id}-quantity`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`item-${item.id}-quantity`]}</p>
                    )}
                  </div>
                  <div className="col-span-6 sm:col-span-4 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <span className="text-red-500">*</span> Price
                    </label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none bg-white text-sm ${
                        errors[`item-${item.id}-price`] ? 'border-red-500' : 'border-slate-300 focus:border-primary-500'
                      }`}
                      min="0"
                      step="0.01"
                      data-error={`item-${item.id}-price`}
                    />
                    {errors[`item-${item.id}-price`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`item-${item.id}-price`]}</p>
                    )}
                  </div>
                  <div className="col-span-6 sm:col-span-4 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">VAT %</label>
                    <input
                      type="number"
                      value={item.vat}
                      onChange={(e) => updateItem(item.id, 'vat', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none bg-white text-sm ${
                        errors[`item-${item.id}-vat`] ? 'border-red-500' : 'border-slate-300 focus:border-primary-500'
                      }`}
                      min="0"
                      max="100"
                      step="0.1"
                      data-error={`item-${item.id}-vat`}
                    />
                    {errors[`item-${item.id}-vat`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`item-${item.id}-vat`]}</p>
                    )}
                  </div>
                  {items.length > 1 && (
                    <div className="col-span-6 sm:col-span-12 md:col-span-1">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-primary-600 font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Item
              </button>
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex justify-end">
                <div className="w-full md:w-96 space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">{currencySymbol}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>VAT</span>
                    <span className="font-semibold">{currencySymbol}{vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-slate-800 pt-3 border-t border-slate-200">
                    <span>Total</span>
                    <span>{currencySymbol}{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Terms</h3>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                rows={4}
                placeholder="Please include estimate validity period or any important conditions (e.g., Estimate valid for 30 days)."
              />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                rows={4}
                placeholder="Feel free to add any additional details or a friendly message for your recipient (e.g., Thank you for considering us!)."
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pb-6">
            <Link
              to="/estimates"
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-center text-sm"
            >
              Cancel
            </Link>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-button hover:bg-primary-600 transition-colors font-medium text-sm"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
