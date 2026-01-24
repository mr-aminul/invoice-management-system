import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Business {
  id: string
  name: string
  country: string
  currency: string
  currencyPosition?: string
  dateFormat?: string
  numberFormat?: string
  bankDetails?: string
  homeBankAccountDetails?: string
  address?: string
  email?: string
  logo?: string
  signature?: string
  enableStockTracking?: boolean
  taxNextYearEnd?: string
  utrTaxIdNumber?: string
  registeredForVAT?: boolean
  pdfTemplate?: string
  invoiceTerms?: string
  invoiceFooter?: string
  salesInvoiceText?: string
  invoiceNumberLabel?: string
  invoiceDateLabel?: string
  invoiceTotalLabel?: string
  estimateTerms?: string
  estimateLabel?: string
  estimateNumberLabel?: string
  estimateDateLabel?: string
  estimateTotalLabel?: string
  estimateTotalReferenceLabel?: string
  useDeliveryNoteForPOReference?: boolean
  emailCopyOfAllDocuments?: boolean
  salesInvoiceEmailSubject?: string
  salesInvoiceEmailBody?: string
  estimateEmailSubject?: string
  estimateEmailBody?: string
  refundEmailSubject?: string
  refundEmailBody?: string
  creditNoteEmailSubject?: string
  creditNoteEmailBody?: string
  deliveryNoteEmailSubject?: string
  deliveryNoteEmailBody?: string
  statementEmailSubject?: string
  statementEmailBody?: string
  createdAt: string
}

interface BusinessContextType {
  businesses: Business[]
  currentBusiness: Business | null
  setCurrentBusiness: (business: Business | null) => void
  addBusiness: (business: Omit<Business, 'id' | 'createdAt'>) => Business
  updateBusiness: (id: string, business: Partial<Business>) => void
  deleteBusiness: (id: string) => void
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null)

  // Load businesses from localStorage on mount
  useEffect(() => {
    const savedBusinesses = localStorage.getItem('businesses')
    const savedCurrentBusinessId = localStorage.getItem('currentBusinessId')
    
    if (savedBusinesses) {
      const parsedBusinesses = JSON.parse(savedBusinesses)
      setBusinesses(parsedBusinesses)
      
      if (savedCurrentBusinessId) {
        const found = parsedBusinesses.find((b: Business) => b.id === savedCurrentBusinessId)
        if (found) {
          setCurrentBusiness(found)
        } else if (parsedBusinesses.length > 0) {
          // If saved business not found, use first one
          setCurrentBusiness(parsedBusinesses[0])
          localStorage.setItem('currentBusinessId', parsedBusinesses[0].id)
        }
      } else if (parsedBusinesses.length > 0) {
        // If no current business saved, use first one
        setCurrentBusiness(parsedBusinesses[0])
        localStorage.setItem('currentBusinessId', parsedBusinesses[0].id)
      }
    }
  }, [])

  // Save businesses to localStorage whenever they change
  useEffect(() => {
    if (businesses.length > 0) {
      localStorage.setItem('businesses', JSON.stringify(businesses))
    }
  }, [businesses])

  // Save current business ID to localStorage whenever it changes
  useEffect(() => {
    if (currentBusiness) {
      localStorage.setItem('currentBusinessId', currentBusiness.id)
    }
  }, [currentBusiness])

  const addBusiness = (businessData: Omit<Business, 'id' | 'createdAt'>): Business => {
    const newBusiness: Business = {
      ...businessData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setBusinesses([...businesses, newBusiness])
    setCurrentBusiness(newBusiness)
    return newBusiness
  }

  const updateBusiness = (id: string, businessData: Partial<Business>) => {
    setBusinesses(businesses.map(b => 
      b.id === id ? { ...b, ...businessData } : b
    ))
    if (currentBusiness?.id === id) {
      setCurrentBusiness({ ...currentBusiness, ...businessData })
    }
  }

  const deleteBusiness = (id: string) => {
    const updatedBusinesses = businesses.filter(b => b.id !== id)
    setBusinesses(updatedBusinesses)
    
    if (currentBusiness?.id === id) {
      if (updatedBusinesses.length > 0) {
        setCurrentBusiness(updatedBusinesses[0])
      } else {
        setCurrentBusiness(null)
        localStorage.removeItem('currentBusinessId')
      }
    }
  }

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        currentBusiness,
        setCurrentBusiness,
        addBusiness,
        updateBusiness,
        deleteBusiness,
      }}
    >
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider')
  }
  return context
}
