import React, { useState } from 'react'
import { format, isValid, parseISO } from 'date-fns'
import { 
  AlertCircle, 
  Clock, 
  History, 
  Wrench, 
  Brush, 
  CheckCircle, 
  User,
  CalendarClock,
  MessageSquare
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SimpleProgress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface Issue {
  id: string
  severity: 'low' | 'medium' | 'high'
  description: string
  createdAt: string
}

export interface EquipmentUpdate {
  id: string
  type: 'maintenance' | 'repair' | 'cleaning'
  status: 'completed' | 'in-progress' | 'scheduled'
  description: string
  timestamp: string
  performedBy?: {
    id: string
    name: string
  }
  estimatedCompletion?: string
}

export interface EquipmentDetails {
  id: string
  name: string
  model?: string
  serialNumber?: string
  purchaseDate?: string
  lastServiced?: string
  nextScheduledMaintenance?: string
  status: 'operational' | 'maintenance' | 'repair' | 'offline' | 'broken'
  issues: Issue[]
  updates: EquipmentUpdate[]
  maintenanceInterval: number
  uptimePercentage?: number
}

interface EquipmentCardProps {
  equipment: EquipmentDetails
  onViewHistory: (equipmentId: string) => void
  onAddCleaning: (equipmentId: string) => void
  onMarkAsFixed: (equipmentId: string) => void
  onRequestService: (equipmentId: string) => void
  onAddIssue: (equipmentId: string) => void
  onAssignTo: (equipmentId: string, userId: string) => void
  onAddPhoto: (equipmentId: string) => void
}

const severityColors = {
  low: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  medium: 'bg-orange-100 text-orange-700 border-orange-200',
  high: 'bg-red-100 text-red-700 border-red-200'
}

const statusConfig = {
  operational: { 
    label: 'Operational',
    color: 'bg-green-100 text-green-700 border-green-200' 
  },
  maintenance: { 
    label: 'Maintenance', 
    color: 'bg-blue-100 text-blue-700 border-blue-200' 
  },
  repair: { 
    label: 'Repair Needed', 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200' 
  },
  offline: { 
    label: 'Offline', 
    color: 'bg-gray-100 text-gray-700 border-gray-200' 
  },
  broken: { 
    label: 'Broken', 
    color: 'bg-red-100 text-red-700 border-red-200' 
  }
}

// Add a helper function to safely format dates
const safeFormatDate = (dateString: string | undefined, formatString: string): string => {
  if (!dateString) return 'Not available';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export function EquipmentCard({
  equipment,
  onViewHistory,
  onAddCleaning,
  onMarkAsFixed,
  onRequestService,
  onAddIssue,
  onAssignTo,
  onAddPhoto
}: EquipmentCardProps) {
  const { 
    id, 
    name, 
    model, 
    status, 
    issues, 
    updates, 
    maintenanceInterval,
    uptimePercentage = 95,
    lastServiced,
    nextScheduledMaintenance
  } = equipment
  
  const statusInfo = statusConfig[status]
  const latestUpdate = updates.length > 0 ? updates[0] : null
  
  // Add state for the issue dialog
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [issueDialogOpen, setIssueDialogOpen] = useState(false)
  
  // Function to handle issue click
  const handleIssueClick = (issue: Issue, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIssue(issue)
    setIssueDialogOpen(true)
  }
  
  return (
    <>
      <Card className={cn(
        "overflow-hidden transition-all duration-300 rounded-[20px] shadow-sm hover:shadow-md border",
        status === 'broken' ? "bg-red-50 border-red-200" : "bg-white border-gray-200"
      )}>
        {/* Equipment Header */}
        <div className="p-6">
          <div className="flex flex-col space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
              <Badge 
                className={`px-4 py-1.5 ${statusInfo.color} rounded-full font-medium flex items-center gap-1.5`}
              >
                <CheckCircle className="h-4 w-4" />
                <span>{statusInfo.label}</span>
              </Badge>
            </div>

            {model && (
              <div className="text-sm text-gray-500">
                Model: {model}
              </div>
            )}
            
            {/* Equipment Stats */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1.5">Uptime</span>
                <div className="flex items-center space-x-2">
                  <SimpleProgress value={uptimePercentage} className="h-2" />
                  <span className="text-sm font-medium">{uptimePercentage}%</span>
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1.5">Next Maintenance</span>
                <span className="text-sm font-medium">
                  {nextScheduledMaintenance ? safeFormatDate(nextScheduledMaintenance, 'MMM d, yyyy') : 'Not scheduled'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Issues Section */}
        {issues.length > 0 && (
          <div className="p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h4 className="font-medium text-gray-900">Issues ({issues.length})</h4>
            </div>
            
            <div className="space-y-3">
              {issues.map((issue) => (
                <div 
                  key={issue.id} 
                  className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={(e) => handleIssueClick(issue, e)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={`${severityColors[issue.severity]}`}>
                      {issue.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {safeFormatDate(issue.createdAt, 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-800 font-medium">{issue.description}</p>
                    <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Recent Update */}
        {latestUpdate && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium text-gray-900">Recent Update</h4>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <Badge className={
                  latestUpdate.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                  latestUpdate.status === 'in-progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  'bg-yellow-100 text-yellow-700 border-yellow-200'
                }>
                  {latestUpdate.status}
                </Badge>
                <span className="text-xs text-gray-500">
                  {safeFormatDate(latestUpdate.timestamp, 'MMM d, h:mm a')}
                </span>
              </div>
              
              <p className="text-sm text-gray-800 mb-2 font-medium">{latestUpdate.description}</p>
              
              {latestUpdate.performedBy && (
                <div className="flex items-center text-xs text-gray-600 mt-2">
                  <User className="h-3 w-3 mr-1" />
                  <span>{latestUpdate.performedBy.name}</span>
                </div>
              )}
              
              {latestUpdate.estimatedCompletion && (
                <div className="flex items-center text-xs text-gray-600 mt-1">
                  <CalendarClock className="h-3 w-3 mr-1" />
                  <span>Est. completion: {safeFormatDate(latestUpdate.estimatedCompletion, 'MMM d')}</span>
                </div>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 text-sm text-gray-600"
              onClick={() => onViewHistory(id)}
            >
              <History className="h-4 w-4 mr-1" />
              View History
            </Button>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-4">
            <Button 
              variant="outline" 
              className="flex-1 h-12 flex items-center justify-center gap-2 font-medium text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 rounded-[12px]"
              onClick={() => onAddCleaning(id)}
            >
              <Brush className="h-4 w-4" />
              <span>Add Cleaning</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1 h-12 flex items-center justify-center gap-2 font-medium text-gray-700 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-[12px]"
              onClick={() => onMarkAsFixed(id)}
            >
              <AlertCircle className="h-4 w-4" />
              <span>Mark as Broken</span>
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Issue Detail Dialog */}
      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className={cn(
                "h-5 w-5",
                selectedIssue?.severity === 'high' ? "text-red-500" :
                selectedIssue?.severity === 'medium' ? "text-orange-500" : "text-yellow-500"
              )} />
              <DialogTitle className="text-xl font-semibold">Issue Details</DialogTitle>
            </div>
          </DialogHeader>
          
          {selectedIssue && (
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start">
                  <Badge className={`${severityColors[selectedIssue.severity]} px-3 py-1`}>
                    {selectedIssue.severity.toUpperCase()} SEVERITY
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Reported on {safeFormatDate(selectedIssue.createdAt, 'PPP')}
                  </span>
                </div>
                
                <h3 className="text-lg font-medium mt-4 text-gray-900">{selectedIssue.description}</h3>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recommended Actions:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {selectedIssue.severity === 'high' ? (
                      <>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span>Immediate attention required - equipment may be unsafe to operate</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span>Request service immediately using the "Request Service" button</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span>Notify all staff of the issue and place "Out of Order" sign</span>
                        </li>
                      </>
                    ) : selectedIssue.severity === 'medium' ? (
                      <>
                        <li className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span>Schedule service within the next 24-48 hours</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span>Monitor equipment during use and report any changes</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          <span>Schedule routine maintenance when convenient</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          <span>Document issue in maintenance log</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIssueDialogOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                onRequestService(id)
                setIssueDialogOpen(false)
              }}
            >
              Request Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 