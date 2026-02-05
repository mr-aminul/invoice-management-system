import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import InvoicePreviewModal from '../components/InvoicePreviewModal'
import { Eye, Save, Plus, Trash2, Upload, CreditCard, Calendar, Sparkles, ChevronDown } from 'lucide-react'
import { useBusinessData } from '../hooks/useBusinessData'
import { useBusiness } from '../contexts/BusinessContext'

interface InvoiceItem {
  id: string
  itemName: string
  description: string
  quantity: number
  price: number
  vat: number
  discount: number
  discountType: 'percentage' | 'fixed'
}

export default function CreateInvoice() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditMode = !!editId
  
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(() => {
    // Default to 14 days from today
    const defaultDue = new Date()
    defaultDue.setDate(defaultDue.getDate() + 14)
    return defaultDue.toISOString().split('T')[0]
  })
  const [poReference, setPoReference] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', itemName: '', description: '', quantity: 1, price: 0, vat: 0, discount: 0, discountType: 'percentage' },
  ])
  const [terms, setTerms] = useState('Late payment will be subject to interest charges at 3% above bank base rate.')
  const [notes, setNotes] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState('Monthly')
  const [firstRecurrencyDate, setFirstRecurrencyDate] = useState(() => {
    // Default to 30 days from today
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 30)
    return defaultDate.toISOString().split('T')[0]
  })
  const [setEndDate, setSetEndDate] = useState(false)
  const [recurringEndDate, setRecurringEndDate] = useState('')
  const [automaticallyEmail, setAutomaticallyEmail] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [attachmentBase64, setAttachmentBase64] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set())

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), itemName: '', description: '', quantity: 1, price: 0, vat: 0, discount: 0, discountType: 'percentage' }])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
    // Clear item errors when user updates
    if (errors[`item-${id}-${field}`]) {
      const newErrors = { ...errors }
      delete newErrors[`item-${id}-${field}`]
      setErrors(newErrors)
    }
  }

  const { currentBusiness } = useBusiness()
  const { data: invoices, addItem: addInvoice, updateItem: updateInvoice } = useBusinessData<any>('invoices', [])
  const { data: customers } = useBusinessData<any>('customers', [])
  const { addItem: addPayment } = useBusinessData<any>('payments', [])

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

  // Load invoice data for editing
  useEffect(() => {
    if (isEditMode && editId && invoices.length > 0) {
      const invoiceToEdit = invoices.find((inv: any) => inv.id === editId)
      if (invoiceToEdit) {
        setInvoiceNumber(invoiceToEdit.invoiceNumber || '')
        // Parse date - handle both formatted and ISO
        if (invoiceToEdit.date) {
          try {
            const dateObj = new Date(invoiceToEdit.date)
            if (!isNaN(dateObj.getTime())) {
              setDate(dateObj.toISOString().split('T')[0])
            }
          } catch {
            // Try parsing formatted date
            try {
              const parsed = new Date(invoiceToEdit.date)
              if (!isNaN(parsed.getTime())) {
                setDate(parsed.toISOString().split('T')[0])
              }
            } catch {}
          }
        }
        // Set due date - if dueDate exists use it, otherwise calculate from timeToPay
        if (invoiceToEdit.dueDate) {
          setDueDate(invoiceToEdit.dueDate)
        } else if (invoiceToEdit.timeToPay && invoiceToEdit.date) {
          const days = parseInt(invoiceToEdit.timeToPay) || 14
          const issueDate = new Date(invoiceToEdit.date)
          issueDate.setDate(issueDate.getDate() + days)
          setDueDate(issueDate.toISOString().split('T')[0])
        } else {
          // Default to 14 days from invoice date
          const defaultDueDate = new Date(invoiceToEdit.date || date)
          defaultDueDate.setDate(defaultDueDate.getDate() + 14)
          setDueDate(defaultDueDate.toISOString().split('T')[0])
        }
        setPoReference(invoiceToEdit.poReference || '')
        setSelectedCustomer(invoiceToEdit.customerId || invoiceToEdit.customer || '')
        setItems(invoiceToEdit.items?.map((item: any) => ({
          ...item,
          itemName: item.itemName || item.description?.split('\n')[0] || '',
          description: item.description || '',
          discount: item.discount || 0,
          discountType: item.discountType || 'percentage',
        })) || [{ id: '1', itemName: '', description: '', quantity: 1, price: 0, vat: 0, discount: 0, discountType: 'percentage' }])
        setTerms(invoiceToEdit.terms || 'Late payment will be subject to interest charges at 3% above bank base rate.')
        setNotes(invoiceToEdit.notes || '')
        setIsRecurring(invoiceToEdit.isRecurring || false)
        setRecurringFrequency(invoiceToEdit.recurringFrequency || 'Monthly')
        if (invoiceToEdit.firstRecurrencyDate) {
          try {
            const dateObj = new Date(invoiceToEdit.firstRecurrencyDate)
            if (!isNaN(dateObj.getTime())) {
              setFirstRecurrencyDate(dateObj.toISOString().split('T')[0])
            }
          } catch {
            setFirstRecurrencyDate(invoiceToEdit.firstRecurrencyDate)
          }
        }
        setSetEndDate(invoiceToEdit.setEndDate || false)
        setRecurringEndDate(invoiceToEdit.recurringEndDate || '')
        setAutomaticallyEmail(invoiceToEdit.automaticallyEmail || false)
        if (invoiceToEdit.attachments) {
          setAttachmentBase64(invoiceToEdit.attachments)
        }
      }
    }
  }, [isEditMode, editId, invoices])

  // Ensure due date is always after invoice date
  useEffect(() => {
    if (date && dueDate && new Date(dueDate) < new Date(date)) {
      // If due date is before invoice date, set it to 14 days after invoice date
      const newDueDate = new Date(date)
      newDueDate.setDate(newDueDate.getDate() + 14)
      setDueDate(newDueDate.toISOString().split('T')[0])
    }
  }, [date])

  // Calculate item totals with discounts
  const calculateItemTotal = (item: InvoiceItem) => {
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

  // Format currency based on position
  const formatCurrency = (amount: number) => {
    const formatted = amount.toFixed(2)
    if (currentBusiness?.currencyPosition === 'after') {
      return `${formatted}${currencySymbol}`
    }
    return `${currencySymbol}${formatted}`
  }

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
      newErrors.date = 'Invoice date is required'
    }

    // Due date validation
    if (!dueDate) {
      newErrors.dueDate = 'Payment deadline is required'
    } else if (new Date(dueDate) < new Date(date)) {
      newErrors.dueDate = 'Payment deadline must be after invoice date'
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
    
    // Calculate days until due date
    const dueDateObj = dueDate ? new Date(dueDate) : new Date(date)
    if (!dueDate) {
      // Default to 14 days from invoice date if no due date set
      dueDateObj.setDate(dueDateObj.getDate() + 14)
    }
    const daysUntilDue = Math.ceil((dueDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    const formattedDueDate = dueDateObj.toISOString().split('T')[0]

    const invoiceData = {
      customer: customerName,
      customerId: customerId,
      issueDate: formattedDate,
      amount: `${currencySymbol}${total.toFixed(2)}`,
      balance: `${currencySymbol}${total.toFixed(2)}`,
      due: daysUntilDue > 0 ? `${daysUntilDue} Days` : 'Overdue',
      status: 'Unpaid',
      invoiceNumber: invoiceNumber || `INV${Date.now()}`,
      date,
      dueDate: formattedDueDate,
      timeToPay: dueDate ? Math.ceil((new Date(dueDate).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)).toString() : '14',
      poReference,
      items,
      subtotal,
      vatAmount,
      total,
      terms,
      notes,
      attachments: attachmentBase64,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      firstRecurrencyDate: isRecurring ? firstRecurrencyDate : undefined,
      setEndDate: isRecurring ? setEndDate : undefined,
      recurringEndDate: isRecurring && setEndDate ? recurringEndDate : undefined,
      automaticallyEmail: isRecurring ? automaticallyEmail : undefined,
    }

    if (isEditMode && editId) {
      // Update existing invoice
      updateInvoice(editId, invoiceData)
      alert('Invoice updated successfully!')
      navigate('/invoices')
    } else {
      // Create new invoice
      const savedInvoice = addInvoice(invoiceData)
      if (savedInvoice) {
        setTimeout(() => {
          alert('Invoice saved successfully!')
          navigate('/invoices')
        }, 100)
      } else {
        alert('Failed to save invoice. Please try again.')
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setAttachments(files)
      
      // Convert files to base64
      const base64Promises = files.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result)
            } else {
              reject(new Error('Failed to convert file to base64'))
            }
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })
      
      Promise.all(base64Promises)
        .then((base64Strings) => {
          setAttachmentBase64(base64Strings)
        })
        .catch((error) => {
          console.error('Error converting files to base64:', error)
          alert('Error uploading files. Please try again.')
        })
    }
  }

  const handleReceivePayment = () => {
    if (!selectedCustomer || !currentBusiness) {
      alert('Please select a customer first')
      return
    }

    const paymentAmount = prompt(`Enter payment amount (${currencySymbol}${total.toFixed(2)} remaining):`)
    if (!paymentAmount) return

    const amount = parseFloat(paymentAmount.replace(/[£$€,\s]/g, ''))
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount')
      return
    }

    // Get customer object
    const customer = customers.find((c: any) => c.id === selectedCustomer || c.name === selectedCustomer)
    const customerId = customer?.id || selectedCustomer

    // Add payment record
    addPayment({
      customerId: customerId,
      customer: customer?.name || selectedCustomer,
      invoiceId: isEditMode ? editId : null,
      amount: `${currencySymbol}${amount.toFixed(2)}`,
      date: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      paymentNumber: `PAY${Date.now()}`,
      method: 'Manual',
    })

    // If editing, update invoice balance
    if (isEditMode && editId) {
      const invoice = invoices.find((inv: any) => inv.id === editId)
      if (invoice) {
        const currentBalance = parseFloat(String(invoice.balance || invoice.amount || 0).replace(/[£$€,\s]/g, ''))
        const newBalance = Math.max(0, currentBalance - amount)
        const newStatus = newBalance === 0 ? 'Paid' : invoice.status
        
        updateInvoice(editId, {
          balance: `${currencySymbol}${newBalance.toFixed(2)}`,
          status: newStatus,
        })
      }
    }

    alert(`Payment of ${currencySymbol}${amount.toFixed(2)} recorded successfully!`)
  }

  const handleMakeFullyPaid = () => {
    if (!isEditMode || !editId) {
      alert('This feature is only available when editing an existing invoice')
      return
    }

    if (window.confirm('Mark this invoice as fully paid?')) {
      const invoice = invoices.find((inv: any) => inv.id === editId)
      if (invoice) {
        updateInvoice(editId, {
          status: 'Paid',
          balance: `${currencySymbol}0.00`,
          paid: invoice.amount,
        })
        alert('Invoice marked as fully paid!')
      }
    }
  }

  const handleAutoFill = () => {
    // Generate random invoice number
    const randomNum = Math.floor(Math.random() * 10000)
    setInvoiceNumber(`INV${String(randomNum).padStart(5, '0')}`)
    
    // Set date to today
    setDate(new Date().toISOString().split('T')[0])
    
    // Random due date (7, 14, 21, 30 days from today)
    const daysOptions = [7, 14, 21, 30]
    const randomDays = daysOptions[Math.floor(Math.random() * daysOptions.length)]
    const randomDueDate = new Date()
    randomDueDate.setDate(randomDueDate.getDate() + randomDays)
    setDueDate(randomDueDate.toISOString().split('T')[0])
    
    // Random PO reference
    const poRefs = ['PO-2024-001', 'PO-2024-002', 'PO-2024-003', 'REF-2024-001', 'REF-2024-002']
    setPoReference(poRefs[Math.floor(Math.random() * poRefs.length)])
    
    // Select first available customer (or customer1/customer2 as fallback)
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
    const newItems: InvoiceItem[] = []
    
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
    setTerms('Payment is due within the specified number of days. Late payment will be subject to interest charges at 3% above bank base rate.')
    
    // Set notes
    const notesOptions = [
      'Thank you for your business!',
      'Please contact us if you have any questions.',
      'We appreciate your prompt payment.',
      'Looking forward to working with you again.',
      'Thank you for choosing our services!'
    ]
    setNotes(notesOptions[Math.floor(Math.random() * notesOptions.length)])
  }

  return (
    <Layout>
      <InvoicePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        invoiceData={{
          invoiceNumber: invoiceNumber || 'INV00001',
          selectedCustomer,
          date,
          dueDate: dueDate || (() => {
            const defaultDue = new Date(date)
            defaultDue.setDate(defaultDue.getDate() + 14)
            return defaultDue.toISOString().split('T')[0]
          })(),
          items,
          subtotal,
          vatAmount,
          total,
          terms,
          notes,
          timeToPay: dueDate ? Math.ceil((new Date(dueDate).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)).toString() : '14',
          payments: 0,
        }}
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">{isEditMode ? 'Edit Invoice' : 'Add new Invoice'}</h2>
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
              to="/invoices"
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

        <div className="space-y-6">
          {/* From/To Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
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
                  Add your business details to display them on your invoice.
                </p>
              </div>
            </div>

            {/* To */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
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
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">General Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <span className="text-red-500">*</span> Invoice number
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="Auto-generated"
                />
                <p className="text-xs text-slate-500 mt-1">Invoice numbers will not be generated</p>
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
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0]
                      setDate(today)
                      // If due date is before today or not set, update it to 14 days from today
                      if (!dueDate || new Date(dueDate) < new Date(today)) {
                        const newDueDate = new Date(today)
                        newDueDate.setDate(newDueDate.getDate() + 14)
                        setDueDate(newDueDate.toISOString().split('T')[0])
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
                  <span className="text-red-500">*</span> Payment Deadline
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value)
                    if (errors.dueDate) {
                      const newErrors = { ...errors }
                      delete newErrors.dueDate
                      setErrors(newErrors)
                    }
                  }}
                  min={date}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.dueDate ? 'border-red-500' : 'border-slate-300 focus:border-primary-500'
                  }`}
                  data-error="dueDate"
                />
                {errors.dueDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
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
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-teal-700">Items</h3>
            </div>
            {errors.items && (
              <p className="text-red-500 text-sm mb-4">{errors.items}</p>
            )}
            
            {/* Table Header */}
            <div className="bg-slate-50 border border-slate-200 rounded-t-lg">
              <div className="grid grid-cols-12 gap-4 px-4 py-3">
                <div className="col-span-4">
                  <span className="text-xs font-semibold text-teal-700 uppercase">
                    <span className="text-orange-500">*</span> ITEM NAME
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-semibold text-teal-700 uppercase">
                    <span className="text-orange-500">*</span> QTY
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-semibold text-teal-700 uppercase">DISCOUNT</span>
                </div>
                <div className="col-span-3">
                  <span className="text-xs font-semibold text-teal-700 uppercase">
                    PRICE ({currentBusiness?.currency || 'GBP'})
                    <br />
                    <span className="text-[10px]">EX. TAX</span>
                  </span>
                </div>
                <div className="col-span-1"></div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-x border-slate-200">
              {items.map((item, index) => {
                const showDescription = expandedDescriptions.has(item.id) || item.description.length > 0
                return (
                  <div key={item.id} className={`grid grid-cols-12 gap-4 px-4 py-3 items-center border-b border-slate-200 ${index === 0 ? 'border-t' : ''}`}>
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <div className="grid grid-cols-2 gap-0.5 w-4 h-4 text-slate-400 cursor-move">
                          <div className="w-1 h-1 bg-current rounded"></div>
                          <div className="w-1 h-1 bg-current rounded"></div>
                          <div className="w-1 h-1 bg-current rounded"></div>
                          <div className="w-1 h-1 bg-current rounded"></div>
                          <div className="w-1 h-1 bg-current rounded"></div>
                          <div className="w-1 h-1 bg-current rounded"></div>
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => updateItem(item.id, 'itemName', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none text-sm ${
                              errors[`item-${item.id}-itemName`] ? 'border-red-500' : 'border-slate-300 focus:border-primary-500'
                            }`}
                            placeholder="Item name"
                            data-error={`item-${item.id}-itemName`}
                          />
                          {errors[`item-${item.id}-itemName`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`item-${item.id}-itemName`]}</p>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const newSet = new Set(expandedDescriptions)
                              if (newSet.has(item.id)) {
                                newSet.delete(item.id)
                              } else {
                                newSet.add(item.id)
                              }
                              setExpandedDescriptions(newSet)
                            }}
                            className="text-xs text-teal-600 hover:text-teal-700 mt-1 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Description
                          </button>
                          {showDescription && (
                            <textarea
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none text-sm resize-y"
                              placeholder="Additional description details"
                              rows={2}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none text-sm ${
                          errors[`item-${item.id}-quantity`] ? 'border-red-500' : 'border-slate-300 focus:border-primary-500'
                        }`}
                        min="1"
                        data-error={`item-${item.id}-quantity`}
                      />
                      {errors[`item-${item.id}-quantity`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`item-${item.id}-quantity`]}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={item.discount}
                          onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-2 border border-slate-300 rounded-lg focus:outline-none text-sm"
                          min="0"
                          step="0.01"
                        />
                        <span className="text-slate-600 text-sm">%</span>
                        <div className="relative">
                          <select
                            value={item.discountType}
                            onChange={(e) => updateItem(item.id, 'discountType', e.target.value as 'percentage' | 'fixed')}
                            className="px-2 py-2 border border-slate-300 rounded-lg focus:outline-none text-sm appearance-none pr-6"
                          >
                            <option value="percentage">%</option>
                            <option value="fixed">{currencySymbol}</option>
                          </select>
                          <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none text-sm ${
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
                    <div className="col-span-1">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer with Add Item and Totals */}
            <div className="bg-slate-50 border border-slate-200 rounded-b-lg px-4 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-colors font-medium"
                >
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  Add item
                </button>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600">Discount Total</span>
                    <span className="text-sm font-semibold text-slate-800">{formatCurrency(discountTotal)}</span>
                  </div>
                  <div className="flex items-center gap-4 bg-teal-500 px-4 py-2 rounded-lg">
                    <span className="text-sm font-semibold text-white">Total ({currentBusiness?.currency || 'GBP'})</span>
                    <span className="text-sm font-bold text-white">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments and Payment Received */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attachments */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Attachments</h3>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <label className="inline-block px-4 py-2 bg-primary-500 text-white rounded-button hover:bg-primary-600 transition-colors mb-2 cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  Choose File
                </label>
                {(attachments.length > 0 || attachmentBase64.length > 0) && (
                  <div className="mt-4 text-sm text-slate-600">
                    {attachments.length || attachmentBase64.length} file(s) selected
                  </div>
                )}
                <p className="text-sm text-slate-600 mt-2">Add any attachments you want to send with</p>
                <p className="text-sm text-slate-600">the invoice.</p>
                <p className="text-xs text-slate-500 mt-2">Drag & Drop or Select Files</p>
              </div>
            </div>

            {/* Payment Received */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Payment Received</h3>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-sm text-slate-600 mb-4">No payment has been made yet</p>
                <div className="space-y-2">
                  <button
                    onClick={handleReceivePayment}
                    disabled={!selectedCustomer}
                    className="w-full px-4 py-2 bg-primary-500 text-white rounded-button hover:bg-primary-600 transition-colors disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    Receive Payment
                  </button>
                  <button
                    onClick={handleMakeFullyPaid}
                    disabled={!selectedCustomer}
                    className="w-full px-4 py-2 bg-primary-500 text-white rounded-button hover:bg-primary-600 transition-colors disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    Make Fully Paid
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Terms</h3>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                rows={4}
                placeholder="Please include payment terms, due dates, or any important conditions (e.g., Payment due within 14 days)."
              />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                rows={4}
                placeholder="Feel free to add any additional details or a friendly message for your recipient (e.g., Thank you for choosing us!)."
              />
            </div>
          </div>

          {/* Recurrency */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-slate-800">Recurrency</h3>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={automaticallyEmail}
                    onChange={(e) => setAutomaticallyEmail(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Automatically email</span>
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  <span className="ml-3 text-sm font-medium text-slate-700">Make recurring</span>
                </label>
              </div>
            </div>
            
            {isRecurring && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Frequency
                    </label>
                    <div className="relative">
                      <select
                        value={recurringFrequency}
                        onChange={(e) => setRecurringFrequency(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 appearance-none pr-8"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      First recurrency date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={firstRecurrencyDate}
                        onChange={(e) => setFirstRecurrencyDate(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 pr-20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0]
                          setFirstRecurrencyDate(today)
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
                      >
                        <Calendar className="w-3 h-3" />
                        Today
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={setEndDate}
                    onChange={(e) => setSetEndDate(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                  />
                  <label className="text-sm font-medium text-slate-700 cursor-pointer">
                    Set the end date
                  </label>
                </div>
                
                {setEndDate && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      End date
                    </label>
                    <input
                      type="date"
                      value={recurringEndDate}
                      onChange={(e) => setRecurringEndDate(e.target.value)}
                      min={firstRecurrencyDate}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pb-6">
            <Link
              to="/invoices"
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
