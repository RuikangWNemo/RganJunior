import { Navigate, useLocation, useParams } from 'react-router-dom';
import ProgramDetailLayout from '@/components/programs/ProgramDetailLayout';
import ActionGroupDetails from '@/components/programs/details/ActionGroupDetails';
import LifeCoCreationCampDetails from '@/components/programs/details/LifeCoCreationCampDetails';
import LifeExperienceCampDetails from '@/components/programs/details/LifeExperienceCampDetails';
import PublicProjectsDetails from '@/components/programs/details/PublicProjectsDetails';
import { findActionProgram, type ActionProgramId } from '@/content/actionPrograms';
import NotFound from './NotFound';

const detailComponents: Record<ActionProgramId, () => JSX.Element> = {
  'life-experience-camp': LifeExperienceCampDetails,
  'life-co-creation-camp': LifeCoCreationCampDetails,
  'action-group': ActionGroupDetails,
  'public-projects': PublicProjectsDetails,
};

export default function ProgramDetail() {
  const { programId } = useParams<{ programId: string }>();
  const location = useLocation();

  if (programId === 'life-camp') {
    return (
      <Navigate
        to={`/programs/life-co-creation-camp${location.search}${location.hash}`}
        replace
      />
    );
  }

  const program = findActionProgram(programId);

  if (!program) return <NotFound />;

  const Details = detailComponents[program.id];

  return (
    <ProgramDetailLayout program={program}>
      <Details />
    </ProgramDetailLayout>
  );
}
