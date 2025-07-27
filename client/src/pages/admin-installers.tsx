import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Building, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle,
  Search,
  ArrowLeft,
  Key
} from "lucide-react";
import { Link } from "wouter";
import { PostalCodeInput } from "@/components/postal-code-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllCounties, getMunicipalitiesByCounty, type Kommune } from "@/data/norwegian-locations";

interface Installer {
  id: number;
  userId: number;
  companyName: string;
  orgNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  postalCode?: string;
  city?: string;
  county?: string;
  municipality?: string;
  website?: string;
  approved: boolean;
  active: boolean;
  createdAt: string;
  username?: string;
}

export default function AdminInstallers() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstaller, setSelectedInstaller] = useState<Installer | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Fetch all installers
  const { data: installers, isLoading } = useQuery({
    queryKey: ["/api/installers/all"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  // Update installer mutation
  const updateInstallerMutation = useMutation({
    mutationFn: async ({ installerId, data }: { installerId: number; data: Partial<Installer> }) => {
      await apiRequest("PUT", `/api/installers/${installerId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Oppdatert",
        description: "Installatør ble oppdatert!",
      });
      // Invalidate both admin and installer queries to ensure sync
      queryClient.invalidateQueries({ queryKey: ["/api/installers/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/installers/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/installers"] });
      setEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Feil",
        description: error.message || "Kunne ikke oppdatere installatør.",
        variant: "destructive",
      });
    },
  });

  // Delete installer mutation
  const deleteInstallerMutation = useMutation({
    mutationFn: async (installerId: number) => {
      await apiRequest("DELETE", `/api/installers/${installerId}`);
    },
    onSuccess: () => {
      toast({
        title: "Slettet",
        description: "Installatør ble slettet permanent.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/installers/all"] });
    },
    onError: () => {
      toast({
        title: "Feil",
        description: "Kunne ikke slette installatør.",
        variant: "destructive",
      });
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ installerId, action }: { installerId: number; action: string }) => {
      await apiRequest("POST", `/api/installers/${installerId}/status`, { action });
    },
    onSuccess: () => {
      toast({
        title: "Status endret",
        description: "Installatør status ble oppdatert!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/installers/all"] });
    },
    onError: () => {
      toast({
        title: "Feil",
        description: "Kunne ikke endre status.",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: number; password: string }) => {
      await apiRequest("PUT", `/api/users/${userId}/password`, { password });
    },
    onSuccess: () => {
      toast({
        title: "Passord endret",
        description: "Nytt passord er satt for installatøren!",
      });
      setPasswordDialogOpen(false);
      setNewPassword("");
    },
    onError: () => {
      toast({
        title: "Feil",
        description: "Kunne ikke endre passord.",
        variant: "destructive",
      });
    },
  });

  const filteredInstallers = installers?.filter((installer: Installer) =>
    installer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    installer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    installer.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (installer: Installer) => {
    setSelectedInstaller(installer);
    setEditDialogOpen(true);
  };

  const handleChangePassword = (installer: Installer) => {
    setSelectedInstaller(installer);
    setPasswordDialogOpen(true);
    setNewPassword("");
  };

  const handleSave = () => {
    if (!selectedInstaller) return;
    
    updateInstallerMutation.mutate({
      installerId: selectedInstaller.id,
      data: {
        companyName: selectedInstaller.companyName,
        orgNumber: selectedInstaller.orgNumber,
        contactPerson: selectedInstaller.contactPerson,
        email: selectedInstaller.email,
        phone: selectedInstaller.phone,
        address: selectedInstaller.address,
        postalCode: selectedInstaller.postalCode,
        city: selectedInstaller.city,
        county: selectedInstaller.county,
        municipality: selectedInstaller.municipality,
        website: selectedInstaller.website,
      }
    });
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tilbake til administrasjon
                </Button>
              </Link>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Leverandøradministrasjon</h2>
                <p className="text-muted-foreground">Administrer alle registrerte installatører</p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Building className="text-primary mr-3" />
                Installatører ({filteredInstallers.length})
              </CardTitle>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Søk installatører..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Laster installatører...</p>
              </div>
            ) : filteredInstallers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Firma</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Kontaktperson</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Adresse</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Kontakt</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Handlinger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredInstallers.map((installer: Installer) => (
                      <tr key={installer.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{installer.companyName}</div>
                          <div className="text-xs text-muted-foreground">Org: {installer.orgNumber}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{installer.contactPerson}</td>
                        <td className="px-4 py-3">
                          <div className="text-gray-700">{installer.address || "Ikke oppgitt"}</div>
                          <div className="text-xs text-muted-foreground">
                            {installer.postalCode} {installer.city}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-700">{installer.email}</div>
                          <div className="text-xs text-muted-foreground">{installer.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col space-y-1">
                            <Badge variant={installer.approved ? "default" : "secondary"}>
                              {installer.approved ? "Godkjent" : "Venter"}
                            </Badge>
                            <Badge variant={installer.active ? "default" : "destructive"}>
                              {installer.active ? "Aktiv" : "Deaktivert"}
                            </Badge>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(installer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleChangePassword(installer)}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            {installer.approved ? (
                              <Button
                                size="sm"
                                variant={installer.active ? "destructive" : "default"}
                                onClick={() => toggleStatusMutation.mutate({
                                  installerId: installer.id,
                                  action: installer.active ? "deactivate" : "activate"
                                })}
                              >
                                {installer.active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => toggleStatusMutation.mutate({
                                  installerId: installer.id,
                                  action: "approve"
                                })}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm("Er du sikker på at du vil slette denne installatøren permanent?")) {
                                  deleteInstallerMutation.mutate(installer.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Ingen installatører funnet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rediger installatør</DialogTitle>
            </DialogHeader>
            {selectedInstaller && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Firmanavn</Label>
                  <Input
                    id="companyName"
                    value={selectedInstaller.companyName}
                    onChange={(e) => setSelectedInstaller({
                      ...selectedInstaller,
                      companyName: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="orgNumber">Organisasjonsnummer</Label>
                  <Input
                    id="orgNumber"
                    value={selectedInstaller.orgNumber}
                    onChange={(e) => setSelectedInstaller({
                      ...selectedInstaller,
                      orgNumber: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Kontaktperson</Label>
                  <Input
                    id="contactPerson"
                    value={selectedInstaller.contactPerson}
                    onChange={(e) => setSelectedInstaller({
                      ...selectedInstaller,
                      contactPerson: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-post</Label>
                  <Input
                    id="email"
                    type="email"
                    value={selectedInstaller.email}
                    onChange={(e) => setSelectedInstaller({
                      ...selectedInstaller,
                      email: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={selectedInstaller.phone}
                    onChange={(e) => setSelectedInstaller({
                      ...selectedInstaller,
                      phone: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={selectedInstaller.address || ''}
                    onChange={(e) => setSelectedInstaller({
                      ...selectedInstaller,
                      address: e.target.value
                    })}
                  />
                </div>
                <PostalCodeInput
                  postalCodeValue={selectedInstaller.postalCode || ''}
                  cityValue={selectedInstaller.city || ''}
                  onPostalCodeChange={(value) => setSelectedInstaller({
                    ...selectedInstaller,
                    postalCode: value
                  })}
                  onCityChange={(value) => setSelectedInstaller({
                    ...selectedInstaller,
                    city: value
                  })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="county">Fylke</Label>
                    <Select 
                      value={selectedInstaller.county || ''} 
                      onValueChange={(value) => setSelectedInstaller({
                        ...selectedInstaller,
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
                    <Label htmlFor="municipality">Kommune</Label>
                    <Select 
                      value={selectedInstaller.municipality || ''} 
                      onValueChange={(value) => setSelectedInstaller({
                        ...selectedInstaller,
                        municipality: value
                      })}
                      disabled={!selectedInstaller.county}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Velg kommune" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedInstaller.county && getMunicipalitiesByCounty(selectedInstaller.county).map((municipality: Kommune) => (
                          <SelectItem key={municipality.kommunenummer} value={municipality.kommunenavn}>
                            {municipality.kommunenavn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Nettside</Label>
                  <Input
                    id="website"
                    value={selectedInstaller.website || ''}
                    onChange={(e) => setSelectedInstaller({
                      ...selectedInstaller,
                      website: e.target.value
                    })}
                    placeholder="https://www.firmanavn.no"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Avbryt
                  </Button>
                  <Button onClick={handleSave} disabled={updateInstallerMutation.isPending}>
                    {updateInstallerMutation.isPending ? "Lagrer..." : "Lagre"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Password Change Dialog */}
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Endre passord for {selectedInstaller?.contactPerson}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword">Nytt passord</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Skriv inn nytt passord"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                  Avbryt
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedInstaller && newPassword.trim()) {
                      changePasswordMutation.mutate({
                        userId: selectedInstaller.userId,
                        password: newPassword
                      });
                    }
                  }}
                  disabled={changePasswordMutation.isPending || !newPassword.trim()}
                >
                  {changePasswordMutation.isPending ? "Endrer..." : "Endre passord"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}