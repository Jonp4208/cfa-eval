import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Calendar, Trash2, Edit, Eye } from 'lucide-react'
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
      await deleteWeeklySetup(setupToDelete)
      toast({
        title: 'Success',
        description: 'Weekly setup deleted successfully'
      })
      setSetupToDelete(null)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete weekly setup',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Saved Weekly Setups</h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search setups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-[250px]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading saved setups...</div>
      ) : filteredSetups.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No saved setups found</p>
          {searchQuery && (
            <p className="text-sm text-gray-400 mt-2">Try adjusting your search query</p>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSetups.map(setup => (
            <Card key={setup._id} className="p-4 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{setup.name}</h3>
                <Badge variant="outline" className="bg-blue-50">
                  {countAssignedPositions(setup)} Positions
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(setup.startDate), 'MMM d')} - {format(new Date(setup.endDate), 'MMM d, yyyy')}
                  <span className="ml-1 text-xs text-gray-400">
                    (Sun - Sat)
                  </span>
                </span>
              </div>

              <div className="mt-auto pt-4 border-t flex justify-between">
                <Button variant="outline" size="sm" onClick={() => onSelectSetup(setup._id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>

                <AlertDialog open={setupToDelete === setup._id} onOpenChange={(open) => {
                  if (!open) setSetupToDelete(null)
                }}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setSetupToDelete(setup._id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
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
                      <AlertDialogAction onClick={handleDeleteSetup} className="bg-red-500 hover:bg-red-600">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
