import React from 'react'
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet
} from '@react-pdf/renderer'
import { Playbook } from '@/services/playbookService'

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: '#222',
    backgroundColor: '#f8fafc'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    border: '1 solid #e5e7eb',
    marginBottom: 16,
    padding: 24
  },
  header: {
    textAlign: 'center',
    borderBottom: '3 solid #E51636',
    paddingBottom: 20,
    marginBottom: 32
  },
  title: {
    fontSize: 24,
    color: '#E51636',
    fontWeight: 'bold',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2
  },
  stepSection: {
    backgroundColor: '#eff6ff',
    borderLeft: '4 solid #E51636',
    borderRadius: 8,
    padding: 24,
    marginBottom: 16
  },
  stepTitle: {
    fontSize: 18,
    color: '#E51636',
    fontWeight: 'bold',
    marginBottom: 4
  },
  stepNumber: {
    backgroundColor: '#E51636',
    color: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    marginRight: 12,
    fontSize: 16,
    lineHeight: 32
  },
  matrixGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16
  },
  matrixCell: {
    width: '48%',
    minHeight: 80,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    textAlign: 'center'
  },
  urgentImportant: {
    backgroundColor: '#fee2e2',
    border: '2 solid #dc2626'
  },
  importantNotUrgent: {
    backgroundColor: '#dbeafe',
    border: '2 solid #2563eb'
  },
  urgentNotImportant: {
    backgroundColor: '#fef9c3',
    border: '2 solid #eab308'
  },
  notUrgentNotImportant: {
    backgroundColor: '#f3f4f6',
    border: '2 solid #6b7280'
  },
  matrixTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2
  },
  matrixSubtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
    fontWeight: 'bold'
  },
  matrixDesc: {
    fontSize: 12,
    color: '#555'
  },
  smartGoalSection: {
    border: '2 solid #E51636',
    borderRadius: 8,
    padding: 24,
    marginBottom: 16,
    backgroundColor: '#fff'
  },
  smartGoalTitle: {
    fontSize: 16,
    color: '#E51636',
    fontWeight: 'bold',
    marginBottom: 8
  },
  smartGoalCard: {
    backgroundColor: '#f3f4f6',
    border: '1 solid #e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12
  },
  smartGoalLabel: {
    fontWeight: 'bold',
    color: '#E51636',
    fontSize: 13
  },
  smartGoalValue: {
    fontSize: 12,
    color: '#222',
    marginLeft: 4
  },
  checklist: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    border: '1 solid #e5e7eb',
    padding: 16,
    marginBottom: 12
  },
  checklistTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4
  },
  checklistItem: {
    fontSize: 12,
    marginLeft: 8
  },
  roleCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    border: '1 solid #60a5fa',
    padding: 16,
    marginBottom: 12
  },
  roleTitle: {
    color: '#1e40af',
    fontWeight: 'bold',
    marginBottom: 4
  },
  systemSetup: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    border: '1 solid #e5e7eb',
    padding: 16,
    marginBottom: 12
  },
  systemSetupTitle: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  exampleCard: {
    backgroundColor: '#eff6ff',
    borderLeft: '3 solid #E51636',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8
  },
  exampleTitle: {
    fontWeight: 'bold',
    color: '#E51636',
    marginBottom: 2
  },
  exampleGoal: {
    fontSize: 12,
    color: '#374151'
  },
  footer: {
    marginTop: 24,
    borderTop: '1 solid #eee',
    paddingTop: 8,
    textAlign: 'center',
    fontSize: 10,
    color: '#888'
  }
})

