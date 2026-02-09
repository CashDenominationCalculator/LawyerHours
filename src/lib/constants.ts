export const SITE_NAME = 'LawyerHours';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lawyerhours.com';
export const SITE_DESCRIPTION = 'Find attorneys available right now — evening hours, weekend appointments, and emergency legal help.';

export const COLORS = {
  navy: '#1a2332',
  green: '#2d8a4e',
  greenLight: '#e8f5e9',
  amber: '#e8a838',
  amberLight: '#fff8e1',
  white: '#ffffff',
  gray: '#f5f5f5',
};

export interface CityData {
  name: string;
  stateCode: string;
  stateName: string;
  stateSlug: string;
  lat: number;
  lng: number;
  pop: number;
  slug: string;
}

export const CITIES: CityData[] = [
  { name: "New York", stateCode: "NY", stateName: "New York", stateSlug: "new-york", lat: 40.7128, lng: -74.0060, pop: 8336817, slug: "new-york-ny" },
  { name: "Los Angeles", stateCode: "CA", stateName: "California", stateSlug: "california", lat: 34.0522, lng: -118.2437, pop: 3979576, slug: "los-angeles-ca" },
  { name: "Chicago", stateCode: "IL", stateName: "Illinois", stateSlug: "illinois", lat: 41.8781, lng: -87.6298, pop: 2693976, slug: "chicago-il" },
  { name: "Houston", stateCode: "TX", stateName: "Texas", stateSlug: "texas", lat: 29.7604, lng: -95.3698, pop: 2320268, slug: "houston-tx" },
  { name: "Phoenix", stateCode: "AZ", stateName: "Arizona", stateSlug: "arizona", lat: 33.4484, lng: -112.0740, pop: 1680992, slug: "phoenix-az" },
  { name: "Philadelphia", stateCode: "PA", stateName: "Pennsylvania", stateSlug: "pennsylvania", lat: 39.9526, lng: -75.1652, pop: 1603797, slug: "philadelphia-pa" },
  { name: "San Antonio", stateCode: "TX", stateName: "Texas", stateSlug: "texas", lat: 29.4241, lng: -98.4936, pop: 1547253, slug: "san-antonio-tx" },
  { name: "San Diego", stateCode: "CA", stateName: "California", stateSlug: "california", lat: 32.7157, lng: -117.1611, pop: 1423851, slug: "san-diego-ca" },
  { name: "Dallas", stateCode: "TX", stateName: "Texas", stateSlug: "texas", lat: 32.7767, lng: -96.7970, pop: 1343573, slug: "dallas-tx" },
  { name: "Austin", stateCode: "TX", stateName: "Texas", stateSlug: "texas", lat: 30.2672, lng: -97.7431, pop: 978908, slug: "austin-tx" },
  { name: "Jacksonville", stateCode: "FL", stateName: "Florida", stateSlug: "florida", lat: 30.3322, lng: -81.6557, pop: 949611, slug: "jacksonville-fl" },
  { name: "San Jose", stateCode: "CA", stateName: "California", stateSlug: "california", lat: 37.3382, lng: -121.8863, pop: 1013240, slug: "san-jose-ca" },
  { name: "Fort Worth", stateCode: "TX", stateName: "Texas", stateSlug: "texas", lat: 32.7555, lng: -97.3308, pop: 918915, slug: "fort-worth-tx" },
  { name: "Columbus", stateCode: "OH", stateName: "Ohio", stateSlug: "ohio", lat: 39.9612, lng: -82.9988, pop: 905748, slug: "columbus-oh" },
  { name: "Indianapolis", stateCode: "IN", stateName: "Indiana", stateSlug: "indiana", lat: 39.7684, lng: -86.1581, pop: 887642, slug: "indianapolis-in" },
  { name: "Charlotte", stateCode: "NC", stateName: "North Carolina", stateSlug: "north-carolina", lat: 35.2271, lng: -80.8431, pop: 874579, slug: "charlotte-nc" },
  { name: "San Francisco", stateCode: "CA", stateName: "California", stateSlug: "california", lat: 37.7749, lng: -122.4194, pop: 873965, slug: "san-francisco-ca" },
  { name: "Seattle", stateCode: "WA", stateName: "Washington", stateSlug: "washington", lat: 47.6062, lng: -122.3321, pop: 737015, slug: "seattle-wa" },
  { name: "Denver", stateCode: "CO", stateName: "Colorado", stateSlug: "colorado", lat: 39.7392, lng: -104.9903, pop: 715522, slug: "denver-co" },
  { name: "Washington", stateCode: "DC", stateName: "District of Columbia", stateSlug: "district-of-columbia", lat: 38.9072, lng: -77.0369, pop: 689545, slug: "washington-dc" },
  { name: "Nashville", stateCode: "TN", stateName: "Tennessee", stateSlug: "tennessee", lat: 36.1627, lng: -86.7816, pop: 689447, slug: "nashville-tn" },
  { name: "Oklahoma City", stateCode: "OK", stateName: "Oklahoma", stateSlug: "oklahoma", lat: 35.4676, lng: -97.5164, pop: 681054, slug: "oklahoma-city-ok" },
  { name: "El Paso", stateCode: "TX", stateName: "Texas", stateSlug: "texas", lat: 31.7619, lng: -106.4850, pop: 678815, slug: "el-paso-tx" },
  { name: "Portland", stateCode: "OR", stateName: "Oregon", stateSlug: "oregon", lat: 45.5152, lng: -122.6784, pop: 652503, slug: "portland-or" },
  { name: "Las Vegas", stateCode: "NV", stateName: "Nevada", stateSlug: "nevada", lat: 36.1699, lng: -115.1398, pop: 641903, slug: "las-vegas-nv" },
  { name: "Memphis", stateCode: "TN", stateName: "Tennessee", stateSlug: "tennessee", lat: 35.1495, lng: -90.0490, pop: 633104, slug: "memphis-tn" },
  { name: "Louisville", stateCode: "KY", stateName: "Kentucky", stateSlug: "kentucky", lat: 38.2527, lng: -85.7585, pop: 633045, slug: "louisville-ky" },
  { name: "Baltimore", stateCode: "MD", stateName: "Maryland", stateSlug: "maryland", lat: 39.2904, lng: -76.6122, pop: 585708, slug: "baltimore-md" },
  { name: "Milwaukee", stateCode: "WI", stateName: "Wisconsin", stateSlug: "wisconsin", lat: 43.0389, lng: -87.9065, pop: 577222, slug: "milwaukee-wi" },
  { name: "Albuquerque", stateCode: "NM", stateName: "New Mexico", stateSlug: "new-mexico", lat: 35.0844, lng: -106.6504, pop: 564559, slug: "albuquerque-nm" },
  { name: "Tucson", stateCode: "AZ", stateName: "Arizona", stateSlug: "arizona", lat: 32.2226, lng: -110.9747, pop: 542629, slug: "tucson-az" },
  { name: "Fresno", stateCode: "CA", stateName: "California", stateSlug: "california", lat: 36.7378, lng: -119.7871, pop: 542107, slug: "fresno-ca" },
  { name: "Sacramento", stateCode: "CA", stateName: "California", stateSlug: "california", lat: 38.5816, lng: -121.4944, pop: 524943, slug: "sacramento-ca" },
  { name: "Mesa", stateCode: "AZ", stateName: "Arizona", stateSlug: "arizona", lat: 33.4152, lng: -111.8315, pop: 504258, slug: "mesa-az" },
  { name: "Kansas City", stateCode: "MO", stateName: "Missouri", stateSlug: "missouri", lat: 39.0997, lng: -94.5786, pop: 508090, slug: "kansas-city-mo" },
  { name: "Atlanta", stateCode: "GA", stateName: "Georgia", stateSlug: "georgia", lat: 33.7490, lng: -84.3880, pop: 498715, slug: "atlanta-ga" },
  { name: "Omaha", stateCode: "NE", stateName: "Nebraska", stateSlug: "nebraska", lat: 41.2565, lng: -95.9345, pop: 486051, slug: "omaha-ne" },
  { name: "Colorado Springs", stateCode: "CO", stateName: "Colorado", stateSlug: "colorado", lat: 38.8339, lng: -104.8214, pop: 478221, slug: "colorado-springs-co" },
  { name: "Raleigh", stateCode: "NC", stateName: "North Carolina", stateSlug: "north-carolina", lat: 35.7796, lng: -78.6382, pop: 474069, slug: "raleigh-nc" },
  { name: "Miami", stateCode: "FL", stateName: "Florida", stateSlug: "florida", lat: 25.7617, lng: -80.1918, pop: 467963, slug: "miami-fl" },
  { name: "Tampa", stateCode: "FL", stateName: "Florida", stateSlug: "florida", lat: 27.9506, lng: -82.4572, pop: 384959, slug: "tampa-fl" },
  { name: "Minneapolis", stateCode: "MN", stateName: "Minnesota", stateSlug: "minnesota", lat: 44.9778, lng: -93.2650, pop: 429954, slug: "minneapolis-mn" },
  { name: "New Orleans", stateCode: "LA", stateName: "Louisiana", stateSlug: "louisiana", lat: 29.9511, lng: -90.0715, pop: 383997, slug: "new-orleans-la" },
  { name: "Cleveland", stateCode: "OH", stateName: "Ohio", stateSlug: "ohio", lat: 41.4993, lng: -81.6944, pop: 372624, slug: "cleveland-oh" },
  { name: "Tulsa", stateCode: "OK", stateName: "Oklahoma", stateSlug: "oklahoma", lat: 36.1540, lng: -95.9928, pop: 413066, slug: "tulsa-ok" },
  { name: "Honolulu", stateCode: "HI", stateName: "Hawaii", stateSlug: "hawaii", lat: 21.3069, lng: -157.8583, pop: 350964, slug: "honolulu-hi" },
  { name: "Pittsburgh", stateCode: "PA", stateName: "Pennsylvania", stateSlug: "pennsylvania", lat: 40.4406, lng: -79.9959, pop: 302971, slug: "pittsburgh-pa" },
  { name: "St. Louis", stateCode: "MO", stateName: "Missouri", stateSlug: "missouri", lat: 38.6270, lng: -90.1994, pop: 301578, slug: "st-louis-mo" },
  { name: "Detroit", stateCode: "MI", stateName: "Michigan", stateSlug: "michigan", lat: 42.3314, lng: -83.0458, pop: 639111, slug: "detroit-mi" },
  { name: "Boston", stateCode: "MA", stateName: "Massachusetts", stateSlug: "massachusetts", lat: 42.3601, lng: -71.0589, pop: 675647, slug: "boston-ma" },
];

