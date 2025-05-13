import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Equipment from '../models/Equipment.js';

// Load environment variables
dotenv.config();

async function fixEquipmentIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the collection directly to work with indexes
    const equipmentCollection = mongoose.connection.collection('equipment');
    
    // List all indexes
    console.log('Current indexes:');
    const indexes = await equipmentCollection.indexes();
    console.log(indexes);
    
    // Drop the problematic index on id field if it exists
    const idIndex = indexes.find(index => 
      index.key && Object.keys(index.key).length === 1 && index.key.id === 1
    );
    
    if (idIndex) {
      console.log('Found problematic index on id field. Dropping index...');
      await equipmentCollection.dropIndex('id_1');
      console.log('Index dropped successfully');
    } else {
      console.log('No problematic index found on id field');
    }
    
    // Ensure the compound index exists
    console.log('Ensuring compound index on store and id exists...');
    await equipmentCollection.createIndex({ store: 1, id: 1 }, { unique: true });
    console.log('Compound index created/verified');
    
    // List indexes after changes
    console.log('Updated indexes:');
    const updatedIndexes = await equipmentCollection.indexes();
    console.log(updatedIndexes);
    
    console.log('Index fix completed successfully');
  } catch (error) {
    console.error('Error fixing equipment index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
fixEquipmentIndex();
