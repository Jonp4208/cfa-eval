import mongoose from 'mongoose';

const defaultStandards = {
  sandwich_regular: {
    name: 'Sandwich Regular',
    criteria: [
      {
        id: 'bag_folding',
        name: 'Bag neatly folded with 2 folds',
        type: 'yes_no',
        description: 'Inspect bag should be neatly folded with 2 folds',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 1
      },
      {
        id: 'temperature',
        name: 'Temperature 140°F or higher',
        type: 'temperature',
        description: 'Temperature should be 140°F or higher',
        required: true,
        validation: { minTemp: 140, maxTemp: 180 },
        order: 2
      },
      {
        id: 'bun_toasted',
        name: 'Bun toasted properly',
        type: 'yes_no',
        description: 'Bun should be toasted properly',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 3
      },
      {
        id: 'pickle_count',
        name: '2 pickles not touching (can have 3 if very small)',
        type: 'count',
        description: '2 pickles not touching, can have 3 if very small',
        required: true,
        validation: { minCount: 2, maxCount: 3 },
        order: 4
      },
      {
        id: 'coater_coverage',
        name: 'Correct coater coverage',
        type: 'yes_no',
        description: 'Needs to have the correct coater coverage',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 5
      },
      {
        id: 'filet_position',
        name: 'Filet rough side down',
        type: 'yes_no',
        description: 'Filet should be rough side down',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 6
      },
      {
        id: 'taste_rating',
        name: 'Taste rating (1-10)',
        type: 'taste',
        description: 'Rate the taste from 1 to 10',
        required: true,
        validation: { minTasteRating: 1, maxTasteRating: 10 },
        order: 7
      }
    ]
  },
  sandwich_spicy: {
    name: 'Sandwich Spicy',
    criteria: [
      {
        id: 'bag_folding',
        name: 'Bag neatly folded with 2 folds',
        type: 'yes_no',
        description: 'Inspect bag should be neatly folded with 2 folds',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 1
      },
      {
        id: 'temperature',
        name: 'Temperature 140°F or higher',
        type: 'temperature',
        description: 'Temperature should be 140°F or higher',
        required: true,
        validation: { minTemp: 140, maxTemp: 180 },
        order: 2
      },
      {
        id: 'bun_toasted',
        name: 'Bun toasted properly',
        type: 'yes_no',
        description: 'Bun should be toasted properly',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 3
      },
      {
        id: 'pickle_count',
        name: '2 pickles not touching (can have 3 if very small)',
        type: 'count',
        description: '2 pickles not touching, can have 3 if very small',
        required: true,
        validation: { minCount: 2, maxCount: 3 },
        order: 4
      },
      {
        id: 'coater_coverage',
        name: 'Correct coater coverage',
        type: 'yes_no',
        description: 'Needs to have the correct coater coverage',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 5
      },
      {
        id: 'filet_position',
        name: 'Filet rough side down',
        type: 'yes_no',
        description: 'Filet should be rough side down',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 6
      },
      {
        id: 'taste_rating',
        name: 'Taste rating (1-10)',
        type: 'taste',
        description: 'Rate the taste from 1 to 10',
        required: true,
        validation: { minTasteRating: 1, maxTasteRating: 10 },
        order: 7
      }
    ]
  },
  nuggets_8: {
    name: 'Nuggets 8-count',
    criteria: [
      {
        id: 'weight',
        name: 'Weight at least 4.2 oz',
        type: 'weight',
        description: 'Should weigh at least 4.2 oz and properly sized',
        required: true,
        validation: { minWeight: 4.2, maxWeight: 6.0 },
        order: 1
      },
      {
        id: 'press_n_tab',
        name: 'Press N tab',
        type: 'yes_no',
        description: 'Nuggets: Press N tab',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 2
      },
      {
        id: 'temperature',
        name: 'Temperature 140°F or higher',
        type: 'temperature',
        description: 'Nuggets temperature is 140°F or higher',
        required: true,
        validation: { minTemp: 140, maxTemp: 180 },
        order: 3
      },
      {
        id: 'appearance',
        name: 'Golden brown with generous coater coverage',
        type: 'yes_no',
        description: 'Nuggets are golden brown and entirely covered with a generous layer of seasoned coater, free of large lumps, bare spots or uncooked coater',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 4
      },
      {
        id: 'count',
        name: 'Correct number of nuggets',
        type: 'count',
        description: 'Correct number of nuggets in each box',
        required: true,
        validation: { minCount: 8, maxCount: 8 },
        order: 5
      },
      {
        id: 'taste_rating',
        name: 'Taste rating (1-10)',
        type: 'taste',
        description: 'Rate the taste from 1 to 10',
        required: true,
        validation: { minTasteRating: 1, maxTasteRating: 10 },
        order: 6
      }
    ]
  },
  nuggets_12: {
    name: 'Nuggets 12-count',
    criteria: [
      {
        id: 'weight',
        name: 'Weight at least 6.2 oz',
        type: 'weight',
        description: 'Should weigh at least 6.2 oz and properly sized',
        required: true,
        validation: { minWeight: 6.2, maxWeight: 8.0 },
        order: 1
      },
      {
        id: 'press_n_tab',
        name: 'Press N tab',
        type: 'yes_no',
        description: 'Nuggets: Press N tab',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 2
      },
      {
        id: 'temperature',
        name: 'Temperature 140°F or higher',
        type: 'temperature',
        description: 'Nuggets temperature is 140°F or higher',
        required: true,
        validation: { minTemp: 140, maxTemp: 180 },
        order: 3
      },
      {
        id: 'appearance',
        name: 'Golden brown with generous coater coverage',
        type: 'yes_no',
        description: 'Nuggets are golden brown and entirely covered with a generous layer of seasoned coater, free of large lumps, bare spots or uncooked coater',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 4
      },
      {
        id: 'count',
        name: 'Correct number of nuggets',
        type: 'count',
        description: 'Correct number of nuggets in each box',
        required: true,
        validation: { minCount: 12, maxCount: 12 },
        order: 5
      },
      {
        id: 'taste_rating',
        name: 'Taste rating (1-10)',
        type: 'taste',
        description: 'Rate the taste from 1 to 10',
        required: true,
        validation: { minTasteRating: 1, maxTasteRating: 10 },
        order: 6
      }
    ]
  },
  strips_4: {
    name: 'Strips 4-count',
    criteria: [
      {
        id: 'weight',
        name: 'Weight at least 5.2 oz',
        type: 'weight',
        description: '4-count (at least 5.2 oz)',
        required: true,
        validation: { minWeight: 5.2, maxWeight: 7.0 },
        order: 1
      },
      {
        id: 'press_s_tab',
        name: 'Press S tab',
        type: 'yes_no',
        description: 'Strips: s tab pressed',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 2
      },
      {
        id: 'appearance',
        name: 'Golden brown with generous coater coverage',
        type: 'yes_no',
        description: 'Chick-n-Strips are golden brown and entirely covered with a generous layer of seasoned coater, free of large lumps, bare spots or uncooked coater',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 3
      },
      {
        id: 'taste_rating',
        name: 'Taste rating (1-10)',
        type: 'taste',
        description: 'Rate the taste from 1 to 10',
        required: true,
        validation: { minTasteRating: 1, maxTasteRating: 10 },
        order: 4
      }
    ]
  },
  fries_small: {
    name: 'Fries Small',
    criteria: [
      {
        id: 'weight',
        name: 'Weight 3.0 - 4.0 oz',
        type: 'weight',
        description: 'Small orders: 3.0 oz - 4.0 oz',
        required: true,
        validation: { minWeight: 3.0, maxWeight: 4.0 },
        order: 1
      },
      {
        id: 'size_check',
        name: 'No pieces smaller than a nickel',
        type: 'yes_no',
        description: 'No pieces that are smaller than the size of a nickel',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 2
      },
      {
        id: 'appearance_full',
        name: 'Package appears full',
        type: 'yes_no',
        description: 'Packaged order appears full',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 3
      },
      {
        id: 'quality_check',
        name: 'Quality standards met',
        type: 'yes_no',
        description: 'No dark/burnt spots covering more than 1/2 of fry, no dark spots larger than a dime, no green spots, no torn or damaged pieces, no excessive small pieces',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 4
      },
      {
        id: 'salt_level',
        name: 'Properly salted',
        type: 'yes_no',
        description: 'Fries are salted well',
        required: true,
        validation: { requiredValue: 'yes' },
        order: 5
      },
      {
        id: 'taste_rating',
        name: 'Taste rating (1-10)',
        type: 'taste',
        description: 'Rate the taste from 1 to 10',
        required: true,
        validation: { minTasteRating: 1, maxTasteRating: 10 },
        order: 6
      }
    ]
  }
};

const foodQualityConfigSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    unique: true
  },
  standards: {
    type: Object,
    required: true,
    default: defaultStandards
  },
  qualityPhotos: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

const FoodQualityConfig = mongoose.model('FoodQualityConfig', foodQualityConfigSchema);

export default FoodQualityConfig;
