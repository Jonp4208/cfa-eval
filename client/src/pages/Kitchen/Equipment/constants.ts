import { EquipmentItem } from '@/services/kitchenService'

export interface EquipmentCategories {
  cooking: EquipmentItem[]
  refrigeration: EquipmentItem[]
  preparation: EquipmentItem[]
  cleaning: EquipmentItem[]
}

// Equipment categories and their items
export const EQUIPMENT_ITEMS: EquipmentCategories = {
  cooking: [
    { id: 'primary_fryers', name: 'Primary Fryers', maintenanceInterval: 30 },
    { id: 'secondary_fryers', name: 'Secondary Fryers', maintenanceInterval: 30 },
    { id: 'grills', name: 'Grills', maintenanceInterval: 90 },
    { id: 'pressure_fryers', name: 'Pressure Fryers', maintenanceInterval: 30 },
  ],
  refrigeration: [
    { id: 'walk_in_cooler', name: 'Walk-in Cooler', maintenanceInterval: 90 },
    { id: 'walk_in_freezer', name: 'Walk-in Freezer', maintenanceInterval: 90 },
    { id: 'prep_coolers', name: 'Prep Area Coolers', maintenanceInterval: 60 },
    { id: 'line_coolers', name: 'Line Coolers', maintenanceInterval: 60 },
  ],
  preparation: [
    { id: 'prep_tables', name: 'Prep Tables', maintenanceInterval: 30 },
    { id: 'slicers', name: 'Slicers', maintenanceInterval: 14 },
    { id: 'mixers', name: 'Mixers', maintenanceInterval: 30 },
    { id: 'food_processors', name: 'Food Processors', maintenanceInterval: 30 },
    { id: 'scales', name: 'Scales', maintenanceInterval: 90 },
  ],
  cleaning: [
    { id: 'dishwasher', name: 'Dishwasher', maintenanceInterval: 30 },
    { id: 'sanitizer_station', name: 'Sanitizer Station', maintenanceInterval: 14 },
    { id: 'floor_scrubber', name: 'Floor Scrubber', maintenanceInterval: 60 },
    { id: 'pressure_washer', name: 'Pressure Washer', maintenanceInterval: 90 },
  ],
}

export type CategoryType = keyof typeof EQUIPMENT_ITEMS

export const STATUS_COLORS = {
  operational: 'bg-green-100 text-green-600 border-green-200',
  maintenance: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  repair: 'bg-red-100 text-red-600 border-red-200',
  offline: 'bg-gray-100 text-gray-600 border-gray-200'
} as const
