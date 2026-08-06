import { BikeModel, Offer, ServiceCenter, FAQItem } from '../types';
import { BANGLADESH_DISTRICTS } from './locationData';

// Official ACI Motors Yamaha lineup in Bangladesh (Aug 2026).
// Images are official product renders served locally from /assets/bikes/.
export const YAMAHA_BIKES: BikeModel[] = [
  {
    id: 'r15-v4',
    name: 'Yamaha YZF R15 V4',
    category: 'Sports',
    tagline: 'Born of Racing DNA with Class-Leading Technology',
    engineCc: 155,
    maxPower: '18.4 PS @ 10,000 RPM',
    maxTorque: '14.2 Nm @ 7,500 RPM',
    mileage: '40 - 45 km/l',
    priceBDT: 610000,
    offerPriceBDT: 595000,
    cashbackBDT: 15000,
    emiStartingBDT: 14500,
    colors: [
      { name: 'Racing Blue', hex: '#0020A1' },
      { name: 'Intensity White', hex: '#E2E8F0' },
      { name: 'Dark Knight', hex: '#1E293B' },
      { name: 'Metallic Red', hex: '#DC2626' }
    ],
    image: '/assets/bikes/r15-v4.png',
    features: [
      'Variable Valve Actuation (VVA)',
      'Traction Control System (TCS)',
      'Dual Channel ABS',
      'Upside Down (USD) Front Fork',
      'Quick Shifter (Selectable)',
      'Assist & Slipper Clutch',
      'Bluetooth Y-Connect App Support'
    ],
    absType: 'Dual Channel ABS',
    seatHeightMm: 815,
    weightKg: 142,
    fuelTankLiters: 11,
    bestFor: ['Track & Speed Enthusiasts', 'College & Youth Style', 'Highway Cruising', 'Aggressive Sport Riding'],
    popularInBD: true
  },
  {
    id: 'r15m-v4',
    name: 'Yamaha YZF R15M',
    category: 'Sports',
    tagline: 'Track Precision Mastered in Premium Metallic Grey',
    engineCc: 155,
    maxPower: '18.4 PS @ 10,000 RPM',
    maxTorque: '14.2 Nm @ 7,500 RPM',
    mileage: '40 - 43 km/l',
    priceBDT: 660000,
    offerPriceBDT: 645000,
    cashbackBDT: 15000,
    emiStartingBDT: 15700,
    colors: [
      { name: 'Metallic Grey', hex: '#94A3B8' },
      { name: 'Monster Energy MotoGP Edition', hex: '#0F172A' }
    ],
    image: '/assets/bikes/r15m-v4.png',
    features: [
      'Standard Quick Shifter',
      'Exclusive 3D Emblem & Premium Graphics',
      'Dual Channel ABS',
      'Gold Calipers & Golden USD Forks',
      'Traction Control System (TCS)',
      'Assist & Slipper Clutch',
      'Y-Connect Telematics'
    ],
    absType: 'Dual Channel ABS',
    seatHeightMm: 815,
    weightKg: 142,
    fuelTankLiters: 11,
    bestFor: ['Track Days', 'MotoGP Fans', 'Premium Sports Enthusiasts'],
    popularInBD: true
  },
  {
    id: 'mt-15-v2',
    name: 'Yamaha MT-15 V2',
    category: 'Street',
    tagline: 'The Dark Side of Japan - Street Naked Beast',
    engineCc: 155,
    maxPower: '18.4 PS @ 10,000 RPM',
    maxTorque: '14.1 Nm @ 7,500 RPM',
    mileage: '42 - 48 km/l',
    priceBDT: 460000,
    offerPriceBDT: 448000,
    cashbackBDT: 12000,
    emiStartingBDT: 10900,
    colors: [
      { name: 'Cyan Storm', hex: '#06B6D4' },
      { name: 'Ice Fluo Vermillion', hex: '#E11D48' },
      { name: 'Racing Blue', hex: '#0020A1' },
      { name: 'Metallic Black', hex: '#111827' }
    ],
    image: '/assets/bikes/mt-15-v2.png',
    features: [
      'VVA Liquid-Cooled Engine',
      'Dual Channel ABS',
      'USD Front Suspension',
      'Bi-Functional LED Headlamp',
      'Aluminum Swingarm',
      'Upright Street Riding Ergonomics',
      'Yamaha Y-Connect'
    ],
    absType: 'Dual Channel ABS',
    seatHeightMm: 810,
    weightKg: 139,
    fuelTankLiters: 10,
    bestFor: ['Daily City Commute with Attitude', 'Quick Acceleration', 'Comfortable Urban Riding'],
    popularInBD: true
  },
  {
    id: 'fzs-v4-fi',
    name: 'Yamaha FZ-S V4 FI ABS',
    category: 'Street',
    tagline: 'Lord of the Streets with Traction Control System',
    engineCc: 149,
    maxPower: '12.4 PS @ 7,250 RPM',
    maxTorque: '13.3 Nm @ 5,500 RPM',
    mileage: '45 - 50 km/l',
    priceBDT: 299000,
    offerPriceBDT: 291000,
    cashbackBDT: 8000,
    emiStartingBDT: 7100,
    colors: [
      { name: 'Majesty Red', hex: '#B91C1C' },
      { name: 'Dark Matte Blue', hex: '#1E3A8A' },
      { name: 'Matte Black', hex: '#18181B' },
      { name: 'Metallic Grey', hex: '#64748B' }
    ],
    image: '/assets/bikes/fzs-v4-fi.png',
    features: [
      'Traction Control System (TCS)',
      'Single Channel ABS',
      'All LED Headlamp & LED Turn Indicators',
      'Fuel Injection (FI) Engine',
      'Comfortable Two-Level Seat',
      'Bluetooth Y-Connect LCD Console',
      'Lightweight Chassis (136 kg)'
    ],
    absType: 'Single Channel ABS',
    seatHeightMm: 790,
    weightKg: 136,
    fuelTankLiters: 13,
    bestFor: ['Daily Office Commute in Dhaka/Ctg', 'Family Comfort with Pillion', 'High Mileage & Low Maintenance'],
    popularInBD: true
  },
  {
    id: 'fzs-v2-fi',
    name: 'Yamaha FZS FI V2 (Double Disc)',
    category: 'Street',
    tagline: 'The Proven Street Commuter with Blue Core Reliability',
    engineCc: 149,
    maxPower: '13.1 PS @ 8,000 RPM',
    maxTorque: '12.8 Nm @ 6,000 RPM',
    mileage: '45 - 50 km/l',
    priceBDT: 236500,
    offerPriceBDT: 231500,
    cashbackBDT: 5000,
    emiStartingBDT: 5600,
    colors: [
      { name: 'Majesty Red', hex: '#991B1B' },
      { name: 'Matte Black', hex: '#27272A' },
      { name: 'Metallic Grey', hex: '#475569' }
    ],
    image: '/assets/bikes/fzs-v2-fi.png',
    features: [
      'Blue Core FI Engine',
      'Front & Rear Disc Brakes (Double Disc)',
      'Monocross Rear Suspension',
      'Wide Radial Rear Tire (140/60-R17)',
      'Digital Speedometer with ECO Indicator',
      'Proven Low Maintenance Engine'
    ],
    absType: 'Double Disc (Non-ABS)',
    seatHeightMm: 790,
    weightKg: 133,
    fuelTankLiters: 12,
    bestFor: ['Budget City Commuting', 'Fuel Efficiency', 'Long Lasting Engine Life'],
    popularInBD: true
  },
  {
    id: 'fzx-150',
    name: 'Yamaha FZ-X 150',
    category: 'Scrambler',
    tagline: 'Neo-Retro Scrambler Built for Rough & Tough BD Roads',
    engineCc: 149,
    maxPower: '12.4 PS @ 7,250 RPM',
    maxTorque: '13.3 Nm @ 5,500 RPM',
    mileage: '45 - 50 km/l',
    priceBDT: 307500,
    offerPriceBDT: 297500,
    cashbackBDT: 10000,
    emiStartingBDT: 7300,
    colors: [
      { name: 'Matte Copper', hex: '#B45309' },
      { name: 'Matte Black', hex: '#18181B' },
      { name: 'Metallic Blue', hex: '#1E40AF' }
    ],
    image: '/assets/bikes/fzx-150.png',
    features: [
      'Neo-Retro Round LED Headlamp with DRL',
      'Block Pattern All-Terrain Tires',
      'Traction Control System (TCS)',
      'Single Channel ABS',
      'In-Built USB Charging Port',
      'Tough Fork Boots & Under-guard',
      'Upright Relaxed Handlebar'
    ],
    absType: 'Single Channel ABS',
    seatHeightMm: 810,
    weightKg: 139,
    fuelTankLiters: 10,
    bestFor: ['Vintage Scrambler Style', 'Touring on Village & Highway Roads', 'Relaxed Riding Position'],
    popularInBD: true
  },
  {
    id: 'fazer-v2',
    name: 'Yamaha Fazer FI V2',
    category: 'Street',
    tagline: 'Semi-Fairing Highway Tourer with Aerodynamic Windshield',
    engineCc: 149,
    maxPower: '13.1 PS @ 8,000 RPM',
    maxTorque: '12.8 Nm @ 6,000 RPM',
    mileage: '42 - 46 km/l',
    priceBDT: 245000,
    offerPriceBDT: 240000,
    cashbackBDT: 5000,
    emiStartingBDT: 5800,
    colors: [
      { name: 'Midnight Black', hex: '#09090B' },
      { name: 'Burning Red', hex: '#DC2626' }
    ],
    image: '/assets/bikes/fazer-v2.png',
    features: [
      'Aerodynamic Dual Headlight Fairing',
      'Fuel Injection (FI)',
      'Monocross Rear Suspension',
      'Comfortable Long Touring Seat',
      'Wide Radial Rear Tire'
    ],
    absType: 'Disc / Drum',
    seatHeightMm: 790,
    weightKg: 138,
    fuelTankLiters: 12,
    bestFor: ['Highway Cruising & Touring', 'Wind Blast Protection'],
    popularInBD: false
  },
  {
    id: 'fz25',
    name: 'Yamaha FZ25',
    category: 'Street',
    tagline: '250cc Muscular Street Fighter for Highway Dominance',
    engineCc: 249,
    maxPower: '20.8 PS @ 8,000 RPM',
    maxTorque: '20.1 Nm @ 6,000 RPM',
    mileage: '35 - 40 km/l',
    priceBDT: 410000,
    offerPriceBDT: 400000,
    cashbackBDT: 10000,
    emiStartingBDT: 9800,
    colors: [
      { name: 'Metallic Black', hex: '#111827' },
      { name: 'Racing Blue', hex: '#0020A1' },
      { name: 'Warrior White', hex: '#E2E8F0' }
    ],
    image: '/assets/bikes/fz25.png',
    features: [
      '249cc Oil-Cooled FI Engine',
      'Dual Channel ABS',
      'Bi-Functional LED Headlight',
      'Muscular Tank Design',
      'Comfortable Upright Ergonomics',
      'Strongest Low-End Torque in Class'
    ],
    absType: 'Dual Channel ABS',
    seatHeightMm: 795,
    weightKg: 153,
    fuelTankLiters: 14,
    bestFor: ['Highest CC Street Bike in BD Lineup', 'Highway Touring with Pillion', 'Torque Lovers'],
    popularInBD: true
  },
  {
    id: 'saluto-125',
    name: 'Yamaha Saluto 125 UBS',
    category: 'Commuter',
    tagline: 'Economical, Lightweight & Ultra Comfortable Commuter',
    engineCc: 125,
    maxPower: '8.3 PS @ 7,000 RPM',
    maxTorque: '10.1 Nm @ 4,500 RPM',
    mileage: '60 - 68 km/l',
    priceBDT: 165000,
    offerPriceBDT: 160000,
    cashbackBDT: 5000,
    emiStartingBDT: 3900,
    colors: [
      { name: 'Armada Blue', hex: '#1E3A8A' },
      { name: 'Matte Green', hex: '#14532D' },
      { name: 'Sparkling Black', hex: '#09090B' }
    ],
    image: '/assets/bikes/saluto-125.png',
    features: [
      'Blue Core 125cc Air-Cooled Engine',
      'Front Disc Brake with UBS',
      'Class-Leading 114 kg Light Weight',
      'Extra Cushion Dual Seat for Pillion',
      'Large 18-inch Alloy Wheels',
      'High Ground Clearance (180 mm)'
    ],
    absType: 'UBS (Unified Braking System)',
    seatHeightMm: 805,
    weightKg: 114,
    fuelTankLiters: 7.6,
    bestFor: ['Maximum Fuel Mileage', 'Daily Office & Business Use', 'Elderly & Family Passengers'],
    popularInBD: true
  },
  {
    id: 'rayzr-125-fi',
    name: 'Yamaha RayZR 125 FI',
    category: 'Scooter',
    tagline: 'Armored Street Rally Scooter with Hybrid Power Assist',
    engineCc: 125,
    maxPower: '8.2 PS @ 6,500 RPM',
    maxTorque: '10.3 Nm @ 5,000 RPM',
    mileage: '55 - 60 km/l',
    priceBDT: 225000,
    offerPriceBDT: 218000,
    cashbackBDT: 7000,
    emiStartingBDT: 5400,
    colors: [
      { name: 'Street Rally Blue', hex: '#1D4ED8' },
      { name: 'Cyan Storm', hex: '#0891B2' },
      { name: 'Reddish Yellow', hex: '#CA8A04' },
      { name: 'Matte Black', hex: '#27272A' }
    ],
    image: '/assets/bikes/rayzr-125-fi.png',
    features: [
      'Smart Motor Generator (SMG) Hybrid Assist',
      'Automatic Stop & Start System (SSS)',
      'Quiet Engine Start',
      'Unified Braking System (UBS)',
      '21 Liters Under-Seat Storage',
      'Tough Knuckle Guards & LED Light Bar',
      'Ultra Light 99 kg Kerb Weight'
    ],
    absType: 'UBS (Unified Braking System)',
    seatHeightMm: 785,
    weightKg: 99,
    fuelTankLiters: 5.2,
    bestFor: ['Dhaka Traffic Easy Automatic Riding', 'Female & Male Urban Commuters', 'Carrying Grocery & Helmets'],
    popularInBD: true
  },
  {
    id: 'aerox-155',
    name: 'Yamaha Aerox 155 ABS',
    category: 'Scooter',
    tagline: 'The R15-Hearted Maxi-Sports Scooter',
    engineCc: 155,
    maxPower: '15.1 PS @ 8,000 RPM',
    maxTorque: '13.9 Nm @ 6,500 RPM',
    mileage: '35 - 40 km/l',
    priceBDT: 530000,
    offerPriceBDT: 518000,
    cashbackBDT: 12000,
    emiStartingBDT: 12600,
    colors: [
      { name: 'Racing Blue', hex: '#0020A1' },
      { name: 'Metallic Black', hex: '#111827' },
      { name: 'Silver', hex: '#94A3B8' }
    ],
    image: '/assets/bikes/aerox-155.png',
    features: [
      '155cc VVA Liquid-Cooled Engine (Same Family as R15)',
      'Single Channel ABS',
      'Sporty Maxi-Scooter Design',
      '25L Under-Seat Storage',
      'Smart Key System',
      'LED Headlights & Digital Cluster'
    ],
    absType: 'Single Channel ABS',
    seatHeightMm: 790,
    weightKg: 126,
    fuelTankLiters: 5.5,
    bestFor: ['Premium Scooter Lovers', 'Sporty Automatic Performance', 'Long Comfortable Commutes'],
    popularInBD: true
  }
];

