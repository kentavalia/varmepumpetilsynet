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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Search,
  ArrowLeft,
  MapPin
} from "lucide-react";
import { Link } from "wouter";

interface Customer {
  id: number;
  userId?: number;
  fullName: string;
  email: string;
  municipality: string;
  subscriptionActive: boolean;
  createdAt: string;
  username?: string;
}

export default function AdminCustomers() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch all customers
  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/customers"],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ customerId, data }: { customerId: number; data: Partial<Customer> }) => {
      await apiRequest("PUT", `/api/customers/${customerId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Oppdatert",
        description: "Kunde ble oppdatert!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setEditDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere kunde.",
        variant: "destructive",
      });
    },
  });

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: number) => {
      await apiRequest("DELETE", `/api/customers/${customerId}`);
    },
    onSuccess: () => {
      toast({
        title: "Slettet",
        description: "Kunde ble slettet permanent.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
    onError: () => {
      toast({
        title: "Feil",
        description: "Kunne ikke slette kunde.",
        variant: "destructive",
      });
    },
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ customerId, active }: { customerId: number; active: boolean }) => {
      await apiRequest("POST", `/api/customers/${customerId}/subscription`, { active });
    },
    onSuccess: () => {
      toast({
        title: "Abonnement oppdatert",
        description: "Abonnement status ble endret!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
    onError: () => {
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere abonnement.",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = customers?.filter((customer: Customer) =>
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.municipality.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedCustomer) return;
    
    updateCustomerMutation.mutate({
      customerId: selectedCustomer.id,
      data: {
        fullName: selectedCustomer.fullName,
        email: selectedCustomer.email,
        municipality: selectedCustomer.municipality,
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
                <h2 className="text-3xl font-bold text-gray-900">Kundeadministrasjon</h2>
                <p className="text-muted-foreground">Administrer alle registrerte kunder</p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="text-primary mr-3" />
                Kunder ({filteredCustomers.length})
              </CardTitle>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Søk kunder..."
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
                <p className="mt-4 text-gray-600">Laster kunder...</p>
              </div>
            ) : filteredCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Kunde</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Innlogging</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Kommune</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Abonnement</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Registrert</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Handlinger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCustomers.map((customer: Customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{customer.fullName}</div>
                          <div className="text-xs text-muted-foreground">{customer.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          {customer.username ? (
                            <div>
                              <div className="text-gray-700 font-mono text-sm">{customer.username}</div>
                              <div className="text-xs text-muted-foreground">Brukernavn</div>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">Anonym kunde</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            {customer.municipality}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Badge variant={customer.subscriptionActive ? "default" : "destructive"}>
                              {customer.subscriptionActive ? "Aktiv" : "Inaktiv"}
                            </Badge>
                            <Switch
                              checked={customer.subscriptionActive}
                              onCheckedChange={(checked) => 
                                updateSubscriptionMutation.mutate({
                                  customerId: customer.id,
                                  active: checked
                                })
                              }
                              disabled={updateSubscriptionMutation.isPending}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {new Date(customer.createdAt).toLocaleDateString('nb-NO')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(customer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm("Er du sikker på at du vil slette denne kunden permanent?")) {
                                  deleteCustomerMutation.mutate(customer.id);
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
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Ingen kunder funnet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rediger kunde</DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Fullt navn</Label>
                  <Input
                    id="fullName"
                    value={selectedCustomer.fullName}
                    onChange={(e) => setSelectedCustomer({
                      ...selectedCustomer,
                      fullName: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-post</Label>
                  <Input
                    id="email"
                    type="email"
                    value={selectedCustomer.email}
                    onChange={(e) => setSelectedCustomer({
                      ...selectedCustomer,
                      email: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="municipality">Kommune</Label>
                  <Input
                    id="municipality"
                    value={selectedCustomer.municipality}
                    onChange={(e) => setSelectedCustomer({
                      ...selectedCustomer,
                      municipality: e.target.value
                    })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Avbryt
                  </Button>
                  <Button onClick={handleSave} disabled={updateCustomerMutation.isPending}>
                    {updateCustomerMutation.isPending ? "Lagrer..." : "Lagre"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}