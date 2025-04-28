# 360 Leadership Evaluations

This document provides information about the 360 Leadership Evaluations feature in the CFA Evaluation system.

## What is a 360 Leadership Evaluation?

A 360-degree leadership evaluation (also called multi-rater feedback) is a comprehensive assessment method that collects feedback about a leader from multiple perspectives. This evaluation is specifically designed for employees in leadership positions (Leaders and Directors) and cannot be used for other positions.

- **Managers** (feedback from above)
- **Peers/colleagues** (feedback from the same level)
- **Direct reports/subordinates** (feedback from below)
- **Self-assessment** (the leader's own perspective)

This approach provides a well-rounded view of leadership effectiveness and identifies blind spots that might not be visible from a single perspective.

## The 360 Leadership Evaluation Template

The 360 Leadership Evaluation feature uses a specialized template that is:

1. **Standardized across all stores**: The same Leadership 360 Evaluation template is used for all stores
2. **Pre-configured**: The template is already set up with comprehensive leadership competency sections and criteria
3. **Not customizable by individual stores**: This ensures consistency in leadership evaluations across the organization

### Template Setup

The Leadership 360 Evaluation template is created using the following script:

```bash
node server/src/scripts/create360Template.js
```

This script:
- Creates a standardized Leadership 360 Evaluation template in the database
- Makes it available to all stores
- Uses the default grading scale in your system
- Sets up comprehensive leadership competency sections and criteria

**Note**: Unlike other templates in the system, the Leadership 360 Evaluation template is a specialized feature that we've built specifically for leadership assessments. Users will only see this template when creating 360 evaluations.

### Template Structure

The Leadership 360 Evaluation template includes the following sections:

1. **Strategic Leadership**
   - Vision & Direction
   - Decision Making
   - Business Acumen
   - Innovation

2. **People Leadership**
   - Team Development
   - Delegation
   - Conflict Resolution
   - Recognition

3. **Communication**
   - Clarity
   - Active Listening
   - Feedback Delivery
   - Transparency

4. **Character & Integrity**
   - Trustworthiness
   - Accountability
   - Ethical Behavior
   - Consistency

5. **Adaptability & Resilience**
   - Change Management
   - Problem Solving
   - Stress Management
   - Continuous Learning

6. **Overall Leadership Effectiveness**
   - Team Performance
   - Culture Building
   - Leadership Presence
   - Overall Leadership Rating

## Using the 360 Leadership Evaluations Feature

### Creating a New 360 Evaluation

1. Navigate to the Leadership section in the application
2. Click on the "360° Evaluations" tab
3. Click the "New 360° Evaluation" button
4. Follow the three-step process:
   - Select the leader to evaluate (only Leaders and Directors will be shown)
   - Confirm the Leadership 360 Evaluation template (this is the only template available for 360 evaluations)
   - Set the start and due dates

### Adding Evaluators

After creating a 360 evaluation, you'll need to add evaluators:

1. Click "Add Evaluators" on the evaluation details page
2. Select users from different relationship categories:
   - Manager
   - Peer
   - Direct Report
   - Self (the leader being evaluated)
3. Click "Save and Send Invitations"

The system will automatically notify the selected evaluators.

### Completing an Evaluation (for evaluators)

When you're selected as an evaluator:

1. You'll receive a notification
2. Navigate to the Leadership > 360° Evaluations section
3. Find the evaluation with your name as an evaluator
4. Click on the evaluation and select the "Provide Feedback" tab
5. Complete all required questions
6. Add overall comments
7. Click "Submit Evaluation"

### Reviewing Results (for the subject)

Once all evaluators have completed their feedback:

1. The evaluation status will change to "Completed"
2. The subject can view the "Results" tab
3. Results are presented with:
   - Overall rating
   - Ratings by relationship type
   - Ratings by competency category
   - Anonymous comments from evaluators

4. After reviewing, click "Mark as Reviewed" to complete the process

## Best Practices for 360 Evaluations

1. **Ensure anonymity**: Reassure evaluators that their individual responses are confidential
2. **Select diverse evaluators**: Include people with different relationships and perspectives
3. **Focus on development**: Use results for growth rather than punishment
4. **Follow up with action**: Create development plans based on the feedback
5. **Repeat regularly**: Conduct 360 evaluations periodically (e.g., annually) to track progress

## About the Template Standardization

The Leadership 360 Evaluation template is intentionally standardized across all stores for several reasons:

1. **Consistency**: Ensures all leaders are evaluated using the same criteria
2. **Benchmarking**: Allows for meaningful comparison of leadership performance across stores
3. **Quality Control**: Maintains the integrity of the leadership evaluation process
4. **Simplicity**: Eliminates the need for each store to create their own leadership evaluation templates

This standardization is a key feature of the 360 Leadership Evaluations system and helps maintain consistency in leadership development across the organization.
