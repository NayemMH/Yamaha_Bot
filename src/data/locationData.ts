// Complete Bangladesh administrative location dataset (all 64 zillas / districts
// with their upazilas) + fuzzy spelling auto-correction used across lead forms,
// service consultation and technician routing.

export interface UpazilaOption {
  nameEn: string;
  nameBn?: string;
}

export interface DistrictOption {
  id: string;
  nameEn: string;
  nameBn: string;
  division: string;
  upazilas: UpazilaOption[];
}

const d = (
  id: string,
  nameEn: string,
  nameBn: string,
  division: string,
  upazilaNames: string[]
): DistrictOption => ({
  id,
  nameEn,
  nameBn,
  division,
  upazilas: upazilaNames.map(nameEn => ({ nameEn }))
});

export const BANGLADESH_DISTRICTS: DistrictOption[] = [
  // ---------------- Dhaka Division (13) ----------------
  d('dhaka', 'Dhaka', 'ঢাকা', 'Dhaka', [
    'Tejgaon / Central', 'Mirpur', 'Uttara', 'Dhanmondi', 'Gulshan / Banani',
    'Motijheel', 'Mohammadpur', 'Jatrabari / Demra', 'Savar', 'Dhamrai',
    'Keraniganj', 'Nawabganj', 'Dohar'
  ]),
  d('faridpur', 'Faridpur', 'ফরিদপুর', 'Dhaka', [
    'Faridpur Sadar', 'Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan',
    'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'
  ]),
  d('gazipur', 'Gazipur', 'গাজীপুর', 'Dhaka', [
    'Gazipur Sadar', 'Tongi', 'Sreepur', 'Kaliakair', 'Kapasia', 'Kaliganj'
  ]),
  d('gopalganj', 'Gopalganj', 'গোপালগঞ্জ', 'Dhaka', [
    'Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'
  ]),
  d('kishoreganj', 'Kishoreganj', 'কিশোরগঞ্জ', 'Dhaka', [
    'Kishoreganj Sadar', 'Austagram', 'Bajitpur', 'Bhairab', 'Hossainpur',
    'Itna', 'Karimganj', 'Katiadi', 'Kuliarchar', 'Mithamain', 'Nikli',
    'Pakundia', 'Tarail'
  ]),
  d('madaripur', 'Madaripur', 'মাদারীপুর', 'Dhaka', [
    'Madaripur Sadar', 'Kalkini', 'Rajoir', 'Shibchar', 'Dasar'
  ]),
  d('manikganj', 'Manikganj', 'মানিকগঞ্জ', 'Dhaka', [
    'Manikganj Sadar', 'Daulatpur', 'Ghior', 'Harirampur', 'Saturia',
    'Shivalaya', 'Singair'
  ]),
  d('munshiganj', 'Munshiganj', 'মুন্সীগঞ্জ', 'Dhaka', [
    'Munshiganj Sadar', 'Gazaria', 'Lohajang', 'Sirajdikhan', 'Sreenagar', 'Tongibari'
  ]),
  d('narayanganj', 'Narayanganj', 'নারায়ণগঞ্জ', 'Dhaka', [
    'Narayanganj Sadar', 'Araihazar', 'Bandar', 'Rupganj', 'Sonargaon'
  ]),
  d('narsingdi', 'Narsingdi', 'নরসিংদী', 'Dhaka', [
    'Narsingdi Sadar', 'Belabo', 'Monohardi', 'Palash', 'Raipura', 'Shibpur'
  ]),
  d('rajbari', 'Rajbari', 'রাজবাড়ী', 'Dhaka', [
    'Rajbari Sadar', 'Baliakandi', 'Goalandaghat', 'Pangsha', 'Kalukhali'
  ]),
  d('shariatpur', 'Shariatpur', 'শরীয়তপুর', 'Dhaka', [
    'Shariatpur Sadar', 'Bhedarganj', 'Damudya', 'Gosairhat', 'Naria', 'Zajira'
  ]),
  d('tangail', 'Tangail', 'টাঙ্গাইল', 'Dhaka', [
    'Tangail Sadar', 'Basail', 'Bhuapur', 'Delduar', 'Dhanbari', 'Ghatail',
    'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur'
  ]),

  // ---------------- Chattogram Division (11) ----------------
  d('bandarban', 'Bandarban', 'বান্দরবান', 'Chittagong', [
    'Bandarban Sadar', 'Alikadam', 'Lama', 'Naikhongchhari', 'Rowangchhari',
    'Ruma', 'Thanchi'
  ]),
  d('brahmanbaria', 'Brahmanbaria', 'ব্রাহ্মণবাড়িয়া', 'Chittagong', [
    'Brahmanbaria Sadar', 'Akhaura', 'Ashuganj', 'Bancharampur', 'Bijoynagar',
    'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail'
  ]),
  d('chandpur', 'Chandpur', 'চাঁদপুর', 'Chittagong', [
    'Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua',
    'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti'
  ]),
  d('chattogram', 'Chattogram (Chittagong)', 'চট্টগ্রাম', 'Chittagong', [
    'Agrabad / Commercial', 'GEC / Nasirabad', 'Kotwali / New Market',
    'Pahartali', 'Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish',
    'Fatikchhari', 'Hathazari', 'Lohagara', 'Mirsharai', 'Patiya',
    'Rangunia', 'Raozan', 'Sandwip', 'Satkania', 'Sitakunda'
  ]),
  d('cumilla', 'Cumilla (Comilla)', 'কুমিল্লা', 'Chittagong', [
    'Cumilla Sadar', 'Cumilla Sadar Dakshin', 'Barura', 'Brahmanpara',
    'Burichang', 'Chandina', 'Chauddagram', 'Daudkandi', 'Debidwar',
    'Homna', 'Laksam', 'Lalmai', 'Meghna', 'Monohorgonj', 'Muradnagar',
    'Nangalkot', 'Titas'
  ]),
  d('coxsbazar', "Cox's Bazar", 'কক্সবাজার', 'Chittagong', [
    "Cox's Bazar Sadar", 'Chakaria', 'Kutubdia', 'Maheshkhali', 'Pekua',
    'Ramu', 'Teknaf', 'Ukhia', 'Eidgaon'
  ]),
  d('feni', 'Feni', 'ফেনী', 'Chittagong', [
    'Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Fulgazi', 'Parshuram', 'Sonagazi'
  ]),
  d('khagrachhari', 'Khagrachhari', 'খাগড়াছড়ি', 'Chittagong', [
    'Khagrachhari Sadar', 'Dighinala', 'Lakshmichhari', 'Mahalchhari',
    'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh', 'Guimara'
  ]),
  d('lakshmipur', 'Lakshmipur', 'লক্ষ্মীপুর', 'Chittagong', [
    'Lakshmipur Sadar', 'Kamalnagar', 'Raipur', 'Ramganj', 'Ramgati'
  ]),
  d('noakhali', 'Noakhali', 'নোয়াখালী', 'Chittagong', [
    'Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya',
    'Kabirhat', 'Senbagh', 'Sonaimuri', 'Subarnachar'
  ]),
  d('rangamati', 'Rangamati', 'রাঙ্গামাটি', 'Chittagong', [
    'Rangamati Sadar', 'Baghaichhari', 'Barkal', 'Belaichhari', 'Juraichhari',
    'Kaptai', 'Kawkhali', 'Langadu', 'Naniarchar', 'Rajasthali'
  ]),

  // ---------------- Rajshahi Division (8) ----------------
  d('bogura', 'Bogura (Bogra)', 'বগুড়া', 'Rajshahi', [
    'Bogura Sadar', 'Adamdighi', 'Dhunat', 'Dhupchanchia', 'Gabtali',
    'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajahanpur', 'Sherpur',
    'Shibganj', 'Sonatala'
  ]),
  d('chapainawabganj', 'Chapainawabganj', 'চাঁপাইনবাবগঞ্জ', 'Rajshahi', [
    'Chapainawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Shibganj'
  ]),
  d('joypurhat', 'Joypurhat', 'জয়পুরহাট', 'Rajshahi', [
    'Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi'
  ]),
  d('naogaon', 'Naogaon', 'নওগাঁ', 'Rajshahi', [
    'Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda',
    'Mahadebpur', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar'
  ]),
  d('natore', 'Natore', 'নাটোর', 'Rajshahi', [
    'Natore Sadar', 'Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur',
    'Singra', 'Naldanga'
  ]),
  d('pabna', 'Pabna', 'পাবনা', 'Rajshahi', [
    'Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar',
    'Faridpur', 'Ishwardi', 'Santhia', 'Sujanagar'
  ]),
  d('rajshahi', 'Rajshahi', 'রাজশাহী', 'Rajshahi', [
    'Boalia / Shaheb Bazar', 'Motihar', 'Rajpara', 'Bagha', 'Bagmara',
    'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Tanore'
  ]),
  d('sirajganj', 'Sirajganj', 'সিরাজগঞ্জ', 'Rajshahi', [
    'Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur',
    'Raiganj', 'Shahjadpur', 'Tarash', 'Ullahpara'
  ]),

  // ---------------- Khulna Division (10) ----------------
  d('bagerhat', 'Bagerhat', 'বাগেরহাট', 'Khulna', [
    'Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat',
    'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'
  ]),
  d('chuadanga', 'Chuadanga', 'চুয়াডাঙ্গা', 'Khulna', [
    'Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'
  ]),
  d('jashore', 'Jashore (Jessore)', 'যশোর', 'Khulna', [
    'Jashore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha',
    'Keshabpur', 'Manirampur', 'Sharsha / Navaron'
  ]),
  d('jhenaidah', 'Jhenaidah', 'ঝিনাইদহ', 'Khulna', [
    'Jhenaidah Sadar', 'Harinakunda', 'Kaliganj', 'Kotchandpur',
    'Maheshpur', 'Shailkupa'
  ]),
  d('khulna', 'Khulna', 'খুলনা', 'Khulna', [
    'KDA Avenue / Sadar', 'Sonadanga', 'Khalishpur', 'Batiaghata',
    'Dacope', 'Dighalia', 'Dumuria', 'Koyra', 'Paikgachha', 'Phultala',
    'Rupsha', 'Terokhada'
  ]),
  d('kushtia', 'Kushtia', 'কুষ্টিয়া', 'Khulna', [
    'Kushtia Sadar', 'Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Mirpur'
  ]),
  d('magura', 'Magura', 'মাগুরা', 'Khulna', [
    'Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'
  ]),
  d('meherpur', 'Meherpur', 'মেহেরপুর', 'Khulna', [
    'Meherpur Sadar', 'Gangni', 'Mujibnagar'
  ]),
  d('narail', 'Narail', 'নড়াইল', 'Khulna', [
    'Narail Sadar', 'Kalia', 'Lohagara'
  ]),
  d('satkhira', 'Satkhira', 'সাতক্ষীরা', 'Khulna', [
    'Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj',
    'Shyamnagar', 'Tala'
  ]),

  // ---------------- Barishal Division (6) ----------------
  d('barguna', 'Barguna', 'বরগুনা', 'Barisal', [
    'Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali'
  ]),
  d('barisal', 'Barishal (Barisal)', 'বরিশাল', 'Barisal', [
    'Barishal Sadar', 'Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara',
    'Gournadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur'
  ]),
  d('bhola', 'Bhola', 'ভোলা', 'Barisal', [
    'Bhola Sadar', 'Borhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan',
    'Manpura', 'Tazumuddin'
  ]),
  d('jhalokathi', 'Jhalokathi', 'ঝালকাঠি', 'Barisal', [
    'Jhalokathi Sadar', 'Kathalia', 'Nalchity', 'Rajapur'
  ]),
  d('patuakhali', 'Patuakhali', 'পটুয়াখালী', 'Barisal', [
    'Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Dumki', 'Galachipa',
    'Kalapara / Kuakata', 'Mirzaganj', 'Rangabali'
  ]),
  d('pirojpur', 'Pirojpur', 'পিরোজপুর', 'Barisal', [
    'Pirojpur Sadar', 'Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur',
    'Nesarabad (Swarupkathi)', 'Zianagar (Indurkani)'
  ]),

  // ---------------- Sylhet Division (4) ----------------
  d('habiganj', 'Habiganj', 'হবিগঞ্জ', 'Sylhet', [
    'Habiganj Sadar', 'Ajmiriganj', 'Bahubal', 'Baniachong', 'Chunarughat',
    'Lakhai', 'Madhabpur', 'Nabiganj', 'Shayestaganj'
  ]),
  d('moulvibazar', 'Moulvibazar', 'মৌলভীবাজার', 'Sylhet', [
    'Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj', 'Kulaura',
    'Rajnagar', 'Sreemangal'
  ]),
  d('sunamganj', 'Sunamganj', 'সুনামগঞ্জ', 'Sylhet', [
    'Sunamganj Sadar', 'Bishwamvarpur', 'Chhatak', 'Derai', 'Dharampasha',
    'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Sullah', 'Tahirpur',
    'Shantiganj', 'Madhyanagar'
  ]),
  d('sylhet', 'Sylhet', 'সিলেট', 'Sylhet', [
    'Sylhet Sadar / Zindabazar', 'Balaganj', 'Beanibazar', 'Bishwanath',
    'Companiganj', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur',
    'Kanaighat', 'Osmani Nagar', 'Zakiganj', 'Dakshin Surma'
  ]),

  // ---------------- Rangpur Division (8) ----------------
  d('dinajpur', 'Dinajpur', 'দিনাজপুর', 'Rangpur', [
    'Dinajpur Sadar', 'Birampur', 'Birganj', 'Biral', 'Bochaganj',
    'Chirirbandar', 'Fulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole',
    'Khansama', 'Nawabganj', 'Parbatipur'
  ]),
  d('gaibandha', 'Gaibandha', 'গাইবান্ধা', 'Rangpur', [
    'Gaibandha Sadar', 'Fulchhari', 'Gobindaganj', 'Palashbari',
    'Sadullapur', 'Saghata', 'Sundarganj'
  ]),
  d('kurigram', 'Kurigram', 'কুড়িগ্রাম', 'Rangpur', [
    'Kurigram Sadar', 'Bhurungamari', 'Char Rajibpur', 'Chilmari',
    'Nageshwari', 'Phulbari', 'Rajarhat', 'Raumari', 'Ulipur'
  ]),
  d('lalmonirhat', 'Lalmonirhat', 'লালমনিরহাট', 'Rangpur', [
    'Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Patgram'
  ]),
  d('nilphamari', 'Nilphamari', 'নীলফামারী', 'Rangpur', [
    'Nilphamari Sadar', 'Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Saidpur'
  ]),
  d('panchagarh', 'Panchagarh', 'পঞ্চগড়', 'Rangpur', [
    'Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia'
  ]),
  d('rangpur', 'Rangpur', 'রংপুর', 'Rangpur', [
    'Rangpur Sadar', 'Badarganj', 'Gangachara', 'Kaunia', 'Mithapukur',
    'Pirgachha', 'Pirganj', 'Taraganj'
  ]),
  d('thakurgaon', 'Thakurgaon', 'ঠাকুরগাঁও', 'Rangpur', [
    'Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail'
  ]),

  // ---------------- Mymensingh Division (4) ----------------
  d('jamalpur', 'Jamalpur', 'জামালপুর', 'Mymensingh', [
    'Jamalpur Sadar', 'Baksiganj', 'Dewanganj', 'Islampur', 'Madarganj',
    'Melandaha', 'Sarishabari'
  ]),
  d('mymensingh', 'Mymensingh', 'ময়মনসিংহ', 'Mymensingh', [
    'Mymensingh Sadar / Charpara', 'Bhaluka', 'Dhobaura', 'Fulbaria',
    'Gafargaon', 'Gauripur', 'Haluaghat', 'Ishwarganj', 'Muktagachha',
    'Nandail', 'Phulpur', 'Trishal', 'Tarakanda'
  ]),
  d('netrokona', 'Netrokona', 'নেত্রকোণা', 'Mymensingh', [
    'Netrokona Sadar', 'Atpara', 'Barhatta', 'Durgapur', 'Kalmakanda',
    'Kendua', 'Khaliajuri', 'Madan', 'Mohanganj', 'Purbadhala'
  ]),
  d('sherpur', 'Sherpur', 'শেরপুর', 'Mymensingh', [
    'Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sreebardi'
  ])
];

