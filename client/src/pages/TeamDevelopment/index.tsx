import React from 'react'
import { Outlet } from 'react-router-dom'

const TeamDevelopment: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}

export default TeamDevelopment
