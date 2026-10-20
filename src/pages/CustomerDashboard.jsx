import { Activity, ArrowRight, CarFront, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const dashboardLinks = [
  { title: "Ride activity", description: "Review your ride history and receipts.", icon: Activity },
  { title: "Profile and preferences", description: "View your account and ride preferences.", icon: UserRound },
  { title: "Book a ride", description: "Enter a route and compare available ride categories.", icon: CarFront },
];

export default function CustomerDashboard({ preview = false }) {
  const { profile, user } = useAuth();

  return (
    <main className="min-h-[calc(100vh-64px)] bg-ink px-4 py-10 text-white sm:px-6 sm:py-14">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-lime">Your Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {profile?.full_name ? `Hello, ${profile.full_name}` : "Welcome to RydEx"}
        </h1>
        {user?.email && <p className="mt-2 text-sm text-white/55">{user.email}</p>}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {dashboardLinks.map(({ title, description, icon: Icon }) => preview ? (
              <div key={title} className="group rounded-2xl border border-white/10 bg-surface p-5">
                <Icon size={25} className="text-lime" />
                <h2 className="mt-5 font-semibold">{title}</h2>
                <p className="mt-2 min-h-12 text-sm leading-relaxed text-white/55">{description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/40">Preview only <ArrowRight size={15} /></span>
              </div>
            ) : (
              <Link key={title} to="/book" className="group rounded-2xl border border-white/10 bg-surface p-5 transition hover:border-lime/40">
                <Icon size={25} className="text-lime" />
                <h2 className="mt-5 font-semibold">{title}</h2>
                <p className="mt-2 min-h-12 text-sm leading-relaxed text-white/55">{description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-lime">Open <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
