"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Users, Shield, Globe, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userIncidentCount, setUserIncidentCount] = useState(0);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserStats();
      fetchRecentIncidents();
    }
  }, [session]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`/api/incidents/user-stats`);
      if (response.ok) {
        const data = await response.json();
        setUserIncidentCount(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const fetchRecentIncidents = async () => {
    try {
      const response = await fetch(`/api/incidents?limit=5`);
      if (response.ok) {
        const data = await response.json();
        setRecentIncidents(data.incidents || []);
      }
    } catch (error) {
      console.error("Error fetching recent incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name}!
          </h2>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening in your community disaster
            response network.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/incidents/report">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Plus className="h-5 w-5 text-red-600 mr-2" />
                  Report Incident
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Report a new emergency or disaster incident in your area
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/incidents">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  View Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  See active incidents and emergency situations nearby
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                Your Incident Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {userIncidentCount}
              </div>
              <CardDescription>
          
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>
                Latest emergency reports in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
                  <p>Loading recent incidents...</p>
                </div>
              ) : recentIncidents.length > 0 ? (
                <div className="space-y-4">
                  {recentIncidents.map(
                    (incident: {
                      id: string;
                      title: string;
                      description: string;
                      type: string;
                      status: string;
                      createdAt: string;
                      address: string;
                    }) => (
                      <Link
                        key={incident.id}
                        href={`/incidents/${incident.id}`}
                      >
                        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {incident.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {incident.description?.substring(0, 100)}...
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {incident.type?.replace("_", " ")}
                                </span>
                                <span>
                                  {new Date(
                                    incident.createdAt
                                  ).toLocaleDateString()}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    incident.status === "PENDING"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : incident.status === "VERIFIED"
                                      ? "bg-blue-100 text-blue-800"
                                      : incident.status === "IN_PROGRESS"
                                      ? "bg-orange-100 text-orange-800"
                                      : incident.status === "RESOLVED"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {incident.status?.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent incidents reported</p>
                  <p className="text-sm">
                    This is good news for your community!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}