// ---------------------------------------------------------------------------
// Fuzzy spelling auto-correction (Levenshtein based)
// ---------------------------------------------------------------------------

// Common shorthand / legacy spellings that pure edit-distance would miss
const LOCATION_ALIASES: Record<string, string> = {
  'ctg': 'chattogram', 'chittagong': 'chattogram', 'chottogram': 'chattogram',
  'daka': 'dhaka', 'dacca': 'dhaka',
  'bogra': 'bogura',
  'jessore': 'jashore', 'jesore': 'jashore',
  'comilla': 'cumilla',
  'barishal': 'barisal',
  'coxbazar': 'coxsbazar', 'cox bazar': 'coxsbazar', "cox's bazar": 'coxsbazar', 'coxs bazar': 'coxsbazar',
  'nawabganj': 'chapainawabganj', 'chapai': 'chapainawabganj',
  'brahmanbaria': 'brahmanbaria', 'bbaria': 'brahmanbaria', 'b-baria': 'brahmanbaria',
  'mymensing': 'mymensingh', 'moymonshingho': 'mymensingh',
  'silet': 'sylhet', 'shylhet': 'sylhet', 'sylet': 'sylhet',
  'rajsahi': 'rajshahi', 'rajshai': 'rajshahi'
};

const normalize = (s: string) =>
  s.toLowerCase().replace(/['.\-_,]/g, '').replace(/\s+/g, ' ').trim();

// Iterative two-row Levenshtein distance
export const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = curr;
  }
  return prev[b.length];
};

