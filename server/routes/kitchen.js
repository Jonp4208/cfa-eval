import express from 'express'
import { auth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import * as shiftChecklistController from '../controllers/shiftChecklistController.js'

const router = express.Router()

// Simple task routes like FOH
router.get(
  '/tasks',
  auth,
  asyncHandler(shiftChecklistController.getChecklistItems)
)

router.post(
  '/tasks',
  auth,
  asyncHandler(shiftChecklistController.createChecklistItem)
)

router.put(
  '/tasks/:id',
  auth,
  asyncHandler(shiftChecklistController.updateChecklistItem)
)

router.delete(
  '/tasks/:id',
  auth,
  asyncHandler(shiftChecklistController.deleteChecklistItem)
)

router.post(
  '/tasks/:id/complete',
  auth,
  asyncHandler(shiftChecklistController.completeChecklist)
)

// Keep the completions endpoint
router.get(
  '/completions',
  auth,
  asyncHandler(shiftChecklistController.getChecklistCompletions)
)

export default router