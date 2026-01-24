import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBusiness } from '../contexts/BusinessContext'
import { ChevronDown, Plus, Edit2, FileText } from 'lucide-react'

export default function BusinessSelector() {
  const navigate = useNavigate()
  const { businesses, currentBusiness, setCurrentBusiness } = useBusiness()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleBusinessSelect = (business: typeof currentBusiness) => {
    if (business) {
      setCurrentBusiness(business)
    }
    setShowDropdown(false)
  }

  const handleAddNew = () => {
    setShowDropdown(false)
    navigate('/business/add')
  }

  const getBusinessInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getBusinessColor = (name: string) => {
    // Generate a consistent color based on business name
    const colors = [
      'bg-green-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <div className={`w-8 h-8 rounded-lg ${currentBusiness ? getBusinessColor(currentBusiness.name) : 'bg-primary-500'} flex items-center justify-center`}>
          {currentBusiness?.logo ? (
            <img 
              src={currentBusiness.logo} 
              alt={currentBusiness?.name || 'Business'}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-white text-xs font-bold">
              {currentBusiness ? getBusinessInitials(currentBusiness.name) : <FileText className="w-4 h-4" />}
            </span>
          )}
        </div>
        <span className="text-slate-700 font-medium text-sm max-w-[150px] truncate">
          {currentBusiness?.name || 'No Business'}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-600" />
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
          {businesses.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              {businesses.map((business) => (
                <div
                  key={business.id}
                  className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between ${
                    currentBusiness?.id === business.id ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => handleBusinessSelect(business)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg ${getBusinessColor(business?.name || 'Business')} flex items-center justify-center flex-shrink-0`}>
                      {business?.logo ? (
                        <img 
                          src={business.logo} 
                          alt={business?.name || 'Business'}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-white text-xs font-bold">
                          {getBusinessInitials(business?.name || 'Business')}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-700 font-medium text-sm truncate flex-1">
                      {business?.name || 'Business'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Navigate to edit business (you can implement this later)
                      navigate(`/business/edit/${business.id}`)
                    }}
                    className="p-1 hover:bg-slate-200 rounded transition-colors flex-shrink-0"
                    title="Edit business"
                  >
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="border-t border-slate-200 mt-2 pt-2">
            <button
              onClick={handleAddNew}
              className="w-full mx-2 px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Add new business</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
