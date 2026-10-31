'use client';

import { FlaskConical } from 'lucide-react';

/**
 * Demo mode only: when the API has no SMTP server it can't email anything, so it returns what the
 * email would contain (`preview`) and we show it here. With SMTP configured this never appears.
 */
export default function MailPreview({ preview, kind = 'code' }) {
  if (!preview) return null;
  return (
    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"><FlaskConical className="h-3.5 w-3.5" />Demo mode — email not configured</p>
      {kind === 'link' ? (
        <p className="mt-1.5">The reset email would contain this link: <a href={preview} className="whitespace-nowrap font-semibold underline">Open reset link</a></p>
      ) : (
        <p className="mt-1.5">The email would contain the code <b className="font-mono text-base tracking-widest">{preview}</b></p>
      )}
    </div>
  );
}
