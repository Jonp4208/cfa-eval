import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Send, HelpCircle, Bug, Lightbulb, CreditCard, Settings, AlertCircle, History, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import messageService, { CreateMessageData } from '@/services/messageService';

const messageSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
  category: z.enum(['bug', 'feature_request', 'question', 'billing', 'technical_support', 'other']),
  contactEmail: z.string().email('Please enter a valid email address'),
  contactPhone: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional()
});

type MessageFormData = z.infer<typeof messageSchema>;

const categoryOptions = [
  { value: 'question', label: 'General Question', icon: HelpCircle, color: 'text-blue-600' },
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-600' },
  { value: 'feature_request', label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-600' },
  { value: 'technical_support', label: 'Technical Support', icon: Settings, color: 'text-purple-600' },
  { value: 'billing', label: 'Billing Issue', icon: CreditCard, color: 'text-green-600' },
  { value: 'other', label: 'Other', icon: AlertCircle, color: 'text-gray-600' }
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'text-gray-600' },
  { value: 'medium', label: 'Medium', color: 'text-blue-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
];

interface ContactSupportProps {
  trigger?: React.ReactNode | null;
  onSuccess?: () => void;
}

export default function ContactSupport({ trigger, onSuccess }: ContactSupportProps) {
  const [open, setOpen] = useState(trigger === null); // Auto-open if no trigger
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get user's messages to show count
  const { data: messagesData } = useQuery({
    queryKey: ['userMessages', 1],
    queryFn: () => messageService.getUserMessages({ page: 1, limit: 5 }),
    enabled: open // Only fetch when dialog is open
  });

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      subject: '',
      message: '',
      category: 'question',
      contactEmail: user?.email || '',
      contactPhone: '',
      priority: 'medium'
    }
  });

  const createMessageMutation = useMutation({
    mutationFn: (data: CreateMessageData) => messageService.createMessage(data),
    onSuccess: () => {
      toast({
        title: 'Message Sent Successfully',
        description: 'We\'ve received your message and will respond as soon as possible. You can view your messages to track the status.',
        variant: 'default'
      });
      form.reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Send Message',
        description: error.response?.data?.message || 'Please try again later.',
        variant: 'destructive'
      });
    }
  });

  const onSubmit = (data: MessageFormData) => {
    createMessageMutation.mutate(data);
  };

  const defaultTrigger = (
    <Button variant="outline" className="gap-2">
      <MessageSquare className="h-4 w-4" />
      Contact Support
    </Button>
  );

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && trigger === null) {
      onSuccess?.();
    }
  };

  const handleViewMessages = () => {
    setOpen(false);
    navigate('/messages');
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="h-5 w-5 text-red-600" />
              Contact Support
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewMessages}
              className="gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200"
            >
              <History className="h-4 w-4" />
              View My Messages
            </Button>
          </div>
        </DialogHeader>

        {/* Enhanced Info Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">Need Help?</h3>
                {messagesData?.pagination?.total > 0 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {messagesData.pagination.total} message{messagesData.pagination.total !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Send us a message and we'll get back to you as soon as possible.
                {messagesData?.pagination?.total > 0 && ' You can also view your previous messages and our responses.'}
              </p>

              {/* Recent Messages Preview */}
              {messagesData?.messages && messagesData.messages.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Recent Messages:</h4>
                  <div className="space-y-2">
                    {messagesData.messages.slice(0, 2).map((message: any) => (
                      <div key={message._id} className="bg-white/80 rounded-lg p-2 border border-blue-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 truncate flex-1">
                            {message.subject}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            message.status === 'new' ? 'bg-blue-100 text-blue-700' :
                            message.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                            message.status === 'resolved' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {message.status === 'new' ? 'New' :
                             message.status === 'in_progress' ? 'In Progress' :
                             message.status === 'resolved' ? 'Resolved' : 'Closed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewMessages}
                  className="gap-2 bg-white/80 hover:bg-white border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200"
                >
                  <Eye className="h-3 w-3" />
                  {messagesData?.pagination?.total > 0 ? 'View All Messages' : 'View Messages'}
                  {messagesData?.pagination?.total > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {messagesData.pagination.total}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Category Selection */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">What can we help you with?</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map((option) => {
                              const Icon = option.icon;
                              return (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className={`h-4 w-4 ${option.color}`} />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subject */}
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Subject</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Brief description of your issue or question"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Message */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please provide as much detail as possible to help us assist you better..."
                          className="min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between text-sm text-gray-500">
                        <FormMessage />
                        <span>{field.value?.length || 0}/2000</span>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="your.email@example.com"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel"
                            placeholder="(555) 123-4567"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Priority */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Priority Level</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <span className={option.color}>{option.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMessageMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
                  >
                    {createMessageMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
