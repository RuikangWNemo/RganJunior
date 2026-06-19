import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Actions from "./pages/Actions";
import JoinUs from "./pages/JoinUs";
import JoinApply from "./pages/JoinApply";
import Voices from "./pages/Voices";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/journey" element={<Navigate to="/about" replace />} />
              <Route path="/field-research" element={<Navigate to="/actions" replace />} />
              <Route path="/actions" element={<Actions />} />
              <Route path="/voices" element={<Voices />} />
              <Route path="/join" element={<JoinUs />} />
              <Route path="/join/apply" element={<JoinApply />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
