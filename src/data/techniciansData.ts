// Technician & brand-representative routing database.
// All contacts currently default to Mahadi.Nayem@aci-bd.com per business setup;
// the structure is ready for real per-territory contacts later.

import { ACIBrand } from './aciProductsData';
import { BANGLADESH_DISTRICTS } from './locationData';
import { getNearestServiceCenter } from './yamahaData';

export const DEFAULT_CONTACT = {
  name: 'Md. Mahadi Hassan',
  email: 'Mahadi.Nayem@aci-bd.com',
  phone: '+8801637026774'
};

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  district: string; // matches DistrictOption.nameEn
  division: string;
  serviceCenterName: string;
  specialties: string[];
}

export interface BrandRepresentative {
  brand: ACIBrand;
  name: string;
  email: string;
  phone: string;
  designation: string;
}

export const TECHNICIANS: Technician[] = [
  {
    id: 'tech-dhk-01',
    name: DEFAULT_CONTACT.name,
    email: DEFAULT_CONTACT.email,
    phone: DEFAULT_CONTACT.phone,
    designation: 'Senior Service Technician (Dhaka Flagship)',
    district: 'Dhaka',
    division: 'Dhaka',
    serviceCenterName: 'ACI Motors Yamaha Flagship Center - Tejgaon',
    specialties: ['FI Diagnostics', 'Engine Overhaul', 'ABS Systems', 'Y-Connect ECU']
  },
  {
    id: 'tech-ctg-01',
    name: DEFAULT_CONTACT.name,
    email: DEFAULT_CONTACT.email,
    phone: DEFAULT_CONTACT.phone,
    designation: 'Area Service Technician (Chattogram Zone)',
    district: 'Chattogram (Chittagong)',
    division: 'Chittagong',
    serviceCenterName: 'ACI Motors Yamaha 3S Center - Agrabad',
    specialties: ['Engine Tuning', 'Coastal Corrosion Care', 'Suspension']
  },
  {
    id: 'tech-syl-01',
    name: DEFAULT_CONTACT.name,
    email: DEFAULT_CONTACT.email,
    phone: DEFAULT_CONTACT.phone,
    designation: 'Territory Service Technician (Sylhet Division)',
    district: 'Sylhet',
    division: 'Sylhet',
    serviceCenterName: 'Surma Motors Yamaha - Zindabazar',
    specialties: ['Periodic Maintenance', 'FI Cleaning', 'Wheel Balancing']
  },
  {
    id: 'tech-raj-01',
    name: DEFAULT_CONTACT.name,
    email: DEFAULT_CONTACT.email,
    phone: DEFAULT_CONTACT.phone,
    designation: 'Territory Service Technician (Rajshahi Division)',
    district: 'Rajshahi',
    division: 'Rajshahi',
    serviceCenterName: 'Yamaha Authorized Center - Shaheb Bazar',
    specialties: ['Engine Diagnostics', 'Spare Parts Fitting']
  },
  {
    id: 'tech-khl-01',
    name: DEFAULT_CONTACT.name,
    email: DEFAULT_CONTACT.email,
    phone: DEFAULT_CONTACT.phone,
    designation: 'Territory Service Technician (Khulna Division)',
    district: 'Khulna',
    division: 'Khulna',
    serviceCenterName: 'Khulna Yamaha 3S Point - KDA Avenue',
    specialties: ['Free Service Coupons', 'Engine Diagnostics']
  },
  {
    id: 'tech-bar-01',
    name: DEFAULT_CONTACT.name,
    email: DEFAULT_CONTACT.email,
    phone: DEFAULT_CONTACT.phone,
    designation: 'Territory Service Technician (Barisal Division)',
    district: 'Barishal (Barisal)',
    division: 'Barisal',
    serviceCenterName: 'Barisal Yamaha Center - Sadar Road',
    specialties: ['Periodic Servicing', 'FI Cleaning']
  },
  {
    id: 'tech-mym-01',
    name: DEFAULT_CONTACT.name,
    email: DEFAULT_CONTACT.email,
    phone: DEFAULT_CONTACT.phone,
    designation: 'Territory Service Technician (Mymensingh Division)',
    district: 'Mymensingh',
    division: 'Mymensingh',
    serviceCenterName: 'Mymensingh Yamaha 3S - Charpara',
    specialties: ['Periodic Maintenance', 'Diagnostic Tool Testing']
  },
  {
    id: 'tech-rng-01',
    name: DEFAULT_CONTACT.name,
    email: DEFAULT_CONTACT.email,
    phone: DEFAULT_CONTACT.phone,
    designation: 'Territory Service Technician (Rangpur Division)',
    district: 'Rangpur',
    division: 'Rangpur',
    serviceCenterName: 'Rangpur Yamaha Service Point',
    specialties: ['Periodic Maintenance', 'Rural Mobile Service Van']
  }
];

