import { useState } from 'react'
import Layout from '../components/Layout'
import { Calendar, Download, FileText, TrendingUp, DollarSign, Users } from 'lucide-react'

export default function Reports() {
  const [reportType, setReportType] = useState('sales')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleGenerateReport = () => {
    alert(`Generating ${reportType} report from ${startDate || 'beginning'} to ${endDate || 'today'}...`)
  }

  const handleExportReport = () => {
    alert(`Exporting ${reportType} report...`)
  }

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', icon: DollarSign },
    { id: 'revenue', name: 'Revenue Report', icon: TrendingUp },
    { id: 'customers', name: 'Customer Report', icon: Users },
    { id: 'products', name: 'Products Report', icon: FileText },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-slate-800">Reports</h2>
        </div>

        {/* Report Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Select Report Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`p-4 border-2 rounded-lg transition-colors text-left ${
                    reportType === type.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-primary-300'
                  }`}
                >
                  <Icon className="w-6 h-6 text-primary-600 mb-2" />
                  <div className="font-medium text-slate-800">{type.name}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Date Range */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Date Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button
              onClick={handleGenerateReport}
              className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              <FileText className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Report Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Report Preview</h3>
          <div className="p-12 text-center text-slate-500">
            Select a report type and date range, then click "Generate Report" to view the results.
          </div>
        </div>
      </div>
    </Layout>
  )
}
