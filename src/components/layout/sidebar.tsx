'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Bell,
  MessageCircle,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LucasAvatar from '@/components/lucas/avatar';
import { CatFaceIcon } from '@/components/icons/cat-icons';

const navItems = [
  { href: '/', label: 'Inicio', icon: LayoutDashboard },
  { href: '/tareas', label: 'Tareas', icon: CheckSquare },
  { href: '/recordatorios', label: 'Recordatorios', icon: Bell },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/ajustes', label: 'Ajustes', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <LucasAvatar size="sm" />
        <div>
          <h1 className="text-xl font-bold text-sidebar-foreground">Lucas</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Asistente Personal de Esther <CatFaceIcon size="xs" />
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative',
                    isActive
                      ? 'text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-sidebar-primary rounded-lg"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">
          Hecho para la Terca 💜
        </p>
      </div>
    </aside>
  );
}
