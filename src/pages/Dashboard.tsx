import { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { Plus, Calendar, Info, Eye, ChevronDown } from 'lucide-react'
import { useBusinessData } from '../hooks/useBusinessData'
import { useBusiness } from '../contexts/BusinessContext'

export default function Dashboard() {
  const { currentBusiness } = useBusiness()
  const { data: invoices } = useBusinessData<any>('invoices', [])
  const { data: estimates } = useBusinessData<any>('estimates', [])
  
  const [selectedPeriod, setSelectedPeriod] = useState('Current Month')
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [showAccountSummaryDropdown, setShowAccountSummaryDropdown] = useState(false)
  const [showBestSellingDropdown, setShowBestSellingDropdown] = useState(false)
  const periodDropdownRef = useRef<HTMLDivElement>(null)
  const accountSummaryDropdownRef = useRef<HTMLDivElement>(null)
  const bestSellingDropdownRef = useRef<HTMLDivElement>(null)
  
  // Get currency symbol
  const getCurrencySymbol = () => {
    if (!currentBusiness) return '£'
    const currency = currentBusiness.currency || 'GBP'
    const currencyMap: Record<string, string> = {
      'GBP': '£', 'USD': '$', 'EUR': '€', 'CAD': 'C$', 'AUD': 'A$',
      'JPY': '¥', 'CNY': '¥', 'INR': '₹', 'SGD': 'S$', 'HKD': 'HK$',
    }
    return currencyMap[currency] || currency
  }
  const currencySymbol = getCurrencySymbol()
  
  // Calculate date range based on selected period
  const getDateRange = () => {
    const now = new Date()
    let start: Date, end: Date
    
    switch (selectedPeriod) {
      case 'Current Month':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        break
      case 'Previous Month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        break
      case 'Current Quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        start = new Date(now.getFullYear(), quarter * 3, 1)
        end = new Date(now.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59)
        break
      case 'Previous Quarter':
        const prevQuarter = Math.floor(now.getMonth() / 3) - 1
        const prevQuarterYear = prevQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear()
        const actualPrevQuarter = prevQuarter < 0 ? 3 : prevQuarter
        start = new Date(prevQuarterYear, actualPrevQuarter * 3, 1)
        end = new Date(prevQuarterYear, (actualPrevQuarter + 1) * 3, 0, 23, 59, 59)
        break
      case 'Current Year':
        start = new Date(now.getFullYear(), 0, 1)
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
        break
      case 'Previous Year':
        start = new Date(now.getFullYear() - 1, 0, 1)
        end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59)
        break
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    }
    return { start, end }
  }
  
  // Calculate metrics
  const metrics = useMemo(() => {
    const { start, end } = getDateRange()
    
    // Filter invoices in date range
    const periodInvoices = invoices.filter((inv: any) => {
      try {
        const invDate = new Date(inv.date || inv.issueDate || '')
        return invDate >= start && invDate <= end
      } catch {
        return false
      }
    })
    
    // Calculate totals
    let totalRevenueIncVAT = 0
    let totalRevenueExVAT = 0
    let totalVAT = 0
    
    periodInvoices.forEach((inv: any) => {
      const total = inv.total || parseFloat(String(inv.amount || 0).replace(/[£$€,\s]/g, '')) || 0
      const vat = inv.vatAmount || inv.vat || 0
      const subtotal = inv.subtotal || (total - vat)
      
      totalRevenueIncVAT += total
      totalRevenueExVAT += subtotal
      totalVAT += vat
    })
    
    // Get previous period for comparison
    const prevPeriod = selectedPeriod === 'Current Month' ? 'Previous Month' :
                       selectedPeriod === 'Current Quarter' ? 'Previous Quarter' :
                       selectedPeriod === 'Current Year' ? 'Previous Year' : selectedPeriod
    
    let prevStart: Date, prevEnd: Date
    const now = new Date()
    if (prevPeriod === 'Previous Month') {
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    } else if (prevPeriod === 'Previous Quarter') {
      const prevQ = Math.floor(now.getMonth() / 3) - 1
      const prevQYear = prevQ < 0 ? now.getFullYear() - 1 : now.getFullYear()
      const actualPrevQ = prevQ < 0 ? 3 : prevQ
      prevStart = new Date(prevQYear, actualPrevQ * 3, 1)
      prevEnd = new Date(prevQYear, (actualPrevQ + 1) * 3, 0, 23, 59, 59)
    } else {
      prevStart = new Date(now.getFullYear() - 1, 0, 1)
      prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59)
    }
    
    const prevPeriodInvoices = invoices.filter((inv: any) => {
      try {
        const invDate = new Date(inv.date || inv.issueDate || '')
        return invDate >= prevStart && invDate <= prevEnd
      } catch {
        return false
      }
    })
    
    let prevTotalRevenueIncVAT = 0
    prevPeriodInvoices.forEach((inv: any) => {
      const total = inv.total || parseFloat(String(inv.amount || 0).replace(/[£$€,\s]/g, '')) || 0
      prevTotalRevenueIncVAT += total
    })
    
    const hasPreviousData = prevTotalRevenueIncVAT > 0
    
    return {
      totalRevenueIncVAT,
      totalRevenueExVAT,
      totalVAT,
      hasPreviousData,
      prevTotalRevenueIncVAT,
    }
  }, [invoices, selectedPeriod])

  const periodOptions = [
    'Current Month',
    'Previous Month',
    'Current Quarter',
    'Previous Quarter',
    'Current Year',
    'Previous Year',
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target as Node)) {
        setShowPeriodDropdown(false)
      }
      if (accountSummaryDropdownRef.current && !accountSummaryDropdownRef.current.contains(event.target as Node)) {
        setShowAccountSummaryDropdown(false)
      }
      if (bestSellingDropdownRef.current && !bestSellingDropdownRef.current.contains(event.target as Node)) {
        setShowBestSellingDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Overview</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="relative" ref={periodDropdownRef}>
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-primary-600 font-medium text-sm w-full sm:w-auto justify-center sm:justify-start"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">{selectedPeriod}</span>
                <span className="sm:hidden">Period</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showPeriodDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                  <div className="absolute -top-2 left-6 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-white"></div>
                  {periodOptions.map((option, index) => (
                    <div key={option}>
                      <button
                        onClick={() => {
                          setSelectedPeriod(option)
                          setShowPeriodDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          option === selectedPeriod
                            ? 'bg-blue-50 text-primary-600 font-medium'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {option}
                      </button>
                      {index < periodOptions.length - 1 && (
                        <div className="border-t border-slate-200"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link
              to="/invoices/add"
              className="btn-gradient-orange flex items-center gap-2 text-sm justify-center sm:justify-start"
            >
              <i className="material-icons add-invoice-icon">add</i>
              <span className="hidden sm:inline">Add Invoice</span>
              <span className="sm:hidden">Invoice</span>
            </Link>
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base text-slate-600 font-medium">Total revenue</span>
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
              <span className="text-xs text-slate-500">Inc VAT</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{currencySymbol}{metrics.totalRevenueIncVAT.toFixed(2)}</div>
            <div className="text-xs sm:text-sm text-slate-500">
              {metrics.hasPreviousData 
                ? `${currencySymbol}${metrics.prevTotalRevenueIncVAT.toFixed(2)} in previous period`
                : 'No data for previous period'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base text-slate-600 font-medium">Total revenue</span>
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
              <span className="text-xs text-slate-500">Ex VAT</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{currencySymbol}{metrics.totalRevenueExVAT.toFixed(2)}</div>
            <div className="text-xs sm:text-sm text-slate-500">
              {metrics.hasPreviousData 
                ? `${currencySymbol}${(metrics.prevTotalRevenueIncVAT - (metrics.prevTotalRevenueIncVAT * 0.2)).toFixed(2)} in previous period`
                : 'No data for previous period'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-slate-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm sm:text-base text-slate-600 font-medium">VAT to pay</span>
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-800">{currencySymbol}{metrics.totalVAT.toFixed(2)}</div>
          </div>
        </div>

        {/* Estimates and Recurring Invoices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Estimates Expiring Soon */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-800">Estimates expiring soon</h3>
                <Info className="w-4 h-4 text-slate-400" />
              </div>
              <Link
                to="/estimates"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                See all
              </Link>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full min-w-[300px]">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
                    <th className="pb-3">CUSTOMER</th>
                    <th className="pb-3">EXPIRY DATE</th>
                    <th className="pb-3">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const now = new Date()
                    const expiringSoon = estimates.filter((est: any) => {
                      try {
                        const expiryDate = est.expiryDate ? new Date(est.expiryDate) : null
                        if (!expiryDate) return false
                        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                        return daysUntilExpiry >= 0 && daysUntilExpiry <= 30
                      } catch {
                        return false
                      }
                    }).slice(0, 5)
                    
                    if (expiringSoon.length === 0) {
                      return (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-slate-500">
                            No estimates yet...
                          </td>
                        </tr>
                      )
                    }
                    
                    return expiringSoon.map((est: any) => {
                      const amount = parseFloat(String(est.total || est.amount || 0).replace(/[£$€,\s]/g, '')) || 0
                      return (
                        <tr key={est.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 text-slate-700 text-sm">{est.customer}</td>
                          <td className="py-3 text-slate-600 text-sm">{est.expiryDate ? new Date(est.expiryDate).toLocaleDateString('en-GB') : ''}</td>
                          <td className="py-3 font-semibold text-slate-800 text-sm">{currencySymbol}{amount.toFixed(2)}</td>
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recurring Invoices */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-800">Recurring invoices</h3>
                <Info className="w-4 h-4 text-slate-400" />
              </div>
              <Link
                to="/invoices"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                See all
              </Link>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full min-w-[300px]">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
                    <th className="pb-3">CUSTOMER</th>
                    <th className="pb-3">NEXT DATE</th>
                    <th className="pb-3">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const recurring = invoices.filter((inv: any) => inv.isRecurring).slice(0, 5)
                    
                    if (recurring.length === 0) {
                      return (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-slate-500">
                            No recurring invoices yet...
                          </td>
                        </tr>
                      )
                    }
                    
                    return recurring.map((inv: any) => {
                      const amount = parseFloat(String(inv.amount || inv.total || 0).replace(/[£$€,\s]/g, '')) || 0
                      const nextDate = inv.nextDate ? new Date(inv.nextDate) : null
                      return (
                        <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 text-slate-700 text-sm">{inv.customer}</td>
                          <td className="py-3 text-slate-600 text-sm">{nextDate ? nextDate.toLocaleDateString('en-GB') : 'N/A'}</td>
                          <td className="py-3 font-semibold text-slate-800 text-sm">{currencySymbol}{amount.toFixed(2)}</td>
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Who Owe's Me? */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-800">Who owes me?</h3>
                <Info className="w-4 h-4 text-slate-400" />
              </div>
              <Link
                to="/invoices"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                See all
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="px-2 sm:px-3 py-1 bg-primary-100 text-primary-700 rounded font-medium">
                ISSUED THIS MONTH
              </div>
              <div className="px-2 sm:px-3 py-1 bg-accent-100 text-accent-700 rounded font-medium">
                DUE THIS MONTH
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-600 uppercase border-b border-slate-200 bg-slate-50">
                  <th className="px-2 sm:px-4 py-3">INVOICE</th>
                  <th className="px-2 sm:px-4 py-3">CUSTOMER</th>
                  <th className="px-2 sm:px-4 py-3 hidden sm:table-cell">ISSUE DATE</th>
                  <th className="px-2 sm:px-4 py-3 hidden md:table-cell">DUE DATE</th>
                  <th className="px-2 sm:px-4 py-3">DUE</th>
                  <th className="px-2 sm:px-4 py-3">AMOUNT</th>
                  <th className="px-2 sm:px-4 py-3 hidden lg:table-cell">BALANCE</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const now = new Date()
                  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
                  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
                  
                  // Get overdue and due invoices
                  const overdueInvoices = invoices.filter((inv: any) => {
                    if (inv.status === 'Paid') return false
                    try {
                      const dueDate = inv.dueDate ? new Date(inv.dueDate) : null
                      if (!dueDate) {
                        // Calculate from date + timeToPay
                        const invDate = new Date(inv.date || inv.issueDate || '')
                        const days = parseInt(inv.timeToPay || '14')
                        dueDate.setDate(invDate.getDate() + days)
                      }
                      return dueDate < now
                    } catch {
                      return false
                    }
                  })
                  
                  const dueThisMonth = invoices.filter((inv: any) => {
                    if (inv.status === 'Paid') return false
                    try {
                      const dueDate = inv.dueDate ? new Date(inv.dueDate) : null
                      if (!dueDate) {
                        const invDate = new Date(inv.date || inv.issueDate || '')
                        const days = parseInt(inv.timeToPay || '14')
                        dueDate.setDate(invDate.getDate() + days)
                      }
                      return dueDate >= currentMonthStart && dueDate <= currentMonthEnd
                    } catch {
                      return false
                    }
                  })
                  
                  const displayInvoices = [...overdueInvoices, ...dueThisMonth].slice(0, 10)
                  
                  if (displayInvoices.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="px-2 sm:px-4 py-8 text-center text-slate-500">
                          There are no overdue invoices yet...
                        </td>
                      </tr>
                    )
                  }
                  
                  return displayInvoices.map((inv: any) => {
                    const amount = parseFloat(String(inv.amount || inv.total || 0).replace(/[£$€,\s]/g, '')) || 0
                    const balance = parseFloat(String(inv.balance || inv.amount || 0).replace(/[£$€,\s]/g, '')) || 0
                    const dueDate = inv.dueDate ? new Date(inv.dueDate) : null
                    let dueText = 'Overdue'
                    if (dueDate) {
                      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                      dueText = daysUntilDue > 0 ? `${daysUntilDue} Days` : 'Overdue'
                    }
                    
                    return (
                      <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-2 sm:px-4 py-3">
                          <Link to={`/invoices/${inv.id}`} className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                            {inv.invoiceNumber || inv.id}
                          </Link>
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-slate-700 text-sm">{inv.customer}</td>
                        <td className="px-2 sm:px-4 py-3 text-slate-600 text-sm hidden sm:table-cell">{inv.issueDate || inv.date || ''}</td>
                        <td className="px-2 sm:px-4 py-3 text-slate-600 text-sm hidden md:table-cell">{dueDate ? dueDate.toLocaleDateString('en-GB') : ''}</td>
                        <td className="px-2 sm:px-4 py-3 text-slate-600 text-sm">{dueText}</td>
                        <td className="px-2 sm:px-4 py-3 font-semibold text-slate-800 text-sm">{currencySymbol}{amount.toFixed(2)}</td>
                        <td className="px-2 sm:px-4 py-3 font-semibold text-slate-800 text-sm hidden lg:table-cell">{currencySymbol}{balance.toFixed(2)}</td>
                      </tr>
                    )
                  })
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Account Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Account summary</h3>
            <div className="relative" ref={accountSummaryDropdownRef}>
              <button
                onClick={() => setShowAccountSummaryDropdown(!showAccountSummaryDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-primary-600 font-medium text-sm"
              >
                <Calendar className="w-4 h-4" />
                {selectedPeriod}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showAccountSummaryDropdown && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                  <div className="absolute -top-2 right-6 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-white"></div>
                  {periodOptions.map((option, index) => (
                    <div key={option}>
                      <button
                        onClick={() => {
                          setSelectedPeriod(option)
                          setShowAccountSummaryDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          option === selectedPeriod
                            ? 'bg-blue-50 text-primary-600 font-medium'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {option}
                      </button>
                      {index < periodOptions.length - 1 && (
                        <div className="border-t border-slate-200"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded flex-shrink-0"></div>
              <span className="text-slate-600">Current year sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded flex-shrink-0"></div>
              <span className="text-slate-600">Previous year sales</span>
            </div>
            <span className="text-slate-500">Daily chart</span>
          </div>
          <div className="h-48 sm:h-64 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 overflow-x-auto">
            <div className="text-center text-slate-500">
              <div className="text-sm mb-2">Chart visualization</div>
              <div className="text-xs">Sales data over time</div>
            </div>
          </div>
        </div>

        {/* Best Selling Services or Products */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Best selling services or products</h3>
            <div className="relative" ref={bestSellingDropdownRef}>
              <button
                onClick={() => setShowBestSellingDropdown(!showBestSellingDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-primary-600 font-medium text-sm"
              >
                <Calendar className="w-4 h-4" />
                {selectedPeriod}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showBestSellingDropdown && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                  <div className="absolute -top-2 right-6 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-white"></div>
                  {periodOptions.map((option, index) => (
                    <div key={option}>
                      <button
                        onClick={() => {
                          setSelectedPeriod(option)
                          setShowBestSellingDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          option === selectedPeriod
                            ? 'bg-blue-50 text-primary-600 font-medium'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {option}
                      </button>
                      {index < periodOptions.length - 1 && (
                        <div className="border-t border-slate-200"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
                  <th className="pb-3">NAME</th>
                  <th className="pb-3">QUANTITY SOLD</th>
                  <th className="pb-3 hidden md:table-cell">AVERAGE SALE VALUE</th>
                  <th className="pb-3">SALES</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    There are no data matching entered selection criteria...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
