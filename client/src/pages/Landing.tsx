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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Award
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

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
        {/* Team Evaluations Card - Moved to top */}
        <div className="col-span-2 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-[#E51636]" />
              <h3 className="text-xl font-semibold text-gray-900">Team Evaluations</h3>
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

        {/* Leadership Development Card */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <Award className="w-6 h-6 text-[#E51636]" />
            <h3 className="text-lg font-semibold text-gray-900">Leadership Development</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-600">Active Plans</span>
              </div>
              <span className="text-sm font-medium text-blue-600">8</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600">Completed Tasks</span>
              </div>
              <span className="text-sm font-medium text-green-600">24</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-sm text-gray-600">Team Leaders</span>
              </div>
              <span className="text-sm font-medium text-purple-600">5</span>
            </div>
          </div>
        </div>

        {/* Kitchen Performance Card */}
        <div className="col-span-2 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl mt-4">
          <div className="flex items-center gap-4 mb-4">
            <ChefHat className="w-6 h-6 text-[#E51636]" />
            <h3 className="text-lg font-semibold text-gray-900">Kitchen Performance</h3>
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
      </div>
    </div>
  )
}

// Desktop Carousel Component
function DesktopCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const screenshots = [
    {
      src: "/new/dashboard.png",
      alt: "Leadership Development Dashboard showing comprehensive store management interface",
      title: "Leadership Development Dashboard",
      description: "Complete overview of team development and store performance"
    },
    {
      src: "/new/kitchenDashboard.png",
      alt: "Kitchen dashboard showing food safety, waste tracking, and equipment status",
      title: "Kitchen Operations Center",
      description: "Real-time kitchen management and food safety compliance"
    },
    {
      src: "/new/Evaluations.png",
      alt: "Comprehensive employee performance evaluations interface",
      title: "Performance Evaluations",
      description: "Two professional evaluation templates: Team Member Performance & Leadership Development"
    },
    {
      src: "/new/analyticsPage.png",
      alt: "Detailed performance analytics and insights dashboard",
      title: "Analytics & Insights",
      description: "Data-driven insights for better decision making"
    },
    {
      src: "/new/TrainingMainPage.png",
      alt: "Comprehensive training program management interface",
      title: "Training Management",
      description: "Complete training program oversight and tracking"
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % screenshots.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length)
  }

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000) // Slower for desktop viewing
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full max-w-8xl mx-auto">
      {/* Full-Width Image Showcase */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Enhanced Header */}
        <div className="relative bg-gray-800/90 backdrop-blur-sm p-6 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="text-gray-300 text-lg font-medium">
              {screenshots[currentSlide].title}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-gray-400 text-sm">
              {currentSlide + 1} of {screenshots.length}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              View Full Size
            </button>
          </div>
        </div>

        {/* Full-size image display */}
        <div className="relative bg-white">
          <div className="aspect-[16/10] relative overflow-hidden">
            <div
              className="flex h-full transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {screenshots.map((screenshot, index) => (
                <div key={index} className="w-full h-full flex-shrink-0 relative">
                  <img
                    src={screenshot.src}
                    alt={screenshot.alt}
                    className="w-full h-full object-cover object-top cursor-pointer"
                    onClick={() => setIsModalOpen(true)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://placehold.co/1400x900/e51636/ffffff?text=${encodeURIComponent(screenshot.title)}`;
                    }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 flex items-center justify-center group">
                    <div className="transform scale-0 group-hover:scale-100 transition-transform duration-300">
                      <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-xl">
                        <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-110 z-20"
      >
        <ChevronLeft className="w-7 h-7 text-gray-700" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-110 z-20"
      >
        <ChevronRight className="w-7 h-7 text-gray-700" />
      </button>



      {/* Slide indicators */}
      <div className="flex gap-3 justify-center mt-8">
        {screenshots.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-[#E51636] scale-125 shadow-lg'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Full Page Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageSrc={screenshots[currentSlide].src}
        title={screenshots[currentSlide].title}
      />
    </div>
  )
}

