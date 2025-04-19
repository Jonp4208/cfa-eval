import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SavedSetups as SavedSetupsComponent } from '@/components/setup-sheet/SavedSetups'
import { useSetupSheetStore } from '@/stores/setupSheetStore'

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
    <div className="container mx-auto p-4 pb-20 sm:pb-4">
      <SavedSetupsComponent onSelectSetup={handleSelectSetup} />
    </div>
  )
}
