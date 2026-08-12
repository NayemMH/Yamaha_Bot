// ACI Motors multi-brand product catalog + service diagnostics knowledge base.
// Single source of truth: the chatbot system prompt, the Service Assistant tab,
// the engine sound analyzer and the cross-sell dispatch flow are ALL generated
// from this file.

export type ACIBrand =
  | 'Yamaha'
  | 'Yamalube'
  | 'CEAT'
  | 'Liqui Moly'
  | 'EcoFlow'
  | 'GoodWe'
  | 'Aiko Solar';

export interface ACIProduct {
  id: string;
  brand: ACIBrand;
  name: string;
  category: 'Bike' | 'Engine Oil' | 'Tire' | 'Chemical & Additive' | 'Care & Maintenance' | 'Solar & Power Backup';
  tagline: string;
  description: string;
  priceBDT: number;
  image: string;
  keyBenefits: string[];
  recommendedFor: string[];
  representativeEmail: string;
}

export interface DiagnosticIssue {
  id: string;
  problemKey: string;
  titleEn: string;
  titleBn: string;
  symptoms: string[];
  rootCause: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendedProducts: string[]; // Product IDs from ACI_PRODUCTS_CATALOG
  recommendedActionEn: string;
  recommendedActionBn: string;
  requiresTechnician: boolean;
}

// Default representative for every brand until real reps are onboarded
export const DEFAULT_REP_EMAIL = 'Mahadi.Nayem@aci-bd.com';

