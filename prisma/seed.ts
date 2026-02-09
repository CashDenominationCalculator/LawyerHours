import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CITIES = [
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

async function main() {
  console.log('🌱 Seeding cities...');

  for (const city of CITIES) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: {
        name: city.name,
        stateCode: city.stateCode,
        stateName: city.stateName,
        stateSlug: city.stateSlug,
        latitude: city.lat,
        longitude: city.lng,
        population: city.pop,
      },
      create: {
        name: city.name,
        stateCode: city.stateCode,
        stateName: city.stateName,
        stateSlug: city.stateSlug,
        latitude: city.lat,
        longitude: city.lng,
        population: city.pop,
        slug: city.slug,
      },
    });
  }

  console.log(`✅ Seeded ${CITIES.length} cities`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
