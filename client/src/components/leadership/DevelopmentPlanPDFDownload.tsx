import React from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import DevelopmentPlanPDF from './DevelopmentPlanPDF'

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

interface DevelopmentPlanPDFDownloadProps {
  data: DevelopmentPlanData
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const DevelopmentPlanPDFDownload: React.FC<DevelopmentPlanPDFDownloadProps> = ({ 
  data, 
  className = '',
  variant = 'outline',
  size = 'sm'
}) => {
  // Generate filename based on team member name and date
  const generateFileName = () => {
    const memberName = data.teamMemberName || 'Team-Member'
    const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const sanitizedName = memberName.replace(/[^a-zA-Z0-9]/g, '-')
    return `90-Day-Development-Plan-${sanitizedName}-${date}.pdf`
  }

  return (
    <PDFDownloadLink
      document={<DevelopmentPlanPDF data={data} />}
      fileName={generateFileName()}
    >
      {({ blob, url, loading, error }) => (
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  )
}

export default DevelopmentPlanPDFDownload