const similarity = (a: string, b: string): number => {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
};

interface LocationMatch {
  district: DistrictOption;
  upazila?: string;
  score: number;
}

const bestDistrictMatch = (input: string): LocationMatch | null => {
  const clean = normalize(input);
  if (!clean) return null;

  // 1. Alias shortcut
  for (const [alias, districtId] of Object.entries(LOCATION_ALIASES)) {
    if (clean === alias || clean.includes(alias)) {
      const dist = BANGLADESH_DISTRICTS.find(x => x.id === districtId);
      if (dist) return { district: dist, score: 1 };
    }
  }

  // 2. Fuzzy scan over district names (En + Bn) and upazila names
  let best: LocationMatch | null = null;
  for (const dist of BANGLADESH_DISTRICTS) {
    const candidates = [normalize(dist.nameEn), dist.nameBn, normalize(dist.id)];
    for (const cand of candidates) {
      const score = Math.max(
        similarity(clean, cand),
        cand.includes(clean) && clean.length >= 3 ? 0.9 : 0
      );
      if (!best || score > best.score) best = { district: dist, score };
    }
    for (const up of dist.upazilas) {
      const upClean = normalize(up.nameEn);
      const score = Math.max(
        similarity(clean, upClean),
        upClean.includes(clean) && clean.length >= 4 ? 0.88 : 0
      );
      if (score > (best?.score || 0)) best = { district: dist, upazila: up.nameEn, score };
    }
  }
  return best && best.score >= 0.6 ? best : null;
};

