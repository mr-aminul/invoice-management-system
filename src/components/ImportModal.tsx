import { useState, useEffect } from 'react'
import { X, Upload, Download, FileText } from 'lucide-react'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: any[]) => void
  type: 'customers' | 'products' | 'services'
}

export default function ImportModal({ isOpen, onClose, onImport, type }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        const lines = text.split('\n').filter((line) => line.trim())
        const headers = lines[0].split(',').map((h) => h.trim())
        const data = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim())
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header.toLowerCase().replace(/\s+/g, '_')] = values[index] || ''
          })
          return obj
        })
        setPreview(data.slice(0, 5)) // Show first 5 rows
      }
      reader.readAsText(selectedFile)
    }
  }

  const handleImport = () => {
    if (!file) {
      alert('Please select a file')
      return
    }
    setIsProcessing(true)
    setTimeout(() => {
      onImport(preview)
      setIsProcessing(false)
      onClose()
      setFile(null)
      setPreview([])
      alert(`Successfully imported ${preview.length} ${type}!`)
    }, 1000)
  }

  const downloadTemplate = () => {
    let template = ''
    if (type === 'customers') {
      template = 'Name,Email,Phone,Address,City,Postcode,Country\nJohn Doe,john@example.com,1234567890,123 Street,City,12345,Country'
    } else if (type === 'products') {
      template = 'Name,Description,Price,VAT,SKU\nProduct 1,Description,10.00,20,SKU001'
    } else {
      template = 'Name,Description,Price,VAT\nService 1,Description,50.00,20'
    }
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}_template.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: 'default' }}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Import {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Import Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Download the template CSV file</li>
              <li>Fill in your data following the template format</li>
              <li>Upload the CSV file below</li>
              <li>Review the preview before importing</li>
            </ul>
          </div>

          {/* Download Template */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-medium text-slate-800">Download Template</p>
                <p className="text-sm text-slate-600">Get the CSV template file</p>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select CSV File <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <label className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                Choose File
              </label>
              {file && (
                <p className="mt-4 text-sm text-slate-600">{file.name}</p>
              )}
              <p className="mt-2 text-xs text-slate-500">CSV files only</p>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Preview (First 5 rows)</h3>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {Object.keys(preview[0] || {}).map((key) => (
                        <th key={key} className="px-4 py-2 text-left font-semibold text-slate-700">
                          {key.replace(/_/g, ' ').toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        {Object.values(row).map((value: any, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 text-slate-600">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Total rows to import: {preview.length}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || isProcessing}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
