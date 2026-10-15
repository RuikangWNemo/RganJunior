import { cn } from '@/lib/utils';
import '@/styles/join-roles.css';

export default function MiniOrange({ className }: { className?: string }) {
  return <span className={cn('join-mini-orange', className)} aria-hidden="true" />;
}
