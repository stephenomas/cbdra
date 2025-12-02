"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import { ResourceAllocationModal } from "@/components/ui/resource-allocation-modal";
import {
  AlertTriangle,
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Phone,
  Loader2,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Video,
  Download,
  MessageSquare,
  Edit,
  Upload,
} from "lucide-react";
import { Users } from "lucide-react";

interface IncidentReport {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: number;
  status: string;
  location: string;
  address: string;
  latitude?: number;
  longitude?: number;
  contactInfo?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  reporter: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  responses: Array<{
    id: string;
    message: string;
    type: string;
    challengesFaced?: string | null;
    successesHad?: string | null;
    recommendations?: string | null;
    images: string[];
    resourcesOffered?: string | null;
    contactInfo?: string | null;
    createdAt: string;
    responder: {
      id: string;
      name: string;
      role: string;
      organization?: string;
    };
  }>;
  resourceAllocations: Array<{
    id: string;
    resourceType: string;
    description?: string;
    priority: number;
    status: string;
    createdAt: string;
    allocatedTo: {
      id: string;
      name: string;
      role: string;
      organization?: string;
    };
    allocatedBy: {
      id: string;
      name: string;
      role: string;
    };
  }>;
}

const incidentTypeLabels: Record<string, string> = {
  FIRE: "Fire",
  FLOOD: "Flood",
  EARTHQUAKE: "Earthquake",
  MEDICAL_EMERGENCY: "Medical Emergency",
  ACCIDENT: "Accident",
  SECURITY_THREAT: "Security Threat",
  INFRASTRUCTURE_DAMAGE: "Infrastructure Damage",
  OTHER: "Other",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending Review",
  VERIFIED: "Verified",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const severityLabels: Record<number, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Critical",
  5: "Emergency",
};

const responseTypeLabels: Record<string, string> = {
  STATUS_UPDATE: "Status Update",
  FEEDBACK: "Feedback",
  STATUS_REPORT: "Status Report",
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "text-yellow-600 bg-yellow-100";
    case "VERIFIED":
      return "text-blue-600 bg-blue-100";
    case "IN_PROGRESS":
      return "text-orange-600 bg-orange-100";
    case "RESOLVED":
      return "text-green-600 bg-green-100";
    case "CLOSED":
      return "text-gray-600 bg-gray-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const getSeverityColor = (severity: number) => {
  switch (severity) {
    case 1:
      return "text-green-600 bg-green-100";
    case 2:
      return "text-blue-600 bg-blue-100";
    case 3:
      return "text-yellow-600 bg-yellow-100";
    case 4:
      return "text-orange-600 bg-orange-100";
    case 5:
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "👑";
    case "RESPONDER":
      return "🚨";
    default:
      return "👤";
  }
};

// Helper function to determine if a URL is an image or video
const getFileType = (url: string): "image" | "video" => {
  const extension = url.split(".").pop()?.toLowerCase();
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const videoExtensions = ["mp4", "webm", "ogg", "avi", "mov"];

  if (imageExtensions.includes(extension || "")) return "image";
  if (videoExtensions.includes(extension || "")) return "video";
  return "image"; // default to image
};

