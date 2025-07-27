import { useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, UserCheck, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

const ActivateServiceForm = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Activate the service for the user - no payment required
      await apiRequest('/api/activate-service', {
        method: 'POST',
      });

      toast({
        title: "Tjeneste aktivert!",
        description: "Velkommen til VarmepumpeTilsynet! Du har nå tilgang til alle funksjoner.",
      });

      // Redirect to customer portal
      setLocation('/customer');
    } catch (error: any) {
      if (isUnauthorizedError(error)) {
        setLocation('/');
        return;
      }
      
      toast({
        title: "Aktivering feilet",
        description: error.message || "Kunne ikke aktivere tjenesten",
        variant: "destructive",
      });
    }
    
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6 border rounded-lg bg-green-50 border-green-200">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-900 mb-2">
            Gratis tilgang til alle funksjoner
          </h3>
          <p className="text-green-700">
            Ingen betaling kreves. Klikk bare for å aktivere tjenesten.
          </p>
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-green-600 hover:bg-green-700" 
        size="lg"
        disabled={isProcessing}
      >
        {isProcessing ? "Aktiverer..." : "Aktiver gratis tjeneste"}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    toast({
      title: "Ikke autorisert",
      description: "Du må logge inn for å aktivere tjenesten.",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/auth";
    }, 500);
    return null;
  }

  if (isLoading) {
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/customer">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tilbake til kundeportal
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Aktiver Varmepumpetilsynet
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Få gratis tilgang til profesjonell tilsyn og vedlikehold av din varmepumpe
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Hva får du gratis?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <div>
                      <div className="font-medium">Servicepåminnelser</div>
                      <div className="text-sm text-muted-foreground">
                        Automatiske varsler når din varmepumpe trenger service
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <div>
                      <div className="font-medium">Installatør matching</div>
                      <div className="text-sm text-muted-foreground">
                        Få forslag til kvalifiserte installatører i ditt område
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <div>
                      <div className="font-medium">Tilstandsovervåking</div>
                      <div className="text-sm text-muted-foreground">
                        Hold oversikt over servicestatus og neste service
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <div>
                      <div className="font-medium">Kundesupport</div>
                      <div className="text-sm text-muted-foreground">
                        Få hjelp og veiledning når du trenger det
                      </div>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Free Access Notice */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">Gratis tilgang</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6 mb-4">
                  <div className="text-3xl font-bold">Gratis</div>
                  <div className="text-lg opacity-90">for alle brukere</div>
                </div>
                <p className="text-sm text-green-700">
                  Ingen betaling kreves. Tilgang til alle funksjoner uten kostnad.
                  Start med å aktivere tjenesten.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activation Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="text-primary mr-3" />
                  Aktiver tjeneste
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Du aktiverer som: <strong>{user?.firstName} {user?.lastName}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Klikk for å få umiddelbar tilgang til alle funksjoner.
                  </p>
                </div>
                
                <ActivateServiceForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}