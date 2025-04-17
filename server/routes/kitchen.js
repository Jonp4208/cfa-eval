import express from 'express'
import { auth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import * as shiftChecklistController from '../controllers/shiftChecklistController.js'

const router = express.Router()

// Shift Checklist Routes
router.get(
  '/checklists/shift/:type',
  auth,
  asyncHandler(shiftChecklistController.getChecklistItems)
)

router.put(
  '/checklists/shift/:type',
  auth,
  asyncHandler(shiftChecklistController.updateChecklistItems)
)

router.post(
  '/checklists/shift/:type/complete',
  auth,
  asyncHandler(shiftChecklistController.completeChecklist)
)

router.get(
  '/checklists/shift/:type/completions',
  auth,
  asyncHandler(shiftChecklistController.getChecklistCompletions)
)

export default router 