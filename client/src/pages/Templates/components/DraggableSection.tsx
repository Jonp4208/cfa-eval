// client/src/pages/Templates/components/DraggableSection.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface Props {
  section: {
    id: string;
    title: string;
    description: string;
    criteria: Array<{
      id: string;
      name: string;
      description: string;
      gradingScale: string;
      required: boolean;
    }>;
  };
  index: number;
  errors: any;
  onUpdateSection: (id: string, field: string, value: string) => void;
  onRemoveSection: (id: string) => void;
  onAddCriterion: (sectionId: string) => void;
  onRemoveCriterion: (sectionId: string, criterionId: string) => void;
  onUpdateCriterion: (sectionId: string, criterionId: string, field: string, value: any) => void;
  renderCriterionForm: (criterion: any, sectionId: string, index: number) => React.ReactNode;
}

export default function DraggableSection({
  section,
  index,
  errors,
  onUpdateSection,
  onRemoveSection,
  onAddCriterion,
  onRemoveCriterion,
  onUpdateCriterion,
  renderCriterionForm
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    position: isDragging ? 'relative' : 'static',
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`p-5 space-y-4 border-2 ${isDragging ? 'border-[#E51636]/50 shadow-lg' : 'border-gray-100'} transition-all duration-200`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div
                {...attributes}
                {...listeners}
                className="h-10 w-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-grab"
                title="Drag to reorder section"
              >
                <GripVertical className="h-5 w-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <Label htmlFor={`section-${section.id}-title`} className="text-base font-medium flex items-center">
                  Section Title
                  <span className="ml-1 text-red-500">*</span>
                </Label>
                <Input
                  id={`section-${section.id}-title`}
                  value={section.title}
                  onChange={(e) => onUpdateSection(section.id, 'title', e.target.value)}
                  className="mt-1.5 h-10 rounded-lg"
                  placeholder="E.g., Customer Service Skills"
                />
                <p className="mt-1 text-xs text-gray-500">Give this section a clear, descriptive title</p>
              </div>
            </div>
            <div>
              <Label htmlFor={`section-${section.id}-description`} className="text-base font-medium">Description</Label>
              <Textarea
                id={`section-${section.id}-description`}
                value={section.description}
                onChange={(e) => onUpdateSection(section.id, 'description', e.target.value)}
                className="mt-1.5 rounded-lg"
                placeholder="Describe what aspects of performance this section evaluates..."
              />
              <p className="mt-1 text-xs text-gray-500">Provide context about what this section measures</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-10 w-10 rounded-full"
            onClick={() => onRemoveSection(section.id)}
            title="Remove section"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-[#27251F]">Criteria ({section.criteria.length})</h3>
            <p className="text-xs text-gray-500">These are the specific items that will be evaluated</p>
          </div>

          <div className="space-y-4">
            {section.criteria.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                <p className="text-gray-500 text-sm">No criteria added yet. Add your first criterion below.</p>
              </div>
            ) : (
              section.criteria.map((criterion, index) => (
                <div key={criterion.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  {renderCriterionForm(criterion, section.id, index)}
                </div>
              ))
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full rounded-lg border-dashed border-gray-300 hover:border-[#E51636]/30 hover:bg-[#E51636]/5 h-12"
              onClick={() => onAddCriterion(section.id)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Criterion
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}