import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import Logo from "./logo";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Tag,
  Settings,
  Store,
  LogOut,
  X,
} from "lucide-react";

const Nav = ({ show, onClose }) => {
  const base = "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors";
  const inactiveLink = `${base} hover:bg-gray-100`;
  const activeLink = `${base} bg-blue-100 text-blue-900 font-medium`;
  const router = useRouter();
  const { pathname } = router;

  async function logout() {
    await router.push("/");
    await signOut();
  }

  function close() {
    if (onClose) onClose(false);
  }

  return (
    <>
      {/* Mobile backdrop */}
      {show && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white text-gray-600 flex flex-col p-4 z-50 transition-transform duration-300
          md:sticky md:top-0 md:translate-x-0 md:shrink-0
          ${show ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Logo />
          <button
            className="md:hidden p-1 rounded hover:bg-gray-100"
            onClick={close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-grow">
          <Link
            href="/"
            className={pathname === "/" ? activeLink : inactiveLink}
            onClick={close}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            Dashboard
          </Link>
          <Link
            href="/orders"
            className={pathname.includes("/orders") ? activeLink : inactiveLink}
            onClick={close}
          >
            <ClipboardList className="w-5 h-5 shrink-0" />
            Orders
          </Link>
          <Link
            href="/products"
            className={pathname.includes("/products") ? activeLink : inactiveLink}
            onClick={close}
          >
            <Package className="w-5 h-5 shrink-0" />
            Products
          </Link>
          <Link
            href="/categories"
            className={pathname.includes("/categories") ? activeLink : inactiveLink}
            onClick={close}
          >
            <Tag className="w-5 h-5 shrink-0" />
            Categories
          </Link>
          <Link
            href="/sellers"
            className={pathname.includes("/sellers") ? activeLink : inactiveLink}
            onClick={close}
          >
            <Store className="w-5 h-5 shrink-0" />
            Sellers
          </Link>
          <Link
            href="/settings"
            className={pathname.includes("/settings") ? activeLink : inactiveLink}
            onClick={close}
          >
            <Settings className="w-5 h-5 shrink-0" />
            Settings
          </Link>
        </nav>

        {/* Logout */}
        <button onClick={logout} className={inactiveLink}>
          <LogOut className="w-5 h-5 shrink-0" />
          Logout
        </button>
      </aside>
    </>
  );
};

export default Nav;
