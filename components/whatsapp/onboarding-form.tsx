'use client';

/**
 * WhatsApp Business Onboarding Form Component
 * 
 * WhatsApp Business Account kurulumu için form component
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  WhatsAppOnboardingFormData,
  defaultWhatsAppOnboardingData,
  WHATSAPP_PHONE_CATEGORIES,
  COUNTRY_CODES,
  TIMEZONES,
  WhatsAppOnboardingValidation
} from '@/lib/types/whatsapp-onboarding';

interface WhatsAppOnboardingFormProps {
  initialData?: Partial<WhatsAppOnboardingFormData>;
  onSubmit?: (data: WhatsAppOnboardingFormData) => void;
  onValidationChange?: (validation: WhatsAppOnboardingValidation) => void;
  className?: string;
  disabled?: boolean;
  showDebug?: boolean;
}

export function WhatsAppOnboardingForm({
  initialData,
  onSubmit,
  onValidationChange,
  className = '',
  disabled = false,
  showDebug = false
}: WhatsAppOnboardingFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<WhatsAppOnboardingFormData>({
    ...defaultWhatsAppOnboardingData,
    ...initialData
  });
  const [validation, setValidation] = useState<WhatsAppOnboardingValidation>({
    isValid: false,
    errors: {},
    warnings: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation
  const validateForm = (data: WhatsAppOnboardingFormData): WhatsAppOnboardingValidation => {
    const errors: { [key: string]: string } = {};
    const warnings: { [key: string]: string } = {};

    // Business validation
    if (!data.business.name) {
      errors['business.name'] = 'Business name is required';
    }

    if (!data.business.email) {
      errors['business.email'] = 'Business email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.business.email)) {
      errors['business.email'] = 'Invalid email format';
    }

    if (!data.business.phone.code || !data.business.phone.number) {
      errors['business.phone'] = 'Business phone number is required';
    }

    if (!data.business.address.country) {
      errors['business.address.country'] = 'Country is required';
    }

    if (!data.business.timezone) {
      warnings['business.timezone'] = 'Timezone helps with scheduling';
    }

    // Phone info validation
    if (!data.phone.displayName) {
      errors['phone.displayName'] = 'Phone display name is required';
    }

    if (!data.phone.category) {
      warnings['phone.category'] = 'Phone category helps with organization';
    }

    // Website validation
    if (data.business.website && !/^https?:\/\/.+/.test(data.business.website)) {
      warnings['business.website'] = 'Website should include http:// or https://';
    }

    const isValid = Object.keys(errors).length === 0;

    return { isValid, errors, warnings };
  };

  // Update validation when form data changes
  useEffect(() => {
    const newValidation = validateForm(formData);
    setValidation(newValidation);
    onValidationChange?.(newValidation);
  }, [formData, onValidationChange]);

  // Form field update helper
  const updateField = (path: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev };
      const keys = path.split('.');
      let current: any = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validation.isValid) {
      toast({
        title: "Form Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📤 Submitting WhatsApp onboarding data:', formData);
      
      await onSubmit?.(formData);
      
      toast({
        title: "WhatsApp Onboarding Successful",
        description: "Business information has been saved",
        variant: "default"
      });

    } catch (error) {
      console.error('❌ Onboarding submission error:', error);
      
      toast({
        title: "Submission Error",
        description: "Failed to save business information",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(defaultWhatsAppOnboardingData);
    toast({
      title: "Form Reset",
      description: "All fields have been cleared",
      variant: "default"
    });
  };

  const loadSampleData = () => {
    const sampleData: WhatsAppOnboardingFormData = {
      business: {
        id: null,
        name: "Happy CRM Inc.",
        email: "contact@happycrm.com",
        phone: {
          code: "+90",
          number: "5327994223"
        },
        website: "https://happycrm.vercel.app",
        address: {
          streetAddress1: "123 Business Street",
          streetAddress2: "Suite 100",
          city: "Istanbul",
          state: "Marmara",
          zipPostal: "34000",
          country: "Turkey"
        },
        timezone: "Europe/Istanbul"
      },
      phone: {
        displayName: "Happy CRM Support",
        category: "CUSTOMER_SERVICE",
        description: "Main customer service line for Happy CRM"
      },
      preVerifiedPhone: {
        ids: null
      },
      solutionID: null,
      whatsAppBusinessAccount: {
        ids: null
      }
    };

    setFormData(sampleData);
    
    toast({
      title: "Sample Data Loaded",
      description: "Form filled with sample business information",
      variant: "default"
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">WhatsApp Business Onboarding</h2>
          <p className="text-muted-foreground">
            Set up your WhatsApp Business Account
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={validation.isValid ? "default" : "secondary"}>
            {validation.isValid ? "✅ Valid" : "❌ Invalid"}
          </Badge>
          <Badge variant="outline">
            {Object.keys(validation.errors).length} errors
          </Badge>
          <Badge variant="outline">
            {Object.keys(validation.warnings).length} warnings
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Basic information about your business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name *</Label>
                <Input
                  id="business-name"
                  value={formData.business.name || ''}
                  onChange={(e) => updateField('business.name', e.target.value)}
                  placeholder="Enter business name"
                  disabled={disabled}
                  className={validation.errors['business.name'] ? 'border-red-500' : ''}
                />
                {validation.errors['business.name'] && (
                  <p className="text-sm text-red-500">{validation.errors['business.name']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-email">Business Email *</Label>
                <Input
                  id="business-email"
                  type="email"
                  value={formData.business.email || ''}
                  onChange={(e) => updateField('business.email', e.target.value)}
                  placeholder="contact@company.com"
                  disabled={disabled}
                  className={validation.errors['business.email'] ? 'border-red-500' : ''}
                />
                {validation.errors['business.email'] && (
                  <p className="text-sm text-red-500">{validation.errors['business.email']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-website">Website</Label>
                <Input
                  id="business-website"
                  value={formData.business.website || ''}
                  onChange={(e) => updateField('business.website', e.target.value)}
                  placeholder="https://www.company.com"
                  disabled={disabled}
                  className={validation.warnings['business.website'] ? 'border-yellow-500' : ''}
                />
                {validation.warnings['business.website'] && (
                  <p className="text-sm text-yellow-600">{validation.warnings['business.website']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-timezone">Timezone</Label>
                <Select 
                  value={formData.business.timezone || ''} 
                  onValueChange={(value) => updateField('business.timezone', value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label>Business Phone Number *</Label>
              <div className="flex space-x-2">
                <Select 
                  value={formData.business.phone.code || ''} 
                  onValueChange={(value) => updateField('business.phone.code', value)}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((cc) => (
                      <SelectItem key={cc.code} value={cc.code}>
                        {cc.flag} {cc.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={formData.business.phone.number || ''}
                  onChange={(e) => updateField('business.phone.number', e.target.value)}
                  placeholder="Phone number"
                  disabled={disabled}
                  className={`flex-1 ${validation.errors['business.phone'] ? 'border-red-500' : ''}`}
                />
              </div>
              {validation.errors['business.phone'] && (
                <p className="text-sm text-red-500">{validation.errors['business.phone']}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <CardDescription>
              Business address details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street1">Street Address 1</Label>
                <Input
                  id="street1"
                  value={formData.business.address.streetAddress1 || ''}
                  onChange={(e) => updateField('business.address.streetAddress1', e.target.value)}
                  placeholder="123 Main Street"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street2">Street Address 2</Label>
                <Input
                  id="street2"
                  value={formData.business.address.streetAddress2 || ''}
                  onChange={(e) => updateField('business.address.streetAddress2', e.target.value)}
                  placeholder="Suite 100"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.business.address.city || ''}
                  onChange={(e) => updateField('business.address.city', e.target.value)}
                  placeholder="City name"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.business.address.state || ''}
                  onChange={(e) => updateField('business.address.state', e.target.value)}
                  placeholder="State or province"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP/Postal Code</Label>
                <Input
                  id="zip"
                  value={formData.business.address.zipPostal || ''}
                  onChange={(e) => updateField('business.address.zipPostal', e.target.value)}
                  placeholder="12345"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.business.address.country || ''}
                  onChange={(e) => updateField('business.address.country', e.target.value)}
                  placeholder="Country name"
                  disabled={disabled}
                  className={validation.errors['business.address.country'] ? 'border-red-500' : ''}
                />
                {validation.errors['business.address.country'] && (
                  <p className="text-sm text-red-500">{validation.errors['business.address.country']}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phone Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Phone Configuration</CardTitle>
            <CardDescription>
              Configure your WhatsApp Business phone number
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone-display-name">Display Name *</Label>
                <Input
                  id="phone-display-name"
                  value={formData.phone.displayName || ''}
                  onChange={(e) => updateField('phone.displayName', e.target.value)}
                  placeholder="Your Business Name"
                  disabled={disabled}
                  className={validation.errors['phone.displayName'] ? 'border-red-500' : ''}
                />
                {validation.errors['phone.displayName'] && (
                  <p className="text-sm text-red-500">{validation.errors['phone.displayName']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-category">Category</Label>
                <Select 
                  value={formData.phone.category || ''} 
                  onValueChange={(value) => updateField('phone.category', value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {WHATSAPP_PHONE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone-description">Description</Label>
              <Textarea
                id="phone-description"
                value={formData.phone.description || ''}
                onChange={(e) => updateField('phone.description', e.target.value)}
                placeholder="Brief description of this phone number's purpose"
                disabled={disabled}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={loadSampleData}
                  disabled={disabled}
                >
                  📋 Load Sample Data
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={disabled}
                >
                  🔄 Reset Form
                </Button>
              </div>

              <Button
                type="submit"
                disabled={disabled || !validation.isValid || isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  '🚀 Submit Onboarding'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        {showDebug && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <CardDescription>
                Current form state and validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Validation State:</h4>
                  <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(validation, null, 2)}
                  </pre>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Form Data:</h4>
                  <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}