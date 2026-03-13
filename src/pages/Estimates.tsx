import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Search, ChevronDown, Edit, Trash2, Eye } from 'lucide-react'
import { useBusinessData } from '../hooks/useBusinessData'

interface Estimate {
  id: string
  number: string
  customer: string
  date: string
  expiryDate: string
  amount: string
  status: string
  items?: any[]
  businessId?: string
}

export default function Estimates() {
  const navigate = useNavigate()
  const [_searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [modeFilter, setModeFilter] = useState('Active')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedEstimates, setSelectedEstimates] = useState<string[]>([])
  
  const {
    data: estimates,
    deleteItem: deleteEstimate,
  } = useBusinessData<Estimate>('estimates', [])

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this estimate?')) {
      deleteEstimate(id)
    }
  }

  const toggleEstimateSelection = (id: string) => {
    setSelectedEstimates((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    )
  }

  const filteredEstimates = (estimates || []).filter((estimate) => {
    if (!estimate) return false
    const matchesSearch =
      (estimate.number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (estimate.customer || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = !dateFilter || estimate.date === dateFilter
    return matchesSearch && matchesDate
  })

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Estimates</h2>
          <button
            onClick={() => navigate('/estimates/add')}
            className="btn-gradient-orange flex items-center gap-2 text-sm w-full sm:w-auto justify-center sm:justify-start"
          >
            <i className="material-icons add-invoice-icon">add</i>
            <span className="hidden sm:inline">Add Estimate</span>
            <span className="sm:hidden">Estimate</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-wrap gap-4 flex-1">
              {/* Mode Filter */}
              <div className="relative">
                <label className="block text-xs font-medium text-slate-600 mb-1">Mode</label>
                <div className="relative">
                  <select
                    value={modeFilter}
                    onChange={(e) => setModeFilter(e.target.value)}
                    className="appearance-none px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 pr-8 min-w-[120px]"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Search and Reset */}
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setModeFilter('Active')
                  setDateFilter('')
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Estimates Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredEstimates.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500">
              You have no estimates for applied filters …
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-600 uppercase border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 w-12">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={selectedEstimates.length === filteredEstimates.length && filteredEstimates.length > 0}
                        onChange={() => {
                          if (selectedEstimates.length === filteredEstimates.length) {
                            setSelectedEstimates([])
                          } else {
                            setSelectedEstimates(filteredEstimates.map((e) => e.id))
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-3">ESTIMATE</th>
                    <th className="px-4 py-3">CUSTOMER</th>
                    <th className="px-4 py-3">DATE</th>
                    <th className="px-4 py-3">EXPIRY DATE</th>
                    <th className="px-4 py-3">AMOUNT</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3">ACTIONS</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEstimates.map((estimate) => {
                    if (!estimate) return null
                    return (
                      <tr key={estimate.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300"
                          checked={selectedEstimates.includes(estimate.id)}
                          onChange={() => toggleEstimateSelection(estimate.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/estimates/${estimate.id}`)}
                          className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                        >
                          {estimate.number}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-sm">{estimate.customer}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{estimate.date}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{estimate.expiryDate}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 text-sm">{estimate.amount}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                          {estimate.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/estimates/${estimate.id}`)}
                            className="p-1 text-slate-600 hover:text-primary-600 transition-colors"
                            title="View estimate"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/estimates/add?edit=${estimate.id}`)}
                            className="p-1 text-slate-600 hover:text-primary-600 transition-colors"
                            title="Edit estimate"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(estimate.id)}
                            className="p-1 text-slate-600 hover:text-red-600 transition-colors"
                            title="Delete estimate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3"></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
