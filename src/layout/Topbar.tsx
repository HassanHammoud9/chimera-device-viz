import { Menu } from "lucide-react";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[color:var(--border)] bg-soft/60 backdrop-blur px-3 md:px-4 py-3">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* mobile menu button */}
          <button
            className="md:hidden rounded-lg border border-[color:var(--border)] px-2 py-1 hover:bg-white/5"
            aria-label="Open menu"
            onClick={onMenu}
          >
            <Menu size={18} />
          </button>
          <h1 className="text-lg font-semibold tracking-wide">Chimera Device Viz</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block text-sm text-muted">v0.1</div>
        </div>
      </div>
    </header>
  );
}
