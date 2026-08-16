import { Route, Routes } from 'react-router-dom';
import BrandHead from '@/components/BrandHead';
import CommunityChrome from '@/components/community/CommunityChrome';
import CommunityShell from '@/components/community/CommunityShell';
import {
  CommunityRequireAuth,
  CommunityRequireAnyPermission,
  CommunityRequireMember,
  CommunityRequirePermission,
  CommunitySmartEntry,
} from '@/components/community/CommunityRouteGuards';
import { AuthProvider } from '@/contexts/AuthContext';
import NotFound from '@/pages/NotFound';
import CommunityAuth from './CommunityAuth';
import CommunityAuthCallback from './CommunityAuthCallback';
import CommunityResetPassword from './CommunityResetPassword';
import CommunityOnboarding from './CommunityOnboarding';
import CommunityApply from './CommunityApply';
import CommunityApplicationStatus from './CommunityApplicationStatus';
import GuardianConsent from './GuardianConsent';
import CommunityHome from './CommunityHome';
import CommunityPeople from './CommunityPeople';
import CommunityStories from './CommunityStories';
import CommunityStorySquare from './CommunityStorySquare';
import CommunityStoryEditor from './CommunityStoryEditor';
import CommunityPractice from './CommunityPractice';
import CommunityMessages from './CommunityMessages';
import CommunitySettings from './CommunitySettings';
import CommunityAdminApplications from './CommunityAdminApplications';
import CommunityAdminIdentities from './CommunityAdminIdentities';
import CommunityAdminReports from './CommunityAdminReports';
import CommunityAdminFieldNotes from './CommunityAdminFieldNotes';
import CommunityAdminAnalytics from './CommunityAdminAnalytics';

export default function CommunityRoutes() {
  return (
    <AuthProvider>
      <BrandHead />
      <CommunityChrome>
        <div className="route-stage flex-1">
          <main
            className="route-page-shell community-route-page-shell flex-1"
            data-route-transition="stable"
          >
            <Routes>
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
          </main>
        </div>
      </CommunityChrome>
    </AuthProvider>
  );
}
