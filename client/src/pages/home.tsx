import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, User, Wrench, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <div className="flex items-center space-x-3">
              <Thermometer className="text-blue-600 text-3xl" />
              <h1 className="text-2xl font-bold text-gray-900">Varmepumpetilsynet</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Finn din varmepumpe-installatør
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Vi kobler deg med kvalifiserte installatører i ditt område for service og vedlikehold av varmepumper
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* Customer Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Trenger du service?</CardTitle>
              <CardDescription className="text-lg">
                Registrer ditt servicebehov og få kontakt med installatører i ditt område
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-left mb-6 space-y-2 text-gray-600">
                <li>• Ingen registrering nødvendig</li>
                <li>• Gratis å bruke</li>
                <li>• Få tilbud fra lokale installatører</li>
                <li>• Både akutte og planlagte service</li>
              </ul>
              <Link href="/customer">
                <Button size="lg" className="w-full">
                  Registrer servicebehov
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Installer Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Wrench className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Er du installatør?</CardTitle>
              <CardDescription className="text-lg">
                Registrer din bedrift og få tilgang til serviceforespørsler i ditt område
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-left mb-6 space-y-2 text-gray-600">
                <li>• Registrer ditt dekningsområde</li>
                <li>• Få varsler om nye oppdrag</li>
                <li>• Kontakt kunder direkte</li>
                <li>• Bygg omdømme og kundebase</li>
              </ul>
              <Link href="/auth">
                <Button size="lg" className="w-full">
                  Registrer eller logg inn
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Search Installers Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Søk installatører?</CardTitle>
              <CardDescription className="text-lg">
                Finn og sammenlign installatører i ditt område før du bestiller service
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-left mb-6 space-y-2 text-gray-600">
                <li>• Søk på fylke og kommune</li>
                <li>• Se kontaktinformasjon</li>
                <li>• Sammenlign tilbydere</li>
                <li>• Ring eller send e-post direkte</li>
              </ul>
              <Link href="/search">
                <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700">
                  Søk aktuell installatør
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Slik fungerer det</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h4 className="font-semibold mb-2">Registrer behov</h4>
              <p className="text-gray-600">Beskriv ditt servicebehov og velg ditt område</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h4 className="font-semibold mb-2">Installatører ser forespørselen</h4>
              <p className="text-gray-600">Kvalifiserte installatører i ditt område får beskjed</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h4 className="font-semibold mb-2">Direkte kontakt</h4>
              <p className="text-gray-600">Installatører kontakter deg direkte for avtale</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p>&copy; 2025 Varmepumpetilsynet. En tjeneste for å koble kunder med installatører.</p>
        </div>
      </footer>
    </div>
  );
}