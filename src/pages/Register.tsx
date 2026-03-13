import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, HelpCircle } from 'lucide-react'

export default function Register() {
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!name || !lastName || !email || !password || !repeatPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      await register(name, lastName, email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Registration Form */}
      <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-primary-400 rounded-lg rotate-12"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border-2 border-primary-300 rounded-full"></div>
          <div className="absolute bottom-32 left-40 w-40 h-40 border-2 border-primary-500 rounded-lg -rotate-12"></div>
        </div>

        {/* Help Button */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
          <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-primary-100 hover:bg-primary-200 rounded-lg text-primary-800 font-medium transition-colors text-sm">
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Need help</span>
          </button>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center min-h-screen p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-8 sm:mb-12 flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">Ei</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-slate-800">EasyInvoice</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6 sm:mb-8">
              Create an Account
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-accent-400 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-accent-400 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-accent-400 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-accent-400 rounded-lg focus:outline-none focus:border-accent-500 transition-colors pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Repeat Password
                </label>
                <div className="relative">
                  <input
                    type={showRepeatPassword ? 'text' : 'password'}
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-accent-400 rounded-lg focus:outline-none focus:border-accent-500 transition-colors pr-12"
                    placeholder="Repeat your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showRepeatPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-gradient-from to-orange-gradient-to text-white py-3 rounded-button font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                style={{ fontSize: '14px', fontWeight: '700' }}
              >
                Create Account
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Already have an Account? Log In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Promotional */}
      <div className="flex-1 bg-primary-600 relative overflow-hidden hidden lg:flex flex-col items-center justify-center p-12">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-16 h-16 border-2 border-white rotate-45"></div>
          <div className="absolute top-40 right-32 w-12 h-12 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-32 left-40 w-20 h-20 border-2 border-white"></div>
          <div className="absolute bottom-20 right-20 w-14 h-14 border-2 border-white rotate-12"></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="flex justify-center gap-4 mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-accent-500 rounded-2xl absolute -top-2 -left-2"></div>
              <div className="w-24 h-24 bg-slate-200 rounded-full relative"></div>
            </div>
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full relative border-4 border-primary-400"></div>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4">Have an account?</h2>
          <p className="text-xl text-white/90 mb-8">
            To keep connected with us please login.
          </p>

          <Link
            to="/login"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  )
}
