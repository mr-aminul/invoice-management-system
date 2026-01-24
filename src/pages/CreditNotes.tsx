import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import AddCreditNoteModal from '../components/AddCreditNoteModal'
import { Plus, Search, ChevronDown, Calendar, Edit, Trash2, Eye, FileText } from 'lucide-react'
import { useBusinessData } from '../hooks/useBusinessData'

interface CreditNote {
  id: string
  number: string
  customer: string
  invoiceNumber: string
  date: string
  amount: string
  status: string
  businessId?: string
}

export default function CreditNotes() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [modeFilter, setModeFilter] = useState('Active')
  const [dateFilter, setDateFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCreditNote, setEditingCreditNote] = useState<CreditNote | null>(null)
  const [selectedCreditNotes, setSelectedCreditNotes] = useState<string[]>([])
  
  const {
    data: creditNotes,
    addItem: addCreditNote,
    updateItem: updateCreditNote,
    deleteItem: deleteCreditNote,
  } = useBusinessData<CreditNote>('creditNotes', [])
  
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleAddCreditNote = (creditNoteData: any) => {
    if (editingCreditNote) {
      updateCreditNote(editingCreditNote.id, {
        ...creditNoteData,
        number: editingCreditNote.number,
      })
      setEditingCreditNote(null)
    } else {
      addCreditNote({
        number: `CN${String((creditNotes || []).length + 1).padStart(5, '0')}`,
        customer: creditNoteData.customer,
        invoiceNumber: creditNoteData.invoiceNumber,
        date: creditNoteData.date,
        amount: `£${creditNoteData.total.toFixed(2)}`,
        status: 'Active',
      } as Omit<CreditNote, 'id'>)
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this credit note?')) {
      deleteCreditNote(id)
    }
  }

  const toggleCreditNoteSelection = (id: string) => {
    setSelectedCreditNotes((prev) =>
      prev.includes(id) ? prev.filter((cn) => cn !== id) : [...prev, id]
    )
  }

  const filteredCreditNotes = (creditNotes || []).filter((creditNote) => {
    if (!creditNote) return false
    const matchesSearch =
      (creditNote.number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (creditNote.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (creditNote.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = !dateFilter || creditNote.date === dateFilter
    return matchesSearch && matchesDate
  })

  return (
    <Layout>
      <AddCreditNoteModal
        isOpen={showAddModal || !!editingCreditNote}
        onClose={() => {
          setShowAddModal(false)
          setEditingCreditNote(null)
        }}
        onSave={handleAddCreditNote}
        creditNote={editingCreditNote || undefined}
      />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-slate-800">Credit Notes</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-gradient-orange flex items-center gap-2"
          >
            <i className="material-icons add-invoice-icon">add</i>
            Add Credit Note
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-wrap gap-4 flex-1">
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
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
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

        {/* Credit Notes Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          {filteredCreditNotes.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No credit notes yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-600 uppercase border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 w-12">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={selectedCreditNotes.length === filteredCreditNotes.length && filteredCreditNotes.length > 0}
                        onChange={() => {
                          if (selectedCreditNotes.length === filteredCreditNotes.length) {
                            setSelectedCreditNotes([])
                          } else {
                            setSelectedCreditNotes(filteredCreditNotes.map((cn) => cn.id))
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-3">CREDIT NOTE</th>
                    <th className="px-4 py-3">CUSTOMER</th>
                    <th className="px-4 py-3">INVOICE</th>
                    <th className="px-4 py-3">DATE</th>
                    <th className="px-4 py-3">AMOUNT</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3">ACTIONS</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCreditNotes.map((creditNote) => {
                    if (!creditNote) return null
                    return (
                      <tr key={creditNote.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300"
                          checked={selectedCreditNotes.includes(creditNote.id)}
                          onChange={() => toggleCreditNoteSelection(creditNote.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {creditNote.number}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{creditNote.customer}</td>
                      <td className="px-4 py-3 text-slate-600">{creditNote.invoiceNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{creditNote.date}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{creditNote.amount}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          {creditNote.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => alert(`Viewing credit note: ${creditNote.number}`)}
                            className="p-1 text-slate-600 hover:text-primary-600 transition-colors"
                            title="View credit note"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingCreditNote(creditNote)}
                            className="p-1 text-slate-600 hover:text-primary-600 transition-colors"
                            title="Edit credit note"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(creditNote.id)}
                            className="p-1 text-slate-600 hover:text-red-600 transition-colors"
                            title="Delete credit note"
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
