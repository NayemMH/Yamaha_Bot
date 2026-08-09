import type { ACIProduct, DiagnosticIssue } from './data/aciProductsData';

export type Language = 'en' | 'bn';

export type ThemeMode = 'racing-dark' | 'corporate-light' | 'cyber-neon' | 'championship-gold';
export type LayoutMode = 'standard' | 'split-dashboard' | 'command-center' | 'compact-portal';

export interface BikeModel {
  id: string;
  name: string;
  category: 'Sports' | 'Street' | 'Scrambler' | 'Commuter' | 'Scooter' | 'Superbike';
  tagline: string;
  engineCc: number;
  maxPower: string; // e.g. "18.4 PS @ 10000 RPM"
  maxTorque: string; // e.g. "14.2 Nm @ 7500 RPM"
  mileage: string; // e.g. "40-45 kmpl"
  priceBDT: number; // Regular price in BDT
  offerPriceBDT?: number; // Discounted offer price
  cashbackBDT?: number; // Current cashback amount
  emiStartingBDT: number; // EMI per month starting from
  colors: { name: string; hex: string; image?: string }[];
  image: string;
  features: string[];
  absType: 'Dual Channel ABS' | 'Single Channel ABS' | 'UBS (Unified Braking System)' | 'Disc / Drum' | 'Double Disc (Non-ABS)';
  seatHeightMm: number;
  weightKg: number;
  fuelTankLiters: number;
  bestFor: string[];
  popularInBD: boolean;
}

export interface Offer {
  id: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  validUntil: string;
  discountValueBDT: number;
  applicableModels: string[]; // Bike IDs or 'ALL'
  tag: 'Festive Offer' | 'Cashback' | '0% EMI' | 'Free Gift';
  badgeColor: string;
}

export interface ServiceCenter {
  id: string;
  nameEn: string;
  nameBn: string;
  division: 'Dhaka' | 'Chittagong' | 'Sylhet' | 'Rajshahi' | 'Khulna' | 'Barisal' | 'Rangpur' | 'Mymensingh';
  district: string;
  area: string;
  addressEn: string;
  addressBn: string;
  phone: string;
  hotline?: string;
  openingHours: string;
  rating: number;
  servicesAvailable: string[];
  lat: number;
  lng: number;
  isFlagship: boolean;
  inventory: Record<string, 'In Stock' | 'Limited Stock' | 'Book Order Only' | 'Out of Stock'>;
}

export interface ServiceAppointment {
  id: string;
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bikeModel: string;
  registrationNumber: string;
  serviceCenterId: string;
  serviceCenterName: string;
  date: string;
  timeSlot: string;
  serviceType: '1st Free Service' | '2nd Free Service' | '3rd Free Service' | '4th Free Service' | 'Periodic Maintenance' | 'Engine & Transmission' | 'FI Diagnostic & Tuning' | 'Brake & Suspension' | 'Full Water Wash & Polish';
  notes?: string;
  status: 'Confirmed' | 'Completed' | 'Rescheduled' | 'Cancelled';
  createdAt: string;
  whatsappNotice?: {
    sent: boolean;
    targetPhone: string;
    targetName: string;
    whatsappUrl: string;
    messagePreview: string;
  };
}

export interface PurchaseLead {
  id: string;
  leadRef: string;
  customerName: string;
  customerPhone: string;
  location: string;
  preferredBike: string;
  salesmanName: string;
  salesmanEmail: string;
  salesmanLocation: string;
  status: 'Sent To Salesman' | 'Contacted' | 'Closed';
  createdAt: string;
  emailSent: boolean;
  whatsappNotice?: {
    sent: boolean;
    targetPhone: string;
    targetName: string;
    whatsappUrl: string;
    messagePreview: string;
  };
}

export interface ProductCard {
  issue: Pick<DiagnosticIssue,
    'id' | 'titleEn' | 'titleBn' | 'urgency' | 'rootCause' |
    'recommendedActionEn' | 'recommendedActionBn' | 'requiresTechnician'>;
  products: ACIProduct[];
}

export interface ConsultationLead {
  refCode: string;
  customerName: string;
  customerPhone: string;
  location: string;
  technicianName: string;
  technicianPhone: string;
  serviceCenterName: string;
  serviceCenterAddress: string;
  consentedProducts: string[];
  whatsappUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  language?: Language;
  suggestedQuickReplies?: string[];
  bikeCard?: BikeModel;
  appointmentRef?: ServiceAppointment;
  purchaseLeadRef?: PurchaseLead;
  productCard?: ProductCard;
  consultationRef?: ConsultationLead;
  showPurchaseForm?: boolean;
  platform?: 'web' | 'whatsapp' | 'messenger';
}

export interface RecommendationQuizState {
  budgetRangeBDT: [number, number]; // e.g. [150000, 650000]
  ridingPurpose: 'daily_commute' | 'long_touring' | 'racing_track' | 'college_style' | 'family_comfort';
  preferredCategory: 'all' | 'Sports' | 'Street' | 'Commuter' | 'Scooter';
  mileagePriority: 'high' | 'medium' | 'performance_first';
  absRequirement: 'must_have' | 'optional';
  passengerComfort: 'very_important' | 'moderate' | 'solo_rider';
  experienceLevel: 'beginner' | 'intermediate' | 'pro';
}

export interface FAQItem {
  id: string;
  categoryEn: string;
  categoryBn: string;
  questionEn: string;
  questionBn: string;
  answerEn: string;
  answerBn: string;
}