export interface PracticeAreaData {
  slug: string;
  displayName: string;
  keywords: string[];
  urgency: 'high' | 'medium' | 'low';
  editorial: string;
}

export const PRACTICE_AREAS: PracticeAreaData[] = [
  {
    slug: "personal-injury",
    displayName: "Personal Injury",
    keywords: ["personal injury", "injury", "accident", "negligence", "liability", "slip and fall", "premises liability"],
    urgency: "high",
    editorial: "After an accident in {city}, time is critical. Evidence deteriorates quickly, witnesses become harder to reach, and insurance companies start building their case against you immediately. The statute of limitations in {state} limits your window to file. Finding a personal injury attorney you can speak to tonight — not next week — can make a meaningful difference in the outcome of your case."
  },
  {
    slug: "car-accident",
    displayName: "Car Accident",
    keywords: ["car accident", "auto accident", "vehicle accident", "car crash", "auto crash", "car wreck", "traffic accident", "auto injury"],
    urgency: "high",
    editorial: "If you've been in a car accident in {city}, the first 24-48 hours are crucial. Police reports need to be filed, medical treatment documented, and evidence preserved before it disappears. Many car accident attorneys in {city} offer evening and weekend consultations specifically because they understand accidents don't wait for business hours."
  },
  {
    slug: "divorce",
    displayName: "Divorce",
    keywords: ["divorce", "dissolution", "marital", "separation"],
    urgency: "medium",
    editorial: "Making the decision to file for divorce in {city} is difficult enough without the added stress of scheduling conflicts. Many people going through a divorce work full-time and cannot visit an attorney during weekday business hours. The divorce attorneys listed below offer evening and weekend consultation hours so you can take the first step on your timeline, not theirs."
  },
  {
    slug: "family-law",
    displayName: "Family Law",
    keywords: ["family law", "family", "custody", "child custody", "child support", "adoption", "paternity", "guardianship", "domestic"],
    urgency: "medium",
    editorial: "Family law matters in {city} — whether custody disputes, adoption proceedings, or support modifications — affect the people closest to you. These cases often involve urgent timelines and emotional decisions that shouldn't wait until you can get a Monday afternoon appointment. The family law attorneys below offer extended hours to meet you when you're ready."
  },
  {
    slug: "criminal-defense",
    displayName: "Criminal Defense",
    keywords: ["criminal defense", "criminal", "defense", "felony", "misdemeanor", "assault", "theft", "drug"],
    urgency: "high",
    editorial: "Criminal charges in {city} demand immediate action. Every hour without legal representation is an hour where your rights may not be fully protected. Whether you're facing a misdemeanor or a felony charge, the criminal defense attorneys listed below offer after-hours and emergency availability because they understand that arrests don't happen on a 9-to-5 schedule."
  },
  {
    slug: "dui",
    displayName: "DUI / DWI",
    keywords: ["dui", "dwi", "drunk driving", "driving under influence", "impaired driving", "intoxicated"],
    urgency: "high",
    editorial: "DUI arrests in {city} most often happen at night and on weekends — precisely when most attorney offices are closed. The consequences of waiting until Monday to find representation can be severe: evidence windows close, administrative license suspension deadlines approach, and your options narrow with each passing day. These DUI attorneys offer after-hours availability for exactly this reason."
  },
  {
    slug: "estate-planning",
    displayName: "Estate Planning",
    keywords: ["estate planning", "estate", "will", "trust", "probate", "inheritance", "power of attorney", "living will", "elder law", "elder"],
    urgency: "low",
    editorial: "Estate planning in {city} is something most people know they should do but keep postponing — often because finding time during the workweek feels impossible. The estate planning attorneys below offer evening and weekend hours specifically to make it easier for busy professionals and families to protect their assets and plan for the future."
  },
  {
    slug: "immigration",
    displayName: "Immigration",
    keywords: ["immigration", "visa", "green card", "citizenship", "deportation", "asylum", "naturalization", "USCIS"],
    urgency: "high",
    editorial: "Immigration matters in {city} often come with strict deadlines and high stakes. Visa expiration dates, deportation proceedings, and asylum filing windows don't pause for office hours. The immigration attorneys below understand the urgency and offer extended availability to help you navigate the system on your timeline."
  },
  {
    slug: "bankruptcy",
    displayName: "Bankruptcy",
    keywords: ["bankruptcy", "chapter 7", "chapter 13", "debt relief", "insolvency", "creditor"],
    urgency: "medium",
    editorial: "When you're facing overwhelming debt in {city}, every day of delay can mean more collection calls, more interest accumulating, and more stress. Bankruptcy attorneys with evening and weekend hours make it possible to take the first step toward financial relief without missing work or losing income you can't afford to lose."
  },
  {
    slug: "real-estate",
    displayName: "Real Estate",
    keywords: ["real estate", "property", "closing", "title", "deed", "landlord", "tenant", "lease", "eviction", "housing"],
    urgency: "medium",
    editorial: "Real estate transactions and disputes in {city} often operate on tight timelines. Closing dates, lease deadlines, and eviction notices don't wait for convenient office hours. Whether you're buying a home, facing eviction, or dealing with a landlord dispute, the real estate attorneys below offer flexible scheduling to meet your needs."
  },
  {
    slug: "employment",
    displayName: "Employment Law",
    keywords: ["employment", "employment law", "labor", "wrongful termination", "discrimination", "harassment", "workplace", "workers compensation", "workers comp", "wage"],
    urgency: "medium",
    editorial: "If you've been wrongfully terminated, discriminated against, or harassed at work in {city}, you need legal guidance — but you may also need to keep your current job search going during business hours. Employment attorneys with evening availability let you get legal advice without sacrificing interview time or job hunting hours."
  },
  {
    slug: "workers-compensation",
    displayName: "Workers Compensation",
    keywords: ["workers compensation", "workers comp", "work injury", "workplace injury", "on the job injury", "occupational"],
    urgency: "high",
    editorial: "After a workplace injury in {city}, you're dealing with pain, medical appointments, and lost wages all at once. The last thing you need is to struggle to find time during business hours to consult an attorney. Workers compensation attorneys with evening and weekend hours make it possible to understand your rights and file your claim without additional disruption to your recovery."
  },
  {
    slug: "medical-malpractice",
    displayName: "Medical Malpractice",
    keywords: ["medical malpractice", "malpractice", "medical negligence", "surgical error", "misdiagnosis", "hospital negligence"],
    urgency: "medium",
    editorial: "Medical malpractice cases in {city} require prompt action — evidence must be preserved, medical records obtained, and expert opinions gathered within the statute of limitations. If you or a loved one has been harmed by medical negligence, these attorneys offer consultation hours outside the traditional workday so you can begin the process sooner."
  },
  {
    slug: "tax",
    displayName: "Tax Law",
    keywords: ["tax", "tax law", "IRS", "tax debt", "tax resolution", "audit", "tax lien", "tax levy"],
    urgency: "medium",
    editorial: "Tax problems with the IRS don't resolve themselves, and in {city}, the consequences of inaction — wage garnishments, bank levies, liens on your property — escalate quickly. Tax attorneys with extended hours give you the flexibility to address your tax situation before it gets worse, even if your day job makes weekday appointments impossible."
  },
  {
    slug: "traffic-ticket",
    displayName: "Traffic Ticket",
    keywords: ["traffic ticket", "traffic", "speeding ticket", "speeding", "traffic violation", "moving violation", "ticket"],
    urgency: "low",
    editorial: "A traffic ticket in {city} might seem minor, but points on your license can raise your insurance rates for years, and some violations carry serious penalties. Traffic ticket attorneys with evening availability make it easy to contest your ticket without taking time off work — often handling everything for you so you don't even need to appear in court."
  }
];

export const EMERGENCY_PRACTICE_AREAS = ['criminal-defense', 'dui', 'personal-injury', 'family-law', 'immigration'];

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getCityBySlug(slug: string): CityData | undefined {
  return CITIES.find(c => c.slug === slug);
}

export function getPracticeAreaBySlug(slug: string): PracticeAreaData | undefined {
  return PRACTICE_AREAS.find(pa => pa.slug === slug);
}

export function getCitiesByState(stateSlug: string): CityData[] {
  return CITIES.filter(c => c.stateSlug === stateSlug);
}

export function getUniqueStates(): { stateName: string; stateSlug: string; stateCode: string }[] {
  const map = new Map<string, { stateName: string; stateSlug: string; stateCode: string }>();
  for (const c of CITIES) {
    if (!map.has(c.stateSlug)) {
      map.set(c.stateSlug, { stateName: c.stateName, stateSlug: c.stateSlug, stateCode: c.stateCode });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.stateName.localeCompare(b.stateName));
}
