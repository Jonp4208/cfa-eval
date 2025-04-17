'use client'

import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import useWasteStore from '@/stores/useWasteStore'
import WasteEntryForm from './WasteEntryForm'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface WasteListProps {
  date: string
}

export default function WasteList({ date }: WasteListProps) {
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const { entries, deleteWasteEntry, isLoading } = useWasteStore()

  const handleDelete = async () => {
    if (!selectedEntry) return
    try {
      await deleteWasteEntry(selectedEntry)
    } finally {
      setSelectedEntry(null)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground mb-4">
          No waste entries found for {format(new Date(date), 'MMMM d, yyyy')}
        </p>
        <WasteEntryForm />
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Action Taken</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry._id}>
                <TableCell>{format(new Date(entry.date), 'h:mm a')}</TableCell>
                <TableCell className="capitalize">{entry.category}</TableCell>
                <TableCell>{entry.itemName}</TableCell>
                <TableCell>
                  {entry.quantity} {entry.unit}
                </TableCell>
                <TableCell>${entry.cost.toFixed(2)}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={entry.reason}>
                  {entry.reason}
                </TableCell>
                <TableCell
                  className="max-w-[200px] truncate"
                  title={entry.actionTaken}
                >
                  {entry.actionTaken}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        disabled={isLoading}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setEditingEntry(entry._id)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setSelectedEntry(entry._id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingEntry && (
        <WasteEntryForm
          entry={entries.find((e) => e._id === editingEntry)}
          onSuccess={() => setEditingEntry(null)}
        />
      )}

      <AlertDialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the waste
              entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 