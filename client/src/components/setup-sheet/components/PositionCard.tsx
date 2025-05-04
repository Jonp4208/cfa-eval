import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, X, UserPlus } from 'lucide-react';
import { Position } from '../types';

interface PositionCardProps {
  position: Position;
  onAssign: (position: Position) => void;
  onRemove: (position: Position) => void;
  isServiceArea: boolean;
}

const PositionCard: React.FC<PositionCardProps> = ({ 
  position, 
  onAssign, 
  onRemove,
  isServiceArea
}) => {
  // Only show positions for the selected area
  const isKitchenPosition = position.area === 'kitchen' || position.area === 'BOH';
  const isServicePosition = position.area === 'service' || position.area === 'FOH' || !position.area;
  
  if ((isServiceArea && !isServicePosition) || (!isServiceArea && !isKitchenPosition)) {
    return null;
  }

  return (
    <Card className="p-3 mb-2">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h4 className="text-sm font-medium">{position.name}</h4>
          {position.employeeName ? (
            <div className="flex items-center mt-1">
              <User className="h-3 w-3 mr-1 text-blue-600" />
              <span className="text-sm text-blue-600">{position.employeeName}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-500">Unassigned</span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {position.employeeName ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-red-500 hover:text-red-700"
              onClick={() => onRemove(position)}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-blue-500 hover:text-blue-700"
              onClick={() => onAssign(position)}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PositionCard;
