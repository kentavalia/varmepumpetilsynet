import { useState } from "react";
import React from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PostalCodeInput } from "@/components/postal-code-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAllCounties, getMunicipalitiesByCounty, type Kommune } from "@/data/norwegian-locations";

const loginSchema = z.object({
  username: z.string().min(1, "Brukernavn er påkrevd"),
  password: z.string().min(1, "Passord er påkrevd"),
});

const registerSchema = z.object({
  companyName: z.string().min(1, "Firmanavn er påkrevd"),
  orgNumber: z.string().min(9, "Organisasjonsnummer må være 9 siffer").max(9, "Organisasjonsnummer må være 9 siffer"),
  phone: z.string().min(8, "Telefonnummer er påkrevd"),
  firstName: z.string().min(1, "Fornavn er påkrevd"),
  lastName: z.string().min(1, "Etternavn er påkrevd"),
  email: z.string().email("Ugyldig e-postadresse"),
  password: z.string().min(6, "Passord må være minst 6 tegn"),
  role: z.enum(["installer"]).default("installer"),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  county: z.string().min(1, "Fylke er påkrevd"),
  municipality: z.string().min(1, "Kommune er påkrevd"),
  website: z.string().optional(),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("register"); // Default to register for installers

  // Check if user is already logged in
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
    enabled: false, // Don't auto-fetch on mount
  });

  // Always initialize forms - hooks must be called in the same order
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      companyName: "",
      orgNumber: "",
      phone: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "installer",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/login", data);
      return response.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Innlogget",
        description: `Velkommen, ${user.username}!`,
      });
      
      // Redirect based on user role
      if (user.role === "admin") {
        setLocation("/admin");
      } else if (user.role === "installer") { 
        setLocation("/installer");
      } else {
        setLocation("/");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Innlogging feilet",
        description: error.message || "Ugyldig brukernavn eller passord",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest("POST", "/api/register", data);
      return response.json();
    },
    onSuccess: (userData: any) => {
      toast({
        title: "Konto opprettet!",
        description: "Du kan nå logge inn med din e-postadresse og passord.",
      });

      // Reset form and go to login tab
      registerForm.reset();
      setActiveTab("login");
      
      // Pre-fill login form with email
      loginForm.setValue("username", userData.email);
    },
    onError: (error: any) => {
      toast({
        title: "Registrering feilet",
        description: error.message || "Kunne ikke opprette konto",
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterData) => {
    // Use email as username
    const registerData = {
      ...data,
      username: data.email
    };
    registerMutation.mutate(registerData);
  };

  // Remove the automatic redirect logic - let users stay on auth page

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Varmepumpetilsynet
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Logg inn eller registrer deg som installatør
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Autentisering</CardTitle>
            <CardDescription>
              Logg inn eller opprett en ny konto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger 
                  value="register" 
                  className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
                >
                  Registrer som installatør
                </TabsTrigger>
                <TabsTrigger 
                  value="login" 
                  className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
                >
                  Logg inn
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brukernavn</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passord</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logger inn..." : "Logg inn"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Firmanavn</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="orgNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Org.nummer</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="123456789" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefon</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="12345678" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fornavn</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Etternavn</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Gateadresse 123" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <PostalCodeInput
                      postalCodeValue={registerForm.watch("postalCode") || ""}
                      cityValue={registerForm.watch("city") || ""}
                      onPostalCodeChange={(value) => registerForm.setValue("postalCode", value)}
                      onCityChange={(value) => registerForm.setValue("city", value)}
                    />

                    {/* Fylke and Kommune fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="county"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fylke</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Velg fylke" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getAllCounties().map((county) => (
                                  <SelectItem key={county} value={county}>
                                    {county}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="municipality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kommune</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                              disabled={!registerForm.watch("county")}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Velg kommune" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {registerForm.watch("county") && getMunicipalitiesByCounty(registerForm.watch("county")).map((municipality: Kommune) => (
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

                    <FormField
                      control={registerForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nettside (valgfritt)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://www.firmanavn.no" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-post (Brukernavn)</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passord</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Registrerer..." : "Opprett konto"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}