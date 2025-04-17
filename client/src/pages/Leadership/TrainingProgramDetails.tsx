import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  BookOpen,
  Users,
  Calendar,
  Heart,
  Clock,
  Brain,
  GraduationCap,
  Trophy,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { TRAINING_PROGRAMS } from './TrainingPrograms'

export default function TrainingProgramDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [enrollmentStatus, setEnrollmentStatus] = useState<'not-started' | 'pending' | 'enrolled'>('not-started')

  const program = TRAINING_PROGRAMS.find(p => p.id === id)

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-lg font-semibold">Training program not found</div>
        <Button onClick={() => navigate('/leadership/training-programs')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Programs
        </Button>
      </div>
    )
  }

  const handleEnroll = () => {
    setEnrollmentStatus('pending')
    // TODO: Implement enrollment logic
    setTimeout(() => {
      setEnrollmentStatus('enrolled')
    }, 1500)
  }

  const Icon = program.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[20px] p-6 md:p-8 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-[#E51636]/10 text-[#E51636] rounded-2xl flex items-center justify-center">
            <Icon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#27251F]">{program.title}</h1>
            <p className="text-[#27251F]/60 mt-1">{program.description}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/leadership/training-programs')}
              className="border-[#E51636] text-[#E51636] hover:bg-[#E51636]/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Programs
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Program Overview */}
          <Card className="bg-white p-6 hover:shadow-md transition-shadow rounded-[20px] border border-gray-100">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#27251F]">Program Overview</h3>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  program.level === 'beginner' ? 'bg-green-100 text-green-700' :
                  program.level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {program.level.charAt(0).toUpperCase() + program.level.slice(1)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-[#E51636]/5 text-[#E51636] rounded-lg flex items-center justify-center">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Modules</div>
                    <div className="font-medium">{program.modules.length} Total</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-[#E51636]/5 text-[#E51636] rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-medium">{program.duration}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Modules */}
          <Card className="bg-white p-6 hover:shadow-md transition-shadow rounded-[20px] border border-gray-100">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#27251F]">Program Modules</h3>
              <div className="space-y-4">
                {program.modules.map((module, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-[#27251F]">{module.title}</h4>
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          module.format === 'workshop' ? 'bg-blue-100 text-blue-700' :
                          module.format === 'online' ? 'bg-green-100 text-green-700' :
                          module.format === 'hybrid' ? 'bg-purple-100 text-purple-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {module.format.charAt(0).toUpperCase() + module.format.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{module.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Duration: {module.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Card */}
          <Card className="bg-white p-6 hover:shadow-md transition-shadow rounded-[20px] border border-gray-100 sticky top-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#27251F]">Program Enrollment</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Next Start Date</span>
                    <span className="font-medium">Immediate Access</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Certification</span>
                    <span className="font-medium">{program.certification.title}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Validity</span>
                    <span className="font-medium">{program.certification.validityPeriod}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleEnroll}
                  disabled={enrollmentStatus !== 'not-started'}
                  className="w-full bg-[#E51636] text-white hover:bg-[#E51636]/90 h-12"
                >
                  {enrollmentStatus === 'not-started' && 'Enroll Now'}
                  {enrollmentStatus === 'pending' && (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2" />
                      Processing...
                    </>
                  )}
                  {enrollmentStatus === 'enrolled' && (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Enrolled
                    </>
                  )}
                </Button>
                {enrollmentStatus === 'enrolled' && (
                  <Button
                    onClick={() => navigate('/leadership/training-programs/my-programs')}
                    variant="outline"
                    className="w-full border-[#E51636] text-[#E51636] hover:bg-[#E51636]/5"
                  >
                    View My Programs
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-[#27251F]">What's Included:</h4>
                <ul className="space-y-2">
                  {program.modules.map((module, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {module.title}
                    </li>
                  ))}
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {program.certification.title} Certification
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Lifetime Access to Materials
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 