"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";

interface BreadcrumbItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
        <li className="flex items-center gap-1.5 sm:gap-2.5">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium sm:gap-2.5",
              "text-muted-foreground hover:text-foreground",
              "md:gap-2",
            )}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-1.5 transition-all duration-300 group-hover:from-primary/20 group-hover:via-primary/10 group-hover:to-primary/5"
            >
              <Home className="h-3.5 w-3.5 text-primary transition-transform duration-300 group-hover:scale-110" />
            </motion.div>
            <span className="sr-only sm:not-sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, _index) => (
          <React.Fragment key={item.href}>
            <li className="flex items-center gap-1.5 sm:gap-2.5">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium sm:gap-2.5",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-primary",
                  item.icon && "md:gap-2",
                )}
              >
                {item.icon && (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-1.5 transition-all duration-300 group-hover:from-primary/20 group-hover:via-primary/10 group-hover:to-primary/5"
                  >
                    <item.icon className="h-3.5 w-3.5 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </motion.div>
                )}
                <span className="sr-only sm:not-sr-only">{item.label}</span>
              </Link>
            </li>
            {_index < items.length - 1 && (
              <li className="flex items-center">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
