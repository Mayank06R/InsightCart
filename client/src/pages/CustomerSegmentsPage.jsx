import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Crown,
  Download,
  HeartHandshake,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
  UserRoundX,
  Clock3,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCustomerSegments } from "../api/analyticsApi";
const CustomerSegments3D = lazy(() =>
  import("../components/dashboard/CustomerSegments3D").then((module) => ({
    default: module.CustomerSegments3D,
  }))
);

const SEGMENT_META = {
  Champions: {
    description: "Recent, frequent, high-value buyers",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
    icon: Crown,
  },
  "Loyal Customers": {
    description: "Repeat customers with strong frequency",
    className: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
    icon: HeartHandshake,
  },
  "Potential Loyalists": {
    description: "Recent buyers with room to grow",
    className: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300",
    icon: Users,
  },
  "At Risk": {
    description: "Previously active, now drifting away",
    className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
    icon: ShieldAlert,
  },
  Hibernating: {
    description: "Long time since the last purchase",
    className: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
    icon: Clock3,
  },
  "Needs Attention": {
    description: "Low activity or inconsistent engagement",
    className: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
    icon: UserRoundX,
  },
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function safeDate(value) {
  if (!value) return "â€”";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "â€”"
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function csvCell(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function exportCustomers(rows) {
  const columns = [
    ["Name", (row) => row.name],
    ["Email", (row) => row.email],
    ["City", (row) => row.city],
    ["Country", (row) => row.country],
    ["Segment", (row) => row.segment],
    ["Last purchase", (row) => row.lastPurchase],
    ["Days since purchase", (row) => row.recencyDays],
    ["Eligible orders", (row) => row.frequency],
    ["Customer spend (USD)", (row) => row.monetary],
    ["RFM score", (row) => row.rfmScore],
  ];
  const csv = [
    columns.map(([label]) => csvCell(label)).join(","),
    ...rows.map((row) => columns.map(([, getValue]) => csvCell(getValue(row))).join(",")),
  ].join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "insightcart-customer-segments.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function MetricCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
        </div>
        <div className="rounded-xl bg-teal-50 p-3 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function CustomerSegmentsPage() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("All segments");
  const [sortBy, setSortBy] = useState("spend");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getCustomerSegments();
      setPayload(result);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Could not load customer segmentation.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const customers = payload?.customers || [];
  const segments = payload?.segments || [];
  const segmentByName = useMemo(
    () => Object.fromEntries(segments.map((segment) => [segment.name, segment])),
    [segments]
  );

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const result = customers.filter((customer) => {
      const matchesSegment = selectedSegment === "All segments" || customer.segment === selectedSegment;
      const haystack = `${customer.name || ""} ${customer.email || ""} ${customer.city || ""} ${customer.country || ""}`.toLowerCase();
      return matchesSegment && (!normalizedSearch || haystack.includes(normalizedSearch));
    });
    result.sort((a, b) => {
      if (sortBy === "recency") return (a.recencyDays ?? Infinity) - (b.recencyDays ?? Infinity);
      if (sortBy === "orders") return (b.frequency || 0) - (a.frequency || 0);
      if (sortBy === "rfm") return String(b.rfmScore || "").localeCompare(String(a.rfmScore || ""));
      return (b.monetary || 0) - (a.monetary || 0);
    });
    return result;
  }, [customers, search, selectedSegment, sortBy]);

  const atRiskCount = (segmentByName["At Risk"]?.count || 0) + (segmentByName.Hibernating?.count || 0);
  const totalRevenue = segments.reduce((sum, segment) => sum + (segment.revenue || 0), 0);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300">
            <span className="h-2 w-2 rounded-full bg-teal-500" /> CUSTOMER INTELLIGENCE
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">Know your customers. Grow your business.</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">RFM segmentation turns eligible order history into actionable customer groups using recency, order frequency, and spend.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={loadData} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button type="button" onClick={() => exportCustomers(filteredCustomers)} disabled={!filteredCustomers.length} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </section>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1"><p className="font-semibold">Customer analytics could not be loaded</p><p className="mt-1">{error}</p></div>
          <button type="button" onClick={loadData} className="font-semibold underline">Try again</button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Customers analyzed" value={loading ? "â€”" : (payload?.totalCustomers ?? 0).toLocaleString()} detail="Customers with eligible orders" icon={Users} />
        <MetricCard label="Customer segments" value={loading ? "â€”" : segments.length} detail="Behavior-based RFM groups" icon={HeartHandshake} />
        <MetricCard label="Champions" value={loading ? "â€”" : (segmentByName.Champions?.count || 0).toLocaleString()} detail="Recent, frequent, high-value buyers" icon={Crown} />
        <MetricCard label="At risk + hibernating" value={loading ? "â€”" : atRiskCount.toLocaleString()} detail="Potential win-back opportunities" icon={ShieldAlert} />
      </section>

      <Suspense
        fallback={
          <div role="status" className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
            Loading interactive customer universe...
          </div>
        }
      >
        <CustomerSegments3D
          segments={segments}
          selectedSegment={selectedSegment}
          totalCustomers={payload?.totalCustomers ?? 0}
          loading={loading}
          onSelectSegment={(name) =>
            setSelectedSegment((current) => (current === name ? "All segments" : name))
          }
        />
      </Suspense>
      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div><h2 className="font-semibold text-slate-900 dark:text-slate-100">Customer distribution</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Customers by segment</p></div>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{payload?.totalCustomers || 0} customers</span>
          </div>
          <div className="mt-4 h-72">
            {loading ? <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading chartâ€¦</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segments} margin={{ top: 8, right: 8, left: -18, bottom: 38 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.12} />
                  <XAxis dataKey="name" interval={0} angle={-22} textAnchor="end" height={62} tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.65} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.65} />
                  <Tooltip formatter={(value) => [value, "Customers"]} contentStyle={{ borderRadius: 12, border: "1px solid #cbd5e1" }} />
                  <Bar dataKey="count" name="Customers" fill="#0f766e" radius={[6, 6, 0, 0]} maxBarSize={46} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Segment overview</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Select a segment to filter the customer list</p>
          <div className="mt-4 space-y-2">
            {segments.map((segment) => {
              const meta = SEGMENT_META[segment.name] || SEGMENT_META["Needs Attention"];
              const Icon = meta.icon;
              const active = selectedSegment === segment.name;
              return (
                <button key={segment.name} type="button" onClick={() => setSelectedSegment(active ? "All segments" : segment.name)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${active ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500 dark:bg-teal-950/30" : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/70"}`}>
                  <span className={`rounded-lg border p-2 ${meta.className}`}><Icon size={16} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{segment.name}</span><span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{meta.description}</span></span>
                  <span className="text-right"><span className="block text-sm font-bold text-slate-900 dark:text-slate-100">{segment.count}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{money.format(segment.revenue || 0)}</span></span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800"><div className="flex items-center justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Total segment revenue</span><span className="font-semibold text-slate-900 dark:text-slate-100">{loading ? "â€”" : money.format(totalRevenue)}</span></div></div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="font-semibold text-slate-900 dark:text-slate-100">Customer segments</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Search customers, inspect RFM scores, and export the filtered results.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, cityâ€¦" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:w-64" /></label>
            <select value={selectedSegment} onChange={(event) => setSelectedSegment(event.target.value)} aria-label="Filter by customer segment" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"><option>All segments</option>{segments.map((segment) => <option key={segment.name}>{segment.name}</option>)}</select>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort customers" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"><option value="spend">Highest spend</option><option value="recency">Most recent purchase</option><option value="orders">Most orders</option><option value="rfm">RFM score</option></select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/60 dark:text-slate-400"><tr><th className="px-5 py-3 font-semibold">Customer</th><th className="px-4 py-3 font-semibold">Segment</th><th className="px-4 py-3 font-semibold">Last purchase</th><th className="px-4 py-3 text-right font-semibold">Orders</th><th className="px-4 py-3 text-right font-semibold">Spend</th><th className="px-5 py-3 text-right font-semibold">RFM</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">Loading customer dataâ€¦</td></tr> : filteredCustomers.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No customers match these filters.</td></tr> : filteredCustomers.map((customer) => {
                const meta = SEGMENT_META[customer.segment] || SEGMENT_META["Needs Attention"];
                return <tr key={customer.customerId} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"><td className="px-5 py-4"><div className="font-semibold text-slate-900 dark:text-slate-100">{customer.name}</div><div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{customer.email}</div><div className="mt-0.5 text-xs text-slate-400">{[customer.city, customer.country].filter(Boolean).join(", ")}</div></td><td className="px-4 py-4"><span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}>{customer.segment}</span></td><td className="px-4 py-4"><div className="text-slate-700 dark:text-slate-200">{safeDate(customer.lastPurchase)}</div><div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{customer.recencyDays} days ago</div></td><td className="px-4 py-4 text-right font-medium tabular-nums text-slate-700 dark:text-slate-200">{customer.frequency}</td><td className="px-4 py-4 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">{money.format(customer.monetary || 0)}</td><td className="px-5 py-4 text-right"><span className="inline-flex min-w-12 justify-center rounded-lg bg-slate-100 px-2 py-1.5 font-mono text-xs font-bold tracking-widest text-slate-700 dark:bg-slate-800 dark:text-slate-200">{customer.rfmScore}</span></td></tr>;
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"><span>Showing {loading ? 0 : filteredCustomers.length} of {payload?.totalCustomers || 0} eligible customers</span><span>RFM = Recency score Â· Frequency score Â· Monetary score</span></div>
      </section>
    </main>
  );
}
