import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles that match the SimplePlaybookEditor layout
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6,
  },
  // Header styles
  header: {
    textAlign: 'center',
    borderBottom: 3,
    borderBottomColor: '#E51636',
    paddingBottom: 15,
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E51636',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  // Step section styles
  stepSection: {
    backgroundColor: '#dbeafe',
    borderLeft: 4,
    borderLeftColor: '#E51636',
    padding: 15,
    marginBottom: 15,
    borderRadius: 4,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    backgroundColor: '#E51636',
    color: 'white',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 12,
    paddingTop: 6,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E51636',
  },
  stepDescription: {
    fontSize: 11,
    color: '#374151',
    fontWeight: 'bold',
    marginTop: 5,
  },
  // Priority Matrix styles
  priorityMatrix: {
    marginBottom: 20,
  },
  matrixGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  matrixQuadrant: {
    width: '48%',
    padding: 12,
    borderRadius: 6,
    border: 2,
    textAlign: 'center',
    minHeight: 80,
  },
  urgentImportant: {
    backgroundColor: '#fef2f2',
    borderColor: '#dc2626',
  },
  importantNotUrgent: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  urgentNotImportant: {
    backgroundColor: '#fefce8',
    borderColor: '#ca8a04',
  },
  notUrgentNotImportant: {
    backgroundColor: '#f9fafb',
    borderColor: '#6b7280',
  },
  matrixTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  matrixAction: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  matrixDescription: {
    fontSize: 9,
    lineHeight: 1.3,
  },
  // SMART Goals styles
  smartGoalsSection: {
    backgroundColor: 'white',
    border: 2,
    borderColor: '#E51636',
    borderRadius: 6,
    padding: 15,
    marginBottom: 20,
  },
  smartGoalsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E51636',
    marginBottom: 12,
  },
  smartGoal: {
    backgroundColor: '#f9fafb',
    border: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E51636',
    marginBottom: 10,
  },
  smartItem: {
    backgroundColor: '#dbeafe',
    borderLeft: 3,
    borderLeftColor: '#E51636',
    padding: 8,
    marginBottom: 8,
    borderRadius: 2,
  },
  smartLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#E51636',
    marginBottom: 4,
  },
  smartText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },
  // Checklist styles
  checklistSection: {
    backgroundColor: '#f9fafb',
    border: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  checklistTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    color: '#9ca3af',
    marginRight: 6,
    fontSize: 10,
  },
  checklistText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
    flex: 1,
  },
  // Leadership examples styles
  exampleSection: {
    backgroundColor: 'white',
    border: 2,
    borderColor: '#E51636',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },
  exampleTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E51636',
    marginBottom: 10,
  },
  exampleItem: {
    backgroundColor: '#dbeafe',
    borderLeft: 3,
    borderLeftColor: '#E51636',
    padding: 8,
    marginBottom: 8,
    borderRadius: 2,
  },
  exampleLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#E51636',
    marginBottom: 3,
  },
  exampleText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },
  // Role definition styles
  roleSection: {
    backgroundColor: '#dbeafe',
    border: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
    marginBottom: 4,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
});

interface PlaybookData {
  title: string;
  subtitle: string;
  urgentImportantDescription: string;
  importantNotUrgentDescription: string;
  urgentNotImportantDescription: string;
  notUrgentNotImportantDescription: string;
  smartGoals: Array<{
    id: number;
    title: string;
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
  }>;
}

interface PlaybookPDFProps {
  playbookData: PlaybookData;
}

