import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, MapPin, Mail, Phone, CheckCircle, XCircle, Settings, User, Map, Edit, Key, Trash2, X, Plus, Search, Save, Globe, Clock } from "lucide-react";
import { Navigation } from "@/components/ui/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAllCounties, getMunicipalitiesByCounty, type Kommune } from "@/data/norwegian-locations";
import { PostalCodeInput } from "@/components/postal-code-input";
import { usePostalCodes, useCreatePostalCode, useUpdatePostalCode, useDeletePostalCode } from "@/hooks/use-postal-codes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PostalCode, InsertPostalCode } from "@shared/schema";
import * as XLSX from 'xlsx';

export default function InstallerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
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
    county: "",
    municipality: "",
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
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [newPostalCodeData, setNewPostalCodeData] = useState<InsertPostalCode>({
    postalCode: "",
    postPlace: "",
    municipality: "",
    county: ""
  });

  // Fetch installer profile
  const { data: installer, isLoading: installerLoading } = useQuery({
    queryKey: ["/api/installers/me"],
    enabled: !!user,
  });

  // Fetch service areas
  const { data: serviceAreas, isLoading: areasLoading } = useQuery({
    queryKey: ["/api/service-areas/me"],
    enabled: !!user,
  });

  // Fetch service requests for this installer
  const { data: serviceRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/service-requests/installer"],
    enabled: !!user,
  });

  // Postal Code Management Queries and Mutations
  const { data: postalCodes, isLoading: postalCodesLoading, refetch: refetchPostalCodes } = usePostalCodes();
  const createPostalCodeMutation = useCreatePostalCode();
  const updatePostalCodeMutation = useUpdatePostalCode();
  const deletePostalCodeMutation = useDeletePostalCode();

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/installers/me", data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all installer-related queries for bidirectional sync
      queryClient.invalidateQueries({ queryKey: ["/api/installers/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/installers/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/installers"] });
      setIsEditingProfile(false);
      toast({
        title: "Profil oppdatert",
        description: "Din profil har blitt oppdatert."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Feil",
        description: error.message || "Kunne ikke oppdatere profil",
        variant: "destructive"
      });
    }
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/user/password", data);
      return response.json();
    },
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: "Passord endret",
        description: "Ditt passord har blitt endret."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Feil",
        description: error.message || "Kunne ikke endre passord",
        variant: "destructive"
      });
    }
  });

  // Service areas mutation
  const updateServiceAreasMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/service-areas/me", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-areas/me"] });
      setSelectedCounty("");
      setSelectedMunicipalities([]);
      toast({
        title: "Serviceområder oppdatert",
        description: "Dine serviceområder har blitt oppdatert."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Feil", 
        description: error.message || "Kunne ikke oppdatere serviceområder",
        variant: "destructive"
      });
    }
  });

  // Filter and paginate postal codes
  const filteredPostalCodes = postalCodes?.filter((pc: PostalCode) =>
    pc.postalCode.includes(searchTerm) ||
    pc.postPlace.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pc.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pc.county.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredPostalCodes.length / pageSize);
  const paginatedPostalCodes = filteredPostalCodes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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

  // Export functionality - True Excel format using XLSX library
  const handleExportPostalCodes = () => {
    if (!postalCodes || postalCodes.length === 0) {
      toast({
        title: "Ingen data",
        description: "Ingen postnummer å eksportere",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Prepare data for Excel with headers
      const worksheetData = [
        ['ID', 'Postnummer', 'Poststed', 'Kommune', 'Fylke'],
        ...postalCodes.map((pc: PostalCode) => [
          pc.id,
          pc.postalCode,
          pc.postPlace,
          pc.municipality,
          pc.county
        ])
      ];
      
      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Set column widths for better readability
      worksheet['!cols'] = [
        { width: 8 },   // ID
        { width: 12 },  // Postnummer
        { width: 20 },  // Poststed
        { width: 15 },  // Kommune
        { width: 15 }   // Fylke
      ];
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Postnummer');
      
      // Generate Excel file and download
      const fileName = `postnummer_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast({
        title: "Excel-eksport fullført",
        description: `Eksporterte ${postalCodes.length} postnummer til ${fileName}`,
      });
    } catch (error) {
      toast({
        title: "Eksport feilet",
        description: "Kunne ikke opprette Excel-fil",
        variant: "destructive",
      });
    }
  };

  // Import functionality - Supports both Excel and CSV
  const handleImportPostalCodes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Ugyldig filtype",
        description: "Kun CSV og Excel-filer (.xlsx, .xls) er støttet",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        let importData: any[] = [];

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Handle Excel files using XLSX library
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to array of arrays
          const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (sheetData.length < 2) {
            toast({
              title: "Tom Excel-fil",
              description: "Excel-filen inneholder ingen data",
              variant: "destructive",
            });
            return;
          }

          // Skip header row and process data
          for (let i = 1; i < sheetData.length; i++) {
            const row = sheetData[i] as any[];
            if (row && row.length >= 4) {
              const [id, postalCode, postPlace, municipality, county] = row;
              if (postalCode && postPlace) {
                importData.push({
                  id: id && id !== '' ? parseInt(id) : undefined,
                  postalCode: String(postalCode).trim(),
                  postPlace: String(postPlace).trim(),
                  municipality: String(municipality || '').trim(),
                  county: String(county || '').trim()
                });
              }
            }
          }
        } else {
          // Handle CSV files
          const text = data as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            toast({
              title: "Tom CSV-fil",
              description: "CSV-filen inneholder ingen data",
              variant: "destructive",
            });
            return;
          }

          // Parse CSV format (tab or comma separated)
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const fields = line.includes('\t') ? line.split('\t') : line.split(',');

            if (fields.length >= 4) {
              const [id, postalCode, postPlace, municipality, county] = fields;
              if (postalCode && postPlace) {
                importData.push({
                  id: id && id !== '' ? parseInt(id) : undefined,
                  postalCode: postalCode?.replace(/"/g, '').trim(),
                  postPlace: postPlace?.replace(/"/g, '').trim(),
                  municipality: municipality?.replace(/"/g, '').trim(),
                  county: county?.replace(/"/g, '').trim()
                });
              }
            }
          }
        }

        if (importData.length === 0) {
          toast({
            title: "Ingen gyldig data",
            description: "Fant ingen gyldige postnummer i filen",
            variant: "destructive",
          });
          return;
        }

        // Send import data to backend
        const response = await apiRequest('POST', '/api/postal-codes/import', { data: importData });
        const result = await response.json();
        
        toast({
          title: "Import fullført",
          description: `Importerte ${result.created} nye og oppdaterte ${result.updated} eksisterende postnummer`,
        });
        
        refetchPostalCodes();
        setImportDialogOpen(false);
        
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Import feilet",
          description: "Kunne ikke lese filen. Sjekk format og prøv igjen.",
          variant: "destructive",
        });
      }
    };
    
    // Read as ArrayBuffer for Excel files, as text for CSV
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  // Profile editing handlers
  const handleEditProfile = () => {
    if (installer) {
      setProfileData({
        companyName: (installer as any).companyName || "",
        orgNumber: (installer as any).orgNumber || "",
        contactPerson: (installer as any).contactPerson || "",
        email: (installer as any).email || "",
        phone: (installer as any).phone || "",
        address: (installer as any).address || "",
        postalCode: (installer as any).postalCode || "",
        city: (installer as any).city || "",
        county: (installer as any).county || "",
        municipality: (installer as any).municipality || "",
        website: (installer as any).website || ""
      });
      setIsEditingProfile(true);
    }
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleCancelProfileEdit = () => {
    setIsEditingProfile(false);
    setProfileData({
      companyName: "",
      orgNumber: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      postalCode: "",
      city: "",
      county: "",
      municipality: "",
      website: ""
    });
  };

  // Password change handlers
  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Feil",
        description: "Passordene stemmer ikke overens",
        variant: "destructive"
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Feil",
        description: "Passordet må være minst 6 tegn langt",
        variant: "destructive"
      });
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  // Service areas handlers
  const handleAddServiceArea = () => {
    if (selectedCounty && selectedMunicipalities.length > 0) {
      // Transform municipalities to the format backend expects
      const municipalities = selectedMunicipalities.map(municipality => ({
        county: selectedCounty,
        municipality: municipality
      }));
      
      updateServiceAreasMutation.mutate({
        municipalities: municipalities
      });
    }
  };

  const handleSelectAllMunicipalities = () => {
    if (selectedCounty) {
      const allMunicipalities = getMunicipalitiesByCounty(selectedCounty).map(m => m.kommunenavn);
      setSelectedMunicipalities(allMunicipalities);
    }
  };

  const handleClearAllMunicipalities = () => {
    setSelectedMunicipalities([]);
  };

  if (!user) {
    return null;
  }

  if (authLoading || installerLoading || areasLoading || requestsLoading) {
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
              <CardContent>
                {installer ? (
                  isEditingProfile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Firmanavn</Label>
                          <Input 
                            value={profileData.companyName}
                            onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Organisasjonsnummer</Label>
                          <Input 
                            value={profileData.orgNumber}
                            onChange={(e) => setProfileData({...profileData, orgNumber: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Kontaktperson</Label>
                          <Input 
                            value={profileData.contactPerson}
                            onChange={(e) => setProfileData({...profileData, contactPerson: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>E-post</Label>
                          <Input 
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Telefon</Label>
                          <Input 
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Adresse</Label>
                          <Input 
                            value={profileData.address}
                            onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Postnummer</Label>
                          <Input 
                            value={profileData.postalCode}
                            onChange={(e) => setProfileData({...profileData, postalCode: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Poststed</Label>
                          <Input 
                            value={profileData.city}
                            onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Fylke</Label>
                          <Select 
                            value={profileData.county} 
                            onValueChange={(value) => setProfileData({
                              ...profileData, 
                              county: value,
                              municipality: '' // Reset municipality when county changes
                            })}
                          >
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
                          <Label>Kommune</Label>
                          <Select 
                            value={profileData.municipality} 
                            onValueChange={(value) => setProfileData({
                              ...profileData, 
                              municipality: value
                            })}
                            disabled={!profileData.county}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Velg kommune" />
                            </SelectTrigger>
                            <SelectContent>
                              {profileData.county && getMunicipalitiesByCounty(profileData.county).map((municipality: Kommune) => (
                                <SelectItem key={municipality.kommunenummer} value={municipality.kommunenavn}>
                                  {municipality.kommunenavn}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <Label>Nettside</Label>
                          <Input 
                            value={profileData.website}
                            onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending ? "Lagrer..." : "Lagre"}
                        </Button>
                        <Button variant="outline" onClick={handleCancelProfileEdit}>
                          Avbryt
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Firmanavn</Label>
                        <p className="text-gray-900">{(installer as any)?.companyName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Organisasjonsnummer</Label>
                        <p className="text-gray-900">{(installer as any)?.orgNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Kontaktperson</Label>
                        <p className="text-gray-900">{(installer as any)?.contactPerson}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">E-post</Label>
                        <p className="text-gray-900">{(installer as any)?.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Telefon</Label>
                        <p className="text-gray-900">{(installer as any)?.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Adresse</Label>
                        <p className="text-gray-900">{(installer as any)?.address || 'Ikke oppgitt'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Postnummer og sted</Label>
                        <p className="text-gray-900">{(installer as any)?.postalCode} {(installer as any)?.city}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Fylke</Label>
                        <p className="text-gray-900">{(installer as any)?.county || 'Ikke oppgitt'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Kommune</Label>
                        <p className="text-gray-900">{(installer as any)?.municipality || 'Ikke oppgitt'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Nettside</Label>
                        <p className="text-gray-900">{(installer as any)?.website || 'Ikke oppgitt'}</p>
                      </div>
                      {installer && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Status</Label>
                          <div className="flex gap-2">
                            <Badge variant={(installer as any).approved ? "default" : "secondary"}>
                              {(installer as any).approved ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Godkjent
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Venter på godkjenning
                              </>
                            )}
                          </Badge>
                          <Badge variant={(installer as any).active ? "default" : "destructive"}>
                            {(installer as any).active ? "Aktiv" : "Deaktivert"}
                          </Badge>
                        </div>
                      </div>
                      )}
                    </div>
                  )
                ) : (
                  <p className="text-gray-500">Laster bedriftsinformasjon...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Kontoinnstillinger
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Brukerkonto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Brukernavn</Label>
                      <p className="text-gray-900">{user?.username}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">E-post</Label>
                      <p className="text-gray-900">{user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sikkerhet</h3>
                  {isChangingPassword ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Nåværende passord</Label>
                        <Input 
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Nytt passord</Label>
                        <Input 
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Bekreft nytt passord</Label>
                        <Input 
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleChangePassword} disabled={changePasswordMutation.isPending}>
                          {changePasswordMutation.isPending ? "Endrer..." : "Endre passord"}
                        </Button>
                        <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                          Avbryt
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => setIsChangingPassword(true)}
                      className="flex items-center gap-2"
                    >
                      <Key className="h-4 w-4" />
                      Endre passord
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Areas Tab */}
          <TabsContent value="areas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Serviceområder
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Velg fylker og kommuner hvor du tilbyr tjenester
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {serviceAreas && Array.isArray(serviceAreas) && serviceAreas.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Dine serviceområder</h3>
                    <div className="space-y-2">
                      {/* Remove duplicates by grouping by county */}
                      {serviceAreas.reduce((acc: any[], area: any) => {
                        const existingArea = acc.find(a => a.county === area.county);
                        if (existingArea) {
                          // Merge municipalities
                          const existingMunicipalities = Array.isArray(existingArea.municipalities) 
                            ? existingArea.municipalities 
                            : [existingArea.municipalities];
                          const newMunicipalities = Array.isArray(area.municipalities) 
                            ? area.municipalities 
                            : [area.municipalities];
                          existingArea.municipalities = Array.from(new Set([...existingMunicipalities, ...newMunicipalities]));
                        } else {
                          acc.push(area);
                        }
                        return acc;
                      }, []).map((area: any, index: number) => (
                        <div key={`${area.county}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{area.county}</p>
                            <p className="text-sm text-gray-600">
                              {Array.isArray(area.municipalities) 
                                ? area.municipalities.join(', ')
                                : area.municipalities}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedCounty(area.county);
                              setSelectedMunicipalities(
                                Array.isArray(area.municipalities) 
                                  ? area.municipalities 
                                  : [area.municipalities]
                              );
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen serviceområder</h3>
                    <p className="text-gray-600 mb-4">Du har ikke definert noen serviceområder ennå.</p>
                  </div>
                )}

                {/* Add Service Area Form */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Legg til serviceområde</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Fylke</Label>
                      <Select value={selectedCounty} onValueChange={setSelectedCounty}>
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
                    
                    {selectedCounty && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Kommuner</Label>
                          <div className="flex gap-2">
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
                              onClick={handleClearAllMunicipalities}
                            >
                              Fjern alle
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-3">
                          {getMunicipalitiesByCounty(selectedCounty).map((municipality: Kommune, index: number) => (
                            <label key={`${selectedCounty}-${municipality.kommunenummer}-${index}`} className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={selectedMunicipalities.includes(municipality.kommunenavn)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMunicipalities([...selectedMunicipalities, municipality.kommunenavn]);
                                  } else {
                                    setSelectedMunicipalities(selectedMunicipalities.filter(m => m !== municipality.kommunenavn));
                                  }
                                }}
                                className="rounded"
                              />
                              <span>{municipality.kommunenavn}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleAddServiceArea}
                      disabled={!selectedCounty || selectedMunicipalities.length === 0 || updateServiceAreasMutation.isPending}
                      className="w-full"
                    >
                      {updateServiceAreasMutation.isPending ? "Lagrer..." : "Legg til serviceområde"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Serviceforespørsler
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Forespørsler fra kunder i dine serviceområder
                </p>
              </CardHeader>
              <CardContent>
                {serviceRequests && Array.isArray(serviceRequests) && serviceRequests.length > 0 ? (
                  <div className="space-y-4">
                    {serviceRequests && Array.isArray(serviceRequests) && serviceRequests.map((request: any) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{request.fullName}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {request.municipality}, {request.county}
                            </p>
                            <p className="text-sm text-gray-700 mb-3">{request.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {request.phone}
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {request.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(`tel:${request.phone}`)}
                            >
                              Ring
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => window.open(`mailto:${request.email}`)}
                            >
                              Send e-post
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen forespørsler</h3>
                    <p className="text-gray-600">Du har ingen nye serviceforespørsler.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1); // Reset to first page when searching
                        }}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleExportPostalCodes}
                      className="flex items-center gap-2"
                    >
                      Eksporter til Excel
                    </Button>
                    <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          Importer
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Importer postnummer</DialogTitle>
                          <DialogDescription>
                            Last opp en Excel-fil for å importere postnummer til systemet.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="text-sm text-gray-600">
                            <p>Last opp en Excel-fil med følgende format:</p>
                            <code className="block mt-2 p-2 bg-gray-100 rounded text-xs">
                              ID &nbsp;&nbsp;&nbsp; Postnummer &nbsp;&nbsp;&nbsp; Poststed &nbsp;&nbsp;&nbsp; Kommune &nbsp;&nbsp;&nbsp; Fylke<br/>
                              1 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 0001 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Oslo &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Oslo &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Oslo<br/>
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 0002 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Nytt poststed &nbsp;&nbsp; Ny kommune &nbsp;&nbsp; Nytt fylke
                            </code>
                            <p className="mt-2">
                              • La ID-feltet være tomt for nye postnummer<br/>
                              • Oppgi ID for å oppdatere eksisterende postnummer
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="import-file">Velg Excel-fil</Label>
                            <Input
                              id="import-file"
                              type="file"
                              accept=".csv,.xlsx,.xls"
                              onChange={handleImportPostalCodes}
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
                          <DialogDescription>
                            Registrer et nytt postnummer i systemet.
                          </DialogDescription>
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
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Viser {paginatedPostalCodes.length} av {filteredPostalCodes.length} postnummer 
                        {searchTerm && ` (filtrert fra ${postalCodes?.length || 0} totalt)`}
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="page-size" className="text-sm">Vis per side:</Label>
                        <Select value={pageSize.toString()} onValueChange={(value) => {
                          setPageSize(parseInt(value));
                          setCurrentPage(1);
                        }}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="250">250</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                          {paginatedPostalCodes.map((postalCode: PostalCode) => (
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
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Side {currentPage} av {totalPages}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Forrige
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Neste
                          </Button>
                        </div>
                      </div>
                    )}
                    
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
              <DialogDescription>
                Oppdater informasjonen for dette postnummeret.
              </DialogDescription>
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