import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

interface CommunicationExample {
  situation: string
  directing: string
  coaching: string
  supporting: string
  delegating: string
}

interface CommunicationGuidePDFProps {
  examples: CommunicationExample[]
  exportDate: string
  customExamplesCount: number
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
  exampleCard: {
    backgroundColor: '#ffffff',
    border: '2px solid #E51636',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    breakInside: 'avoid'
  },
  situationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E51636',
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  styleSection: {
    marginBottom: 12
  },
  styleHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
    padding: 5,
    marginBottom: 5,
    borderRadius: 3
  },
  directingHeader: {
    backgroundColor: '#dc3545'
  },
  coachingHeader: {
    backgroundColor: '#fd7e14'
  },
  supportingHeader: {
    backgroundColor: '#0d6efd'
  },
  delegatingHeader: {
    backgroundColor: '#198754'
  },
  styleText: {
    fontSize: 10,
    color: '#495057',
    lineHeight: 1.4,
    fontStyle: 'italic',
    paddingLeft: 10,
    borderLeft: '2px solid #e9ecef'
  },
  quickRefSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8
  },
  quickRefTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10
  },
  quickRefGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  quickRefItem: {
    width: '48%',
    marginBottom: 10
  },
  quickRefHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 3
  },
  quickRefText: {
    fontSize: 9,
    color: '#424242',
    lineHeight: 1.3
  },
  tipsSection: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 8
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8
  },
  tipText: {
    fontSize: 10,
    color: '#856404',
    marginBottom: 3
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

export const CommunicationGuidePDF: React.FC<CommunicationGuidePDFProps> = ({ 
  examples, 
  exportDate, 
  customExamplesCount 
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>COMMUNICATION STYLE GUIDE</Text>
          <Text style={styles.headerSubtitle}>Situational Leadership Communication Examples</Text>
          <Text style={styles.headerSubtitle}>Generated: {exportDate}</Text>
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Guide Summary</Text>
          <Text style={styles.summaryText}>Total Communication Examples: {examples.length}</Text>
          <Text style={styles.summaryText}>Pre-built Examples: {examples.length - customExamplesCount}</Text>
          <Text style={styles.summaryText}>Custom Examples: {customExamplesCount}</Text>
        </View>

        {/* Quick Reference */}
        <View style={styles.quickRefSection}>
          <Text style={styles.quickRefTitle}>Leadership Style Quick Reference</Text>
          <View style={styles.quickRefGrid}>
            <View style={styles.quickRefItem}>
              <Text style={[styles.quickRefHeader, { color: '#dc3545' }]}>DIRECTING (S1)</Text>
              <Text style={styles.quickRefText}>High Direction, Low Support</Text>
              <Text style={styles.quickRefText}>Use with: New team members, crisis situations</Text>
              <Text style={styles.quickRefText}>Approach: Tell them what, when, where, how</Text>
            </View>
            <View style={styles.quickRefItem}>
              <Text style={[styles.quickRefHeader, { color: '#fd7e14' }]}>COACHING (S2)</Text>
              <Text style={styles.quickRefText}>High Direction, High Support</Text>
              <Text style={styles.quickRefText}>Use with: Learning new skills, building confidence</Text>
              <Text style={styles.quickRefText}>Approach: Explain decisions, invite questions</Text>
            </View>
            <View style={styles.quickRefItem}>
              <Text style={[styles.quickRefHeader, { color: '#0d6efd' }]}>SUPPORTING (S3)</Text>
              <Text style={styles.quickRefText}>Low Direction, High Support</Text>
              <Text style={styles.quickRefText}>Use with: Competent but unmotivated</Text>
              <Text style={styles.quickRefText}>Approach: Listen, encourage, facilitate</Text>
            </View>
            <View style={styles.quickRefItem}>
              <Text style={[styles.quickRefHeader, { color: '#198754' }]}>DELEGATING (S4)</Text>
              <Text style={styles.quickRefText}>Low Direction, Low Support</Text>
              <Text style={styles.quickRefText}>Use with: High performers, experienced team</Text>
              <Text style={styles.quickRefText}>Approach: Turn over responsibility</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Guide generated by LD Growth Leadership Development Platform | www.ld-growth.com
        </Text>
      </Page>

      {/* Communication Examples Pages */}
      {examples.map((example, index) => (
        <Page key={index} size="A4" style={styles.page}>
          <View style={styles.exampleCard}>
            <Text style={styles.situationTitle}>
              {index + 1}. {example.situation}
            </Text>

            <View style={styles.styleSection}>
              <Text style={[styles.styleHeader, styles.directingHeader]}>
                DIRECTING STYLE (S1)
              </Text>
              <Text style={styles.styleText}>"{example.directing}"</Text>
            </View>

            <View style={styles.styleSection}>
              <Text style={[styles.styleHeader, styles.coachingHeader]}>
                COACHING STYLE (S2)
              </Text>
              <Text style={styles.styleText}>"{example.coaching}"</Text>
            </View>

            <View style={styles.styleSection}>
              <Text style={[styles.styleHeader, styles.supportingHeader]}>
                SUPPORTING STYLE (S3)
              </Text>
              <Text style={styles.styleText}>"{example.supporting}"</Text>
            </View>

            <View style={styles.styleSection}>
              <Text style={[styles.styleHeader, styles.delegatingHeader]}>
                DELEGATING STYLE (S4)
              </Text>
              <Text style={styles.styleText}>"{example.delegating}"</Text>
            </View>
          </View>

          {index === examples.length - 1 && (
            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>💡 Communication Tips for Success</Text>
              <Text style={styles.tipText}>1. Match your communication style to the team member's development level</Text>
              <Text style={styles.tipText}>2. Be clear and specific when directing</Text>
              <Text style={styles.tipText}>3. Ask questions and listen when coaching</Text>
              <Text style={styles.tipText}>4. Provide encouragement when supporting</Text>
              <Text style={styles.tipText}>5. Give autonomy when delegating</Text>
              <Text style={styles.tipText}>6. Adjust your style based on the situation and individual needs</Text>
            </View>
          )}

          <Text style={styles.pageNumber}>Page {index + 2}</Text>
          <Text style={styles.footer}>
            Guide generated by LD Growth Leadership Development Platform | www.ld-growth.com
          </Text>
        </Page>
      ))}
    </Document>
  )
}
