import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Star, MapPin, ExternalLink, X } from "lucide-react";
import { getExactCoordinates, getPostalCodeCoordinates, type Coordinates } from "@/lib/coordinates";

interface Installer {
  id: number;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  website?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  orgNumber: string;
  counties: string[];
  lat?: number;
  lng?: number;
}

interface InstallerMapProps {
  installers: Installer[];
  onInstallerSelect?: (installer: Installer) => void;
}

// Declare Leaflet on window object
declare global {
  interface Window {
    L: any;
    selectInstaller: (installerId: number) => void;
  }
}

export default function InstallerMap({ installers, onInstallerSelect }: InstallerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const [selectedInstaller, setSelectedInstaller] = useState<Installer | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS and JS
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, []);

  const initializeMap = () => {
    if (!window.L || !mapRef.current) return;

    // Initialize map centered on Norway
    const map = window.L.map(mapRef.current).setView([62.0, 10.0], 6);

    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;
    setIsMapLoaded(true);
    updateMarkers();
  };

  // Function to get coordinates with automatic lookup for new addresses
  const getCoordinatesForInstaller = async (installer: Installer): Promise<{ lat: number; lng: number }> => {
    // If installer has address data, try to get exact coordinates first
    if (installer.address && installer.postalCode && installer.city) {
      try {
        // Try to get exact coordinates from Norwegian APIs
        const exactCoords = await getExactCoordinates(installer.address, installer.postalCode, installer.city);
        
        if (exactCoords) {
          // Add very small random offset to avoid exact overlapping
          const offset = 0.0005 * (Math.sin(installer.id * 2.3) + Math.cos(installer.id * 1.7));
          console.log(`✓ Using exact coordinates for ${installer.companyName}:`, {
            exact: exactCoords,
            final: { lat: exactCoords.lat + offset, lng: exactCoords.lng + offset }
          });
          return {
            lat: exactCoords.lat + offset,
            lng: exactCoords.lng + offset
          };
        }
      } catch (error) {
        console.warn(`Failed to get exact coordinates for ${installer.companyName}:`, error);
      }
      
      // Fallback to postal code coordinates
      const postalCoords = getPostalCodeCoordinates(installer.postalCode);
      if (postalCoords) {
        const offset = 0.0005 * (Math.sin(installer.id * 2.3) + Math.cos(installer.id * 1.7));
        console.log(`Using postal code coordinates for ${installer.companyName}:`, {
          baseCoords: postalCoords,
          finalCoords: { lat: postalCoords.lat + offset, lng: postalCoords.lng + offset }
        });
        return {
          lat: postalCoords.lat + offset,
          lng: postalCoords.lng + offset
        };
      }
    }

    return generateCoordinatesForInstaller(installer, 0);
  };

  const generateCoordinatesForInstaller = (installer: Installer, index: number): { lat: number; lng: number } => {

    // Fallback: Use county coordinates
    const countyCoordinates: { [key: string]: { lat: number; lng: number } } = {

      'Oslo': { lat: 59.9139, lng: 10.7522 },
      'Viken': { lat: 59.7, lng: 10.5 },
      'Akershus': { lat: 59.8937, lng: 10.8484 },
      'Innlandet': { lat: 61.1, lng: 10.4 },
      'Vestfold og Telemark': { lat: 59.2, lng: 9.4 },
      'Agder': { lat: 58.3, lng: 8.0 },
      'Rogaland': { lat: 58.9, lng: 5.7 },
      'Vestland': { lat: 60.9, lng: 5.3 },
      'Møre og Romsdal': { lat: 62.7, lng: 7.1 },
      'Trøndelag': { lat: 63.4, lng: 10.9 },
      'Nordland': { lat: 67.3, lng: 14.4 },
      'Troms og Finnmark': { lat: 69.6, lng: 23.0 }
    };

    // Use first county for positioning, with slight offset for multiple installers
    const firstCounty = installer.counties && installer.counties.length > 0 ? installer.counties[0] : null;
    const baseCoords = firstCounty ? countyCoordinates[firstCounty] : null;
    
    if (!baseCoords) {
      // Fallback to center of Norway if no county data
      return {
        lat: 60.0 + (Math.random() - 0.5) * 2.0,
        lng: 8.0 + (Math.random() - 0.5) * 4.0
      };
    }
    
    // Add small random offset to avoid overlapping markers
    const offset = 0.1 * (Math.sin(installer.id * 2.3) + Math.cos(installer.id * 1.7));
    
    return {
      lat: baseCoords.lat + offset,
      lng: baseCoords.lng + offset
    };
  };

  const updateMarkers = async () => {
    if (!mapInstanceRef.current || !window.L || !isMapLoaded) return;

    // Remove existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current.clear();

    // Remove duplicate installers before adding markers
    const uniqueInstallers = installers.reduce((acc, installer) => {
      const existingIndex = acc.findIndex(i => i.id === installer.id);
      if (existingIndex === -1) {
        acc.push(installer);
      } else {
        // Merge counties if installer already exists
        const existing = acc[existingIndex];
        if (installer.counties) {
          existing.counties = [...new Set([...(existing.counties || []), ...installer.counties])];
        }
      }
      return acc;
    }, [] as typeof installers);

    // Add new markers for unique installers with async coordinate lookup
    for (const installer of uniqueInstallers) {
      let coords: { lat: number; lng: number };
      
      if (installer.lat && installer.lng) {
        coords = { lat: installer.lat, lng: installer.lng };
      } else {
        // Try to get exact coordinates first, fallback to postal code
        coords = await getCoordinatesForInstaller(installer);
      }

      // Create installer icon
      const installerIcon = window.L.divIcon({
        html: `<div style="background: #10b981; border: 2px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
        className: 'custom-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = window.L.marker([coords.lat, coords.lng], { icon: installerIcon })
        .addTo(mapInstanceRef.current);

      // Simple popup content - just company name and "Se detaljer" button
      const popupContent = `
        <div style="min-width: 180px; padding: 8px; text-align: center;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${installer.companyName}</h3>
          <button onclick="selectInstaller(${installer.id})" 
                  style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
            Se detaljer
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Click event for marker
      marker.on('click', () => {
        handleInstallerSelect(installer);
      });

      markersRef.current.set(installer.id, marker);
    }

    // Fit map to show all markers if we have installers
    if (installers.length > 0) {
      const group = new window.L.featureGroup(Array.from(markersRef.current.values()));
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  };

  const handleInstallerSelect = (installer: Installer) => {
    setSelectedInstaller(installer);
    if (onInstallerSelect) {
      onInstallerSelect(installer);
    }
  };

  // Global function for selecting installer from popup
  useEffect(() => {
    window.selectInstaller = (installerId: number) => {
      const installer = installers.find(i => i.id === installerId);
      if (installer) {
        handleInstallerSelect(installer);
      }
    };
  }, [installers]);

  // Update markers when installers change
  useEffect(() => {
    if (isMapLoaded) {
      updateMarkers();
    }
  }, [installers, isMapLoaded]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Installer Details Sidebar */}
      {selectedInstaller && (
        <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg border p-4 max-h-[calc(100%-2rem)] overflow-y-auto z-[1000]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{selectedInstaller.companyName}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedInstaller(null)}
              className="p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Kontaktperson</p>
              <p className="text-sm text-gray-600">{selectedInstaller.contactPerson}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">Org.nr</p>
              <p className="text-sm text-gray-600">{selectedInstaller.orgNumber}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">Dekker områder</p>
              <p className="text-sm text-gray-600">{selectedInstaller.counties && Array.isArray(selectedInstaller.counties) ? selectedInstaller.counties.join(', ') : 'Ikke spesifisert'}</p>
            </div>
            
            {selectedInstaller.address && (
              <div>
                <p className="text-sm font-medium text-gray-700">Adresse</p>
                <div className="flex items-start space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <div className="text-sm">
                    <div>{selectedInstaller.address}</div>
                    {(selectedInstaller.postalCode || selectedInstaller.city) && (
                      <div>
                        {selectedInstaller.postalCode && selectedInstaller.postalCode} {selectedInstaller.city && selectedInstaller.city}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-2 pt-2">
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => window.open(`tel:${selectedInstaller.phone}`)}
              >
                <Phone className="w-4 h-4 mr-2" />
                Ring {selectedInstaller.phone}
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(`mailto:${selectedInstaller.email}`)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send e-post
              </Button>
              
              {selectedInstaller.website && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(selectedInstaller.website, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Besøk nettside
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Loading overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Laster kart...</p>
          </div>
        </div>
      )}
    </div>
  );
}