import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { AdminGate, SignOutButton } from "@/components/admin/AdminGate";

/**
 * Panel de administración (/admin). Todo lo que cuelga de aquí pasa por <AdminGate>.
 * ssr: false -> el panel solo existe en el navegador, porque la sesión vive ahí.
 */
export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel de administración | SpaceGaming" },
      // Que Google no muestre el panel en los resultados
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminGate>
      {(email) => (
        <div className="mx-auto max-w-[1280px] px-4 pt-8 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5">
            <div className="min-w-0">
              <Link to="/admin" className="font-display text-lg font-semibold hover:text-orbit">
                Panel de administración
              </Link>
              <p className="truncate text-sm text-muted-foreground">{email}</p>
            </div>
            <SignOutButton />
          </div>
          <Outlet />
        </div>
      )}
    </AdminGate>
  );
}
