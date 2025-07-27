import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertServiceRequestSchema, type InsertServiceRequest } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getAllCounties, getMunicipalitiesByCounty } from "@/data/norwegian-locations";
import { PostalCodeInput } from "@/components/postal-code-input";
import { useState } from "react";
import { Phone, Mail, CheckCircle } from "lucide-react";

export default function CustomerPage() {
  const { toast } = useToast();
  const [selectedCounty, setSelectedCounty] = useState<string>("");

  const form = useForm<InsertServiceRequest>({
    resolver: zodResolver(insertServiceRequestSchema.extend({
      postalCode: z.string().min(1, "Postnummer er påkrevd"),
      city: z.string().min(1, "By/poststed er påkrevd"),
    })),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      postalCode: "",
      city: "",
      county: "",
      municipality: "",
      serviceType: "maintenance",
      heatPumpBrand: "",
      heatPumpModel: "",
      description: "",
      preferredContactTime: "",
      status: "open",
    },
  });

  const createServiceRequestMutation = useMutation({
    mutationFn: async (data: InsertServiceRequest) => {
      const res = await apiRequest("POST", "/api/service-requests", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Suksess",
        description: "Din serviceforespørsel er sendt! Vi vil kontakte deg snart.",
      });
      form.reset();
      setSelectedCounty("");
    },
    onError: (error: Error) => {
      toast({
        title: "Feil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertServiceRequest) => {
    createServiceRequestMutation.mutate(data);
  };

  // Get municipalities for selected county
  const getMunicipalities = () => {
    if (!selectedCounty) return [];
    return getMunicipalitiesByCounty(selectedCounty);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bestill varmepumpeservice
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Helt gratis! Fyll ut skjemaet nedenfor så finner vi de beste installatørene i ditt område.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Serviceforespørsel
              </CardTitle>
              <CardDescription>
                Vi finner kvalifiserte installatører i ditt område og sender deg kontaktinformasjon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Kontaktinformasjon</h3>
                    
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Navn *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ola Nordmann" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-post *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="ola@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefonnummer *</FormLabel>
                          <FormControl>
                            <Input placeholder="+47 12 34 56 78" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredContactTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ønsket kontakttid</FormLabel>
                          <FormControl>
                            <Input placeholder="F.eks. hverdager mellom 09-17" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Adresse</h3>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse *</FormLabel>
                          <FormControl>
                            <Input placeholder="Gateveien 123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <PostalCodeInput
                      postalCodeValue={form.watch("postalCode") || ""}
                      cityValue={form.watch("city") || ""}
                      onPostalCodeChange={(value) => form.setValue("postalCode", value)}
                      onCityChange={(value) => form.setValue("city", value)}
                      postalCodeLabel="Postnummer *"
                      cityLabel="By *"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FormLabel>Fylke *</FormLabel>
                        <Select 
                          value={selectedCounty} 
                          onValueChange={(value) => {
                            setSelectedCounty(value);
                            form.setValue("county", value);
                            form.setValue("municipality", "");
                          }}
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

                      <FormField
                        control={form.control}
                        name="municipality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kommune *</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              disabled={!selectedCounty}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Velg kommune" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getMunicipalities().map((municipality) => (
                                  <SelectItem key={municipality.kommunenummer} value={municipality.kommunenavn}>
                                    {municipality.kommunenavn}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Servicebehov</h3>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beskrivelse av problem/servicebehov *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Beskriv hva som er galt med varmepumpa eller hvilken type service du trenger..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type service *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Velg servicetype" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="maintenance">Vedlikehold/service</SelectItem>
                              <SelectItem value="repair">Reparasjon</SelectItem>
                              <SelectItem value="installation">Installasjon</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createServiceRequestMutation.isPending}
                  >
                    {createServiceRequestMutation.isPending ? "Sender..." : "Send serviceforespørsel"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}