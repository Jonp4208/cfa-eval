import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import api from '@/lib/axios';

export function TestButton() {
  const handleClick = async () => {
    try {
      console.log('Testing 360 evaluation API...');

      // Get current date and date 30 days in the future
      const startDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      // Make a direct API call to test the endpoint
      const response = await api.get('/api/users');
      console.log('Users response:', response.data);

      // Find a leader or director
      const users = Array.isArray(response.data) ? response.data :
                   (response.data && response.data.users ? response.data.users : []);

      const leader = users.find(user => user.position === 'Leader' || user.position === 'Director');

      if (!leader) {
        console.error('No leader found');
        toast({
          title: "Error",
          description: "No leader found in the system",
          variant: "destructive",
        });
        return;
      }

      console.log('Found leader:', leader);

      // Get templates
      const templatesResponse = await api.get('/api/templates');
      console.log('Templates response:', templatesResponse.data);

      const templates = Array.isArray(templatesResponse.data) ? templatesResponse.data :
                       (templatesResponse.data && templatesResponse.data.templates ? templatesResponse.data.templates : []);

      const template = templates.find(t => t.name === 'Leadership 360 Evaluation');

      if (!template) {
        console.error('Leadership 360 Evaluation template not found');
        toast({
          title: "Error",
          description: "Leadership 360 Evaluation template not found",
          variant: "destructive",
        });
        return;
      }

      console.log('Found template:', template);

      // Log all properties of the template to see its structure
      console.log('Template properties:');
      for (const key in template) {
        console.log(`${key}: ${template[key]}`);
      }

      // Get the template ID - it could be _id or id depending on the API response
      const templateId = template._id || template.id;

      if (!templateId) {
        console.error('Could not find template ID in template object:', template);
        toast({
          title: "Error",
          description: "Could not find template ID",
          variant: "destructive",
        });
        return;
      }

      console.log('Using template ID:', templateId);

      // Create the evaluation
      const data = {
        subjectId: leader._id,
        templateId: templateId, // Use the extracted template ID
        startDate: startDate.toISOString(),
        dueDate: dueDate.toISOString(),
      };

      console.log('Sending test data to API:', data);

      const createResponse = await api.post('/api/leadership/360-evaluations', data);
      console.log('Create response:', createResponse.data);

      toast({
        title: "Success",
        description: "Test 360° evaluation created successfully",
      });
    } catch (error) {
      console.error('Error in test button:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Test failed",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="bg-blue-500 hover:bg-blue-600 text-white"
    >
      Test 360 API
    </Button>
  );
}
