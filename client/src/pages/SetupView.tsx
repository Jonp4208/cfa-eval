import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { DailyView } from '@/components/setup-sheet/DailyView'
import { useSetupSheetStore } from '@/stores/setupSheetStore'
import { useToast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ChevronRight, Home, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'

export function SetupView() {
  const { setupId } = useParams<{ setupId: string }>()
  const navigate = useNavigate()
  const { weeklySetups, fetchWeeklySetups, updateWeeklySetup, isLoading } = useSetupSheetStore()
  const [setup, setSetup] = useState<any>(null)
  const [isShared, setIsShared] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  // Check if user can edit this setup (creator or Leader/Director)
  const [canEdit, setCanEdit] = useState(false)

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
        setIsShared(foundSetup.isShared || false)

        // Check if user can edit this setup
        const isCreator = foundSetup.user?._id === user?._id
        const isLeaderOrDirector = user?.position === 'Leader' || user?.position === 'Director'
        setCanEdit(isCreator || isLeaderOrDirector)
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
  }, [setupId, weeklySetups, fetchWeeklySetups, navigate, toast, user])

  const handleBack = () => {
    navigate('/saved-setups')
  }

  const handleShareToggle = async (shared: boolean) => {
    if (!setupId || !setup) return

    try {
      setIsShared(shared)
      await updateWeeklySetup(setupId, { isShared: shared })

      toast({
        title: shared ? 'Setup shared with store' : 'Setup is now private',
        description: shared
          ? 'All users in your store can now view this setup'
          : 'Only you can view this setup now',
        variant: 'default'
      })

      // Update the local setup object
      setSetup({ ...setup, isShared: shared })
    } catch (error) {
      // Revert the UI state if the API call fails
      setIsShared(!shared)

      toast({
        title: 'Error',
        description: 'Failed to update sharing settings',
        variant: 'destructive'
      })
    }
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

        {/* Title and date - improved design */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">{setup.name}</h1>
            {setup.startDate && (
              <div className="flex items-center">
                <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-md border border-blue-200 flex items-center font-medium">
                  {format(new Date(setup.startDate), 'MMM d')} - {format(new Date(setup.endDate), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>

          {/* Share toggle - only visible to creator or Leader/Director */}
          {canEdit ? (
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <Switch
                id="share-setup"
                checked={isShared}
                onCheckedChange={handleShareToggle}
              />
              <Label htmlFor="share-setup" className="flex items-center gap-2 cursor-pointer">
                <Share2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">
                  {isShared ? 'Shared with store' : 'Share with store'}
                </span>
              </Label>
            </div>
          ) : (
            /* For non-editors, just show the shared status */
            isShared && (
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Share2 className="h-4 w-4" />
                  <span className="font-medium">Shared with store</span>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <DailyView setup={setup} onBack={handleBack} />
    </div>
  )
}
