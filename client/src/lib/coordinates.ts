// Norwegian address coordinate lookup using official APIs
export interface Coordinates {
  lat: number;
  lng: number;
}

// Cache for coordinate lookups to avoid repeated API calls
const coordinateCache = new Map<string, Coordinates>();

/**
 * Get exact coordinates for a Norwegian address using our backend API
 */
export async function getExactCoordinates(
  address: string, 
  postalCode: string, 
  city: string
): Promise<Coordinates | null> {
  const cacheKey = `${address}-${postalCode}-${city}`.toLowerCase();
  
  // Check cache first
  if (coordinateCache.has(cacheKey)) {
    return coordinateCache.get(cacheKey)!;
  }

  try {
    // Use our backend API that calls Norwegian mapping services
    const params = new URLSearchParams({
      address,
      postalCode,
      city
    });
    
    const response = await fetch(`/api/coordinates?${params}`);
    
    if (response.ok) {
      const data = await response.json();
      const coordinates: Coordinates = { lat: data.lat, lng: data.lng };
      
      // Cache the result
      coordinateCache.set(cacheKey, coordinates);
      
      console.log(`✓ Found exact coordinates from ${data.source}:`, {
        address: `${address}, ${postalCode} ${city}`,
        coordinates
      });
      
      return coordinates;
    }

  } catch (error) {
    console.warn(`Failed to get coordinates for ${address}, ${postalCode} ${city}:`, error);
  }

  console.warn(`❌ No coordinates found for: ${address}, ${postalCode} ${city}`);
  return null;
}

/**
 * Get postal code center coordinates as fallback
 */
export function getPostalCodeCoordinates(postalCode: string): Coordinates | null {
  const postalCodeMap: { [key: string]: Coordinates } = {
    // Oslo
    '0001': { lat: 59.9139, lng: 10.7522 },
    '0150': { lat: 59.9150, lng: 10.7580 },
    '0250': { lat: 59.9200, lng: 10.7450 },
    '0349': { lat: 59.9050, lng: 10.7600 },
    
    // Akershus/Viken - oppdaterte koordinater
    '1350': { lat: 60.1695, lng: 11.0681 }, // Lommedalen
    '1470': { lat: 59.9262, lng: 10.9540 }, // Lørenskog
    '2000': { lat: 59.9556, lng: 11.0458 }, // Lillestrøm
    '2040': { lat: 60.0833, lng: 11.1167 }, // Kløfta
    '2050': { lat: 60.1394, lng: 11.1742 }, // Jessheim
    '2074': { lat: 60.3013, lng: 11.1666 }, // Eidsvoll Verk - eksakte koordinater
    '1440': { lat: 59.6697, lng: 10.6347 }, // Drøbak
    '1400': { lat: 59.7203, lng: 10.8358 }, // Ski
    '1450': { lat: 59.8667, lng: 10.6333 }, // Nesoddtangen
    '3050': { lat: 59.7667, lng: 10.2000 }, // Mjøndalen
    '3060': { lat: 59.6167, lng: 10.4000 }, // Svelvik
    '3070': { lat: 59.6000, lng: 10.2000 }, // Sande
    '3080': { lat: 59.4889, lng: 10.3119 }, // Holmestrand
    '3090': { lat: 59.4167, lng: 10.4833 }, // Horten
    
    // Innlandet
    '2600': { lat: 61.1153, lng: 10.4662 }, // Lillehammer
    '2680': { lat: 61.8833, lng: 9.0667 }, // Vågå
    
    // Vestfold og Telemark
    '3290': { lat: 59.0167, lng: 10.0167 }, // Stavern
    '3700': { lat: 59.2094, lng: 9.6067 }, // Skien
    '3800': { lat: 59.4167, lng: 9.0667 }, // Bø
    
    // Agder
    '4600': { lat: 58.1467, lng: 8.0045 }, // Kristiansand
    '4700': { lat: 58.2833, lng: 7.9667 }, // Vennesla
    
    // Rogaland
    '4000': { lat: 58.9700, lng: 5.7331 }, // Stavanger
    '4100': { lat: 59.0667, lng: 6.0667 }, // Jørpeland
    '4200': { lat: 59.6667, lng: 6.3500 }, // Sauda
    '5500': { lat: 59.4133, lng: 5.2683 }, // Haugesund
    
    // Vestland
    '5000': { lat: 60.3913, lng: 5.3221 }, // Bergen
    '5100': { lat: 60.1833, lng: 5.2167 }, // Isdalstø
    '6700': { lat: 61.9333, lng: 5.1167 }, // Måløy
    
    // Møre og Romsdal
    '6000': { lat: 62.4722, lng: 7.0950 }, // Ålesund
    '6100': { lat: 62.1500, lng: 6.0667 }, // Volda
    
    // Trøndelag
    '7000': { lat: 63.4305, lng: 10.3951 }, // Trondheim
    '7100': { lat: 63.6167, lng: 9.4667 }, // Rissa
    
    // Nordland
    '8000': { lat: 67.2804, lng: 14.4049 }, // Bodø
    '8100': { lat: 67.2667, lng: 15.3833 }, // Fauske
    
    // Troms og Finnmark
    '9000': { lat: 69.6492, lng: 18.9553 }, // Tromsø
    '9100': { lat: 69.7281, lng: 30.0419 }, // Kirkenes
  };

  return postalCodeMap[postalCode] || null;
}