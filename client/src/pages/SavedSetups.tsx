import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SavedSetups as SavedSetupsComponent } from '@/components/setup-sheet/SavedSetups'
import { useSetupSheetStore } from '@/stores/setupSheetStore'
import { Button } from '@/components/ui/button'
import { Plus, LayoutDashboard, Calendar } from 'lucide-react'

export function SavedSetups() {
  const navigate = useNavigate()
  const { setCurrentWeeklySetup, weeklySetups } = useSetupSheetStore()

  const handleSelectSetup = (setupId: string) => {
    const setup = weeklySetups.find(s => s._id === setupId)
    if (setup) {
      setCurrentWeeklySetup(setup)
      navigate(`/setup-view/${setupId}`)
    }
  }

  return (
    <div className="container mx-auto px-4 pb-20 sm:pb-4 space-y-6">
      {/* Enhanced header with gradient */}
      <div className="bg-gradient-to-br from-[#E51636] to-[#D01530] rounded-[20px] p-4 md:p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Saved Weekly Setups</h1>
            <p className="text-white/90 text-sm md:text-base">View and manage your saved weekly setup sheets</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="bg-white/15 hover:bg-white/25 text-white"
              onClick={() => navigate('/setup-sheet-builder')}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Setup
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate('/setup-sheet-templates')}
        >
          <LayoutDashboard className="w-4 h-4" />
          Templates
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-gray-50 border-gray-200"
          disabled
        >
          <Calendar className="w-4 h-4 text-red-600" />
          Saved Setups
        </Button>
      </div>

      <SavedSetupsComponent onSelectSetup={handleSelectSetup} />
    </div>
  )
}
