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
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjggMjggMCAxIDAgNTYgMGEyOCAyOCAwIDEgMCAtNTYgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/5" />
        </div>
        
        <div className="container relative mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="relative z-10 space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Transform Your Restaurant Operations
              </h1>
              <p className="text-xl sm:text-2xl text-red-100">
                The all-in-one platform designed by Chick-fil-A leaders for comprehensive restaurant management, team development, and operational excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  variant="secondary"
                  className="relative z-20 text-[#E51636] hover:text-[#E51636] bg-white hover:bg-white/90"
                  onClick={() => navigate('/register')}
                >
                  Get Started
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
            <Card className="border-2 hover:border-[#E51636] transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-[#E51636]" />
                </div>
                <h3 className="text-xl font-semibold">Leadership Development</h3>
                <p className="text-gray-600">
                  Cultivate strong leaders through structured training and development programs.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E51636]" />
                    Training Programs
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E51636]" />
                    Performance Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E51636]" />
                    Development Plans
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Team Management */}
            <Card className="border-2 hover:border-[#E51636] transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#E51636]" />
                </div>
                <h3 className="text-xl font-semibold">Team Management</h3>
                <p className="text-gray-600">
                  Streamline team operations and maintain high performance standards.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E51636]" />
                    Employee Evaluations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E51636]" />
                    Goal Setting & Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E51636]" />
                    Performance Analytics
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Tools at Your Fingertips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience our intuitive interface designed specifically for Chick-fil-A operations.
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
                  title="Kitchen Management"
                  imageSrc="/kitchen-dashboard.png"
                  alt="Kitchen Management Dashboard showing waste tracking and food safety"
                />
                <ScreenshotCard
                  title="Training Progress"
                  imageSrc="/training-module.png"
                  alt="Training module interface showing employee progress"
                />
                <ScreenshotCard
                  title="Task Management"
                  imageSrc="/task-management.png"
                  alt="Task management system with daily operations tracking"
                />
                <ScreenshotCard
                  title="Store Goals"
                  imageSrc="/store-goals.png"
                  alt="Store goals and performance targets dashboard"
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

      {/* Stats Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#E51636] mb-2">98%</div>
              <p className="text-gray-600">Compliance Rate</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#E51636] mb-2">45%</div>
              <p className="text-gray-600">Waste Reduction</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#E51636] mb-2">2x</div>
              <p className="text-gray-600">Leadership Development</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join leading Chick-fil-A restaurants in achieving operational excellence and developing strong leaders.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg"
              className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
              onClick={() => navigate('/register')}
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="secondary"
              className="bg-[#DD0031] hover:bg-[#DD0031]/90 text-white"
              onClick={() => navigate('/login')}
            >
              Log In
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 