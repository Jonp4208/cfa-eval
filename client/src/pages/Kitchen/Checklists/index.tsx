import React from 'react'
import { KitchenChecklist } from './KitchenChecklist'

export default function Checklists() {

  return (
    <div className="min-h-screen bg-[#F8F8F8] p-3 md:p-6 safe-area-top safe-area-bottom pb-16 md:pb-6">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6">
        <KitchenChecklist />
      </div>
    </div>
  )
}