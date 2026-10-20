import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink text-white grid place-items-center p-6 text-center">
      <div>
        <h1 className="text-7xl font-extrabold text-lime">404</h1>
        <p className="text-white/60 mt-3">This route doesn't exist.</p>
        <Link to="/" className="inline-block mt-6 px-6 py-3 rounded-full bg-lime text-ink font-semibold">
          Back to RydEx
        </Link>
      </div>
    </div>
  );
}
