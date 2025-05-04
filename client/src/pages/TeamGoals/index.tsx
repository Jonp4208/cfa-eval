import {
  ArrowLeft,
  Target
} from 'lucide-react'
import { TeamGoalsView } from '@/components/team-goals/TeamGoalsView'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function TeamGoalsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Store Goals Header - Kitchen Style */}
        <div className="bg-gradient-to-br from-[#E51636] to-[#D01530] rounded-[20px] p-4 md:p-6 text-white shadow-md">
          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight">Store Goals</h1>
                  <p className="text-white/90 text-sm md:text-base">Track and manage goals across all operational areas</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                  CFA #{user?.store?.storeNumber || '00727'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              <button
                className="bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm w-full sm:w-auto"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back Home</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <TeamGoalsView />
      </div>
    </div>
  )
}