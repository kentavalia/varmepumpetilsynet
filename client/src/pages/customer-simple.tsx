import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Thermometer, ArrowLeft, CheckCircle, Phone, Mail, MapPin, Star, List, Map } from "lucide-react";
import { getAllCounties, getMunicipalitiesByCounty, type Kommune } from "@/data/norwegian-locations";
import { PostalCodeInput } from "@/components/postal-code-input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import InstallerMap from "@/components/map/installer-map";

export default function CustomerSimple() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [availableInstallers, setAvailableInstallers] = useState([]);
  const [installersLoading, setInstallersLoading] = useState(false);
  const [installersLoaded, setInstallersLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
    county: "",
    municipality: "",
    heatPumpBrand: "",
    heatPumpModel: "",
    serviceType: "maintenance",
    description: "",
    preferredContactTime: "anytime"
  });

  const selectedCountyMunicipalities: Kommune[] = formData.county 
    ? getMunicipalitiesByCounty(formData.county) 
    : [];

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/service-requests", data);
    },
    onSuccess: async () => {
      setSubmitted(true);
      setInstallersLoading(true);
      
      // Fetch available installers in the customer's municipality
      try {
        const response = await apiRequest("GET", `/api/installers/municipality/${encodeURIComponent(formData.municipality)}`);
        const installers = await response.json();
        setAvailableInstallers(installers);
      } catch (error) {
        console.error("Error fetching installers:", error);
        setAvailableInstallers([]);
      } finally {
        setInstallersLoading(false);
        setInstallersLoaded(true);
      }
      
      toast({
        title: "Serviceforespørsel sendt!",
        description: "Installatører i ditt område vil kontakte deg snart.",
      });
    },
    onError: () => {
      toast({
        title: "Feil",
        description: "Kunne ikke sende forespørsel. Prøv igjen.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.county || !formData.municipality) {
      toast({
        title: "Manglende informasjon",
        description: "Velg fylke og kommune.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate(formData);
  };

  if (submitted) {
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
          {/* Success Message */}
          <Card className="mb-8">
            <CardContent className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Forespørsel sendt!</h2>
              <p className="text-gray-600 mb-6">
                Din serviceforespørsel er registrert. Installatører i {formData.municipality} vil kontakte deg direkte.
              </p>
            </CardContent>
          </Card>

          {/* Available Installers with Map/List Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Tilgjengelige installatører i {formData.municipality}</CardTitle>
              <p className="text-gray-600">
                {installersLoading 
                  ? 'Laster installatører...'
                  : availableInstallers.length > 0 
                    ? `${availableInstallers.length} installatør${availableInstallers.length > 1 ? 'er' : ''} dekker ditt område`
                    : installersLoaded 
                      ? 'Ingen installatører funnet i ditt område'
                      : 'Laster installatører...'
                }
              </p>
            </CardHeader>
            <CardContent>
              {installersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Laster installatører i ditt område...</p>
                </div>
              ) : availableInstallers.length > 0 ? (
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
                      {availableInstallers.map((installer: any, index: number) => (
                        <div key={`available-installer-${installer.id}-${index}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span className="text-sm">{installer.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span className="text-sm">{installer.email}</span>
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
                              className="flex-1"
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
                    <div className="h-[500px] w-full border rounded-lg overflow-hidden">
                      <InstallerMap installers={availableInstallers} />
                    </div>
                  </TabsContent>
                </Tabs>
              ) : installersLoaded ? (
                <div className="text-center py-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-600 mb-4">
                      Ingen installatører funnet i {formData.municipality}.
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Prøv å søke i hele fylket eller kontakt oss for hjelp.
                    </p>
                    <Link href="/search">
                      <Button variant="outline" size="sm">
                        Søk i hele fylket
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Laster installatører i ditt område...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Link href="/">
              <Button variant="outline">Tilbake til hovedsiden</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

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

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Registrer servicebehov</CardTitle>
            <p className="text-gray-600">Fyll ut skjemaet så kontakter installatører deg direkte</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Navn *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>

              <PostalCodeInput
                postalCodeValue={formData.postalCode}
                cityValue={formData.city}
                onPostalCodeChange={(value) => setFormData({...formData, postalCode: value})}
                onCityChange={(value) => setFormData({...formData, city: value})}
                postalCodeLabel="Postnummer"
                cityLabel="Sted"
              />

              {/* Location */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="county">Fylke *</Label>
                  <Select value={formData.county} onValueChange={(value) => setFormData({...formData, county: value, municipality: ""})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg fylke" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAllCounties().map((county) => (
                        <SelectItem key={county} value={county}>
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="municipality">Kommune *</Label>
                  <Select value={formData.municipality} onValueChange={(value) => setFormData({...formData, municipality: value})} disabled={!formData.county}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg kommune" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCountyMunicipalities.map((municipality) => (
                        <SelectItem key={municipality.kommunenavn} value={municipality.kommunenavn}>
                          {municipality.kommunenavn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Heat Pump Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="heatPumpBrand">Varmepumpe merke</Label>
                  <Input
                    id="heatPumpBrand"
                    value={formData.heatPumpBrand}
                    onChange={(e) => setFormData({...formData, heatPumpBrand: e.target.value})}
                    placeholder="F.eks: Mitsubishi, Panasonic, Fujitsu..."
                  />
                </div>
                <div>
                  <Label htmlFor="heatPumpModel">Modell</Label>
                  <Input
                    id="heatPumpModel"
                    value={formData.heatPumpModel}
                    onChange={(e) => setFormData({...formData, heatPumpModel: e.target.value})}
                    placeholder="F.eks: MSZ-LN35VG"
                  />
                </div>
              </div>

              {/* Service Details */}
              <div>
                <Label htmlFor="serviceType">Type service</Label>
                <Select value={formData.serviceType} onValueChange={(value) => setFormData({...formData, serviceType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Vedlikehold/service</SelectItem>
                    <SelectItem value="repair">Reparasjon</SelectItem>
                    <SelectItem value="installation">Installasjon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Beskriv servicebehovet</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="F.eks: Varmepumpa lager rare lyder, varmer ikke skikkelig, trenger årlig service..."
                />
              </div>

              <div>
                <Label htmlFor="preferredContactTime">Når passer det å bli kontaktet?</Label>
                <Select value={formData.preferredContactTime} onValueChange={(value) => setFormData({...formData, preferredContactTime: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anytime">Når som helst</SelectItem>
                    <SelectItem value="morning">Formiddag (08-12)</SelectItem>
                    <SelectItem value="afternoon">Ettermiddag (12-17)</SelectItem>
                    <SelectItem value="evening">Kveld (17-20)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? "Sender..." : "Send serviceforespørsel"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}