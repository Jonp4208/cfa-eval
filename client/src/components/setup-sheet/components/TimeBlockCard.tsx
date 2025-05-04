import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TimeBlock } from '../types';
import { formatHourTo12Hour } from '../utils/dateUtils';
import PositionCard from './PositionCard';

interface TimeBlockCardProps {
  timeBlock: TimeBlock;
  isCurrent: boolean;
  areaTab: string;
  onAssignPosition: (position: any) => void;
  onRemoveAssignment: (position: any) => void;
  onAddPosition: (timeBlock: TimeBlock) => void;
}

const TimeBlockCard: React.FC<TimeBlockCardProps> = ({ 
  timeBlock, 
  isCurrent, 
  areaTab,
  onAssignPosition,
  onRemoveAssignment,
  onAddPosition
}) => {
  return (
    <Card
      className={`p-3 ${isCurrent ? 'border-blue-200 bg-blue-50' : ''}`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          {isCurrent && <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>}
          <h4 className="text-sm font-medium">{formatHourTo12Hour(timeBlock.start)} - {formatHourTo12Hour(timeBlock.end)}</h4>
        </div>
        <div className="flex items-center gap-2">
          {isCurrent && <Badge className="bg-blue-500 text-white">Current</Badge>}
        </div>
      </div>
      
      <div className="space-y-2">
        {timeBlock.positions.map(position => (
          <PositionCard
            key={position.id}
            position={position}
            onAssign={onAssignPosition}
            onRemove={onRemoveAssignment}
            isServiceArea={areaTab === 'service'}
          />
        ))}
        
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => onAddPosition(timeBlock)}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Position
        </Button>
      </div>
    </Card>
  );
};

export default TimeBlockCard;
