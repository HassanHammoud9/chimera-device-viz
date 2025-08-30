import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Topbar onMenu={() => setMobileOpen(true)} />

      <main className="px-3 md:px-4">
        <div className="mx-auto max-w-7xl grid grid-cols-12 gap-4 py-4">
          {/* Desktop sidebar */}
          <div className="col-span-12 md:col-span-3 hidden md:block">
            <Sidebar />
          </div>

          {/* Mobile drawer */}
          <AnimatePresence>
            {mobileOpen && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/50 z-40"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setMobileOpen(false)}
                />
                <motion.aside
                  className="fixed left-0 top-0 bottom-0 w-72 bg-panel border-r border-[color:var(--border)] z-50 p-3"
                  initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                >
                  <Sidebar />
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Content */}
          <section className="col-span-12 md:col-span-9">
            <div className="cardish p-4">
              <Outlet />
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-[color:var(--border)] bg-soft/60 px-3 md:px-4 py-3 text-center text-xs text-muted">
        © {new Date().getFullYear()} Chimera
      </footer>
    </div>
  );
}
