import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  MessageSquare, 
  Star, 
  CheckSquare,
  RotateCcw,
  Eye
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Question {
  id: string;
  text: string;
  type: 'rating' | 'text' | 'multiple-choice';
  required: boolean;
  ratingScale?: { min: number; max: number };
  options?: string[];
}

interface QuestionBuilderProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
  showPreview?: boolean;
}

const QuestionBuilder: React.FC<QuestionBuilderProps> = ({ 
  questions, 
  onChange, 
  showPreview = false 
}) => {
  const [previewMode, setPreviewMode] = useState(showPreview);

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      text: '',
      type,
      required: true,
      ...(type === 'rating' && { ratingScale: { min: 1, max: 10 } }),
      ...(type === 'multiple-choice' && { options: ['Option 1', 'Option 2'] })
    };
    
    onChange([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    onChange(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (id: string) => {
    onChange(questions.filter(q => q.id !== id));
  };

  const duplicateQuestion = (id: string) => {
    const question = questions.find(q => q.id === id);
    if (question) {
      const duplicate = {
        ...question,
        id: `q${Date.now()}`,
        text: `${question.text} (Copy)`
      };
      const index = questions.findIndex(q => q.id === id);
      const newQuestions = [...questions];
      newQuestions.splice(index + 1, 0, duplicate);
      onChange(newQuestions);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      updateQuestion(questionId, {
        options: [...question.options, `Option ${question.options.length + 1}`]
      });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const getQuestionIcon = (type: Question['type']) => {
    switch (type) {
      case 'rating': return <Star className="w-4 h-4" />;
      case 'text': return <MessageSquare className="w-4 h-4" />;
      case 'multiple-choice': return <CheckSquare className="w-4 h-4" />;
    }
  };

  const getQuestionTypeLabel = (type: Question['type']) => {
    switch (type) {
      case 'rating': return 'Rating Scale';
      case 'text': return 'Text Response';
      case 'multiple-choice': return 'Multiple Choice';
    }
  };

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Survey Preview</h3>
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(false)}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Back to Editor
          </Button>
        </div>
        
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-gray-500 mt-1">
                      Q{index + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{question.text || 'Untitled Question'}</p>
                      {question.required && (
                        <span className="text-red-500 text-sm">*</span>
                      )}
                    </div>
                  </div>
                  
                  {question.type === 'rating' && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {question.ratingScale?.min}
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: question.ratingScale?.max || 10 }, (_, i) => (
                          <button
                            key={i}
                            className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-100"
                            disabled
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {question.ratingScale?.max}
                      </span>
                    </div>
                  )}
                  
                  {question.type === 'text' && (
                    <Textarea 
                      placeholder="Type your response here..."
                      disabled
                      className="resize-none"
                    />
                  )}
                  
                  {question.type === 'multiple-choice' && (
                    <div className="space-y-2">
                      {question.options?.map((option, index) => (
                        <label key={index} className="flex items-center gap-2">
                          <input type="radio" name={question.id} disabled />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Question Builder</h3>
          <p className="text-sm text-gray-600">
            Create and customize your survey questions
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(true)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </div>
      </div>

      {/* Add Question Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add New Question</CardTitle>
          <CardDescription>
            Choose a question type to add to your survey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => addQuestion('rating')}
              className="flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Rating Scale
            </Button>
            <Button
              variant="outline"
              onClick={() => addQuestion('text')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Text Response
            </Button>
            <Button
              variant="outline"
              onClick={() => addQuestion('multiple-choice')}
              className="flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              Multiple Choice
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {questions.map((question, index) => (
                <Draggable key={question.id} draggableId={question.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${snapshot.isDragging ? 'shadow-lg' : ''}`}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                          <div {...provided.dragHandleProps}>
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                          </div>
                          <div className="flex items-center gap-2">
                            {getQuestionIcon(question.type)}
                            <Badge variant="secondary">
                              {getQuestionTypeLabel(question.type)}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">Q{index + 1}</span>
                          <div className="ml-auto flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateQuestion(question.id)}
                            >
                              Copy
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Question Text */}
                        <div>
                          <Label htmlFor={`question-${question.id}`}>Question Text</Label>
                          <Textarea
                            id={`question-${question.id}`}
                            value={question.text}
                            onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                            placeholder="Enter your question..."
                            className="mt-1"
                          />
                        </div>

                        {/* Question Settings */}
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                            />
                            <span className="text-sm">Required</span>
                          </label>
                        </div>

                        {/* Type-specific settings */}
                        {question.type === 'rating' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Minimum Value</Label>
                              <Input
                                type="number"
                                value={question.ratingScale?.min || 1}
                                onChange={(e) => updateQuestion(question.id, {
                                  ratingScale: { 
                                    ...question.ratingScale!, 
                                    min: parseInt(e.target.value) || 1 
                                  }
                                })}
                                min="1"
                                max="5"
                              />
                            </div>
                            <div>
                              <Label>Maximum Value</Label>
                              <Input
                                type="number"
                                value={question.ratingScale?.max || 10}
                                onChange={(e) => updateQuestion(question.id, {
                                  ratingScale: { 
                                    ...question.ratingScale!, 
                                    max: parseInt(e.target.value) || 10 
                                  }
                                })}
                                min="2"
                                max="10"
                              />
                            </div>
                          </div>
                        )}

                        {question.type === 'multiple-choice' && (
                          <div>
                            <Label>Answer Options</Label>
                            <div className="space-y-2 mt-2">
                              {question.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  {question.options!.length > 2 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeOption(question.id, optionIndex)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(question.id)}
                                className="flex items-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Add Option
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {questions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Add your first question using the buttons above
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionBuilder;
