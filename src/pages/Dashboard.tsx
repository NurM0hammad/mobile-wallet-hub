import { useEffect } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import {
  ArrowLeftRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Send,
  UserRound,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Brand } from "@/components/bank/Brand";
import { displayName, handleError, initials } from "@/components/bank/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Overview from "./dashboard/Overview";
import Transactions from "./dashboard/Transactions";
import Payments from "./dashboard/Payments";
import Wallet from "./dashboard/Wallet";
import Profile from "./dashboard/Profile";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/dashboard/payments", label: "Payments", icon: Send },
  { to: "/dashboard/wallet", label: "Wallet", icon: CreditCard },
  { to: "/dashboard/profile", label: "Profile", icon: UserRound },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const ensureWallet = useMutation(api.wallets.ensureWallet);

  useEffect(() => {
    if (!user) return;
    ensureWallet().catch((e) => {
      const { message } = handleError(e);
      toast.error(message);
    });
  }, [user, ensureWallet]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ============ Desktop sidebar ============ */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/70 bg-sidebar lg:flex">
        <div className="flex h-16 items-center px-6">
          <NavLink to="/dashboard" aria-label="Meridian overview">
            <Brand />
          </NavLink>
        </div>
        <Separator className="bg-border/60" />
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )
              }
            >
              <item.icon className="size-[18px] shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border/60 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
            <Avatar className="size-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials(displayName(user))}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">
                {displayName(user)}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email ?? "Guest session"}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* ============ Mobile top bar ============ */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-5 backdrop-blur-xl lg:hidden">
        <NavLink to="/dashboard" aria-label="Meridian overview">
          <Brand />
        </NavLink>
        <NavLink to="/dashboard/profile" aria-label="Your profile">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials(displayName(user))}
            </AvatarFallback>
          </Avatar>
        </NavLink>
      </header>

      {/* ============ Main content ============ */}
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-8 sm:px-6 lg:px-10 lg:pb-12">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="payments" element={<Payments />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>

      {/* ============ Mobile bottom nav ============ */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                      isActive && "bg-accent",
                    )}
                  >
                    <item.icon className="size-[18px]" />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