export interface CorrectedLocation {
  district: string;
  upazila: string;
  division: string;
  wasCorrected: boolean;
  confidence: number;
}

/**
 * Fuzzy auto-correct a free-typed location ("Sylet", "Mymensing", "coxbazar")
 * to a canonical zilla + upazila. Never blocks: falls back to raw input.
 */
export const autoCorrectLocation = (input: string): CorrectedLocation => {
  if (!input || !input.trim()) {
    return { district: 'Dhaka', upazila: 'Tejgaon / Central', division: 'Dhaka', wasCorrected: false, confidence: 0 };
  }

  const match = bestDistrictMatch(input);
  if (match) {
    const upazila = match.upazila || match.district.upazilas[0]?.nameEn || 'Sadar';
    const wasCorrected =
      normalize(input) !== normalize(match.upazila || match.district.nameEn) &&
      normalize(input) !== normalize(match.district.nameEn);
    return {
      district: match.district.nameEn,
      upazila,
      division: match.district.division,
      wasCorrected,
      confidence: Math.round(match.score * 100) / 100
    };
  }

  return { district: input.trim(), upazila: 'Sadar', division: 'Dhaka', wasCorrected: false, confidence: 0 };
};

/** Type-ahead suggestions for the free-text combobox (district level). */
export const suggestDistricts = (input: string, limit = 6): DistrictOption[] => {
  const clean = normalize(input);
  if (!clean) return BANGLADESH_DISTRICTS.slice(0, limit);
  return BANGLADESH_DISTRICTS
    .map(dist => ({
      dist,
      score: Math.max(
        similarity(clean, normalize(dist.nameEn)),
        normalize(dist.nameEn).startsWith(clean) ? 1 : 0,
        normalize(dist.nameEn).includes(clean) ? 0.85 : 0
      )
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter(x => x.score >= 0.3)
    .map(x => x.dist);
};

/** Type-ahead suggestions for upazilas of a chosen district. */
export const suggestUpazilas = (districtNameEn: string, input: string, limit = 8): string[] => {
  const dist = BANGLADESH_DISTRICTS.find(x => x.nameEn === districtNameEn);
  if (!dist) return [];
  const clean = normalize(input);
  if (!clean) return dist.upazilas.slice(0, limit).map(u => u.nameEn);
  return dist.upazilas
    .map(u => ({
      name: u.nameEn,
      score: Math.max(
        similarity(clean, normalize(u.nameEn)),
        normalize(u.nameEn).startsWith(clean) ? 1 : 0,
        normalize(u.nameEn).includes(clean) ? 0.85 : 0
      )
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter(x => x.score >= 0.3)
    .map(x => x.name);
};
