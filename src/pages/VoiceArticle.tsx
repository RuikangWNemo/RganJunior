import { Navigate, useParams } from 'react-router-dom';
import { getVoiceStory } from '@/content/voiceStories';
import NotFound from './NotFound';

// Preserve existing founder-story URLs while keeping one managed article page.
export default function VoiceArticle() {
  const { slug } = useParams<{ slug: string }>();
  return getVoiceStory(slug)
    ? <Navigate to={`/field-notes/${slug}`} replace />
    : <NotFound />;
}