export const YAMAHA_OFFERS: Offer[] = [
  {
    id: 'offer-monsoon-cashback',
    titleEn: 'ACI Motors Yamaha Special Cashback Offer 2026',
    titleBn: 'এসিআই মটরস ইয়ামাহা বিশেষ ক্যাশব্যাক অফার ২০২৬',
    descriptionEn: 'Get up to ৳15,000 flat cashback on Yamaha R15 V4, R15M, and MT-15 V2 models. Valid across all authorized showrooms in Bangladesh!',
    descriptionBn: 'ইয়ামাহা R15 V4, R15M এবং MT-15 V2 মডেলে পাচ্ছেন সর্বোচ্চ ১৫,০০০ টাকা পর্যন্ত ফ্ল্যাট ক্যাশব্যাক। বাংলাদেশের সকল অনুমোদিত শোরুমে প্রযোজ্য!',
    validUntil: 'August 31, 2026',
    discountValueBDT: 15000,
    applicableModels: ['r15-v4', 'r15m-v4', 'mt-15-v2', 'fzs-v4-fi', 'fzx-150'],
    tag: 'Cashback',
    badgeColor: 'bg-emerald-600 text-white'
  },
  {
    id: 'offer-emi-zero',
    titleEn: '0% Interest EMI for up to 12 Months',
    titleBn: '১২ মাস পর্যন্ত ০% সুদে ইএমআই সুবিধা',
    descriptionEn: 'Purchase your dream Yamaha bike with 0% interest EMI using City Bank, BRAC Bank, EBL, Dutch Bangla Bank, or Prime Bank credit cards.',
    descriptionBn: 'সিটি ব্যাংক, ব্র্যাক ব্যাংক, ইবিএল, ডাচ বাংলা ব্যাংক বা প্রাইম ব্যাংক ক্রেডিট কার্ডে ০% সুদে ১২ মাস পর্যন্ত কিস্তিতে কিনুন।',
    validUntil: 'December 31, 2026',
    discountValueBDT: 0,
    applicableModels: ['ALL'],
    tag: '0% EMI',
    badgeColor: 'bg-blue-600 text-white'
  },
  {
    id: 'offer-free-helmet',
    titleEn: 'Free Certified Yamaha Helmet & Yamalube Gift Box',
    titleBn: 'ফ্রি সার্টিফাইড ইয়ামাহা হেলমেট এবং ইয়ামালুব গিফট বক্স',
    descriptionEn: 'Every new purchase of FZ-S V4, FZS V2, or FZ-X comes with 1 DOT-certified Yamaha Helmet, Yamalube Engine Oil, and 4 Free Servicing Coupons.',
    descriptionBn: 'প্রতিটি এফজেড-এস ভি৪, ভি২ অথবা এফজেড-এক্স ক্রয়ে সাথে পাচ্ছেন ১টি সার্টিফাইড ইয়ামাহা হেলমেট, ইয়ামালুব ইঞ্জিন অয়েল এবং ৪টি ফ্রি সার্ভিস কুপন।',
    validUntil: 'September 15, 2026',
    discountValueBDT: 4500,
    applicableModels: ['fzs-v4-fi', 'fzs-v2-fi', 'fzx-150'],
    tag: 'Free Gift',
    badgeColor: 'bg-amber-600 text-white'
  }
];

