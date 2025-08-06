/**
 * WhatsApp Business API Onboarding Form Types
 * 
 * WhatsApp Business Account kurulum formu için tip tanımları
 */

export interface WhatsAppBusinessAddress {
  streetAddress1: string | null;
  streetAddress2: string | null;
  city: string | null;
  state: string | null;
  zipPostal: string | null;
  country: string | null;
}

export interface WhatsAppBusinessPhone {
  code: string | null;
  number: string | null;
}

export interface WhatsAppBusiness {
  id: string | null;
  name: string | null;
  email: string | null;
  phone: WhatsAppBusinessPhone;
  website: string | null;
  address: WhatsAppBusinessAddress;
  timezone: string | null;
}

export interface WhatsAppPhoneInfo {
  displayName: string | null;
  category: string | null;
  description: string | null;
}

export interface WhatsAppPreVerifiedPhone {
  ids: string[] | null;
}

export interface WhatsAppBusinessAccountIds {
  ids: string[] | null;
}

export interface WhatsAppOnboardingFormData {
  business: WhatsAppBusiness;
  phone: WhatsAppPhoneInfo;
  preVerifiedPhone: WhatsAppPreVerifiedPhone;
  solutionID: string | null;
  whatsAppBusinessAccount: WhatsAppBusinessAccountIds;
}

// Default/empty form data
export const defaultWhatsAppOnboardingData: WhatsAppOnboardingFormData = {
  business: {
    id: null,
    name: null,
    email: null,
    phone: {
      code: null,
      number: null
    },
    website: null,
    address: {
      streetAddress1: null,
      streetAddress2: null,
      city: null,
      state: null,
      zipPostal: null,
      country: null
    },
    timezone: null
  },
  phone: {
    displayName: null,
    category: null,
    description: null
  },
  preVerifiedPhone: {
    ids: null
  },
  solutionID: null,
  whatsAppBusinessAccount: {
    ids: null
  }
};

// Form validation types
export interface WhatsAppOnboardingValidation {
  isValid: boolean;
  errors: {
    [key: string]: string;
  };
  warnings: {
    [key: string]: string;
  };
}

// Phone categories for WhatsApp Business
export const WHATSAPP_PHONE_CATEGORIES = [
  'CUSTOMER_SERVICE',
  'MARKETING',
  'SALES',
  'SUPPORT',
  'VERIFICATION',
  'OTHER'
] as const;

export type WhatsAppPhoneCategory = typeof WHATSAPP_PHONE_CATEGORIES[number];

// Country codes for phone numbers
export const COUNTRY_CODES = [
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
] as const;

// Timezones
export const TIMEZONES = [
  'Europe/Istanbul',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'UTC'
] as const;

export type Timezone = typeof TIMEZONES[number];