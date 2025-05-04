import React from 'react';
import { Button } from '@/components/ui/button';

interface AreaTabsProps {
  areaTab: string;
  setAreaTab: (tab: string) => void;
}

const AreaTabs: React.FC<AreaTabsProps> = ({ areaTab, setAreaTab }) => {
  return (
    <div className="flex space-x-2 mb-4">
      <Button
        variant={areaTab === 'service' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setAreaTab('service')}
        className="flex-1"
      >
        Front Counter/Drive
      </Button>
      <Button
        variant={areaTab === 'kitchen' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setAreaTab('kitchen')}
        className="flex-1"
      >
        Kitchen
      </Button>
    </div>
  );
};

export default AreaTabs;
