import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { useSnackbar } from 'notistack'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DatePicker } from '@/components/ui/date-picker'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Thermometer, 
  ThermometerSun, 
  ThermometerSnowflake,
  ArrowLeft,
  Calendar,
  Filter,
  Search,
  X
} from 'lucide-react'
import { kitchenService, TemperatureLog } from '@/services/kitchenService'
import PageHeader from '@/components/PageHeader'
import { cn } from '@/lib/utils'

const TemperatureHistory: React.FC = () => {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<TemperatureLog[]>([])
  const [groupedLogs, setGroupedLogs] = useState<Record<string, TemperatureLog[]>>({})
  
  // Filter states
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  
  // View states
  const [viewMode, setViewMode] = useState<'list' | 'location'>('list')
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      setLoading(true)
      
      const response = await kitchenService.getTemperatureLogs({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        location: selectedLocation && selectedLocation !== 'all' ? selectedLocation : undefined,
        type: selectedType && selectedType !== 'all' ? (selectedType as 'equipment' | 'product') : undefined
      })
      
      setLogs(response.logs)
      setGroupedLogs(response.groupedLogs)
    } catch (error) {
      console.error('Error loading temperature logs:', error)
      enqueueSnackbar('Failed to load temperature logs', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }
  
  const handleFilter = () => {
    loadData()
  }
  
  const handleClearFilters = () => {
    setStartDate(subDays(new Date(), 7))
    setEndDate(new Date())
    setSelectedLocation('all')
    setSelectedType('all')
    setSelectedStatus('all')
    setSearchTerm('')
    loadData()
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'fail':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <ThermometerSun className="h-4 w-4 text-green-600" />
      case 'warning':
        return <Thermometer className="h-4 w-4 text-yellow-600" />
      case 'fail':
        return <ThermometerSnowflake className="h-4 w-4 text-red-600" />
      default:
        return <Thermometer className="h-4 w-4 text-gray-600" />
    }
  }
  
  const filteredLogs = logs.filter(log => {
    if (selectedStatus && selectedStatus !== 'all' && log.status !== selectedStatus) return false
    if (searchTerm && !log.location.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Temperature Log History"
        description="View and filter temperature logs"
        actions={
          <Button
            onClick={() => navigate('/kitchen/food-safety')}
            variant="outline"
            className="h-9 gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Food Safety
          </Button>
        }
      />
      
      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <DatePicker
                id="startDate"
                date={startDate}
                setDate={setStartDate}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <DatePicker
                id="endDate"
                date={endDate}
                setDate={setEndDate}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {Object.keys(groupedLogs).map(location => (
                    <SelectItem key={location} value={location}>
                      {location.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="fail">Fail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Search locations..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleFilter} className="flex-1">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* View Selector */}
      <div className="flex justify-center">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'location')} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="location">Location View</TabsTrigger>
          </TabsList>
          
          {/* List View */}
          <TabsContent value="list" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Temperature Logs</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading temperature logs...</div>
                ) : filteredLogs.length === 0 ? (
                  <div className="text-center py-8">No temperature logs found for the selected filters.</div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {filteredLogs.map(log => {
                        const locationName = log.location.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')
                        
                        return (
                          <div key={log.id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(log.status)}
                                <div>
                                  <h4 className="font-medium">{locationName}</h4>
                                  <p className="text-sm text-gray-500">
                                    {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-xl font-medium">{log.value}°F</div>
                                <Badge className={getStatusColor(log.status)}>
                                  {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            {log.notes && (
                              <div className="mt-2 text-sm bg-white p-2 rounded border">
                                <span className="font-medium">Notes:</span> {log.notes}
                              </div>
                            )}
                            <div className="mt-2 text-xs text-gray-500">
                              Recorded by: {log.recordedBy}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Location View */}
          <TabsContent value="location" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <div className="text-center py-8 col-span-2">Loading temperature logs...</div>
              ) : Object.keys(groupedLogs).length === 0 ? (
                <div className="text-center py-8 col-span-2">No temperature logs found for the selected filters.</div>
              ) : (
                Object.entries(groupedLogs)
                  .filter(([location]) => {
                    if (selectedLocation && selectedLocation !== 'all' && location !== selectedLocation) return false
                    if (searchTerm && !location.toLowerCase().includes(searchTerm.toLowerCase())) return false
                    return true
                  })
                  .map(([location, locationLogs]) => {
                    const filteredLocationLogs = locationLogs.filter(log => {
                      if (selectedStatus && selectedStatus !== 'all' && log.status !== selectedStatus) return false
                      if (selectedType && selectedType !== 'all' && log.type !== selectedType) return false
                      return true
                    })
                    
                    if (filteredLocationLogs.length === 0) return null
                    
                    const locationName = location.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')
                    
                    return (
                      <Card key={location}>
                        <CardHeader>
                          <CardTitle>{locationName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[300px]">
                            <div className="space-y-3">
                              {filteredLocationLogs.map(log => (
                                <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(log.status)}
                                      <div className="text-lg font-medium">{log.value}°F</div>
                                      <Badge className={getStatusColor(log.status)}>
                                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                                    </div>
                                  </div>
                                  {log.notes && (
                                    <div className="mt-2 text-sm">
                                      <span className="font-medium">Notes:</span> {log.notes}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    )
                  }).filter(Boolean)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default TemperatureHistory 