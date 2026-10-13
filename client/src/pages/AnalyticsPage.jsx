import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ShieldAlert, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { FilterBar } from "../components/dashboard/FilterBar";
import { StatCardsGrid } from "../components/dashboard/StatCardsGrid";
import { RevenueChart } from "../components/dashboard/RevenueChart";
import { OrdersChart } from "../components/dashboard/OrdersChart";
import { CategoryChart } from "../components/dashboard/CategoryChart";
import { OrderStatusChart } from "../components/dashboard/OrderStatusChart";
import { TopProductsTable } from "../components/dashboard/TopProductsTable";
import { getCustomerSegments } from "../api/analyticsApi";
import { formatNumber } from "../utils/formatters";

function SnapshotMetric({ label, value, detail, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <span className="rounded-xl bg-teal-50 p-2 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"><Icon size={17} /></span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [customerPayload, setCustomerPayload] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [customerError, setCustomerError] = useState("");

  useEffect(() => {
    let active = true;
    getCustomerSegments()
      .then((result) => { if (active) setCustomerPayload(result); })
      .catch((error) => {
        if (active) setCustomerError(error?.response?.data?.message || error?.message || "Customer insight data is unavailable.");
      })
      .finally(() => { if (active) setCustomerLoading(false); });
    return () => { active = false; };
  }, []);

  const segments = customerPayload?.segments || [];
  const sortedSegments = useMemo(
    () => [...segments].sort((a, b) => (b.count || 0) - (a.count || 0)),
    [segments]
  );
  const segmentByName = useMemo(
    () => Object.fromEntries(segments.map((segment) => [segment.name, segment])),
    [segments]
  );
  const atRiskCount = (segmentByName["At Risk"]?.count || 0) + (segmentByName.Hibernating?.count || 0);
  const totalCustomers = customerPayload?.totalCustomers || 0;
  const topSegment = sortedSegments[0];
  const maxSegmentCount = Math.max(1, ...segments.map((segment) => segment.count || 0));

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300">
            <span className="h-2 w-2 rounded-full bg-violet-500" /> ANALYTICS STUDIO
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">Understand what drives performance.</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Explore sales, order health, product performance, and customer segments using your connected store data.</p>
        </div>
        <Link to="/customers" className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800">
          Explore customer intelligence <ArrowUpRight size={16} />
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/80 sm:p-5">
        <FilterBar />
      </section>

      <section className="space-y-3">
        <div><h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Sales performance</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Summary metrics and period-over-period trends use the selected filters.</p></div>
        <StatCardsGrid />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <RevenueChart />
          <OrdersChart />
        </div>
      </section>

      <section className="space-y-3">
        <div><h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Product mix & order health</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">See how revenue is distributed and what statuses orders are currently in.</p></div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <CategoryChart />
          <OrderStatusChart />
        </div>
        <TopProductsTable />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <div className="mb-2 flex items-center gap-2 text-teal-700 dark:text-teal-300"><Sparkles size={17} /><span className="text-xs font-semibold uppercase tracking-wide">Customer behavior snapshot</span></div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Know which customers need attention</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">RFM segments are calculated from eligible order history. They aren't narrowed by the sales-date filter above.</p>
          </div>
          <Link to="/customers" className="shrink-0 text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200">Open customer page →</Link>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SnapshotMetric label="Customers analyzed" value={customerLoading ? "…" : formatNumber(totalCustomers)} detail="Customers with eligible orders" icon={Users} />
          <SnapshotMetric label="Largest segment" value={customerLoading ? "…" : (topSegment?.name || "—")} detail={customerLoading ? "Loading segment data" : (topSegment ? `${formatNumber(topSegment.count || 0)} customers in this group` : "No segment data available")} icon={Sparkles} />
          <SnapshotMetric label="At risk + hibernating" value={customerLoading ? "…" : formatNumber(atRiskCount)} detail="Potential win-back opportunities" icon={ShieldAlert} />
        </div>
        {customerLoading ? (
          <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">Loading customer segments…</p>
        ) : customerError ? (
          <p role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">{customerError} Sales analytics above are still available.</p>
        ) : sortedSegments.length ? (
          <div className="mt-5 space-y-3">
            {sortedSegments.slice(0, 4).map((segment) => (
              <div key={segment.name}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{segment.name}</span>
                  <span className="tabular-nums text-slate-500 dark:text-slate-400">{formatNumber(segment.count || 0)} customers</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-[width] duration-700" style={{ width: `${Math.max(0, Math.min(100, ((segment.count || 0) / maxSegmentCount) * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">No eligible customer segments are available yet.</p>
        )}
      </section>
    </main>
  );
}