export default function IncidentDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [incident, setIncident] = useState<IncidentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: "",
    message: "",
    images: [] as File[],
  });
  const [feedbackData, setFeedbackData] = useState({
    message: "",
    challengesFaced: "",
    successesHad: "",
    recommendations: "",
    images: [] as File[],
  });
  const [feedbackError, setFeedbackError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showStatusReport, setShowStatusReport] = useState(false);
  const [statusReportData, setStatusReportData] = useState({
    message: "",
    challengesFaced: "",
    successesHad: "",
    recommendations: "",
    images: [] as File[],
  });
  const [statusReportError, setStatusReportError] = useState("");

  // Allocation decision state
  const [decisionLoadingId, setDecisionLoadingId] = useState<string | null>(
    null
  );
  const [showDeclineFor, setShowDeclineFor] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [declineError, setDeclineError] = useState("");

  const fetchIncident = async (id: string) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/incidents/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch incident");
      }

      const data = await response.json();
      setIncident(data);
    } catch (error) {
      console.error("Error fetching incident:", error);
      setError("Failed to load incident details");
    } finally {
      setLoading(false);
    }
  };

  const handleAllocationDecision = async (
    allocationId: string,
    decision: "ACCEPT" | "DECLINE",
    reason?: string
  ) => {
    try {
      setDecisionLoadingId(allocationId);
      setDeclineError("");

      const response = await fetch(`/api/incidents/${incident?.id}/allocate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ allocationId, decision, reason }),
      });

      if (!response.ok) {
        let errMsg = "Failed to update allocation status";
        try {
          const data = await response.json();
          if (data?.error) errMsg = data.error;
        } catch (e) {
          // ignore
        }
        setDeclineError(errMsg);
        return;
      }

      setShowDeclineFor(null);
      setDeclineReason("");
      fetchIncident(params.id as string); // Refresh incident data
    } catch (error) {
      console.error("Error updating allocation status:", error);
      setDeclineError(
        "An unexpected error occurred while updating allocation status"
      );
    } finally {
      setDecisionLoadingId(null);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdateData.status || !statusUpdateData.message) return;

    try {
      setUploading(true);

      // Upload images if any
      let imageUrls: string[] = [];
      if (statusUpdateData.images.length > 0) {
        const formData = new FormData();
        statusUpdateData.images.forEach((file) => {
          formData.append("files", file);
        });

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrls = uploadResult.files;
        }
      }

      // Submit status update
      const response = await fetch(`/api/incidents/${incident?.id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: statusUpdateData.status,
          message: statusUpdateData.message,
          images: imageUrls,
        }),
      });

      if (response.ok) {
        setShowStatusUpdate(false);
        setStatusUpdateData({ status: "", message: "", images: [] });
        fetchIncident(params.id as string); // Refresh incident data
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleStatusReport = async () => {
    if (!statusReportData.message) return;

    try {
      setUploading(true);
      setStatusReportError("");

      // Upload images if any
      let imageUrls: string[] = [];
      if (statusReportData.images.length > 0) {
        const formData = new FormData();
        statusReportData.images.forEach((file) => {
          formData.append("files", file);
        });

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrls = uploadResult.files;
        }
      }

      // Submit status report
      const response = await fetch(
        `/api/incidents/${incident?.id}/status-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: statusReportData.message,
            challengesFaced: statusReportData.challengesFaced,
            successesHad: statusReportData.successesHad,
            recommendations: statusReportData.recommendations,
            images: imageUrls,
          }),
        }
      );

      if (!response.ok) {
        let errMsg = "Failed to submit status report";
        try {
          const data = await response.json();
          if (data?.error) errMsg = data.error;
        } catch (e) {
          // ignore
        }
        setStatusReportError(errMsg);
        return;
      }

      if (response.ok) {
        setShowStatusReport(false);
        setStatusReportData({
          message: "",
          challengesFaced: "",
          successesHad: "",
          recommendations: "",
          images: [],
        });
        fetchIncident(params.id as string); // Refresh incident data
      }
    } catch (error) {
      console.error("Error submitting status report:", error);
      setStatusReportError(
        "An unexpected error occurred while submitting status report"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFeedback = async () => {
    if (!feedbackData.message) return;

    try {
      setUploading(true);
      setFeedbackError("");

      // Upload images if any
      let imageUrls: string[] = [];
      if (feedbackData.images.length > 0) {
        const formData = new FormData();
        feedbackData.images.forEach((file) => {
          formData.append("files", file);
        });

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrls = uploadResult.files;
        }
      }

      // Submit feedback (without rating)
      const response = await fetch(`/api/incidents/${incident?.id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: feedbackData.message,
          challengesFaced: feedbackData.challengesFaced,
          successesHad: feedbackData.successesHad,
          recommendations: feedbackData.recommendations,
          images: imageUrls,
        }),
      });

      if (!response.ok) {
        let errMsg = "Failed to submit feedback";
        try {
          const data = await response.json();
          if (data?.error) errMsg = data.error;
        } catch (e) {
          // ignore
        }
        setFeedbackError(errMsg);
        return;
      }

      if (response.ok) {
        setShowFeedback(false);
        setFeedbackData({
          message: "",
          challengesFaced: "",
          successesHad: "",
          recommendations: "",
          images: [],
        });
        fetchIncident(params.id as string); // Refresh incident data
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setFeedbackError(
        "An unexpected error occurred while submitting feedback"
      );
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchIncident(params.id as string);
    }
  }, [params.id]);

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }
  const isAdmin = session.user.role === "ADMIN";
  const canGiveFeedback = [
    "COMMUNITY_USER",
    "NGO",
    "VOLUNTEER",
    "GOVERNMENT_AGENCY",
  ].includes(session.user.role);
  const canGiveStatusReport = [
    "COMMUNITY_USER",
    "VOLUNTEER",
    "NGO",
    "GOVERNMENT_AGENCY",
  ].includes(session.user.role);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/incidents">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Incidents
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!incident) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Incident not found.</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/incidents">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Incidents
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/incidents">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Incidents
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Incident Details
              </h1>
              <p className="text-gray-600">
                View detailed information about this incident report
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isAdmin && (
              <Button
                onClick={() => setShowStatusUpdate(true)}
                variant="outline"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            )}
            {isAdmin && (
              <Button onClick={() => setShowResourceModal(true)} size="sm">
                <Users className="h-4 w-4 mr-2" />
                Allocate Resource
              </Button>
            )}
            {canGiveFeedback && incident.status === "RESOLVED" && (
              <Button
                onClick={() => {
                  setFeedbackError("");
                  setShowFeedback(true);
                }}
                variant="outline"
                size="sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Give Feedback
              </Button>
            )}
            {canGiveStatusReport && incident.status === "IN_PROGRESS" && (
              <Button
                onClick={() => {
                  setStatusReportError("");
                  setShowStatusReport(true);
                }}
                variant="outline"
                size="sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Give Status Report
              </Button>
            )}
          </div>
        </div>

        {/* Status Update Modal */}
        {showStatusUpdate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Update Incident Status
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    New Status
                  </label>
                  <select
                    value={statusUpdateData.status}
                    onChange={(e) =>
                      setStatusUpdateData({
                        ...statusUpdateData,
                        status: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Status</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Update Message
                  </label>
                  <textarea
                    value={statusUpdateData.message}
                    onChange={(e) =>
                      setStatusUpdateData({
                        ...statusUpdateData,
                        message: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md h-24"
                    placeholder="Describe the status update..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Attach Images (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setStatusUpdateData({
                        ...statusUpdateData,
                        images: Array.from(e.target.files || []),
                      })
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={handleStatusUpdate}
                  disabled={
                    !statusUpdateData.status ||
                    !statusUpdateData.message ||
                    uploading
                  }
                  className="flex-1"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Update Status
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowStatusUpdate(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Resource Allocation Modal */}
        {showResourceModal && incident && (
          <ResourceAllocationModal
            isOpen={showResourceModal}
            onClose={() => setShowResourceModal(false)}
            incident={incident}
            onSuccess={() => fetchIncident(params.id as string)}
          />
        )}

        {/* Feedback Modal */}
        {showFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Give Feedback</h3>
              {feedbackError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{feedbackError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                {/* Removed rating selector */}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Feedback Message
                  </label>
                  <textarea
                    value={feedbackData.message}
                    onChange={(e) =>
                      setFeedbackData({
                        ...feedbackData,
                        message: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md h-20"
                    placeholder="Share your feedback about the incident resolution..."
                  />
                </div>

                {(session?.user.role === "VOLUNTEER" ||
                  session?.user.role === "NGO" ||
                  session?.user.role === "GOVERNMENT_AGENCY") && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Challenges Faced
                      </label>
                      <textarea
                        value={feedbackData.challengesFaced}
                        onChange={(e) =>
                          setFeedbackData({
                            ...feedbackData,
                            challengesFaced: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-md h-16"
                        placeholder="Describe any challenges encountered during the response..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Successes Had
                      </label>
                      <textarea
                        value={feedbackData.successesHad}
                        onChange={(e) =>
                          setFeedbackData({
                            ...feedbackData,
                            successesHad: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-md h-16"
                        placeholder="Describe any successes or positive outcomes..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Recommendations
                      </label>
                      <textarea
                        value={feedbackData.recommendations}
                        onChange={(e) =>
                          setFeedbackData({
                            ...feedbackData,
                            recommendations: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-md h-16"
                        placeholder="Provide recommendations for improving future responses..."
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Attach Images (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setFeedbackData({
                        ...feedbackData,
                        images: Array.from(e.target.files || []),
                      })
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={handleFeedback}
                  disabled={!feedbackData.message || uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Submit Feedback
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFeedbackError("");
                    setShowFeedback(false);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Status Report Modal */}
        {showStatusReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Give Status Report</h3>
              {statusReportError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{statusReportError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status Update Message
                  </label>
                  <textarea
                    value={statusReportData.message}
                    onChange={(e) =>
                      setStatusReportData({
                        ...statusReportData,
                        message: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md h-20"
                    placeholder="Provide an update on the current situation..."
                  />
                </div>

                {(session?.user.role === "VOLUNTEER" ||
                  session?.user.role === "NGO" ||
                  session?.user.role === "GOVERNMENT_AGENCY") && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Challenges Faced
                      </label>
                      <textarea
                        value={statusReportData.challengesFaced}
                        onChange={(e) =>
                          setStatusReportData({
                            ...statusReportData,
                            challengesFaced: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-md h-16"
                        placeholder="Describe any challenges encountered..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Successes Had
                      </label>
                      <textarea
                        value={statusReportData.successesHad}
                        onChange={(e) =>
                          setStatusReportData({
                            ...statusReportData,
                            successesHad: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-md h-16"
                        placeholder="Describe any successes or progress made..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Recommendations
                      </label>
                      <textarea
                        value={statusReportData.recommendations}
                        onChange={(e) =>
                          setStatusReportData({
                            ...statusReportData,
                            recommendations: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-md h-16"
                        placeholder="Provide recommendations for improving the process..."
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Attach Images (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setStatusReportData({
                        ...statusReportData,
                        images: Array.from(e.target.files || []),
                      })
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={handleStatusReport}
                  disabled={!statusReportData.message || uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Submit Status Report
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusReportError("");
                    setShowStatusReport(false);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Incident Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-3">
                      {incident.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          incident.status
                        )}`}
                      >
                        {statusLabels[incident.status]}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(
                          incident.severity
                        )}`}
                      >
                        {severityLabels[incident.severity]} Priority
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                        {incidentTypeLabels[incident.type]}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 font-mono">
                      Incident ID:{" "}
                      <span title={incident.id}>{incident.id}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {incident.description}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{incident.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(incident.createdAt).toLocaleDateString()} at{" "}
                        {new Date(incident.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    {incident.contactInfo && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{incident.contactInfo}</span>
                      </div>
                    )}
                    {incident.verifiedAt && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          Verified on{" "}
                          {new Date(incident.verifiedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Coordinates */}
                  {incident.latitude && incident.longitude && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Coordinates
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>Latitude: {incident.latitude}</div>
                        <div>Longitude: {incident.longitude}</div>
                      </div>
                    </div>
                  )}

                  {/* Media Attachments */}
                  {incident.images && incident.images.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Media Attachments
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {incident.images.map((imageUrl, index) => {
                          const fileType = getFileType(imageUrl);
                          return (
                            <div key={index} className="relative group">
                              {fileType === "image" ? (
                                <div className="relative">
                                  <Image
                                    src={imageUrl}
                                    alt={`Incident media ${index + 1}`}
                                    width={400}
                                    height={192}
                                    className="w-full h-48 object-cover rounded-lg border shadow-sm"
                                    onError={(e) => {
                                      console.error(
                                        "Image failed to load:",
                                        imageUrl
                                      );
                                      const target = e.currentTarget;
                                      target.style.backgroundColor = "#f3f4f6";
                                      target.style.display = "flex";
                                      target.style.alignItems = "center";
                                      target.style.justifyContent = "center";
                                      target.innerHTML =
                                        '<span style="color: #6b7280; font-size: 14px;">Failed to load image</span>';
                                    }}
                                    onLoad={() => {
                                      console.log(
                                        "Image loaded successfully:",
                                        imageUrl
                                      );
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() =>
                                          window.open(imageUrl, "_blank")
                                        }
                                        className="bg-white/90 hover:bg-white text-gray-800"
                                      >
                                        <ImageIcon className="h-4 w-4 mr-1" />
                                        View
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => {
                                          const link =
                                            document.createElement("a");
                                          link.href = imageUrl;
                                          link.download = `incident-image-${
                                            index + 1
                                          }`;
                                          link.click();
                                        }}
                                        className="bg-white/90 hover:bg-white text-gray-800"
                                      >
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative">
                                  <video
                                    src={imageUrl}
                                    controls
                                    className="w-full h-48 object-cover rounded-lg border shadow-sm"
                                    onError={(e) => {
                                      console.error(
                                        "Video failed to load:",
                                        imageUrl
                                      );
                                    }}
                                  />
                                  <div className="absolute top-2 right-2">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => {
                                        const link =
                                          document.createElement("a");
                                        link.href = imageUrl;
                                        link.download = `incident-video-${
                                          index + 1
                                        }`;
                                        link.click();
                                      }}
                                      className="bg-white/90 hover:bg-white text-gray-800"
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              )}
                              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                {fileType === "image" ? (
                                  <ImageIcon className="h-4 w-4" />
                                ) : (
                                  <Video className="h-4 w-4" />
                                )}
                                <span>
                                  {fileType === "image" ? "Image" : "Video"}{" "}
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resource Allocations */}
            {incident.resourceAllocations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Allocated Resources</CardTitle>
                  <CardDescription>
                    Resources assigned to respond to this incident
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {incident.resourceAllocations.map((allocation) => (
                      <div
                        key={allocation.id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {allocation.resourceType}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Assigned to:{" "}
                              {getRoleIcon(allocation.allocatedTo.role)}{" "}
                              {allocation.allocatedTo.name}
                              {allocation.allocatedTo.organization && (
                                <span className="ml-1">
                                  ({allocation.allocatedTo.organization})
                                </span>
                              )}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              allocation.status === "ASSIGNED"
                                ? "bg-blue-100 text-blue-800"
                                : allocation.status === "IN_PROGRESS"
                                ? "bg-orange-100 text-orange-800"
                                : allocation.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {allocation.status.replace("_", " ")}
                          </span>
                        </div>
                        {allocation.description && (
                          <p className="text-sm text-gray-700 mb-2">
                            {allocation.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Priority: {allocation.priority}/5</span>
                          <span>
                            Allocated on{" "}
                            {new Date(
                              allocation.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        {session.user.id === allocation.allocatedTo.id &&
                          allocation.status === "ASSIGNED" && (
                            <div className="mt-3 flex gap-2">
                              <Button
                                onClick={() =>
                                  handleAllocationDecision(
                                    allocation.id,
                                    "ACCEPT"
                                  )
                                }
                                disabled={decisionLoadingId === allocation.id}
                              >
                                {decisionLoadingId === allocation.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Accept Allocation
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setDeclineError("");
                                  setDeclineReason("");
                                  setShowDeclineFor(allocation.id);
                                }}
                                disabled={decisionLoadingId === allocation.id}
                              >
                                Decline Allocation
                              </Button>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Decline Allocation Modal */}
            {showDeclineFor && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">
                    Decline Allocation
                  </h3>
                  {declineError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{declineError}</AlertDescription>
                    </Alert>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Reason (optional)
                    </label>
                    <textarea
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      className="w-full p-2 border rounded-md h-20"
                      placeholder="Provide a brief reason for declining..."
                    />
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button
                      onClick={() =>
                        handleAllocationDecision(
                          showDeclineFor,
                          "DECLINE",
                          declineReason
                        )
                      }
                      disabled={decisionLoadingId === showDeclineFor}
                      className="flex-1"
                    >
                      {decisionLoadingId === showDeclineFor ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Submit Decline
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDeclineError("");
                        setShowDeclineFor(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Responses */}
            {incident.responses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Responses</CardTitle>
                  <CardDescription>
                    Updates and responses from emergency responders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {incident.responses.map((response) => (
                      <div
                        key={response.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        {/* Header with responder info and response type */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {getRoleIcon(response.responder.role)}{" "}
                              {response.responder.name}
                            </span>
                            {response.responder.organization && (
                              <span className="text-sm text-gray-600">
                                ({response.responder.organization})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                response.type === "STATUS_UPDATE"
                                  ? "bg-blue-100 text-blue-800"
                                  : response.type === "STATUS_REPORT"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {responseTypeLabels[response.type] ||
                                response.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(
                                response.createdAt
                              ).toLocaleDateString()}{" "}
                              at{" "}
                              {new Date(
                                response.createdAt
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        {/* Main message */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Message
                          </h4>
                          <p className="text-gray-700 leading-relaxed">
                            {response.message}
                          </p>
                        </div>

                        {/* Additional details if provided */}
                        {(response.challengesFaced ||
                          response.successesHad ||
                          response.recommendations) && (
                          <div className="space-y-4">
                            {response.challengesFaced && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Challenges Faced
                                </h4>
                                <p className="text-gray-700 leading-relaxed">
                                  {response.challengesFaced}
                                </p>
                              </div>
                            )}

                            {response.successesHad && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Successes Achieved
                                </h4>
                                <p className="text-gray-700 leading-relaxed">
                                  {response.successesHad}
                                </p>
                              </div>
                            )}

                            {response.recommendations && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Recommendations
                                </h4>
                                <p className="text-gray-700 leading-relaxed">
                                  {response.recommendations}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Contact info */}
                        {response.contactInfo && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Contact Information
                            </h4>
                            <p className="text-gray-700">
                              {response.contactInfo}
                            </p>
                          </div>
                        )}

                        {/* Resources offered */}
                        {response.resourcesOffered && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Resources Offered
                            </h4>
                            <p className="text-gray-700">
                              {response.resourcesOffered}
                            </p>
                          </div>
                        )}

                        {/* Response images */}
                        {response.images && response.images.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-900 mb-3">
                              Attachments
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {response.images.map((url, i) => (
                                <div key={i} className="relative group">
                                  <Image
                                    src={url}
                                    alt={`Response attachment ${i + 1}`}
                                    width={400}
                                    height={192}
                                    className="w-full h-32 object-cover rounded-md border shadow-sm"
                                    onError={(e) => {
                                      console.error(
                                        "Response image failed to load:",
                                        url
                                      );
                                      const target = e.currentTarget;
                                      target.style.backgroundColor = "#f3f4f6";
                                      target.style.display = "flex";
                                      target.style.alignItems = "center";
                                      target.style.justifyContent = "center";
                                      target.innerHTML =
                                        '<span style="color: #6b7280; font-size: 12px;">Failed to load</span>';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() =>
                                          window.open(url, "_blank")
                                        }
                                        className="bg-white/90 hover:bg-white text-gray-800"
                                      >
                                        <ImageIcon className="h-3 w-3 mr-1" />
                                        View
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Reporter Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Name:
                    </span>
                    <p className="text-gray-700">{incident.reporter.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Role:
                    </span>
                    <p className="text-gray-700">
                      {incident.reporter.role.replace("_", " ").toLowerCase()}
                    </p>
                  </div>
                  {session.user.role === "ADMIN" && (
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Email:
                      </span>
                      <p className="text-gray-700">{incident.reporter.email}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Incident Reported</p>
                      <p className="text-xs text-gray-500">
                        {new Date(incident.createdAt).toLocaleDateString()} at{" "}
                        {new Date(incident.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {incident.verifiedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Incident Verified</p>
                        <p className="text-xs text-gray-500">
                          {new Date(incident.verifiedAt).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(incident.verifiedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {incident.resourceAllocations.map((allocation) => (
                    <div
                      key={allocation.id}
                      className="flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">
                          Resource Allocated
                        </p>
                        <p className="text-xs text-gray-500">
                          {allocation.resourceType} to{" "}
                          {allocation.allocatedTo.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(allocation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {incident.updatedAt !== incident.createdAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-xs text-gray-500">
                          {new Date(incident.updatedAt).toLocaleDateString()} at{" "}
                          {new Date(incident.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
