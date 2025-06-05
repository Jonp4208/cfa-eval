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
import { CheckCircle, Check, DollarSign } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    storeNumber: '',
    position: '',
    storeLocation: '',
    employeeCount: '',
    selectedFeatures: {
      fohTasks: false,
      setups: false,
      kitchen: false,
      documentation: false,
      training: false,
      evaluations: false,
      leadership: false
    },
    setupPreference: 'self', // 'guided' or 'self'
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Define subscription features with pricing and descriptions
  const subscriptionFeatures = [
    {
      key: 'fohTasks',
      label: 'FOH Tasks',
      description: 'Front of house task management and checklists',
      icon: '🏪',
      price: 20,
      features: ['Daily task checklists', 'Progress tracking', 'Team accountability', 'Completion monitoring']
    },
    {
      key: 'setups',
      label: 'Setup Sheet*',
      description: 'Manual setup sheet upload and management',
      icon: '📋',
      price: 0,
      features: ['Manual upload system', 'Setup tracking', 'Historical records', 'Progress monitoring']
    },
    {
      key: 'kitchen',
      label: 'Kitchen',
      description: 'Kitchen management, waste tracking, and operational checklists',
      icon: '👨‍🍳',
      price: 50,
      features: ['Opening checklists', 'Transition checklists', 'Closing checklists', 'Waste tracking', 'Food safety monitoring']
    },
    {
      key: 'documentation',
      label: 'Documentation',
      description: 'Employee discipline tracking and HR documentation',
      icon: '📄',
      price: 50,
      features: ['Discipline tracking', 'Call-out records', 'Doctor notes', 'HR documentation', 'Employee incidents']
    },
    {
      key: 'training',
      label: 'Training',
      description: 'Employee training plans and progress tracking',
      icon: '🎓',
      price: 50,
      features: ['Training modules', 'Progress tracking', 'Certification management', 'Skills assessment']
    },
    {
      key: 'evaluations',
      label: 'Evaluations',
      description: 'Analytics and automated employee evaluations',
      icon: '⭐',
      price: 100,
      features: ['Performance analytics', 'Automated evaluations', 'Data insights', 'Reporting dashboards']
    },
    {
      key: 'leadership',
      label: 'Leadership Development',
      description: 'Comprehensive leadership and team development platform',
      icon: '👑',
      price: 100,
      features: ['360 evaluations', 'Team member surveys', 'Leadership assessments', 'Development plans', 'Business playbooks']
    }
  ];

  // Calculate total monthly cost
  const calculateTotalCost = () => {
    const selectedFeatures = Object.entries(formData.selectedFeatures)
      .filter(([key, selected]) => selected)
      .map(([key]) => subscriptionFeatures.find(f => f.key === key))
      .filter(Boolean);

    const totalCost = selectedFeatures.reduce((sum, feature) => sum + (feature?.price || 0), 0);
    return Math.min(totalCost, 200); // Max $200
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureToggle = (featureKey: string) => {
    setFormData(prev => ({
      ...prev,
      selectedFeatures: {
        ...prev.selectedFeatures,
        [featureKey]: !prev.selectedFeatures[featureKey as keyof typeof prev.selectedFeatures]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get detailed information about selected features
      const selectedFeaturesDetails = Object.entries(formData.selectedFeatures)
        .filter(([key, selected]) => selected)
        .map(([key]) => {
          const feature = subscriptionFeatures.find(f => f.key === key);
          return feature ? {
            key: feature.key,
            label: feature.label,
            price: feature.price,
            description: feature.description
          } : null;
        })
        .filter(Boolean);

      // Calculate total cost and individual feature costs
      const totalCost = calculateTotalCost();
      const rawCost = selectedFeaturesDetails.reduce((sum, feature) => sum + (feature?.price || 0), 0);

      // Include all form data plus enhanced feature and pricing information
      const leadData = {
        // Basic contact information
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        storeNumber: formData.storeNumber,
        position: formData.position,
        storeLocation: formData.storeLocation,
        employeeCount: formData.employeeCount,
        message: formData.message,

        // Setup preference
        setupPreference: formData.setupPreference,
        setupPreferenceLabel: formData.setupPreference === 'guided' ? 'Personalized Setup Call' : 'Self-Guided Setup',

        // Selected features (simple list)
        selectedFeatures: formData.selectedFeatures,
        selectedFeaturesList: selectedFeaturesDetails.map(f => f?.label).filter(Boolean),

        // Detailed feature information
        selectedFeaturesDetails: selectedFeaturesDetails,

        // Pricing information
        calculatedCost: totalCost,
        rawCost: rawCost,
        savingsFromMaxPrice: rawCost > 200 ? rawCost - 200 : 0,
        isAtMaxPrice: totalCost >= 200,

        // Additional metadata
        submissionDate: new Date().toISOString(),
        trialType: '14-day free trial',
        maxMonthlyPrice: 200
      };

      // Send the lead information via email instead of creating an account
      await api.post('/api/leads/capture', leadData);
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
      <div className="min-h-screen bg-gradient-to-b from-[#E51636]/5 to-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'url(/pattern-bg.svg)', backgroundSize: '60px 60px' }}></div>
        <div className="relative z-10">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center mb-6">
              <h1 className="text-3xl font-bold text-[#E51636]">LD Growth</h1>
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
                    Get ready to take your leadership to the next level! Be on the lookout for an email from Jonathon@ld-growth.com in the next couple of hours.
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E51636]/8 via-white to-[#E51636]/3 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#E51636]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#E51636]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#E51636]/3 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#E51636] to-[#C41230] rounded-3xl mb-6 shadow-2xl">
              <span className="text-3xl font-bold text-white">LD</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#E51636] to-[#C41230] bg-clip-text text-transparent mb-4">
              Start Your Free Trial
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Choose exactly what you need with <span className="font-semibold text-[#E51636]">transparent pricing</span> and a
              <span className="font-semibold text-[#E51636]"> $200/month maximum</span>.
              Start with a <span className="font-semibold text-blue-600">14-day free trial!</span>
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden rounded-3xl">
            <div className="h-1 bg-gradient-to-r from-[#E51636] via-[#C41230] to-[#E51636]"></div>
            <CardHeader className="bg-gradient-to-r from-[#E51636]/8 via-[#E51636]/5 to-white p-8">
              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-[#E51636] mb-2">Choose Your Plan & Start Free Trial</CardTitle>
                <CardDescription className="text-gray-700 text-lg">
                  Select the features you need, see transparent pricing, and start your 14-day free trial. No credit card required.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#E51636] to-[#C41230] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-[#E51636] mb-2">
                        Full Name*
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E51636]/20 focus:border-[#E51636] hover:border-[#E51636]/50 transition-all duration-200 bg-gray-50/50"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
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
                      <label htmlFor="phone" className="block text-sm font-semibold text-[#E51636] mb-2">
                        Phone Number*
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E51636]/20 focus:border-[#E51636] hover:border-[#E51636]/50 transition-all duration-200 bg-gray-50/50"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
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
                </div>

                {/* Features Selection Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#E51636] to-[#C41230] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Choose Your Features</h3>
                  </div>
                  <div className="text-center mb-6">
                    <p className="text-gray-600 text-lg mb-4">Select the features you need after your trial. Start with a 14-day free trial!</p>

                    {/* Trial Access Notice */}
                    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl border border-blue-200 mb-6 shadow-lg">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <span className="text-2xl">🎉</span>
                        <span className="text-xl font-bold text-blue-700">14-Day Free Trial</span>
                      </div>
                      <p className="text-blue-700 font-semibold text-center mb-2">
                        During your trial, you'll have access to ALL features regardless of what you select below.
                      </p>
                      <p className="text-blue-600 text-center text-sm">
                        Use this time to explore everything and decide what works best for your store!
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-[#E51636]/10 via-[#E51636]/8 to-[#E51636]/5 p-6 rounded-2xl border border-[#E51636]/20 shadow-lg">
                      <div className="flex items-center justify-center space-x-3 mb-2">
                        <DollarSign className="h-6 w-6 text-[#E51636]" />
                        <span className="text-2xl font-bold text-[#E51636]">
                          Monthly Total After Trial: ${calculateTotalCost()}
                        </span>
                        {calculateTotalCost() >= 200 && (
                          <span className="text-sm text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">(Maximum $200 reached!)</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-center font-medium">No credit card required • Maximum $200/month</p>
                    </div>
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscriptionFeatures.map((feature) => {
                    const isSelected = formData.selectedFeatures[feature.key as keyof typeof formData.selectedFeatures];
                    return (
                      <div
                        key={feature.key}
                        className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                          isSelected
                            ? 'border-[#E51636] bg-gradient-to-br from-[#E51636]/8 to-[#E51636]/3 shadow-xl'
                            : 'border-gray-200 hover:border-[#E51636]/50 hover:bg-gradient-to-br hover:from-gray-50 hover:to-white shadow-lg hover:shadow-xl'
                        }`}
                        onClick={() => handleFeatureToggle(feature.key)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="text-3xl p-2 bg-white rounded-xl shadow-sm">{feature.icon}</div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-lg">{feature.label}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  {feature.price === 0 ? (
                                    <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                      FREE
                                    </span>
                                  ) : (
                                    <span className="text-lg font-bold text-[#E51636] bg-[#E51636]/10 px-3 py-1 rounded-full">
                                      ${feature.price}/mo
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                            <ul className="space-y-2">
                              {feature.features.map((item, index) => (
                                <li key={index} className="flex items-center text-sm text-gray-600">
                                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                    <Check className="h-2.5 w-2.5 text-green-600" />
                                  </div>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="ml-4">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                isSelected
                                  ? 'bg-[#E51636] border-[#E51636] shadow-lg'
                                  : 'border-gray-300 hover:border-[#E51636]/50'
                              }`}
                            >
                              {isSelected && <Check className="h-4 w-4 text-white" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {calculateTotalCost() >= 200 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-semibold">🎉 Maximum Price Cap Reached!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      <strong>You'll never pay more than $200/month!</strong> You've selected features that would normally cost ${subscriptionFeatures.reduce((sum, f) => formData.selectedFeatures[f.key as keyof typeof formData.selectedFeatures] ? sum + f.price : sum, 0)}, but our maximum monthly price is capped at just $200.
                    </p>
                  </div>
                )}

                {/* Asterisk explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>*Setup Sheet:</strong> Currently free with manual upload. We're working with Chick-fil-A to gain API access that will automate this process in the future.
                  </p>
                </div>
              </div>

              {/* Setup Preference Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#E51636] to-[#C41230] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">How would you like to get started?</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      formData.setupPreference === 'guided'
                        ? 'border-[#E51636] bg-[#E51636]/5 shadow-md'
                        : 'border-gray-200 hover:border-[#E51636]/50 hover:bg-gray-50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, setupPreference: 'guided' }))}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">🎥</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">Personalized Setup Call</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Schedule a video call with our team to walk you through the setup and answer any questions.
                        </p>
                        <ul className="space-y-1">
                          <li className="flex items-center text-xs text-gray-500">
                            <Check className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                            Personalized walkthrough
                          </li>
                          <li className="flex items-center text-xs text-gray-500">
                            <Check className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                            Custom configuration
                          </li>
                          <li className="flex items-center text-xs text-gray-500">
                            <Check className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                            Q&A session
                          </li>
                        </ul>
                      </div>
                      <div className="ml-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.setupPreference === 'guided'
                              ? 'bg-[#E51636] border-[#E51636]'
                              : 'border-gray-300'
                          }`}
                        >
                          {formData.setupPreference === 'guided' && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      formData.setupPreference === 'self'
                        ? 'border-[#E51636] bg-[#E51636]/5 shadow-md'
                        : 'border-gray-200 hover:border-[#E51636]/50 hover:bg-gray-50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, setupPreference: 'self' }))}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">🚀</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">Self-Guided Setup</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Jump right in and explore the platform on your own during your free trial.
                        </p>
                        <ul className="space-y-1">
                          <li className="flex items-center text-xs text-gray-500">
                            <Check className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                            Immediate access
                          </li>
                          <li className="flex items-center text-xs text-gray-500">
                            <Check className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                            Learn at your pace
                          </li>
                          <li className="flex items-center text-xs text-gray-500">
                            <Check className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                            Support available
                          </li>
                        </ul>
                      </div>
                      <div className="ml-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.setupPreference === 'self'
                              ? 'bg-[#E51636] border-[#E51636]'
                              : 'border-gray-300'
                          }`}
                        >
                          {formData.setupPreference === 'self' && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>
                    </div>
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

              <div className="pt-8">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#E51636] to-[#C41230] hover:from-[#DD0031] hover:to-[#B01020] text-white h-14 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] rounded-2xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>🚀</span>
                      <span>Start My 14-Day Free Trial</span>
                    </div>
                  )}
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
    </div>
  );
}