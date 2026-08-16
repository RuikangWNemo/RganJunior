import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { getLegacyProgramsRedirect } from '@/lib/programRoutes';
import Layout from '@/components/Layout';
import Index from './pages/Index';

const About = lazy(() => import('./pages/About'));
const TieniuStory = lazy(() => import('./pages/TieniuStory'));
const Actions = lazy(() => import('./pages/Actions'));
const ActionInquiry = lazy(() => import('./pages/ActionInquiry'));
const ProgramDetail = lazy(() => import('./pages/ProgramDetail'));
const FounderStory = lazy(() => import('./pages/FounderStory'));
const JoinUs = lazy(() => import('./pages/JoinUs'));
const JoinApply = lazy(() => import('./pages/JoinApply'));
const VoiceArticle = lazy(() => import('./pages/VoiceArticle'));
const FieldNotes = lazy(() => import('./pages/FieldNotes'));
const FieldNoteArticle = lazy(() => import('./pages/FieldNoteArticle'));
const Impact = lazy(() => import('./pages/Impact'));
const ImpactAwards = lazy(() => import('./pages/ImpactAwards'));
const NotFound = lazy(() => import('./pages/NotFound'));
const CommunityRoutes = lazy(() => import('./pages/community/CommunityRoutes'));

const queryClient = new QueryClient();

function RouteLoading({ community = false }: { community?: boolean }) {
  return (
    <div
      className={community ? 'community-route-shell min-h-svh' : 'min-h-[70svh] bg-background'}
      role="status"
      aria-label="Loading page"
    />
  );
}

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

function PublicRoutes() {
  return (
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
      <Route path="/voices" element={<Navigate to="/about#team" replace />} />
      <Route path="/voices/:slug" element={<VoiceArticle />} />
      <Route path="/join" element={<JoinUs />} />
      <Route path="/join/apply" element={<JoinApply />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isCommunityRoute = /^\/community(?:\/|$)/.test(location.pathname);

  if (isCommunityRoute) {
    return (
      <Suspense fallback={<RouteLoading community />}>
        <CommunityRoutes />
      </Suspense>
    );
  }

  return (
    <Layout>
      <Suspense fallback={<RouteLoading />}>
        <PublicRoutes />
      </Suspense>
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
