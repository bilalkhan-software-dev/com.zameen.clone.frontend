import axios from "axios";
import readline from "readline";

// ------------------------------
// Configuration
// ------------------------------
const API_BASE = process.env.API_BASE || "http://localhost:5118";
const AUTH_ENDPOINT = "/api/Auth/login";
const CREATE_PROPERTY_ENDPOINT = "/api/Property";

// Provided image URLs
const imageUrls = [
  "https://res.cloudinary.com/dkkgqafqw/image/upload/v1780678348/qx4xkwkg8gndj5sg3rn4.jpg",
  "https://res.cloudinary.com/dkkgqafqw/image/upload/v1780677821/tba8xljxddduuraol7du.jpg",
  "https://res.cloudinary.com/dkkgqafqw/image/upload/v1780677246/vfdnrmfs0kie1i4qslhe.jpg",
  "https://res.cloudinary.com/dkkgqafqw/image/upload/v1780674448/rwyyuoeskegtpep6xatu.jpg",
  "https://res.cloudinary.com/dkkgqafqw/image/upload/v1780501630/tcfha9wrf5enmpbs2c27.jpg",
  "https://res.cloudinary.com/dkkgqafqw/image/upload/v1780502083/dwqcwahqnotqfuaw5shm.jpg",
  "https://res.cloudinary.com/dkkgqafqw/image/upload/v1780501491/emxxlektbnbdzla5aio8.jpg",
  "https://res.cloudinary.com/dkkgqafqw/image/upload/v1780501109/drp7kmavwvrg04qyql7j.jpg",
  "https://res.cloudinary.com/dkkgqafqw/image/upload/v1780498552/xgbd8bug8cuev1tgalmb.jpg",
  "https://res.cloudinary.com/dkkgqafqw/image/upload/v1780430382/kz6w5v7dep9i5qe8d7uy.jpg",
  "https://res.cloudinary.com/dkkgqafqw/image/upload/v1780422757/jjbdwwccccocn9roi65l.jpg",
];

// Cities and locations
const citiesData = {
  Lahore: [
    "DHA Phase 1",
    "DHA Phase 2",
    "DHA Phase 3",
    "DHA Phase 4",
    "DHA Phase 5",
    "DHA Phase 6",
    "DHA Phase 7",
    "DHA Phase 8",
    "DHA Phase 9",
    "DHA Phase 10",
    "Bahria Town",
    "Gulberg",
    "Johar Town",
    "Model Town",
    "Cantt",
    "Garden Town",
    "Wapda Town",
    "Valencia",
    "Lake City",
  ],
  Karachi: [
    "DHA Defence",
    "Clifton",
    "Gulshan-e-Iqbal",
    "North Nazimabad",
    "Bahria Town Karachi",
    "Scheme 33",
    "Gulistan-e-Jauhar",
    "Malir",
    "Korangi",
    "Nazimabad",
    "PECHS",
    "Saddar",
  ],
  Islamabad: [
    "DHA Defence",
    "Bahria Town",
    "F-7",
    "F-10",
    "G-11",
    "E-11",
    "I-8",
    "G-13",
    "D-12",
    "B-17",
    "Top City",
    "Park View City",
    "Gulberg Greens",
  ],
  Rawalpindi: [
    "Bahria Town",
    "Gulraiz Housing Scheme",
    "Askari",
    "Westridge",
    "DHA",
    "Commercial Market",
    "Satellite Town",
    "Raja Bazaar",
  ],
  Peshawar: ["DHA", "Hayatabad", "University Town", "Cantt", "Saddar"],
  Multan: ["DHA", "Wapda Town", "Gulgasht Colony", "Cantt"],
  Faisalabad: ["DHA", "Canal Town", "Peoples Colony", "Satiana Road"],
  Quetta: ["DHA", "Jinnah Town", "Cantt"],
  Sialkot: ["DHA", "Cantt", "Sialkot City"],
  Gujranwala: ["Model Town", "Gulshan-e-Iqbal", "Satellite Town", "Cantt"],
  Hyderabad: ["Latifabad", "Qasimabad", "Cantt", "City Center"],
  Sukkur: ["New Sukkur", "Military Road", "Airport Road"],
  Bahawalpur: ["Model Town", "Cantt", "Satellite Town"],
  Sargodha: ["Cantt", "University Road", "Satellite Town"],
  Abbottabad: ["Cantt", "Jinnahabad", "Sarban Road"],
};

