import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBusiness } from '../contexts/BusinessContext'
import { ChevronDown, Plus, Edit2, FileText } from 'lucide-react'

interface BusinessSelectorProps {
  /** Show business name in trigger (e.g. in mobile menu) */
  showName?: boolean
}

export default function BusinessSelector({ showName = false }: BusinessSelectorProps) {
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
        className={`flex items-center rounded-lg hover:bg-slate-100 transition-colors duration-150 ${showName ? 'gap-2 px-2.5 py-2 min-h-[36px]' : 'gap-1.5 p-1.5'}`}
        title={currentBusiness?.name || 'Switch business'}
        aria-label={currentBusiness?.name ? `Business: ${currentBusiness.name}` : 'Select business'}
      >
        <div className={`rounded-md flex-shrink-0 ${showName ? 'w-8 h-8' : 'w-7 h-7'} ${currentBusiness ? getBusinessColor(currentBusiness.name) : 'bg-primary-500'} flex items-center justify-center`}>
          {currentBusiness?.logo ? (
            <img src={currentBusiness.logo} alt="" className="w-full h-full object-cover rounded-md" />
          ) : (
            <span className={`text-white font-bold leading-none ${showName ? 'text-xs' : 'text-[10px]'}`}>
              {currentBusiness ? getBusinessInitials(currentBusiness.name) : <FileText className={showName ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
            </span>
          )}
        </div>
        {showName && (
          <span className="text-slate-700 font-medium text-sm max-w-[140px] truncate">
            {currentBusiness?.name || 'No Business'}
          </span>
        )}
        <ChevronDown className={`text-slate-500 flex-shrink-0 ${showName ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />
      </button>

      {showDropdown && (
        <div
          className="absolute top-full right-0 mt-1.5 min-w-[12rem] max-w-[min(18rem,calc(100vw-1.5rem))] bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 overflow-hidden"
          role="menu"
          aria-orientation="vertical"
        >
          {businesses.length > 0 && (
            <div className="max-h-52 overflow-y-auto">
              {businesses.map((business) => (
                <div
                  key={business.id}
                  role="menuitem"
                  className={`flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    currentBusiness?.id === business.id
                      ? 'bg-primary-50 text-primary-800'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => handleBusinessSelect(business)}
                >
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 ${getBusinessColor(business?.name || 'Business')} flex items-center justify-center`}>
                    {business?.logo ? (
                      <img src={business.logo} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-white text-xs font-bold leading-none">
                        {getBusinessInitials(business?.name || 'Business')}
                      </span>
                    )}
                  </div>
                  <span className="flex-1 min-w-0 truncate text-sm font-medium">
                    {business?.name || 'Business'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); navigate(`/business/edit/${business.id}`) }}
                    className="p-1.5 rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex-shrink-0 transition-colors"
                    title="Edit business"
                    aria-label={`Edit ${business?.name || 'business'}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="border-t border-slate-100 mt-1 pt-1.5 px-1.5 pb-1">
            <button
              type="button"
              onClick={handleAddNew}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors mx-1.5"
            >
              <Plus className="w-4 h-4 shrink-0" />
              Add business
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
