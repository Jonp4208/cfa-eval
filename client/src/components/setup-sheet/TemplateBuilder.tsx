import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Plus, Trash2, Save, Copy } from 'lucide-react'
import { TimePicker } from '@/components/ui/time-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggablePosition } from './DraggablePosition'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom'
import { useSetupSheetStore } from '@/stores/setupSheetStore'

interface Position {
  id: string
  name: string
  category: string
  section: 'FOH' | 'BOH'
  color: string
  count: number
  employeeId?: string
}

interface TimeBlock {
  id: string
  start: string
  end: string
  positions: Position[]
}

interface DaySchedule {
  timeBlocks: TimeBlock[]
}

interface WeekSchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

interface Template {
  _id?: string
  name: string
  weekSchedule: WeekSchedule
}

interface TemplateBuilderProps {
  initialTemplate?: Template
  onSave?: (template: Template) => void
}

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const

const FORMATTED_DAYS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
}

export function TemplateBuilder({ initialTemplate, onSave }: TemplateBuilderProps) {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { createTemplate, updateTemplate } = useSetupSheetStore()
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>(
    initialTemplate?.weekSchedule || {
      monday: { timeBlocks: [] },
      tuesday: { timeBlocks: [] },
      wednesday: { timeBlocks: [] },
      thursday: { timeBlocks: [] },
      friday: { timeBlocks: [] },
      saturday: { timeBlocks: [] },
      sunday: { timeBlocks: [] }
    }
  )
  const [newPosition, setNewPosition] = useState<Partial<Position>>({
    name: '',
    section: 'FOH',
    category: 'Front Counter'
  })
  const [activeTab, setActiveTab] = useState<'FC' | 'DT' | 'Kitchen'>('FC')
  const [activeDay, setActiveDay] = useState<typeof DAYS[number]>('monday')
  const [templateName, setTemplateName] = useState(initialTemplate?.name || '')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const addTimeBlock = (day: typeof DAYS[number]) => {
    const newBlock: TimeBlock = {
      id: crypto.randomUUID(),
      start: '06:00',
      end: '07:00',
      positions: []
    }
    setWeekSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeBlocks: [...prev[day].timeBlocks, newBlock]
      }
    }))
  }

  const updateTimeBlock = (day: typeof DAYS[number], id: string, field: 'start' | 'end', value: string) => {
    setWeekSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeBlocks: prev[day].timeBlocks.map(block =>
          block.id === id ? { ...block, [field]: value } : block
        )
      }
    }))
  }

  const addPosition = (day: typeof DAYS[number], timeBlockId: string) => {
    if (!newPosition.name) return

    // Map the active tab to the correct category and section
    let category: string;
    let section: string;

    if (activeTab === 'FC') {
      category = 'Front Counter';
      section = 'FOH';
    } else if (activeTab === 'DT') {
      category = 'Drive Thru';
      section = 'FOH';
    } else { // Kitchen
      category = 'Kitchen';
      section = 'BOH';
    }

    const position: Position = {
      id: crypto.randomUUID(),
      name: newPosition.name,
      category,
      section,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      count: 1
    }

    setWeekSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeBlocks: prev[day].timeBlocks.map(block =>
          block.id === timeBlockId
            ? { ...block, positions: [...block.positions, position] }
            : block
        )
      }
    }))

    // Reset the position name but keep the current tab's section
    setNewPosition({
      name: '',
      section: activeTab === 'Kitchen' ? 'Kitchen' : activeTab === 'FC' ? 'FOH' : 'DT'
    })
  }

  const removePosition = (day: typeof DAYS[number], timeBlockId: string, positionId: string) => {
    setWeekSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeBlocks: prev[day].timeBlocks.map(block =>
          block.id === timeBlockId
            ? { ...block, positions: block.positions.filter(p => p.id !== positionId) }
            : block
        )
      }
    }))
  }

  const handleDragEnd = (day: typeof DAYS[number], timeBlockId: string, category: string, event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setWeekSchedule(prev => {
        const timeBlock = prev[day].timeBlocks.find(block => block.id === timeBlockId)
        if (!timeBlock) return prev

        // Filter positions by category to get the correct subset
        const positionsInCategory = timeBlock.positions.filter(p => p.category === category)

        // Find the indices within this filtered array
        const oldIndex = positionsInCategory.findIndex(p => p.id === active.id)
        const newIndex = positionsInCategory.findIndex(p => p.id === over.id)

        if (oldIndex === -1 || newIndex === -1) return prev

        // Reorder the positions within the category
        const reorderedPositions = arrayMove(positionsInCategory, oldIndex, newIndex)

        // Create a new array with all positions, replacing the ones in this category
        const updatedPositions = [
          ...timeBlock.positions.filter(p => p.category !== category),
          ...reorderedPositions
        ]

        return {
          ...prev,
          [day]: {
            ...prev[day],
            timeBlocks: prev[day].timeBlocks.map(block =>
              block.id === timeBlockId
                ? { ...block, positions: updatedPositions }
                : block
            )
          }
        }
      })
    }
  }

  const removeTimeBlock = (day: typeof DAYS[number], id: string) => {
    setWeekSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeBlocks: prev[day].timeBlocks.filter(block => block.id !== id)
      }
    }))
  }

  const getPositionsBySection = (block: TimeBlock, section: 'Front Counter' | 'Drive Thru' | 'Kitchen') => {
    return block.positions.filter(position => position.category === section)
  }

  const copyDaySchedule = (fromDay: typeof DAYS[number], toDays: typeof DAYS[number][]) => {
    setWeekSchedule(prev => {
      const newSchedule = { ...prev }
      toDays.forEach(toDay => {
        newSchedule[toDay] = {
          timeBlocks: prev[fromDay].timeBlocks.map(block => ({
            ...block,
            id: crypto.randomUUID(),
            positions: block.positions.map(position => ({
              ...position,
              id: crypto.randomUUID()
            }))
          }))
        }
      })
      return newSchedule
    })
  }

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive"
      })
      return
    }

    const hasTimeBlocks = Object.values(weekSchedule).some(
      day => day.timeBlocks.length > 0
    )

    if (!hasTimeBlocks) {
      toast({
        title: "Error",
        description: "Please add at least one time block",
        variant: "destructive"
      })
      return
    }

    try {
      const templateData = {
        name: templateName.trim(),
        weekSchedule: Object.fromEntries(
          Object.entries(weekSchedule).map(([day, schedule]) => [
            day,
            {
              timeBlocks: schedule.timeBlocks.map(block => ({
                id: block.id,
                start: block.start,
                end: block.end,
                positions: block.positions.map(pos => ({
                  id: pos.id,
                  name: pos.name,
                  category: pos.category,
                  section: pos.section,
                  color: pos.color,
                  count: pos.count
                }))
              }))
            }
          ])
        )
      }

      console.log('Sending template data:', templateData)

      // If onSave is provided, use it (for the SetupSheetBuilder component)
      if (onSave) {
        console.log('Calling onSave with template data:', templateData);
        onSave(templateData as Template);
        setShowSaveDialog(false);
        return;
      }

      // Otherwise use the store functions (for the template management page)
      if (initialTemplate?._id) {
        await updateTemplate(initialTemplate._id, templateData)
        toast({
          title: "Success",
          description: "Template updated successfully"
        })
      } else {
        await createTemplate(templateData)
        toast({
          title: "Success",
          description: "Template created successfully"
        })
      }

      setShowSaveDialog(false)
      navigate('/setup-sheet-templates')
    } catch (error) {
      console.error('Save template error:', error)

      // Check if it's a duplicate template name error
      if (error instanceof Error && error.message.includes('DUPLICATE_TEMPLATE_NAME')) {
        toast({
          title: "Error",
          description: "A template with this name already exists. Please choose a different name.",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save template",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4 mb-2">
        <h2 className="text-xl font-semibold text-gray-800">Configure Your Template</h2>
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Template</DialogTitle>
              <DialogDescription>
                Give your template a name to save it.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Standard Week Schedule"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Select a day to configure:</h3>
      </div>

      <Tabs value={activeDay} onValueChange={(value) => setActiveDay(value as typeof DAYS[number])}>
        <TabsList className="w-full grid grid-cols-7 bg-white border border-gray-200 mb-6">
          {DAYS.map(day => (
            <TabsTrigger
              key={day}
              value={day}
              className="flex-1 data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:shadow-none"
            >
              {FORMATTED_DAYS[day]}
            </TabsTrigger>
          ))}
        </TabsList>

        {DAYS.map(day => (
          <TabsContent key={day} value={day}>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-red-600">{FORMATTED_DAYS[day]} Time Blocks</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50">
                        <Copy className="h-4 w-4 mr-2 text-gray-500" />
                        Copy to Days
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Select Days to Copy to</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {DAYS.filter(d => d !== day).map(targetDay => (
                        <DropdownMenuItem
                          key={targetDay}
                          onClick={() => copyDaySchedule(day, [targetDay])}
                        >
                          {FORMATTED_DAYS[targetDay]}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => copyDaySchedule(day, DAYS.filter(d => d !== day))}
                      >
                        All Other Days
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Button
                  onClick={() => addTimeBlock(day)}
                  variant="outline"
                  size="sm"
                  className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Block
                </Button>
              </div>

              <div className="space-y-4">
                {weekSchedule[day].timeBlocks.map((block) => (
                  <Card key={block.id} className="p-4 shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-4 mb-4 bg-gray-50 p-3 -mx-4 -mt-4 mb-6 border-b">
                      <div className="flex-1">
                        <Label className="text-gray-500 text-xs mb-1 block">Start Time</Label>
                        <TimePicker
                          value={block.start}
                          onChange={(value) => updateTimeBlock(day, block.id, 'start', value)}
                          className="bg-white"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-gray-500 text-xs mb-1 block">End Time</Label>
                        <TimePicker
                          value={block.end}
                          onChange={(value) => updateTimeBlock(day, block.id, 'end', value)}
                          className="bg-white"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeTimeBlock(day, block.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <Tabs defaultValue="FC" onValueChange={(value) => setActiveTab(value as 'FC' | 'DT' | 'Kitchen')}>
                        <TabsList className="grid w-full grid-cols-3 bg-gray-50 border border-gray-200">
                          <TabsTrigger
                            value="FC"
                            className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-none"
                          >
                            Front Counter
                          </TabsTrigger>
                          <TabsTrigger
                            value="DT"
                            className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-none"
                          >
                            Drive-Thru
                          </TabsTrigger>
                          <TabsTrigger
                            value="Kitchen"
                            className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-none"
                          >
                            Kitchen
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="FC">
                          <div className="space-y-4 pt-4">
                            <h4 className="font-medium text-gray-700 flex items-center gap-2">
                              <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                              Front Counter Positions
                            </h4>
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(event) => handleDragEnd(day, block.id, 'Front Counter', event)}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <SortableContext
                                  items={getPositionsBySection(block, 'Front Counter').map(p => p.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {getPositionsBySection(block, 'Front Counter').map((position) => (
                                    <DraggablePosition
                                      key={position.id}
                                      position={position}
                                      onRemove={() => removePosition(day, block.id, position.id)}
                                    />
                                  ))}
                                </SortableContext>
                              </div>
                            </DndContext>
                          </div>
                        </TabsContent>

                        <TabsContent value="DT">
                          <div className="space-y-4 pt-4">
                            <h4 className="font-medium text-gray-700 flex items-center gap-2">
                              <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                              Drive-Thru Positions
                            </h4>
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(event) => handleDragEnd(day, block.id, 'Drive Thru', event)}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <SortableContext
                                  items={getPositionsBySection(block, 'Drive Thru').map(p => p.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {getPositionsBySection(block, 'Drive Thru').map((position) => (
                                    <DraggablePosition
                                      key={position.id}
                                      position={position}
                                      onRemove={() => removePosition(day, block.id, position.id)}
                                    />
                                  ))}
                                </SortableContext>
                              </div>
                            </DndContext>
                          </div>
                        </TabsContent>

                        <TabsContent value="Kitchen">
                          <div className="space-y-4 pt-4">
                            <h4 className="font-medium text-gray-700 flex items-center gap-2">
                              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                              Kitchen Positions
                            </h4>
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(event) => handleDragEnd(day, block.id, 'Kitchen', event)}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <SortableContext
                                  items={getPositionsBySection(block, 'Kitchen').map(p => p.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {getPositionsBySection(block, 'Kitchen').map((position) => (
                                    <DraggablePosition
                                      key={position.id}
                                      position={position}
                                      onRemove={() => removePosition(day, block.id, position.id)}
                                    />
                                  ))}
                                </SortableContext>
                              </div>
                            </DndContext>
                          </div>
                        </TabsContent>
                      </Tabs>

                      <div className="pt-4 mt-4 border-t border-dashed">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <Label className="text-gray-500 text-sm mb-2 block font-medium">Add New Position</Label>
                          <div className="flex gap-2">
                            <Input
                              value={newPosition.name}
                              onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
                              placeholder="e.g., Cashier"
                              className="flex-1 border-gray-300"
                            />
                            <Button
                              onClick={() => addPosition(day, block.id)}
                              disabled={!newPosition.name}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Position
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}