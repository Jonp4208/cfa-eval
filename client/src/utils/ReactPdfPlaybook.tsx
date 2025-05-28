import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Playbook } from '../types';

// Register fonts (optional - you can use system fonts)
// Font.register({
//   family: 'Open Sans',
//   src: 'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf'
// });

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#dc2626',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  stepHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderLeft: 4,
    borderLeftColor: '#dc2626',
  },
  stepContent: {
    marginLeft: 10,
    marginBottom: 15,
  },
  text: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 1.5,
  },
  listItem: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 4,
    marginLeft: 15,
    lineHeight: 1.4,
  },
  matrix: {
    marginTop: 10,
    marginBottom: 10,
  },
  matrixTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  matrixRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 4,
  },
  matrixCell: {
    flex: 1,
    fontSize: 9,
    color: '#374151',
    paddingHorizontal: 4,
  },
  matrixHeader: {
    backgroundColor: '#f9fafb',
    fontWeight: 'bold',
  },
  examples: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderLeft: 3,
    borderLeftColor: '#3b82f6',
  },
  exampleTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  exampleText: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.4,
  },
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

interface PlaybookPDFProps {
  playbook: Playbook;
}

const PlaybookPDF: React.FC<PlaybookPDFProps> = ({ playbook }) => {
  // Filter and sort content blocks (exclude step 5)
  const contentBlocks = playbook.contentBlocks
    .filter(block => {
      if (block.type === 'step-section' && block.content.stepNumber === 5) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.order - b.order);

  // Group content blocks by step
  const stepGroups: { [key: number]: any[] } = {};
  contentBlocks.forEach(block => {
    if (block.type === 'step-section') {
      const stepNum = block.content.stepNumber;
      if (!stepGroups[stepNum]) {
        stepGroups[stepNum] = [];
      }
      stepGroups[stepNum].push(block);
    } else {
      // Find the appropriate step for this block based on order
      const stepNum = Math.ceil(block.order / 10) || 1;
      if (!stepGroups[stepNum]) {
        stepGroups[stepNum] = [];
      }
      stepGroups[stepNum].push(block);
    }
  });

  const renderContentBlock = (block: any) => {
    switch (block.type) {
      case 'step-section':
        return (
          <View key={block.id} style={styles.section}>
            <Text style={styles.stepHeader}>
              Step {block.content.stepNumber}: {block.content.title}
            </Text>
          </View>
        );

      case 'text':
        return (
          <View key={block.id} style={styles.stepContent}>
            <Text style={styles.text}>{block.content.text}</Text>
          </View>
        );

      case 'checklist':
        return (
          <View key={block.id} style={styles.stepContent}>
            <Text style={styles.matrixTitle}>{block.content.title}</Text>
            {block.content.items.map((item: string, index: number) => (
              <Text key={index} style={styles.listItem}>
                • {item}
              </Text>
            ))}
          </View>
        );

      case 'matrix':
        return (
          <View key={block.id} style={styles.matrix}>
            <Text style={styles.matrixTitle}>{block.content.title}</Text>
            {block.content.headers && (
              <View style={[styles.matrixRow, styles.matrixHeader]}>
                {block.content.headers.map((header: string, index: number) => (
                  <Text key={index} style={styles.matrixCell}>{header}</Text>
                ))}
              </View>
            )}
            {block.content.rows?.map((row: string[], rowIndex: number) => (
              <View key={rowIndex} style={styles.matrixRow}>
                {row.map((cell: string, cellIndex: number) => (
                  <Text key={cellIndex} style={styles.matrixCell}>{cell}</Text>
                ))}
              </View>
            ))}
          </View>
        );

      case 'examples':
        return (
          <View key={block.id} style={styles.examples}>
            <Text style={styles.exampleTitle}>{block.content.title}</Text>
            {block.content.items?.map((item: string, index: number) => (
              <Text key={index} style={styles.exampleText}>
                • {item}
              </Text>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{playbook.title}</Text>
          <Text style={styles.subtitle}>Leadership Development Playbook</Text>
          <Text style={styles.text}>{playbook.description}</Text>
        </View>

        {/* Content */}
        {Object.keys(stepGroups)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(stepNum => (
            <View key={stepNum}>
              {stepGroups[parseInt(stepNum)].map(block => renderContentBlock(block))}
            </View>
          ))}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by LD Growth Leadership Development Platform
        </Text>
      </Page>
    </Document>
  );
};

export default PlaybookPDF;
