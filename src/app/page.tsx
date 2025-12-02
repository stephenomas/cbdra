import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { AlertTriangle, Users, Shield, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">CBDRA</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign Up</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Community Based Disaster
                <span className=""> Response App</span>
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl">
                Connecting communities, volunteers, NGOs, and government
                agencies to respond effectively to disasters and emergencies.
                Report incidents, coordinate responses, and build resilient
                communities together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-white text-red-600 hover:bg-white hover:text-blue-900 shadow-lg"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right side - Hero Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full p-1 max-w-md lg:max-w-lg">
                <Image
                  src="/cross3.jpg"
                  alt="Community disaster response hero"
                  width={512}
                  height={512}
                  className="rounded-lg shadow-xl"
                  priority
                />
              </div>
               <div className="p-1 w-full max-w-md lg:max-w-lg">
                <Image
                  src="/fema.jpeg"
                  alt="Community disaster response hero"
                  width={512}
                  height={512}
                  className="rounded-lg shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              How CBDRA Works
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform brings together different stakeholders to create an
              effective disaster response network.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Community Users</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Report incidents, request help, and stay informed about local
                  emergencies.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Volunteers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Offer assistance, coordinate relief efforts, and support
                  affected communities.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>NGOs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Coordinate large-scale relief operations and resource
                  distribution.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>Government Agencies</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Verify incidents, coordinate official response, and manage
                  resources.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our community of responders and help build a more resilient
            future.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary">
              Join CBDRA Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                <span className="text-lg font-bold">CBDRA</span>
              </div>
              <p className="text-gray-400">
                Building resilient communities through coordinated disaster
                response.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-white">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/emergency" className="hover:text-white">
                    Emergency Contacts
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-white">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 Community Disaster Response App. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
