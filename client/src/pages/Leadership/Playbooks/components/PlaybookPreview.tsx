import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Playbook } from '@/services/playbookService';

interface PlaybookPreviewProps {
  playbook: Playbook;
}

export default function PlaybookPreview({ playbook }: PlaybookPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print Button */}
      <div className="flex justify-end">
        <Button
          onClick={handlePrint}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print Playbook
        </Button>
      </div>

      {/* Playbook Content */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center border-b-2 border-red-600 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2">
              {playbook.title}
            </h1>
            <h2 className="text-lg text-gray-600">
              {playbook.subtitle || 'Leadership Development Playbook'}
            </h2>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Description */}
            {playbook.description && (
              <div className="text-gray-700 text-lg leading-relaxed">
                {playbook.description}
              </div>
            )}

            {/* Content Blocks */}
            {playbook.contentBlocks && playbook.contentBlocks.length > 0 ? (
              playbook.contentBlocks.map((block, index) => (
                <div key={index} className="border-l-4 border-red-600 pl-6 py-4">
                  {block.type === 'header' && (
                    <div>
                      <h3 className="text-xl font-semibold text-red-600 mb-2">
                        {block.content.title}
                      </h3>
                      {block.content.subtitle && (
                        <p className="text-gray-600">{block.content.subtitle}</p>
                      )}
                    </div>
                  )}

                  {block.type === 'text' && (
                    <div className="prose max-w-none">
                      <p className="text-gray-700">{block.content.text}</p>
                    </div>
                  )}

                  {block.type === 'priority-matrix' && (
                    <div>
                      <h3 className="text-xl font-semibold text-red-600 mb-4">{block.content.title || 'Priority Matrix'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {block.content.quadrants && Array.isArray(block.content.quadrants) ? (
                          block.content.quadrants.map((quadrant: any, qIndex: number) => {
                            const bgColor = quadrant.color === 'red' ? 'bg-red-50 border-red-200' :
                                           quadrant.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                                           quadrant.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                                           'bg-gray-50 border-gray-200';
                            const textColor = quadrant.color === 'red' ? 'text-red-800' :
                                             quadrant.color === 'blue' ? 'text-blue-800' :
                                             quadrant.color === 'yellow' ? 'text-yellow-800' :
                                             'text-gray-800';
                            const subtitleColor = quadrant.color === 'red' ? 'text-red-700' :
                                                 quadrant.color === 'blue' ? 'text-blue-700' :
                                                 quadrant.color === 'yellow' ? 'text-yellow-700' :
                                                 'text-gray-700';
                            const descColor = quadrant.color === 'red' ? 'text-red-600' :
                                             quadrant.color === 'blue' ? 'text-blue-600' :
                                             quadrant.color === 'yellow' ? 'text-yellow-600' :
                                             'text-gray-600';

                            return (
                              <div key={qIndex} className={`border rounded-lg p-4 ${bgColor}`}>
                                <h4 className={`font-bold mb-2 ${textColor}`}>
                                  {quadrant.title}
                                </h4>
                                <p className={`text-sm font-medium mb-2 ${subtitleColor}`}>
                                  {quadrant.action || quadrant.subtitle}
                                </p>
                                <p className={`text-sm ${descColor}`}>
                                  {quadrant.description}
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          /* Fallback for old object-based structure */
                          <>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <h4 className="font-bold text-red-800 mb-2">URGENT + IMPORTANT</h4>
                              <p className="text-sm font-medium text-red-700 mb-2">DO FIRST</p>
                              <p className="text-sm text-red-600">Critical issues requiring immediate attention</p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h4 className="font-bold text-blue-800 mb-2">IMPORTANT + NOT URGENT</h4>
                              <p className="text-sm font-medium text-blue-700 mb-2">SCHEDULE</p>
                              <p className="text-sm text-blue-600">Important tasks to plan and schedule</p>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <h4 className="font-bold text-yellow-800 mb-2">URGENT + NOT IMPORTANT</h4>
                              <p className="text-sm font-medium text-yellow-700 mb-2">DELEGATE</p>
                              <p className="text-sm text-yellow-600">Tasks that can be delegated to others</p>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <h4 className="font-bold text-gray-800 mb-2">NOT URGENT + NOT IMPORTANT</h4>
                              <p className="text-sm font-medium text-gray-700 mb-2">ELIMINATE</p>
                              <p className="text-sm text-gray-600">Activities to minimize or eliminate</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {(block.type === 'smart-template' || block.type === 'practice-section') && (
                    <div>
                      <h3 className="text-xl font-semibold text-red-600 mb-4">{block.content.title || 'SMART Goals'}</h3>

                      {/* Check for practice-section with exercises (actual SMART goals) */}
                      {block.type === 'practice-section' && block.content.exercises && block.content.exercises.length > 0 ? (
                        <div className="space-y-4">
                          {block.content.exercises.map((exercise: any, exerciseIndex: number) => (
                            <div key={exerciseIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <h4 className="font-semibold text-red-600 mb-3">{exercise.title || `Goal ${exerciseIndex + 1}`}</h4>
                              <div className="space-y-2 text-sm">
                                {exercise.fields && exercise.fields.map((field: any, fieldIndex: number) => (
                                  <div key={fieldIndex}>
                                    <strong>{field.label}:</strong> {field.value}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : block.content.goals && block.content.goals.length > 0 ? (
                        /* If there are actual goals in smart-template format, show them */
                        <div className="space-y-4">
                          {block.content.goals.map((goal: any, goalIndex: number) => (
                            <div key={goalIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <h4 className="font-semibold text-red-600 mb-3">{goal.title}</h4>
                              <div className="space-y-2 text-sm">
                                <div><strong>Specific:</strong> {goal.specific}</div>
                                <div><strong>Measurable:</strong> {goal.measurable}</div>
                                <div><strong>Achievable:</strong> {goal.achievable}</div>
                                <div><strong>Relevant:</strong> {goal.relevant}</div>
                                <div><strong>Time-bound:</strong> {goal.timeBound}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : block.content.items && block.content.items.length > 0 ? (
                        /* If it's a template with items, show the template */
                        <div className="space-y-4">
                          {block.content.items.map((item: any, itemIndex: number) => (
                            <div key={itemIndex} className="bg-blue-50 border-l-4 border-red-600 p-4 rounded-r">
                              <div className="font-bold text-red-600">{item.label}</div>
                              <div className="text-gray-600 italic mt-2">{item.prompt}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No SMART goals or template defined yet.</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">This playbook doesn't have any content yet.</p>
                <p className="text-gray-400 text-sm mt-2">Add content blocks to build your playbook.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
