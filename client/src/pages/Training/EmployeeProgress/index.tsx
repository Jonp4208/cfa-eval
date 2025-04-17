import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Filter, Search } from 'lucide-react'

export default function EmployeeProgress() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search employees..."
            className="w-[300px]"
            icon={<Search className="h-4 w-4" />}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>All Employees</DropdownMenuItem>
              <DropdownMenuItem>In Training</DropdownMenuItem>
              <DropdownMenuItem>Completed</DropdownMenuItem>
              <DropdownMenuItem>Not Started</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Current Plan</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>John Smith</TableCell>
                <TableCell>Team Member</TableCell>
                <TableCell>New Hire Orientation</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#E51636] rounded-full" style={{ width: '75%' }} />
                    </div>
                    <span>75%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    In Progress
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost">View Details</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sarah Johnson</TableCell>
                <TableCell>Kitchen Staff</TableCell>
                <TableCell>Food Safety Certification</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#E51636] rounded-full" style={{ width: '90%' }} />
                    </div>
                    <span>90%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    In Progress
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost">View Details</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Mike Wilson</TableCell>
                <TableCell>Shift Leader</TableCell>
                <TableCell>Leadership Development</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#E51636] rounded-full" style={{ width: '100%' }} />
                    </div>
                    <span>100%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Completed
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost">View Details</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 