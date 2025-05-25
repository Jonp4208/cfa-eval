import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Playbook } from '@/services/playbookService';

interface PlaybookPreviewProps {
  playbook: Playbook;
}

export default function PlaybookPreview({ playbook }: PlaybookPreviewProps) {
  const renderContentBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'header':
        return (
          <div className="text-center border-b-3 border-[#E51636] pb-5 mb-8">
            <h1 className="text-3xl font-bold text-[#E51636] mb-2">
              {block.content.title}
            </h1>
            {block.content.subtitle && (
              <h2 className="text-lg text-gray-600">
                {block.content.subtitle}
              </h2>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700">{block.content.text}</p>
          </div>
        );

      case 'step-section':
        return (
          <div className="bg-blue-50 border-l-4 border-[#E51636] p-6 rounded-r-lg mb-6">
            <div className="flex items-center mb-4">
              <div className="bg-[#E51636] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                {block.content.stepNumber}
              </div>
              <h3 className="text-xl font-semibold text-[#E51636]">
                {block.content.title}
              </h3>
            </div>
            <p className="text-gray-700 font-semibold">{block.content.description}</p>
          </div>
        );

      case 'priority-matrix':
        return (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-center mb-6">{block.content.title}</h4>
            <div className="grid grid-cols-2 gap-4">
              {block.content.quadrants?.map((quadrant: any, i: number) => {
                const colorClasses = {
                  red: 'bg-red-50 border-2 border-red-600 text-red-800',
                  blue: 'bg-blue-50 border-2 border-blue-600 text-blue-800',
                  yellow: 'bg-yellow-50 border-2 border-yellow-600 text-yellow-800',
                  gray: 'bg-gray-50 border-2 border-gray-600 text-gray-800'
                };

                return (
                  <div key={i} className={`rounded-lg p-4 text-center ${colorClasses[quadrant.color as keyof typeof colorClasses] || colorClasses.gray}`}>
                    <h5 className="font-bold mb-1">{quadrant.title}</h5>
                    <p className="text-sm font-medium mb-2">{quadrant.action}</p>
                    <p className="text-sm">{quadrant.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'smart-template':
        return (
          <div className="bg-white border-2 border-[#E51636] rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold mb-4 text-[#E51636]">{block.content.title}</h4>
            <div className="space-y-4">
              {block.content.items?.map((item: any, i: number) => (
                <div key={i} className="bg-blue-50 border-l-3 border-[#E51636] p-3 rounded-r">
                  <div className="font-bold text-[#E51636]">{item.label}</div>
                  <div className="text-gray-600 italic mt-1">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'checklist':
        return (
          <div className="bg-gray-50 rounded-lg p-5 mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">{block.content.title}</h4>
            <div className="space-y-2">
              {block.content.items?.map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-gray-500 mt-1">☐</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'example-box':
        const getExampleIcon = (type: string) => {
          switch (type) {
            case 'good': return '✅';
            case 'bad': return '❌';
            case 'info': return '🔍';
            default: return '💡';
          }
        };

        const getExampleLabel = (type: string) => {
          switch (type) {
            case 'good': return 'GOOD Example';
            case 'bad': return 'BAD Example';
            case 'info': return 'Examples';
            default: return 'Example';
          }
        };

        return (
          <div className="bg-blue-50 border border-gray-200 rounded-lg p-5 mb-6">
            <div className="text-blue-800 font-semibold mb-3">
              {getExampleIcon(block.content.type)} {getExampleLabel(block.content.type)}:
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-semibold">{block.content.content}</p>
              {block.content.explanation && (
                <p className="text-gray-600 italic">{block.content.explanation}</p>
              )}
            </div>
          </div>
        );

      case 'warning-box':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-6">
            <h4 className="font-semibold text-red-800 mb-3 flex items-center">
              <span className="mr-2">⚠️</span>
              {block.content.title}
            </h4>
            <ul className="space-y-2 text-sm">
              {block.content.items?.map((item: string, i: number) => (
                <li key={i} className="text-red-700">{item}</li>
              ))}
            </ul>
          </div>
        );

      case 'success-box':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-6">
            <h4 className="font-semibold text-green-800 mb-3">✅ {block.content.title}</h4>
            <div className="space-y-1 text-sm text-green-700">
              {block.content.items?.map((item: string, i: number) => (
                <p key={i}>{item}</p>
              ))}
            </div>
          </div>
        );

      case 'practice-section':
        return (
          <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-6 mb-6">
            <h3 className="text-yellow-800 font-bold mb-4">🎯 {block.content.title}</h3>
            <p className="font-semibold mb-4">{block.content.description}</p>

            {block.content.exercises?.map((exercise: any, i: number) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-yellow-200 mb-4">
                <p className="font-semibold mb-3">{exercise.title}: _________________________________</p>
                <div className="ml-4 space-y-2 text-sm">
                  {exercise.fields?.map((field: any, j: number) => (
                    <p key={j}><strong>{field.label}:</strong> _________________________________</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg mb-6">
            <p className="text-sm text-gray-600">
              Content block type "{block.type}" - Renderer coming soon
            </p>
            <pre className="mt-2 text-xs text-gray-500 overflow-auto">
              {JSON.stringify(block.content, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <Card className="bg-white rounded-[20px] shadow-sm">
      <CardContent className="p-0">
        <div className="playbook-content p-6 space-y-6">
          {playbook.contentBlocks.length === 0 ? (
            <div className="text-center p-8">
              <h3 className="mt-2 text-lg font-medium text-gray-900">No content yet</h3>
              <p className="mt-1 text-sm text-gray-500">Add content blocks to build your playbook</p>
            </div>
          ) : (
            playbook.contentBlocks
              .sort((a, b) => a.order - b.order)
              .map((block, index) => (
                <div key={index}>
                  {renderContentBlock(block, index)}
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