function PlaybookPDF ({ playbook }: { playbook: Playbook }) {
  // Helper to render static steps and sections
  function renderStaticSections () {
    return (
      <>
        {/* Step 1 */}
        <View style={styles.stepSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepTitle}>Identify Your Priorities Using the Priority Matrix</Text>
          </View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Every week, categorize your responsibilities and tasks into these four boxes:
          </Text>
        </View>
        {/* Priority Matrix */}
        {renderPriorityMatrix()}
        {/* Step 2 */}
        <View style={styles.stepSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepTitle}>Turn Top Priorities into SMART Goals</Text>
          </View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Take your "URGENT + IMPORTANT" and "IMPORTANT + NOT URGENT" items and make them SMART goals:
          </Text>
        </View>
        {/* SMART Goals Section */}
        <View style={[styles.smartGoalSection, { border: '2 solid #E51636', marginBottom: 16 }]}> 
          <Text style={[styles.smartGoalTitle, { marginBottom: 8 }]}>📝 Your SMART Goals</Text>
          {renderSmartGoals()}
        </View>
        {/* Step 3 */}
        <View style={styles.stepSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepTitle}>Weekly Priority Assessment Process</Text>
          </View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Follow this weekly process to stay on top of your priorities:
          </Text>
          {/* Monday Morning Checklist */}
          <View style={{ marginBottom: 8, padding: 8, backgroundColor: '#f9fafb', borderRadius: 6 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>📅 Every Monday Morning (15 minutes):</Text>
            <Text>• Review your area of responsibility - what needs attention?</Text>
            <Text>• Check feedback from last week - any recurring issues?</Text>
            <Text>• Assess current projects and systems - what needs follow-up?</Text>
            <Text>• Ask team members - what challenges are they facing?</Text>
            <Text>• Review upcoming deadlines and commitments - what's due soon?</Text>
          </View>
          {/* Categorization Checklist */}
          <View style={{ marginBottom: 8, padding: 8, backgroundColor: '#f9fafb', borderRadius: 6 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>📊 Then Categorize Each Issue:</Text>
            <Text>• Write each issue on the priority matrix</Text>
            <Text>• Focus on "Urgent + Important" first</Text>
            <Text>• Schedule "Important + Not Urgent" items</Text>
            <Text>• Delegate "Urgent + Not Important" to team</Text>
            <Text>• Eliminate or ignore "Not Urgent + Not Important"</Text>
          </View>
        </View>
        {/* Step 4 */}
        <View style={styles.stepSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepTitle}>Monthly Priority Assessment Process</Text>
          </View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Every month, conduct a comprehensive review of your priorities and systems:
          </Text>
          {/* Monthly Review Checklist */}
          <View style={{ marginBottom: 8, padding: 8, backgroundColor: '#f9fafb', borderRadius: 6 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>📅 Monthly Review (First Monday of Month):</Text>
            <Text>• Review all completed weekly assessments - what patterns do you see?</Text>
            <Text>• Analyze feedback and performance data - any recurring issues?</Text>
            <Text>• Evaluate systems and processes - what needs improvement or updating?</Text>
            <Text>• Assess team performance and development needs</Text>
            <Text>• Review budget and resources - are you on track with targets?</Text>
            <Text>• Plan upcoming projects and initiatives for next month</Text>
          </View>
          {/* Monthly Goal Setting */}
          <View style={{ marginBottom: 8, padding: 8, backgroundColor: '#f9fafb', borderRadius: 6 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>🎯 Set Monthly Goals:</Text>
            <Text>• Set 3-5 major goals for the upcoming month</Text>
            <Text>• Ensure each goal follows SMART criteria from Step 2</Text>
            <Text>• Assign responsibility for each goal to specific team members</Text>
            <Text>• Schedule weekly check-ins to monitor progress</Text>
            <Text>• Document goals and share with your manager and team</Text>
          </View>
        </View>
        {/* Step 5 */}
        <View style={styles.stepSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={styles.stepNumber}>5</Text>
            <Text style={styles.stepTitle}>Leadership Standards & Systems</Text>
          </View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            As a leader, you don't do all the work - you create systems that ensure consistent results.
          </Text>
          {/* Role Definition */}
          <View style={[styles.roleCard, { marginBottom: 8 }]}>
            <Text style={styles.roleTitle}>👑 Your Leadership Role:</Text>
            <Text>✅ Your Job: Set standards, create processes, train team, monitor performance, solve system problems</Text>
            <Text>❌ NOT YOUR JOB: Doing all the individual tasks, micromanaging every detail, working in the business instead of on it</Text>
          </View>
          {/* System Setup */}
          <View style={[styles.systemSetup, { marginBottom: 8 }]}>
            <Text style={styles.systemSetupTitle}>📋 Leadership System Setup:</Text>
            <Text>• Create Simple Processes: Daily, weekly, monthly tasks with clear steps and checkboxes</Text>
            <Text>• Assign Ownership: Specific people responsible for specific areas and outcomes</Text>
            <Text>• Set Standards: What does "success" look like? Define clear expectations and examples</Text>
            <Text>• Monitor Performance: Check completed work, do regular reviews and spot checks</Text>
            <Text>• Address Gaps: Retrain, reassign, or improve systems when standards aren't met</Text>
          </View>
          {/* Leadership SMART Goal Examples */}
          <View style={[styles.smartGoalSection, { border: '2 solid #E51636', marginBottom: 0 }]}> 
            <Text style={[styles.smartGoalTitle, { marginBottom: 8 }]}>📝 Leadership SMART Goal Examples:</Text>
            <View style={[styles.exampleCard, { marginBottom: 8 }]}>
              <Text style={styles.exampleTitle}>Process Improvement</Text>
              <Text style={styles.exampleGoal}>Goal: "Achieve 100% completion of daily task checklists with zero quality issues for 30 consecutive days by [date]"</Text>
            </View>
            <View style={[styles.exampleCard, { marginBottom: 8 }]}>
              <Text style={styles.exampleTitle}>System Implementation</Text>
              <Text style={styles.exampleGoal}>Goal: "Implement process improvement system where all issues are addressed within 24 hours, measured by tracking logs for 14 days by [date]"</Text>
            </View>
            <View style={[styles.exampleCard, { marginBottom: 0 }]}>
              <Text style={styles.exampleTitle}>Performance Standards</Text>
              <Text style={styles.exampleGoal}>Goal: "Establish end-of-week review checklist with 100% completion rate verified by documentation for 21 consecutive days by [date]"</Text>
            </View>
          </View>
        </View>
      </>
    )
  }

  // Helper to render the priority matrix (from content blocks or fallback)
  function renderPriorityMatrix () {
    // Try to find a priority-matrix block
    const matrixBlock = playbook.contentBlocks.find(b => b.type === 'priority-matrix')
    const q = matrixBlock?.content?.quadrants || {}
    return (
      <View style={styles.matrixGrid}>
        <View style={[styles.matrixCell, styles.urgentImportant]}>
          <Text style={styles.matrixTitle}>{q.urgentImportant?.title || 'URGENT + IMPORTANT'}</Text>
          <Text style={styles.matrixSubtitle}>{q.urgentImportant?.subtitle || 'DO FIRST'}</Text>
          <Text style={styles.matrixDesc}>{q.urgentImportant?.description || '...'}</Text>
        </View>
        <View style={[styles.matrixCell, styles.importantNotUrgent]}>
          <Text style={styles.matrixTitle}>{q.importantNotUrgent?.title || 'IMPORTANT + NOT URGENT'}</Text>
          <Text style={styles.matrixSubtitle}>{q.importantNotUrgent?.subtitle || 'SCHEDULE'}</Text>
          <Text style={styles.matrixDesc}>{q.importantNotUrgent?.description || '...'}</Text>
        </View>
        <View style={[styles.matrixCell, styles.urgentNotImportant]}>
          <Text style={styles.matrixTitle}>{q.urgentNotImportant?.title || 'URGENT + NOT IMPORTANT'}</Text>
          <Text style={styles.matrixSubtitle}>{q.urgentNotImportant?.subtitle || 'DELEGATE'}</Text>
          <Text style={styles.matrixDesc}>{q.urgentNotImportant?.description || '...'}</Text>
        </View>
        <View style={[styles.matrixCell, styles.notUrgentNotImportant]}>
          <Text style={styles.matrixTitle}>{q.notUrgentNotImportant?.title || 'NOT URGENT + NOT IMPORTANT'}</Text>
          <Text style={styles.matrixSubtitle}>{q.notUrgentNotImportant?.subtitle || 'ELIMINATE'}</Text>
          <Text style={styles.matrixDesc}>{q.notUrgentNotImportant?.description || '...'}</Text>
        </View>
      </View>
    )
  }

  // Helper to render SMART goals (from content blocks or fallback)
  function renderSmartGoals () {
    const smartBlock = playbook.contentBlocks.find(b => b.type === 'smart-template')
    const goals = smartBlock?.content?.goals || []
    if (!goals.length) return <Text>No SMART goals provided.</Text>
    return goals.map((goal: any, i: number) => (
      <View key={i} style={[styles.smartGoalCard, { marginBottom: 8 }]}>
        <Text style={{ fontWeight: 'bold', color: '#E51636', marginBottom: 2 }}>{goal.title}</Text>
        <Text><Text style={{ fontWeight: 'bold' }}>S - Specific:</Text> {goal.specific}</Text>
        <Text><Text style={{ fontWeight: 'bold' }}>M - Measurable:</Text> {goal.measurable}</Text>
        <Text><Text style={{ fontWeight: 'bold' }}>A - Achievable:</Text> {goal.achievable}</Text>
        <Text><Text style={{ fontWeight: 'bold' }}>R - Relevant:</Text> {goal.relevant}</Text>
        <Text><Text style={{ fontWeight: 'bold' }}>T - Time-bound:</Text> {goal.timeBound}</Text>
      </View>
    ))
  }

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{playbook.title}</Text>
          {playbook.subtitle && <Text style={styles.subtitle}>{playbook.subtitle}</Text>}
          {playbook.description && <Text>{playbook.description}</Text>}
        </View>
        {/* Static Steps and Sections */}
        {renderStaticSections()}
        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleDateString()} | {playbook.category} | Target: {playbook.targetRole}</Text>
        </View>
      </Page>
    </Document>
  )
}

export default PlaybookPDF 