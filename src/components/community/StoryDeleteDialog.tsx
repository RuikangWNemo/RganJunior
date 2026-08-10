import { Loader2, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Translate = (zh: string, en: string) => string;

export default function StoryDeleteDialog({
  open,
  permanent,
  title,
  busy,
  t,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  permanent: boolean;
  title: string;
  busy: boolean;
  t: Translate;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => { if (!busy) onOpenChange(nextOpen); }}>
      <AlertDialogContent className="rounded-[1.6rem] border-[hsl(var(--community-forest)/0.14)] bg-[hsl(var(--community-paper))] p-6 sm:p-7">
        <AlertDialogHeader>
          <span className="mb-2 grid size-11 place-items-center rounded-2xl rounded-bl-md bg-destructive/10 text-destructive">
            <Trash2 className="size-5" aria-hidden="true" />
          </span>
          <AlertDialogTitle className="font-serif text-2xl text-[hsl(var(--community-forest))]">
            {permanent ? t('永久删除这篇文章？', 'Permanently delete this story?') : t('把草稿移入回收站？', 'Move this draft to Trash?')}
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-1 leading-6 text-[hsl(var(--community-forest)/0.62)]">
            {permanent
              ? t(`“${title}”的正文、版本和协作记录都会被永久删除，且无法恢复。`, `“${title}” and its content, versions, and collaboration history will be permanently removed.`)
              : t(`“${title}”会进入回收站，你可以稍后恢复。`, `“${title}” will move to Trash and can be restored later.`)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-3">
          <AlertDialogCancel disabled={busy} className="rounded-full border-[hsl(var(--community-forest)/0.18)] bg-transparent">
            {t('取消', 'Cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" /> : null}
            {permanent ? t('永久删除', 'Delete forever') : t('移入回收站', 'Move to Trash')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
