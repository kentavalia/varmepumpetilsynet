import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/ui/navigation";
import StatsCard from "@/components/ui/stats-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Settings, 
  TrendingUp, 
  Clock, 
  Check, 
  X,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllCounties, getMunicipalitiesByCounty, type Kommune } from "@/data/norwegian-locations";
import AdminSettings from "./admin-settings";

interface AdminStats {
  totalCustomers: number;
  activeInstallers: number;
  pendingApprovals: number;
  monthlyRevenue: number;
}

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInstaller, setSelectedInstaller] = useState<any>(null);
  const [isInstallerDialogOpen, setIsInstallerDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      window.location.href = "/auth";
    }
  }, [isAuthenticated, isLoading, user?.role]);

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Fetch service requests
  const { data: serviceRequests, isLoading: serviceRequestsLoading } = useQuery({
    queryKey: ["/api/service-requests"],
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Fetch all installers
  const { data: installers, isLoading: installersLoading } = useQuery({
    queryKey: ["/api/installers/all"],
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Approve installer mutation
  const approveInstallerMutation = useMutation({
    mutationFn: async (installerId: number) => {
      await apiRequest("POST", `/api/installers/${installerId}/approve`);
    },
    onSuccess: () => {
      toast({
        title: "Suksess",
        description: "Installatør godkjent!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/installers/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Feil",
        description: "Kunne ikke godkjenne installatør.",
        variant: "destructive",
      });
    },
  });

  // Toggle installer active status mutation
  const toggleInstallerActiveMutation = useMutation({
    mutationFn: async ({ installerId, active }: { installerId: number; active: boolean }) => {
      await apiRequest("POST", `/api/installers/${installerId}/toggle-active`, { active });
    },
    onSuccess: () => {
      toast({
        title: "Suksess",
        description: "Installatør status oppdatert!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/installers/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere installatør status.",
        variant: "destructive",
      });
    },
  });

  // Update service request mutation
  const updateServiceRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      await apiRequest("PUT", `/api/service-requests/${requestData.id}`, requestData);
    },
    onSuccess: () => {
      toast({
        title: "Suksess",
        description: "Serviceforespørsel oppdatert!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
      setIsDialogOpen(false);
      setEditingRequest(null);
    },  
    onError: (error) => {
      toast({
        title: "Feil", 
        description: "Kunne ikke oppdatere forespørsel",
        variant: "destructive",
      });
    },
  });

  // Delete service request mutation (superadmin only)
  const deleteServiceRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      await apiRequest("DELETE", `/api/service-requests/${requestId}`);
    },
    onSuccess: () => {
      toast({
        title: "Suksess",
        description: "Serviceforespørsel slettet!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
    },
    onError: (error) => {
      toast({ 
        title: "Feil",
        description: "Kunne ikke slette forespørsel",
        variant: "destructive",
      });
    },
  });

  const handleEditRequest = (request: any) => {
    setEditingRequest({ ...request });
    setIsDialogOpen(true);
  };

  const handleUpdateRequest = () => {
    if (editingRequest) {
      updateServiceRequestMutation.mutate(editingRequest);
    }
  };

  // Delete installer mutation (superadmin only)
  const deleteInstallerMutation = useMutation({
    mutationFn: async (installerId: number) => {
      await apiRequest("DELETE", `/api/installers/${installerId}`);
    },
    onSuccess: () => {
      toast({
        title: "Suksess",
        description: "Installatør slettet!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/installers/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Feil",
        description: "Kunne ikke slette installatør",
        variant: "destructive",
      });
    },
  });

  // Reset installer password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ installerId, newPassword }: { installerId: number; newPassword: string }) => {
      await apiRequest("POST", `/api/admin/reset-password`, { userId: selectedInstaller?.userId, newPassword });
    },
    onSuccess: () => {
      toast({
        title: "Suksess",
        description: "Passord er endret!",
      });
      setNewPassword("");
      setIsInstallerDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Feil",
        description: "Kunne ikke endre passord.",
        variant: "destructive",
      });
    },
  });

  const handleViewInstaller = (installer: any) => {
    setSelectedInstaller(installer);
    setIsInstallerDialogOpen(true);
    setNewPassword("");
  };

  const handleResetPassword = () => {
    if (selectedInstaller && newPassword.trim()) {
      resetPasswordMutation.mutate({ 
        installerId: selectedInstaller.id, 
        newPassword: newPassword.trim() 
      });
    }
  };

  if (isLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Laster...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Administratorpanel</h2>
        </div>

        

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
            <TabsTrigger value="dashboard" className="text-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Oversikt</TabsTrigger>
            <TabsTrigger value="service-requests" className="text-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Serviceforespørsler</TabsTrigger>
            <TabsTrigger value="installers" className="text-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Installatører</TabsTrigger>
            <TabsTrigger value="settings" className="text-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Innstillinger</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Systemstatus</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Systemet fungerer normalt. Alle tjenester er operative.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="service-requests">
            <Card>
              <CardHeader>
                <CardTitle>Alle serviceforespørsler</CardTitle>
              </CardHeader>
              <CardContent>
                {serviceRequestsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-gray-600">Laster serviceforespørsler...</p>
                  </div>
                ) : serviceRequests && serviceRequests.length > 0 ? (
                  <div className="space-y-4">
                    {serviceRequests.map((request: any) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{request.fullName}</h3>
                          <div className="flex items-center space-x-2">

                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline" onClick={() => handleEditRequest(request)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              {user?.username === 'admin' && (
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => deleteServiceRequestMutation.mutate(request.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Kommune:</strong> {request.municipality} | <strong>Telefon:</strong> {request.phone}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>E-post:</strong> {request.email}
                        </p>
                        {request.description && <p className="text-sm">{request.description}</p>}
                        <div className="mt-2 text-xs text-muted-foreground">
                          Opprettet: {new Date(request.createdAt).toLocaleDateString('nb-NO')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Ingen serviceforespørsler funnet.</p>
                )}
              </CardContent>
            </Card>

            {/* Edit Service Request Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Rediger serviceforespørsel</DialogTitle>
                  <DialogDescription>
                    Gjør endringer i serviceforespørselen her.
                  </DialogDescription>
                </DialogHeader>
                {editingRequest && (
                  <div className="grid gap-4 py-4">
                    {/* Personal Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Navn</Label>
                        <Input
                          id="name"
                          value={editingRequest.fullName || ''}
                          onChange={(e) => setEditingRequest({...editingRequest, fullName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">E-post</Label>
                        <Input
                          id="email" 
                          value={editingRequest.email || ''}
                          onChange={(e) => setEditingRequest({...editingRequest, email: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Telefon</Label>
                        <Input
                          id="phone"
                          value={editingRequest.phone || ''}
                          onChange={(e) => setEditingRequest({...editingRequest, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postnummer</Label>
                        <Input
                          id="postalCode"
                          value={editingRequest.postalCode || ''}
                          onChange={(e) => setEditingRequest({...editingRequest, postalCode: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="address">Adresse</Label>
                        <Input
                          id="address"
                          value={editingRequest.address || ''}
                          onChange={(e) => setEditingRequest({...editingRequest, address: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">By</Label>
                        <Input
                          id="city"
                          value={editingRequest.city || ''}
                          onChange={(e) => setEditingRequest({...editingRequest, city: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* County and Municipality */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="county">Fylke</Label>
                        <Select 
                          value={editingRequest.county || ''} 
                          onValueChange={(value) => setEditingRequest({...editingRequest, county: value, municipality: ''})}
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
                          value={editingRequest.municipality || ''} 
                          onValueChange={(value) => setEditingRequest({...editingRequest, municipality: value})}
                          disabled={!editingRequest.county}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Velg kommune" />
                          </SelectTrigger>
                          <SelectContent>
                            {editingRequest.county && getMunicipalitiesByCounty(editingRequest.county).map((municipality: Kommune) => (
                              <SelectItem key={municipality.kommunenummer} value={municipality.kommunenavn}>
                                {municipality.kommunenavn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Heat Pump Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="heatPumpBrand">Varmepumpe merke</Label>
                        <Input
                          id="heatPumpBrand"
                          value={editingRequest.heatPumpBrand || ''}
                          onChange={(e) => setEditingRequest({...editingRequest, heatPumpBrand: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="heatPumpModel">Varmepumpe modell</Label>
                        <Input
                          id="heatPumpModel"
                          value={editingRequest.heatPumpModel || ''}
                          onChange={(e) => setEditingRequest({...editingRequest, heatPumpModel: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Service Type */}
                    <div>
                      <Label htmlFor="serviceType">Type service</Label>
                      <Select 
                        value={editingRequest.serviceType || 'maintenance'} 
                        onValueChange={(value) => setEditingRequest({...editingRequest, serviceType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maintenance">Vedlikehold</SelectItem>
                          <SelectItem value="repair">Reparasjon</SelectItem>
                          <SelectItem value="installation">Installasjon</SelectItem>
                          <SelectItem value="inspection">Inspeksjon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Preferred Contact Time */}
                    <div>
                      <Label htmlFor="preferredContactTime">Ønsket kontakttid</Label>
                      <Select 
                        value={editingRequest.preferredContactTime || 'anytime'} 
                        onValueChange={(value) => setEditingRequest({...editingRequest, preferredContactTime: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anytime">Når som helst</SelectItem>
                          <SelectItem value="morning">Morgen (08:00-12:00)</SelectItem>
                          <SelectItem value="afternoon">Ettermiddag (12:00-17:00)</SelectItem>
                          <SelectItem value="evening">Kveld (17:00-20:00)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description">Beskrivelse</Label>
                      <Textarea
                        id="description"
                        value={editingRequest.description || ''}
                        onChange={(e) => setEditingRequest({...editingRequest, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button onClick={handleUpdateRequest} disabled={updateServiceRequestMutation.isPending}>
                    {updateServiceRequestMutation.isPending ? "Lagrer..." : "Lagre endringer"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="installers">
            <Card>
              <CardHeader>
                <CardTitle>Installatører</CardTitle>
              </CardHeader>
              <CardContent>
                {installersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-gray-600">Laster installatører...</p>
                  </div>
                ) : installers && installers.length > 0 ? (
                  <div className="space-y-4">
                    {installers.map((installer: any) => (
                      <div key={installer.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{installer.companyName}</h3>
                          <div className="flex space-x-2">
                            <Badge variant={installer.approved ? "default" : "secondary"}>
                              {installer.approved ? "Godkjent" : "Ikke godkjent"}
                            </Badge>
                            <Badge variant={installer.active ? "default" : "destructive"}>
                              {installer.active ? "Aktiv" : "Inaktiv"}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Org.nr:</strong> {installer.orgNumber} | <strong>E-post:</strong> {installer.email}
                        </p>
                        <div className="mt-3 flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleViewInstaller(installer)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detaljer
                          </Button>
                          {!installer.approved && (
                            <Button size="sm" onClick={() => approveInstallerMutation.mutate(installer.id)}>
                              <Check className="h-4 w-4 mr-1" />
                              Godkjenn
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant={installer.active ? "destructive" : "default"}
                            onClick={() => toggleInstallerActiveMutation.mutate({
                              installerId: installer.id,
                              active: !installer.active
                            })}
                          >
                            {installer.active ? "Deaktiver" : "Aktiver"}
                          </Button>
                          {user?.username === 'admin' && (
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => deleteInstallerMutation.mutate(installer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Ingen installatører funnet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>

        </Tabs>

        {/* Installer Details Dialog */}
        <Dialog open={isInstallerDialogOpen} onOpenChange={setIsInstallerDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Installatør detaljer</DialogTitle>
              <DialogDescription>
                Se og administrer alle detaljer for {selectedInstaller?.companyName}
              </DialogDescription>
            </DialogHeader>
            {selectedInstaller && (
              <div className="grid gap-6 py-4">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Bedriftsinformasjon</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="font-medium">Bedriftsnavn</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">{selectedInstaller.companyName}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Organisasjonsnummer</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">{selectedInstaller.orgNumber}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Kontaktperson</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">{selectedInstaller.contactPerson}</p>
                    </div>
                    <div>
                      <Label className="font-medium">E-post</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">{selectedInstaller.email}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Telefon</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">{selectedInstaller.phone}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Adresse</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">{selectedInstaller.address || 'Ikke oppgitt'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Postnummer</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">{selectedInstaller.postalCode || 'Ikke oppgitt'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Poststed</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">{selectedInstaller.city || 'Ikke oppgitt'}</p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Kontoinformasjon</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="font-medium">Brukernavn</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded font-mono">{selectedInstaller.username || 'Ikke tilgjengelig'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Status</Label>
                      <div className="mt-1 flex space-x-2">
                        <Badge variant={selectedInstaller.approved ? "default" : "secondary"}>
                          {selectedInstaller.approved ? "Godkjent" : "Ikke godkjent"}
                        </Badge>
                        <Badge variant={selectedInstaller.active ? "default" : "destructive"}>
                          {selectedInstaller.active ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="font-medium">Opprettet</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">
                        {selectedInstaller.createdAt ? new Date(selectedInstaller.createdAt).toLocaleDateString('nb-NO') : 'Ukjent'}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Vurdering</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded">{selectedInstaller.rating}/5.0 ⭐</p>
                    </div>
                  </div>
                </div>

                {/* Password Reset Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2 text-red-700">Passord administrasjon</h3>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <Label className="font-medium">Nytt passord</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      Skriv inn et nytt passord for {selectedInstaller.companyName}
                    </p>
                    <Input
                      type="password"
                      placeholder="Skriv nytt passord..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mb-3"
                    />
                    <Button
                      variant="destructive"
                      onClick={handleResetPassword}
                      disabled={!newPassword.trim() || resetPasswordMutation.isPending}
                      className="w-full"
                    >
                      {resetPasswordMutation.isPending ? "Endrer passord..." : "Endre passord"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInstallerDialogOpen(false)}>
                Lukk
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}