const PlaybookPDF: React.FC<PlaybookPDFProps> = ({ playbookData }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{playbookData.title}</Text>
          <Text style={styles.subtitle}>{playbookData.subtitle}</Text>
        </View>

        {/* Step 1 - Priority Matrix */}
        <View style={styles.stepSection}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepTitle}>Identify Your Priorities Using the Priority Matrix</Text>
          </View>
          <Text style={styles.stepDescription}>
            Every week, categorize your responsibilities and tasks into these four boxes:
          </Text>
        </View>

        {/* Priority Matrix */}
        <View style={styles.priorityMatrix}>
          <View style={styles.matrixGrid}>
            {/* Urgent + Important */}
            <View style={[styles.matrixQuadrant, styles.urgentImportant]}>
              <Text style={[styles.matrixTitle, { color: '#dc2626' }]}>URGENT + IMPORTANT</Text>
              <Text style={[styles.matrixAction, { color: '#dc2626' }]}>DO FIRST</Text>
              <Text style={[styles.matrixDescription, { color: '#dc2626' }]}>
                {playbookData.urgentImportantDescription}
              </Text>
            </View>

            {/* Important + Not Urgent */}
            <View style={[styles.matrixQuadrant, styles.importantNotUrgent]}>
              <Text style={[styles.matrixTitle, { color: '#2563eb' }]}>IMPORTANT + NOT URGENT</Text>
              <Text style={[styles.matrixAction, { color: '#2563eb' }]}>SCHEDULE</Text>
              <Text style={[styles.matrixDescription, { color: '#2563eb' }]}>
                {playbookData.importantNotUrgentDescription}
              </Text>
            </View>

            {/* Urgent + Not Important */}
            <View style={[styles.matrixQuadrant, styles.urgentNotImportant]}>
              <Text style={[styles.matrixTitle, { color: '#ca8a04' }]}>URGENT + NOT IMPORTANT</Text>
              <Text style={[styles.matrixAction, { color: '#ca8a04' }]}>DELEGATE</Text>
              <Text style={[styles.matrixDescription, { color: '#ca8a04' }]}>
                {playbookData.urgentNotImportantDescription}
              </Text>
            </View>

            {/* Not Urgent + Not Important */}
            <View style={[styles.matrixQuadrant, styles.notUrgentNotImportant]}>
              <Text style={[styles.matrixTitle, { color: '#6b7280' }]}>NOT URGENT + NOT IMPORTANT</Text>
              <Text style={[styles.matrixAction, { color: '#6b7280' }]}>ELIMINATE</Text>
              <Text style={[styles.matrixDescription, { color: '#6b7280' }]}>
                {playbookData.notUrgentNotImportantDescription}
              </Text>
            </View>
          </View>
        </View>

        {/* Step 2 - SMART Goals */}
        <View style={styles.stepSection}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepTitle}>Turn Top Priorities into SMART Goals</Text>
          </View>
          <Text style={styles.stepDescription}>
            Take your "URGENT + IMPORTANT" and "IMPORTANT + NOT URGENT" items and make them SMART goals:
          </Text>
        </View>

        {/* SMART Goals Section */}
        <View style={styles.smartGoalsSection}>
          <Text style={styles.smartGoalsTitle}>📝 Your SMART Goals</Text>

          {playbookData.smartGoals.map((goal, index) => (
            <View key={goal.id} style={styles.smartGoal}>
              <Text style={styles.goalTitle}>{goal.title}</Text>

              <View style={styles.smartItem}>
                <Text style={styles.smartLabel}>S - Specific</Text>
                <Text style={styles.smartText}>{goal.specific}</Text>
              </View>

              <View style={styles.smartItem}>
                <Text style={styles.smartLabel}>M - Measurable</Text>
                <Text style={styles.smartText}>{goal.measurable}</Text>
              </View>

              <View style={styles.smartItem}>
                <Text style={styles.smartLabel}>A - Achievable</Text>
                <Text style={styles.smartText}>{goal.achievable}</Text>
              </View>

              <View style={styles.smartItem}>
                <Text style={styles.smartLabel}>R - Relevant</Text>
                <Text style={styles.smartText}>{goal.relevant}</Text>
              </View>

              <View style={styles.smartItem}>
                <Text style={styles.smartLabel}>T - Time-bound</Text>
                <Text style={styles.smartText}>{goal.timeBound}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>

      {/* Page 2 - Steps 3, 4, and 5 */}
      <Page size="A4" style={styles.page}>
        {/* Step 3 - Weekly Process */}
        <View style={styles.stepSection}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepTitle}>Weekly Priority Assessment Process</Text>
          </View>
          <Text style={styles.stepDescription}>
            Follow this weekly process to stay on top of your priorities:
          </Text>
        </View>

        {/* Monday Morning Checklist */}
        <View style={styles.checklistSection}>
          <Text style={styles.checklistTitle}>📅 Every Monday Morning (15 minutes):</Text>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Review your area of responsibility - what needs attention?</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Check feedback from last week - any recurring issues?</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Assess current projects and systems - what needs follow-up?</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Ask team members - what challenges are they facing?</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Review upcoming deadlines and commitments - what's due soon?</Text>
          </View>
        </View>

        {/* Categorization Checklist */}
        <View style={styles.checklistSection}>
          <Text style={styles.checklistTitle}>📊 Then Categorize Each Issue:</Text>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Write each issue on the priority matrix</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Focus on "Urgent + Important" first</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Schedule "Important + Not Urgent" items</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Delegate "Urgent + Not Important" to team</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Eliminate or ignore "Not Urgent + Not Important"</Text>
          </View>
        </View>

        {/* Step 4 - Monthly Process */}
        <View style={styles.stepSection}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepTitle}>Monthly Priority Assessment Process</Text>
          </View>
          <Text style={styles.stepDescription}>
            Every month, conduct a comprehensive review of your priorities and systems:
          </Text>
        </View>

        {/* Monthly Review Checklist */}
        <View style={styles.checklistSection}>
          <Text style={styles.checklistTitle}>📅 Monthly Review (First Monday of Month):</Text>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Review all completed weekly assessments - what patterns do you see?</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Analyze feedback and performance data - any recurring issues?</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Evaluate systems and processes - what needs improvement or updating?</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Assess team performance and development needs</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Review budget and resources - are you on track with targets?</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Plan upcoming projects and initiatives for next month</Text>
          </View>
        </View>

        {/* Monthly Goal Setting */}
        <View style={styles.checklistSection}>
          <Text style={styles.checklistTitle}>🎯 Set Monthly Goals:</Text>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Set 3-5 major goals for the upcoming month</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Ensure each goal follows SMART criteria from Step 2</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Assign responsibility for each goal to specific team members</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Schedule weekly check-ins to monitor progress</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Document goals and share with your manager and team</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by LD Growth Leadership Development Platform
        </Text>
      </Page>

      {/* Page 3 - Step 5 Leadership Standards */}
      <Page size="A4" style={styles.page}>
        {/* Step 5 - Leadership Standards */}
        <View style={styles.stepSection}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepNumber}>5</Text>
            <Text style={styles.stepTitle}>Leadership Standards & Systems</Text>
          </View>
          <Text style={styles.stepDescription}>
            As a leader, you don't do all the work - you create systems that ensure consistent results.
          </Text>
        </View>

        {/* Role Definition */}
        <View style={styles.roleSection}>
          <Text style={styles.roleTitle}>👑 Your Leadership Role:</Text>
          <Text style={styles.roleText}>
            <Text style={{ fontWeight: 'bold' }}>✅ Your Job:</Text> Set standards, create processes, train team, monitor performance, solve system problems
          </Text>
          <Text style={styles.roleText}>
            <Text style={{ fontWeight: 'bold' }}>❌ NOT YOUR JOB:</Text> Doing all the individual tasks, micromanaging every detail, working in the business instead of on it
          </Text>
        </View>

        {/* System Setup */}
        <View style={styles.checklistSection}>
          <Text style={styles.checklistTitle}>📋 Leadership System Setup:</Text>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Create Simple Processes: Daily, weekly, monthly tasks with clear steps and checkboxes</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Assign Ownership: Specific people responsible for specific areas and outcomes</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Set Standards: What does "success" look like? Define clear expectations and examples</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Monitor Performance: Check completed work, do regular reviews and spot checks</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.checklistText}>Address Gaps: Retrain, reassign, or improve systems when standards aren't met</Text>
          </View>
        </View>

        {/* Leadership SMART Goal Examples */}
        <View style={styles.exampleSection}>
          <Text style={styles.exampleTitle}>📝 Leadership SMART Goal Examples:</Text>

          <View style={styles.exampleItem}>
            <Text style={styles.exampleLabel}>Process Improvement</Text>
            <Text style={styles.exampleText}>
              <Text style={{ fontWeight: 'bold' }}>Goal:</Text> "Achieve 100% completion of daily task checklists with zero quality issues for 30 consecutive days by [date]"
            </Text>
          </View>

          <View style={styles.exampleItem}>
            <Text style={styles.exampleLabel}>System Implementation</Text>
            <Text style={styles.exampleText}>
              <Text style={{ fontWeight: 'bold' }}>Goal:</Text> "Implement process improvement system where all issues are addressed within 24 hours, measured by tracking logs for 14 days by [date]"
            </Text>
          </View>

          <View style={styles.exampleItem}>
            <Text style={styles.exampleLabel}>Performance Standards</Text>
            <Text style={styles.exampleText}>
              <Text style={{ fontWeight: 'bold' }}>Goal:</Text> "Establish end-of-week review checklist with 100% completion rate verified by documentation for 21 consecutive days by [date]"
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by LD Growth Leadership Development Platform
        </Text>
      </Page>
    </Document>
  );
};

export default PlaybookPDF;
