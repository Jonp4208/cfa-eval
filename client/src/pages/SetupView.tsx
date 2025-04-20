import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { DailyView } from '@/components/setup-sheet/DailyView'
import { useSetupSheetStore } from '@/stores/setupSheetStore'
import { useToast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, ChevronRight, Home } from 'lucide-react'
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
      {/* Enhanced header with breadcrumb and title */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        {/* Breadcrumb navigation */}
        <nav className="flex flex-wrap items-center text-sm text-gray-500 gap-1 mb-2">
          <Link to="/" className="flex items-center hover:text-red-600">
            <Home className="h-4 w-4 mr-1" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link to="/saved-setups" className="hover:text-red-600">Saved Setups</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-red-600 font-medium">View Setup</span>
        </nav>

        {/* Title and date */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h1 className="text-2xl font-bold text-red-600">{setup.name}</h1>

          {setup.startDate && (
            <div className="flex items-center">
              <span className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-200 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {format(new Date(setup.startDate), 'MMM d')} - {format(new Date(setup.endDate), 'MMM d, yyyy')}
                <span className="ml-1 text-red-400">(Sun - Sat)</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <DailyView setup={setup} onBack={handleBack} />
    </div>
  )
}
