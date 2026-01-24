import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useBusiness } from '../contexts/BusinessContext'
import { AlertCircle, Upload, X } from 'lucide-react'

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Austria',
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Portugal',
  'Ireland', 'Greece', 'India', 'China', 'Japan', 'South Korea',
  'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Philippines', 'Vietnam',
  'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia', 'South Africa',
  'Egypt', 'UAE', 'Saudi Arabia', 'Turkey', 'Israel', 'New Zealand'
]

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
]

export default function AddBusiness() {
  const navigate = useNavigate()
  const { addBusiness } = useBusiness()
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    currency: '',
    bankDetails: '',
    address: '',
  })
  const [_logo, setLogo] = useState<File | null>(null)
  const [_signature, setSignature] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogo(file)
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
      setSignature(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogo(null)
    setLogoPreview(null)
  }

  const removeSignature = () => {
    setSignature(null)
    setSignaturePreview(null)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required'
    }
    if (!formData.country) {
      newErrors.country = 'Country is required'
    }
    if (!formData.currency) {
      newErrors.currency = 'Currency is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Convert files to base64 strings for storage
      let logoBase64 = logoPreview || undefined
      let signatureBase64 = signaturePreview || undefined

      const businessData = {
        name: formData.name.trim(),
        country: formData.country,
        currency: formData.currency,
        bankDetails: formData.bankDetails.trim() || undefined,
        address: formData.address.trim() || undefined,
        logo: logoBase64,
        signature: signatureBase64,
      }

      addBusiness(businessData)
      
      // Navigate to dashboard after successful creation
      navigate('/dashboard')
    } catch (error) {
      console.error('Error creating business:', error)
      alert('Failed to create business. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      country: '',
      currency: '',
      bankDetails: '',
      address: '',
    })
    setLogo(null)
    setSignature(null)
    setLogoPreview(null)
    setSignaturePreview(null)
    setErrors({})
  }

  const handleCancel = () => {
    navigate('/dashboard')
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Set Up Business</h2>
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
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
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
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Enter business name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Not Editable Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-amber-800 mb-1">
                      NOT EDITABLE after saving business
                    </h3>
                    <p className="text-xs text-amber-700">
                      The following fields cannot be changed after saving: Country and Currency
                    </p>
                  </div>
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <span className="text-red-500">*</span> Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.country ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select a country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.country}
                  </p>
                )}
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <span className="text-red-500">*</span> Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.currency ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select a currency</option>
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name} ({currency.symbol})
                    </option>
                  ))}
                </select>
                {errors.currency && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.currency}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Bank Details */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bank details
                </label>
                <textarea
                  name="bankDetails"
                  value={formData.bankDetails}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter bank account details"
                />
              </div>

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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter business address"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Logo
                </label>
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-32 h-32 object-contain border border-slate-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Signature Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Signature
                </label>
                {signaturePreview ? (
                  <div className="relative">
                    <img
                      src={signaturePreview}
                      alt="Signature preview"
                      className="w-32 h-32 object-contain border border-slate-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeSignature}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}
