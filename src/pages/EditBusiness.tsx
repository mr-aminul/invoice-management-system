import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useBusiness } from '../contexts/BusinessContext'
import { Edit2, Trash2, Plus, ChevronLeft, ChevronRight, HelpCircle, Download, Eye } from 'lucide-react'

const currencyPositions = [
  { value: 'before', label: 'At the beginning €100' },
  { value: 'after', label: 'At the end 100€' },
]

const dateFormats = [
  { value: 'dd MMM yyyy', label: 'dd MMM yyyy 15 Dec 2023' },
  { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy 15/12/2023' },
  { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy 12/15/2023' },
  { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd 2023-12-15' },
  { value: 'dd-MM-yyyy', label: 'dd-MM-yyyy 15-12-2023' },
]

const numberFormats = [
  { value: '654,321.00', label: '654,321.00' },
  { value: '654.321,00', label: '654.321,00' },
  { value: '654 321,00', label: '654 321,00' },
  { value: '654321.00', label: '654321.00' },
]

const pdfTemplates = [
  { id: 'T.01', name: 'T. 01', hasColors: true },
  { id: 'T.02', name: 'T. 02', hasColors: true },
  { id: 'T.03', name: 'T. 03', hasColors: false },
  { id: 'T.04', name: 'T. 04', hasColors: true },
  { id: 'T.05', name: 'T. 05', hasColors: true },
  { id: 'T.06', name: 'T. 06', hasColors: true },
  { id: 'T.07', name: 'T. 07', hasColors: true },
  { id: 'T.08', name: 'T. 08', hasColors: true },
]

export default function EditBusiness() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { businesses, currentBusiness, updateBusiness, deleteBusiness } = useBusiness()
  const [activeTab, setActiveTab] = useState<'general' | 'bank' | 'tax' | 'invoices' | 'users' | 'email'>('general')
  
  const business = businesses.find(b => b.id === id) || currentBusiness
  
  const [formData, setFormData] = useState({
    name: business?.name || '',
    country: business?.country || '',
    currency: business?.currency || '',
    currencyPosition: business?.currencyPosition || 'before',
    dateFormat: business?.dateFormat || 'dd MMM yyyy',
    numberFormat: business?.numberFormat || '654,321.00',
    address: business?.address || '',
    email: business?.email || '',
    enableStockTracking: business?.enableStockTracking || false,
    homeBankAccountDetails: business?.homeBankAccountDetails || '',
    taxNextYearEnd: business?.taxNextYearEnd || '',
    utrTaxIdNumber: business?.utrTaxIdNumber || '',
    registeredForVAT: business?.registeredForVAT || false,
    pdfTemplate: business?.pdfTemplate || 'T.01',
    invoiceTerms: business?.invoiceTerms || '',
    invoiceFooter: business?.invoiceFooter || '',
    salesInvoiceText: business?.salesInvoiceText || 'Invoice',
    invoiceNumberLabel: business?.invoiceNumberLabel || 'Inv no',
    invoiceDateLabel: business?.invoiceDateLabel || 'Date',
    invoiceTotalLabel: business?.invoiceTotalLabel || 'Total',
    estimateTerms: business?.estimateTerms || '',
    estimateLabel: business?.estimateLabel || 'Estimate',
    estimateNumberLabel: business?.estimateNumberLabel || 'Estimate Number',
    estimateDateLabel: business?.estimateDateLabel || 'Estimate Date',
    estimateTotalLabel: business?.estimateTotalLabel || 'Estimate Total',
    estimateTotalReferenceLabel: business?.estimateTotalReferenceLabel || 'Customer reference',
    useDeliveryNoteForPOReference: business?.useDeliveryNoteForPOReference || false,
    emailCopyOfAllDocuments: business?.emailCopyOfAllDocuments || false,
    salesInvoiceEmailSubject: business?.salesInvoiceEmailSubject || '',
    salesInvoiceEmailBody: business?.salesInvoiceEmailBody || '',
    estimateEmailSubject: business?.estimateEmailSubject || '',
    estimateEmailBody: business?.estimateEmailBody || '',
    refundEmailSubject: business?.refundEmailSubject || '',
    refundEmailBody: business?.refundEmailBody || '',
    creditNoteEmailSubject: business?.creditNoteEmailSubject || '',
    creditNoteEmailBody: business?.creditNoteEmailBody || '',
    deliveryNoteEmailSubject: business?.deliveryNoteEmailSubject || '',
    deliveryNoteEmailBody: business?.deliveryNoteEmailBody || '',
    statementEmailSubject: business?.statementEmailSubject || '',
    statementEmailBody: business?.statementEmailBody || '',
  })
  
  const [_logoFile, setLogoFile] = useState<File | null>(null)
  const [_signatureFile, setSignatureFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(business?.logo || null)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(business?.signature || null)
  const [originalFormData, setOriginalFormData] = useState(formData)
  const [expandedEmailTemplate, setExpandedEmailTemplate] = useState<string | null>('salesInvoice')

  useEffect(() => {
    if (business) {
      const data = {
        name: business.name || '',
        country: business.country || '',
        currency: business.currency || '',
        currencyPosition: business.currencyPosition || 'before',
        dateFormat: business.dateFormat || 'dd MMM yyyy',
        numberFormat: business.numberFormat || '654,321.00',
        address: business.address || '',
        email: business.email || '',
        enableStockTracking: business.enableStockTracking || false,
        homeBankAccountDetails: business.homeBankAccountDetails || '',
        taxNextYearEnd: business.taxNextYearEnd || '',
        utrTaxIdNumber: business.utrTaxIdNumber || '',
        registeredForVAT: business.registeredForVAT || false,
        pdfTemplate: business.pdfTemplate || 'T.01',
        invoiceTerms: business.invoiceTerms || '',
        invoiceFooter: business.invoiceFooter || '',
        salesInvoiceText: business.salesInvoiceText || 'Invoice',
        invoiceNumberLabel: business.invoiceNumberLabel || 'Inv no',
        invoiceDateLabel: business.invoiceDateLabel || 'Date',
        invoiceTotalLabel: business.invoiceTotalLabel || 'Total',
        estimateTerms: business.estimateTerms || '',
        estimateLabel: business.estimateLabel || 'Estimate',
        estimateNumberLabel: business.estimateNumberLabel || 'Estimate Number',
        estimateDateLabel: business.estimateDateLabel || 'Estimate Date',
        estimateTotalLabel: business.estimateTotalLabel || 'Estimate Total',
        estimateTotalReferenceLabel: business.estimateTotalReferenceLabel || 'Customer reference',
        useDeliveryNoteForPOReference: business.useDeliveryNoteForPOReference || false,
        emailCopyOfAllDocuments: business.emailCopyOfAllDocuments || false,
        salesInvoiceEmailSubject: business.salesInvoiceEmailSubject || '',
        salesInvoiceEmailBody: business.salesInvoiceEmailBody || '',
        estimateEmailSubject: business.estimateEmailSubject || '',
        estimateEmailBody: business.estimateEmailBody || '',
        refundEmailSubject: business.refundEmailSubject || '',
        refundEmailBody: business.refundEmailBody || '',
        creditNoteEmailSubject: business.creditNoteEmailSubject || '',
        creditNoteEmailBody: business.creditNoteEmailBody || '',
        deliveryNoteEmailSubject: business.deliveryNoteEmailSubject || '',
        deliveryNoteEmailBody: business.deliveryNoteEmailBody || '',
        statementEmailSubject: business.statementEmailSubject || '',
        statementEmailBody: business.statementEmailBody || '',
      }
      setFormData(data)
      setOriginalFormData(data)
      setLogoPreview(business.logo || null)
      setSignaturePreview(business.signature || null)
    }
  }, [business])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSignatureFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleSave = () => {
    if (!business || !id) return
    
    const updatedData: any = {
      ...formData,
      logo: logoPreview || undefined,
      signature: signaturePreview || undefined,
    }
    
    // Remove empty string values and convert to undefined
    Object.keys(updatedData).forEach(key => {
      if (updatedData[key] === '') {
        updatedData[key] = undefined
      }
    })
    
    updateBusiness(id, updatedData)
    navigate('/dashboard')
  }

  const handleReset = () => {
    setFormData(originalFormData)
    setLogoPreview(business?.logo || null)
    setSignaturePreview(business?.signature || null)
    setLogoFile(null)
    setSignatureFile(null)
  }

  const handleCancel = () => {
    navigate('/dashboard')
  }

  const handleDelete = () => {
    if (!business || !id) return
    if (window.confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      deleteBusiness(id)
      navigate('/dashboard')
    }
  }

  if (!business) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-6">
          <p>Business not found</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Edit Business</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'general'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                General info
              </button>
              <button
                onClick={() => setActiveTab('bank')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'bank'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                Bank accounts
              </button>
              <button
                onClick={() => setActiveTab('tax')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'tax'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                Tax
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'invoices'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                Invoices & Estimates
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'email'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                Email settings
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-5 sm:p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Business Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <span className="text-red-500">*</span> Business name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    {/* Country and Currency Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <span className="text-red-500">*</span> Country
                        </label>
                        <select
                          name="country"
                          value={formData.country}
                          disabled
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                        >
                          <option>{formData.country || 'Select country'}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <span className="text-red-500">*</span> Currency
                        </label>
                        <select
                          name="currency"
                          value={formData.currency}
                          disabled
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                        >
                          <option>{formData.currency || 'Select currency'}</option>
                        </select>
                      </div>
                    </div>

                    {/* Currency Position */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Currency position
                      </label>
                      <select
                        name="currencyPosition"
                        value={formData.currencyPosition}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                      >
                        {currencyPositions.map(pos => (
                          <option key={pos.value} value={pos.value}>{pos.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date Format and Number Format Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Date format
                        </label>
                        <select
                          name="dateFormat"
                          value={formData.dateFormat}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        >
                          {dateFormats.map(format => (
                            <option key={format.value} value={format.value}>{format.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Number format
                        </label>
                        <select
                          name="numberFormat"
                          value={formData.numberFormat}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        >
                          {numberFormats.map(format => (
                            <option key={format.value} value={format.value}>{format.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Business Address */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Business address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        placeholder="Enter business address"
                      />
                    </div>

                    {/* E-mail */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        E-mail
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        placeholder="business@example.com"
                      />
                    </div>

                    {/* Logo */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Logo
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                          >
                            Choose File
                          </button>
                        </label>
                        {logoPreview && (
                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                              />
                              <button
                                type="button"
                                className="p-2 text-slate-600 hover:text-primary-600 transition-colors"
                                title="Edit logo"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </label>
                            <button
                              type="button"
                              onClick={removeLogo}
                              className="p-2 text-slate-600 hover:text-red-600 transition-colors"
                              title="Remove logo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      {logoPreview && (
                        <div className="mt-2">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-32 h-32 object-contain border border-slate-300 rounded-lg"
                          />
                        </div>
                      )}
                    </div>

                    {/* Signature */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Signature
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSignatureChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                          >
                            Choose File
                          </button>
                        </label>
                        {!signaturePreview && (
                          <div className="p-2 text-slate-400">
                            <Plus className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      {signaturePreview && (
                        <div className="mt-2">
                          <img
                            src={signaturePreview}
                            alt="Signature preview"
                            className="w-32 h-32 object-contain border border-slate-300 rounded-lg"
                          />
                        </div>
                      )}
                    </div>

                    {/* Enable Stock Tracking */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="enableStockTracking"
                        checked={formData.enableStockTracking}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                      />
                      <label className="text-sm font-medium text-slate-700">
                        Enable stock and quantity tracking
                      </label>
                    </div>
                  </div>
                </div>

                {/* Delete Business */}
                <div className="pt-6 border-t border-slate-200">
                  <button
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
                  >
                    Delete Business
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'bank' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Home bank account details - {business?.currency || 'GBP'}
                    </label>
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                  </div>
                  <textarea
                    name="homeBankAccountDetails"
                    value={formData.homeBankAccountDetails}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                    placeholder="Enter bank account details"
                  />
                </div>
              </div>
            )}

            {activeTab === 'tax' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Tax & Fiscal details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tax - Next year end
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          name="taxNextYearEnd"
                          value={formData.taxNextYearEnd}
                          onChange={handleInputChange}
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date().toISOString().split('T')[0]
                            setFormData(prev => ({ ...prev, taxNextYearEnd: today }))
                          }}
                          className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Today
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        UTR / Tax ID number
                      </label>
                      <input
                        type="text"
                        name="utrTaxIdNumber"
                        value={formData.utrTaxIdNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        placeholder="Type TAX ID"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Government sales tax</h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="registeredForVAT"
                      checked={formData.registeredForVAT}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                    />
                    <label className="text-sm font-medium text-slate-700">
                      Registered for VAT
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="space-y-8">
                {/* PDF Template Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">PDF Template</h3>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Previous"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Next"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {pdfTemplates.map((template) => (
                        <div key={template.id} className={`border rounded-lg p-4 ${formData.pdfTemplate === template.id ? 'border-primary-600 bg-primary-50' : 'border-slate-300'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="radio"
                              name="pdfTemplate"
                              value={template.id}
                              checked={formData.pdfTemplate === template.id}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-primary-600"
                            />
                            <span className="text-sm font-medium text-slate-700">{template.name}</span>
                          </div>
                          <div className="bg-slate-100 rounded h-32 flex items-center justify-center mb-2">
                            <div className="text-xs text-slate-400">Template Preview</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Preview
                            </button>
                            <span className="text-xs text-slate-500">
                              {template.hasColors ? 'Colours' : 'No available colours'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Invoices Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Invoices</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Invoice terms
                      </label>
                      <textarea
                        name="invoiceTerms"
                        value={formData.invoiceTerms}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        placeholder="Enter invoice terms"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Invoice footer
                      </label>
                      <textarea
                        name="invoiceFooter"
                        value={formData.invoiceFooter}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        placeholder="Enter invoice footer"
                      />
                    </div>
                    <p className="text-sm text-slate-600">
                      Below you can change default text for labels for your invoices to whatever you like.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Sales invoice text
                        </label>
                        <input
                          type="text"
                          name="salesInvoiceText"
                          value={formData.salesInvoiceText}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Invoice number
                        </label>
                        <input
                          type="text"
                          name="invoiceNumberLabel"
                          value={formData.invoiceNumberLabel}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Invoice date
                        </label>
                        <input
                          type="text"
                          name="invoiceDateLabel"
                          value={formData.invoiceDateLabel}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Invoice total
                        </label>
                        <input
                          type="text"
                          name="invoiceTotalLabel"
                          value={formData.invoiceTotalLabel}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estimates Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Estimates</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Estimate terms
                      </label>
                      <textarea
                        name="estimateTerms"
                        value={formData.estimateTerms}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        placeholder="Enter estimate terms"
                      />
                    </div>
                    <p className="text-sm text-slate-600">
                      Below you can change default text for labels for your estimates to whatever you like.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Estimate
                        </label>
                        <input
                          type="text"
                          name="estimateLabel"
                          value={formData.estimateLabel}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Estimate number
                        </label>
                        <input
                          type="text"
                          name="estimateNumberLabel"
                          value={formData.estimateNumberLabel}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Estimate date
                        </label>
                        <input
                          type="text"
                          name="estimateDateLabel"
                          value={formData.estimateDateLabel}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Estimate total
                        </label>
                        <input
                          type="text"
                          name="estimateTotalLabel"
                          value={formData.estimateTotalLabel}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Estimate total reference
                        </label>
                        <input
                          type="text"
                          name="estimateTotalReferenceLabel"
                          value={formData.estimateTotalReferenceLabel}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Use delivery note for PO reference */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="useDeliveryNoteForPOReference"
                    checked={formData.useDeliveryNoteForPOReference}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                  />
                  <label className="text-sm font-medium text-slate-700">
                    Use delivery note for PO reference
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Manage users</h3>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      <span>Compare roles</span>
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add user</span>
                    </button>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">NAME</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">EMAIL</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">ROLE</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">STATUS</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">DATE ADDED</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-slate-200">
                        <td className="px-4 py-3 text-sm text-slate-700">{business?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{business?.email || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">Account Owner</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            Active
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {business?.createdAt ? new Date(business.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Edit email content</h3>
                  <p className="text-sm text-slate-600 mb-1">
                    This is an email template designed for sending documents to your customers.
                  </p>
                  <p className="text-sm text-slate-600 mb-4">
                    Variable tags will be replaced with your business or customer data. To insert a tag, start typing @...
                  </p>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <input
                    type="checkbox"
                    name="emailCopyOfAllDocuments"
                    checked={formData.emailCopyOfAllDocuments}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                  />
                  <label className="text-sm font-medium text-slate-700">
                    Get a copy of all emailed invoices, estimates, and delivery notes
                  </label>
                </div>
                <div className="space-y-4">
                  {/* Sales Invoice Template */}
                  <div className="border border-slate-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setExpandedEmailTemplate(expandedEmailTemplate === 'salesInvoice' ? null : 'salesInvoice')}
                      className="w-full px-4 py-3 text-left font-medium text-slate-800 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span>Sales Invoice Template</span>
                      {expandedEmailTemplate === 'salesInvoice' ? (
                        <ChevronRight className="w-5 h-5 transform rotate-90" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    {expandedEmailTemplate === 'salesInvoice' && (
                      <div className="px-4 pb-4 space-y-4 border-t border-slate-200">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Subject:
                          </label>
                          <input
                            type="text"
                            name="salesInvoiceEmailSubject"
                            value={formData.salesInvoiceEmailSubject || `${business?.name || 'My Company name'} - Invoice number`}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Body:
                          </label>
                          <textarea
                            name="salesInvoiceEmailBody"
                            value={formData.salesInvoiceEmailBody || `Hello Customer company name, Please find attached your sales invoice. If you have any questions, please contact us at ${business?.email || 'My email'} and we are happy to help you. Kind regards, My first name My last name`}
                            onChange={handleInputChange}
                            rows={6}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Estimate Template */}
                  <div className="border border-slate-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setExpandedEmailTemplate(expandedEmailTemplate === 'estimate' ? null : 'estimate')}
                      className="w-full px-4 py-3 text-left font-medium text-slate-800 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span>Estimate Template</span>
                      {expandedEmailTemplate === 'estimate' ? (
                        <ChevronRight className="w-5 h-5 transform rotate-90" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    {expandedEmailTemplate === 'estimate' && (
                      <div className="px-4 pb-4 space-y-4 border-t border-slate-200">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Subject:
                          </label>
                          <input
                            type="text"
                            name="estimateEmailSubject"
                            value={formData.estimateEmailSubject}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Body:
                          </label>
                          <textarea
                            name="estimateEmailBody"
                            value={formData.estimateEmailBody}
                            onChange={handleInputChange}
                            rows={6}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Refund Template */}
                  <div className="border border-slate-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setExpandedEmailTemplate(expandedEmailTemplate === 'refund' ? null : 'refund')}
                      className="w-full px-4 py-3 text-left font-medium text-slate-800 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span>Refund Template</span>
                      {expandedEmailTemplate === 'refund' ? (
                        <ChevronRight className="w-5 h-5 transform rotate-90" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    {expandedEmailTemplate === 'refund' && (
                      <div className="px-4 pb-4 space-y-4 border-t border-slate-200">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Subject:
                          </label>
                          <input
                            type="text"
                            name="refundEmailSubject"
                            value={formData.refundEmailSubject}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Body:
                          </label>
                          <textarea
                            name="refundEmailBody"
                            value={formData.refundEmailBody}
                            onChange={handleInputChange}
                            rows={6}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Credit Note Template */}
                  <div className="border border-slate-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setExpandedEmailTemplate(expandedEmailTemplate === 'creditNote' ? null : 'creditNote')}
                      className="w-full px-4 py-3 text-left font-medium text-slate-800 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span>Credit Note Template</span>
                      {expandedEmailTemplate === 'creditNote' ? (
                        <ChevronRight className="w-5 h-5 transform rotate-90" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    {expandedEmailTemplate === 'creditNote' && (
                      <div className="px-4 pb-4 space-y-4 border-t border-slate-200">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Subject:
                          </label>
                          <input
                            type="text"
                            name="creditNoteEmailSubject"
                            value={formData.creditNoteEmailSubject}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Body:
                          </label>
                          <textarea
                            name="creditNoteEmailBody"
                            value={formData.creditNoteEmailBody}
                            onChange={handleInputChange}
                            rows={6}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delivery Note Template */}
                  <div className="border border-slate-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setExpandedEmailTemplate(expandedEmailTemplate === 'deliveryNote' ? null : 'deliveryNote')}
                      className="w-full px-4 py-3 text-left font-medium text-slate-800 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span>Delivery Note Template</span>
                      {expandedEmailTemplate === 'deliveryNote' ? (
                        <ChevronRight className="w-5 h-5 transform rotate-90" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    {expandedEmailTemplate === 'deliveryNote' && (
                      <div className="px-4 pb-4 space-y-4 border-t border-slate-200">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Subject:
                          </label>
                          <input
                            type="text"
                            name="deliveryNoteEmailSubject"
                            value={formData.deliveryNoteEmailSubject}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Body:
                          </label>
                          <textarea
                            name="deliveryNoteEmailBody"
                            value={formData.deliveryNoteEmailBody}
                            onChange={handleInputChange}
                            rows={6}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Statement Template */}
                  <div className="border border-slate-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setExpandedEmailTemplate(expandedEmailTemplate === 'statement' ? null : 'statement')}
                      className="w-full px-4 py-3 text-left font-medium text-slate-800 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span>Statement Template</span>
                      {expandedEmailTemplate === 'statement' ? (
                        <ChevronRight className="w-5 h-5 transform rotate-90" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    {expandedEmailTemplate === 'statement' && (
                      <div className="px-4 pb-4 space-y-4 border-t border-slate-200">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Subject:
                          </label>
                          <input
                            type="text"
                            name="statementEmailSubject"
                            value={formData.statementEmailSubject}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Body:
                          </label>
                          <textarea
                            name="statementEmailBody"
                            value={formData.statementEmailBody}
                            onChange={handleInputChange}
                            rows={6}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
