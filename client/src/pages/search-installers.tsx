import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Thermometer, ArrowLeft, Search, Phone, Mail, MapPin, Star, Globe, User, List, Map } from "lucide-react";
import { getAllCounties, getMunicipalitiesByCounty, type Kommune } from "@/data/norwegian-locations";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import InstallerMap from "@/components/map/installer-map";

export default function SearchInstallers() {
  const { toast } = useToast();
  const [searchData, setSearchData] = useState({
    county: "",
    municipality: ""
  });
  const [installers, setInstallers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInstaller, setSelectedInstaller] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const selectedCountyMunicipalities: Kommune[] = searchData.county 
    ? getMunicipalitiesByCounty(searchData.county) 
    : [];

  const searchMutation = useMutation({
    mutationFn: async (data: typeof searchData) => {
      setIsLoading(true);
      // Search by municipality if selected, otherwise search by county
      const endpoint = data.municipality 
        ? `/api/installers/municipality/${encodeURIComponent(data.municipality)}`
        : `/api/installers/county/${encodeURIComponent(data.county)}`;
      const response = await apiRequest("GET", endpoint);
      return response.json();
    },
    onSuccess: (data) => {
      setInstallers(data);
      setIsLoading(false);
      if (data.length === 0) {
        const location = searchData.municipality || searchData.county;
        toast({
          title: "Ingen installatører funnet",
          description: `Fant ingen aktive installatører i ${location}.`,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      setIsLoading(false);
      toast({
        title: "Feil",
        description: "Kunne ikke søke etter installatører. Prøv igjen.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchData.county) {
      toast({
        title: "Manglende informasjon",
        description: "Velg fylke for å søke.",
        variant: "destructive",
      });
      return;
    }
    searchMutation.mutate(searchData);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tilbake
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <Thermometer className="text-blue-600 text-2xl" />
              <h1 className="text-xl font-bold text-gray-900">Varmepumpetilsynet</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Search className="w-6 h-6 mr-2" />
              Søk etter installatører
            </CardTitle>
            <p className="text-gray-600">Velg ditt område for å finne kvalifiserte varmepumpe-installatører</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="county">Fylke *</Label>
                  <Select 
                    value={searchData.county} 
                    onValueChange={(value) => setSearchData({county: value, municipality: ''})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Velg fylke" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAllCounties().map((county, index) => (
                        <SelectItem key={`county-${county}-${index}`} value={county}>
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="municipality">Kommune (valgfritt)</Label>
                  <Select 
                    value={searchData.municipality} 
                    onValueChange={(value) => setSearchData({...searchData, municipality: value})}
                    disabled={!searchData.county}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Velg kommune for mer spesifikt søk" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCountyMunicipalities.map((municipality: Kommune, index: number) => (
                        <SelectItem key={`municipality-${municipality.kommunenummer || municipality.kommunenavn}-${index}`} value={municipality.kommunenavn}>
                          {municipality.kommunenavn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? "Søker..." : "Søk installatører"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results with Map/List Toggle */}
        {installers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Installatører i {searchData.municipality || searchData.county}
              </CardTitle>
              <p className="text-gray-600">
                Fant {installers.length} installatør{installers.length > 1 ? 'er' : ''} i ditt område
              </p>
            </CardHeader>
            <CardContent>
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "map")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="list" className="flex items-center space-x-2">
                    <List className="w-4 h-4" />
                    <span>Liste</span>
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center space-x-2">
                    <Map className="w-4 h-4" />
                    <span>Kart</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-0">
                  <div className="space-y-4">
                    {installers.map((installer: any, index: number) => (
                      <div key={`installer-${installer.id}-${index}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{installer.companyName}</h3>
                            <p className="text-sm text-gray-600">Org.nr: {installer.orgNumber}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{installer.rating || '4.5'}</span>
                            <span className="text-sm text-gray-500">({installer.totalServices || 0} oppdrag)</span>
                          </div>
                        </div>
                        
                        {installer.address && (
                          <div className="flex items-center space-x-2 text-gray-600 mb-4">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{installer.address}</span>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                            onClick={() => window.open(`tel:${installer.phone}`)}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Ring {installer.phone}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => window.open(`mailto:${installer.email}`)}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Send e-post
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="map" className="mt-0">
                  <div className="h-[600px] w-full border rounded-lg overflow-hidden">
                    <InstallerMap 
                      installers={installers}
                      onInstallerSelect={(installer) => setSelectedInstaller(installer)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}


      </main>
    </div>
  );
}