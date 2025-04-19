import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';

interface Position {
  id: string
  name: string
  category: string
  section: 'FOH' | 'BOH'
  color: string
  count: number
  employeeId?: string
}

interface DraggablePositionProps {
  position: Position;
  onRemove: () => void;
}

export function DraggablePosition({ position, onRemove }: DraggablePositionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: position.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: isDragging ? 'relative' : 'static',
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-2 border rounded ${isDragging ? 'bg-blue-50 border-blue-300 shadow-md' : ''}`}
      {...attributes}
    >
      <div className="flex items-center gap-2">
        <div 
          className="cursor-grab touch-manipulation p-1 text-gray-400 hover:text-gray-600"
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium">{position.name}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
