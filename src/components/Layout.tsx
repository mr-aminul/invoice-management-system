import { ReactNode, useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import UserProfileModal from './UserProfileModal'
import BusinessSelector from './BusinessSelector'
import { HelpCircle, ChevronDown, User, Menu, X, LogOut, Plus, Receipt } from 'lucide-react'

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
      {/* Navbar - clean UI */}
      <header className="nav-bar no-print w-full bg-white border-b border-slate-200/80 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="nav-bar-inner flex flex-nowrap items-center h-14 w-full px-4 sm:px-6 lg:px-8 gap-4">
          {/* Left: Logo - always visible, never shrinks */}
          <div className="flex items-center gap-2.5 flex-shrink-0 min-w-0">
            <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <Receipt className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-[1.0625rem] font-semibold text-slate-900 tracking-tight truncate">EasyInvoice</span>
          </div>

          {/* Center: Desktop nav - takes remaining space, shrinks when zoomed so right block stays visible */}
          <nav className="hidden lg:flex items-center justify-center flex-1 min-w-0 gap-0.5 bg-slate-100/80 rounded-full px-1 py-1 w-fit max-w-full mx-auto overflow-visible" aria-label="Main">
            <Link
              to="/dashboard"
              className={`nav-link px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 ${
                isActive('/dashboard')
                  ? 'text-primary-700 bg-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </Link>
            <Link
              to="/customers"
              className={`nav-link px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 ${
                isActive('/customers')
                  ? 'text-primary-700 bg-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customers
            </Link>
            <Link
              to="/invoices"
              className={`nav-link px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 ${
                isActive('/invoices')
                  ? 'text-primary-700 bg-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Invoices
            </Link>
            <Link
              to="/estimates"
              className={`nav-link px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 ${
                isActive('/estimates')
                  ? 'text-primary-700 bg-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Estimates
            </Link>
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`nav-link px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 flex items-center gap-1.5 ${
                  showMoreMenu || location.pathname.startsWith('/products') ||
                  location.pathname.startsWith('/services') || location.pathname.startsWith('/credit-notes') ||
                  location.pathname.startsWith('/refunds') || location.pathname.startsWith('/reports') ||
                  location.pathname.startsWith('/statements')
                    ? 'text-primary-700 bg-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-expanded={showMoreMenu}
                aria-haspopup="true"
              >
                More
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMoreMenu ? 'rotate-180' : ''}`} />
              </button>
              {showMoreMenu && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 min-w-[12rem]">
                  <Link to="/products" onClick={() => setShowMoreMenu(false)} className="nav-dropdown-item">
                    Products
                  </Link>
                  <Link to="/services" onClick={() => setShowMoreMenu(false)} className="nav-dropdown-item">
                    Services
                  </Link>
                  <Link to="/credit-notes" onClick={() => setShowMoreMenu(false)} className="nav-dropdown-item">
                    Credit notes
                  </Link>
                  <Link to="/refunds" onClick={() => setShowMoreMenu(false)} className="nav-dropdown-item">
                    Refunds
                  </Link>
                  <Link to="/reports" onClick={() => setShowMoreMenu(false)} className="nav-dropdown-item">
                    Reports
                  </Link>
                  <Link to="/statements" onClick={() => setShowMoreMenu(false)} className="nav-dropdown-item">
                    Statements
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Right: Create, business, profile - always on the right, never shrinks */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="relative" ref={createMenuRef}>
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="nav-create-btn inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 active:bg-primary-700 transition-colors duration-150 shadow-sm"
                aria-expanded={showCreateMenu}
                aria-haspopup="true"
              >
                <Plus className="w-4 h-4 shrink-0" strokeWidth={2.25} />
                <span className="hidden xl:inline">Create</span>
                <ChevronDown className={`w-4 h-4 shrink-0 opacity-90 transition-transform duration-200 ${showCreateMenu ? 'rotate-180' : ''}`} />
              </button>
              {showCreateMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200/90 py-2 z-50">
                  <p className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-slate-400">New</p>
                  <button onClick={() => { setShowCreateMenu(false); navigate('/customers?action=add') }} className="nav-dropdown-item justify-start gap-3">
                    <i className="material-icons text-primary-500 text-xl">person_add</i>
                    <span>Customer</span>
                  </button>
                  <button onClick={() => { setShowCreateMenu(false); navigate('/invoices/add') }} className="nav-dropdown-item justify-start gap-3">
                    <i className="material-icons text-primary-500 text-xl">description</i>
                    <span>Invoice</span>
                  </button>
                  <button onClick={() => { setShowCreateMenu(false); navigate('/estimates?action=add') }} className="nav-dropdown-item justify-start gap-3">
                    <i className="material-icons text-primary-500 text-xl">assessment</i>
                    <span>Estimate</span>
                  </button>
                  <button onClick={() => { setShowCreateMenu(false); navigate('/refunds?action=add') }} className="nav-dropdown-item justify-start gap-3">
                    <i className="material-icons text-primary-500 text-xl">assignment_return</i>
                    <span>Refund</span>
                  </button>
                  <button onClick={() => { setShowCreateMenu(false); navigate('/credit-notes?action=add') }} className="nav-dropdown-item justify-start gap-3">
                    <i className="material-icons text-primary-500 text-xl">receipt</i>
                    <span>Credit note</span>
                  </button>
                  <button onClick={() => { setShowCreateMenu(false); navigate('/services?action=add') }} className="nav-dropdown-item justify-start gap-3">
                    <i className="material-icons text-primary-500 text-xl">checklist</i>
                    <span>Service</span>
                  </button>
                  <button onClick={() => { setShowCreateMenu(false); navigate('/products?action=add') }} className="nav-dropdown-item justify-start gap-3">
                    <i className="material-icons text-primary-500 text-xl">inventory_2</i>
                    <span>Product</span>
                  </button>
                </div>
              )}
            </div>

            <div className="hidden lg:block w-px h-6 bg-slate-200" aria-hidden />
            <div className="hidden lg:block">
              <BusinessSelector />
            </div>
            <div className="hidden lg:block w-px h-6 bg-slate-200" aria-hidden />

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center p-1 rounded-lg hover:bg-slate-100 transition-colors duration-150"
                title={user?.name || 'Account'}
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-1.5 w-44 bg-white rounded-lg shadow-xl border border-slate-200/90 py-1 z-50">
                  <button
                    onClick={() => { setShowProfileModal(true); setShowUserMenu(false) }}
                    className="w-full px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 rounded-md"
                  >
                    <User className="w-4 h-4 shrink-0 text-slate-500" />
                    Profile
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => { logout(); setShowUserMenu(false) }}
                    className="w-full px-2.5 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-md"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    Log out
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2.5 rounded-lg hover:bg-slate-100 transition-colors duration-150 text-slate-600"
              aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
              aria-expanded={showMobileMenu}
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div ref={mobileMenuRef} className="lg:hidden border-t border-slate-200/80 bg-slate-50/50">
            <div className="px-4 py-3 border-b border-slate-200/80 bg-white">
              <BusinessSelector showName />
            </div>
            <nav className="px-4 py-3 space-y-0.5 bg-white" aria-label="Mobile">
              {[
                { to: '/dashboard', label: 'Home' },
                { to: '/customers', label: 'Customers' },
                { to: '/invoices', label: 'Invoices' },
                { to: '/estimates', label: 'Estimates' },
                { to: '/products', label: 'Products' },
                { to: '/services', label: 'Services' },
                { to: '/credit-notes', label: 'Credit notes' },
                { to: '/refunds', label: 'Refunds' },
                { to: '/reports', label: 'Reports' },
                { to: '/statements', label: 'Statements' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setShowMobileMenu(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center ${
                    isActive(to) ? 'text-primary-700 bg-primary-50' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-full">
        {children}
      </main>

      {/* Help Button - Fixed Right */}
      <div className="no-print fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:block">
        <button
          onClick={() => {
            window.open('https://help.easyinvoiceapp.com', '_blank')
          }}
          className="bg-primary-100 hover:bg-primary-200 text-primary-800 px-4 py-4 rounded-l-xl shadow-md border border-primary-200 border-r-0 transition-colors flex flex-col items-center gap-1.5"
          title="Get help"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-xs font-medium hidden sm:block">Need help</span>
        </button>
      </div>
    </div>
  )
}
