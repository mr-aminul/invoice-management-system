import { useState, useEffect } from 'react'
import { X, ChevronUp, ChevronDown, Info, Users, Plus, Trash2 } from 'lucide-react'

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (customer: any) => void
  customer?: any
}

export default function AddCustomerModal({ isOpen, onClose, onSave, customer }: AddCustomerModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'contacts' | 'notes'>('general')
  const [isActive, setIsActive] = useState(customer?.isActive !== false)
  const [showDeliveryBilling, setShowDeliveryBilling] = useState(false)
  const [showPaymentTerms, setShowPaymentTerms] = useState(false)
  const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(false)
  const [secondaryContacts, setSecondaryContacts] = useState<Array<{
    id: string
    firstName: string
    lastName: string
    position: string
    phone: string
    email: string
    isMain: boolean
  }>>(customer?.secondaryContacts || [])

  const [formData, setFormData] = useState({
    name: customer?.name || '',
    displayName: customer?.displayName || customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    deliveryAddress: customer?.deliveryAddress || customer?.address || '',
    billingAddress: customer?.billingAddress || '',
    customerReference: customer?.customerReference || '',
    customerTaxId: customer?.customerTaxId || '',
    timeToPay: customer?.timeToPay || '14 days',
    paymentTerms: customer?.paymentTerms || 'Late payment will be subject to interest charges at 3% above bank base rate.',
    openingBalance: customer?.openingBalance || 0,
    balance: customer?.balance || customer?.openingBalance || 0,
    notes: customer?.notes || '',
  })

  useEffect(() => {
    if (customer && isOpen) {
      // Parse balance if it's a string like "£10.00"
      const parseBalance = (bal: any): number => {
        if (typeof bal === 'number') return bal
        if (typeof bal === 'string') {
          const num = parseFloat(bal.replace(/[£,\s]/g, ''))
          return isNaN(num) ? 0 : num
        }
        return 0
      }

      try {
        setFormData({
          name: customer.name || '',
          displayName: (customer as any).displayName || customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: (customer as any).address || '',
          deliveryAddress: (customer as any).deliveryAddress || (customer as any).address || '',
          billingAddress: (customer as any).billingAddress || '',
          customerReference: (customer as any).customerReference || '',
          customerTaxId: (customer as any).customerTaxId || (customer as any).vatNumber || '',
          timeToPay: (customer as any).timeToPay || '14 days',
          paymentTerms: (customer as any).paymentTerms || 'Late payment will be subject to interest charges at 3% above bank base rate.',
          openingBalance: (customer as any).openingBalance ? parseBalance((customer as any).openingBalance) : 0,
          balance: (customer as any).balance ? parseBalance((customer as any).balance) : ((customer as any).openingBalance ? parseBalance((customer as any).openingBalance) : 0),
          notes: (customer as any).notes || '',
        })
        setIsActive((customer as any).isActive !== false)
        setBillingSameAsDelivery((customer as any).billingSameAsDelivery || false)
        setSecondaryContacts((customer as any).secondaryContacts || [])
      } catch (error) {
        console.error('Error setting customer data:', error)
      }
    } else if (!customer && isOpen) {
      setFormData({
        name: '',
        displayName: '',
        email: '',
        phone: '',
        address: '',
        deliveryAddress: '',
        billingAddress: '',
        customerReference: '',
        customerTaxId: '',
        timeToPay: '14 days',
        paymentTerms: 'Late payment will be subject to interest charges at 3% above bank base rate.',
        openingBalance: 0,
        balance: 0,
        notes: '',
      })
      setIsActive(true)
      setBillingSameAsDelivery(false)
    }
  }, [customer, isOpen])

  useEffect(() => {
    if (billingSameAsDelivery) {
      setFormData((prev) => ({ ...prev, billingAddress: prev.deliveryAddress }))
    }
  }, [billingSameAsDelivery, formData.deliveryAddress])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      isActive,
      billingSameAsDelivery,
      secondaryContacts,
    })
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
        className="bg-white rounded-lg shadow-xl w-[760px] max-h-[90vh] overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: 'default' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Modal Body */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 mt-4 px-6">
            <p className="text-lg font-semibold text-slate-800 m-0">
              {customer ? 'Edit a Customer' : 'Add a Customer'}
            </p>
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-slate-700 mr-3 mb-0">Active</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex px-2 py-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activeTab === 'general'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              General Info
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activeTab === 'contacts'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Secondary Contacts
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activeTab === 'notes'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Notes
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-[10px]">
              {activeTab === 'general' && (
                <div className="mt-4 px-6">
                  {/* Customer Name and Display Name */}
                  <div className="flex mb-4" style={{ gap: '16px' }}>
                    <div style={{ flex: '1 1 0%' }}>
                      <div className="mb-1">
                        <div className="flex items-center" style={{ marginLeft: '16px' }}>
                          <span className="text-red-500 mr-1">*</span>
                          <span className="text-sm font-medium text-slate-700">Customer name</span>
                        </div>
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value })
                          if (!formData.displayName || formData.displayName === formData.name) {
                            setFormData({ ...formData, name: e.target.value, displayName: e.target.value })
                          }
                        }}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        style={{ padding: '12px 16px' }}
                      />
                    </div>
                    <div style={{ flex: '1 1 0%' }}>
                      <div className="mb-1">
                        <div className="flex items-center" style={{ marginLeft: '16px' }}>
                          <span className="text-sm font-medium text-slate-700">Display name</span>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        style={{ padding: '12px 16px' }}
                      />
                    </div>
                  </div>

                  {/* Address and Email/Phone */}
                  <div className="flex mb-4" style={{ gap: '16px' }}>
                    <div style={{ flex: '1 1 0%' }}>
                      <div className="mb-1">
                        <div className="flex items-center" style={{ marginLeft: '16px' }}>
                          <span className="text-sm font-medium text-slate-700">Address</span>
                        </div>
                      </div>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 resize-none"
                        style={{ padding: '12px 16px', minHeight: '141px' }}
                        rows={4}
                      />
                    </div>
                    <div className="flex flex-col" style={{ flex: '1 1 0%' }}>
                      <div className="mb-4">
                        <div className="mb-1">
                          <div className="flex items-center" style={{ marginLeft: '16px' }}>
                            <span className="text-sm font-medium text-slate-700">E-mail</span>
                          </div>
                        </div>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          style={{ padding: '12px 16px' }}
                        />
                      </div>
                      <div>
                        <div className="mb-1">
                          <div className="flex items-center" style={{ marginLeft: '16px' }}>
                            <span className="text-sm font-medium text-slate-700">Phone number</span>
                          </div>
                        </div>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          style={{ padding: '12px 16px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Balance and Customer Reference */}
                  <div className="flex mb-4" style={{ gap: '16px' }}>
                    <div className="flex mb-4" style={{ flex: '0 0 50%', gap: '16px' }}>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600 mb-4">Opening balance:</p>
                        <span className="text-sm font-medium text-slate-800">£{formData.openingBalance.toFixed(2)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600 mb-4">Balance:</p>
                        <span className="text-sm font-medium text-slate-800">£{formData.balance.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-1">
                        <div className="flex items-center gap-1" style={{ marginLeft: '16px' }}>
                          <span className="text-sm font-medium text-slate-700">Customer reference</span>
                          <Info className="w-4 h-4 text-slate-400" style={{ marginBottom: '2px' }} />
                        </div>
                      </div>
                      <input
                        type="text"
                        value={formData.customerReference}
                        onChange={(e) => setFormData({ ...formData, customerReference: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        style={{ padding: '12px 16px' }}
                      />
                    </div>
                  </div>

                  {/* Delivery and Billing Address Accordion */}
                  <div className="border border-slate-200 rounded-lg mb-4" style={{ padding: '16px 16px 24px' }}>
                    <button
                      type="button"
                      onClick={() => setShowDeliveryBilling(!showDeliveryBilling)}
                      className="w-full flex justify-between items-center cursor-pointer"
                    >
                      <h3 className="text-sm font-semibold text-slate-800 m-0">Delivery and Billing Address</h3>
                      {showDeliveryBilling ? (
                        <ChevronUp className="w-5 h-5 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                    {showDeliveryBilling && (
                      <div className="flex mt-4" style={{ gap: '16px' }}>
                        <div className="flex-1 mt-4">
                          <div className="mb-1">
                            <div className="flex items-center" style={{ marginLeft: '16px' }}>
                              <span className="text-sm font-medium text-slate-700">Delivery address</span>
                            </div>
                          </div>
                          <textarea
                            value={formData.deliveryAddress}
                            onChange={(e) => {
                              setFormData({ ...formData, deliveryAddress: e.target.value })
                              if (billingSameAsDelivery) {
                                setFormData({ ...formData, deliveryAddress: e.target.value, billingAddress: e.target.value })
                              }
                            }}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 resize-none"
                            style={{ padding: '12px 16px', minHeight: '110px' }}
                            rows={4}
                          />
                        </div>
                        <div className="flex-1 mt-4">
                          <div className="mb-1">
                            <div className="flex items-center" style={{ marginLeft: '16px' }}>
                              <span className="text-sm font-medium text-slate-700">Billing address</span>
                            </div>
                          </div>
                          <textarea
                            value={formData.billingAddress}
                            onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                            disabled={billingSameAsDelivery}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-slate-100 disabled:cursor-not-allowed resize-none"
                            style={{ padding: '12px 16px', minHeight: '110px' }}
                            rows={4}
                          />
                          <div className="flex items-center mt-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={billingSameAsDelivery}
                                onChange={(e) => {
                                  setBillingSameAsDelivery(e.target.checked)
                                  if (e.target.checked) {
                                    setFormData({ ...formData, billingAddress: formData.deliveryAddress })
                                  }
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                            <h3 className="text-sm font-medium text-slate-700 ml-3 mb-0">Billing address same as delivery address</h3>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment and Terms Accordion */}
                  <div className="border border-slate-200 rounded-lg" style={{ padding: '16px 16px 24px' }}>
                    <button
                      type="button"
                      onClick={() => setShowPaymentTerms(!showPaymentTerms)}
                      className="w-full flex justify-between items-center cursor-pointer"
                    >
                      <h3 className="text-sm font-semibold text-slate-800 m-0">Payment and Terms</h3>
                      {showPaymentTerms ? (
                        <ChevronUp className="w-5 h-5 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                    {showPaymentTerms && (
                      <div className="flex flex-col w-full mt-4">
                        <div className="flex items-end mb-4" style={{ gap: '16px' }}>
                          <div className="flex-1">
                            <div className="mb-1">
                              <div className="flex items-center" style={{ marginLeft: '16px' }}>
                                <span className="text-sm font-medium text-slate-700">Customer Tax ID</span>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={formData.customerTaxId}
                              onChange={(e) => setFormData({ ...formData, customerTaxId: e.target.value })}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                              style={{ padding: '12px 16px' }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="mb-1">
                              <div className="flex items-center" style={{ marginLeft: '16px' }}>
                                <span className="text-sm font-medium text-slate-700">Time to pay</span>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={formData.timeToPay}
                              onChange={(e) => setFormData({ ...formData, timeToPay: e.target.value })}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                              style={{ padding: '12px 16px' }}
                            />
                          </div>
                        </div>
                        <div className="w-full">
                          <div className="mb-1">
                            <div className="flex items-center" style={{ marginLeft: '16px' }}>
                              <span className="text-sm font-medium text-slate-700">Payment terms</span>
                            </div>
                          </div>
                          <textarea
                            value={formData.paymentTerms}
                            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 resize-none"
                            style={{ padding: '12px 16px', minHeight: '136px' }}
                            rows={5}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="mt-4 px-6">
                  {secondaryContacts.length === 0 ? (
                    // Empty state - show icon and add button
                    <div className="flex justify-center">
                      <div className="flex flex-col items-center" style={{ marginTop: '32px' }}>
                        {/* Contact Icon - Light blue group icon */}
                        <div className="flex items-center justify-center" style={{ width: '80px', height: '80px' }}>
                          <Users className="w-20 h-20" style={{ width: '80px', height: '80px', color: '#60a5fa' }} />
                        </div>
                        {/* Title */}
                        <p className="m-0" style={{ fontSize: '28px', fontWeight: '700', margin: '32px 0px 8px', color: '#1e293b' }}>
                          Add More Contacts
                        </p>
                        {/* Description */}
                        <p className="m-0" style={{ fontSize: '14.4px', color: 'rgb(87, 118, 126)', margin: '0px 0px 32px', textAlign: 'center' }}>
                          Use this section to add additional contacts for your customer. This is useful if your customer hires employees or other personnel that you need to contact.
                        </p>
                        {/* Add Contact Button - Circular light blue button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSecondaryContacts([{
                              id: Date.now().toString(),
                              firstName: '',
                              lastName: '',
                              position: '',
                              phone: '',
                              email: '',
                              isMain: false
                            }])
                          }}
                          className="flex items-center cursor-pointer hover:opacity-90 transition-opacity rounded-full"
                          style={{
                            padding: '12px 20px',
                            margin: '0px',
                            cursor: 'pointer',
                            backgroundColor: '#60a5fa',
                            color: '#1e293b',
                            border: 'none',
                            borderRadius: '9999px',
                            gap: '8px'
                          }}
                        >
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white" style={{ width: '24px', height: '24px' }}>
                            <Plus className="w-4 h-4 text-blue-500" style={{ width: '16px', height: '16px', color: '#60a5fa' }} />
                          </div>
                          <span style={{ color: '#1e293b', fontWeight: '500' }}>Add new contact</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Contact form
                    <div className="space-y-4">
                      {secondaryContacts.map((contact, index) => (
                        <div key={contact.id} className="space-y-4">
                          {/* First name and Last name */}
                          <div className="flex mb-4" style={{ gap: '16px' }}>
                            <div style={{ flex: '1 1 0%' }}>
                              <div className="mb-1">
                                <div className="flex items-center" style={{ marginLeft: '16px' }}>
                                  <span className="text-sm font-medium text-slate-700">First name</span>
                                </div>
                              </div>
                              <input
                                type="text"
                                value={contact.firstName}
                                onChange={(e) => {
                                  const updated = [...secondaryContacts]
                                  updated[index].firstName = e.target.value
                                  setSecondaryContacts(updated)
                                }}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                                style={{ padding: '12px 16px' }}
                              />
                            </div>
                            <div style={{ flex: '1 1 0%' }}>
                              <div className="mb-1">
                                <div className="flex items-center" style={{ marginLeft: '16px' }}>
                                  <span className="text-sm font-medium text-slate-700">Last name</span>
                                </div>
                              </div>
                              <input
                                type="text"
                                value={contact.lastName}
                                onChange={(e) => {
                                  const updated = [...secondaryContacts]
                                  updated[index].lastName = e.target.value
                                  setSecondaryContacts(updated)
                                }}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                                style={{ padding: '12px 16px' }}
                              />
                            </div>
                          </div>

                          {/* Position and Phone number */}
                          <div className="flex mb-4" style={{ gap: '16px' }}>
                            <div style={{ flex: '1 1 0%' }}>
                              <div className="mb-1">
                                <div className="flex items-center" style={{ marginLeft: '16px' }}>
                                  <span className="text-sm font-medium text-slate-700">Position</span>
                                </div>
                              </div>
                              <input
                                type="text"
                                value={contact.position}
                                onChange={(e) => {
                                  const updated = [...secondaryContacts]
                                  updated[index].position = e.target.value
                                  setSecondaryContacts(updated)
                                }}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                                style={{ padding: '12px 16px' }}
                              />
                            </div>
                            <div style={{ flex: '1 1 0%' }}>
                              <div className="mb-1">
                                <div className="flex items-center" style={{ marginLeft: '16px' }}>
                                  <span className="text-sm font-medium text-slate-700">Phone number</span>
                                </div>
                              </div>
                              <input
                                type="tel"
                                value={contact.phone}
                                onChange={(e) => {
                                  const updated = [...secondaryContacts]
                                  updated[index].phone = e.target.value
                                  setSecondaryContacts(updated)
                                }}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                                style={{ padding: '12px 16px' }}
                              />
                            </div>
                          </div>

                          {/* E-mail and Main contact toggle */}
                          <div className="flex mb-4 items-end" style={{ gap: '16px' }}>
                            <div style={{ flex: '1 1 0%' }}>
                              <div className="mb-1">
                                <div className="flex items-center" style={{ marginLeft: '16px' }}>
                                  <span className="text-sm font-medium text-slate-700">E-mail</span>
                                </div>
                              </div>
                              <input
                                type="email"
                                value={contact.email}
                                onChange={(e) => {
                                  const updated = [...secondaryContacts]
                                  updated[index].email = e.target.value
                                  setSecondaryContacts(updated)
                                }}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                                style={{ padding: '12px 16px' }}
                              />
                            </div>
                            <div className="flex items-center gap-3" style={{ marginBottom: '5px' }}>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={contact.isMain}
                                  onChange={(e) => {
                                    const updated = [...secondaryContacts]
                                    // If setting this as main, unset others
                                    if (e.target.checked) {
                                      updated.forEach((c, i) => {
                                        c.isMain = i === index
                                      })
                                    } else {
                                      updated[index].isMain = false
                                    }
                                    setSecondaryContacts(updated)
                                  }}
                                  className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                              </label>
                              <span className="text-sm text-slate-600">This is the main contact</span>
                            </div>
                          </div>

                          {/* Remove contact button */}
                          <div className="flex justify-end mb-4">
                            <button
                              type="button"
                              onClick={() => {
                                setSecondaryContacts(secondaryContacts.filter((_, i) => i !== index))
                              }}
                              className="flex items-center gap-2 text-slate-700 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                              <span className="text-sm font-medium">Remove contact</span>
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add contact button */}
                      <div className="flex justify-start mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSecondaryContacts([...secondaryContacts, {
                              id: Date.now().toString(),
                              firstName: '',
                              lastName: '',
                              position: '',
                              phone: '',
                              email: '',
                              isMain: false
                            }])
                          }}
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="text-sm font-medium">Add contact</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="mt-4 px-6">
                  <div className="mb-1">
                    <div className="flex items-center" style={{ marginLeft: '16px' }}>
                      <span className="text-sm font-medium text-slate-700">Notes</span>
                    </div>
                  </div>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 resize-none"
                    style={{ padding: '12px 16px' }}
                    rows={8}
                    placeholder="Add notes about this customer..."
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end w-full mt-3 px-6 pb-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700"
                style={{ width: '120px', padding: '8px 20px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium ml-4"
                style={{ width: '160px', padding: '10px 20px' }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
