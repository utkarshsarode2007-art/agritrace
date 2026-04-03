import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Leaf } from "lucide-react";
import { motion } from "motion/react";
import { useSupplyChain } from "../context/SupplyChainContext";
import { ROLE_CONFIG, STAGE_ORDER } from "../lib/supply-chain-types";
import type { UserRole } from "../lib/supply-chain-types";

export function Index() {
  const navigate = useNavigate();
  const { batches, setCurrentRole } = useSupplyChain();

  const totalUpdates = batches.reduce((sum, b) => sum + b.updates.length, 0);
  const totalTx = batches.reduce((sum, b) => sum + b.transactions.length, 0);

  const handleRoleClick = (role: UserRole) => {
    setCurrentRole(role);
    if (role === "farmer") {
      navigate({ to: "/farmer" });
    } else if (role === "consumer") {
      navigate({ to: "/consumer" });
    } else {
      navigate({ to: "/dashboard/$role", params: { role } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">
              AgriTrace
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a
              href="#roles"
              className="hover:text-foreground transition-colors"
            >
              Roles
            </a>
            <a
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#stats"
              className="hover:text-foreground transition-colors"
            >
              Stats
            </a>
          </nav>
          <Link to="/farmer">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4"
              data-ocid="nav.get_started_button"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-agri-green text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-white/15 text-white border-white/20 mb-4 text-xs">
                Farm-to-Fork Traceability
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 font-sans">
                AgriTrace
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-3 leading-relaxed">
                Track every crop from seed to shelf.
              </p>
              <p className="text-sm text-white/60 mb-8 leading-relaxed max-w-md">
                A transparent, end-to-end supply chain platform connecting
                farmers, suppliers, distributors, retailers, and consumers with
                real-time traceability.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#roles">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 font-semibold"
                    data-ocid="hero.explore_button"
                  >
                    Explore Platform
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
                <Link to="/farmer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/40 text-white hover:bg-white/10"
                    data-ocid="hero.register_button"
                  >
                    Register a Crop
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden md:flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl" />
                <img
                  src="/assets/generated/supply-chain-circle.dim_600x500.png"
                  alt="Supply Chain Flow"
                  className="relative rounded-2xl shadow-2xl max-w-[420px] w-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works: Stage Flow */}
      <section
        id="how-it-works"
        className="py-12 bg-white border-b border-border"
      >
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              The Supply Chain Journey
            </h2>
            <p className="text-muted-foreground text-sm">
              Every batch flows through 5 verified stages
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex items-center justify-between"
          >
            {STAGE_ORDER.map((stage, idx) => {
              const config = ROLE_CONFIG[stage];
              return (
                <div key={stage} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-agri-beige border-2 border-agri-beige-dark flex items-center justify-center text-2xl shadow-xs">
                      {config.icon}
                    </div>
                    <span className="text-xs font-medium text-foreground text-center">
                      {config.label.split(" / ")[0]}
                    </span>
                    <div className="flex gap-0.5">
                      {config.actions.map((action) => (
                        <div
                          key={action}
                          className="w-1.5 h-1.5 rounded-full bg-primary/30"
                        />
                      ))}
                    </div>
                  </div>
                  {idx < STAGE_ORDER.length - 1 && (
                    <div className="flex-1 flex items-center justify-center">
                      <ChevronRight className="w-5 h-5 text-primary/50 mx-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Role Selection */}
      <section id="roles" className="py-14 bg-agri-beige/40">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Choose Your Role
            </h2>
            <p className="text-muted-foreground text-sm">
              Select your role to access your personalized dashboard
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {STAGE_ORDER.map((role, idx) => {
              const config = ROLE_CONFIG[role];
              return (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <button
                    type="button"
                    data-ocid={`role.${role}.button`}
                    onClick={() => handleRoleClick(role)}
                    className="w-full group bg-agri-beige border border-agri-beige-dark rounded-2xl p-5 text-left hover:shadow-card-hover hover:border-primary/40 transition-all duration-200"
                  >
                    <div className="text-3xl mb-3">{config.icon}</div>
                    <h3 className="font-bold text-foreground text-[15px] mb-1">
                      {config.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {config.actions.length} actions available
                    </p>
                    <div className="w-full bg-primary text-primary-foreground text-sm font-medium py-2 px-3 rounded-lg text-center group-hover:bg-primary/90 transition-colors">
                      Open Dashboard
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section id="stats" className="py-12 bg-white border-t border-border">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-8 text-center"
          >
            <div>
              <div className="text-4xl font-bold text-primary mb-1">
                {batches.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Batches
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-1">
                {totalUpdates}
              </div>
              <div className="text-sm text-muted-foreground">
                Updates Recorded
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-1">
                {totalTx}
              </div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-agri-beige border-t border-agri-beige-dark">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                  <Leaf className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">AgriTrace</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Transparent supply chain traceability for India's agricultural
                ecosystem.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">
                Platform
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#roles" className="hover:text-foreground">
                    Farmer Dashboard
                  </a>
                </li>
                <li>
                  <a href="#roles" className="hover:text-foreground">
                    Supplier Portal
                  </a>
                </li>
                <li>
                  <a href="#roles" className="hover:text-foreground">
                    Distributor Hub
                  </a>
                </li>
                <li>
                  <a href="#roles" className="hover:text-foreground">
                    Retailer Console
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">
                Get Started
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/farmer" className="hover:text-foreground">
                    Register a Crop
                  </Link>
                </li>
                <li>
                  <Link to="/consumer" className="hover:text-foreground">
                    Consumer Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-agri-beige-dark pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
