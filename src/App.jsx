import { useState, useEffect, useCallback } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Building2,
  Truck,
  UserRound,
  Search,
  Bell,
  Sun,
  ChevronDown,
  CalendarDays,
  TrendingUp,
  Boxes,
  FileText,
  ReceiptText,
  RotateCcw,
  Wallet,
  Undo2,
  Flame,
  Crown,
  ArrowUpRight,
} from "lucide-react";

import Login from "./components/Login";
import BusinessSetup from "./components/BusinessSetup";
import Stock from "./components/stocks";
import Sales from "./components/sales";
import Customers from "./components/customers";
import Employees from "./components/Employees";
import Suppliers from "./components/Suppliers";
import Reports from "./components/reports";
import Settings from "./components/settings";

import "./App.css";

const API_BASE = "https://jayaraman-coconuts-8rvj.onrender.com/api";

const GOOGLE_CLIENT_ID =
  "377889426189-maointfke4a7sts66pbunpffe65kjig3.apps.googleusercontent.com";

function money(value, currency = "INR") {
  const symbol = currency === "INR" ? "₹" : currency;
  return `${symbol}${Number(value || 0).toLocaleString("en-IN")}`;
}

function getSaleTotal(sale) {
  const quantity = Number(
    sale.quantity ??
      sale.sale_quantity ??
      sale.saleQuantity ??
      0
  );

  const rate = Number(
    sale.rate ??
      sale.price ??
      sale.selling_price ??
      sale.sellingPrice ??
      0
  );

  return Number(
    sale.total_amount ??
      sale.total ??
      sale.totalAmount ??
      quantity * rate
  );
}

function getQuantity(stock) {
  return Number(
    stock.quantity ??
      stock.stock_quantity ??
      stock.stockQuantity ??
      0
  );
}

function formatShortDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");

  const [stocks, setStocks] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  // Employee and supplier data is currently held in frontend state.
  const [employees, setEmployees] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [settings, setSettings] = useState({
    businessName: "BizFlow",
    businessType: "Business",
    ownerName: "Business Owner",
    phone: "",
    address: "",
    currency: "INR",
    lowStockLimit: 100,
  });

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          setAuthChecking(false);
          return;
        }

        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setUser(data.user);

          setSettings((prev) => ({
            ...prev,
            businessName: data.user?.business_name || "BizFlow",
            businessType: data.user?.business_type || "Business",
            ownerName:
              data.user?.owner_name ||
              data.user?.name ||
              "Business Owner",
            phone: data.user?.phone || "",
            address: data.user?.business_address || "",
            currency: data.user?.currency || "INR",
          }));
        } else {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);

    setSettings((prev) => ({
      ...prev,
      businessName: loggedInUser?.business_name || "BizFlow",
      businessType: loggedInUser?.business_type || "Business",
      ownerName:
        loggedInUser?.owner_name ||
        loggedInUser?.name ||
        "Business Owner",
      phone: loggedInUser?.phone || "",
      address: loggedInUser?.business_address || "",
      currency: loggedInUser?.currency || "INR",
    }));

    setShowWelcome(true);
    setLoading(true);
  };

  const handleSetupComplete = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setSettings((prev) => ({
      ...prev,
      businessName: updatedUser?.business_name || "BizFlow",
      businessType: updatedUser?.business_type || "Business",
      ownerName:
        updatedUser?.owner_name ||
        updatedUser?.name ||
        "Business Owner",
      phone: updatedUser?.phone || "",
      address: updatedUser?.business_address || "",
      currency: updatedUser?.currency || "INR",
    }));

    setActivePage("dashboard");
    setShowWelcome(true);
    setLoading(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const getArrayData = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.rows)) return data.rows;
    return [];
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setApiError("");

      const token = localStorage.getItem("authToken");
      if (!token) return;

      const [stocksResponse, salesResponse, customersResponse] =
        await Promise.all([
          fetch(`${API_BASE}/stocks`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/sales`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/customers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      if (!stocksResponse.ok) throw new Error("Stocks API failed");
      if (!salesResponse.ok) throw new Error("Sales API failed");
      if (!customersResponse.ok) throw new Error("Customers API failed");

      const stocksData = await stocksResponse.json();
      const salesData = await salesResponse.json();
      const customersData = await customersResponse.json();

      setStocks(getArrayData(stocksData));
      setSales(getArrayData(salesData));
      setCustomers(getArrayData(customersData));
      setLoading(false);
    } catch (error) {
      console.error("Dashboard API Error:", error);
      setApiError(
        "Backend connect aagala. Backend server running-aa irukka check pannunga."
      );
      setLoading(false);
    }
  }, []);

  // LIVE DASHBOARD SYNC
  // Sales / Stock / Customer pages can change the database while the
  // dashboard is open. Keep the dashboard state synced automatically.
  useEffect(() => {
    if (!user) return;

    loadDashboardData();

    // Poll the backend every 3 seconds so newly added sales, stock,
    // and customers appear on the dashboard without a manual refresh.
    const refreshInterval = setInterval(() => {
      loadDashboardData();
    }, 3000);

    // Refresh immediately when the user comes back to the tab/window.
    const handleFocus = () => {
      loadDashboardData();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadDashboardData();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user, loadDashboardData]);

  useEffect(() => {
    if (!showWelcome) return;

    const timer = setTimeout(() => setShowWelcome(false), 4200);

    return () => clearTimeout(timer);
  }, [showWelcome]);

  const totalStock = stocks.reduce(
    (total, stock) => total + getQuantity(stock),
    0
  );

  const totalSales = sales.reduce(
    (total, sale) => total + getSaleTotal(sale),
    0
  );

  const totalCustomers = customers.length;

  const lowStockLimit = Number(settings.lowStockLimit || 10);

  const outOfStock = stocks.filter(
    (stock) => getQuantity(stock) <= 0
  ).length;

  const lowStock = stocks.filter((stock) => {
    const qty = getQuantity(stock);
    return qty > 0 && qty <= lowStockLimit;
  }).length;

  const inStock = Math.max(
    stocks.length - lowStock - outOfStock,
    0
  );

  /*
   * ============================================================
   * REAL SALES GRAPH DATA
   * ============================================================
   * sales[] comes from /api/sales.
   * The backend already returns sale_date + total_amount.
   * Here we group the last 30 days by date.
   */
  /*
   * IMPORTANT:
   * The graph normally ends today, but if the database contains a
   * sale dated later than today (for example 2026-09-20 while today
   * is 2026-09-19), we extend the graph to that latest sale date.
   * This prevents valid database records from disappearing from
   * the "Last 30 Days" chart.
   */
  const getLocalDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const saleDateKeys = sales
    .map((sale) =>
      String(
        sale.sale_date ??
          sale.date ??
          sale.saleDate ??
          ""
      ).slice(0, 10)
    )
    .filter(Boolean);

  const latestSaleDate = saleDateKeys.reduce(
    (latest, dateKey) => {
      const parsed = new Date(`${dateKey}T00:00:00`);

      if (Number.isNaN(parsed.getTime())) {
        return latest;
      }

      return parsed > latest ? parsed : latest;
    },
    today
  );

  const chartEndDate =
    latestSaleDate > today ? latestSaleDate : today;

  const salesChartData = Array.from(
    { length: 30 },
    (_, index) => {
      const date = new Date(chartEndDate);

      date.setHours(0, 0, 0, 0);
      date.setDate(
        chartEndDate.getDate() - (29 - index)
      );

      const dateKey = getLocalDateKey(date);

      const total = sales
        .filter((sale) => {
          const saleDate =
            sale.sale_date ??
            sale.date ??
            sale.saleDate;

          if (!saleDate) return false;

          return (
            String(saleDate).slice(0, 10) ===
            dateKey
          );
        })
        .reduce((sum, sale) => {
          return sum + getSaleTotal(sale);
        }, 0);

      return {
        date: dateKey,
        total,
      };
    }
  );

  const maxChartValue = Math.max(
    ...salesChartData.map((item) => item.total),
    1
  );

  const chartPoints = salesChartData.map((item, index) => {
    const x = (index / 29) * 900;

    const y =
      250 -
      (item.total / maxChartValue) * 210;

    return `${x},${y}`;
  });

  const chartPath = chartPoints.join(" ");

  const chartAreaPath = chartPoints.length
    ? `M ${chartPoints
        .map((point) => point.replace(",", " "))
        .join(" L ")} L 900 280 L 0 280 Z`
    : "M 0 280 L 900 280 Z";

  const highestSalesPoint = salesChartData.reduce(
    (best, item, index) => {
      if (item.total > best.total) {
        return {
          total: item.total,
          index,
          date: item.date,
        };
      }

      return best;
    },
    {
      total: 0,
      index: 0,
      date: salesChartData[0]?.date || "",
    }
  );

  const highestPointX =
    (highestSalesPoint.index / 29) * 900;

  const highestPointY =
    250 -
    (highestSalesPoint.total / maxChartValue) * 210;

  const graphLabels = [0, 5, 10, 15, 20, 25, 29].map(
    (index) => salesChartData[index]
  );

  /*
   * ============================================================
   * TOP SELLING PRODUCTS
   * ============================================================
   * Current sales API returns stocks.type as stock_type.
   * We group sales by stock_type and sum quantity.
   */
  const topProducts = Object.values(
    sales.reduce((acc, sale) => {
      const name =
        sale.product ??
        sale.product_name ??
        sale.productName ??
        sale.stock_type ??
        sale.stock_name ??
        sale.stockName ??
        "Product";

      const quantity = Number(
        sale.quantity ??
          sale.sale_quantity ??
          sale.saleQuantity ??
          0
      );

      if (!acc[name]) {
        acc[name] = {
          name,
          quantity: 0,
        };
      }

      acc[name].quantity += quantity;

      return acc;
    }, {})
  )
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const stockTypes = stocks.length;

  const recentSales = sales.slice().reverse().slice(0, 5);

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "stock",
      label: "Stock",
      icon: Package,
    },
    {
      id: "sales",
      label: "Sales",
      icon: ShoppingCart,
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
    },
    {
      id: "suppliers",
      label: "Suppliers",
      icon: Truck,
    },
    {
      id: "employees",
      label: "Employees",
      icon: UserRound,
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
    },
  ];

  if (authChecking) {
    return (
      <div className="screen-loader">
        <div className="loader-spinner" />
        Checking login...
      </div>
    );
  }

  if (!user) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Login onLogin={handleLogin} />
      </GoogleOAuthProvider>
    );
  }

  if (user && !user.setup_completed) {
    return (
      <BusinessSetup
        user={user}
        onComplete={handleSetupComplete}
      />
    );
  }

  if (loading) {
    return (
      <div className="screen-loader">
        <div className="loader-spinner" />
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Building2 size={24} strokeWidth={2.2} />
          </div>

          <div>
            <h2>{settings.businessName || "BizFlow"}</h2>
            <span>Your Business. Simplified.</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={
                  activePage === item.id
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() => setActivePage(item.id)}
              >
                <Icon size={19} />
                <span>{item.label}</span>

                {activePage === item.id && (
                  <ArrowUpRight
                    size={15}
                    className="nav-arrow"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-system">
          <div className="system-title">SYSTEM</div>

          <button
            className="system-link"
            onClick={() => setActivePage("settings")}
          >
            <SettingsIcon size={16} />
            Business Settings
          </button>

          <button
            className="system-link"
            onClick={() => setActivePage("settings")}
          >
            <Building2 size={16} />
            Business Locations
          </button>

          <button
            className="system-link"
            onClick={() => setActivePage("settings")}
          >
            <ReceiptText size={16} />
            Invoice Settings
          </button>

          <button
            className="system-link"
            onClick={() => setActivePage("settings")}
          >
            <Boxes size={16} />
            Barcode Settings
          </button>

          <button
            className="system-link"
            onClick={() => setActivePage("settings")}
          >
            <FileText size={16} />
            Receipt Printers
          </button>

          <button
            className="system-link"
            onClick={() => setActivePage("settings")}
          >
            <Wallet size={16} />
            Tax Rates
          </button>
        </div>

        <div className="upgrade-card">
          <div className="upgrade-icon">
            <Crown size={19} />
          </div>

          <strong>Upgrade Plan</strong>

          <p>
            Unlock more features for faster growth.
          </p>

          <button>Upgrade Now</button>
        </div>

        <button
          className="logout-link"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="main-content">
        {activePage === "dashboard" && (
          <div className="page dashboard-page">
            <header className="dashboard-topbar">
              <div className="dashboard-search">
                <Search size={18} />

                <input
                  placeholder="Search products, customers, sales..."
                  aria-label="Search"
                />

                <kbd>Ctrl K</kbd>
              </div>

              <div className="topbar-actions">
                <button
                  className="icon-top-btn"
                  title="Theme"
                >
                  <Sun size={19} />
                </button>

                <button
                  className="icon-top-btn notification-btn"
                  title="Notifications"
                >
                  <Bell size={19} />
                  <i />
                </button>

                <div className="topbar-date">
                  <strong>
                    {new Date().toLocaleDateString(
                      "en-IN",
                      {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </strong>
                </div>

                <div className="topbar-user">
                  <div className="profile-icon">
                    {(
                      user?.name ||
                      settings.ownerName ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {user?.name ||
                        settings.ownerName}
                    </strong>

                    <small>Business Owner</small>
                  </div>

                  <ChevronDown size={16} />
                </div>
              </div>
            </header>

            <div className="dashboard-heading-row">
              <div>
                <div className="welcome-pill">
                  Welcome Back 👋
                </div>

                <h1>Dashboard</h1>

                <p>
                  Here&apos;s what&apos;s happening with
                  your{" "}
                  {settings.businessType?.toLowerCase() ||
                    "business"}{" "}
                  today.
                </p>
              </div>

              <button className="period-btn">
                <CalendarDays size={17} />
                This Month
                <ChevronDown size={15} />
              </button>
            </div>

            {apiError && (
              <div className="dashboard-error">
                {apiError}
              </div>
            )}

            {showWelcome && (
              <div className="welcome-toast">
                <div className="toast-icon">✓</div>

                <div>
                  <strong>Welcome back!</strong>
                  <span>
                    Your workspace is ready.
                  </span>
                </div>

                <button
                  onClick={() => setShowWelcome(false)}
                >
                  ×
                </button>
              </div>
            )}

            <section className="kpi-grid">
              <div className="kpi-card kpi-blue">
                <div className="kpi-icon">
                  <ShoppingCart size={22} />
                </div>

                <div className="kpi-content">
                  <span>Total Sales</span>

                  <strong>
                    {money(
                      totalSales,
                      settings.currency
                    )}
                  </strong>

                  <small>Actual sales revenue</small>
                </div>

                <div className="kpi-trend">
                  Live
                </div>

                <div className="mini-bars">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>

              <div className="kpi-card kpi-purple">
                <div className="kpi-icon">
                  <Boxes size={22} />
                </div>

                <div className="kpi-content">
                  <span>Total Stock</span>

                  <strong>
                    {totalStock.toLocaleString()}
                  </strong>

                  <small>Products available</small>
                </div>

                <div className="kpi-trend">
                  Live
                </div>

                <div className="mini-bars">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>

              <div className="kpi-card kpi-cyan">
                <div className="kpi-icon">
                  <Users size={22} />
                </div>

                <div className="kpi-content">
                  <span>Total Customers</span>

                  <strong>
                    {totalCustomers.toLocaleString()}
                  </strong>

                  <small>
                    Registered customers
                  </small>
                </div>

                <div className="kpi-trend">
                  Live
                </div>

                <div className="mini-line">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className="kpi-card kpi-pink">
                <div className="kpi-icon">
                  <FileText size={22} />
                </div>

                <div className="kpi-content">
                  <span>Invoice Due</span>

                  <strong>
                    {money(
                      0,
                      settings.currency
                    )}
                  </strong>

                  <small>
                    Invoice module not added yet
                  </small>
                </div>

                <div className="mini-bars pink">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </section>

            <section className="dashboard-main-grid">
              <div className="dashboard-left-column">
                <div className="dashboard-panel sales-chart-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <div className="panel-icon blue">
                        <TrendingUp size={19} />
                      </div>

                      <div>
                        <h2>Sales Overview</h2>

                        <p>
                          Actual sales performance
                          from the last 30 days
                        </p>
                      </div>
                    </div>

                    <div className="chart-controls">
                      <button>
                        <CalendarDays size={15} />
                        Last 30 Days
                        <ChevronDown size={13} />
                      </button>

                      <button>
                        Sales
                        <ChevronDown size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="sales-chart">
                    <div className="chart-y">
                      <span>
                        {money(
                          maxChartValue,
                          settings.currency
                        )}
                      </span>

                      <span>
                        {money(
                          maxChartValue * 0.75,
                          settings.currency
                        )}
                      </span>

                      <span>
                        {money(
                          maxChartValue * 0.5,
                          settings.currency
                        )}
                      </span>

                      <span>
                        {money(
                          maxChartValue * 0.25,
                          settings.currency
                        )}
                      </span>

                      <span>₹0</span>
                    </div>

                    <div className="chart-body">
                      <div className="chart-grid-lines">
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>

                      <svg
                        viewBox="0 0 900 280"
                        preserveAspectRatio="none"
                        className="sales-svg"
                      >
                        <defs>
                          <linearGradient
                            id="salesFill"
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#3182ff"
                              stopOpacity="0.28"
                            />

                            <stop
                              offset="100%"
                              stopColor="#3182ff"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>

                        {sales.length > 0 && (
                          <>
                            <path
                              d={chartAreaPath}
                              fill="url(#salesFill)"
                            />

                            <polyline
                              points={chartPath}
                              fill="none"
                              stroke="#2583f7"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            <circle
                              cx={highestPointX}
                              cy={highestPointY}
                              r="6"
                              fill="#fff"
                              stroke="#2583f7"
                              strokeWidth="4"
                            />
                          </>
                        )}
                      </svg>

                      {sales.length > 0 ? (
                        <div
                          className="chart-tooltip"
                          style={{
                            left: `${Math.min(
                              Math.max(
                                (highestSalesPoint.index /
                                  29) *
                                  100,
                                8
                              ),
                              88
                            )}%`,
                          }}
                        >
                          <strong>
                            {money(
                              highestSalesPoint.total,
                              settings.currency
                            )}
                          </strong>

                          <span>
                            {formatShortDate(
                              highestSalesPoint.date
                            )}
                          </span>
                        </div>
                      ) : (
                        <div className="chart-empty-message">
                          No sales recorded in the last
                          30 days
                        </div>
                      )}

                      <div className="chart-x">
                        {graphLabels.map((item) => (
                          <span key={item.date}>
                            {formatShortDate(item.date)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dashboard-panel recent-sales-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <div className="panel-icon purple">
                        <ReceiptText size={19} />
                      </div>

                      <div>
                        <h2>Recent Sales</h2>

                        <p>
                          Latest sales from your store
                        </p>
                      </div>
                    </div>

                    <button
                      className="view-all-btn"
                      onClick={() =>
                        setActivePage("sales")
                      }
                    >
                      View All
                    </button>
                  </div>

                  {recentSales.length === 0 ? (
                    <div className="empty-dashboard-table">
                      <ReceiptText size={34} />

                      <strong>
                        No Sales Available
                      </strong>

                      <span>
                        Add a sale to see it here.
                      </span>
                    </div>
                  ) : (
                    <div className="dashboard-table-wrap">
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Product</th>
                            <th>Customer</th>
                            <th>Quantity</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {recentSales.map(
                            (sale, index) => {
                              const customerName =
                                sale.customer ??
                                sale.customer_name ??
                                sale.customerName ??
                                "Unknown";

                              const productName =
                                sale.product ??
                                sale.product_name ??
                                sale.productName ??
                                sale.stock_type ??
                                sale.stock_name ??
                                sale.stockName ??
                                "Product";

                              const quantity =
                                Number(
                                  sale.quantity ??
                                    sale.sale_quantity ??
                                    sale.saleQuantity ??
                                    0
                                );

                              const date =
                                sale.sale_date ??
                                sale.date ??
                                sale.saleDate ??
                                "-";

                              return (
                                <tr
                                  key={
                                    sale.id ??
                                    `${index}-${date}`
                                  }
                                >
                                  <td>
                                    {index + 1}
                                  </td>

                                  <td>
                                    <strong>
                                      {productName}
                                    </strong>
                                  </td>

                                  <td>
                                    {customerName}
                                  </td>

                                  <td>
                                    {quantity}
                                  </td>

                                  <td>
                                    {money(
                                      getSaleTotal(
                                        sale
                                      ),
                                      settings.currency
                                    )}
                                  </td>

                                  <td>
                                    {date}
                                  </td>

                                  <td>
                                    <span className="completed-badge">
                                      Completed
                                    </span>
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-right-column">
                <div className="dashboard-panel stock-status-panel">
                  <div className="panel-header compact">
                    <div className="panel-title">
                      <div className="panel-icon blue">
                        <Boxes size={18} />
                      </div>

                      <h2>Stock Status</h2>
                    </div>

                    <button className="dots-btn">
                      ⋮
                    </button>
                  </div>

                  <div className="stock-status-content">
                    <div
                      className="stock-donut"
                      style={{
                        background: `conic-gradient(#17b897 0 ${
                          (inStock /
                            Math.max(
                              stocks.length,
                              1
                            )) *
                          100
                        }%, #ffb020 ${
                          (inStock /
                            Math.max(
                              stocks.length,
                              1
                            )) *
                          100
                        }% ${
                          ((inStock + lowStock) /
                            Math.max(
                              stocks.length,
                              1
                            )) *
                          100
                        }%, #ff4261 ${
                          ((inStock + lowStock) /
                            Math.max(
                              stocks.length,
                              1
                            )) *
                          100
                        }% 100%)`,
                      }}
                    >
                      <div>
                        <strong>
                          {stocks.length}
                        </strong>

                        <span>Total</span>
                      </div>
                    </div>

                    <div className="stock-legend">
                      <div>
                        <i className="green" />
                        <span>In Stock</span>
                        <strong>{inStock}</strong>
                      </div>

                      <div>
                        <i className="yellow" />
                        <span>Low Stock</span>
                        <strong>{lowStock}</strong>
                      </div>

                      <div>
                        <i className="red" />
                        <span>Out of Stock</span>
                        <strong>{outOfStock}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dashboard-panel top-products-panel">
                  <div className="panel-header compact">
                    <div className="panel-title">
                      <div className="panel-icon orange">
                        <Flame size={18} />
                      </div>

                      <h2>
                        Top Selling Products
                      </h2>
                    </div>

                    <button
                      className="view-all-small"
                      onClick={() =>
                        setActivePage("sales")
                      }
                    >
                      View All
                    </button>
                  </div>

                  <div className="top-products-list">
                    {(
                      topProducts.length
                        ? topProducts
                        : [
                            {
                              name: "No sales yet",
                              quantity: 0,
                            },
                          ]
                    ).map((product, index) => {
                      const max = Math.max(
                        ...topProducts.map(
                          (item) =>
                            item.quantity
                        ),
                        1
                      );

                      return (
                        <div
                          className="top-product-row"
                          key={`${product.name}-${index}`}
                        >
                          <span className="product-rank">
                            {index + 1}
                          </span>

                          <span className="product-name">
                            {product.name}
                          </span>

                          <div className="product-progress">
                            <i
                              style={{
                                width: `${
                                  Math.max(
                                    (product.quantity /
                                      max) *
                                      100,
                                    product.quantity
                                      ? 8
                                      : 0
                                  )
                                }%`,
                              }}
                            />
                          </div>

                          <strong>
                            {product.quantity}
                          </strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section className="bottom-kpi-grid">
              <div className="bottom-kpi cyan">
                <div className="bottom-icon">
                  <ShoppingCart size={20} />
                </div>

                <div>
                  <span>Total Purchase</span>

                  <strong>
                    {money(
                      0,
                      settings.currency
                    )}
                  </strong>

                  <small>
                    Purchase module not added yet
                  </small>
                </div>

                <div className="bottom-bars">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>

              <div className="bottom-kpi purple">
                <div className="bottom-icon">
                  <Undo2 size={20} />
                </div>

                <div>
                  <span>Purchase Return</span>

                  <strong>
                    {money(
                      0,
                      settings.currency
                    )}
                  </strong>

                  <small>
                    Return module not added yet
                  </small>
                </div>

                <div className="bottom-bars">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>

              <div className="bottom-kpi pink">
                <div className="bottom-icon">
                  <RotateCcw size={20} />
                </div>

                <div>
                  <span>Sales Return</span>

                  <strong>
                    {money(
                      0,
                      settings.currency
                    )}
                  </strong>

                  <small>
                    Return module not added yet
                  </small>
                </div>

                <div className="bottom-bars">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>

              <div className="bottom-kpi orange">
                <div className="bottom-icon">
                  <Wallet size={20} />
                </div>

                <div>
                  <span>Total Expense</span>

                  <strong>
                    {money(
                      0,
                      settings.currency
                    )}
                  </strong>

                  <small>
                    Expense module not added yet
                  </small>
                </div>

                <div className="bottom-bars">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </section>

            <footer className="dashboard-footer">
              <span>
                {settings.businessType ||
                  "Business"}{" "}
                for a Better Tomorrow
              </span>

              <span>
                <b />
                Build · Grow · Succeed
              </span>
            </footer>
          </div>
        )}

        {activePage === "stock" && (
          <Stock
            stocks={stocks}
            setStocks={setStocks}
          />
        )}

        {activePage === "sales" && (
          <Sales
            sales={sales}
            setSales={setSales}
          />
        )}

        {activePage === "customers" && (
          <Customers
            customers={customers}
            setCustomers={setCustomers}
          />
        )}

        {activePage === "suppliers" && (
          <Suppliers
            suppliers={suppliers}
            setSuppliers={setSuppliers}
          />
        )}

        {activePage === "employees" && (
          <Employees
            employees={employees}
            setEmployees={setEmployees}
          />
        )}

        {activePage === "reports" && (
          <Reports
            sales={sales}
            stocks={stocks}
          />
        )}

        {activePage === "settings" && (
          <Settings
            settings={settings}
            setSettings={setSettings}
          />
        )}
      </main>
    </div>
  );
}

export default App;
  