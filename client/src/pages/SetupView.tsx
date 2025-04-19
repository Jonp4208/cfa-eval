import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { DailyView } from '@/components/setup-sheet/DailyView'
import { useSetupSheetStore } from '@/stores/setupSheetStore'
import { useToast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight, Home } from 'lucide-react'
import { format } from 'date-fns'

export function SetupView() {
  const { setupId } = useParams<{ setupId: string }>()
  const navigate = useNavigate()
  const { weeklySetups, fetchWeeklySetups, isLoading } = useSetupSheetStore()
  const [setup, setSetup] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadSetup = async () => {
      // If we don't have any setups yet, fetch them
      if (weeklySetups.length === 0) {
        await fetchWeeklySetups()
      }

      // Find the setup with the matching ID
      const foundSetup = weeklySetups.find(s => s._id === setupId)

      if (foundSetup) {
        setSetup(foundSetup)
      } else {
        toast({
          title: 'Error',
          description: 'Setup not found',
          variant: 'destructive'
        })
        navigate('/saved-setups')
      }
    }

    loadSetup()
  }, [setupId, weeklySetups, fetchWeeklySetups, navigate, toast])

  const handleBack = () => {
    navigate('/saved-setups')
  }

  if (isLoading || !setup) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-6 w-60" />
        </div>

        <Skeleton className="h-12 w-full" />

        <div className="space-y-6">
          <Skeleton className="h-8 w-60" />

          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 pb-20 sm:pb-4 space-y-4">
      {/* Breadcrumb navigation */}
      <nav className="flex flex-wrap items-center text-sm text-gray-500 gap-1">
        <Link to="/" className="flex items-center hover:text-gray-800">
          <Home className="h-4 w-4 mr-1" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link to="/saved-setups" className="hover:text-gray-800">Saved Setups</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-gray-900 font-medium">{setup.name}</span>
      </nav>

      {/* Date range badge */}
      {setup.startDate && (
        <div className="flex items-center">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {format(new Date(setup.startDate), 'MMM d')} - {format(new Date(setup.endDate), 'MMM d, yyyy')}
            <span className="ml-1 text-gray-500">(Sun - Sat)</span>
          </span>
        </div>
      )}

      <DailyView setup={setup} onBack={handleBack} />
    </div>
  )
}