const propertyTypes = [
  "HOUSE",
  "FLAT",
  "PLOT",
  "COMMERCIAL",
  "SHOP",
  "STUDIO",
  "FACTORY",
];
const propertyPurposes = ["BUY", "RENT"];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomRange = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const baseAmenities = {
  builtInYear: 2020,
  parkingSpaces: 2,
  lobbyInBuilding: false,
  doubleGlazedWindows: true,
  centralAirConditioning: false,
  centralHeating: false,
  flooring: "Tile",
  electricityBackup: true,
  wasteDisposal: false,
  floor: 1,
  floorsInBuilding: 3,
  elevators: 1,
  serviceElevatorsInBuilding: false,
  otherMainFeatures: false,
  furnished: false,
  rooms: 0,
  servantQuarters: 0,
  otherRooms: false,
  broadbandInternetAccess: true,
  satelliteOrCableTVReady: true,
  businessCenterOrMediaRoom: false,
  conferenceRoom: false,
  intercom: true,
  atmMachines: false,
  otherBusinessFacilities: false,
  communityLawnOrGarden: false,
  communitySwimmingPool: false,
  communityGym: false,
  firstAidOrMedicalCentre: false,
  dayCareCentre: false,
  kidsPlayArea: false,
  barbequeArea: false,
  mosque: false,
  communityCentre: false,
  otherCommunityFacilities: false,
  lawnOrGarden: true,
  otherHealthcareRecreation: false,
  nearbySchools: true,
  nearbyHospitals: true,
  nearbyShoppingMalls: false,
  nearbyRestaurants: true,
  distanceFromAirportKm: 15,
  nearbyPublicTransport: true,
  otherNearbyPlaces: false,
  maintenanceStaff: false,
  securityStaff: false,
  facilitiesForDisabled: false,
  petsAllowed: true,
  otherFacilities: false,
};

function generateAmenities(propertyType, bedrooms, bathrooms) {
  const amenities = { ...baseAmenities };
  amenities.builtInYear = randomRange(2000, 2024);
  amenities.parkingSpaces = randomRange(0, 10);
  amenities.bedrooms = bedrooms;
  amenities.bathrooms = bathrooms;
  amenities.floorsInBuilding = randomRange(1, 10);
  amenities.elevators = randomRange(0, 3);
  amenities.furnished = Math.random() > 0.5;
  amenities.petsAllowed = Math.random() > 0.5;
  amenities.centralAirConditioning = Math.random() > 0.7;
  amenities.centralHeating = Math.random() > 0.8;
  amenities.communitySwimmingPool = Math.random() > 0.9;
  amenities.communityGym = Math.random() > 0.9;
  if (propertyType === "PLOT") {
    amenities.builtInYear = 0;
    amenities.parkingSpaces = 0;
    amenities.furnished = false;
    amenities.rooms = 0;
  }
  if (propertyType === "FLAT") {
    amenities.floor = randomRange(1, amenities.floorsInBuilding);
  }
  return amenities;
}

function generateProperty(city, location, index) {
  const propertyType = randomItem(propertyTypes);
  const purpose = randomItem(propertyPurposes);
  const areaSize = randomRange(500, 10000);
  const price = randomRange(5_000_000, 500_000_000);
  const bedrooms =
    propertyType === "PLOT" || propertyType === "COMMERCIAL"
      ? 0
      : randomRange(1, 8);
  const bathrooms =
    propertyType === "PLOT" || propertyType === "COMMERCIAL"
      ? 0
      : randomRange(1, 6);
  const title = `${propertyType} in ${location}, ${city} - ${index}`;
  const description = `A beautiful ${propertyType.toLowerCase()} located in ${location}, ${city}. Features ${bedrooms} bedrooms, ${bathrooms} bathrooms, and ${areaSize} sq.ft. area. Price: PKR ${price.toLocaleString()}.`;

  const shuffled = [...imageUrls];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Ensure at least 2 images (max 4)
  const propertyPics = shuffled.slice(0, randomRange(2, 4));

  // Base coordinates
  let lat = 31.5204,
    lng = 74.3587;
  if (city === "Karachi") {
    lat = 24.8607;
    lng = 67.0011;
  } else if (city === "Islamabad") {
    lat = 33.6844;
    lng = 73.0479;
  } else if (city === "Rawalpindi") {
    lat = 33.5651;
    lng = 73.0169;
  } else if (city === "Peshawar") {
    lat = 34.0151;
    lng = 71.5249;
  } else if (city === "Multan") {
    lat = 30.1575;
    lng = 71.5249;
  } else if (city === "Faisalabad") {
    lat = 31.4504;
    lng = 73.135;
  } else if (city === "Quetta") {
    lat = 30.1798;
    lng = 66.975;
  } else if (city === "Sialkot") {
    lat = 32.4945;
    lng = 74.5229;
  } else if (city === "Gujranwala") {
    lat = 32.1877;
    lng = 74.1945;
  } else if (city === "Hyderabad") {
    lat = 25.396;
    lng = 68.3572;
  } else if (city === "Sukkur") {
    lat = 27.7052;
    lng = 68.8674;
  } else if (city === "Bahawalpur") {
    lat = 29.3956;
    lng = 71.6836;
  } else if (city === "Sargodha") {
    lat = 32.0738;
    lng = 72.671;
  } else if (city === "Abbottabad") {
    lat = 34.1558;
    lng = 73.2196;
  }
  lat += (Math.random() - 0.5) * 0.05;
  lng += (Math.random() - 0.5) * 0.05;

  const amenities = generateAmenities(propertyType, bedrooms, bathrooms);
  return {
    title,
    description,
    price,
    city,
    address: `${randomRange(1, 999)} ${location} Main Road, ${city}`,
    location,
    latitude: lat,
    longitude: lng,
    bedrooms,
    bathrooms,
    areaSize,
    propertyType,
    propertyPurpose: purpose,
    propertyPics,
    amenities,
  };
}

