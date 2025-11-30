"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Search,
  Filter,
  Check,
  X,
  Trash2,
  Eye,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface Review {
  id: number;
  clinic_id: number;
  patient_id: number;
  rating: number;
  comment: string;
  is_approved: boolean;
  approved_at: string | null;
  created_at: string;
  clinic: {
    id: number;
    name: string;
  };
  patient: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  appointment?: {
    id: number;
    staff: {
      id: number;
      name: string;
    };
  };
}

interface Statistics {
  total: number;
  approved: number;
  pending: number;
  average_rating: number;
  ratings_breakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get user role
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.roles?.[0] || null);
    }

    fetchReviews();
    fetchStatistics();
  }, [currentPage, statusFilter, ratingFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: 15,
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== "all") params.status = statusFilter;
      if (ratingFilter !== "all") params.rating = parseInt(ratingFilter);

      const response = await api.admin.reviews.getAll(params);
      setReviews(response.data || []);
      setTotalPages(response.last_page || 1);
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Bewertungen konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.admin.reviews.getStatistics();
      setStatistics(response);
    } catch (error) {
      console.error("Statistics fetch error:", error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchReviews();
  };

  const handleApprove = async (id: number) => {
    try {
      await api.admin.reviews.approve(id);
      toast({
        title: "✅ Erfolg",
        description: "Bewertung wurde genehmigt",
      });
      fetchReviews();
      fetchStatistics();
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message || "Bewertung konnte nicht genehmigt werden",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.admin.reviews.reject(id);
      toast({
        title: "✅ Erfolg",
        description: "Bewertung wurde abgelehnt",
      });
      fetchReviews();
      fetchStatistics();
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message || "Bewertung konnte nicht abgelehnt werden",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Möchten Sie diese Bewertung wirklich löschen?")) return;

    try {
      await api.admin.reviews.delete(id);
      toast({
        title: "✅ Erfolg",
        description: "Bewertung wurde gelöscht",
      });
      fetchReviews();
      fetchStatistics();
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message || "Bewertung konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingPercentage = (count: number, total: number) => {
    return total > 0 ? ((count / total) * 100).toFixed(0) : "0";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bewertungsverwaltung
          </h1>
          <p className="text-gray-500 mt-1">
            Verwalten und moderieren Sie Kundenbewertungen
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Gesamt</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Genehmigt</p>
                <p className="text-2xl font-bold text-green-600">
                  {statistics.approved}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ausstehend</p>
                <p className="text-2xl font-bold text-orange-600">
                  {statistics.pending}
                </p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Durchschnitt</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {statistics.average_rating}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Verteilung</p>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2 text-xs">
                    <span className="w-3">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${getRatingPercentage(
                            statistics.ratings_breakdown[
                              rating as keyof typeof statistics.ratings_breakdown
                            ],
                            statistics.approved
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right">
                      {
                        statistics.ratings_breakdown[
                          rating as keyof typeof statistics.ratings_breakdown
                        ]
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Bewertung durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Status</option>
              <option value="approved">Genehmigt</option>
              <option value="pending">Ausstehend</option>
            </select>
          </div>

          <div>
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Bewertungen</option>
              <option value="5">5 Sterne</option>
              <option value="4">4 Sterne</option>
              <option value="3">3 Sterne</option>
              <option value="2">2 Sterne</option>
              <option value="1">1 Stern</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      <Card>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Bewertungen werden geladen...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Keine Bewertungen gefunden</p>
          </div>
        ) : (
          <div className="divide-y">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm font-medium">
                          {review.rating}.0
                        </span>
                      </div>
                      <Badge
                        variant={review.is_approved ? "default" : "secondary"}
                      >
                        {review.is_approved ? "Genehmigt" : "Ausstehend"}
                      </Badge>
                    </div>

                    <p className="text-gray-900 mb-2">{review.comment}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        👤 {review.patient.first_name} {review.patient.last_name}
                      </span>
                      {userRole === "super_admin" && (
                        <span className="flex items-center gap-1">
                          🏥 {review.clinic.name}
                        </span>
                      )}
                      {review.appointment?.staff && (
                        <span className="flex items-center gap-1">
                          👨‍⚕️ Dr. {review.appointment.staff.name}
                        </span>
                      )}
                      <span>
                        📅{" "}
                        {new Date(review.created_at).toLocaleDateString(
                          "de-DE"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {!review.is_approved && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(review.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Genehmigen
                      </Button>
                    )}
                    {review.is_approved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(review.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Ablehnen
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Zurück
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Weiter
          </Button>
        </div>
      )}
    </div>
  );
}
