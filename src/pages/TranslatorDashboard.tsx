import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import TranslatorDashboardTabs from "@/components/dashboard/translator/TranslatorDashboardTabs";
import TranslationCanvas from "@/components/dashboard/translator/canvas/TranslationCanvas";

const TranslatorDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8">
      <Routes>
        <Route 
          path="/" 
          element={<TranslatorDashboardTabs isLoading={false} />} 
        />
        <Route 
          path="/canvas/:translationId" 
          element={<TranslationCanvas />} 
        />
      </Routes>
    </div>
  );
};

export default TranslatorDashboard;