export const BRAND_REPRESENTATIVES: BrandRepresentative[] = [
  { brand: 'Yamaha',      name: DEFAULT_CONTACT.name, email: DEFAULT_CONTACT.email, phone: DEFAULT_CONTACT.phone, designation: 'Senior Sales Specialist - Yamaha Motorcycles' },
  { brand: 'Yamalube',    name: DEFAULT_CONTACT.name, email: DEFAULT_CONTACT.email, phone: DEFAULT_CONTACT.phone, designation: 'Product Executive - Yamalube Lubricants' },
  { brand: 'CEAT',        name: DEFAULT_CONTACT.name, email: DEFAULT_CONTACT.email, phone: DEFAULT_CONTACT.phone, designation: 'Product Executive - CEAT Tires' },
  { brand: 'Liqui Moly',  name: DEFAULT_CONTACT.name, email: DEFAULT_CONTACT.email, phone: DEFAULT_CONTACT.phone, designation: 'Product Executive - Liqui Moly Additives' },
  { brand: 'EcoFlow',     name: DEFAULT_CONTACT.name, email: DEFAULT_CONTACT.email, phone: DEFAULT_CONTACT.phone, designation: 'Product Executive - EcoFlow Power Stations' },
  { brand: 'GoodWe',      name: DEFAULT_CONTACT.name, email: DEFAULT_CONTACT.email, phone: DEFAULT_CONTACT.phone, designation: 'Product Executive - GoodWe Solar Inverters' },
  { brand: 'Aiko Solar',  name: DEFAULT_CONTACT.name, email: DEFAULT_CONTACT.email, phone: DEFAULT_CONTACT.phone, designation: 'Product Executive - Aiko Solar Panels' }
];

export interface ResolvedTechnician extends Technician {
  serviceCenterAddress: string;
  serviceCenterPhone: string;
  serviceCenterHotline?: string;
}

/**
 * Resolve the nearest technician contact (exact district match → same division →
 * Dhaka default) AND attach the actual nearest ACI service center (from
 * SERVICE_CENTERS, matched by district + upazila/area) rather than a single
 * hardcoded center per technician — so a Mirpur customer is pointed to the real
 * Mirpur 3S Center, not always the Tejgaon flagship.
 */
export const getTechnicianForLocation = (districtNameEn: string, upazilaNameEn?: string): ResolvedTechnician => {
  const exact = TECHNICIANS.find(t => t.district.toLowerCase() === districtNameEn.toLowerCase());

  const districtObj = BANGLADESH_DISTRICTS.find(
    x => x.nameEn.toLowerCase() === districtNameEn.toLowerCase()
  );
  const sameDivision = !exact && districtObj
    ? TECHNICIANS.find(t => t.division === districtObj.division)
    : undefined;

  const baseTechnician = exact || sameDivision || TECHNICIANS[0];
  const nearestCenter = getNearestServiceCenter(districtNameEn, upazilaNameEn);

  return {
    ...baseTechnician,
    serviceCenterName: nearestCenter.nameEn,
    serviceCenterAddress: nearestCenter.addressEn,
    serviceCenterPhone: nearestCenter.phone,
    serviceCenterHotline: nearestCenter.hotline
  };
};

export const getRepresentativeForBrand = (brand: ACIBrand): BrandRepresentative =>
  BRAND_REPRESENTATIVES.find(r => r.brand === brand) || BRAND_REPRESENTATIVES[0];