export const ACI_PRODUCTS_CATALOG: ACIProduct[] = [
  // ============================ YAMALUBE ============================
  {
    id: 'yamalube-synthetic-gp',
    brand: 'Yamalube',
    name: 'Yamalube Fully Synthetic 4T 10W-40 RS4GP',
    category: 'Engine Oil',
    tagline: 'MotoGP Grade Ultimate Engine Performance & Thermal Protection',
    description: 'Designed in Japan for high RPM sports engines like R15 V4, MT-15, and R3. Reduces friction, prevents clutch slippage, and maximizes acceleration.',
    priceBDT: 1350,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['100% Full Synthetic ESTER Technology', 'Extreme Heat & Shear Stability', 'Smooth Gear Shifting'],
    recommendedFor: ['Yamaha YZF R15 V4', 'Yamaha MT-15 V2', 'Yamaha R3', 'High RPM Highway Cruising'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'yamalube-semi-synth',
    brand: 'Yamalube',
    name: 'Yamalube Semi-Synthetic 4T 10W-40',
    category: 'Engine Oil',
    tagline: 'Balanced Fuel Economy & Long Lasting Engine Life',
    description: 'Perfect for FZ-S V4, FZ-X, and daily commuters. Provides quick throttle response and smooth clutch feel in city traffic.',
    priceBDT: 750,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['Excellent Engine Deposit Cleanliness', 'Smooth Clutch Engagement', 'Optimized Viscosity'],
    recommendedFor: ['Yamaha FZ-S V4 FI ABS', 'Yamaha FZ-X 150', 'Yamaha Saluto 125'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'yamalube-mineral',
    brand: 'Yamalube',
    name: 'Yamalube Mineral 4T 20W-40 (Break-in Grade)',
    category: 'Engine Oil',
    tagline: 'Official Break-in Period Oil for New Yamaha Engines (0-1,000 km)',
    description: 'Mandatory mineral grade oil for the first 1,000 km break-in period of every new Yamaha bike to seat piston rings properly and keep warranty valid.',
    priceBDT: 550,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['Warranty-Compliant Break-in Formula', 'Proper Piston Ring Seating', 'JASO MA2 Certified'],
    recommendedFor: ['All New Yamaha Bikes (0-1,000 km)', '1st & 2nd Free Service Oil Change'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'yamalube-scooter-oil',
    brand: 'Yamalube',
    name: 'Yamalube Scooter 4T 10W-40 SL',
    category: 'Engine Oil',
    tagline: 'Dedicated Scooter Formula for Automatic CVT Engines',
    description: 'Formulated for the RayZR 125 FI Hybrid automatic engine and SMG hybrid system. Keeps stop-start operation smooth and quiet.',
    priceBDT: 700,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['Optimized for CVT / Automatic Engines', 'Quiet Stop-Start Operation', 'Low Evaporation Loss'],
    recommendedFor: ['Yamaha RayZR 125 FI Hybrid', 'Automatic Scooters'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'yamalube-carbon-cleaner',
    brand: 'Yamalube',
    name: 'Yamalube Carbon Cleaner FI Treatment (75ml)',
    category: 'Chemical & Additive',
    tagline: 'Restores Fuel Injector Cleanliness & Peak Mileage',
    description: 'Poured directly into the fuel tank. Cleans combustion chamber carbon build-up and fuel injector nozzles to recover lost mileage.',
    priceBDT: 320,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['Restores Engine Mileage', 'Removes FI Carbon Gunk', 'Prevents Engine Stalling'],
    recommendedFor: ['Low Mileage Bikes', 'Bikes over 5,000 KM', 'Irregular Engine Idling'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'yamalube-coolant',
    brand: 'Yamalube',
    name: 'Yamalube Long-Life Coolant (1L)',
    category: 'Care & Maintenance',
    tagline: 'Radiator Protection for Liquid-Cooled VVA Engines',
    description: 'Pre-mixed ethylene-glycol coolant for R15 V4, R15M, MT-15 and R3 radiators. Prevents overheating in Dhaka traffic and protects against corrosion.',
    priceBDT: 450,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['Prevents Engine Overheating', 'Anti-Corrosion & Anti-Rust Formula', '2-Year Change Interval'],
    recommendedFor: ['Liquid-Cooled Yamaha Engines', 'Overheating in Traffic Jams'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'yamalube-brake-fluid',
    brand: 'Yamalube',
    name: 'Yamalube Brake Fluid DOT 4 (250ml)',
    category: 'Care & Maintenance',
    tagline: 'High Boiling Point Fluid for ABS Braking Systems',
    description: 'DOT 4 hydraulic fluid engineered for single & dual channel ABS systems. Restores firm lever feel and consistent panic-braking performance.',
    priceBDT: 350,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['ABS System Compatible', 'High Wet Boiling Point', 'Prevents Spongy Brake Lever'],
    recommendedFor: ['Spongy / Fading Brakes', '2-Year Brake Fluid Replacement'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'yamalube-grease',
    brand: 'Yamalube',
    name: 'Yamalube Multi-Purpose Grease (150g)',
    category: 'Care & Maintenance',
    tagline: 'Bearing, Pivot & Linkage Protection Against Monsoon Water',
    description: 'Water-resistant lithium grease for wheel bearings, swingarm pivots, lever joints and stand springs — essential after monsoon or flooded road riding.',
    priceBDT: 250,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['Water Wash-Out Resistant', 'Stops Bearing Squeal', 'Anti-Seize Protection'],
    recommendedFor: ['Monsoon Season Maintenance', 'Squeaking Levers & Stands'],
    representativeEmail: DEFAULT_REP_EMAIL
  },

  // ============================ CEAT TIRES ============================
  {
    id: 'ceat-zoom-rad-x1',
    brand: 'CEAT',
    name: 'CEAT Zoom Rad X1 Radial Rear Tire (140/70-R17)',
    category: 'Tire',
    tagline: 'High Speed Stability & Superior Cornering Grip on Wet BD Roads',
    description: 'Radial construction tire designed for sports & street bikes. Eliminates slipping on wet pitch roads and muddy highway curves.',
    priceBDT: 5400,
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['Alpha Radial Technology for Superb Grip', 'Wide Tread Grooves for Water Evacuation', '30,000+ KM Tread Life'],
    recommendedFor: ['Slippery Ride / Skidding', 'Yamaha FZ-S / R15 / MT-15 Rear Wheel', 'Wet Season Riding'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'ceat-secura-zoom',
    brand: 'CEAT',
    name: 'CEAT Secura Zoom F Front Tire (100/80-17)',
    category: 'Tire',
    tagline: 'Puncture Resistant Front Tire for Precision Braking',
    description: 'Provides razor-sharp front wheel directional control and shorter stopping distance during sudden ABS braking.',
    priceBDT: 3800,
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['Continuous Center Groove for Wet Track', 'Durable Rubber Compound', 'Reduced Rolling Resistance'],
    recommendedFor: ['Worn Front Tires', 'All 150cc Commuter & Sports Bikes'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'ceat-gripp-x3',
    brand: 'CEAT',
    name: 'CEAT Gripp X3 Dual-Sport Tire (120/80-18)',
    category: 'Tire',
    tagline: 'Block Pattern On/Off-Road Tire for Village & Broken Roads',
    description: 'Aggressive block tread built for FZ-X style scrambler riding on muddy village roads, brick-lain paths and broken highways.',
    priceBDT: 4200,
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['Self-Cleaning Mud Tread', 'Cut & Chip Resistant Sidewall', 'Stable on Sand & Gravel'],
    recommendedFor: ['Yamaha FZ-X 150', 'Rural / Off-Road Riding', 'Frequent Broken Road Commutes'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'ceat-milaze',
    brand: 'CEAT',
    name: 'CEAT Milaze Long-Life Commuter Tire (80/100-18)',
    category: 'Tire',
    tagline: 'Highest KM-per-Taka Tire for Daily Commuters',
    description: 'Tough compound engineered for maximum tread life on commuter bikes like Saluto 125 — ideal for delivery riders and daily long-distance users.',
    priceBDT: 2900,
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['40,000+ KM Tread Life', 'Puncture Resistant Casing', 'Low Rolling Resistance = Better Mileage'],
    recommendedFor: ['Yamaha Saluto 125', 'Delivery & Ride-Sharing Riders', 'Budget-Conscious Commuters'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'ceat-zoom-d-scooter',
    brand: 'CEAT',
    name: 'CEAT Zoom D Scooter Tire (90/90-12)',
    category: 'Tire',
    tagline: 'City Grip Tire Tuned for Lightweight Scooters',
    description: 'Soft compound scooter tire providing confident grip on painted road markings and wet city streets for the RayZR 125.',
    priceBDT: 2400,
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['Wet City Street Grip', 'Quick Warm-Up Compound', 'Even Wear Pattern'],
    recommendedFor: ['Yamaha RayZR 125 FI Hybrid', 'City Scooter Riders'],
    representativeEmail: DEFAULT_REP_EMAIL
  },

  // ============================ LIQUI MOLY ============================
  {
    id: 'liqui-moly-octane-booster',
    brand: 'Liqui Moly',
    name: 'Liqui Moly Motorbike Octane Booster (200ml)',
    category: 'Chemical & Additive',
    tagline: 'Boosts Octane Rating by 2-4 Points & Stops Engine Knocking',
    description: 'Formulated in Germany. Increases octane level of local petrol/octane, eliminates engine pinging/knocking sound, and boosts combustion power.',
    priceBDT: 850,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['Prevents Engine Knocking Noise', 'Increases Octane Power', 'Protects Valves from Corrosion'],
    recommendedFor: ['Poor Quality Octane / Petrol', 'High Compression R15 / MT-15 Engines', 'Vibration Reduction'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'liqui-moly-engine-flush',
    brand: 'Liqui Moly',
    name: 'Liqui Moly Motorbike Engine Flush (250ml)',
    category: 'Chemical & Additive',
    tagline: 'Deep Cleans Engine Sludge & Metal Residue Before Oil Change',
    description: 'Added to old engine oil before draining. Dissolves black sludge and varnish to ensure fresh oil operates at 100% purity.',
    priceBDT: 650,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['Cleans Oil Galleries & Piston Rings', 'Reduces Engine Noise & Vibration', 'Extends New Oil Lifespan'],
    recommendedFor: ['Bikes with 10,000+ KM Mileage', 'Loud Engine Noise / Harshness'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'liqui-moly-chain-lube',
    brand: 'Liqui Moly',
    name: 'Liqui Moly Motorbike Chain Lube Spray (250ml)',
    category: 'Chemical & Additive',
    tagline: 'Heavy Duty Fully Synthetic Chain Lubricant with O-Ring Safety',
    description: 'Water resistant, non-sling chain lubricant that penetrates O/X/Z-ring chains to prevent rust and dry squeaking chain sounds.',
    priceBDT: 950,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['Stays Sticky at High Speeds', 'Resists Dust & Water Splash', 'Extends Sprocket Life'],
    recommendedFor: ['R15 V4 / MT-15 Open Chains', 'Chain Noise / Squeaking'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'liqui-moly-chain-cleaner',
    brand: 'Liqui Moly',
    name: 'Liqui Moly Motorbike Chain Cleaner (500ml)',
    category: 'Care & Maintenance',
    tagline: 'Degreases Mud, Old Lube & Rust Before Fresh Lubrication',
    description: 'Powerful spray degreaser that blasts away caked mud, sand and oxidized lube from the chain before applying new chain lube.',
    priceBDT: 750,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['O-Ring Safe Formula', 'Removes Rust & Grit', 'Doubles Chain-Sprocket Life'],
    recommendedFor: ['Muddy / Monsoon Riding', 'Before Every Chain Lube Application'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'liqui-moly-radiator-cleaner',
    brand: 'Liqui Moly',
    name: 'Liqui Moly Radiator Cleaner (300ml)',
    category: 'Chemical & Additive',
    tagline: 'Dissolves Scale & Sludge Inside Overheating Radiators',
    description: 'Flushes lime scale, rust and oil residue from the cooling circuit before refilling fresh coolant — restores full cooling capacity.',
    priceBDT: 700,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['Restores Cooling Efficiency', 'Neutral to Seals & Hoses', 'Prevents Head Gasket Damage'],
    recommendedFor: ['Overheating Liquid-Cooled Engines', 'Temperature Warning Light Issues'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'liqui-moly-fuel-stabilizer',
    brand: 'Liqui Moly',
    name: 'Liqui Moly Motorbike Speed Additive (150ml)',
    category: 'Chemical & Additive',
    tagline: 'Instant Throttle Response Boost & Fuel System Protection',
    description: 'Cleans the entire fuel system, improves acceleration response and protects against fuel degradation when the bike sits parked for weeks.',
    priceBDT: 550,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['Sharper Throttle Response', 'Protects Parked Bikes from Stale Fuel', 'Cleans Fuel Lines'],
    recommendedFor: ['Bikes Parked for Long Periods', 'Sluggish Acceleration'],
    representativeEmail: DEFAULT_REP_EMAIL
  },

  // ==================== RURAL POWER: ECOFLOW / GOODWE / AIKO ====================
  {
    id: 'ecoflow-river-2',
    brand: 'EcoFlow',
    name: 'EcoFlow River 2 Portable Power Station (256Wh)',
    category: 'Solar & Power Backup',
    tagline: 'Entry-Level Load Shedding Backup for Rural Homes & Shops',
    description: 'Affordable portable power station that runs lights, fans, Wi-Fi routers and phone charging for hours during village load shedding. Recharges in 60 minutes.',
    priceBDT: 28500,
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['300W AC Output', '60-Minute Fast Charging', '5-Year LFP Battery Life'],
    recommendedFor: ['Village Homes with Load Shedding', 'Small Shops & Tea Stalls', 'Mobile & Light Backup'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'ecoflow-delta-2',
    brand: 'EcoFlow',
    name: 'EcoFlow Delta 2 Portable Power Station (1024Wh)',
    category: 'Solar & Power Backup',
    tagline: 'Instant Silent Power Backup for Rural Homes, Shops & Biker Camps',
    description: 'Charges from 0-80% in 50 minutes. Powers fans, lights, refrigerators, laptops, and power tools during village load shedding.',
    priceBDT: 115000,
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['1800W AC Output (2700W Surge)', 'LFP Battery with 3000+ Cycles', 'Solar Panel Recharge Compatible'],
    recommendedFor: ['Rural / Remote Village Customers', 'Frequent Load Shedding Areas', 'Outdoor Biker Camping'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'goodwe-solar-inverter',
    brand: 'GoodWe',
    name: 'GoodWe Hybrid Solar Inverter (5kW)',
    category: 'Solar & Power Backup',
    tagline: 'Smart Hybrid Solar Inverter with Grid & Battery Synchronization',
    description: 'High-efficiency solar inverter marketed by ACI Motors for agricultural farms, factories, and residential rural homes across Bangladesh.',
    priceBDT: 85000,
    image: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['98.2% Maximum Conversion Efficiency', 'UPS Level <10ms Power Switching', 'IP65 Waterproof Design'],
    recommendedFor: ['Off-Grid Village Farms', 'Rural Showrooms & Service Centers'],
    representativeEmail: DEFAULT_REP_EMAIL
  },
  {
    id: 'aiko-solar-panel',
    brand: 'Aiko Solar',
    name: 'Aiko N-Type ABC Solar Panel (620W)',
    category: 'Solar & Power Backup',
    tagline: "World's Highest Efficiency (24.2%) All-Back-Contact Solar Panel",
    description: 'Premium N-type ABC solar module distributed by ACI Motors. Pairs with GoodWe inverters and EcoFlow stations for complete off-grid village solar systems.',
    priceBDT: 22000,
    image: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80',
    keyBenefits: ['24.2% Panel Efficiency', 'Excellent Low-Light & Cloudy Day Output', '30-Year Linear Power Warranty'],
    recommendedFor: ['Rural Rooftop Solar Systems', 'Irrigation Pump Power', 'Pairing with GoodWe / EcoFlow'],
    representativeEmail: DEFAULT_REP_EMAIL
  }
];

// ===========================================================================
// SERVICE DIAGNOSTICS KNOWLEDGE BASE (32 problems)
// ===========================================================================

export const SERVICE_DIAGNOSTICS_KB: DiagnosticIssue[] = [
  {
    id: 'diag-low-mileage',
    problemKey: 'low_mileage',
    titleEn: 'Low Mileage & Fuel Inefficiency',
    titleBn: 'কম মাইলেজ ও জ্বালানি অপচয়',
    symptoms: ['Getting lower km/l than standard', 'Jerking at low RPM', 'Engine hesitates during acceleration'],
    rootCause: 'Dirty FI injector nozzle, carbon deposits on piston head, degraded engine oil, clogged air filter or low tire pressure.',
    urgency: 'Medium',
    recommendedProducts: ['yamalube-carbon-cleaner', 'liqui-moly-octane-booster', 'yamalube-semi-synth'],
    recommendedActionEn: 'Treat fuel tank with Yamalube Carbon Cleaner + Liqui Moly Octane Booster, change engine oil, clean air filter and check tire pressure (front 29 / rear 33 PSI).',
    recommendedActionBn: 'ইয়ামালুব কার্বন ক্লিনার ও লিকুই মলি অকটেন বুস্টার ব্যবহার করুন, ইঞ্জিন অয়েল চেঞ্জ করুন, এয়ার ফিল্টার পরিষ্কার করুন এবং টায়ার প্রেসার চেক করুন।',
    requiresTechnician: false
  },
  {
    id: 'diag-slippery-tires',
    problemKey: 'slippery_tires',
    titleEn: 'Slippery Handling & Tire Skidding',
    titleBn: 'বাইক স্কিড করা বা পিচ্ছিল অনুভূত হওয়া',
    symptoms: ['Back wheel slips when braking on wet roads', 'Sliding on painted road markings', 'Worn out tire treads'],
    rootCause: 'Old hardened tire rubber, worn treads below 1mm depth, or incorrect tire pressure.',
    urgency: 'Critical',
    recommendedProducts: ['ceat-zoom-rad-x1', 'ceat-secura-zoom'],
    recommendedActionEn: 'Replace with CEAT Zoom Rad X1 (rear) + Secura Zoom F (front) for full wet-road grip, then do wheel alignment.',
    recommendedActionBn: 'ভেজা রাস্তায় নিরাপদ গ্রিপ পেতে সিএট জুম র‍্যাড এক্স১ (পেছনে) ও সেকুরা জুম এফ (সামনে) টায়ার লাগান এবং হুইল অ্যালাইনমেন্ট করান।',
    requiresTechnician: true
  },
  {
    id: 'diag-engine-vibration',
    problemKey: 'engine_vibration',
    titleEn: 'Engine Harshness, Rattling & High Vibration',
    titleBn: 'ইঞ্জিনে অতিরিক্ত ভাইব্রেশন ও কড়া শব্দ',
    symptoms: ['Vibration on handlebars and footpegs', 'Rattling noise at 6000+ RPM', 'High engine heat'],
    rootCause: 'Degraded engine oil viscosity, metal sludge in crankcase, or loose valve tappet clearance.',
    urgency: 'High',
    recommendedProducts: ['liqui-moly-engine-flush', 'yamalube-synthetic-gp'],
    recommendedActionEn: 'Perform Liqui Moly Engine Flush, refill Yamalube RS4GP Fully Synthetic 10W-40, and have tappet clearance checked at a service center.',
    recommendedActionBn: 'লিকুই মলি ইঞ্জিন ফ্লাশ করে ইয়ামালুব RS4GP ফুলি সিন্থেটিক অয়েল দিন এবং সার্ভিস সেন্টারে ট্যাপেট ক্লিয়ারেন্স চেক করান।',
    requiresTechnician: true
  },
  {
    id: 'diag-engine-knocking',
    problemKey: 'engine_knocking',
    titleEn: 'Engine Knocking / Pinging on Acceleration',
    titleBn: 'এক্সিলারেশনে ইঞ্জিন নকিং বা পিংপিং শব্দ',
    symptoms: ['Metallic pinging sound under load', 'Knocking when climbing bridges/flyovers', 'Power loss with knock sound'],
    rootCause: 'Low octane or adulterated fuel causing pre-ignition inside the high-compression combustion chamber.',
    urgency: 'High',
    recommendedProducts: ['liqui-moly-octane-booster', 'yamalube-carbon-cleaner'],
    recommendedActionEn: 'Add Liqui Moly Octane Booster with every refuel from unreliable pumps, and run a Yamalube Carbon Cleaner treatment to remove hot-spot carbon.',
    recommendedActionBn: 'প্রতিবার সন্দেহজনক পাম্পের তেলে লিকুই মলি অকটেন বুস্টার মেশান এবং কার্বন হটস্পট দূর করতে ইয়ামালুব কার্বন ক্লিনার ট্রিটমেন্ট করুন।',
    requiresTechnician: false
  },
  {
    id: 'diag-chain-noise',
    problemKey: 'chain_noise',
    titleEn: 'Chain Squeaking, Rust & Tak-Tak Noise',
    titleBn: 'চেইনে ক্যাচক্যাচ শব্দ, মরিচা বা টক-টক আওয়াজ',
    symptoms: ['Squeaking sound while riding', 'Visible rust on chain', 'Chain slack / tak-tak noise on throttle on-off'],
    rootCause: 'Dry or rusted chain links, caked mud, or improper chain slack (should be 25-35mm).',
    urgency: 'Medium',
    recommendedProducts: ['liqui-moly-chain-cleaner', 'liqui-moly-chain-lube'],
    recommendedActionEn: 'Clean with Liqui Moly Chain Cleaner, re-lube with Chain Lube Spray every 500 km, and adjust chain slack to 25-35mm.',
    recommendedActionBn: 'লিকুই মলি চেইন ক্লিনার দিয়ে পরিষ্কার করে প্রতি ৫০০ কিমিতে চেইন লুব স্প্রে করুন এবং চেইন স্ল্যাক ২৫-৩৫ মিমিতে এডজাস্ট করুন।',
    requiresTechnician: false
  },
  {
    id: 'diag-hard-gear-shift',
    problemKey: 'hard_gear',
    titleEn: 'Stiff Gear Shifting & Neutral Difficulty',
    titleBn: 'গিয়ার শক্ত হওয়া বা নিউট্রাল করতে সমস্যা',
    symptoms: ['Hard clunk when shifting gears', 'Difficulty finding Neutral at traffic stops', 'False neutrals'],
    rootCause: 'Improper clutch cable free-play, degraded engine oil, or stretched clutch cable.',
    urgency: 'Medium',
    recommendedProducts: ['yamalube-semi-synth', 'liqui-moly-engine-flush'],
    recommendedActionEn: 'Adjust clutch cable free play (10-15mm), flush the engine and refill fresh Yamalube 10W-40.',
    recommendedActionBn: 'ক্লাচ ক্যাবল ফ্রি-প্লে (১০-১৫ মিমি) এডজাস্ট করুন, ইঞ্জিন ফ্লাশ করে নতুন ইয়ামালুব অয়েল দিন।',
    requiresTechnician: false
  },
  {
    id: 'diag-clutch-slip',
    problemKey: 'clutch_slip',
    titleEn: 'Clutch Slipping & RPM Rise Without Speed',
    titleBn: 'ক্লাচ স্লিপ করা - RPM বাড়লেও স্পিড না বাড়া',
    symptoms: ['RPM rises but bike does not accelerate', 'Burning smell from engine', 'Weak hill climbing'],
    rootCause: 'Worn clutch plates, wrong (car-grade) engine oil causing friction loss, or zero clutch free-play.',
    urgency: 'High',
    recommendedProducts: ['yamalube-synthetic-gp'],
    recommendedActionEn: 'Never use car engine oil! Use JASO MA2 Yamalube oil. If slipping continues, clutch plates need replacement at a service center.',
    recommendedActionBn: 'কখনো গাড়ির ইঞ্জিন অয়েল ব্যবহার করবেন না! JASO MA2 ইয়ামালুব দিন। স্লিপ চলতে থাকলে সার্ভিস সেন্টারে ক্লাচ প্লেট বদলাতে হবে।',
    requiresTechnician: true
  },
  {
    id: 'diag-overheating',
    problemKey: 'overheating',
    titleEn: 'Engine Overheating in Traffic',
    titleBn: 'জ্যামে ইঞ্জিন অতিরিক্ত গরম হয়ে যাওয়া',
    symptoms: ['Temperature warning light on', 'Radiator fan constantly running', 'Power drop in traffic jams'],
    rootCause: 'Low or old coolant, scale-blocked radiator core, or degraded engine oil failing to carry heat.',
    urgency: 'High',
    recommendedProducts: ['liqui-moly-radiator-cleaner', 'yamalube-coolant', 'yamalube-synthetic-gp'],
    recommendedActionEn: 'Flush the radiator with Liqui Moly Radiator Cleaner, refill Yamalube Long-Life Coolant, and use fully synthetic oil for better heat transfer.',
    recommendedActionBn: 'লিকুই মলি রেডিয়েটর ক্লিনার দিয়ে ফ্লাশ করে ইয়ামালুব কুল্যান্ট রিফিল করুন এবং ফুলি সিন্থেটিক অয়েল ব্যবহার করুন।',
    requiresTechnician: true
  },
  {
    id: 'diag-cold-start',
    problemKey: 'cold_start',
    titleEn: 'Hard Starting on Cold Mornings',
    titleBn: 'শীতের সকালে বাইক স্টার্ট নিতে দেরি হওয়া',
    symptoms: ['Needs many cranks to start in the morning', 'Starts then immediately stalls', 'Rough idle until warm'],
    rootCause: 'Weak battery, dirty throttle body / injector, stale fuel, or thick degraded oil.',
    urgency: 'Medium',
    recommendedProducts: ['yamalube-carbon-cleaner', 'liqui-moly-fuel-stabilizer'],
    recommendedActionEn: 'Run a Carbon Cleaner fuel treatment, add Speed Additive if the bike sits parked, and get battery voltage tested (should be 12.4V+).',
    recommendedActionBn: 'কার্বন ক্লিনার ট্রিটমেন্ট করুন, বাইক বেশি বসিয়ে রাখলে স্পিড এডিটিভ দিন এবং ব্যাটারি ভোল্টেজ (১২.৪V+) চেক করান।',
    requiresTechnician: false
  },
  {
    id: 'diag-self-start-fail',
    problemKey: 'self_start_fail',
    titleEn: 'Self-Start Button Not Working',
    titleBn: 'সেলফ স্টার্ট বাটন কাজ না করা',
    symptoms: ['Clicking sound but engine does not crank', 'No response from starter button', 'Dim headlight while cranking'],
    rootCause: 'Discharged/dead battery, corroded terminals, faulty starter relay, or kill-switch left ON.',
    urgency: 'Medium',
    recommendedProducts: ['yamalube-grease'],
    recommendedActionEn: 'Check kill switch first! Then clean battery terminals, apply Yamalube grease, and get the battery load-tested; replace if below 12V.',
    recommendedActionBn: 'আগে কিল সুইচ চেক করুন! এরপর ব্যাটারি টার্মিনাল পরিষ্কার করে গ্রিজ দিন এবং ব্যাটারি লোড টেস্ট করান; ১২V এর নিচে হলে বদলান।',
    requiresTechnician: true
  },
  {
    id: 'diag-battery-drain',
    problemKey: 'battery_drain',
    titleEn: 'Battery Draining Quickly',
    titleBn: 'ব্যাটারি দ্রুত ডিসচার্জ হয়ে যাওয়া',
    symptoms: ['Battery dies after 2-3 days parked', 'Weak horn and dim lights', 'Y-Connect shows low voltage'],
    rootCause: 'Aging battery cells, current leakage from aftermarket accessories (LED/alarm), or faulty regulator-rectifier.',
    urgency: 'Medium',
    recommendedProducts: ['yamalube-grease'],
    recommendedActionEn: 'Remove non-official accessories, clean and grease terminals, and have charging output tested (13.5-14.5V at 5000 RPM).',
    recommendedActionBn: 'অননুমোদিত এক্সেসরিজ খুলে ফেলুন, টার্মিনাল পরিষ্কার করুন এবং চার্জিং আউটপুট (৫০০০ RPM এ ১৩.৫-১৪.৫V) টেস্ট করান।',
    requiresTechnician: true
  },
  {
    id: 'diag-brake-squeal',
    problemKey: 'brake_squeal',
    titleEn: 'Brake Squealing & Weak Braking',
    titleBn: 'ব্রেকে কিচকিচ শব্দ ও ব্রেক দুর্বল হওয়া',
    symptoms: ['High-pitch squeal when braking', 'Longer stopping distance', 'Vibration in brake lever'],
    rootCause: 'Worn brake pads, glazed disc surface, dust in caliper, or moisture-contaminated brake fluid.',
    urgency: 'Critical',
    recommendedProducts: ['yamalube-brake-fluid'],
    recommendedActionEn: 'Replace worn pads immediately, deglaze/clean the disc, and bleed fresh Yamalube DOT 4 brake fluid.',
    recommendedActionBn: 'ক্ষয়ে যাওয়া ব্রেক প্যাড দ্রুত বদলান, ডিস্ক পরিষ্কার করুন এবং নতুন ইয়ামালুব DOT 4 ব্রেক ফ্লুইড দিন।',
    requiresTechnician: true
  },
  {
    id: 'diag-spongy-brake',
    problemKey: 'spongy_brake',
    titleEn: 'Spongy / Soft Brake Lever',
    titleBn: 'ব্রেক লিভার নরম বা স্পঞ্জি লাগা',
    symptoms: ['Brake lever travels too far', 'Soft mushy feel', 'Brake bites only at end of lever pull'],
    rootCause: 'Air bubbles or old moisture-saturated fluid in the hydraulic ABS line.',
    urgency: 'Critical',
    recommendedProducts: ['yamalube-brake-fluid'],
    recommendedActionEn: 'Bleed the brake line and refill Yamalube DOT 4. Brake fluid must be replaced every 2 years for ABS safety.',
    recommendedActionBn: 'ব্রেক লাইন ব্লিড করে ইয়ামালুব DOT 4 রিফিল করুন। ABS নিরাপত্তার জন্য প্রতি ২ বছরে ব্রেক ফ্লুইড বদলানো বাধ্যতামূলক।',
    requiresTechnician: true
  },
  {
    id: 'diag-white-smoke',
    problemKey: 'white_smoke',
    titleEn: 'White / Blue Smoke from Exhaust',
    titleBn: 'সাইলেন্সার দিয়ে সাদা বা নীল ধোঁয়া বের হওয়া',
    symptoms: ['Blue-white smoke on acceleration', 'Oil level drops between services', 'Fouled spark plug'],
    rootCause: 'Engine oil burning in the combustion chamber — worn piston rings, valve seals, or overfilled oil.',
    urgency: 'Critical',
    recommendedProducts: ['yamalube-synthetic-gp', 'liqui-moly-engine-flush'],
    recommendedActionEn: 'Do not ignore! Check oil level is not overfilled, then visit a service center for compression testing — rings/seals may need replacement.',
    recommendedActionBn: 'অবহেলা করবেন না! অয়েল লেভেল বেশি কিনা দেখুন, তারপর কমপ্রেশন টেস্টের জন্য সার্ভিস সেন্টারে যান — রিং/সিল বদলাতে হতে পারে।',
    requiresTechnician: true
  },
  {
    id: 'diag-black-smoke',
    problemKey: 'black_smoke',
    titleEn: 'Black Smoke & Fuel Smell from Exhaust',
    titleBn: 'কালো ধোঁয়া ও কাঁচা তেলের গন্ধ',
    symptoms: ['Black sooty smoke', 'Strong raw fuel smell', 'Mileage drops sharply', 'Black spark plug tip'],
    rootCause: 'Over-rich fuel mixture — clogged air filter, faulty O2 sensor, or leaking injector.',
    urgency: 'High',
    recommendedProducts: ['yamalube-carbon-cleaner'],
    recommendedActionEn: 'Replace/clean the air filter, run Carbon Cleaner FI treatment, and get an FI diagnostic scan at an ACI service center.',
    recommendedActionBn: 'এয়ার ফিল্টার পরিষ্কার/পরিবর্তন করুন, কার্বন ক্লিনার ট্রিটমেন্ট করুন এবং এসিআই সার্ভিস সেন্টারে FI ডায়াগনস্টিক স্ক্যান করান।',
    requiresTechnician: true
  },
  {
    id: 'diag-idle-stalling',
    problemKey: 'idle_stalling',
    titleEn: 'Engine Stalls at Idle / Traffic Signals',
    titleBn: 'সিগন্যালে দাঁড়ালে ইঞ্জিন বন্ধ হয়ে যাওয়া',
    symptoms: ['RPM drops and engine dies at idle', 'Unstable idle RPM needle', 'Needs throttle to keep alive'],
    rootCause: 'Dirty throttle body, clogged idle air passage, carbon on injector, or bad fuel.',
    urgency: 'Medium',
    recommendedProducts: ['yamalube-carbon-cleaner', 'liqui-moly-fuel-stabilizer'],
    recommendedActionEn: 'Run Carbon Cleaner treatment for 2 consecutive tank fills and have the throttle body professionally cleaned.',
    recommendedActionBn: 'পরপর ২ ট্যাংক ফুয়েলে কার্বন ক্লিনার দিন এবং থ্রটল বডি প্রফেশনালি পরিষ্কার করান।',
    requiresTechnician: false
  },
  {
    id: 'diag-poor-pickup',
    problemKey: 'poor_pickup',
    titleEn: 'Sluggish Pickup & Throttle Lag',
    titleBn: 'পিকআপ কমে যাওয়া ও থ্রটল লেগ',
    symptoms: ['Delayed response when twisting throttle', 'Feels heavy on acceleration', 'Top speed reduced'],
    rootCause: 'Carbon build-up, clogged air filter, old spark plug, chain over-tension or dragging brakes.',
    urgency: 'Medium',
    recommendedProducts: ['liqui-moly-fuel-stabilizer', 'yamalube-carbon-cleaner', 'liqui-moly-chain-lube'],
    recommendedActionEn: 'Use Speed Additive + Carbon Cleaner, replace spark plug if over 8,000 km, clean & lube the chain, and check brake drag.',
    recommendedActionBn: 'স্পিড এডিটিভ ও কার্বন ক্লিনার দিন, ৮,০০০ কিমির বেশি হলে স্পার্ক প্লাগ বদলান, চেইন পরিষ্কার করুন এবং ব্রেক ড্র্যাগ চেক করুন।',
    requiresTechnician: false
  },
  {
    id: 'diag-exhaust-backfire',
    problemKey: 'exhaust_backfire',
    titleEn: 'Exhaust Popping / Backfiring',
    titleBn: 'সাইলেন্সারে ফটফট শব্দ বা ব্যাকফায়ার',
    symptoms: ['Pop-pop sound on deceleration', 'Small bangs from silencer', 'Flame from exhaust (rare)'],
    rootCause: 'Unburnt fuel igniting in exhaust — lean mixture, exhaust leak, or aftermarket silencer without tuning.',
    urgency: 'Medium',
    recommendedProducts: ['yamalube-carbon-cleaner', 'liqui-moly-octane-booster'],
    recommendedActionEn: 'Revert to stock exhaust if modified, run Carbon Cleaner, use Octane Booster with quality fuel, and check exhaust gasket for leaks.',
    recommendedActionBn: 'মডিফাইড সাইলেন্সার থাকলে স্টকে ফিরে যান, কার্বন ক্লিনার দিন, ভালো তেলের সাথে অকটেন বুস্টার ব্যবহার করুন এবং এগজস্ট গ্যাসকেট লিক চেক করুন।',
    requiresTechnician: true
  },
  {
    id: 'diag-speed-wobble',
    problemKey: 'speed_wobble',
    titleEn: 'Handlebar Wobble / Instability at Speed',
    titleBn: 'বেশি স্পিডে হ্যান্ডেল কাঁপা বা ব্যালেন্স সমস্যা',
    symptoms: ['Handlebar shakes at 60+ km/h', 'Bike pulls to one side', 'Uneven tire wear'],
    rootCause: 'Bent rim, unbalanced wheels, worn steering cone bearings, or uneven/worn tires.',
    urgency: 'Critical',
    recommendedProducts: ['ceat-secura-zoom', 'ceat-zoom-rad-x1'],
    recommendedActionEn: 'Safety issue — stop riding fast! Get wheel balancing, steering bearing check, and replace unevenly worn tires with CEAT radials.',
    recommendedActionBn: 'নিরাপত্তা ঝুঁকি — দ্রুত রাইড বন্ধ করুন! হুইল ব্যালেন্সিং ও স্টিয়ারিং বিয়ারিং চেক করান এবং ক্ষয়ে যাওয়া টায়ার সিএট রাডিয়াল দিয়ে বদলান।',
    requiresTechnician: true
  },
  {
    id: 'diag-frequent-puncture',
    problemKey: 'frequent_puncture',
    titleEn: 'Frequent Punctures & Air Pressure Loss',
    titleBn: 'ঘনঘন পাংচার ও হাওয়া কমে যাওয়া',
    symptoms: ['Tire loses air every few days', 'Multiple punctures per month', 'Sidewall cracks visible'],
    rootCause: 'Aged cracked tires, worn tread picking up nails easily, or damaged tube/valve.',
    urgency: 'High',
    recommendedProducts: ['ceat-milaze', 'ceat-secura-zoom'],
    recommendedActionEn: 'Switch to puncture-resistant CEAT Milaze / Secura Zoom with fresh tubes; tires older than 4 years should be replaced regardless of tread.',
    recommendedActionBn: 'পাংচার-প্রতিরোধী সিএট মাইলেজ / সেকুরা জুম টায়ার ও নতুন টিউব লাগান; ৪ বছরের পুরনো টায়ার ট্রেড থাকলেও বদলানো উচিত।',
    requiresTechnician: true
  },
  {
    id: 'diag-oil-leak',
    problemKey: 'oil_leak',
    titleEn: 'Engine Oil Leakage / Seepage',
    titleBn: 'ইঞ্জিন থেকে অয়েল লিক বা চুইয়ে পড়া',
    symptoms: ['Oil drops under parked bike', 'Oil film on engine casing', 'Oil level dropping fast'],
    rootCause: 'Worn gaskets/oil seals, loose drain bolt, overfilled crankcase, or clogged crankcase breather.',
    urgency: 'High',
    recommendedProducts: ['yamalube-semi-synth'],
    recommendedActionEn: 'Locate the leak point (drain bolt, clutch cover, gear shaft seal) at a service center; never ride with oil below the LOW mark.',
    recommendedActionBn: 'সার্ভিস সেন্টারে লিক পয়েন্ট (ড্রেন বোল্ট, ক্লাচ কভার, গিয়ার শ্যাফট সিল) শনাক্ত করান; অয়েল LOW মার্কের নিচে নিয়ে রাইড করবেন না।',
    requiresTechnician: true
  },
  {
    id: 'diag-rusty-parts',
    problemKey: 'rusty_parts',
    titleEn: 'Rust on Chain, Bolts & Silencer',
    titleBn: 'চেইন, বোল্ট ও সাইলেন্সারে মরিচা ধরা',
    symptoms: ['Orange rust spots after monsoon', 'Rusted silencer shield', 'Stiff rusted bolts'],
    rootCause: 'Monsoon moisture, salt-laden coastal air, and washing without drying/lubrication.',
    urgency: 'Low',
    recommendedProducts: ['liqui-moly-chain-cleaner', 'liqui-moly-chain-lube', 'yamalube-grease'],
    recommendedActionEn: 'Deep clean with Chain Cleaner, protect with Chain Lube and grease all pivots; always dry the bike after rain and washing.',
    recommendedActionBn: 'চেইন ক্লিনার দিয়ে পরিষ্কার করে চেইন লুব ও গ্রিজ দিন; বৃষ্টি বা ওয়াশের পর বাইক শুকিয়ে নিন।',
    requiresTechnician: false
  },
  {
    id: 'diag-headlight-dim',
    problemKey: 'headlight_dim',
    titleEn: 'Dim Headlight & Weak Electricals',
    titleBn: 'হেডলাইটের আলো কমে যাওয়া ও দুর্বল ইলেকট্রিক্যাল',
    symptoms: ['Headlight dims at idle', 'Horn sounds weak', 'Indicators blink slowly'],
    rootCause: 'Weak battery, corroded ground connections, or failing regulator-rectifier.',
    urgency: 'Medium',
    recommendedProducts: ['yamalube-grease'],
    recommendedActionEn: 'Clean and grease all ground/earth points and battery terminals; test charging voltage — replace regulator if below 13V at revs.',
    recommendedActionBn: 'সব আর্থ পয়েন্ট ও ব্যাটারি টার্মিনাল পরিষ্কার করে গ্রিজ দিন; চার্জিং ভোল্টেজ টেস্ট করান — রেভে ১৩V এর কম হলে রেগুলেটর বদলান।',
    requiresTechnician: true
  },
  {
    id: 'diag-abs-warning',
    problemKey: 'abs_warning',
    titleEn: 'ABS Warning Light Stays On',
    titleBn: 'ABS ওয়ার্নিং লাইট জ্বলে থাকা',
    symptoms: ['ABS lamp does not turn off above 10 km/h', 'ABS not engaging on hard braking'],
    rootCause: 'Dirty wheel speed sensor ring, damaged sensor wiring, or low brake fluid level.',
    urgency: 'Critical',
    recommendedProducts: ['yamalube-brake-fluid'],
    recommendedActionEn: 'Clean the front wheel sensor ring of mud, top up DOT 4 fluid, and get an ABS diagnostic scan — do not ignore, braking safety depends on it.',
    recommendedActionBn: 'সামনের চাকার সেন্সর রিং থেকে কাদা পরিষ্কার করুন, DOT 4 ফ্লুইড টপ-আপ করুন এবং ABS ডায়াগনস্টিক স্ক্যান করান — অবহেলা করবেন না।',
    requiresTechnician: true
  },
  {
    id: 'diag-fi-warning',
    problemKey: 'fi_warning',
    titleEn: 'FI / Check Engine Warning Light',
    titleBn: 'FI বা চেক ইঞ্জিন ওয়ার্নিং লাইট',
    symptoms: ['Orange FI lamp stays on', 'Engine in limp/safe mode', 'Error code on cluster'],
    rootCause: 'Sensor fault (O2, TPS, crank position), loose sensor connector, or water ingress in wiring.',
    urgency: 'High',
    recommendedProducts: ['yamalube-carbon-cleaner'],
    recommendedActionEn: 'Bring the bike for an official FI diagnostic scan at an ACI Motors 3S center — error codes pinpoint the exact faulty sensor.',
    recommendedActionBn: 'এসিআই মটরস ৩এস সেন্টারে অফিসিয়াল FI ডায়াগনস্টিক স্ক্যান করান — এরর কোড থেকে সঠিক ত্রুটিপূর্ণ সেন্সর ধরা পড়বে।',
    requiresTechnician: true
  },
  {
    id: 'diag-fuel-smell',
    problemKey: 'fuel_smell',
    titleEn: 'Raw Fuel Smell / Petrol Leakage',
    titleBn: 'কাঁচা পেট্রোলের গন্ধ বা তেল লিক',
    symptoms: ['Petrol smell when parked', 'Wet patches near tank or injector', 'Fuel dripping'],
    rootCause: 'Cracked fuel hose, loose injector coupling, or faulty tank cap breather.',
    urgency: 'Critical',
    recommendedProducts: [],
    recommendedActionEn: 'FIRE HAZARD — stop riding, keep away from flames, and have the fuel line inspected immediately at the nearest service center.',
    recommendedActionBn: 'অগ্নি ঝুঁকি — রাইড বন্ধ করুন, আগুন থেকে দূরে রাখুন এবং দ্রুত নিকটস্থ সার্ভিস সেন্টারে ফুয়েল লাইন পরীক্ষা করান।',
    requiresTechnician: true
  },
  {
    id: 'diag-rain-stall',
    problemKey: 'rain_stall',
    titleEn: 'Bike Stalls / Misfires in Rain',
    titleBn: 'বৃষ্টিতে বাইক বন্ধ হয়ে যাওয়া বা মিসফায়ার',
    symptoms: ['Engine misfires on waterlogged roads', 'Stalls after heavy rain wash', 'Weak spark in wet weather'],
    rootCause: 'Water entering spark plug cap, corroded HT coil connection, or wet air filter.',
    urgency: 'Medium',
    recommendedProducts: ['yamalube-grease'],
    recommendedActionEn: 'Dry and re-seat the spark plug cap with dielectric grease, avoid pressure-washing the plug area, and check the air filter box drain.',
    recommendedActionBn: 'স্পার্ক প্লাগ ক্যাপ শুকিয়ে গ্রিজ দিয়ে লাগান, প্লাগ এলাকায় প্রেশার ওয়াশ করবেন না এবং এয়ার ফিল্টার বক্সের ড্রেন চেক করুন।',
    requiresTechnician: false
  },
  {
    id: 'diag-suspension-hard',
    problemKey: 'suspension_issue',
    titleEn: 'Harsh / Bouncy Suspension & Fork Oil Leak',
    titleBn: 'সাসপেনশন শক্ত লাগা বা ফর্ক অয়েল লিক',
    symptoms: ['Every pothole feels harsh', 'Oil streaks on front fork tubes', 'Bike bounces after speed breakers'],
    rootCause: 'Leaking fork oil seals, degraded fork oil, or worn rear shock absorber.',
    urgency: 'Medium',
    recommendedProducts: ['yamalube-grease'],
    recommendedActionEn: 'Replace fork oil seals and refill correct grade fork oil at a service center; grease linkages during reassembly.',
    recommendedActionBn: 'সার্ভিস সেন্টারে ফর্ক অয়েল সিল বদলে সঠিক গ্রেডের ফর্ক অয়েল দিন; লিংকেজে গ্রিজ দিন।',
    requiresTechnician: true
  },
  {
    id: 'diag-scooter-cvt',
    problemKey: 'scooter_cvt',
    titleEn: 'Scooter Jerking / CVT Belt Noise (RayZR)',
    titleBn: 'স্কুটার ঝাঁকি দেওয়া বা CVT বেল্টের শব্দ',
    symptoms: ['Jerk when accelerating from stop', 'Screeching belt noise', 'Vibration at constant speed'],
    rootCause: 'Worn CVT belt or roller weights, or dust inside the CVT case.',
    urgency: 'Medium',
    recommendedProducts: ['yamalube-scooter-oil'],
    recommendedActionEn: 'Have the CVT case opened and cleaned, replace belt/rollers if worn (every ~20,000 km), and use dedicated Yamalube Scooter oil.',
    recommendedActionBn: 'CVT কেস খুলে পরিষ্কার করান, বেল্ট/রোলার ক্ষয় হলে বদলান (প্রতি ~২০,০০০ কিমি) এবং ইয়ামালুব স্কুটার অয়েল ব্যবহার করুন।',
    requiresTechnician: true
  },
  {
    id: 'diag-high-consumption-traffic',
    problemKey: 'traffic_consumption',
    titleEn: 'High Fuel Use in City Traffic',
    titleBn: 'শহরের জ্যামে অতিরিক্ত তেল খরচ',
    symptoms: ['Mileage fine on highway but terrible in city', 'Frequent refueling for short commutes'],
    rootCause: 'Long idling in jams, clutch riding habit, low tire pressure, and stop-go carbon build-up.',
    urgency: 'Low',
    recommendedProducts: ['yamalube-carbon-cleaner', 'ceat-milaze'],
    recommendedActionEn: 'Switch off engine at signals over 60 seconds, keep tire pressure correct, and run a Carbon Cleaner treatment monthly.',
    recommendedActionBn: '৬০ সেকেন্ডের বেশি সিগন্যালে ইঞ্জিন বন্ধ রাখুন, টায়ার প্রেসার ঠিক রাখুন এবং মাসে একবার কার্বন ক্লিনার দিন।',
    requiresTechnician: false
  },
  {
    id: 'diag-parked-long',
    problemKey: 'parked_long',
    titleEn: 'Bike Kept Parked for Weeks / Months',
    titleBn: 'সপ্তাহ বা মাসব্যাপী বাইক বসিয়ে রাখা',
    symptoms: ['Returning abroad / seasonal use', 'Hard start after long parking', 'Stale fuel smell'],
    rootCause: 'Fuel degradation, battery self-discharge, flat-spotted tires, and dry chain.',
    urgency: 'Low',
    recommendedProducts: ['liqui-moly-fuel-stabilizer', 'liqui-moly-chain-lube'],
    recommendedActionEn: 'Add Speed Additive to a full tank before parking, disconnect the battery negative, lube the chain, and park on the center stand.',
    recommendedActionBn: 'পার্ক করার আগে ফুল ট্যাংকে স্পিড এডিটিভ দিন, ব্যাটারির নেগেটিভ খুলে রাখুন, চেইনে লুব দিন এবং সেন্টার স্ট্যান্ডে রাখুন।',
    requiresTechnician: false
  },
  {
    id: 'diag-rural-power',
    problemKey: 'rural_power',
    titleEn: 'Rural Load Shedding & Off-Grid Power Needs',
    titleBn: 'গ্রামাঞ্চলে লোডশেডিং ও অফ-গ্রিড বিদ্যুৎ সমাধান',
    symptoms: ['Frequent power cuts in village home/shop', 'Unstable voltage damaging appliances', 'No grid power for irrigation'],
    rootCause: 'Weak rural grid coverage and voltage fluctuation in remote upazilas.',
    urgency: 'Low',
    recommendedProducts: ['ecoflow-river-2', 'ecoflow-delta-2', 'goodwe-solar-inverter', 'aiko-solar-panel'],
    recommendedActionEn: 'ACI Motors rural energy package: EcoFlow station for instant backup, or Aiko 620W panels + GoodWe hybrid inverter for a permanent rooftop solar system.',
    recommendedActionBn: 'এসিআই মটরস রুরাল এনার্জি প্যাকেজ: তাৎক্ষণিক ব্যাকআপে ইকোফ্লো স্টেশন, অথবা স্থায়ী সমাধানে আইকো ৬২০W প্যানেল + গুডউই হাইব্রিড ইনভার্টার।',
    requiresTechnician: true
  },
  {
    id: 'diag-mileage-service-due',
    problemKey: 'service_due',
    titleEn: 'Bike Crossed 3,000+ KM Without Service',
    titleBn: '৩,০০০+ কিমি চলার পরও সার্ভিস না করানো',
    symptoms: ['Odometer crossed service interval', 'Gradual performance drop', 'Unsure of last oil change'],
    rootCause: 'Engine oil degrades every 2,500-3,000 km (mineral/semi) — overdue oil accelerates engine wear.',
    urgency: 'Medium',
    recommendedProducts: ['yamalube-semi-synth', 'liqui-moly-engine-flush', 'liqui-moly-chain-lube'],
    recommendedActionEn: 'Book a periodic service: engine flush + fresh Yamalube oil + chain care + air filter cleaning. Every 3,000 km for semi-synthetic, 5,000 km for full synthetic.',
    recommendedActionBn: 'পিরিয়ডিক সার্ভিস বুক করুন: ইঞ্জিন ফ্লাশ + নতুন ইয়ামালুব অয়েল + চেইন কেয়ার + এয়ার ফিল্টার পরিষ্কার। সেমি-সিন্থেটিকে প্রতি ৩,০০০ কিমি, ফুল সিন্থেটিকে ৫,০০০ কিমি।',
    requiresTechnician: true
  }
];

import { levenshtein } from './locationData';

/** Match free text against the diagnostics KB (used by chat fallback + service assistant). */
// Generic bike-domain words that appear across most/all KB entries — excluding them
// prevents them from drowning out the actually distinguishing symptom words (e.g. a
// query mentioning "bike" + "wet" + "roads" would otherwise tie-break on those alone
// instead of the specific complaint like "skid").
const DIAGNOSTIC_STOPWORDS = new Set([
  'bike', 'motorcycle', 'motorbike', 'engine', 'motor', 'road', 'roads', 'wet', 'water',
  'high', 'low', 'after', 'before', 'during', 'when', 'while', 'with', 'from', 'your',
  'have', 'has', 'the', 'and', 'service', 'servicing', 'want', 'need', 'please', 'korte'
]);

// Crude suffix stripping so "skids"/"skidding" both resolve to a comparable "skid" root.
const stem = (w: string) => w.replace(/(ing|edly|ed|es|s)$/, '');

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Whole-word substring check — NOT a naive .includes(). A naive substring check lets a short
// common word accidentally match inside an unrelated longer word: "chai" (Bengali for "want",
// extremely common in Banglish phrasing like "...korte chai") is a literal substring of the
// English word "chain", which was silently scoring every "...chai" message as a Chain-Noise
// title match. Bounding both sides on non-alphanumeric characters (so it also works correctly
// against the Bengali-script text mixed into the same haystack) closes that off.
const hasWord = (hay: string, word: string): boolean =>
  new RegExp(`(^|[^a-z0-9])${escapeRegex(word)}([^a-z0-9]|$)`, 'i').test(hay);

// Typo tolerance for title-level matches only (e.g. "millage" -> "mileage"). Restricted to
// words of 5+ characters, matched against title words of 4+ characters, so short/common
// words never fuzzy-match — that would reopen the false-positive risk this threshold guards
// against (see matchDiagnostics's minScore param).
const fuzzyTitleMatch = (word: string, titleHay: string): boolean => {
  if (word.length < 5) return false;
  const maxDist = word.length >= 8 ? 2 : 1;
  return titleHay.split(/\s+/).some(tw => tw.length >= 4 && levenshtein(word, tw) <= maxDist);
};

// Explicit aliases for words that are themselves valid English words with an unrelated
// everyday meaning (so generic edit-distance fuzzy matching deliberately won't bridge them,
// to avoid accidental collisions) but are extremely common Banglish/typo substitutions for a
// specific domain term — e.g. Bangladeshi riders very commonly type "break" for "brake".
const DIAGNOSTIC_WORD_ALIASES: Record<string, string> = {
  break: 'brake'
};

export const matchDiagnostics = (text: string, limit = 3, minScore = 1): DiagnosticIssue[] => {
  const q = text.toLowerCase();
  const queryWords = q.split(/\s+/)
    .filter(w => w.length >= 3)
    .filter(w => !DIAGNOSTIC_STOPWORDS.has(w) && !DIAGNOSTIC_STOPWORDS.has(stem(w)));

  const scored = SERVICE_DIAGNOSTICS_KB.map(issue => {
    let score = 0;
    const titleHay = `${issue.titleEn} ${issue.titleBn}`.toLowerCase();
    const symptomHay = [issue.rootCause, ...issue.symptoms].join(' ').toLowerCase();

    for (const word of queryWords) {
      const root = stem(word);
      const aliased = DIAGNOSTIC_WORD_ALIASES[word] || DIAGNOSTIC_WORD_ALIASES[root];
      if (
        hasWord(titleHay, word) ||
        (root.length >= 3 && hasWord(titleHay, root)) ||
        fuzzyTitleMatch(word, titleHay) ||
        (aliased && hasWord(titleHay, aliased))
      ) {
        score += 4; // title match = strongest signal, this word names the actual problem
      } else if (
        hasWord(symptomHay, word) ||
        (root.length >= 3 && hasWord(symptomHay, root)) ||
        (aliased && hasWord(symptomHay, aliased))
      ) {
        score += 1; // symptom/cause text match = weaker supporting signal
      }
    }
    if (q.includes(issue.problemKey.replace(/_/g, ' '))) score += 5;
    return { issue, score };
  });

  return scored.filter(s => s.score >= minScore).sort((a, b) => b.score - a.score).slice(0, limit).map(s => s.issue);
};

export const getProductsByIds = (ids: string[]): ACIProduct[] =>
  ids.map(id => ACI_PRODUCTS_CATALOG.find(p => p.id === id)).filter((p): p is ACIProduct => Boolean(p));
