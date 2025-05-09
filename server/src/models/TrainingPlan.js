import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const trainingMaterialSchema = new Schema({
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['DOCUMENT', 'VIDEO', 'PATHWAY_LINK'],
        required: true
    },
    url: { type: String, required: true },
    category: { type: String, required: true }
});

const trainingModuleSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    department: {
        type: String,
        enum: ['FOH', 'BOH'],
        required: true
    },
    estimatedDuration: { type: String, required: true },
    dayNumber: { type: Number, required: true },
    materials: [trainingMaterialSchema],
    requiredForNewHire: { type: Boolean, default: false },
    competencyChecklist: [{ type: String }]
});

const taskSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    duration: {
        type: Number,
        required: true,
        min: 1
    },
    pathwayUrl: {
        type: String
    },
    competencyChecklist: [{
        type: String
    }],
    competencyProgress: [{
        itemId: String,
        completed: { type: Boolean, default: false },
        completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        completedAt: Date
    }]
});

const daySchema = new Schema({
    dayNumber: {
        type: Number,
        required: true,
        min: 1
    },
    tasks: [taskSchema]
});

const trainingPlanSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    department: {
        type: String,
        required: true,
        enum: ['FOH', 'BOH']
    },
    position: {
        type: String,
        required: true,
        enum: ['Team Member', 'Team Leader', 'Shift Leader', 'Manager']
    },
    type: {
        type: String,
        required: true,
        enum: ['New Hire', 'Regular']
    },
    selfPaced: {
        type: Boolean,
        default: false
    },
    days: [daySchema],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    includesCoreValues: { type: Boolean, default: false },
    includesBrandStandards: { type: Boolean, default: false },
    isTemplate: { type: Boolean, default: false },
    usePhaseTerminology: { type: Boolean, default: false },
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    }
}, {
    timestamps: true
});

trainingPlanSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Add pre-remove hook to handle cascade deletion
trainingPlanSchema.pre('remove', async function(next) {
    try {
        // Import TrainingProgress model here to avoid circular dependency
        const TrainingProgress = mongoose.model('TrainingProgress');

        // Delete all training progress records associated with this plan
        await TrainingProgress.deleteMany({ trainingPlan: this._id });

        next();
    } catch (error) {
        next(error);
    }
});

// Add middleware to handle findOneAndDelete
trainingPlanSchema.pre('findOneAndDelete', async function(next) {
    try {
        // Get the document that's about to be deleted
        const doc = await this.model.findOne(this.getQuery());
        if (doc) {
            const TrainingProgress = mongoose.model('TrainingProgress');
            await TrainingProgress.deleteMany({ trainingPlan: doc._id });
        }
        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model('TrainingPlan', trainingPlanSchema);