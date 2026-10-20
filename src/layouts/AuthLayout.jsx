import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-ink text-white flex flex-col">
      <header className="p-6">
        <Link to="/" className="text-2xl gabriela-regular tracking-tight">
          Ryd<span className="text-lime">Ex</span>
        </Link>
      </header>
      <main className="flex-1 grid place-items-center px-6 pb-10">
        <div className="w-full max-w-md"><Outlet /></div>
      </main>
    </div>
  );
}
