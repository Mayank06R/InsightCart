
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "../ui/Card";

export function StatCard({ title, value, trend, icon: Icon }) {
  const hasTrend = trend !== null && trend !== undefined;
  const isUp = hasTrend && trend >= 0;

  const handleMouseMove = (event) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    element.style.setProperty("--tilt-x", `${(0.5 - y) * 6}deg`);
    element.style.setProperty("--tilt-y", `${(x - 0.5) * 6}deg`);
    element.style.setProperty("--lift", "-3px");
  };

  const handleMouseLeave = (event) => {
    const element = event.currentTarget;
    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
    element.style.setProperty("--lift", "0px");
  };

  return (
    <div
      className="min-w-0"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform:
          "perspective(900px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateY(var(--lift, 0px))",
        transition: "transform 180ms ease",
        willChange: "transform",
      }}
    >
      <Card className="group relative overflow-hidden p-5 transition-[border-color,box-shadow] duration-300 hover:border-brand-500/40 hover:shadow-[0_12px_35px_rgba(20,184,166,0.12)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-500/10 blur-3xl opacity-50 transition-opacity duration-300 group-hover:opacity-100"
        />

        <div className="relative z-10 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          {Icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 dark:bg-brand-900/40 dark:text-brand-400">
              <Icon size={17} />
            </div>
          )}
        </div>

        <p className="relative z-10 mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {value}
        </p>

        {hasTrend ? (
          <p
            className={`relative z-10 mt-2 inline-flex items-center gap-1 text-xs font-medium ${
              isUp
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {isUp ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}
            {Math.abs(trend)}% vs previous period
          </p>
        ) : (
          <p className="relative z-10 mt-2 text-xs text-slate-500 dark:text-slate-400">
            vs previous period: n/a
          </p>
        )}
      </Card>
    </div>
  );
}
