import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import TranslatorDashboardTabs from "@/components/dashboard/translator/TranslatorDashboardTabs";
import TranslationCanvas from "@/components/dashboard/translator/canvas/TranslationCanvas";
import { useParams } from "react-router-dom";

const TranslatorDashboard = () => {
  const { translationId } = useParams();
  const navigate = useNavigate();

  // Redirect to dashboard if no translation ID is provided
  useEffect(() => {
    if (window.location.pathname === "/translator-dashboard/canvas" && !translationId) {
      navigate("/translator-dashboard");
    }
  }, [translationId, navigate]);

  return (
    <div className="container mx-auto py-8">
      <Routes>
        <Route 
          path="/" 
          element={<TranslatorDashboardTabs isLoading={false} />} 
        />
        <Route 
          path="/canvas/:translationId" 
          element={<TranslationCanvas translationId={translationId} />} 
        />
      </Routes>
    </div>
  );
};

export default TranslatorDashboard;