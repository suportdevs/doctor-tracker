import { Activity, LineChart, ShieldCheck, Stethoscope } from 'lucide-react';

// Sign-in frame: photo panel left, form right.
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.1fr_1fr]">
      <div className="relative m-3 hidden overflow-hidden rounded-2xl bg-brand-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <img src="/images/site/care-team.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-900/70 to-brand-700/30" />
        <p className="relative flex items-center gap-2.5 text-lg font-semibold">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-600"><Stethoscope className="h-5 w-5" /></span>
          Doctor Tracker
        </p>
        <div className="relative max-w-lg">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Every doctor, every patient, <span className="text-brand-300">one clear view.</span>
          </h1>
          <p className="mt-4 text-white/70">Manage doctors and their patients, and follow your clinic’s numbers on one dashboard.</p>
          <ul className="mt-8 grid gap-2 text-sm sm:grid-cols-3">
            {[[LineChart, 'Live analytics'], [Activity, 'Condition tracking'], [ShieldCheck, 'Secure sign-in']].map(([Icon, text]) => (
              <li key={text} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-md"><Icon className="h-4 w-4 text-brand-300" />{text}</li>
            ))}
          </ul>
          <p className="mt-8 text-xs text-white/50">© {new Date().getFullYear()} Doctor Tracker</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600 text-white"><Stethoscope className="h-5 w-5" /></span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink-950">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