async function createBalancedProperties(total) {
  const cityNames = Object.keys(citiesData);
  const cityCount = cityNames.length;
  const perCity = Math.floor(total / cityCount);
  const remainder = total % cityCount;

  let created = 0,
    failed = 0;
  let propertyCounter = 1;

  for (let c = 0; c < cityCount; c++) {
    const city = cityNames[c];
    const locations = citiesData[city];
    const propsForCity = perCity + (c < remainder ? 1 : 0);
    const perLocation = Math.floor(propsForCity / locations.length);
    const locRemainder = propsForCity % locations.length;

    for (let l = 0; l < locations.length; l++) {
      const location = locations[l];
      const propsForLoc = perLocation + (l < locRemainder ? 1 : 0);
      for (let i = 0; i < propsForLoc; i++) {
        const property = generateProperty(city, location, propertyCounter++);
        try {
          const response = await apiRequest(
            "POST",
            `${API_BASE}${CREATE_PROPERTY_ENDPOINT}`,
            property,
          );
          console.log(
            `✅ [${propertyCounter - 1}/${total}] Created: ${response.data.data?.title}`,
          );
          created++;
        } catch (error) {
          console.error(
            `❌ [${propertyCounter - 1}/${total}] Failed:`,
            error.response?.data?.message || error.message,
          );
          failed++;
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  }
  console.log(`\n🎉 Finished: ${created} created, ${failed} failed.`);
}

// ------------------------------
// Authentication
// ------------------------------
let accessToken = null;
let refreshToken = null;

async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE}${AUTH_ENDPOINT}`, {
      email,
      password,
    });
    accessToken =
      response.data.accessToken ||
      response.data.token ||
      response.data.data?.accessToken;
    refreshToken =
      response.data.refreshToken || response.data.data?.refreshToken;
    if (!accessToken) throw new Error("Access token not found");
    console.log("✅ Login successful. Access token obtained.");
    return true;
  } catch (error) {
    console.error(
      "❌ Login failed:",
      error.response?.data?.message || error.message,
    );
    return false;
  }
}

async function refreshAccessToken() {
  if (!refreshToken) return false;
  try {
    const response = await axios.post(`${API_BASE}/api/Auth/refresh`, {
      refreshToken,
    });
    accessToken = response.data.accessToken || response.data.token;
    console.log("✅ Token refreshed.");
    return true;
  } catch (error) {
    console.error(
      "❌ Token refresh failed:",
      error.response?.data?.message || error.message,
    );
    return false;
  }
}

async function apiRequest(method, url, data = null, retry = true) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
  try {
    const response = await axios({ method, url, data, headers });
    return response;
  } catch (error) {
    if (error.response?.status === 401 && retry) {
      console.log("🔄 Token expired, refreshing...");
      const refreshed = await refreshAccessToken();
      if (refreshed) return apiRequest(method, url, data, false);
    }
    throw error;
  }
}

// ------------------------------
// Main CLI
// ------------------------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

(async () => {
  console.log("\n🔐 Login to Zameen Clone API\n");
  const email = await askQuestion("Email: ");
  const password = await askQuestion("Password: ");
  rl.close();

  const loggedIn = await login(email, password);
  if (!loggedIn) process.exit(1);

  const total = 300; // set desired total
  console.log(
    `\n🏠 Starting to create ${total} properties (each with 2-4 images) with balanced city/location distribution...\n`,
  );
  await createBalancedProperties(total);
})();
