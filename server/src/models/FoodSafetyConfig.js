import mongoose from 'mongoose'

const foodSafetyConfigSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  dailyChecklistItems: {
    type: Object,
    required: true,
    default: {
      sanitizer: [
        { id: 'three_comp_sink', name: 'Three-compartment sink', frequency: 'multiple', requiredCompletions: 3, timeframe: 'hourly' },
        { id: 'wiping_buckets', name: 'Wiping cloth buckets', frequency: 'multiple', requiredCompletions: 3, timeframe: 'hourly' },
        { id: 'dish_machine', name: 'Dish machine', frequency: 'multiple', requiredCompletions: 3, timeframe: 'hourly' },
        { id: 'sanitizer_concentration', name: 'Sanitizer concentration', frequency: 'multiple', requiredCompletions: 4, timeframe: '30min' }
      ],
      equipment: [
        { id: 'fryers', name: 'Fryers', frequency: 'once', requiredCompletions: 1, timeframe: 'morning' },
        { id: 'grills', name: 'Grills', frequency: 'once', requiredCompletions: 1, timeframe: 'morning' },
        { id: 'prep_tables', name: 'Prep tables', frequency: 'once', requiredCompletions: 1, timeframe: 'morning' },
        { id: 'refrigeration', name: 'Refrigeration units', frequency: 'multiple', requiredCompletions: 2, timeframe: '30min' },
        { id: 'freezer_check', name: 'Freezer temperature check', frequency: 'multiple', requiredCompletions: 2, timeframe: 'hourly' },
        { id: 'hot_holding_temp', name: 'Hot holding temperature', frequency: 'multiple', requiredCompletions: 4, timeframe: '30min' }
      ],
      hygiene: [
        { id: 'hand_washing', name: 'Hand washing stations', frequency: 'multiple', requiredCompletions: 3, timeframe: 'hourly' },
        { id: 'employee_health', name: 'Employee health checks', frequency: 'once', requiredCompletions: 1, timeframe: 'morning' },
        { id: 'glove_usage', name: 'Glove usage check', frequency: 'multiple', requiredCompletions: 4, timeframe: '30min' }
      ],
      food_prep: [
        { id: 'morning_prep', name: 'Morning food preparation', frequency: 'once', requiredCompletions: 1, timeframe: 'morning' },
        { id: 'lunch_prep', name: 'Lunch food preparation', frequency: 'once', requiredCompletions: 1, timeframe: 'lunch' },
        { id: 'dinner_prep', name: 'Dinner food preparation', frequency: 'once', requiredCompletions: 1, timeframe: 'dinner' }
      ],
      cleaning: [
        { id: 'morning_cleaning', name: 'Morning cleaning tasks', frequency: 'once', requiredCompletions: 1, timeframe: 'morning' },
        { id: 'mid_day_cleaning', name: 'Mid-day cleaning tasks', frequency: 'once', requiredCompletions: 1, timeframe: 'afternoon' },
        { id: 'closing_cleaning', name: 'Closing cleaning tasks', frequency: 'once', requiredCompletions: 1, timeframe: 'closing' },
        { id: 'spill_cleanup', name: 'Spill cleanup check', frequency: 'multiple', requiredCompletions: 4, timeframe: 'hourly' }
      ]
    }
  },
  temperatureRanges: {
    type: Object,
    required: true,
    default: {
      walk_in_cooler: { min: 35, max: 41, warning: 2 },
      walk_in_freezer: { min: -10, max: 0, warning: 5 },
      prep_area_cooler: { min: 35, max: 41, warning: 2 },
      hot_holding: { min: 135, max: 165, warning: 5 },
      cooking_line: { min: 35, max: 41, warning: 2 },
      filet_cook: { min: 165, max: 175, warning: 5, type: 'product' },
      filet_hold: { min: 140, max: 145, warning: 3, type: 'product' },
      nugget_cook: { min: 165, max: 175, warning: 5, type: 'product' },
      nugget_hold: { min: 140, max: 145, warning: 3, type: 'product' },
      strip_cook: { min: 165, max: 175, warning: 5, type: 'product' },
      strip_hold: { min: 140, max: 145, warning: 3, type: 'product' },
      grilled_filet_cook: { min: 165, max: 175, warning: 5, type: 'product' },
      grilled_filet_hold: { min: 140, max: 145, warning: 3, type: 'product' },
      grilled_nugget_cook: { min: 165, max: 175, warning: 5, type: 'product' }
    }
  }
}, {
  timestamps: true
})

const FoodSafetyConfig = mongoose.model('FoodSafetyConfig', foodSafetyConfigSchema)

export default FoodSafetyConfig 