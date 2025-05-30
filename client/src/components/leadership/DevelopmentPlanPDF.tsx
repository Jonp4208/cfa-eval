import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Register fonts (optional - you can use default fonts)
// Font.register({
//   family: 'Open Sans',
//   src: 'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf'
// })

interface DevelopmentPlanData {
  teamMemberName: string
  currentPosition: string
  planCreatedDate: string
  skillsToFocus: string
  learningResources: string
  onJobExperiences: string
  thirtyDayGoals: string
  sixtyDayGoals: string
  ninetyDayGoals: string
  checkInSchedule: string
  supportNeeded: string
  teamMemberFeedback: string
  planRefinements: string
}

interface DevelopmentPlanPDFProps {
  data: DevelopmentPlanData
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: 2,
    borderBottomColor: '#E51636',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E51636',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 10,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 4,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    color: '#333333',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E51636',
    marginBottom: 8,
    borderBottom: 1,
    borderBottomColor: '#E51636',
    paddingBottom: 2,
  },
  sectionContent: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.5,
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  timelineItem: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 4,
    borderLeft: 3,
  },
  thirtyDay: {
    borderLeftColor: '#8B5CF6',
  },
  sixtyDay: {
    borderLeftColor: '#3B82F6',
  },
  ninetyDay: {
    borderLeftColor: '#10B981',
  },
  timelineTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  timelineContent: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.4,
  },
  supportContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  supportItem: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 4,
  },
  supportTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  supportContent: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.4,
  },
  inputSection: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  inputTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  inputContent: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.4,
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#999999',
    borderTop: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 10,
  },
})

const DevelopmentPlanPDF: React.FC<DevelopmentPlanPDFProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatText = (text: string) => {
    return text || 'Not specified'
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>90-Day Development Plan</Text>
          <Text style={styles.subtitle}>Leadership Development Program</Text>
        </View>

        {/* Team Member Information */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Team Member</Text>
            <Text style={styles.infoValue}>{formatText(data.teamMemberName)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Current Position</Text>
            <Text style={styles.infoValue}>{formatText(data.currentPosition)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Plan Created</Text>
            <Text style={styles.infoValue}>{formatDate(data.planCreatedDate)}</Text>
          </View>
        </View>

        {/* Skills to Develop */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills Development Focus</Text>
          <Text style={styles.sectionContent}>{formatText(data.skillsToFocus)}</Text>
        </View>

        {/* Learning Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Resources</Text>
          <Text style={styles.sectionContent}>{formatText(data.learningResources)}</Text>
        </View>

        {/* On-the-Job Experiences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>On-the-Job Experiences</Text>
          <Text style={styles.sectionContent}>{formatText(data.onJobExperiences)}</Text>
        </View>

        {/* 90-Day Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>90-Day Development Timeline</Text>
          <View style={styles.timelineContainer}>
            <View style={[styles.timelineItem, styles.thirtyDay]}>
              <Text style={styles.timelineTitle}>30-Day Goals</Text>
              <Text style={styles.timelineContent}>{formatText(data.thirtyDayGoals)}</Text>
            </View>
            <View style={[styles.timelineItem, styles.sixtyDay]}>
              <Text style={styles.timelineTitle}>60-Day Goals</Text>
              <Text style={styles.timelineContent}>{formatText(data.sixtyDayGoals)}</Text>
            </View>
            <View style={[styles.timelineItem, styles.ninetyDay]}>
              <Text style={styles.timelineTitle}>90-Day Goals</Text>
              <Text style={styles.timelineContent}>{formatText(data.ninetyDayGoals)}</Text>
            </View>
          </View>
        </View>

        {/* Check-ins & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check-ins & Support</Text>
          <View style={styles.supportContainer}>
            <View style={styles.supportItem}>
              <Text style={styles.supportTitle}>Check-in Schedule</Text>
              <Text style={styles.supportContent}>{formatText(data.checkInSchedule)}</Text>
            </View>
            <View style={styles.supportItem}>
              <Text style={styles.supportTitle}>Support & Resources Needed</Text>
              <Text style={styles.supportContent}>{formatText(data.supportNeeded)}</Text>
            </View>
          </View>
        </View>

        {/* Team Member Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Member Input & Refinements</Text>
          <View style={styles.inputSection}>
            <Text style={styles.inputTitle}>Team Member's Feedback</Text>
            <Text style={styles.inputContent}>{formatText(data.teamMemberFeedback)}</Text>
            <Text style={styles.inputTitle}>Plan Refinements</Text>
            <Text style={styles.inputContent}>{formatText(data.planRefinements)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by LD Growth Leadership Development Platform • {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  )
}

export default DevelopmentPlanPDF
