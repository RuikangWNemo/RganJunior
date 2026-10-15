import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import LegacyCommunityStoriesRedirect from './LegacyCommunityStoriesRedirect';
function Destination() {
  const { pathname, search, hash } = useLocation();
  return <output>{pathname}{search}{hash}</output>;
}
describe('legacy public story links', () => {
  it.each([
    ['/field-notes', '/community-stories'],
    ['/field-notes/all?person=founding-team#field-note-archive', '/community-stories/all?person=founding-team#field-note-archive'],
    ['/field-notes/summer-co-creation-camp-invitation?lang=en', '/community-stories/summer-co-creation-camp-invitation?lang=en'],
  ])('redirects %s while preserving filters and anchors', async (from, to) => {
    render(<MemoryRouter initialEntries={[from]}><Routes>
      <Route path="/field-notes/*" element={<LegacyCommunityStoriesRedirect />} />
      <Route path="/community-stories/*" element={<Destination />} />
    </Routes></MemoryRouter>);
    expect(await screen.findByRole('status')).toHaveTextContent(to);
  });
});
