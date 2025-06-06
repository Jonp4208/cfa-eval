import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

interface TeamMember {
  id: string
  name: string
  task: string
  competenceLevel: number
  commitmentLevel: number
  developmentLevel: string
  recommendedStyle: string
  notes: string
}

interface TeamAssessmentPDFProps {
  teamMembers: TeamMember[]
  assessmentDate: string
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    backgroundColor: '#E51636',
    padding: 20,
    marginBottom: 20,
    borderRadius: 8
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center'
  },
  summarySection: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    border: '1px solid #e9ecef'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27251F',
    marginBottom: 10
  },
  summaryText: {
    fontSize: 11,
    color: '#495057',
    marginBottom: 5
  },
  memberCard: {
    backgroundColor: '#ffffff',
    border: '2px solid #E51636',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15
  },
  memberName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E51636',
    marginBottom: 8
  },
  memberTask: {
    fontSize: 11,
    color: '#6c757d',
    marginBottom: 10,
    fontStyle: 'italic'
  },
  assessmentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  assessmentColumn: {
    flex: 1,
    marginRight: 10
  },
  assessmentLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 3
  },
  assessmentValue: {
    fontSize: 11,
    color: '#27251F',
    marginBottom: 8
  },
  resultSection: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10
  },
  developmentLevel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E51636',
    marginBottom: 3
  },
  recommendedStyle: {
    fontSize: 11,
    color: '#495057',
    marginBottom: 5
  },
  notes: {
    fontSize: 10,
    color: '#6c757d',
    fontStyle: 'italic'
  },
  guideSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10
  },
  guideText: {
    fontSize: 10,
    color: '#424242',
    lineHeight: 1.4,
    marginBottom: 5
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#6c757d',
    borderTop: '1px solid #e9ecef',
    paddingTop: 10
  }
})

const getCompetenceLabel = (level: number) => {
  const labels = {
    1: 'No knowledge/skills',
    2: 'Limited knowledge/skills', 
    3: 'Moderate knowledge/skills',
    4: 'Good knowledge/skills',
    5: 'Expert knowledge/skills'
  }
  return labels[level as keyof typeof labels]
}

const getCommitmentLabel = (level: number) => {
  const labels = {
    1: 'Low motivation/confidence',
    2: 'Some motivation/confidence',
    3: 'Variable motivation/confidence',
    4: 'High motivation/confidence',
    5: 'Very high motivation/confidence'
  }
  return labels[level as keyof typeof labels]
}

export const TeamAssessmentPDF: React.FC<TeamAssessmentPDFProps> = ({ teamMembers, assessmentDate }) => {
  const validMembers = teamMembers.filter(member => member.name.trim() !== '')
  
  const developmentLevelCounts = validMembers.reduce((acc, member) => {
    acc[member.developmentLevel] = (acc[member.developmentLevel] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>TEAM ASSESSMENT REPORT</Text>
          <Text style={styles.headerSubtitle}>Situational Leadership Development Analysis</Text>
          <Text style={styles.headerSubtitle}>Generated: {assessmentDate}</Text>
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Assessment Summary</Text>
          <Text style={styles.summaryText}>Total Team Members Assessed: {validMembers.length}</Text>
          <Text style={styles.summaryText}>Development Level Distribution:</Text>
          {Object.entries(developmentLevelCounts).map(([level, count]) => (
            <Text key={level} style={styles.summaryText}>  • {level}: {count} team member(s)</Text>
          ))}
        </View>

        {/* Individual Assessments */}
        <Text style={styles.sectionTitle}>Individual Team Member Assessments</Text>
        
        {validMembers.map((member, index) => (
          <View key={member.id} style={styles.memberCard}>
            <Text style={styles.memberName}>{index + 1}. {member.name.toUpperCase()}</Text>
            <Text style={styles.memberTask}>Task/Responsibility: {member.task || 'Not specified'}</Text>
            
            <View style={styles.assessmentGrid}>
              <View style={styles.assessmentColumn}>
                <Text style={styles.assessmentLabel}>COMPETENCE LEVEL</Text>
                <Text style={styles.assessmentValue}>{member.competenceLevel}/5</Text>
                <Text style={styles.assessmentValue}>({getCompetenceLabel(member.competenceLevel)})</Text>
              </View>
              <View style={styles.assessmentColumn}>
                <Text style={styles.assessmentLabel}>COMMITMENT LEVEL</Text>
                <Text style={styles.assessmentValue}>{member.commitmentLevel}/5</Text>
                <Text style={styles.assessmentValue}>({getCommitmentLabel(member.commitmentLevel)})</Text>
              </View>
            </View>

            <View style={styles.resultSection}>
              <Text style={styles.developmentLevel}>Development Level: {member.developmentLevel}</Text>
              <Text style={styles.recommendedStyle}>Recommended Leadership Style: {member.recommendedStyle}</Text>
            </View>

            {member.notes && (
              <Text style={styles.notes}>Notes: {member.notes}</Text>
            )}
          </View>
        ))}

        {/* Development Guide */}
        <View style={styles.guideSection}>
          <Text style={styles.guideTitle}>Development Level Guide</Text>
          <Text style={styles.guideText}>• D1 (Enthusiastic Beginner): High commitment, low competence - Use Directing (S1)</Text>
          <Text style={styles.guideText}>• D2 (Disillusioned Learner): Low commitment, low competence - Use Coaching (S2)</Text>
          <Text style={styles.guideText}>• D3 (Capable but Cautious): Variable commitment, moderate/high competence - Use Supporting (S3)</Text>
          <Text style={styles.guideText}>• D4 (Self-Reliant Achiever): High commitment, high competence - Use Delegating (S4)</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Report generated by LD Growth Leadership Development Platform | www.ld-growth.com
        </Text>
      </Page>
    </Document>
  )
}
