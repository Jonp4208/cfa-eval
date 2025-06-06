import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const SituationalLeadershipDiagram: React.FC = () => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
          <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">SL</span>
          </div>
          Situational Leadership Model
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Leadership Styles Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* S1 - Directing */}
          <div className="bg-red-100 border-2 border-red-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-red-600 text-white text-xs">S1</Badge>
              <span className="text-xs text-red-700 font-medium">High Direction</span>
            </div>
            <h4 className="font-bold text-red-800 text-sm mb-1">DIRECTING</h4>
            <p className="text-xs text-red-700 mb-2">High Direction, Low Support</p>
            <div className="text-xs text-red-600">
              <div className="font-medium mb-1">When to use:</div>
              <ul className="space-y-0.5">
                <li>• New team members</li>
                <li>• Crisis situations</li>
                <li>• Safety issues</li>
              </ul>
            </div>
          </div>

          {/* S2 - Coaching */}
          <div className="bg-orange-100 border-2 border-orange-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-orange-600 text-white text-xs">S2</Badge>
              <span className="text-xs text-orange-700 font-medium">High Support</span>
            </div>
            <h4 className="font-bold text-orange-800 text-sm mb-1">COACHING</h4>
            <p className="text-xs text-orange-700 mb-2">High Direction, High Support</p>
            <div className="text-xs text-orange-600">
              <div className="font-medium mb-1">When to use:</div>
              <ul className="space-y-0.5">
                <li>• Learning new skills</li>
                <li>• Building confidence</li>
                <li>• Need encouragement</li>
              </ul>
            </div>
          </div>

          {/* S3 - Supporting */}
          <div className="bg-blue-100 border-2 border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-blue-600 text-white text-xs">S3</Badge>
              <span className="text-xs text-blue-700 font-medium">Low Direction</span>
            </div>
            <h4 className="font-bold text-blue-800 text-sm mb-1">SUPPORTING</h4>
            <p className="text-xs text-blue-700 mb-2">Low Direction, High Support</p>
            <div className="text-xs text-blue-600">
              <div className="font-medium mb-1">When to use:</div>
              <ul className="space-y-0.5">
                <li>• Competent but cautious</li>
                <li>• Problem-solving</li>
                <li>• Need motivation</li>
              </ul>
            </div>
          </div>

          {/* S4 - Delegating */}
          <div className="bg-green-100 border-2 border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-green-600 text-white text-xs">S4</Badge>
              <span className="text-xs text-green-700 font-medium">Low Support</span>
            </div>
            <h4 className="font-bold text-green-800 text-sm mb-1">DELEGATING</h4>
            <p className="text-xs text-green-700 mb-2">Low Direction, Low Support</p>
            <div className="text-xs text-green-600">
              <div className="font-medium mb-1">When to use:</div>
              <ul className="space-y-0.5">
                <li>• High performers</li>
                <li>• Experienced team</li>
                <li>• Routine tasks</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Development Levels */}
        <div className="border-t border-blue-200 pt-4">
          <h4 className="font-semibold text-blue-900 text-sm mb-3">Development Levels</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">D1</Badge>
              <span className="text-gray-700">Enthusiastic Beginner → Use S1</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">D2</Badge>
              <span className="text-gray-700">Disillusioned Learner → Use S2</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">D3</Badge>
              <span className="text-gray-700">Capable but Cautious → Use S3</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">D4</Badge>
              <span className="text-gray-700">Self-Reliant Achiever → Use S4</span>
            </div>
          </div>
        </div>

        {/* Quick Decision Guide */}
        <div className="border-t border-blue-200 pt-4">
          <h4 className="font-semibold text-blue-900 text-sm mb-2">Quick Decision Guide</h4>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="text-xs text-gray-700 space-y-1">
              <div><strong>1. Crisis/Safety?</strong> → Use S1 (Directing)</div>
              <div><strong>2. Have skills?</strong> No → S1/S2 | Yes → Step 3</div>
              <div><strong>3. Motivated?</strong> No → S3 | Yes → S4</div>
            </div>
          </div>
        </div>

        {/* Key Principle */}
        <div className="bg-blue-600 text-white rounded-lg p-3 text-center">
          <p className="text-xs font-medium">
            💡 Match your style to their development level for the specific task, not their overall experience!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
