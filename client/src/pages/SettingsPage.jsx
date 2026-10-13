import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, Database, Moon, RefreshCw, Server, Sun, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useTheme } from "../context/ThemeContext";

function Panel({ children, className = "" }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 ${className}`}>{children}</section>;
}

function StatusPill({ good, children }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${good ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"}`}>{good ? <CheckCircle2 size={13} /> : <CircleAlert size={13} />}{children}</span>;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkedAt, setCheckedAt] = useState(null);

  const checkConnection = useCallback(async () => {
    setChecking(true);
    setHealthError("");
    try {
      const response = await api.get("/health");
      setHealth(response.data || null);
      setCheckedAt(new Date());
    } catch (error) {
      setHealth(null);
      setHealthError(error?.response?.data?.message || error?.message || "Could not reach the API health endpoint.");
      setCheckedAt(new Date());
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { checkConnection(); }, [checkConnection]);

  const apiHealthy = Boolean(health?.success && health?.status === "ok");
  const databaseConnected = health?.database === "connected";

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6">
      <section>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"><span className="h-2 w-2 rounded-full bg-slate-500" /> PREFERENCES & SYSTEM</div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Personalize the interface and check whether InsightCart's API and database are reachable.</p>
      </section>

      <Panel>
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-violet-50 p-2.5 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"><Sun size={19} /></div>
          <div><h2 className="font-semibold text-slate-900 dark:text-slate-100">Appearance</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose the theme for this browser. Your selection is saved automatically.</p></div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")} className={`rounded-xl border p-4 text-left transition ${theme === "light" ? "border-teal-500 bg-teal-50/70 ring-1 ring-teal-500 dark:bg-teal-950/20" : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"}`}>
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"><Sun size={17} /> Light theme {theme === "light" && <CheckCircle2 size={15} className="ml-auto text-teal-600" />}</span>
            <span className="mt-2 block text-xs leading-5 text-slate-500 dark:text-slate-400">Bright surfaces with subtle borders and readable charts.</span>
            <span className="mt-4 flex h-12 overflow-hidden rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700"><span className="w-1/4 rounded bg-slate-100" /><span className="ml-2 flex-1 rounded bg-slate-50" /><span className="ml-2 w-3 rounded bg-teal-500" /></span>
          </button>
          <button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")} className={`rounded-xl border p-4 text-left transition ${theme === "dark" ? "border-teal-500 bg-teal-50/70 ring-1 ring-teal-500 dark:bg-teal-950/20" : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"}`}>
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"><Moon size={17} /> Dark theme {theme === "dark" && <CheckCircle2 size={15} className="ml-auto text-teal-600" />}</span>
            <span className="mt-2 block text-xs leading-5 text-slate-500 dark:text-slate-400">Dark surfaces with softened contrast for low-light use.</span>
            <span className="mt-4 flex h-12 overflow-hidden rounded-lg border border-slate-700 bg-slate-950 p-2"><span className="w-1/4 rounded bg-slate-800" /><span className="ml-2 flex-1 rounded bg-slate-900" /><span className="ml-2 w-3 rounded bg-teal-400" /></span>
          </button>
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="flex items-start gap-3"><div className="rounded-xl bg-sky-50 p-2.5 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"><Server size={19} /></div><div><h2 className="font-semibold text-slate-900 dark:text-slate-100">Connection health</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Live check of the configured API and its MongoDB connection.</p></div></div>
          <button type="button" onClick={checkConnection} disabled={checking} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RefreshCw size={15} className={checking ? "animate-spin" : ""} /> {checking ? "Checking…" : "Check again"}</button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"><Server size={16} /> API server</div><div className="mt-3"><StatusPill good={apiHealthy}>{checking ? "Checking" : apiHealthy ? "Healthy" : "Unreachable"}</StatusPill></div></div>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"><Database size={16} /> MongoDB database</div><div className="mt-3"><StatusPill good={databaseConnected}>{checking ? "Checking" : databaseConnected ? "Connected" : health ? "Disconnected" : "Unknown"}</StatusPill></div></div>
        </div>
        {healthError && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{healthError}</p>}
        {checkedAt && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Last checked: {checkedAt.toLocaleTimeString()}</p>}
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">The status is read from the real <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">/api/health</code> endpoint; this page doesn't change server or database configuration.</p>
      </Panel>

      <Panel>
        <div className="flex items-start gap-3"><div className="rounded-xl bg-teal-50 p-2.5 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"><Database size={19} /></div><div className="flex-1"><h2 className="font-semibold text-slate-900 dark:text-slate-100">Data & analytics</h2><p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Reports use data returned by the Express API and MongoDB. Customer segmentation uses eligible order history, while sales charts follow the selected date and category filters.</p><Link to="/analytics" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200">Open Analytics Studio <ExternalLink size={14} /></Link></div></div>
      </Panel>
    </main>
  );
}
