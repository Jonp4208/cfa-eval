import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Camera, UserPlus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { EquipmentCard, EquipmentDetails, Issue, EquipmentUpdate } from './components/EquipmentCard'

// Example data for the component demonstration
const EXAMPLE_EQUIPMENT: EquipmentDetails = {
  id: 'dt_fry_fryer',
  name: 'DT Fry Fryer',
  model: 'Frymaster 2000',
  serialNumber: 'FRY-123456',
  purchaseDate: '2022-03-15',
  lastServiced: '2023-11-10',
  nextScheduledMaintenance: '2023-06-15',
  status: 'broken',
  maintenanceInterval: 30,
  uptimePercentage: 78,
  issues: [
    {
      id: 'issue-1',
      severity: 'high',
      description: 'Leaking oil from the bottom seal',
      createdAt: '2023-05-01T10:30:00Z'
    }
  ],
  updates: [
    {
      id: 'update-1',
      type: 'repair',
      status: 'in-progress',
      description: 'Mercer ordered the part and will come out and fix',
      timestamp: '2023-05-05T13:58:00Z',
      performedBy: {
        id: 'user-1',
        name: 'Jonathon Pope'
      },
      estimatedCompletion: '2023-05-15T00:00:00Z'
    },
    {
      id: 'update-2',
      type: 'maintenance',
      status: 'completed',
      description: 'Regular maintenance performed, cleaned filters and checked oil quality',
      timestamp: '2023-04-15T11:20:00Z',
      performedBy: {
        id: 'user-2',
        name: 'Alex Johnson'
      }
    },
    {
      id: 'update-3',
      type: 'cleaning',
      status: 'completed',
      description: 'Deep cleaning of all fryer components',
      timestamp: '2023-04-01T09:45:00Z',
      performedBy: {
        id: 'user-3',
        name: 'Maria Garcia'
      }
    }
  ]
}

export default function EquipmentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [equipment, setEquipment] = useState<EquipmentDetails>(EXAMPLE_EQUIPMENT)
  
  // State for dialogs
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [showCleaningDialog, setShowCleaningDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [serviceNotes, setServiceNotes] = useState('')
  
  // Handlers
  const handleGoBack = () => navigate(-1)
  
  const handleViewHistory = (equipmentId: string) => {
    setShowHistoryDialog(true)
  }
  
  const handleAddCleaning = (equipmentId: string) => {
    setShowCleaningDialog(true)
  }
  
  const handleMarkAsFixed = (equipmentId: string) => {
    // Update equipment status
    setEquipment(prev => ({
      ...prev,
      status: 'operational',
      issues: []
    }))
  }
  
  const handleRequestService = (equipmentId: string) => {
    setShowServiceDialog(true)
  }
  
  const handleSubmitService = () => {
    const newUpdate: EquipmentUpdate = {
      id: `update-${Date.now()}`,
      type: 'repair',
      status: 'scheduled',
      description: serviceNotes,
      timestamp: new Date().toISOString()
    }
    
    setEquipment(prev => ({
      ...prev,
      updates: [newUpdate, ...prev.updates]
    }))
    
    setServiceNotes('')
    setShowServiceDialog(false)
  }
  
  const handleAddIssue = (equipmentId: string) => {
    // Logic to add an issue
  }
  
  const handleAssignTo = (equipmentId: string, userId: string) => {
    // Logic to assign to user
  }
  
  const handleAddPhoto = (equipmentId: string) => {
    setShowPhotoDialog(true)
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="text-gray-600 mb-4 -ml-3"
          onClick={handleGoBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Equipment
        </Button>
        
        {/* Extra action buttons */}
        <div className="flex gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            className="text-gray-700 border-gray-200"
            onClick={() => handleAddPhoto(equipment.id)}
          >
            <Camera className="h-4 w-4 mr-1" />
            Add Photo
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="text-gray-700 border-gray-200"
            onClick={() => setShowAssignDialog(true)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Assign To
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="text-gray-700 border-gray-200"
            onClick={() => handleAddIssue(equipment.id)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Issue
          </Button>
        </div>
        
        <EquipmentCard 
          equipment={equipment} 
          onViewHistory={handleViewHistory}
          onAddCleaning={handleAddCleaning}
          onMarkAsFixed={handleMarkAsFixed}
          onRequestService={handleRequestService}
          onAddIssue={handleAddIssue}
          onAssignTo={handleAssignTo}
          onAddPhoto={handleAddPhoto}
        />
      </div>
      
      {/* Service Request Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Service</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="service-notes">Service Notes</Label>
            <Textarea 
              id="service-notes"
              className="mt-2"
              placeholder="Describe the issue and service needed..."
              value={serviceNotes}
              onChange={(e) => setServiceNotes(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowServiceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitService}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* History Dialog - simplified for example */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Equipment History</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 max-h-[70vh] overflow-auto">
            <div className="space-y-4">
              {equipment.updates.map((update) => (
                <div key={update.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium capitalize">{update.type}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(update.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2">{update.description}</p>
                  {update.performedBy && (
                    <p className="text-sm text-gray-600 mt-2">
                      By: {update.performedBy.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowHistoryDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Other dialogs would be implemented similarly */}
    </div>
  )
} 