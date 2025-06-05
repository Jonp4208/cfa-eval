import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Search, 
  Clock, 
  Target, 
  TrendingUp, 
  ArrowLeft,
  FileText,
  Sparkles
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import playbookService from '@/services/playbookService';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  targetRole: string;
  icon: string;
  businessArea: string;
  estimatedTime: string;
  goals: string[];
  keyMetrics: string[];
}

export default function TemplateSelection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);

  const templates = playbookService.getPlaybookTemplates();
  
  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.businessArea.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateFromTemplate = async (template: Template) => {
    try {
      setCreating(true);
      
      // Navigate to simple editor with template ID
      navigate(`/leadership/playbooks/new/simple-edit?template=${template.id}`);
      
      toast({
        title: 'Template Selected',
        description: `Creating playbook from ${template.name} template...`
      });
    } catch (error) {
      console.error('Error creating from template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create playbook from template',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleStartBlank = () => {
    navigate('/leadership/playbooks/new/simple-edit');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Playbook"
        subtitle="Choose a template for your business area or start from scratch"
        icon={<FileText className="h-5 w-5" />}
        actions={
          <Button
            onClick={() => navigate('/leadership/playbooks')}
            className="bg-white hover:bg-white/90 text-[#E51636] flex items-center gap-2 py-2 px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Playbooks
          </Button>
        }
      />

      {/* Search and Filters */}
      <Card className="bg-white rounded-[20px] shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search templates by business area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category 
                    ? "bg-[#E51636] text-white hover:bg-[#E51636]/90" 
                    : "hover:bg-[#E51636]/10 hover:text-[#E51636] hover:border-[#E51636]/30"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start from Scratch Option */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-[20px] shadow-sm border-2 border-dashed border-gray-300 hover:border-[#E51636]/50 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles className="w-6 h-6 text-[#E51636]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#27251F] mb-1">Start from Scratch</h3>
                <p className="text-[#27251F]/60 text-sm">Create a custom playbook with your own content and structure</p>
              </div>
            </div>
            <Button
              onClick={handleStartBlank}
              className="bg-[#E51636] text-white hover:bg-[#E51636]/90 px-6 py-2 rounded-xl"
            >
              Start Blank
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="bg-white rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 border hover:border-[#E51636]/30 group cursor-pointer"
            onClick={() => setSelectedTemplate(template)}
          >
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#E51636]/10 to-[#E51636]/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                  {template.icon}
                </div>
                <Badge 
                  variant="secondary" 
                  className="bg-[#E51636]/10 text-[#E51636] hover:bg-[#E51636]/20"
                >
                  {template.category}
                </Badge>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#27251F] mb-1 group-hover:text-[#E51636] transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-[#27251F]/60 text-sm line-clamp-2">
                    {template.description}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-[#27251F]/60">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {template.estimatedTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {template.targetRole}
                  </div>
                </div>

                {/* Goals Preview */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-xs font-medium text-[#E51636]">
                    <TrendingUp className="w-3 h-3" />
                    Sample Goals:
                  </div>
                  <div className="space-y-1">
                    {template.goals.slice(0, 2).map((goal, index) => (
                      <div key={index} className="text-xs text-[#27251F]/70 bg-gray-50 rounded-lg px-2 py-1">
                        • {goal}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateFromTemplate(template);
                  }}
                  disabled={creating}
                  className="w-full bg-[#E51636] text-white hover:bg-[#E51636]/90 rounded-xl mt-4 group-hover:shadow-md transition-all duration-300"
                >
                  {creating ? 'Creating...' : 'Use This Template'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="bg-white rounded-[20px] shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-[#27251F] mb-2">No templates found</h3>
            <p className="text-[#27251F]/60 mb-4">
              Try adjusting your search or category filter
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              variant="outline"
              className="hover:bg-[#E51636]/10 hover:text-[#E51636] hover:border-[#E51636]/30"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
