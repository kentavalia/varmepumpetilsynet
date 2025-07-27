import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, MapPin, Mail, Phone, CheckCircle, XCircle, Settings, User, Map, Edit, Key, Trash2, X, Plus, Search } from "lucide-react";
import { Navigation } from "@/components/ui/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAllCounties, getMunicipalitiesByCounty, type Kommune } from "@/data/norwegian-locations";
import { PostalCodeInput } from "@/components/postal-code-input";
import { usePostalCodes, useCreatePostalCode, useUpdatePostalCode, useDeletePostalCode } from "@/hooks/use-postal-codes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PostalCode, InsertPostalCode } from "@shared/schema";

export default function InstallerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<string[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    companyName: "",
    orgNumber: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
    website: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Postal Code Management State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPostalCode, setSelectedPostalCode] = useState<PostalCode | null>(null);
  const [postalEditDialogOpen, setPostalEditDialogOpen] = useState(false);
  const [postalCreateDialogOpen, setPostalCreateDialogOpen] = useState(false);
  const [newPostalCodeData, setNewPostalCodeData] = useState<InsertPostalCode>({
    postalCode: "",
    postPlace: "",
    municipality: "",
    county: ""
  });

  // Fetch installer profile
  const { data: installer, isLoading: installerLoading } = useQuery({
    queryKey: ["/api/installers/me"],
    enabled: isAuthenticated && user?.role === 'installer',
  });

  // Fetch service areas
  const { data: serviceAreas, isLoading: areasLoading } = useQuery({
    queryKey: ["/api/service-areas/me"],
    enabled: isAuthenticated && user?.role === 'installer',
  });

  // Fetch service requests for this installer
  const { data: serviceRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/service-requests/installer"],
    enabled: isAuthenticated && user?.role === 'installer',
  });

  // Postal Code Management Queries and Mutations
  const { data: postalCodes, isLoading: postalCodesLoading, refetch: refetchPostalCodes } = usePostalCodes();
  const createPostalCodeMutation = useCreatePostalCode();
  const updatePostalCodeMutation = useUpdatePostalCode();
  const deletePostalCodeMutation = useDeletePostalCode();

  // Update service areas mutation
  const updateServiceAreasMutation = useMutation({
    mutationFn: async (serviceAreasData: any[]) => {
      await apiRequest("POST", "/api/service-areas", { serviceAreas: serviceAreasData });
    },
    onSuccess: () => {
      toast({
        title: "Suksess",
        description: "Serviceområder lagt til!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-areas/me"] });
      // Reset form after successful save
      setSelectedCounty("");
      setSelectedMunicipalities([]);
    },
    onError: () => {
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere serviceområder",
        variant: "destructive",
      });
    },
  });

  // Delete service area mutation
  const deleteServiceAreaMutation = useMutation({
    mutationFn: async (serviceAreaId: number) => {
      await apiRequest("DELETE", `/api/service-areas/${serviceAreaId}`);
    },
    onSuccess: () => {
      toast({
        title: "Suksess",
        description: "Serviceområde fjernet!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-areas/me"] });
    },
    onError: () => {
      toast({
        title: "Feil",
        description: "Kunne ikke fjerne serviceområde",
        variant: "destructive",
      });
    },
  });

  // Update installer profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/installers/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Suksess",
        description: "Bedriftsinformasjon oppdatert!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/installers/me"] });
      setIsEditingProfile(false);
    },
    onError: (error: any) => {
      toast({
        title: "Feil",
        description: error.message || "Kunne ikke oppdatere bedriftsinformasjon",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/user/change-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Suksess",
        description: "Passord endret!",
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsChangingPassword(false);
    },
    onError: (error: any) => {
      toast({
        title: "Feil",
        description: error.message || "Kunne ikke endre passord",
        variant: "destructive",
      });
    },
  });

  const selectedCountyMunicipalities: Kommune[] = selectedCounty 
    ? getMunicipalitiesByCounty(selectedCounty) 
    : [];

  const handleCountyChange = (county: string) => {
    setSelectedCounty(county);
    setSelectedMunicipalities([]);
  };

  const handleMunicipalityToggle = (municipality: string) => {
    setSelectedMunicipalities(prev => 
      prev.includes(municipality) 
        ? prev.filter(m => m !== municipality)
        : [...prev, municipality]
    );
  };

  const handleSelectAllMunicipalities = () => {
    const allMunicipalities = selectedCountyMunicipalities.map(m => m.kommunenavn);
    setSelectedMunicipalities(allMunicipalities);
  };

  const handleDeselectAllMunicipalities = () => {
    setSelectedMunicipalities([]);
  };

  const handleSaveServiceAreas = () => {
    if (!selectedCounty || selectedMunicipalities.length === 0) {
      toast({
        title: "Manglende informasjon",
        description: "Velg fylke og minst én kommune",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates
    const existingCombinations = new Set(
      serviceAreas?.map((area: any) => `${area.county}-${area.municipality}`) || []
    );
    
    const newMunicipalities = selectedMunicipalities.filter(municipality => 
      !existingCombinations.has(`${selectedCounty}-${municipality}`)
    );

    if (newMunicipalities.length === 0) {
      toast({
        title: "Allerede registrert",
        description: "Alle valgte kommuner er allerede registrert som serviceområder",
        variant: "destructive",
      });
      return;
    }

    const serviceAreasData = newMunicipalities.map(municipality => ({
      county: selectedCounty,
      municipality: municipality,
    }));

    updateServiceAreasMutation.mutate(serviceAreasData);
  };

  const handleEditProfile = () => {
    if (installer) {
      setProfileData({
        companyName: installer.companyName || "",
        orgNumber: installer.orgNumber || "",
        contactPerson: installer.contactPerson || "",
        email: installer.email || "",
        phone: installer.phone || "",
        address: installer.address || "",
        postalCode: installer.postalCode || "",
        city: installer.city || "",
        website: installer.website || ""
      });
      setIsEditingProfile(true);
    }
  };

  const handleSaveProfile = () => {
    if (!profileData.companyName || !profileData.orgNumber || !profileData.contactPerson || !profileData.email || !profileData.phone) {
      toast({
        title: "Manglende informasjon",
        description: "Alle felt må fylles ut",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation.mutate(profileData);
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Manglende informasjon",
        description: "Alle felt må fylles ut",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passord matcher ikke",
        description: "Nytt passord og bekreft passord må være like",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 3) {
      toast({
        title: "Passord for kort",
        description: "Passord må være minst 3 tegn",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  // Postal Code Management Handlers
  const handleCreatePostalCode = () => {
    if (!newPostalCodeData.postalCode || !newPostalCodeData.postPlace || !newPostalCodeData.municipality || !newPostalCodeData.county) {
      toast({
        title: "Manglende informasjon",
        description: "Alle felt må fylles ut",
        variant: "destructive",
      });
      return;
    }

    createPostalCodeMutation.mutate(newPostalCodeData, {
      onSuccess: () => {
        toast({
          title: "Suksess",
          description: "Postnummer opprettet!",
        });
        setNewPostalCodeData({
          postalCode: "",
          postPlace: "",
          municipality: "",
          county: ""
        });
        setPostalCreateDialogOpen(false);
        refetchPostalCodes();
      },
      onError: (error: any) => {
        toast({
          title: "Feil",
          description: error.message || "Kunne ikke opprette postnummer",
          variant: "destructive",
        });
      }
    });
  };

  const handleUpdatePostalCode = () => {
    if (!selectedPostalCode) return;

    updatePostalCodeMutation.mutate({
      id: selectedPostalCode.id,
      data: selectedPostalCode
    }, {
      onSuccess: () => {
        toast({
          title: "Suksess",
          description: "Postnummer oppdatert!",
        });
        setPostalEditDialogOpen(false);
        setSelectedPostalCode(null);
        refetchPostalCodes();
      },
      onError: (error: any) => {
        toast({
          title: "Feil",
          description: error.message || "Kunne ikke oppdatere postnummer",
          variant: "destructive",
        });
      }
    });
  };

  const handleDeletePostalCode = (postalCode: PostalCode) => {
    if (confirm(`Er du sikker på at du vil slette postnummer ${postalCode.postalCode} - ${postalCode.postPlace}?`)) {
      deletePostalCodeMutation.mutate(postalCode.id, {
        onSuccess: () => {
          toast({
            title: "Suksess",
            description: "Postnummer slettet!",
          });
          refetchPostalCodes();
        },
        onError: (error: any) => {
          toast({
            title: "Feil",
            description: error.message || "Kunne ikke slette postnummer",
            variant: "destructive",
          });
        }
      });
    }
  };

  // Filter postal codes based on search term
  const filteredPostalCodes = postalCodes?.filter((pc: PostalCode) =>
    pc.postalCode.includes(searchTerm) ||
    pc.postPlace.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pc.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pc.county.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!isAuthenticated || user?.role !== 'installer') {
    return null;
  }

  if (installerLoading || areasLoading || requestsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Installatør Portal</h1>
          <p className="text-gray-600">Administrer din profil og serviceområder</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600 font-medium">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600 font-medium">
              <Settings className="h-4 w-4" />
              Konto
            </TabsTrigger>
            <TabsTrigger value="areas" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600 font-medium">
              <Map className="h-4 w-4" />
              Serviceområder
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600 font-medium">
              <Mail className="h-4 w-4" />
              Forespørsler
            </TabsTrigger>
            <TabsTrigger value="postal-codes" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600 font-medium">
              <MapPin className="h-4 w-4" />
              Postnummer
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Bedriftsinformasjon
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleEditProfile}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Rediger
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {installer && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Bedriftsnavn</Label>
                        <p className="mt-1 p-3 bg-gray-50 rounded-md">{installer.companyName}</p>
                      </div>
                      <div>
                        <Label>Organisasjonsnummer</Label>
                        <p className="mt-1 p-3 bg-gray-50 rounded-md">{installer.orgNumber}</p>
                      </div>
                      <div>
                        <Label>Kontaktperson</Label>
                        <p className="mt-1 p-3 bg-gray-50 rounded-md">{installer.contactPerson}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>E-post</Label>
                        <p className="mt-1 p-3 bg-gray-50 rounded-md">{installer.email}</p>
                      </div>
                      <div>
                        <Label>Telefon</Label>
                        <p className="mt-1 p-3 bg-gray-50 rounded-md">{installer.phone}</p>
                      </div>
                      <div>
                        <Label>Adresse</Label>
                        <p className="mt-1 p-3 bg-gray-50 rounded-md">{installer.address || "Ikke oppgitt"}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Postnummer</Label>
                          <p className="mt-1 p-3 bg-gray-50 rounded-md">{installer.postalCode || "Ikke oppgitt"}</p>
                        </div>
                        <div>
                          <Label>Poststed</Label>
                          <p className="mt-1 p-3 bg-gray-50 rounded-md">{installer.city || "Ikke oppgitt"}</p>
                        </div>
                      </div>
                      <div>
                        <Label>Nettside</Label>
                        <p className="mt-1 p-3 bg-gray-50 rounded-md">{installer.website || "Ikke oppgitt"}</p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="mt-1 flex gap-2">
                          <Badge variant={installer.approved ? "default" : "secondary"}>
                            {installer.approved ? "Godkjent" : "Venter godkjenning"}
                          </Badge>
                          <Badge variant={installer.active ? "default" : "destructive"}>
                            {installer.active ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Brukerkonto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Brukernavn</Label>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md">{user?.username}</p>
                  </div>
                  <div>
                    <Label>E-postadresse</Label>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md">{user?.email}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={() => setIsChangingPassword(true)}
                      className="flex items-center gap-2"
                    >
                      <Key className="h-4 w-4" />
                      Endre passord
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Service Areas Tab */}
          <TabsContent value="areas">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Current Service Areas */}
              <Card>
                <CardHeader>
                  <CardTitle>Nåværende serviceområder</CardTitle>
                </CardHeader>
                <CardContent>
                  {serviceAreas && serviceAreas.length > 0 ? (
                    <div className="space-y-2">
                      {serviceAreas.map((area: any, index: number) => (
                        <div key={area.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">
                            <MapPin className="inline h-4 w-4 mr-1" />
                            {area.municipality}, {area.county}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteServiceAreaMutation.mutate(area.id)}
                            disabled={deleteServiceAreaMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Ingen serviceområder registrert</p>
                  )}
                </CardContent>
              </Card>

              {/* Add Service Areas */}
              <Card>
                <CardHeader>
                  <CardTitle>Legg til serviceområder</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Fylke</Label>
                    <Select value={selectedCounty} onValueChange={handleCountyChange}>
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

                  {selectedCounty && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Kommuner</Label>
                        <div className="space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAllMunicipalities}
                          >
                            Velg alle
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleDeselectAllMunicipalities}
                          >
                            Fjern alle
                          </Button>
                        </div>
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-1">
                        {selectedCountyMunicipalities.map((municipality: Kommune, index: number) => (
                          <div key={`municipality-${municipality.kommunenummer}-${index}`} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`municipality-${municipality.kommunenummer}-${index}`}
                              checked={selectedMunicipalities.includes(municipality.kommunenavn)}
                              onChange={() => handleMunicipalityToggle(municipality.kommunenavn)}
                              className="rounded"
                            />
                            <label 
                              htmlFor={`municipality-${municipality.kommunenummer}-${index}`}
                              className="text-sm cursor-pointer"
                            >
                              {municipality.kommunenavn}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleSaveServiceAreas}
                    disabled={updateServiceAreasMutation.isPending || !selectedCounty || selectedMunicipalities.length === 0}
                    className="w-full"
                  >
                    {updateServiceAreasMutation.isPending ? "Lagrer..." : "Lagre serviceområder"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Service Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Serviceforespørsler i ditt område</CardTitle>
                <p className="text-sm text-gray-600">
                  Forespørsler fra kunder i dine serviceområder
                </p>
              </CardHeader>
              <CardContent>
                {serviceRequests && serviceRequests.length > 0 ? (
                  <div className="space-y-4">
                    {serviceRequests.map((request: any) => (
                      <div key={request.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{request.fullName}</h3>
                          <Badge variant="secondary">{request.municipality}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><Mail className="inline h-4 w-4 mr-1" />{request.email}</p>
                          <p><Phone className="inline h-4 w-4 mr-1" />{request.phone}</p>
                          <p><MapPin className="inline h-4 w-4 mr-1" />{request.address}</p>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm"><strong>Varmepumpe:</strong> {request.heatPumpBrand} {request.heatPumpModel}</p>
                          <p className="text-sm"><strong>Service type:</strong> {request.serviceType}</p>
                          {request.description && (
                            <p className="text-sm"><strong>Beskrivelse:</strong> {request.description}</p>
                          )}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" asChild>
                            <a href={`mailto:${request.email}`}>
                              Send e-post
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a href={`tel:${request.phone}`}>
                              Ring kunde
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Ingen serviceforespørsler funnet i ditt område</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Rediger bedriftsinformasjon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Bedriftsnavn *</Label>
                    <Input
                      id="companyName"
                      value={profileData.companyName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Bedriftsnavn"
                    />
                  </div>
                  <div>
                    <Label htmlFor="orgNumber">Organisasjonsnummer *</Label>
                    <Input
                      id="orgNumber"
                      value={profileData.orgNumber}
                      onChange={(e) => setProfileData(prev => ({ ...prev, orgNumber: e.target.value }))}
                      placeholder="123456789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">Kontaktperson *</Label>
                    <Input
                      id="contactPerson"
                      value={profileData.contactPerson}
                      onChange={(e) => setProfileData(prev => ({ ...prev, contactPerson: e.target.value }))}
                      placeholder="Fornavn Etternavn"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">E-post *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="post@bedrift.no"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon *</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="12345678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Gateadresse 123"
                    />
                  </div>
                </div>
              </div>
              
              <PostalCodeInput
                postalCodeValue={profileData.postalCode}
                cityValue={profileData.city}
                onPostalCodeChange={(value) => setProfileData(prev => ({ ...prev, postalCode: value }))}
                onCityChange={(value) => setProfileData(prev => ({ ...prev, city: value }))}
              />
              
              <div>
                <Label htmlFor="website">Nettside</Label>
                <Input
                  id="website"
                  value={profileData.website}
                  onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.bedrift.no"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                Avbryt
              </Button>
              <Button 
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Lagrer..." : "Lagre endringer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Endre passord</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Nåværende passord *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Skriv inn nåværende passord"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Nytt passord *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Skriv inn nytt passord"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Bekreft nytt passord *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Bekreft nytt passord"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                Avbryt
              </Button>
              <Button 
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? "Endrer..." : "Endre passord"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

          {/* Postal Code Management Tab */}
          <TabsContent value="postal-codes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Postnummer Administrasjon
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Søk postnummer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Dialog open={postalCreateDialogOpen} onOpenChange={setPostalCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Nytt postnummer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Opprett nytt postnummer</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="new-postal-code">Postnummer *</Label>
                          <Input
                            id="new-postal-code"
                            value={newPostalCodeData.postalCode}
                            onChange={(e) => setNewPostalCodeData(prev => ({ ...prev, postalCode: e.target.value }))}
                            placeholder="0000"
                            maxLength={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-post-place">Poststed *</Label>
                          <Input
                            id="new-post-place"
                            value={newPostalCodeData.postPlace}
                            onChange={(e) => setNewPostalCodeData(prev => ({ ...prev, postPlace: e.target.value }))}
                            placeholder="Stedsnavn"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-municipality">Kommune *</Label>
                          <Input
                            id="new-municipality"
                            value={newPostalCodeData.municipality}
                            onChange={(e) => setNewPostalCodeData(prev => ({ ...prev, municipality: e.target.value }))}
                            placeholder="Kommunenavn"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-county">Fylke *</Label>
                          <Input
                            id="new-county"
                            value={newPostalCodeData.county}
                            onChange={(e) => setNewPostalCodeData(prev => ({ ...prev, county: e.target.value }))}
                            placeholder="Fylkesnavn"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setPostalCreateDialogOpen(false)}>
                          Avbryt
                        </Button>
                        <Button 
                          onClick={handleCreatePostalCode}
                          disabled={createPostalCodeMutation.isPending}
                        >
                          {createPostalCodeMutation.isPending ? "Oppretter..." : "Opprett"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {postalCodesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-4 text-gray-600">Laster postnummer...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Viser {filteredPostalCodes.length} av {postalCodes?.length || 0} postnummer
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Postnummer</TableHead>
                          <TableHead>Poststed</TableHead>
                          <TableHead>Kommune</TableHead>
                          <TableHead>Fylke</TableHead>
                          <TableHead className="text-right">Handlinger</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPostalCodes.map((postalCode: PostalCode) => (
                          <TableRow key={postalCode.id}>
                            <TableCell className="font-mono">{postalCode.postalCode}</TableCell>
                            <TableCell>{postalCode.postPlace}</TableCell>
                            <TableCell>{postalCode.municipality}</TableCell>
                            <TableCell>{postalCode.county}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPostalCode(postalCode);
                                    setPostalEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeletePostalCode(postalCode)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {filteredPostalCodes.length === 0 && searchTerm && (
                    <div className="text-center py-8 text-gray-500">
                      Ingen postnummer funnet for "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>
        </Tabs>

        {/* Postal Code Edit Dialog */}
        <Dialog open={postalEditDialogOpen} onOpenChange={setPostalEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rediger postnummer</DialogTitle>
            </DialogHeader>
            {selectedPostalCode && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-postal-code">Postnummer *</Label>
                  <Input
                    id="edit-postal-code"
                    value={selectedPostalCode.postalCode}
                    onChange={(e) => setSelectedPostalCode(prev => prev ? { ...prev, postalCode: e.target.value } : null)}
                    placeholder="0000"
                    maxLength={4}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-post-place">Poststed *</Label>
                  <Input
                    id="edit-post-place"
                    value={selectedPostalCode.postPlace}
                    onChange={(e) => setSelectedPostalCode(prev => prev ? { ...prev, postPlace: e.target.value } : null)}
                    placeholder="Stedsnavn"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-municipality">Kommune *</Label>
                  <Input
                    id="edit-municipality"
                    value={selectedPostalCode.municipality}
                    onChange={(e) => setSelectedPostalCode(prev => prev ? { ...prev, municipality: e.target.value } : null)}
                    placeholder="Kommunenavn"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-county">Fylke *</Label>
                  <Input
                    id="edit-county"
                    value={selectedPostalCode.county}
                    onChange={(e) => setSelectedPostalCode(prev => prev ? { ...prev, county: e.target.value } : null)}
                    placeholder="Fylkesnavn"
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setPostalEditDialogOpen(false)}>
                Avbryt
              </Button>
              <Button 
                onClick={handleUpdatePostalCode}
                disabled={updatePostalCodeMutation.isPending}
              >
                {updatePostalCodeMutation.isPending ? "Lagrer..." : "Lagre endringer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}