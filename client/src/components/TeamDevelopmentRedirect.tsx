import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const TeamDevelopmentRedirect: React.FC = () => {
  const { user } = useAuth()

  // Redirect based on user role
  if (user?.position === 'Team Member') {
    return <Navigate to="/team-development/my-plans" replace />
  } else {
    return <Navigate to="/team-development/overview" replace />
  }
}

export default TeamDevelopmentRedirect
