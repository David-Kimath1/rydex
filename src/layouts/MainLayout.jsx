import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-ink text-white">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
    </div>
  );
}
