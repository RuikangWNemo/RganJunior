import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { getLegacyProgramsRedirect } from "@/lib/programRoutes";
import Layout from "@/components/Layout";
import CommunityShell from "@/components/community/CommunityShell";
import {
  CommunityRequireAuth,
  CommunityRequireAnyPermission,
  CommunityRequireMember,
  CommunityRequirePermission,
  CommunitySmartEntry,
} from "@/components/community/CommunityRouteGuards";
import Index from "./pages/Index";
import About from "./pages/About";
import TieniuStory from "./pages/TieniuStory";
import Actions from "./pages/Actions";
import ActionInquiry from "./pages/ActionInquiry";
import ProgramDetail from "./pages/ProgramDetail";
import FounderStory from "./pages/FounderStory";
import JoinUs from "./pages/JoinUs";
import JoinApply from "./pages/JoinApply";
import VoiceArticle from "./pages/VoiceArticle";
import FieldNotes from "./pages/FieldNotes";
import FieldNoteArticle from "./pages/FieldNoteArticle";
import Impact from "./pages/Impact";
import ImpactAwards from "./pages/ImpactAwards";
import NotFound from "./pages/NotFound";
import CommunityAuth from "./pages/community/CommunityAuth";
import CommunityAuthCallback from "./pages/community/CommunityAuthCallback";
import CommunityResetPassword from "./pages/community/CommunityResetPassword";
import CommunityOnboarding from "./pages/community/CommunityOnboarding";
import CommunityApply from "./pages/community/CommunityApply";
import CommunityApplicationStatus from "./pages/community/CommunityApplicationStatus";
import GuardianConsent from "./pages/community/GuardianConsent";
import CommunityHome from "./pages/community/CommunityHome";
import CommunityPeople from "./pages/community/CommunityPeople";
import CommunityStories from "./pages/community/CommunityStories";
import CommunityStorySquare from "./pages/community/CommunityStorySquare";
import CommunityStoryEditor from "./pages/community/CommunityStoryEditor";
import CommunityPractice from "./pages/community/CommunityPractice";
import CommunityMessages from "./pages/community/CommunityMessages";
import CommunitySettings from "./pages/community/CommunitySettings";
import CommunityAdminApplications from "./pages/community/CommunityAdminApplications";
import CommunityAdminIdentities from "./pages/community/CommunityAdminIdentities";
import CommunityAdminReports from "./pages/community/CommunityAdminReports";
import CommunityAdminFieldNotes from "./pages/community/CommunityAdminFieldNotes";
import CommunityAdminAnalytics from "./pages/community/CommunityAdminAnalytics";

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
          <AuthProvider>
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
              <Route path="/voices" element={<Navigate to="/about#team" replace />} />
              <Route path="/voices/:slug" element={<VoiceArticle />} />
              <Route path="/join" element={<JoinUs />} />
              <Route path="/join/apply" element={<JoinApply />} />
              <Route path="/community/auth" element={<CommunityAuth />} />
              <Route path="/community/auth/callback" element={<CommunityAuthCallback />} />
              <Route path="/community/reset-password" element={<CommunityResetPassword />} />
              <Route path="/community/guardian-consent" element={<GuardianConsent />} />
              <Route path="/community/enter" element={<CommunitySmartEntry />} />

              <Route element={<CommunityRequireAuth />}>
                <Route path="/community/onboarding" element={<CommunityOnboarding />} />
                <Route path="/community/apply" element={<CommunityApply />} />
                <Route path="/community/application" element={<CommunityApplicationStatus />} />

                <Route element={<CommunityRequirePermission permission="memberships.review" />}>
                  <Route path="/community/admin/applications" element={<div className="community-page-frame"><CommunityAdminApplications /></div>} />
                </Route>
                <Route element={<CommunityRequirePermission permission="people.manage" />}>
                  <Route path="/community/admin/identities" element={<div className="community-page-frame"><CommunityAdminIdentities /></div>} />
                </Route>
                <Route element={<CommunityRequirePermission permission="messages.moderate" />}>
                  <Route path="/community/admin/reports" element={<div className="community-page-frame"><CommunityAdminReports /></div>} />
                </Route>
                <Route element={<CommunityRequireAnyPermission permissions={['field_notes.review', 'field_notes.approve', 'field_notes.publish']} />}>
                  <Route path="/community/admin/field-notes" element={<div className="community-page-frame"><CommunityAdminFieldNotes /></div>} />
                </Route>
                <Route element={<CommunityRequirePermission permission="analytics.read" />}>
                  <Route path="/community/admin/analytics" element={<div className="community-page-frame"><CommunityAdminAnalytics /></div>} />
                </Route>

                <Route element={<CommunityRequireMember />}>
                  <Route path="/community" element={<CommunityShell />}>
                    <Route index element={<CommunityHome />} />
                    <Route path="people" element={<CommunityPeople />} />
                    <Route path="stories" element={<CommunityStories />} />
                    <Route path="stories/square" element={<CommunityStorySquare />} />
                    <Route path="stories/new" element={<CommunityStoryEditor />} />
                    <Route path="stories/:noteId/edit" element={<CommunityStoryEditor />} />
                    <Route path="practice" element={<CommunityPractice />} />
                    <Route path="messages" element={<CommunityMessages />} />
                    <Route path="settings" element={<CommunitySettings />} />
                  </Route>
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
