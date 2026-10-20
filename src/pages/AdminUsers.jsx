import { useEffect, useState } from "react";
import { ShieldCheck, Users } from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../lib/firebase";

const ASSIGNABLE_ROLES = ["pending", "customer", "driver"];
const PREVIEW_ACCOUNTS = [
  {
    id: "preview-customer",
    full_name: "Alex Customer",
    email: "alex.customer@example.com",
    role: "pending",
    email_verified: true,
  },
  {
    id: "preview-driver",
    full_name: "Sam Driver",
    email: "sam.driver@example.com",
    role: "pending",
    email_verified: true,
  },
];

export default function AdminUsers({ preview = false }) {
  const [accounts, setAccounts] = useState(() => preview ? PREVIEW_ACCOUNTS : []);
  const [loading, setLoading] = useState(!preview);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (preview) return undefined;

    let active = true;
    getDocs(query(collection(db, "profiles"), orderBy("created_at", "desc")))
      .then((snapshot) => {
        if (!active) return;
        setAccounts(snapshot.docs.map((account) => ({ id: account.id, ...account.data() })));
        setLoading(false);
      }).catch((queryError) => {
        if (!active) return;
        console.error("Failed to load accounts for admin", queryError);
        setError("We couldn't load accounts. Please try again.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [preview]);

  const assignRole = async (account, role) => {
    setError("");
    setNotice("");

    if (preview) {
      setAccounts((current) => current.map((item) => (
        item.id === account.id ? { ...item, role } : item
      )));
      setNotice(`Preview: updated ${account.email || account.full_name || "account"} to ${role}. No Firebase data was changed.`);
      return;
    }

    setSavingId(account.id);
    try {
      const assignProfileRole = httpsCallable(functions, "assignProfileRole");
      await assignProfileRole({ targetUid: account.id, role });

      setAccounts((current) => current.map((item) => (
        item.id === account.id ? { ...item, role } : item
      )));
      setNotice(`Updated ${account.email || account.full_name || "account"} to ${role}.`);
    } catch (assignError) {
      console.error("Failed to assign account role", assignError);
      setError(assignError.message || "We couldn't update this account role.");
    } finally {
      setSavingId("");
    }
  };

  const pendingCount = accounts.filter(({ role }) => role === "pending").length;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-ink px-4 py-10 text-white sm:px-6 sm:py-14">
      <section className="mx-auto max-w-5xl">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-lime/10 text-lime"><ShieldCheck size={25} /></div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account management</h1>
            <p className="mt-1 text-sm text-white/55">Assign each new account as a customer or driver.</p>
          </div>
        </div>

        <div className="mt-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-surface p-4">
          <Users size={20} className="text-lime" />
          <p className="text-sm text-white/70">{accounts.length} accounts <span className="mx-2 text-white/25">·</span> {pendingCount} awaiting assignment</p>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}
        {notice && <p role="status" className="mt-5 rounded-xl border border-lime/20 bg-lime/10 p-3 text-sm text-lime">{notice}</p>}

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-surface">
          {loading ? (
            <p className="p-6 text-sm text-white/60">Loading accounts…</p>
          ) : accounts.length === 0 ? (
            <p className="p-6 text-sm text-white/60">No accounts have signed up yet.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {accounts.map((account) => (
                <li key={account.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{account.full_name || "Name not provided"}</p>
                    <p className="mt-1 truncate text-sm text-white/50">{account.email || account.id}</p>
                    <p className="mt-1 text-xs text-white/35">
                      Created {account.created_at?.toDate ? account.created_at.toDate().toLocaleDateString() : "recently"}
                      {account.email_verified === true ? " · Email verified" :
                        account.email_verified === false ? " · Email not verified" :
                          " · Email verification not checked"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      account.role === "pending" ? "bg-amber-400/10 text-amber-300" :
                      account.role === "admin" ? "bg-violet-400/10 text-violet-300" :
                      "bg-lime/10 text-lime"
                    }`}>{account.role}</span>
                    {account.role !== "admin" && (
                      <select
                        aria-label={`Assign role for ${account.email || account.full_name || "account"}`}
                        value={account.role}
                        disabled={savingId === account.id}
                        onChange={(event) => assignRole(account, event.target.value)}
                        className="rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm text-white focus:border-lime focus:outline-none disabled:opacity-50"
                      >
                        {ASSIGNABLE_ROLES.map((role) => <option key={role} value={role}>{role[0].toUpperCase() + role.slice(1)}</option>)}
                      </select>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
