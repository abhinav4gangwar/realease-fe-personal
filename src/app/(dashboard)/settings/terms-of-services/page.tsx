"use client";

import { Button } from "@/components/ui/button";
import { leaglApiClient } from "@/utils/api";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function TermsOfServicePage() {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        setLoading(true);
        const response = await leaglApiClient.get("/legal/tos", {
          responseType: "blob",
        });
        
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setError("");
      } catch (err: any) {
        console.error("Error fetching terms of service:", err);
        setError("Failed to load terms of service. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPDF();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <p className="text-gray-600">Loading Terms of Service...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="bg-secondary text-white py-4 px-6">
        <h1 className="text-2xl font-semibold">Terms of Service</h1>
      </div>
      <iframe
        src={pdfUrl}
        className="w-full flex-1 h-full"
        title="Terms of Service"
      />
    </div>
  );
}