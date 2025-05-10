import React from 'react'
import { 
  Flame, 
  Thermometer, 
  Refrigerator, 
  Utensils, 
  Scale, 
  Scissors, 
  Soup, 
  Droplets, 
  Beef, 
  Sandwich
} from 'lucide-react'

interface EquipmentIconProps {
  equipmentId: string
  className?: string
  size?: number
}

export function EquipmentIcon({ equipmentId, className = "", size = 24 }: EquipmentIconProps) {
  // Map equipment IDs to appropriate icons
  const getIcon = () => {
    // Cooking equipment
    if (equipmentId.includes('fryer')) {
      return <Flame size={size} className={className} />
    }
    if (equipmentId.includes('grill')) {
      return <Beef size={size} className={className} />
    }
    
    // Refrigeration equipment
    if (equipmentId.includes('cooler') || equipmentId.includes('freezer')) {
      return <Refrigerator size={size} className={className} />
    }
    
    // Preparation equipment
    if (equipmentId.includes('table')) {
      return <Utensils size={size} className={className} />
    }
    if (equipmentId.includes('slicer')) {
      return <Scissors size={size} className={className} />
    }
    if (equipmentId.includes('mixer')) {
      return <Soup size={size} className={className} />
    }
    if (equipmentId.includes('scale')) {
      return <Scale size={size} className={className} />
    }
    
    // Cleaning equipment
    if (equipmentId.includes('dish')) {
      return <Droplets size={size} className={className} />
    }
    if (equipmentId.includes('sanitizer') || equipmentId.includes('soap')) {
      return <Droplets size={size} className={className} />
    }
    
    // Default icon for any other equipment
    return <Thermometer size={size} className={className} />
  }
  
  return getIcon()
}
