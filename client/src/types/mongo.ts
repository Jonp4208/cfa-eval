// Simple type definition for MongoDB ObjectId
export type ObjectId = string

// Type guard to check if a value is an ObjectId
export function isObjectId(value: unknown): value is ObjectId {
  return typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value)
}

// Helper function to convert any value to an ObjectId string
export function toObjectId(value: unknown): ObjectId {
  if (typeof value === 'string') {
    return value
  }
  if (value && typeof value === 'object' && 'toString' in value) {
    return value.toString()
  }
  throw new Error('Invalid ObjectId value')
} 