import { Toaster } from "@/components/ui/sonner";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouter,
} from "@tanstack/react-router";
import { ArrowLeft, Leaf } from "lucide-react";
import { SupplyChainProvider } from "./context/SupplyChainContext";
import type { UserRole } from "./lib/supply-chain-types";
import { BatchDetail } from "./pages/BatchDetail";
import { ConsumerDashboard } from "./pages/ConsumerDashboard";
import { ConsumerScan } from "./pages/ConsumerScan";
import { FarmerDashboard } from "./pages/FarmerDashboard";
import { Index } from "./pages/Index";
import { RoleDashboard } from "./pages/RoleDashboard";

function AppLayout() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.history.back()}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            data-ocid="layout.back_button"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <Link
            to="/"
            className="flex items-center gap-2"
            data-ocid="layout.home_link"
          >
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-base tracking-tight">
              AgriTrace
            </span>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <SupplyChainProvider>
      <Outlet />
      <Toaster />
    </SupplyChainProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Index,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: AppLayout,
});

const farmerRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/farmer",
  component: FarmerDashboard,
});

const consumerRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/consumer",
  component: ConsumerDashboard,
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/dashboard/$role",
  component: () => {
    const { role } = dashboardRoute.useParams();
    return <RoleDashboard role={role as UserRole} />;
  },
});

const batchDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/batch/$batchId",
  component: BatchDetail,
});

const consumerScanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/scan/$batchId",
  component: ConsumerScan,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  layoutRoute.addChildren([
    farmerRoute,
    consumerRoute,
    dashboardRoute,
    batchDetailRoute,
  ]),
  consumerScanRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
