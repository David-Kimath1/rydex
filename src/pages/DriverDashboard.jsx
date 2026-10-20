import { CarFront, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/useAuth";

export default function DriverDashboard() {
  const { profile } = useAuth();

  return (
    <main className="grid min-h-[calc(100vh-64px)] place-items-center bg-ink px-5 py-10 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-surface p-7 text-center sm:p-10">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-lime/10 text-lime">
          <CarFront size={28} />
        </div>
        <p className="text-sm font-semibold text-lime">Driver account</p>
        <h1 className="mt-2 text-2xl font-bold">Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          Your account is assigned as a RydEx driver. Driver trip and availability tools will be added to this workspace.
        </p>
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-ink p-4 text-left text-xs leading-relaxed text-white/50">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-lime" />
          Driver verification and operational readiness should be completed before accepting rides.
        </div>
      </section>
    </main>
  );
}