export const SERVICE_CENTERS: ServiceCenter[] = [
  {
    id: 'sc-dhk-01',
    nameEn: 'ACI Motors Yamaha Flagship Center - Tejgaon',
    nameBn: 'এসিআই মটরস ইয়ামাহা ফ্ল্যাগশিপ সেন্টার - তেজগাঁও',
    division: 'Dhaka',
    district: 'Dhaka',
    area: 'Tejgaon I/A',
    addressEn: 'ACI Centre, 245 Tejgaon Industrial Area, Dhaka-1208',
    addressBn: 'এসিআই সেন্টার, ২৪৫ তেজগাঁও শিল্প এলাকা, ঢাকা-১২০৮',
    phone: '+8801708137288',
    hotline: '16508',
    openingHours: 'Sat - Thu: 9:00 AM - 7:00 PM',
    rating: 4.9,
    servicesAvailable: ['1st-4th Free Service', 'Y-Connect ECU Tuning', 'FI Diagnostic Check', 'Engine Overhaul', 'Spare Parts Shop', 'Free Wash & Polish'],
    lat: 23.7639,
    lng: 90.3888,
    isFlagship: true,
    inventory: {
      'r15-v4': 'In Stock',
      'r15m-v4': 'In Stock',
      'mt-15-v2': 'In Stock',
      'fzs-v4-fi': 'In Stock',
      'fzs-v2-fi': 'In Stock',
      'fzx-150': 'Limited Stock',
      'fz25': 'In Stock',
      'saluto-125': 'In Stock',
      'rayzr-125-fi': 'In Stock',
      'aerox-155': 'Book Order Only'
    }
  },
  {
    id: 'sc-dhk-02',
    nameEn: 'Yamaha 3S Center - Mirpur 10',
    nameBn: 'ইয়ামাহা ৩এস সেন্টার - মিরপুর ১০',
    division: 'Dhaka',
    district: 'Dhaka',
    area: 'Mirpur',
    addressEn: 'Plot 12, Block C, Main Road, Mirpur 10 Circle, Dhaka',
    addressBn: 'প্লট ১২, ব্লক সি, মেইন রোড, মিরপুর ১০ গোলচত্বর, ঢাকা',
    phone: '+8801730792100',
    hotline: '16508',
    openingHours: 'Sat - Thu: 9:30 AM - 7:30 PM',
    rating: 4.8,
    servicesAvailable: ['Free & Paid Service', 'FI Diagnostic Check', 'Quick Oil Change', 'Yamaha Genuine Spare Parts'],
    lat: 23.8069,
    lng: 90.3687,
    isFlagship: false,
    inventory: {
      'r15-v4': 'In Stock',
      'mt-15-v2': 'In Stock',
      'fzs-v4-fi': 'In Stock',
      'fzs-v2-fi': 'In Stock',
      'fzx-150': 'In Stock',
      'saluto-125': 'In Stock',
      'rayzr-125-fi': 'Limited Stock'
    }
  },
  {
    id: 'sc-dhk-03',
    nameEn: 'Crescent Motors Yamaha - Uttara Sector 7',
    nameBn: 'ক্রিসেন্ট মটরস ইয়ামাহা - উত্তরা সেক্টর ৭',
    division: 'Dhaka',
    district: 'Dhaka',
    area: 'Uttara',
    addressEn: 'House 4, Sector 7, Dhaka-Mymensingh Highway, Uttara, Dhaka',
    addressBn: 'হাউস ৪, সেক্টর ৭, ঢাকা-ময়মনসিংহ হাইওয়ে, উত্তরা, ঢাকা',
    phone: '+8801711902244',
    openingHours: 'Sat - Thu: 10:00 AM - 8:00 PM',
    rating: 4.7,
    servicesAvailable: ['Free Service', 'Periodical Maintenance', 'Yamalube Synthetic Oil', 'Parts Replacement'],
    lat: 23.8721,
    lng: 90.3982,
    isFlagship: false,
    inventory: {
      'r15-v4': 'In Stock',
      'r15m-v4': 'Limited Stock',
      'mt-15-v2': 'In Stock',
      'fzs-v4-fi': 'In Stock',
      'saluto-125': 'In Stock'
    }
  },
  {
    id: 'sc-dhk-04',
    nameEn: 'Yamaha Dealer - Dhanmondi Satmasjid Road',
    nameBn: 'ইয়ামাহা ডিলার - ধানমন্ডি সাতমসজিদ রোড',
    division: 'Dhaka',
    district: 'Dhaka',
    area: 'Dhanmondi',
    addressEn: 'House 54, Satmasjid Road, Dhanmondi 11/A, Dhaka',
    addressBn: 'হাউস ৫৪, সাতমসজিদ রোড, ধানমন্ডি ১১/এ, ঢাকা',
    phone: '+8801819223344',
    openingHours: 'Sat - Thu: 10:00 AM - 8:00 PM',
    rating: 4.8,
    servicesAvailable: ['Showroom Sales', 'Express Maintenance', 'FI Cleaning', 'Genuine Accessories'],
    lat: 23.7461,
    lng: 90.3742,
    isFlagship: false,
    inventory: {
      'r15-v4': 'In Stock',
      'mt-15-v2': 'In Stock',
      'fzs-v4-fi': 'In Stock',
      'fzx-150': 'In Stock',
      'rayzr-125-fi': 'In Stock'
    }
  },
  {
    id: 'sc-ctg-01',
    nameEn: 'ACI Motors Yamaha 3S Center - Agrabad, Chittagong',
    nameBn: 'এসিআই মটরস ইয়ামাহা ৩এস সেন্টার - আগ্রাবাদ, চট্টগ্রাম',
    division: 'Chittagong',
    district: 'Chittagong',
    area: 'Agrabad C/A',
    addressEn: 'CDA Avenue, Agrabad Commercial Area, Chittagong',
    addressBn: 'সিডিএ এভিনিউ, আগ্রাবাদ বাণিজ্যিক এলাকা, চট্টগ্রাম',
    phone: '+8801708137290',
    hotline: '16508',
    openingHours: 'Sat - Thu: 9:00 AM - 7:00 PM',
    rating: 4.9,
    servicesAvailable: ['Flagship Service', 'FI Diagnostic', 'Engine Tuning', 'Full Body Painting', 'Parts & Accessories'],
    lat: 22.3278,
    lng: 91.8122,
    isFlagship: true,
    inventory: {
      'r15-v4': 'In Stock',
      'r15m-v4': 'In Stock',
      'mt-15-v2': 'In Stock',
      'fzs-v4-fi': 'In Stock',
      'fzx-150': 'In Stock',
      'fz25': 'Limited Stock',
      'saluto-125': 'In Stock'
    }
  },
  {
    id: 'sc-syl-01',
    nameEn: 'Surma Motors Yamaha - Zindabazar, Sylhet',
    nameBn: 'সুরমা মটরস ইয়ামাহা - জিন্দাবাজার, সিলেট',
    division: 'Sylhet',
    district: 'Sylhet',
    area: 'Zindabazar',
    addressEn: 'Surma Tower, East Zindabazar, Sylhet-3100',
    addressBn: 'সুরমা টাওয়ার, পূর্ব জিন্দাবাজার, সিলেট-৩১০০',
    phone: '+8801712334455',
    openingHours: 'Sat - Thu: 9:30 AM - 7:30 PM',
    rating: 4.8,
    servicesAvailable: ['Free Servicing', 'Wheel Balancing', 'FI Maintenance', 'Yamalube Oil'],
    lat: 24.8949,
    lng: 91.8687,
    isFlagship: false,
    inventory: {
      'r15-v4': 'In Stock',
      'mt-15-v2': 'In Stock',
      'fzs-v4-fi': 'In Stock',
      'saluto-125': 'In Stock'
    }
  },
  {
    id: 'sc-raj-01',
    nameEn: 'Yamaha Authorized Center - Shaheb Bazar, Rajshahi',
    nameBn: 'ইয়ামাহা অথরাইজড সেন্টার - সাহেব বাজার, রাজশাহী',
    division: 'Rajshahi',
    district: 'Rajshahi',
    area: 'Shaheb Bazar',
    addressEn: 'Station Road, Shaheb Bazar, Rajshahi',
    addressBn: 'স্টেশন রোড, সাহেব বাজার, রাজশাহী',
    phone: '+8801715667788',
    openingHours: 'Sat - Thu: 9:00 AM - 7:00 PM',
    rating: 4.7,
    servicesAvailable: ['Service & Parts', 'FI System Check', 'Coupons Redemption'],
    lat: 24.3745,
    lng: 88.6042,
    isFlagship: false,
    inventory: {
      'fzs-v4-fi': 'In Stock',
      'fzs-v2-fi': 'In Stock',
      'saluto-125': 'In Stock',
      'r15-v4': 'Limited Stock'
    }
  },
  {
    id: 'sc-khl-01',
    nameEn: 'Khulna Yamaha 3S Point - KDA Avenue, Khulna',
    nameBn: 'খুলনা ইয়ামাহা ৩এস পয়েন্ট - কেডিএ এভিনিউ, খুলনা',
    division: 'Khulna',
    district: 'Khulna',
    area: 'KDA Avenue',
    addressEn: '15 KDA Avenue, Royal Moor, Khulna',
    addressBn: '১৫ কেডিএ এভিনিউ, রয়েল মোড়, খুলনা',
    phone: '+8801718990011',
    openingHours: 'Sat - Thu: 9:30 AM - 7:00 PM',
    rating: 4.8,
    servicesAvailable: ['All 4 Free Services', 'Engine Diagnostic', 'Authentic Yamalube'],
    lat: 22.8157,
    lng: 89.5638,
    isFlagship: false,
    inventory: {
      'fzs-v4-fi': 'In Stock',
      'mt-15-v2': 'In Stock',
      'r15-v4': 'In Stock',
      'saluto-125': 'In Stock'
    }
  },
  {
    id: 'sc-bar-01',
    nameEn: 'Barisal Yamaha Center - Sadar Road, Barisal',
    nameBn: 'বরিশাল ইয়ামাহা সেন্টার - সদর রোড, বরিশাল',
    division: 'Barisal',
    district: 'Barisal',
    area: 'Sadar Road',
    addressEn: 'Near Bibir Pukur, Sadar Road, Barisal',
    addressBn: 'বিবির পুকুরের কাছে, সদর রোড, বরিশাল',
    phone: '+8801719223388',
    openingHours: 'Sat - Thu: 9:00 AM - 6:30 PM',
    rating: 4.6,
    servicesAvailable: ['Servicing & Repairs', 'FI Cleaning', 'Spare Parts'],
    lat: 22.7010,
    lng: 90.3535,
    isFlagship: false,
    inventory: {
      'fzs-v4-fi': 'In Stock',
      'saluto-125': 'In Stock',
      'fzs-v2-fi': 'In Stock'
    }
  },
  {
    id: 'sc-mym-01',
    nameEn: 'Mymensingh Yamaha 3S - Charpara, Mymensingh',
    nameBn: 'ময়মনসিংহ ইয়ামাহা ৩এস - চরপাড়া, ময়মনসিংহ',
    division: 'Mymensingh',
    district: 'Mymensingh',
    area: 'Charpara',
    addressEn: 'Medical College Road, Charpara, Mymensingh',
    addressBn: 'মেডিকেল কলেজ রোড, চরপাড়া, ময়মনসিংহ',
    phone: '+8801711223399',
    openingHours: 'Sat - Thu: 9:00 AM - 7:00 PM',
    rating: 4.7,
    servicesAvailable: ['Periodic Maintenance', 'Diagnostic Tool Test', 'Oil Filter Change'],
    lat: 24.7471,
    lng: 90.4203,
    isFlagship: false,
    inventory: {
      'r15-v4': 'In Stock',
      'mt-15-v2': 'In Stock',
      'fzs-v4-fi': 'In Stock',
      'saluto-125': 'In Stock'
    }
  }
];

