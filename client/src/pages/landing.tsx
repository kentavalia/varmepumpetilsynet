import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, CheckCircle, Users, Settings, Shield, LogIn, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      toast({
        title: "Logget ut",
        description: "Du er nå logget ut av systemet.",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Thermometer className="text-primary text-2xl" />
              <h1 className="text-xl font-bold text-gray-900">Varmepumpetilsynet</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    Velkommen, {user?.username}!
                  </span>
                  <Button 
                    variant="ghost" 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {logoutMutation.isPending ? "Logger ut..." : "Logg ut"}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => setLocation('/auth')}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Logg inn
                  </Button>
                  <Button 
                    onClick={() => setLocation('/auth')}
                  >
                    Registrer deg
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Profesjonell varmepumpe
            <span className="text-primary"> service</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            VarmepumpeTilsynet kobler deg med lokale, sertifiserte installatører 
            og holder deg oppdatert på servicebehov for din varmepumpe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setLocation('/customer')}
              className="text-lg px-8 py-4"
            >
              Registrer ditt servicebehov
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setLocation('/auth')}
              className="text-lg px-8 py-4"
            >
              Registrer deg som installatør
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Hvorfor velge Varmepumpetilsynet?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Automatiske påminnelser</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Få påminnelser om når din varmepumpe trenger service, 
                  slik at du alltid har optimal ytelse.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Lokale installatører</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Vi matcher deg med kvalifiserte installatører i ditt 
                  område som kjenner dine lokale forhold.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Sertifiserte fagfolk</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Alle våre installatører er sertifiserte og godkjente, 
                  slik at du kan stole på kvaliteten.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-12">
            Registrer deg som ny leverandør
          </h3>
          
          <Card className="max-w-md mx-auto border-green-200">
            <CardHeader>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6 mb-6">
                <div className="text-lg opacity-90">Dette er funksjoner du får</div>
              </div>
              
              <ul className="space-y-3 text-left mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Servicepåminnelser
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Installatør matching
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Tilstandsovervåking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Kundesupport
                </li>
              </ul>
              
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                size="lg"
                onClick={() => setLocation('/auth')}
              >
                Registrer
              </Button>
              

            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Thermometer className="text-primary text-2xl" />
            <h4 className="text-xl font-bold">Varmepumpetilsynet</h4>
          </div>
          <p className="text-gray-400 mb-4">
            Drevet av Avalia Digital AS
          </p>
          <p className="text-gray-400 text-sm">
            © 2024 Varmepumpetilsynet. Alle rettigheter reservert.
          </p>
        </div>
      </footer>
    </div>
  );
}
