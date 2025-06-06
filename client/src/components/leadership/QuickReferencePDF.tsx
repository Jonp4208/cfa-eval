import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

interface QuickTip {
  id: string
  category: string
  situation: string
  recommendedStyle: string
  keyActions: string[]
  communicationTips: string[]
  commonMistakes: string[]
}

interface QuickReferencePDFProps {
  quickTips: QuickTip[]
  exportDate: string
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
  decisionFramework: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    marginBottom: 20,
    borderRadius: 8
  },
  frameworkTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10
  },
  frameworkStep: {
    fontSize: 11,
    color: '#424242',
    marginBottom: 5,
    paddingLeft: 10
  },
  tipCard: {
    backgroundColor: '#ffffff',
    border: '2px solid #E51636',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    breakInside: 'avoid'
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  situationTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E51636',
    flex: 1
  },
  categoryBadge: {
    backgroundColor: '#6c757d',
    color: '#ffffff',
    fontSize: 9,
    padding: 3,
    borderRadius: 3,
    marginLeft: 10
  },
  recommendedStyle: {
    backgroundColor: '#28a745',
    color: '#ffffff',
    fontSize: 10,
    padding: 5,
    borderRadius: 5,
    textAlign: 'center',
    marginBottom: 10
  },
  subsectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 5,
    marginTop: 8
  },
  actionItem: {
    fontSize: 10,
    color: '#27251F',
    marginBottom: 3,
    paddingLeft: 10
  },
  communicationItem: {
    fontSize: 10,
    color: '#0d6efd',
    marginBottom: 3,
    paddingLeft: 10,
    fontStyle: 'italic'
  },
  mistakeItem: {
    fontSize: 10,
    color: '#dc3545',
    marginBottom: 3,
    paddingLeft: 10
  },
  stylesOverview: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 8
  },
  overviewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  styleItem: {
    width: '48%',
    marginBottom: 10
  },
  styleHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 3
  },
  directingStyle: { color: '#dc3545' },
  coachingStyle: { color: '#fd7e14' },
  supportingStyle: { color: '#0d6efd' },
  delegatingStyle: { color: '#198754' },
  styleDescription: {
    fontSize: 9,
    color: '#856404',
    lineHeight: 1.3
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
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 30,
    right: 30,
    color: '#6c757d'
  }
})

export const QuickReferencePDF: React.FC<QuickReferencePDFProps> = ({ quickTips, exportDate }) => {
  const categories = Array.from(new Set(quickTips.map(tip => tip.category)))

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>LEADERSHIP QUICK REFERENCE</Text>
          <Text style={styles.headerSubtitle}>Situational Leadership Situation-Specific Guide</Text>
          <Text style={styles.headerSubtitle}>Generated: {exportDate}</Text>
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Reference Summary</Text>
          <Text style={styles.summaryText}>Total Situations: {quickTips.length}</Text>
          <Text style={styles.summaryText}>Categories: {categories.join(', ')}</Text>
        </View>

        {/* Quick Decision Framework */}
        <View style={styles.decisionFramework}>
          <Text style={styles.frameworkTitle}>🎯 Quick Decision Framework</Text>
          <Text style={styles.frameworkStep}>1. Is this a crisis or safety issue? → YES: Use DIRECTING (S1)</Text>
          <Text style={styles.frameworkStep}>2. Does the person have the skills for this task? → NO: Use DIRECTING (S1) or COACHING (S2)</Text>
          <Text style={styles.frameworkStep}>3. Are they motivated and confident? → NO: Use SUPPORTING (S3) | YES: Use DELEGATING (S4)</Text>
        </View>

        {/* Leadership Styles Overview */}
        <View style={styles.stylesOverview}>
          <Text style={styles.overviewTitle}>Leadership Styles Overview</Text>
          <View style={styles.styleGrid}>
            <View style={styles.styleItem}>
              <Text style={[styles.styleHeader, styles.directingStyle]}>DIRECTING (S1)</Text>
              <Text style={styles.styleDescription}>High Direction, Low Support</Text>
              <Text style={styles.styleDescription}>Best for: New team members, crisis situations</Text>
            </View>
            <View style={styles.styleItem}>
              <Text style={[styles.styleHeader, styles.coachingStyle]}>COACHING (S2)</Text>
              <Text style={styles.styleDescription}>High Direction, High Support</Text>
              <Text style={styles.styleDescription}>Best for: Learning new skills, building confidence</Text>
            </View>
            <View style={styles.styleItem}>
              <Text style={[styles.styleHeader, styles.supportingStyle]}>SUPPORTING (S3)</Text>
              <Text style={styles.styleDescription}>Low Direction, High Support</Text>
              <Text style={styles.styleDescription}>Best for: Competent but unmotivated</Text>
            </View>
            <View style={styles.styleItem}>
              <Text style={[styles.styleHeader, styles.delegatingStyle]}>DELEGATING (S4)</Text>
              <Text style={styles.styleDescription}>Low Direction, Low Support</Text>
              <Text style={styles.styleDescription}>Best for: High performers, experienced team</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Guide generated by LD Growth Leadership Development Platform | www.ld-growth.com
        </Text>
      </Page>

      {/* Situation-Specific Tips Pages */}
      {quickTips.map((tip, index) => (
        <Page key={tip.id} size="A4" style={styles.page}>
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Text style={styles.situationTitle}>{index + 1}. {tip.situation.toUpperCase()}</Text>
              <Text style={styles.categoryBadge}>{tip.category}</Text>
            </View>

            <Text style={styles.recommendedStyle}>
              Recommended Style: {tip.recommendedStyle}
            </Text>

            <Text style={styles.subsectionTitle}>✅ KEY ACTIONS TO TAKE:</Text>
            {tip.keyActions.map((action, actionIndex) => (
              <Text key={actionIndex} style={styles.actionItem}>• {action}</Text>
            ))}

            <Text style={styles.subsectionTitle}>💬 COMMUNICATION TIPS:</Text>
            {tip.communicationTips.map((tip, tipIndex) => (
              <Text key={tipIndex} style={styles.communicationItem}>• {tip}</Text>
            ))}

            <Text style={styles.subsectionTitle}>❌ COMMON MISTAKES TO AVOID:</Text>
            {tip.commonMistakes.map((mistake, mistakeIndex) => (
              <Text key={mistakeIndex} style={styles.mistakeItem}>• {mistake}</Text>
            ))}
          </View>

          <Text style={styles.pageNumber}>Page {index + 2}</Text>
          <Text style={styles.footer}>
            Guide generated by LD Growth Leadership Development Platform | www.ld-growth.com
          </Text>
        </Page>
      ))}
    </Document>
  )
}
