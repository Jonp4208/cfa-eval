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
      <div className="min-h-screen bg-gradient-to-b from-[#E51636]/5 to-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <img src="/cfa-logo.svg" alt="Chick-fil-A Logo" className="h-16" />
          </div>
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="h-2 bg-[#E51636]"></div>
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#E51636]/10 mb-6 border-2 border-[#E51636]/20">
                  <CheckCircle className="h-8 w-8 text-[#E51636]" />
                </div>
                <h2 className="text-2xl font-bold text-[#E51636] mb-3">Thank You!</h2>
                <p className="text-gray-700 mb-8 max-w-sm mx-auto">
                  Your request for a free trial has been received. We'll contact you shortly to get you set up with your LD Growth account.
                </p>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-[#E51636] hover:bg-[#DD0031] text-white px-8 py-2 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
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
    <div className="min-h-screen bg-gradient-to-b from-[#E51636]/5 to-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center mb-6">
          <img src="/cfa-logo.svg" alt="Chick-fil-A Logo" className="h-16" />
        </div>
        <h1 className="text-center text-3xl font-bold text-[#E51636] mb-4">
          Start Your Free Trial
        </h1>
        <p className="text-center text-gray-700 mb-8">
          Fill out the form below to get started with your 30-day free trial of LD Growth
        </p>

        <Card className="border-0 shadow-xl bg-white overflow-hidden">
          <div className="h-2 bg-[#E51636]"></div>
          <CardHeader className="bg-gradient-to-r from-[#E51636]/10 to-white">
            <CardTitle className="text-xl font-bold text-[#E51636]">Request Your Free Trial</CardTitle>
            <CardDescription className="text-gray-700">
              No credit card required. Get full access to all features for 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#E51636]">
                    Full Name*
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E51636] focus:border-[#E51636] hover:border-[#E51636]/50"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#E51636]">
                    Email Address*
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E51636] focus:border-[#E51636] hover:border-[#E51636]/50"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#E51636]">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E51636] focus:border-[#E51636] hover:border-[#E51636]/50"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-[#E51636]">
                    Your Position*
                  </label>
                  <select
                    id="position"
                    name="position"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E51636] focus:border-[#E51636] hover:border-[#E51636]/50"
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
                  <label htmlFor="storeNumber" className="block text-sm font-medium text-[#E51636]">
                    Store Number*
                  </label>
                  <input
                    id="storeNumber"
                    name="storeNumber"
                    type="text"
                    required
                    placeholder="e.g., 00727"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E51636] focus:border-[#E51636] hover:border-[#E51636]/50"
                    value={formData.storeNumber}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="storeLocation" className="block text-sm font-medium text-[#E51636]">
                    Store Location
                  </label>
                  <input
                    id="storeLocation"
                    name="storeLocation"
                    type="text"
                    placeholder="City, State"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E51636] focus:border-[#E51636] hover:border-[#E51636]/50"
                    value={formData.storeLocation}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="employeeCount" className="block text-sm font-medium text-[#E51636]">
                    Number of Employees
                  </label>
                  <select
                    id="employeeCount"
                    name="employeeCount"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E51636] focus:border-[#E51636] hover:border-[#E51636]/50"
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

              <div className="bg-[#E51636]/5 p-4 rounded-lg border border-[#E51636]/20">
                <label className="block text-sm font-medium text-[#E51636] mb-2">
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
                <label htmlFor="message" className="block text-sm font-medium text-[#E51636]">
                  Additional Information
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E51636] focus:border-[#E51636] hover:border-[#E51636]/50"
                  placeholder="Tell us about your specific needs or questions"
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-[#E51636] hover:bg-[#DD0031] text-white h-12 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Request Free Trial"}
                </Button>
              </div>

              <div className="text-sm text-center pt-4 border-t border-gray-200 mt-4">
                <p className="text-gray-700 mb-2">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-[#E51636] hover:text-[#E51636]/90"
                  >
                    Sign in
                  </Link>
                </p>
                <p className="text-xs text-gray-500">
                  By submitting this form, you agree to our{" "}
                  <a href="#" className="underline text-[#E51636]/80">Terms of Service</a> and{" "}
                  <a href="#" className="underline text-[#E51636]/80">Privacy Policy</a>.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}