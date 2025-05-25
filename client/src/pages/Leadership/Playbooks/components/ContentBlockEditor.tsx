import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  GripVertical,
  Plus,
  Minus
} from 'lucide-react';
import { ContentBlock } from '@/services/playbookService';

interface ContentBlockEditorProps {
  block: ContentBlock;
  index: number;
  onUpdate: (content: any) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function ContentBlockEditor({
  block,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}: ContentBlockEditorProps) {
  const getBlockTitle = () => {
    switch (block.type) {
      case 'header': return 'Header';
      case 'text': return 'Text Block';
      case 'step-section': return `Step ${block.content.stepNumber || index + 1}`;
      case 'priority-matrix': return 'Priority Matrix';
      case 'smart-template': return 'SMART Template';
      case 'checklist': return 'Checklist';
      case 'example-box': return 'Example Box';
      case 'warning-box': return 'Warning Box';
      case 'success-box': return 'Success Box';
      case 'practice-section': return 'Practice Exercise';
      default: return 'Content Block';
    }
  };

  const renderEditor = () => {
    switch (block.type) {
      case 'header':
        return (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={block.content.title || ''}
                onChange={(e) => onUpdate({ ...block.content, title: e.target.value })}
                placeholder="Enter header title..."
              />
            </div>
            <div>
              <Label>Subtitle (optional)</Label>
              <Input
                value={block.content.subtitle || ''}
                onChange={(e) => onUpdate({ ...block.content, subtitle: e.target.value })}
                placeholder="Enter subtitle..."
              />
            </div>
          </div>
        );

      case 'text':
        return (
          <div>
            <Label>Text Content</Label>
            <Textarea
              value={block.content.text || ''}
              onChange={(e) => onUpdate({ ...block.content, text: e.target.value })}
              placeholder="Enter your text content..."
              rows={4}
            />
          </div>
        );

      case 'step-section':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Step Number</Label>
                <Input
                  type="number"
                  value={block.content.stepNumber || 1}
                  onChange={(e) => onUpdate({ ...block.content, stepNumber: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>
              <div>
                <Label>Step Title</Label>
                <Input
                  value={block.content.title || ''}
                  onChange={(e) => onUpdate({ ...block.content, title: e.target.value })}
                  placeholder="Step title..."
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={block.content.description || ''}
                onChange={(e) => onUpdate({ ...block.content, description: e.target.value })}
                placeholder="Step description..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'priority-matrix':
        return (
          <div className="space-y-4">
            <div>
              <Label>Matrix Title</Label>
              <Input
                value={block.content.title || 'Priority Matrix'}
                onChange={(e) => onUpdate({ ...block.content, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {block.content.quadrants?.map((quadrant: any, i: number) => (
                <div key={i} className="space-y-2 p-3 border rounded-lg">
                  <Input
                    value={quadrant.title}
                    onChange={(e) => {
                      const newQuadrants = [...block.content.quadrants];
                      newQuadrants[i] = { ...quadrant, title: e.target.value };
                      onUpdate({ ...block.content, quadrants: newQuadrants });
                    }}
                    placeholder="Quadrant title"
                    className="font-semibold"
                  />
                  <Input
                    value={quadrant.action}
                    onChange={(e) => {
                      const newQuadrants = [...block.content.quadrants];
                      newQuadrants[i] = { ...quadrant, action: e.target.value };
                      onUpdate({ ...block.content, quadrants: newQuadrants });
                    }}
                    placeholder="Action"
                  />
                  <Textarea
                    value={quadrant.description}
                    onChange={(e) => {
                      const newQuadrants = [...block.content.quadrants];
                      newQuadrants[i] = { ...quadrant, description: e.target.value };
                      onUpdate({ ...block.content, quadrants: newQuadrants });
                    }}
                    placeholder="Description"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'smart-template':
        return (
          <div className="space-y-4">
            <div>
              <Label>Template Title</Label>
              <Input
                value={block.content.title || 'SMART Goal Template'}
                onChange={(e) => onUpdate({ ...block.content, title: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              {block.content.items?.map((item: any, i: number) => (
                <div key={i} className="space-y-2 p-3 border rounded-lg">
                  <Input
                    value={item.label}
                    onChange={(e) => {
                      const newItems = [...block.content.items];
                      newItems[i] = { ...item, label: e.target.value };
                      onUpdate({ ...block.content, items: newItems });
                    }}
                    placeholder="Label (e.g., S - Specific)"
                  />
                  <Textarea
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...block.content.items];
                      newItems[i] = { ...item, description: e.target.value };
                      onUpdate({ ...block.content, items: newItems });
                    }}
                    placeholder="Description"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'checklist':
        return (
          <div className="space-y-4">
            <div>
              <Label>Checklist Title</Label>
              <Input
                value={block.content.title || 'Checklist'}
                onChange={(e) => onUpdate({ ...block.content, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const newItems = [...(block.content.items || []), 'New item'];
                    onUpdate({ ...block.content, items: newItems });
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>
              {block.content.items?.map((item: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...block.content.items];
                      newItems[i] = e.target.value;
                      onUpdate({ ...block.content, items: newItems });
                    }}
                    placeholder="Checklist item"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newItems = block.content.items.filter((_: any, index: number) => index !== i);
                      onUpdate({ ...block.content, items: newItems });
                    }}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'example-box':
        return (
          <div className="space-y-4">
            <div>
              <Label>Example Title</Label>
              <Input
                value={block.content.title || 'Example'}
                onChange={(e) => onUpdate({ ...block.content, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Example Type</Label>
              <select
                value={block.content.type || 'good'}
                onChange={(e) => onUpdate({ ...block.content, type: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="good">Good Example (✅)</option>
                <option value="bad">Bad Example (❌)</option>
                <option value="info">Information (🔍)</option>
              </select>
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={block.content.content || ''}
                onChange={(e) => onUpdate({ ...block.content, content: e.target.value })}
                placeholder="Example content..."
                rows={3}
              />
            </div>
            {block.content.explanation && (
              <div>
                <Label>Explanation (optional)</Label>
                <Textarea
                  value={block.content.explanation || ''}
                  onChange={(e) => onUpdate({ ...block.content, explanation: e.target.value })}
                  placeholder="Why this example works/doesn't work..."
                  rows={2}
                />
              </div>
            )}
          </div>
        );

      case 'warning-box':
      case 'success-box':
        return (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={block.content.title || (block.type === 'warning-box' ? 'Important Warning' : 'Success Metrics')}
                onChange={(e) => onUpdate({ ...block.content, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const newItems = [...(block.content.items || []), 'New item'];
                    onUpdate({ ...block.content, items: newItems });
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>
              {block.content.items?.map((item: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...block.content.items];
                      newItems[i] = e.target.value;
                      onUpdate({ ...block.content, items: newItems });
                    }}
                    placeholder="Item"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newItems = block.content.items.filter((_: any, index: number) => index !== i);
                      onUpdate({ ...block.content, items: newItems });
                    }}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'practice-section':
        return (
          <div className="space-y-4">
            <div>
              <Label>Exercise Title</Label>
              <Input
                value={block.content.title || 'Practice Exercise'}
                onChange={(e) => onUpdate({ ...block.content, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={block.content.description || ''}
                onChange={(e) => onUpdate({ ...block.content, description: e.target.value })}
                placeholder="Exercise instructions..."
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              Editor for "{block.type}" content block coming soon.
            </p>
          </div>
        );
    }
  };

  return (
    <Card className="border-l-4 border-[#E51636]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <h4 className="font-semibold text-sm">{getBlockTitle()}</h4>
          </div>
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <Button size="sm" variant="ghost" onClick={onMoveUp}>
                <ChevronUp className="w-4 h-4" />
              </Button>
            )}
            {onMoveDown && (
              <Button size="sm" variant="ghost" onClick={onMoveDown}>
                <ChevronDown className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {renderEditor()}
      </CardContent>
    </Card>
  );
}
