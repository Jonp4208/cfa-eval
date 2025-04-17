# Dashboard with FOH Task Component

## Overview
The dashboard now includes FOH task completion statistics, providing managers with at-a-glance visibility into daily front-of-house operations.

## New Components

### 1. FOH Task Stat Card
A new stat card has been added to the top row of the dashboard showing:
- Overall FOH task completion percentage for the day
- Number of completed tasks vs. total tasks
- Visual progress indicator

### 2. FOH Task Detail Section
A new detailed section has been added showing:
- Progress bars for each shift type (opening, transition, closing)
- Recent task completions with employee names and timestamps
- Color-coded indicators for different shift types

## Benefits
- Managers can quickly see FOH task completion status without navigating to the FOH page
- Shift-specific completion rates help identify areas that need attention
- Recent activity shows which team members are actively completing tasks

## Technical Implementation
- New API endpoint for FOH task statistics
- Real-time updates when tasks are completed
- Integration with existing dashboard components
- Consistent styling with the rest of the dashboard

## Visual Design
The FOH task components use blue as the primary color to differentiate from the red used for evaluations and disciplinary components, creating a clear visual hierarchy on the dashboard.
