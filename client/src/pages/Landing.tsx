import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChefHat,
  Target,
  Users,
  ClipboardCheck,
  TrendingUp,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  BarChart,
  LineChart,
  PieChart,
  Settings,
  CheckCircle,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  title: string
}

interface ScreenshotCardProps {
  title: string
  imageSrc: string
  alt: string
}

// Modal Component
function ImageModal({ isOpen, onClose, imageSrc, title }: ImageModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div className="relative w-full max-w-6xl bg-white rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="relative bg-gray-800 p-2 flex items-center justify-between">
          <div className="text-gray-200 text-sm">{title}</div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="relative bg-gray-100">
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  )
}

function ScreenshotCard({ title, imageSrc, alt }: ScreenshotCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="rounded-xl overflow-hidden shadow-xl group cursor-pointer" onClick={() => setIsModalOpen(true)}>
        <div className="relative bg-gray-800 rounded-t-xl p-2 flex items-center">
          <div className="w-full text-center text-gray-400 text-sm">{title}</div>
        </div>
        <div className="aspect-video bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="transform scale-0 group-hover:scale-100 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>
            </div>
          </div>
          <img
            src={imageSrc}
            alt={alt}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageSrc={imageSrc}
        title={title}
      />
    </>
  )
}

function HeroImage() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E51636]/10 via-transparent to-[#E51636]/5" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.15]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40V20l10-10h20l10 10v20l-10 10H10L0 40z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#hero-pattern)" />
        </svg>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-red-200/20 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative grid grid-cols-2 gap-4 scale-90">
        {/* Kitchen Performance Card */}
        <div className="col-span-2 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <ChefHat className="w-8 h-8 text-[#E51636]" />
            <h3 className="text-xl font-semibold text-gray-900">Kitchen Performance</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="h-2 bg-[#E51636]/20 rounded-full" />
              <div className="h-2 bg-[#E51636]/30 rounded-full" />
              <div className="h-2 bg-[#E51636]/40 rounded-full" />
            </div>
            <div className="col-span-2">
              <div className="flex items-end justify-between h-24 px-2">
                <div className="w-4 bg-[#E51636]/20 rounded-t-lg h-1/3" />
                <div className="w-4 bg-[#E51636]/30 rounded-t-lg h-1/2" />
                <div className="w-4 bg-[#E51636]/40 rounded-t-lg h-2/3" />
                <div className="w-4 bg-[#E51636]/50 rounded-t-lg h-3/4" />
                <div className="w-4 bg-[#E51636]/60 rounded-t-lg h-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Training Progress Card */}
        <div className="col-span-2 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <GraduationCap className="w-6 h-6 text-[#E51636]" />
              <h3 className="text-lg font-semibold text-gray-900">Training Progress</h3>
            </div>
            <span className="text-sm font-medium text-[#E51636]">This Week</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className={`h-16 rounded-lg ${i < 5 ? 'bg-[#E51636]/10' : 'bg-gray-100'} flex items-center justify-center`}>
                  <span className="text-xs font-medium text-gray-600">{Math.floor(Math.random() * 5) + 1}</span>
                </div>
                <div className="text-xs text-center text-gray-500">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Food Safety Card */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <ClipboardCheck className="w-6 h-6 text-[#E51636]" />
            <h3 className="text-lg font-semibold text-gray-900">Food Safety</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600">Temperature Logs</span>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600">Daily Checklist</span>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-sm text-gray-600">Equipment Check</span>
              </div>
              <div className="text-xs font-medium text-yellow-500">2/3</div>
            </div>
          </div>
        </div>

        {/* Daily Goals Card */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <Target className="w-6 h-6 text-[#E51636]" />
            <h3 className="text-lg font-semibold text-gray-900">Daily Goals</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-[85%] bg-[#E51636] rounded-full" />
              </div>
              <span className="text-sm font-medium text-gray-600">85%</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#E51636]/5 rounded-lg p-2 text-center">
                <div className="text-sm font-medium text-[#E51636]">12</div>
                <div className="text-xs text-gray-500">Tasks</div>
              </div>
              <div className="bg-[#E51636]/5 rounded-lg p-2 text-center">
                <div className="text-sm font-medium text-[#E51636]">98%</div>
                <div className="text-xs text-gray-500">Speed</div>
              </div>
              <div className="bg-[#E51636]/5 rounded-lg p-2 text-center">
                <div className="text-sm font-medium text-[#E51636]">4.9</div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluations Card */}
        <div className="col-span-2 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Users className="w-6 h-6 text-[#E51636]" />
              <h3 className="text-lg font-semibold text-gray-900">Team Evaluations</h3>
            </div>
            <div className="px-2 py-1 bg-[#E51636]/10 rounded-full text-xs font-medium text-[#E51636]">
              EXCLUSIVE
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#E51636]" />
                  <span className="text-sm text-gray-600">John Smith</span>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4].map((star) => (
                    <svg key={star} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#E51636]" />
                  <span className="text-sm text-gray-600">Sarah Johnson</span>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-[#E51636]/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold text-[#E51636]">4.8</div>
                  <div className="text-xs text-gray-500">Team Avg</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [mainModalOpen, setMainModalOpen] = useState(false)
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#E51636] to-[#DD0031] text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-[0.15]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-hex-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40V20l10-10h20l10 10v20l-10 10H10L0 40z" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#hero-hex-pattern)" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/5" />
        </div>

        <div className="container relative mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-2">
                <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                Built by Chick-fil-A leaders for Chick-fil-A teams
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Elevate Your Restaurant's <span className="text-red-100">Performance</span>
              </h1>
              <p className="text-xl sm:text-2xl text-red-100">
                The only mobile-first platform built by Chick-fil-A leaders with exclusive evaluations and leadership development plans based on 15+ years of experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="relative z-20 text-[#E51636] hover:text-[#E51636] bg-white hover:bg-white/90 font-bold shadow-lg transition-all duration-300 hover:scale-105"
                  onClick={() => navigate('/register')}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="relative z-20 bg-[#DD0031] hover:bg-[#DD0031]/80 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-900/20"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </Button>
              </div>
              <div className="flex items-center space-x-4 text-sm text-red-100">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Easy setup
                </div>
              </div>
            </div>
            <div className="relative lg:h-[600px] hidden lg:block">
              <HeroImage />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-sm font-medium text-[#E51636] mb-4">
              Powerful Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline operations, develop leaders, and drive performance with our comprehensive suite of tools.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Kitchen Operations */}
            <Card className="border-2 hover:border-[#E51636] transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-[#E51636]" />
                </div>
                <h3 className="text-xl font-semibold">Kitchen Excellence</h3>
                <p className="text-gray-600">
                  Manage food safety, equipment maintenance, and waste tracking with precision and ease.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E51636]" />
                    Food Safety Checklists
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E51636]" />
                    Equipment Maintenance
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E51636]" />
                    Waste Analytics
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Team Development */}
            <Card className="border-2 hover:border-[#E51636] transition-colors relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#E51636]/10 rounded-full"></div>
              <div className="absolute right-0 top-0 bg-[#E51636] text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
                EXCLUSIVE
              </div>
              <CardContent className="p-6 space-y-4 relative z-10">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-[#E51636]" />
                </div>
                <h3 className="text-xl font-semibold">Expert Leadership Plans</h3>
                <p className="text-gray-600">
                  Exclusive development plans created by a leader with 15+ years of Chick-fil-A experience.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E51636]" />
                    Personalized Growth Paths
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E51636]" />
                    Proven Development Frameworks
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E51636]" />
                    Leadership Milestone Tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Team Management */}
            <Card className="border-2 hover:border-[#E51636] transition-colors relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#E51636]/10 rounded-full"></div>
              <div className="absolute right-0 top-0 bg-[#E51636] text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
                EXCLUSIVE
              </div>
              <CardContent className="p-6 space-y-4 relative z-10">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#E51636]" />
                </div>
                <h3 className="text-xl font-semibold">Comprehensive Evaluations</h3>
                <p className="text-gray-600">
                  The only platform with a complete evaluation system designed specifically for Chick-fil-A teams.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E51636]" />
                    Detailed Performance Reviews
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E51636]" />
                    Customizable Evaluation Templates
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E51636]" />
                    Growth-Focused Feedback System
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-[#E51636]/5 to-[#E51636]/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-sm font-medium text-[#E51636] mb-4">
              Simple Process
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform is designed for busy restaurant leaders. Setup is quick and intuitive.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-[#E51636]/10 flex items-center justify-center text-[#E51636] font-bold text-4xl">
                1
              </div>
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-[#E51636]" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Create Your Account</h3>
                <p className="text-gray-600">
                  Sign up with your email and create your restaurant profile in less than 2 minutes.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-[#E51636]/10 flex items-center justify-center text-[#E51636] font-bold text-4xl">
                2
              </div>
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-6">
                  <Settings className="h-6 w-6 text-[#E51636]" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Customize Your Setup</h3>
                <p className="text-gray-600">
                  Import your team data and customize the platform to match your restaurant's specific needs.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-[#E51636]/10 flex items-center justify-center text-[#E51636] font-bold text-4xl">
                3
              </div>
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6 text-[#E51636]" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Start Improving</h3>
                <p className="text-gray-600">
                  Begin using the tools immediately to streamline operations and develop your team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile First Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-sm font-medium text-[#E51636] mb-4">
                Mobile-First Design
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Built for Your Team on the Go
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Unlike other platforms, we designed our solution specifically for mobile devices first, with exclusive evaluations that competitors lack, ensuring your team can access everything they need right from their phones.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#E51636]/10 flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-[#E51636]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Optimized for Phones</h3>
                    <p className="text-gray-600">Every feature works perfectly on mobile devices with no compromises</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#E51636]/10 flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-[#E51636]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Exclusive Evaluations</h3>
                    <p className="text-gray-600">Comprehensive performance reviews with customizable templates</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-[#E51636]/10 flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-[#E51636]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quick Access</h3>
                    <p className="text-gray-600">Access evaluations, training materials, and daily tasks in seconds</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-4">
                  <div className="h-6 w-6 rounded-full bg-[#E51636]/10 flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-[#E51636]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Leadership Development</h3>
                    <p className="text-gray-600">Expert development plans based on 15+ years of experience</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E51636]/5 to-[#E51636]/10 rounded-3xl transform rotate-6"></div>
              <div className="relative bg-white p-4 rounded-3xl shadow-xl border-8 border-gray-800 mx-auto max-w-[300px] aspect-[9/19]">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-5 bg-gray-800 rounded-b-xl"></div>
                <div className="h-full w-full bg-gray-100 rounded-2xl overflow-hidden">
                  <img
                    src="/mobile-evaluations.png"
                    alt="Mobile app evaluations interface"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/300x650/e51636/ffffff?text=Performance+Reviews';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-sm font-medium text-[#E51636] mb-4">
              User-Friendly Interface
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Tools at Your Fingertips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience our intuitive interface designed specifically for Chick-fil-A operations by leaders who understand your daily challenges.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-center">
            {/* Main Screenshot */}
            <div
              className="lg:col-span-8 rounded-2xl overflow-hidden shadow-2xl group cursor-pointer"
              onClick={() => setMainModalOpen(true)}
            >
              <div className="relative bg-gray-800 rounded-t-2xl p-2 flex items-center">
                <div className="flex gap-2 absolute left-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="w-full text-center text-gray-400 text-sm">Performance Reviews Dashboard</div>
              </div>
              <div className="aspect-[16/10] bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <div className="transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <img
                  src="/dashboard-reviews.png"
                  alt="Performance Reviews Dashboard showing employee evaluations interface"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <ImageModal
              isOpen={mainModalOpen}
              onClose={() => setMainModalOpen(false)}
              imageSrc="/dashboard-reviews.png"
              title="Performance Reviews Dashboard"
            />

            {/* Side Screenshots */}
            <div className="lg:col-span-4 space-y-8">
              <ScreenshotCard
                title="Employee Evaluations"
                imageSrc="/evaluations.png"
                alt="Employee evaluations interface showing performance reviews and ratings"
              />
              <ScreenshotCard
                title="Leadership Development"
                imageSrc="/leadership-development.png"
                alt="Leadership development dashboard showing training progress and achievements"
              />
            </div>
          </div>

          {/* Additional Features Showcase */}
          <div className="mt-16 space-y-8">
            {showAllFeatures && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <ScreenshotCard
                  title="Mobile Evaluations"
                  imageSrc="/mobile-evaluations.png"
                  alt="Mobile evaluations interface showing performance reviews"
                />
                <ScreenshotCard
                  title="Mobile Training"
                  imageSrc="/mobile-training.png"
                  alt="Mobile training interface showing employee progress"
                />
                <ScreenshotCard
                  title="Mobile Task Management"
                  imageSrc="/mobile-task.png"
                  alt="Mobile task management system with daily operations tracking"
                />
                <ScreenshotCard
                  title="Mobile Dashboard"
                  imageSrc="/mobile-dashboard.png"
                  alt="Mobile dashboard showing key performance metrics"
                />
                <ScreenshotCard
                  title="Team Management"
                  imageSrc="/team-management.png"
                  alt="Team performance and disciplinary management interface"
                />
                <ScreenshotCard
                  title="Performance Analytics"
                  imageSrc="/evaluation-analytics.png"
                  alt="Evaluation analytics and performance metrics dashboard"
                />
              </div>
            )}

            <div className="flex justify-center">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#E51636] text-[#E51636] hover:bg-[#E51636] hover:text-white transition-colors"
                onClick={() => setShowAllFeatures(!showAllFeatures)}
              >
                {showAllFeatures ? (
                  <>
                    <ChevronUp className="w-5 h-5 mr-2" />
                    Show Less Features
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5 mr-2" />
                    View More Features
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-[#E51636] mb-2">
                <Settings className="w-6 h-6 mx-auto" />
              </div>
              <h3 className="font-semibold text-gray-900">Customizable Views</h3>
              <p className="text-sm text-gray-600">Tailor the dashboard to your needs</p>
            </div>
            <div className="text-center">
              <div className="text-[#E51636] mb-2">
                <LineChart className="w-6 h-6 mx-auto" />
              </div>
              <h3 className="font-semibold text-gray-900">Real-time Analytics</h3>
              <p className="text-sm text-gray-600">Monitor performance instantly</p>
            </div>
            <div className="text-center">
              <div className="text-[#E51636] mb-2">
                <Users className="w-6 h-6 mx-auto" />
              </div>
              <h3 className="font-semibold text-gray-900">Team Insights</h3>
              <p className="text-sm text-gray-600">Track development progress</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#E51636] to-[#DD0031] rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 bg-[url('/testimonial-bg.jpg')] bg-cover bg-center hidden md:block">
                {/* Image will be shown here if available */}
              </div>
              <div className="md:col-span-3 p-8 md:p-12 text-white">
                <div className="text-5xl font-serif mb-6">"</div>
                <blockquote className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                  This platform has completely transformed how we develop our team. The mobile-first design means my team can complete evaluations right on the floor, and the leadership plans have accelerated our development process.
                </blockquote>
                <div className="flex items-center">
                  <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl mr-4">
                    JM
                  </div>
                  <div>
                    <h4 className="font-bold text-xl">John Manager</h4>
                    <p className="text-red-100">Store Director, Chick-fil-A</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-[#F9F9F9]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-sm font-medium text-[#E51636] mb-4">
              Real Results
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Achieve Operational Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform is designed to help you reach your full potential.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="inline-flex h-16 w-16 rounded-full bg-red-100 items-center justify-center mb-4">
                <ClipboardCheck className="h-8 w-8 text-[#E51636]" />
              </div>
              <div className="text-4xl font-bold text-[#E51636] mb-2">98%</div>
              <p className="text-gray-600 font-medium mb-2">Compliance Rate</p>
              <p className="text-sm text-gray-500">Ensure food safety standards are consistently met</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="inline-flex h-16 w-16 rounded-full bg-red-100 items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-[#E51636]" />
              </div>
              <div className="text-4xl font-bold text-[#E51636] mb-2">45%</div>
              <p className="text-gray-600 font-medium mb-2">Waste Reduction</p>
              <p className="text-sm text-gray-500">Optimize operations and reduce unnecessary costs</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="inline-flex h-16 w-16 rounded-full bg-red-100 items-center justify-center mb-4">
                <GraduationCap className="h-8 w-8 text-[#E51636]" />
              </div>
              <div className="text-4xl font-bold text-[#E51636] mb-2">2x</div>
              <p className="text-gray-600 font-medium mb-2">Leadership Development</p>
              <p className="text-sm text-gray-500">Accelerate team member growth and promotion readiness</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-[#E51636]/90 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjggMjggMCAxIDAgNTYgMGEyOCAyOCAwIDEgMCAtNTYgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20" />
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6">
            Limited Time Offer
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8">
            Ready for a Platform Built <span className="underline decoration-red-300">Specifically</span> for Chick-fil-A?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Get exclusive access to our mobile-first platform with industry-leading evaluations and expert leadership development plans.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-3xl mx-auto mb-12">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="text-left space-y-4">
                <h3 className="text-2xl font-bold">Early Adopter Benefits:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Free 30-day trial with full access to all exclusive features</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Custom leadership development plan consultation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Mobile-optimized evaluation templates setup</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-4">
                <Button
                  size="lg"
                  className="bg-white hover:bg-white/90 text-[#E51636] font-bold shadow-lg transition-all duration-300 hover:scale-105 h-14 text-lg"
                  onClick={() => navigate('/register')}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 transition-all duration-300"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </Button>
                <p className="text-sm text-gray-300 mt-2">No credit card required</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}