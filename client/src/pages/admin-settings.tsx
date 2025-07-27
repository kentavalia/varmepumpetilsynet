import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePostalCodes, useCreatePostalCode, useUpdatePostalCode, useDeletePostalCode } from "@/hooks/use-postal-codes";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import type { PostalCode, InsertPostalCode } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import * as XLSX from 'xlsx';

export default function AdminSettings() {
  const { toast } = useToast();
  const { data: postalCodes, isLoading } = usePostalCodes();
  const createMutation = useCreatePostalCode();
  const updateMutation = useUpdatePostalCode();
  const deleteMutation = useDeletePostalCode();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingPostalCode, setEditingPostalCode] = useState<PostalCode | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState<InsertPostalCode>({
    postalCode: "",
    postPlace: "",
    municipality: "",
    county: "",
  });

  const filteredPostalCodes = postalCodes?.filter(pc =>
    pc.postalCode.includes(searchQuery) ||
    pc.postPlace.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pc.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pc.county.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      toast({
        title: "Postnummer opprettet",
        description: "Nytt postnummer ble lagt til",
      });
      setIsCreateDialogOpen(false);
      setFormData({ postalCode: "", postPlace: "", municipality: "", county: "" });
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke opprette postnummer",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (postalCode: PostalCode) => {
    setEditingPostalCode(postalCode);
    setFormData({
      postalCode: postalCode.postalCode,
      postPlace: postalCode.postPlace,
      municipality: postalCode.municipality,
      county: postalCode.county,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingPostalCode) return;
    
    try {
      await updateMutation.mutateAsync({
        id: editingPostalCode.id,
        data: formData,
      });
      toast({
        title: "Postnummer oppdatert",
        description: "Endringer ble lagret",
      });
      setIsEditDialogOpen(false);
      setEditingPostalCode(null);
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere postnummer",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Er du sikker på at du vil slette dette postnummeret?")) return;
    
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Postnummer slettet",
        description: "Postnummeret ble fjernet",
      });
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke slette postnummer",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Innstillinger</h1>
          <p className="text-muted-foreground">Administrer systeminnstillinger</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Postnummer og poststed</CardTitle>
              <CardDescription>
                Administrer norske postnummer og poststed. Alle brukere får automatisk tilgang til denne listen.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  // True Excel export using XLSX library
                  if (!postalCodes || postalCodes.length === 0) {
                    toast({
                      title: "Ingen data",
                      description: "Det er ingen postnummer å eksportere",
                      variant: "destructive"
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
                      description: `${postalCodes.length} postnummer eksportert til ${fileName}`
                    });
                  } catch (error) {
                    toast({
                      title: "Eksport feilet",
                      description: "Kunne ikke opprette Excel-fil",
                      variant: "destructive"
                    });
                  }
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                Eksporter til Excel
              </Button>
              <label className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span className="flex items-center gap-2">
                    Importer fra Excel
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = async (e) => {
                      try {
                        const text = e.target?.result as string;
                        const lines = text.split('\n').filter(line => line.trim());
                        
                        if (lines.length < 2) {
                          throw new Error('Filen må inneholde minst en overskrift og en rad med data');
                        }

                        const postalCodesToImport: (PostalCode | InsertPostalCode)[] = [];
                        
                        for (let i = 1; i < lines.length; i++) {
                          const values = lines[i].split('\t');
                          if (values.length >= 4) {
                            const id = values[0] && values[0].trim() !== '' ? parseInt(values[0]) : undefined;
                            const postalCodeData = {
                              ...(id && { id }),
                              postalCode: values[1]?.trim() || '',
                              postPlace: values[2]?.trim() || '',
                              municipality: values[3]?.trim() || '',
                              county: values[4]?.trim() || ''
                            };
                            if (postalCodeData.postalCode && postalCodeData.postPlace) {
                              postalCodesToImport.push(postalCodeData);
                            }
                          }
                        }

                        if (postalCodesToImport.length === 0) {
                          throw new Error('Ingen gyldige postnummer funnet i filen');
                        }

                        // Process import via API
                        const response = await apiRequest("POST", "/api/postal-codes/import", { postalCodes: postalCodesToImport });
                        const result = await response.json();
                        
                        // Refresh data
                        window.location.reload();
                        
                        toast({
                          title: "Import fullført",
                          description: `${result.created} nye og ${result.updated} oppdaterte postnummer.`
                        });
                      } catch (error: any) {
                        toast({
                          title: "Import feilet",
                          description: error.message || "Kunne ikke importere postnummer",
                          variant: "destructive"
                        });
                      }
                    };
                    reader.readAsText(file);
                    event.target.value = '';
                  }}
                  className="hidden"
                />
              </label>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Legg til postnummer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Legg til nytt postnummer</DialogTitle>
                    <DialogDescription>
                      Fyll inn informasjon om det nye postnummeret
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postalCode">Postnummer</Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                          placeholder="0123"
                          maxLength={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="postPlace">Poststed</Label>
                        <Input
                          id="postPlace"
                          value={formData.postPlace}
                          onChange={(e) => setFormData(prev => ({ ...prev, postPlace: e.target.value }))}
                          placeholder="Oslo"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="municipality">Kommune</Label>
                        <Input
                          id="municipality"
                          value={formData.municipality}
                          onChange={(e) => setFormData(prev => ({ ...prev, municipality: e.target.value }))}
                          placeholder="Oslo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="county">Fylke</Label>
                        <Input
                          id="county"
                          value={formData.county}
                          onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value }))}
                          placeholder="Oslo"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Avbryt
                      </Button>
                      <Button onClick={handleCreate} disabled={createMutation.isPending}>
                        {createMutation.isPending ? "Oppretter..." : "Opprett"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Søk etter postnummer, poststed, kommune eller fylke..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            {isLoading ? (
              <p>Laster postnummer...</p>
            ) : (
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
                  {filteredPostalCodes.slice(0, 50).map((postalCode) => (
                    <TableRow key={postalCode.id}>
                      <TableCell className="font-medium">{postalCode.postalCode}</TableCell>
                      <TableCell>{postalCode.postPlace}</TableCell>
                      <TableCell>{postalCode.municipality}</TableCell>
                      <TableCell>{postalCode.county}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(postalCode)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(postalCode.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {filteredPostalCodes.length > 50 && (
              <p className="text-sm text-muted-foreground">
                Viser første 50 resultater. Bruk søk for å finne spesifikke postnummer.
              </p>
            )}
            
            <p className="text-sm text-muted-foreground">
              Totalt {postalCodes?.length || 0} postnummer registrert
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rediger postnummer</DialogTitle>
            <DialogDescription>
              Endre informasjon om postnummeret
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-postalCode">Postnummer</Label>
                <Input
                  id="edit-postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="0123"
                  maxLength={4}
                />
              </div>
              <div>
                <Label htmlFor="edit-postPlace">Poststed</Label>
                <Input
                  id="edit-postPlace"
                  value={formData.postPlace}
                  onChange={(e) => setFormData(prev => ({ ...prev, postPlace: e.target.value }))}
                  placeholder="Oslo"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-municipality">Kommune</Label>
                <Input
                  id="edit-municipality"
                  value={formData.municipality}
                  onChange={(e) => setFormData(prev => ({ ...prev, municipality: e.target.value }))}
                  placeholder="Oslo"
                />
              </div>
              <div>
                <Label htmlFor="edit-county">Fylke</Label>
                <Input
                  id="edit-county"
                  value={formData.county}
                  onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value }))}
                  placeholder="Oslo"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Avbryt
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Lagrer..." : "Lagre endringer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}