import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import CreateInvoice from './pages/CreateInvoice'
import InvoiceDetail from './pages/InvoiceDetail'
import Customers from './pages/Customers'
import Estimates from './pages/Estimates'
import EstimateDetail from './pages/EstimateDetail'
import CreateEstimate from './pages/CreateEstimate'
import Products from './pages/Products'
import Services from './pages/Services'
import CreditNotes from './pages/CreditNotes'
import Refunds from './pages/Refunds'
import Reports from './pages/Reports'
import Statements from './pages/Statements'
import AddBusiness from './pages/AddBusiness'
import EditBusiness from './pages/EditBusiness'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { BusinessProvider } from './contexts/BusinessContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <Invoices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/add"
        element={
          <ProtectedRoute>
            <CreateInvoice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/:id"
        element={
          <ProtectedRoute>
            <InvoiceDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/estimates"
        element={
          <ProtectedRoute>
            <Estimates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/estimates/add"
        element={
          <ProtectedRoute>
            <CreateEstimate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/estimates/:id"
        element={
          <ProtectedRoute>
            <EstimateDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <Services />
          </ProtectedRoute>
        }
      />
      <Route
        path="/credit-notes"
        element={
          <ProtectedRoute>
            <CreditNotes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/refunds"
        element={
          <ProtectedRoute>
            <Refunds />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/statements"
        element={
          <ProtectedRoute>
            <Statements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/add"
        element={
          <ProtectedRoute>
            <AddBusiness />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/edit/:id"
        element={
          <ProtectedRoute>
            <EditBusiness />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <Router>
          <AppRoutes />
        </Router>
      </BusinessProvider>
    </AuthProvider>
  )
}

export default App
