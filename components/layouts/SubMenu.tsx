"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

interface SubMenuItem {
  label: string;
  href: string;
  isDev?: boolean;
}

interface SubMenuProps {
  label: string;
  href: string;
  icon: React.ReactNode;
  items: SubMenuItem[];
  collapsed?: boolean;
  isDev?: boolean;
}

export default function SubMenu({
  label,
  href,
  icon,
  items,
  collapsed = false,
  isDev,
}: SubMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Ouvrir le menu si l'une des sous-pages est active
    const isActive = items.some((item) =>
      pathname === item.href || pathname.startsWith(item.href + "/")
    );
    setIsOpen(isActive);
  }, [pathname, items]);

  const isParentActive =
    pathname === href || pathname.startsWith(href + "/");
  const hasActiveChild = items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold
          ${
            isParentActive || hasActiveChild
              ? "bg-[#f97316] text-white shadow-md shadow-orange-200"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }
          ${collapsed ? "justify-center" : "justify-between"}
        `}
        title={collapsed ? label : undefined}
      >
        <div className="flex items-center gap-3">
          {icon}
          {!collapsed && <span className="truncate">{label}</span>}
        </div>
        {!collapsed && (
          <ChevronDown
            size={14}
            className={`transition-transform shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Sub-items */}
      {isOpen && !collapsed && (
        <div className="pl-3 space-y-1 border-l-2 border-slate-200">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all
                  ${
                    isActive
                      ? "bg-orange-100 text-[#f97316]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