// Mobile Carousel Component
function MobileCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const screenshots = [
    {
      src: "/new/MobileDashboard.png",
      alt: "Mobile dashboard showing overview of all restaurant management features",
      title: "Dashboard Overview",
      description: ""
    },
    {
      src: "/new/MobileEvaluations.png",
      alt: "Mobile app showing performance reviews dashboard with evaluation interface",
      title: "Performance Reviews",
      description: ""
    },
    {
      src: "/new/MobileKitchenDash.png",
      alt: "Kitchen management dashboard showing food safety checklists and waste tracking",
      title: "Kitchen Management",
      description: ""
    },
    {
      src: "/new/MobileFOHTask.png",
      alt: "Front of house task management and team coordination interface",
      title: "FOH Task Management",
      description: ""
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % screenshots.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length)
  }

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(nextSlide, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative mx-auto max-w-[320px] lg:max-w-[380px]">
      {/* Phone mockup */}
      <div className="relative bg-gray-900 p-2 rounded-[3rem] shadow-2xl">
        {/* Phone frame */}
        <div className="bg-black rounded-[2.5rem] p-1">
          <div className="relative bg-white rounded-[2.25rem] overflow-hidden aspect-[9/19.5]">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>

            {/* Screen content with carousel */}
            <div className="h-full w-full relative overflow-hidden">
              <div
                className="flex h-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {screenshots.map((screenshot, index) => (
                  <div key={index} className="w-full h-full flex-shrink-0 relative">
                    <img
                      src={screenshot.src}
                      alt={screenshot.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://placehold.co/320x690/e51636/ffffff?text=${encodeURIComponent(screenshot.title)}`;
                      }}
                    />
                    {/* Overlay gradient for better visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-black/5 pointer-events-none"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-[3rem] pointer-events-none"></div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-110 z-20"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-110 z-20"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>

      {/* Current slide info - removed to prevent text overlap */}

      {/* Slide indicators */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
        <div className="flex gap-2 justify-center">
          {screenshots.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-[#E51636] scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-2xl shadow-xl animate-bounce">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>

      <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-2xl shadow-xl animate-pulse">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
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
                Leadership Development & Performance Evaluations
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="text-amber-300 font-extrabold">L</span>eadership<br />
                <span className="text-amber-300 font-extrabold">D</span>evelopment. Lasting<br />
                <span className="text-amber-300 font-extrabold">Growth</span>.
              </h1>
              <p className="text-xl sm:text-2xl text-red-100 font-medium italic">
                "You're not just managing today's operations - you're building tomorrow's leaders"
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="relative z-20 text-[#E51636] hover:text-[#E51636] bg-white hover:bg-white/90 font-bold text-xl px-10 py-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-2 border-white"
                  onClick={() => navigate('/register')}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="relative z-20 bg-transparent hover:bg-white/20 text-white hover:text-white font-medium text-lg px-8 py-6 border-2 border-white/40 hover:border-white/60 transition-all duration-300 backdrop-blur-sm"
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
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#E51636]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#E51636]/3 rounded-full blur-3xl"></div>
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#E51636] to-[#DD0031] text-white text-sm font-bold mb-6 shadow-lg">
              <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              PROVEN RESULTS • EXCLUSIVE ACCESS
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Leadership Development & <br />
              <span className="bg-gradient-to-r from-[#E51636] to-[#DD0031] bg-clip-text text-transparent">
                Performance Evaluations
              </span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              The only platform with <span className="font-bold text-[#E51636]">exclusive evaluation templates</span> and proven leadership development plans built by <span className="font-bold text-[#E51636]">current restaurant leaders and operators</span> with real-world experience.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
            {/* Mobile Evaluations */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E51636]/20 to-[#DD0031]/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <Card className="relative border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-2 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E51636] to-[#DD0031]"></div>
                <div className="absolute right-4 top-4 bg-gradient-to-r from-[#E51636] to-[#DD0031] text-white text-xs font-bold py-2 px-4 rounded-full shadow-lg">
                  EXCLUSIVE
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center group-hover:from-[#E51636] group-hover:to-[#DD0031] transition-all duration-500 shadow-lg">
                      <ClipboardCheck className="h-8 w-8 text-[#E51636] group-hover:text-white transition-colors duration-500" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#E51636]">98%</div>
                      <div className="text-xs text-gray-500 font-medium">COMPLETION RATE</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Mobile-First Evaluations</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      The <span className="font-semibold text-[#E51636]">only platform with comprehensive mobile evaluations</span> designed specifically for restaurant operations and team development.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">On-the-Floor Performance Reviews</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">Customizable Evaluation Templates</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">Real-time Analytics Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">Team Member Experience Surveys</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Time saved per review</span>
                      <span className="font-bold text-green-600">15 minutes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Development */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E51636]/20 to-[#DD0031]/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <Card className="relative border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-2 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E51636] to-[#DD0031]"></div>
                <div className="absolute right-4 top-4 bg-gradient-to-r from-[#E51636] to-[#DD0031] text-white text-xs font-bold py-2 px-4 rounded-full shadow-lg">
                  EXCLUSIVE
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center group-hover:from-[#E51636] group-hover:to-[#DD0031] transition-all duration-500 shadow-lg">
                      <GraduationCap className="h-8 w-8 text-[#E51636] group-hover:text-white transition-colors duration-500" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#E51636]">2x</div>
                      <div className="text-xs text-gray-500 font-medium">FASTER DEVELOPMENT</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Expert Leadership Plans</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      <span className="font-semibold text-[#E51636]">Accelerate leadership development by 2x</span> with exclusive plans created by
                      <span className="font-semibold text-[#E51636]"> current restaurant leaders and operators</span> with proven real-world experience.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">Personalized Growth Paths</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">Proven Development Frameworks</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">Leadership Milestone Tracking</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">360-Degree Feedback System</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Promotion readiness</span>
                      <span className="font-bold text-green-600">50% faster</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Analytics */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E51636]/20 to-[#DD0031]/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <Card className="relative border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-2 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E51636] to-[#DD0031]"></div>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center group-hover:from-[#E51636] group-hover:to-[#DD0031] transition-all duration-500 shadow-lg">
                      <TrendingUp className="h-8 w-8 text-[#E51636] group-hover:text-white transition-colors duration-500" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#E51636]">85%</div>
                      <div className="text-xs text-gray-500 font-medium">IMPROVEMENT RATE</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Performance Analytics</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Track team development progress with <span className="font-semibold text-[#E51636]">detailed analytics and insights</span> that help you make data-driven leadership decisions.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">Individual Progress Tracking</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">Team Performance Insights</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">Development Milestone Reports</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">ROI Performance Metrics</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Performance improvement</span>
                      <span className="font-bold text-green-600">85% of team</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <Button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-4 bg-gradient-to-r from-[#E51636] to-[#DD0031] hover:from-[#DD0031] hover:to-[#C41230] text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-none h-auto"
            >
              <div className="text-left">
                <div className="text-sm font-medium opacity-90">Start seeing results in</div>
                <div className="text-xl font-bold">7 days or less</div>
              </div>
              <ArrowRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-[#E51636]/20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E51636]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#DD0031]/10 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjggMjggMCAxIDAgNTYgMGEyOCAyOCAwIDEgMCAtNTYgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30"></div>
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold mb-8 shadow-2xl">
              <span className="flex h-2 w-2 rounded-full bg-white mr-3 animate-pulse"></span>
              SETUP IN UNDER 5 MINUTES • NO TECHNICAL SKILLS REQUIRED
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              From Sign-Up to <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Implementation Success
              </span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              We've made it <span className="font-bold text-white">ridiculously simple</span> to get started.
              Most stores are fully operational within their first week.
            </p>
          </div>

          <div className="grid gap-12 lg:gap-16 md:grid-cols-3 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-3">
                <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-3xl shadow-2xl">
                  1
                </div>
                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center mb-8 shadow-lg group-hover:from-green-500 group-hover:to-emerald-600 transition-all duration-500">
                    <Users className="h-8 w-8 text-green-600 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Create Your Account</h3>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    Sign up with your email and create your restaurant profile.
                    <span className="font-semibold text-green-400"> Takes less than 2 minutes</span>.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span>No credit card required</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span>Instant access to all features</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span>30-day free trial</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-3">
                <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-3xl shadow-2xl">
                  2
                </div>
                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-50 flex items-center justify-center mb-8 shadow-lg group-hover:from-blue-500 group-hover:to-cyan-600 transition-all duration-500">
                    <Settings className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Import & Customize</h3>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    Add your team members and customize features for your store.
                    <span className="font-semibold text-blue-400"> Everything is pre-configured</span>.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <span>Bulk team member import</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <span>Pre-built evaluation templates</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <span>Optional setup call</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E51636]/20 to-[#DD0031]/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-3">
                <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br from-[#E51636] to-[#DD0031] flex items-center justify-center text-white font-bold text-3xl shadow-2xl">
                  3
                </div>
                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mb-8 shadow-lg group-hover:from-[#E51636] group-hover:to-[#DD0031] transition-all duration-500">
                    <TrendingUp className="h-8 w-8 text-[#E51636] group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Start Building Results</h3>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    Begin implementing proven systems immediately.
                    <span className="font-semibold text-red-400"> Build sustainable improvements over time</span>.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <span>Start tracking waste patterns</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <span>Begin mobile evaluations</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <span>Access leadership development plans</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Process Flow */}
          <div className="mt-20 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 via-blue-500 to-[#E51636] transform -translate-y-1/2 hidden lg:block"></div>
            <div className="flex justify-center items-center space-x-8 lg:space-x-16">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">2 min</div>
                  <div className="text-sm text-gray-300">Setup Time</div>
                </div>
              </div>
              <ArrowRight className="h-8 w-8 text-white/50 hidden lg:block" />
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">5 min</div>
                  <div className="text-sm text-gray-300">Customization</div>
                </div>
              </div>
              <ArrowRight className="h-8 w-8 text-white/50 hidden lg:block" />
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">1 week</div>
                  <div className="text-sm text-gray-300">Fully Operational</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="inline-flex flex-col items-center gap-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="text-sm font-medium opacity-90 mb-2">Ready to transform your store?</div>
                <div className="text-2xl font-bold mb-4">Start Your Free Trial Now</div>
                <Button
                  size="lg"
                  className="bg-white hover:bg-gray-100 text-green-600 font-bold shadow-lg transition-all duration-300 hover:scale-105 px-8 py-3"
                  onClick={() => navigate('/register')}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile First Section */}
      <section className="py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#E51636]/5 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjBtLTE4IDBhMTggMTggMCAxIDAgMzYgMGExOCAxOCAwIDEgMCAtMzYgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTUxNjM2IiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-40"></div>
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-bold mb-8 shadow-lg">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                MOBILE-FIRST DESIGN • INDUSTRY EXCLUSIVE
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                Built for Your Team <br />
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  On the Go
                </span>
              </h2>

              <p className="text-xl sm:text-2xl text-gray-600 mb-12 leading-relaxed">
                Unlike other platforms, we designed our solution <span className="font-bold text-gray-900">specifically for mobile devices first</span>,
                with exclusive evaluations that competitors lack.
              </p>

              <div className="grid gap-6 sm:gap-8">
                <div className="group flex items-start gap-4 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Perfect Mobile Experience</h3>
                    <p className="text-gray-600 leading-relaxed">Every feature works flawlessly on phones and tablets. No compromises, no desktop-first limitations.</p>
                  </div>
                </div>

                <div className="group flex items-start gap-4 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#E51636] to-[#DD0031] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Exclusive Evaluation System</h3>
                    <p className="text-gray-600 leading-relaxed">Comprehensive performance reviews with customizable templates you can't get anywhere else.</p>
                  </div>
                </div>

                <div className="group flex items-start gap-4 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast Access</h3>
                    <p className="text-gray-600 leading-relaxed">Access evaluations, training materials, and daily tasks in seconds, not minutes.</p>
                  </div>
                </div>

                <div className="group flex items-start gap-4 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Leadership Development</h3>
                    <p className="text-gray-600 leading-relaxed">Proven development plans based on 15+ years of real Chick-fil-A leadership experience.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative">
              {/* Background glow effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-[#E51636]/10 rounded-[3rem] blur-3xl scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-cyan-500/10 to-purple-500/10 rounded-[3rem] blur-2xl scale-105 rotate-6"></div>

              {/* Mobile Screenshots Carousel */}
              <MobileCarousel />
            </div>
          </div>

          {/* Bottom stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg">
              <div className="text-3xl font-bold text-[#E51636] mb-2">100%</div>
              <div className="text-sm text-gray-600 font-medium">Mobile Optimized</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">3 sec</div>
              <div className="text-sm text-gray-600 font-medium">Load Time</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600 font-medium">Access</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
              <div className="text-sm text-gray-600 font-medium">Downtime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-sm font-medium text-[#E51636] mb-4">
              See It In Action
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for Real Restaurant Operations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience our intuitive interface designed specifically for restaurant operations by leaders who understand your daily challenges.
            </p>
          </div>

          {/* Desktop Carousel Section - Full Width */}
          <div className="mb-32 px-8">
            <DesktopCarousel />
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

      {/* About the Creator Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#E51636] to-[#DD0031] rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 relative overflow-hidden">
                <img
                  src="/me.jpg"
                  alt="Creator with family - passionate about leadership development"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="md:col-span-3 p-8 md:p-12 text-white">
                <blockquote className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                  My passion for leadership development drives everything I do. With 10 years in restaurant management and 15 years of leadership development experience, I've seen firsthand how the right tools and development plans can transform teams and elevate performance. This platform represents everything I wish I had when I was developing leaders.
                </blockquote>
                <div className="flex items-center">
                  <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl mr-4">
                    JP
                  </div>
                  <div>
                    <h4 className="font-bold text-xl">Jonathon Pope</h4>
                    <p className="text-red-100">Creator & Current CFA Leader</p>
                    <p className="text-red-200 text-sm mt-1">10 Years CFA • 15 Years Leadership Development</p>
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
              Proven ROI
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Results That Drive Your Bottom Line
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join successful restaurants already using our platform to outperform their competition.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-t-4 border-[#E51636]">
              <div className="inline-flex h-16 w-16 rounded-full bg-red-100 items-center justify-center mb-4">
                <ClipboardCheck className="h-8 w-8 text-[#E51636]" />
              </div>
              <div className="text-4xl font-bold text-[#E51636] mb-2">98%</div>
              <p className="text-gray-600 font-medium mb-2">Food Safety Compliance</p>
              <p className="text-sm text-gray-500">Eliminate violations and maintain perfect health scores with digital checklists</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-t-4 border-[#E51636]">
              <div className="inline-flex h-16 w-16 rounded-full bg-red-100 items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-[#E51636]" />
              </div>
              <div className="text-4xl font-bold text-[#E51636] mb-2">45%</div>
              <p className="text-gray-600 font-medium mb-2">Waste Reduction</p>
              <p className="text-sm text-gray-500">Save thousands monthly with real-time waste tracking and analytics</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-t-4 border-[#E51636]">
              <div className="inline-flex h-16 w-16 rounded-full bg-red-100 items-center justify-center mb-4">
                <GraduationCap className="h-8 w-8 text-[#E51636]" />
              </div>
              <div className="text-4xl font-bold text-[#E51636] mb-2">2x</div>
              <p className="text-gray-600 font-medium mb-2">Faster Leadership Development</p>
              <p className="text-sm text-gray-500">Promote team members faster with proven development frameworks</p>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="mt-16 bg-gradient-to-br from-[#E51636] to-[#DD0031] rounded-3xl p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-6">
                  Why Top-Performing Stores Choose Our Platform
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-lg">Built by Restaurant Leaders</h4>
                      <p className="text-red-100">Created by operators with 15+ years of real restaurant experience</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-lg">Mobile-First Design</h4>
                      <p className="text-red-100">The only platform designed specifically for mobile restaurant operations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-lg">Exclusive Content</h4>
                      <p className="text-red-100">Access to evaluation templates and development plans you can't get anywhere else</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-lg">Immediate ROI</h4>
                      <p className="text-red-100">Start seeing results in waste reduction and compliance within the first week</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-4xl font-bold mb-2">$50-200</div>
                  <p className="text-lg mb-4">per month per section</p>
                  <p className="text-red-100 text-sm mb-6">
                    Pay only for what you use. Most stores save more in waste reduction than the entire platform costs.
                  </p>
                  <Button
                    size="lg"
                    className="bg-white hover:bg-white/90 text-[#E51636] font-bold shadow-lg transition-all duration-300 hover:scale-105 w-full"
                    onClick={() => navigate('/register')}
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
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
            Ready for a Platform Built <span className="underline decoration-red-300">Specifically</span> for Restaurants?
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
                  className="bg-[#E51636] border-white text-white hover:bg-[#E51636]/90 transition-all duration-300 h-14 text-lg"
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