/**
 * Resolve the actual nearest ACI Motors service center from SERVICE_CENTERS
 * (not a single placeholder-per-district) using district + upazila/area text.
 * Falls back: same district's flagship -> same division's flagship -> Dhaka flagship.
 */
export const getNearestServiceCenter = (district: string, upazila?: string): ServiceCenter => {
  const districtLower = (district || '').trim().toLowerCase();
  const upazilaLower = (upazila || '').trim().toLowerCase();

  const districtCenters = SERVICE_CENTERS.filter(c => c.district.toLowerCase() === districtLower);

  if (districtCenters.length > 0) {
    if (upazilaLower) {
      const areaMatch = districtCenters.find(c =>
        c.area.toLowerCase().includes(upazilaLower) ||
        upazilaLower.includes(c.area.toLowerCase()) ||
        c.addressEn.toLowerCase().includes(upazilaLower)
      );
      if (areaMatch) return areaMatch;
    }
    return districtCenters.find(c => c.isFlagship) || districtCenters[0];
  }

  const districtInfo = BANGLADESH_DISTRICTS.find(d => d.nameEn.toLowerCase() === districtLower);
  if (districtInfo) {
    const divisionCenters = SERVICE_CENTERS.filter(c => c.division === districtInfo.division);
    if (divisionCenters.length > 0) {
      return divisionCenters.find(c => c.isFlagship) || divisionCenters[0];
    }
  }

  return SERVICE_CENTERS.find(c => c.isFlagship) || SERVICE_CENTERS[0];
};

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    categoryEn: 'Warranty & Service',
    categoryBn: 'ওয়ারেন্টি ও সার্ভিস',
    questionEn: 'What is the official engine warranty for Yamaha bikes under ACI Motors Bangladesh?',
    questionBn: 'এসিআই মটরসের অধীনে ইয়ামাহা বাইকের অফিসিয়াল ইঞ্জিন ওয়ারেন্টি কতদিনের?',
    answerEn: 'Under ACI Motors, all official Yamaha motorbikes come with a 2-Year or 30,000 KM Engine Warranty (whichever comes first), alongside 4 Free Periodic Maintenance Services.',
    answerBn: 'এসিআই মটরসের অধীনে সকল অফিসিয়াল ইয়ামাহা বাইকে পাচ্ছেন ২ বছর বা ৩০,০০০ কিলোমিটার ইঞ্জিন ওয়ারেন্টি (যেটি আগে আসে) এবং সাথে ৪টি ফ্রি পিরিয়ডিক মেইনটেনেন্স সার্ভিস।'
  },
  {
    id: 'faq-2',
    categoryEn: 'Free Service Intervals',
    categoryBn: 'ফ্রি সার্ভিস সময়সীমা',
    questionEn: 'When should I perform the 4 Free Services for my Yamaha bike?',
    questionBn: 'আমার ইয়ামাহা বাইকের ৪টি ফ্রি সার্ভিস কখন করাতে হবে?',
    answerEn: '1st Free Service: 500-1,000 km (or 30 days)\n2nd Free Service: 3,000-4,000 km (or 120 days)\n3rd Free Service: 6,000-7,000 km (or 210 days)\n4th Free Service: 9,000-10,000 km (or 300 days). Always use Yamalube engine oil for valid warranty.',
    answerBn: '১ম ফ্রি সার্ভিস: ৫০০-১,০০০ কিমি (বা ৩০ দিন)\n২য় ফ্রি সার্ভিস: ৩,০০০-৪,০০০ কিমি (বা ১২০ দিন)\n৩য় ফ্রি সার্ভিস: ৬,০০০-৭,০০০ কিমি (বা ২১০ দিন)\n৪র্থ ফ্রি সার্ভিস: ৯,০০০-১০,০০০ কিমি (বা ৩০০ দিন)। অফিসিয়াল ওয়ারেন্টি বহাল রাখতে সবসময় ইয়ামালুব ইঞ্জিন অয়েল ব্যবহার করুন।'
  },
  {
    id: 'faq-3',
    categoryEn: 'BRTA Registration Cost in BD',
    categoryBn: 'বিআরটিএ রেজিস্ট্রেশন খরচ',
    questionEn: 'How much does BRTA registration cost for a 150cc Yamaha bike in Bangladesh?',
    questionBn: 'বাংলাদেশে ১৫০ সিসি ইয়ামাহা বাইকের বিআরটিএ রেজিস্ট্রেশন খরচ কত?',
    answerEn: 'For 150cc-155cc bikes, BRTA 2-Year registration is approximately ৳13,500 - ৳14,500, and 10-Year registration is approximately ৳22,500 - ৳24,000 including digital number plate and smart card.',
    answerBn: '১৫০-১৫৫ সিসি বাইকের জন্য বিআরটিএ ২ বছর মেয়াদী রেজিস্ট্রেশন আনুমানিক ১৩,৫০০ - ১৪,৫০০ টাকা এবং ১০ বছর মেয়াদী রেজিস্ট্রেশন আনুমানিক ২২,৫০০ - ২৪,০০০ টাকা (ডিজিটাল নম্বর প্লেট ও স্মার্ট কার্ডসহ)।'
  },
  {
    id: 'faq-4',
    categoryEn: 'Yamalube Engine Oil',
    categoryBn: 'ইয়ামালুব ইঞ্জিন অয়েল',
    questionEn: 'Which Yamalube engine oil grade should I use for R15 V4 / MT-15 / FZ-S?',
    questionBn: 'R15 V4 / MT-15 / FZ-S এর জন্য কোন গ্রেডের ইয়ামালুব ইঞ্জিন অয়েল ব্যবহার করা উচিত?',
    answerEn: 'Yamaha recommends Yamalube 4T 10W-40. For Break-in period (0-1,000 km) use Mineral 20W-40. After 1,000 km, upgrade to Yamalube Semi-Synthetic or Yamalube 10W-40 Fully Synthetic RS4GP for maximum engine acceleration and heat reduction.',
    answerBn: 'ইয়ামাহা রিকমেন্ড করে ইয়ামালুব 4T 10W-40। প্রথম ১,০০০ কিমি ব্রেক-ইন পিরিয়ডে মিনারেল ২০ডব্লিউ-৪০ এবং ১,০০০ কিমির পর সর্বোচ্চ এক্সিলারেশন ও ইঞ্জিন সুরক্ষা পেতে ইয়ামালুব সেমি-সিন্থেটিক অথবা ফুলি সিন্থেটিক RS4GP ব্যবহার করুন।'
  },
  {
    id: 'faq-5',
    categoryEn: 'EMI & Loan Facility',
    categoryBn: 'ইএমআই ও লোন সুবিধা',
    questionEn: 'How can I get an EMI loan for a Yamaha motorbike in Bangladesh?',
    questionBn: 'বাংলাদেশে ইয়ামাহা বাইকে কিভাবে ইএমআই বা লোন সুবিধা পাওয়া যাবে?',
    answerEn: 'You can buy any Yamaha bike with 0% EMI using partner bank credit cards (City Bank, BRAC Bank, DBBL, EBL, Prime Bank). Non-cardholders can apply for City Bike Loan / BRAC Bank Biker Loan up to 80% bike value with 12 to 36 months flexible tenure.',
    answerBn: 'পার্টনার ব্যাংক (সিটি ব্যাংক, ব্র্যাক ব্যাংক, ডিবিবিএল, ইবিএল, প্রাইম ব্যাংক) এর ক্রেডিট কার্ডের মাধ্যমে ০% সুদে ইএমআই পাওয়া যায়। এছাড়া ক্রেডিট কার্ড না থাকলে সিটি বাইক লোন বা ব্র্যাক ব্যাংক লোনের মাধ্যমে ১২ থেকে ৩৬ মাসের কিস্তিতে ৮০% পর্যন্ত লোন সুবিধা পাওয়া যায়।'
  }
];
