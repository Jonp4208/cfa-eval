import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SavedSetups as SavedSetupsComponent } from '@/components/setup-sheet/SavedSetups'
import { useSetupSheetStore } from '@/stores/setupSheetStore'
import { Button } from '@/components/ui/button'
import { Plus, LayoutDashboard, Calendar } from 'lucide-react'
import PageHeader from '@/components/PageHeader'

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
      {/* Use PageHeader component */}
      <PageHeader
        title="Saved Weekly Setups"
        subtitle="View and manage your saved weekly setup sheets"
        icon={<Calendar className="h-5 w-5" />}
        actions={
          <button
            onClick={() => navigate('/setup-sheet-builder')}
            className="flex-1 sm:flex-none bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Setup</span>
          </button>
        }
      />

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
          className="flex items-center gap-2"
          onClick={() => navigate('/edit-template/new')}
        >
          <Plus className="w-4 h-4" />
          New Template
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
