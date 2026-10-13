import { lazy, Suspense } from "react";
import { FilterBar } from "../components/dashboard/FilterBar";
import { StatCardsGrid } from "../components/dashboard/StatCardsGrid";
import { RevenueChart } from "../components/dashboard/RevenueChart";
import { OrdersChart } from "../components/dashboard/OrdersChart";
import { CategoryChart } from "../components/dashboard/CategoryChart";
import { OrderStatusChart } from "../components/dashboard/OrderStatusChart";
import { TopProductsTable } from "../components/dashboard/TopProductsTable";
import { RecentOrdersTable } from "../components/dashboard/RecentOrdersTable";
import { SectionErrorBoundary } from "../components/common/SectionErrorBoundary";
const CommerceHero3D = lazy(() =>
  import("../components/dashboard/CommerceHero3D").then((module) => ({
    default: module.CommerceHero3D,
  }))
);

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense
        fallback={
          <div
            role="status"
            className="flex min-h-[390px] items-center justify-center rounded-[28px] border border-slate-800 bg-[#070b14] p-6 text-sm text-slate-400"
          >
            Loading interactive 3D scene...
          </div>
        }
      >
        <CommerceHero3D />
      </Suspense>

      <div id="overview-metrics" className="scroll-mt-24 flex flex-col gap-6">
        <FilterBar />
        <SectionErrorBoundary label="stat cards">
          <StatCardsGrid />
        </SectionErrorBoundary>
      </div>

      <div id="sales-insights" className="scroll-mt-24 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionErrorBoundary label="revenue chart">
          <RevenueChart />
        </SectionErrorBoundary>
        <SectionErrorBoundary label="orders chart">
          <OrdersChart />
        </SectionErrorBoundary>
        <SectionErrorBoundary label="category chart">
          <CategoryChart />
        </SectionErrorBoundary>
        <SectionErrorBoundary label="order status chart">
          <OrderStatusChart />
        </SectionErrorBoundary>
      </div>

      <SectionErrorBoundary label="top products">
        <TopProductsTable />
      </SectionErrorBoundary>

      <SectionErrorBoundary label="recent orders">
        <RecentOrdersTable />
      </SectionErrorBoundary>
    </div>
  );
}
