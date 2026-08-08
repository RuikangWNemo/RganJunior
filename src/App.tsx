import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { getLegacyProgramsRedirect } from "@/lib/programRoutes";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import TieniuStory from "./pages/TieniuStory";
import Actions from "./pages/Actions";
import ActionInquiry from "./pages/ActionInquiry";
import ProgramDetail from "./pages/ProgramDetail";
import FounderStory from "./pages/FounderStory";
import JoinUs from "./pages/JoinUs";
import JoinApply from "./pages/JoinApply";
import Voices from "./pages/Voices";
import VoiceArticle from "./pages/VoiceArticle";
import FieldNotes from "./pages/FieldNotes";
import FieldNoteArticle from "./pages/FieldNoteArticle";
import Impact from "./pages/Impact";
import ImpactAwards from "./pages/ImpactAwards";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function LegacyProgramsRedirect({ inquiry = false }: { inquiry?: boolean }) {
  const location = useLocation();

  return (
    <Navigate
      to={getLegacyProgramsRedirect({
        inquiry,
        search: location.search,
        hash: location.hash,
      })}
      replace
    />
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/about/tieniu" element={<TieniuStory />} />
              <Route path="/journey" element={<Navigate to="/about" replace />} />
              <Route path="/field-research" element={<Navigate to="/programs" replace />} />
              <Route path="/programs" element={<Actions />} />
              <Route path="/programs/inquiry" element={<ActionInquiry />} />
              <Route path="/programs/:programId" element={<ProgramDetail />} />
              <Route path="/actions/inquiry" element={<LegacyProgramsRedirect inquiry />} />
              <Route path="/actions" element={<LegacyProgramsRedirect />} />
              <Route path="/story" element={<FounderStory />} />
              <Route path="/field-notes" element={<FieldNotes />} />
              <Route path="/field-notes/all" element={<FieldNotes />} />
              <Route path="/field-notes/:slug" element={<FieldNoteArticle />} />
              <Route path="/impact" element={<Impact />} />
              <Route path="/impact/awards" element={<ImpactAwards />} />
              <Route path="/voices" element={<Voices />} />
              <Route path="/voices/:slug" element={<VoiceArticle />} />
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
