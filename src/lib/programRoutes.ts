interface LegacyProgramsLocation {
  inquiry?: boolean;
  search?: string;
  hash?: string;
}

export function getLegacyProgramsRedirect({
  inquiry = false,
  search = '',
  hash = '',
}: LegacyProgramsLocation) {
  const pathname = inquiry ? '/programs/inquiry' : '/programs';

  return `${pathname}${search}${hash}`;
}
