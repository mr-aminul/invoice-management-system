import { ReactNode, useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import UserProfileModal from './UserProfileModal'
import BusinessSelector from './BusinessSelector'
import { HelpCircle, ChevronDown, User, Menu, X } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const createMenuRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => {
    if (path === '/dashboard' || path === '/') {
      return location.pathname === '/dashboard' || location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false)
      }
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      {/* Header */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">Ei</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-slate-800">EasyInvoice</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 xl:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  isActive('/dashboard')
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Home
              </Link>
              <Link
                to="/customers"
                className={`px-3 xl:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  isActive('/customers')
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Customers
              </Link>
              <Link
                to="/invoices"
                className={`px-3 xl:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  isActive('/invoices')
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Invoices
              </Link>
              <Link
                to="/estimates"
                className={`px-3 xl:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  isActive('/estimates')
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Estimates
              </Link>
              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className={`px-3 xl:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 text-sm ${
                    showMoreMenu || location.pathname.startsWith('/products') || 
                    location.pathname.startsWith('/services') || location.pathname.startsWith('/credit-notes') ||
                    location.pathname.startsWith('/refunds') || location.pathname.startsWith('/reports') ||
                    location.pathname.startsWith('/statements')
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  More
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showMoreMenu && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    <Link
                      to="/products"
                      onClick={() => setShowMoreMenu(false)}
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Products
                    </Link>
                    <Link
                      to="/services"
                      onClick={() => setShowMoreMenu(false)}
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Services
                    </Link>
                    <Link
                      to="/credit-notes"
                      onClick={() => setShowMoreMenu(false)}
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Credit notes
                    </Link>
                    <Link
                      to="/refunds"
                      onClick={() => setShowMoreMenu(false)}
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Refunds
                    </Link>
                    <Link
                      to="/reports"
                      onClick={() => setShowMoreMenu(false)}
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Reports
                    </Link>
                    <Link
                      to="/statements"
                      onClick={() => setShowMoreMenu(false)}
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Statements
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Create Button with Dropdown */}
              <div className="relative" ref={createMenuRef}>
                <button
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="btn-create"
                >
                  <i className="material-icons">note_add</i>
                  <span className="hidden xl:inline">Create</span>
                  <ChevronDown className="w-4 h-4" style={{ marginLeft: '4px' }} />
                </button>
                {showCreateMenu && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-bold text-primary-600">What do you want to create?</h3>
                    </div>
                    <button
                      onClick={() => {
                        setShowCreateMenu(false)
                        navigate('/customers?action=add')
                      }}
                      className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-100"
                    >
                      <i className="material-icons text-primary-500" style={{ fontSize: '24px' }}>person_add</i>
                      <span className="text-sm font-medium">Customer</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateMenu(false)
                        navigate('/invoices/add')
                      }}
                      className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-100"
                    >
                      <i className="material-icons text-primary-500" style={{ fontSize: '24px' }}>description</i>
                      <span className="text-sm font-medium">Invoice</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateMenu(false)
                        navigate('/estimates?action=add')
                      }}
                      className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-100"
                    >
                      <i className="material-icons text-primary-500" style={{ fontSize: '24px' }}>assessment</i>
                      <span className="text-sm font-medium">Estimate</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateMenu(false)
                        navigate('/refunds?action=add')
                      }}
                      className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-100"
                    >
                      <i className="material-icons text-primary-500" style={{ fontSize: '24px' }}>assignment_return</i>
                      <span className="text-sm font-medium">Refund</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateMenu(false)
                        navigate('/credit-notes?action=add')
                      }}
                      className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-100"
                    >
                      <i className="material-icons text-primary-500" style={{ fontSize: '24px' }}>receipt</i>
                      <span className="text-sm font-medium">Credit note</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateMenu(false)
                        navigate('/services?action=add')
                      }}
                      className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-100"
                    >
                      <i className="material-icons text-primary-500" style={{ fontSize: '24px' }}>checklist</i>
                      <span className="text-sm font-medium">Service</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateMenu(false)
                        navigate('/products?action=add')
                      }}
                      className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3"
                    >
                      <i className="material-icons text-primary-500" style={{ fontSize: '24px' }}>inventory_2</i>
                      <span className="text-sm font-medium">Product</span>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Business Selector */}
              <div className="hidden lg:block">
                <BusinessSelector />
              </div>
              
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-slate-700 font-medium hidden md:block text-sm">{user?.name || 'User'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-600 hidden sm:block" />
                </button>
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setShowProfileModal(true)
                        setShowUserMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6 text-slate-700" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div ref={mobileMenuRef} className="lg:hidden border-t border-slate-200 bg-white">
            {/* Mobile Business Selector */}
            <div className="px-4 py-3 border-b border-slate-200">
              <BusinessSelector />
            </div>
            <nav className="px-4 py-4 space-y-1">
              <Link
                to="/dashboard"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/customers"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/customers')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Customers
              </Link>
              <Link
                to="/invoices"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/invoices')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Invoices
              </Link>
              <Link
                to="/estimates"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/estimates')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Estimates
              </Link>
              <Link
                to="/products"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/products')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Products
              </Link>
              <Link
                to="/services"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/services')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Services
              </Link>
              <Link
                to="/credit-notes"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/credit-notes')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Credit notes
              </Link>
              <Link
                to="/refunds"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/refunds')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Refunds
              </Link>
              <Link
                to="/reports"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/reports')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Reports
              </Link>
              <Link
                to="/statements"
                onClick={() => setShowMobileMenu(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/statements')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Statements
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0 print:max-w-full">
        {children}
      </main>

      {/* Help Button - Fixed Right */}
      <div className="no-print fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:block">
        <button
          onClick={() => {
            window.open('https://help.easyinvoiceapp.com', '_blank')
          }}
          className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-4 sm:px-4 sm:py-6 rounded-l-lg shadow-lg transition-colors flex flex-col items-center gap-1"
          title="Get help"
        >
          <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs font-medium hidden sm:block">Need help</span>
        </button>
      </div>
    </div>
  )
}
