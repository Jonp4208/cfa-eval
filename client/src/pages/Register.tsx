// client/src/pages/Register.tsx
import React from 'react';
// client/src/pages/Register.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/TranslationContext';
import { CheckCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    storeNumber: '',
    position: '',
    storeLocation: '',
    employeeCount: '',
    interests: {
      evaluations: false,
      leadershipDevelopment: false,
      scheduling: false,
      taskManagement: false
    },
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      interests: {
        ...prev.interests,
        [name]: checked
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Send the lead information via email instead of creating an account
      await api.post('/api/leads/capture', formData);
      setIsSubmitted(true);
      toast({
        title: "Request Received",
        description: "Thank you for your interest! We'll be in touch soon to set up your free trial.",
      });
    } catch (error: any) {
      toast({
        title: "Submission Error",
        description: error.response?.data?.message || "There was an error submitting your request. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
                <p className="text-gray-600 mb-6">
                  Your request for a free trial has been received. We'll contact you shortly to get you set up.
                </p>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
                >
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <h1 className="text-center text-3xl font-bold text-[#E51636] mb-4">
          Start Your Free Trial
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Fill out the form below to get started with your 30-day free trial of LD Growth
        </p>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Request Your Free Trial</CardTitle>
            <CardDescription>
              No credit card required. Get full access to all features for 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name*
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E51636] focus:border-[#E51636]"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address*
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E51636] focus:border-[#E51636]"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E51636] focus:border-[#E51636]"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                    Your Position*
                  </label>
                  <select
                    id="position"
                    name="position"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E51636] focus:border-[#E51636]"
                    value={formData.position}
                    onChange={handleChange}
                  >
                    <option value="">Select your position</option>
                    <option value="Owner/Operator">Owner/Operator</option>
                    <option value="Store Director">Store Director</option>
                    <option value="Kitchen Director">Kitchen Director</option>
                    <option value="Service Director">Service Director</option>
                    <option value="Team Leader">Team Leader</option>
                    <option value="Shift Leader">Shift Leader</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="storeNumber" className="block text-sm font-medium text-gray-700">
                    Store Number*
                  </label>
                  <input
                    id="storeNumber"
                    name="storeNumber"
                    type="text"
                    required
                    placeholder="e.g., 00727"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E51636] focus:border-[#E51636]"
                    value={formData.storeNumber}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="storeLocation" className="block text-sm font-medium text-gray-700">
                    Store Location
                  </label>
                  <input
                    id="storeLocation"
                    name="storeLocation"
                    type="text"
                    placeholder="City, State"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E51636] focus:border-[#E51636]"
                    value={formData.storeLocation}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700">
                    Number of Employees
                  </label>
                  <select
                    id="employeeCount"
                    name="employeeCount"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E51636] focus:border-[#E51636]"
                    value={formData.employeeCount}
                    onChange={handleChange}
                  >
                    <option value="">Select range</option>
                    <option value="1-50">1-50</option>
                    <option value="51-100">51-100</option>
                    <option value="101-150">101-150</option>
                    <option value="151+">151+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I'm interested in: (Select all that apply)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="evaluations"
                      name="evaluations"
                      type="checkbox"
                      className="h-4 w-4 text-[#E51636] focus:ring-[#E51636] border-gray-300 rounded"
                      checked={formData.interests.evaluations}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor="evaluations" className="ml-2 block text-sm text-gray-700">
                      Employee Evaluations
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="leadershipDevelopment"
                      name="leadershipDevelopment"
                      type="checkbox"
                      className="h-4 w-4 text-[#E51636] focus:ring-[#E51636] border-gray-300 rounded"
                      checked={formData.interests.leadershipDevelopment}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor="leadershipDevelopment" className="ml-2 block text-sm text-gray-700">
                      Leadership Development Plans
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="scheduling"
                      name="scheduling"
                      type="checkbox"
                      className="h-4 w-4 text-[#E51636] focus:ring-[#E51636] border-gray-300 rounded"
                      checked={formData.interests.scheduling}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor="scheduling" className="ml-2 block text-sm text-gray-700">
                      Scheduling Tools
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="taskManagement"
                      name="taskManagement"
                      type="checkbox"
                      className="h-4 w-4 text-[#E51636] focus:ring-[#E51636] border-gray-300 rounded"
                      checked={formData.interests.taskManagement}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor="taskManagement" className="ml-2 block text-sm text-gray-700">
                      Task Management
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Additional Information
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E51636] focus:border-[#E51636]"
                  placeholder="Tell us about your specific needs or questions"
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#E51636] hover:bg-[#E51636]/90 text-white h-12 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Request Free Trial"}
              </Button>

              <div className="text-sm text-center">
                <p className="text-gray-500 mb-2">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-[#E51636] hover:text-[#E51636]/90"
                  >
                    Sign in
                  </Link>
                </p>
                <p className="text-xs text-gray-400">
                  By submitting this form, you agree to our{" "}
                  <a href="#" className="underline">Terms of Service</a> and{" "}
                  <a href="#" className="underline">Privacy Policy</a>.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}