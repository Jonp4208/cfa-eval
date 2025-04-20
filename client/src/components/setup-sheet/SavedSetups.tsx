import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Calendar, Trash2, Edit, Eye, Share2, User, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { useSetupSheetStore } from '@/stores/setupSheetStore'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function SavedSetups({ onSelectSetup }: { onSelectSetup: (setupId: string) => void }) {
  const navigate = useNavigate()
  const { weeklySetups, fetchWeeklySetups, deleteWeeklySetup, isLoading } = useSetupSheetStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [setupToDelete, setSetupToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchWeeklySetups()
  }, [fetchWeeklySetups])

  const filteredSetups = weeklySetups.filter(setup =>
    setup.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteSetup = async () => {
    if (!setupToDelete) return

    try {
      console.log('Attempting to delete setup:', setupToDelete)
      await deleteWeeklySetup(setupToDelete)

      // Refresh the list after successful deletion
      await fetchWeeklySetups()

      toast({
        title: 'Success',
        description: 'Weekly setup deleted successfully'
      })
      setSetupToDelete(null)
    } catch (err) {
      console.error('Error deleting setup:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete weekly setup',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search setups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-full sm:w-[250px]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading saved setups...</div>
      ) : filteredSetups.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Saved Setups Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create your first weekly setup to get started with scheduling your employees.
            </p>
            <Button onClick={() => navigate('/setup-sheet-builder')}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Setup
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSetups.map(setup => (
            <Card key={setup._id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="bg-gray-50 border-b pb-3 px-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-lg">{setup.name}</h3>
                  </div>
                  {setup.isShared && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 flex items-center gap-1">
                      <Share2 className="h-3 w-3" />
                      Shared
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(setup.startDate), 'MMM d')} - {format(new Date(setup.endDate), 'MMM d, yyyy')}
                  <span className="ml-1 text-xs text-gray-400">
                    (Sun - Sat)
                  </span>
                </p>
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-500">Assigned positions:</p>
                    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                      {countAssignedPositions(setup)} Positions
                    </Badge>
                  </div>

                  {setup.isShared && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span>Created by {setup.user?.name || 'Unknown'}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    onClick={() => onSelectSetup(setup._id)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>

                  <AlertDialog
                    open={setupToDelete === setup._id}
                    onOpenChange={(open) => {
                      if (!open) setSetupToDelete(null)
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        onClick={() => setSetupToDelete(setup._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the weekly setup "{setup.name}".
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSetup} className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper function to count assigned positions in a setup
function countAssignedPositions(setup: any) {
  let count = 0

  // Check if weekSchedule exists
  if (!setup?.weekSchedule) {
    console.warn('Setup is missing weekSchedule:', setup);
    return 0;
  }

  try {
    Object.values(setup.weekSchedule).forEach((day: any) => {
      // Check if day and timeBlocks exist
      if (!day || !day.timeBlocks) {
        console.warn('Day is missing timeBlocks:', day);
        return; // Skip this day
      }

      day.timeBlocks.forEach((block: any) => {
        // Check if block and positions exist
        if (!block || !block.positions) {
          console.warn('Block is missing positions:', block);
          return; // Skip this block
        }

        block.positions.forEach((position: any) => {
          if (position?.employeeId) count++
        })
      })
    })
  } catch (error) {
    console.error('Error counting assigned positions:', error);
    return 0;
  }

  return count
}
