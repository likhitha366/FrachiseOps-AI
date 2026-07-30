"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell
} from "recharts";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  Workflow: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  Trend: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Monitor: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
    </svg>
  ),
  Database: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Alert: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Location: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Brain: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Sparkle: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  TrendUp: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
    </svg>
  ),
  TrendDown: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
    </svg>
  ),
  Stable: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Inventory: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Staff: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Marketing: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  Audit: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Intelligence: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Recommend: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  ),
};

// ─── Sidebar workflow steps ────────────────────────────────────────────────────
const WORKFLOW_STEPS = [
  { id: 1,  name: "Franchise Data",           icon: "Database",      category: "input",  desc: "Aggregates sales logs, inventory status, staff shifts, marketing spends, and store audit logs.", active: false },
  { id: 2,  name: "Data Validation",          icon: "Check",         category: "process",desc: "Validates schema compliance, handles missing values, cleans transaction records, and processes inputs.", active: false },
  { id: 3,  name: "Outlet Performance Agent", icon: "Trend",         category: "agent",  desc: "Monitors sales, runs trend forecasting, and measures operational efficiency.", active: true },
  { id: 4,  name: "Inventory Agent",          icon: "Inventory",     category: "agent",  desc: "Monitors stock health and recommends safe discounts for overstocked, slow-moving products.", active: true },
  { id: 5,  name: "Staff Agent",              icon: "Staff",         category: "agent",  desc: "Tracks attendance, performance, skills, shifts, and team readiness across outlets.", active: true },
  { id: 6,  name: "Marketing Agent",          icon: "Marketing",     category: "agent",  desc: "Computes campaign ROI, tracks promotion conversions, and optimizes discount allocations.", active: false },
  { id: 7,  name: "Audit Agent",              icon: "Audit",         category: "agent",  desc: "Validates compliance with brand guidelines, analyzes safety audits, and flags non-compliance.", active: false },
  { id: 8,  name: "Franchise Intelligence",   icon: "Intelligence",  category: "engine", desc: "Fuses domain-specific insights into a centralized reasoning engine to find correlations.", active: false },
  { id: 9,  name: "Business Recommendations", icon: "Recommend",     category: "engine", desc: "Generates actionable strategy recommendations for managers to reduce costs and boost sales.", active: false },
  { id: 10, name: "Dashboard & Alerts",       icon: "Dashboard",     category: "output", desc: "Serves high-level summaries for the franchisor and triggers real-time alerts for critical anomalies.", active: false },
];

const CATEGORY_COLORS: Record<string, string> = {
  input:   "text-cyan-500",
  process: "text-violet-500",
  agent:   "text-indigo-600",
  engine:  "text-amber-500",
  output:  "text-emerald-500",
};

const CATEGORY_BG: Record<string, string> = {
  input:   "bg-cyan-50 border-cyan-200",
  process: "bg-violet-50 border-violet-200",
  agent:   "bg-indigo-50 border-indigo-200",
  engine:  "bg-amber-50 border-amber-200",
  output:  "bg-emerald-50 border-emerald-200",
};

const BACKEND_URL = "http://localhost:5000/api";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  stock: number;
  reorderPoint: number;
  weeklySales: number;
  daysInStock: number;
  unitPrice: number;
  recommendedDiscount: number;
  status: "Overstock" | "Healthy" | "Low stock";
  applied: boolean;
};

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 1, name: "Classic Veg Burger", category: "Food", stock: 168, reorderPoint: 45, weeklySales: 19, daysInStock: 31, unitPrice: 149, recommendedDiscount: 20, status: "Overstock", applied: false },
  { id: 2, name: "Cold Coffee", category: "Beverages", stock: 124, reorderPoint: 35, weeklySales: 24, daysInStock: 26, unitPrice: 129, recommendedDiscount: 15, status: "Overstock", applied: false },
  { id: 3, name: "French Fries", category: "Food", stock: 82, reorderPoint: 40, weeklySales: 70, daysInStock: 8, unitPrice: 99, recommendedDiscount: 0, status: "Healthy", applied: false },
  { id: 4, name: "Chocolate Shake", category: "Beverages", stock: 96, reorderPoint: 30, weeklySales: 18, daysInStock: 34, unitPrice: 159, recommendedDiscount: 25, status: "Overstock", applied: false },
  { id: 5, name: "Paneer Wrap", category: "Food", stock: 17, reorderPoint: 35, weeklySales: 49, daysInStock: 3, unitPrice: 179, recommendedDiscount: 0, status: "Low stock", applied: false },
  { id: 6, name: "Mineral Water", category: "Beverages", stock: 142, reorderPoint: 60, weeklySales: 112, daysInStock: 9, unitPrice: 30, recommendedDiscount: 0, status: "Healthy", applied: false },
];

type ExpiryBatch = {
  id: string;
  outlet: "central" | "north" | "south";
  product: string;
  batch: string;
  category: string;
  daysLeft: number;
  stock: number;
  offer: number | null;
};

const EXPIRY_BATCHES: ExpiryBatch[] = [
  { id: "FPT-0716-A", outlet: "central", product: "Fruit Parfait", batch: "FPT-0716-A", category: "Chilled food", daysLeft: -1, stock: 14, offer: null },
  { id: "CBL-0723-B", outlet: "central", product: "Cold Brew Latte", batch: "CBL-0723-B", category: "Beverages", daysLeft: 0, stock: 10, offer: 40 },
  { id: "PTW-0721-A", outlet: "central", product: "Paneer Tikka Wrap", batch: "PTW-0721-A", category: "Chilled food", daysLeft: 1, stock: 18, offer: 40 },
  { id: "MSM-0720-D", outlet: "central", product: "Mango Smoothie", batch: "MSM-0720-D", category: "Beverages", daysLeft: 2, stock: 26, offer: 25 },
  { id: "VGS-0720-B", outlet: "central", product: "Veggie Sandwich", batch: "VGS-0720-B", category: "Fresh food", daysLeft: 2, stock: 12, offer: 25 },
  { id: "GYC-0718-C", outlet: "north", product: "Greek Yogurt Cup", batch: "GYC-0718-C", category: "Dairy", daysLeft: 3, stock: 32, offer: 25 },
  { id: "CSK-0719-B", outlet: "north", product: "Caesar Salad Kit", batch: "CSK-0719-B", category: "Fresh food", daysLeft: 4, stock: 0, offer: 10 },
  { id: "WWB-0727-A", outlet: "north", product: "Whole Wheat Bun", batch: "WWB-0727-A", category: "Bakery", daysLeft: 5, stock: 8, offer: 10 },
  { id: "CMF-0722-E", outlet: "north", product: "Chocolate Muffin", batch: "CMF-0722-E", category: "Bakery", daysLeft: 7, stock: 41, offer: 10 },
  { id: "VLP-0725-A", outlet: "north", product: "Vanilla Latte Powder", batch: "VLP-0725-A", category: "Beverages", daysLeft: 9, stock: 24, offer: null },
  { id: "DPC-0726-A", outlet: "south", product: "Dark Chocolate Cookie", batch: "DPC-0726-A", category: "Bakery", daysLeft: 2, stock: 36, offer: 25 },
  { id: "SPB-0724-C", outlet: "south", product: "Spicy Potato Bowl", batch: "SPB-0724-C", category: "Fresh food", daysLeft: 3, stock: 22, offer: 25 },
  { id: "LST-0728-B", outlet: "south", product: "Lemon Iced Tea", batch: "LST-0728-B", category: "Beverages", daysLeft: 6, stock: 48, offer: 10 },
  { id: "YGB-0721-A", outlet: "south", product: "Yogurt Granola Bowl", batch: "YGB-0721-A", category: "Chilled food", daysLeft: -1, stock: 9, offer: null },
  { id: "BRC-0729-D", outlet: "south", product: "Brownie Cup", batch: "BRC-0729-D", category: "Bakery", daysLeft: 8, stock: 30, offer: null },
];

type StockHealthItem = {
  outlet: "central" | "north" | "south";
  product: string;
  sku: string;
  onHand: number;
  dailyUse: number;
  reorder: number;
  recommendation: string;
  urgent: boolean;
};

const STOCK_HEALTH: StockHealthItem[] = [
  { outlet: "north", product: "Whole Wheat Bun", sku: "WWB-0727-A", onHand: 8, dailyUse: 18, reorder: 30, recommendation: "Reorder 76", urgent: false },
  { outlet: "north", product: "Caesar Salad Kit", sku: "CSK-0719-B", onHand: 0, dailyUse: 5, reorder: 12, recommendation: "Order 27 now", urgent: true },
  { outlet: "central", product: "Cold Brew Latte", sku: "CBL-0723-B", onHand: 10, dailyUse: 9, reorder: 20, recommendation: "Reorder 37", urgent: false },
  { outlet: "central", product: "Fruit Parfait", sku: "FPT-0716-A", onHand: 14, dailyUse: 6, reorder: 18, recommendation: "Remove expired batch", urgent: true },
  { outlet: "central", product: "Paneer Tikka Wrap", sku: "PTW-0721-A", onHand: 18, dailyUse: 11, reorder: 25, recommendation: "Reorder 40", urgent: false },
  { outlet: "south", product: "Spicy Potato Bowl", sku: "SPB-0724-C", onHand: 22, dailyUse: 14, reorder: 28, recommendation: "Reorder 48", urgent: false },
  { outlet: "south", product: "Lemon Iced Tea", sku: "LST-0728-B", onHand: 48, dailyUse: 16, reorder: 35, recommendation: "Stock healthy", urgent: false },
  { outlet: "south", product: "Veg Patty", sku: "VPT-0730-A", onHand: 6, dailyUse: 20, reorder: 30, recommendation: "Order 84 now", urgent: true },
];

const INVENTORY_OUTLETS = {
  all: "All outlets",
  central: "Central outlet",
  north: "North outlet",
  south: "South outlet",
} as const;

type StaffMember = {
  id: number;
  name: string;
  initials: string;
  role: string;
  outlet: "central" | "north" | "south";
  attendance: number;
  performance: number;
  shift: string;
  status: "Present" | "Late" | "Leave" | "Absent";
  skills: string[];
  training: number;
};

const STAFF_MEMBERS: StaffMember[] = [
  { id: 1, name: "Ananya Sharma", initials: "AS", role: "Shift Lead", outlet: "central", attendance: 98, performance: 94, shift: "09:00 – 17:00", status: "Present", skills: ["Leadership", "POS", "Food safety"], training: 100 },
  { id: 2, name: "Rohan Mehta", initials: "RM", role: "Barista", outlet: "central", attendance: 92, performance: 88, shift: "10:00 – 18:00", status: "Late", skills: ["Coffee craft", "POS"], training: 78 },
  { id: 3, name: "Priya Nair", initials: "PN", role: "Kitchen Associate", outlet: "north", attendance: 97, performance: 91, shift: "08:00 – 16:00", status: "Present", skills: ["Food prep", "Food safety"], training: 92 },
  { id: 4, name: "Kabir Singh", initials: "KS", role: "Service Associate", outlet: "north", attendance: 85, performance: 76, shift: "12:00 – 20:00", status: "Leave", skills: ["Customer service", "POS"], training: 60 },
  { id: 5, name: "Meera Iyer", initials: "MI", role: "Cashier", outlet: "south", attendance: 99, performance: 96, shift: "11:00 – 19:00", status: "Present", skills: ["POS", "Customer service"], training: 100 },
  { id: 6, name: "Arjun Patel", initials: "AP", role: "Kitchen Associate", outlet: "south", attendance: 89, performance: 82, shift: "14:00 – 22:00", status: "Absent", skills: ["Food prep"], training: 45 },
];

const STAFF_OUTLETS = { all: "All outlets", central: "Central outlet", north: "North outlet", south: "South outlet" } as const;

// ─── AI Insight Engine ─────────────────────────────────────────────────────────
// Mathematical Formulas Used:
//   1. Linear Regression Slope (β₁) = [n·Σ(xᵢ·yᵢ) - Σxᵢ·Σyᵢ] / [n·Σ(xᵢ²) - (Σxᵢ)²]
//   2. Coefficient of Variation (CV) = σ / μ × 100
//   3. Period-over-Period (MoM) Growth = (H₂ - H₁) / H₁ × 100
//   4. Profit Margin Drift = Linear slope of daily margin %
//   5. Peak Revenue Z-Score = (xᵢ - μ) / σ
//   6. Cost Ratio Drift = Slope of (Operating Cost / Gross Revenue) × 100

interface AiInsight {
  title: string;
  value: string;
  subtext: string;
  tag: string;
  tagColor: string;
  icon: "TrendUp" | "TrendDown" | "Stable" | "Warning" | "Sparkle";
}

function computeLinearRegressionSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  values.forEach((y, x) => {
    sumX  += x;
    sumY  += y;
    sumXY += x * y;
    sumX2 += x * x;
  });
  const denom = n * sumX2 - sumX * sumX;
  return denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
}

function computeCV(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  return (Math.sqrt(variance) / mean) * 100;
}

function computeAiInsights(
  trendsData: any[],
  salesRecords: any[],
  outletName: string
): AiInsight[] {
  if (trendsData.length < 3) return [];

  const revenues = trendsData.map((d: any) => d.grossRevenue as number);
  const profits  = trendsData.map((d: any) => d.netProfit    as number);
  const margins  = trendsData.map((d: any) =>
    d.grossRevenue > 0 ? (d.netProfit / d.grossRevenue) * 100 : 0
  );

  const insights: AiInsight[] = [];
  const n = revenues.length;

  // 1. Revenue Momentum (Linear Regression slope)
  const revenueSlope = computeLinearRegressionSlope(revenues);
  const slopePercent = revenues[0] > 0 ? (revenueSlope / revenues[0]) * 100 : 0;
  const momentumLabel =
    slopePercent >  1.5 ? "Strong Uptrend"  :
    slopePercent > -1.5 ? "Stable Trend"    : "Declining Trend";
  const momentumIcon: AiInsight["icon"] =
    slopePercent >  1.5 ? "TrendUp"  :
    slopePercent > -1.5 ? "Stable"   : "TrendDown";
  const momentumColor =
    slopePercent >  1.5 ? "bg-emerald-100 text-emerald-700" :
    slopePercent > -1.5 ? "bg-blue-100 text-blue-700"       : "bg-red-100 text-red-700";
  insights.push({
    title:    "Revenue Momentum",
    value:    `${slopePercent >= 0 ? "+" : ""}${slopePercent.toFixed(2)}% / day`,
    subtext:  `Linear regression slope β₁ = ₹${revenueSlope.toFixed(0)}/day across ${n} days. ${momentumLabel} detected for ${outletName}.`,
    tag:      momentumLabel,
    tagColor: momentumColor,
    icon:     momentumIcon,
  });

  // 2. Revenue Volatility (Coefficient of Variation)
  const cv = computeCV(revenues);
  const volatilityLabel = cv < 10 ? "Low Volatility" : cv < 25 ? "Moderate Volatility" : "High Volatility";
  const volatilityIcon: AiInsight["icon"] = cv < 10 ? "Stable" : cv < 25 ? "Warning" : "TrendDown";
  const volatilityColor = cv < 10 ? "bg-emerald-100 text-emerald-700" : cv < 25 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  insights.push({
    title:    "Revenue Volatility (CV)",
    value:    `${cv.toFixed(1)}%`,
    subtext:  `Coefficient of Variation (σ/μ × 100) is ${cv.toFixed(1)}%, signaling ${volatilityLabel.toLowerCase()} in daily sales for ${outletName}.`,
    tag:      volatilityLabel,
    tagColor: volatilityColor,
    icon:     volatilityIcon,
  });

  // 3. Period-over-Period Growth Rate
  const half = Math.floor(n / 2);
  const firstHalfAvg  = revenues.slice(0, half).reduce((a, b) => a + b, 0) / (half || 1);
  const secondHalfAvg = revenues.slice(half).reduce((a, b) => a + b, 0) / (revenues.slice(half).length || 1);
  const momGrowth = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
  const momIcon: AiInsight["icon"] = momGrowth > 2 ? "TrendUp" : momGrowth < -2 ? "TrendDown" : "Stable";
  const momColor  = momGrowth > 2 ? "bg-emerald-100 text-emerald-700" : momGrowth < -2 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700";
  insights.push({
    title:    "Period-over-Period Growth",
    value:    `${momGrowth >= 0 ? "+" : ""}${momGrowth.toFixed(1)}%`,
    subtext:  `Compares first half avg (₹${firstHalfAvg.toFixed(0)}) vs second half avg (₹${secondHalfAvg.toFixed(0)}). Formula: (H₂ - H₁) / H₁ × 100.`,
    tag:      momGrowth > 2 ? "Growing" : momGrowth < -2 ? "Declining" : "Flat",
    tagColor: momColor,
    icon:     momIcon,
  });

  // 4. Profit Margin Drift
  const marginSlope   = computeLinearRegressionSlope(margins);
  const avgMargin     = margins.reduce((a, b) => a + b, 0) / (margins.length || 1);
  const marginDrift   = marginSlope * n;
  const marginIcon: AiInsight["icon"] = marginDrift > 0.5 ? "TrendUp" : marginDrift < -0.5 ? "TrendDown" : "Stable";
  const marginColor   = marginDrift > 0.5 ? "bg-emerald-100 text-emerald-700" : marginDrift < -0.5 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700";
  insights.push({
    title:    "Profit Margin Drift",
    value:    `${avgMargin.toFixed(1)}% avg margin`,
    subtext:  `Margin linear drift = ${marginSlope >= 0 ? "+" : ""}${marginSlope.toFixed(3)} pp/day, giving a net shift of ${marginDrift >= 0 ? "+" : ""}${marginDrift.toFixed(1)} pp.`,
    tag:      marginDrift > 0.5 ? "Improving" : marginDrift < -0.5 ? "Eroding" : "Stable",
    tagColor: marginColor,
    icon:     marginIcon,
  });

  // 5. Peak Revenue Day (Z-Score)
  const mean = revenues.reduce((a, b) => a + b, 0) / (n || 1);
  const std  = Math.sqrt(revenues.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n || 1));
  let peakIdx = 0;
  let peakZ   = -Infinity;
  revenues.forEach((v, i) => {
    const z = std > 0 ? (v - mean) / std : 0;
    if (z > peakZ) { peakZ = z; peakIdx = i; }
  });
  const peakDate    = trendsData[peakIdx]?.date ?? "N/A";
  const peakRevenue = revenues[peakIdx] ?? 0;
  insights.push({
    title:    "Peak Revenue Detection",
    value:    peakDate,
    subtext:  `Z-score z = (xᵢ - μ)/σ = +${peakZ.toFixed(2)}. Peak sales of ₹${peakRevenue.toLocaleString("en-IN")} achieved on this date.`,
    tag:      peakZ > 2 ? "Outlier Spike" : peakZ > 1 ? "High Day" : "Normal",
    tagColor: peakZ > 2 ? "bg-violet-100 text-violet-700" : peakZ > 1 ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600",
    icon:     "Sparkle",
  });

  // 6. Cost Ratio Efficiency
  const costRatios   = trendsData.map((d: any) => d.grossRevenue > 0 ? (d.operatingCost / d.grossRevenue) * 100 : 0);
  const avgCostRatio = costRatios.reduce((a, b) => a + b, 0) / (costRatios.length || 1);
  const costSlope    = computeLinearRegressionSlope(costRatios);
  const costEffIcon: AiInsight["icon"] = costSlope < -0.05 ? "TrendUp" : costSlope > 0.05 ? "TrendDown" : "Stable";
  const costEffColor  = costSlope < -0.05 ? "bg-emerald-100 text-emerald-700" : costSlope > 0.05 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700";
  insights.push({
    title:    "Cost Efficiency Trend",
    value:    `${avgCostRatio.toFixed(1)}% of Rev`,
    subtext:  `Operating cost percentage drift slope = ${costSlope >= 0 ? "+" : ""}${costSlope.toFixed(3)} pp/day. ${costSlope < -0.05 ? "Cost ratios are shrinking positively." : costSlope > 0.05 ? "Operating costs rising faster than sales." : "Cost structure remains stable."}`,
    tag:      costSlope < -0.05 ? "Improving" : costSlope > 0.05 ? "Worsening" : "Steady",
    tagColor: costEffColor,
    icon:     costEffIcon,
  });

  return insights;
}

// ─── Step Icon Component ───────────────────────────────────────────────────────
function StepIcon({ name, className }: { name: string; className?: string }) {
  const map: Record<string, React.ReactNode> = {
    Database:      <Icons.Database />,
    Check:         <Icons.Check />,
    Trend:         <Icons.Trend />,
    Inventory:     <Icons.Inventory />,
    Staff:         <Icons.Staff />,
    Marketing:     <Icons.Marketing />,
    Audit:         <Icons.Audit />,
    Intelligence:  <Icons.Intelligence />,
    Recommend:     <Icons.Recommend />,
    Dashboard:     <Icons.Dashboard />,
  };
  return <span className={className}>{map[name] ?? <Icons.Workflow />}</span>;
}

function InsightIcon({ name }: { name: AiInsight["icon"] }) {
  if (name === "TrendUp")   return <Icons.TrendUp />;
  if (name === "TrendDown") return <Icons.TrendDown />;
  if (name === "Warning")   return <Icons.Warning />;
  if (name === "Sparkle")   return <Icons.Sparkle />;
  return <Icons.Stable />;
}

type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
};

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [selectedStep,   setSelectedStep]   = useState(3);
  const [activeFeature,  setActiveFeature]  = useState("monitor");
  const [outlets,        setOutlets]        = useState<any[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState("all");
  const [dateRange,      setDateRange]      = useState("30");
  const [searchTerm,     setSearchTerm]     = useState("");
  const [sortConfig,     setSortConfig]     = useState({ key: "saleDate", direction: "desc" });
  const [currentPage,    setCurrentPage]    = useState(1);
  const itemsPerPage = 8;

  const [metrics,    setMetrics]    = useState<any>({ grossRevenue: 0, operatingCost: 0, netProfit: 0, totalOrders: 0, totalCustomers: 0, averageOrderValue: 0, profitMargin: 0, paymentSplit: { cash: 0, card: 0, upi: 0 } });
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [salesRecords, setSalesRecords] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [inventoryTab, setInventoryTab] = useState<"offers" | "health">("offers");
  const [inventoryOutlet, setInventoryOutlet] = useState("all");
  const [activatedOffers, setActivatedOffers] = useState<string[]>([]);
  const [staffOutlet, setStaffOutlet] = useState("all");
  const [staffTab, setStaffTab] = useState<"overview" | "attendance" | "skills">("overview");
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(STAFF_MEMBERS);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("module") === "staff") {
      setSelectedStep(5);
    }
  }, []);

  const inventorySummary = useMemo(() => {
    const recommendations = inventoryItems.filter(item => item.recommendedDiscount > 0);
    return {
      overstock: inventoryItems.filter(item => item.status === "Overstock").length,
      lowStock: inventoryItems.filter(item => item.status === "Low stock").length,
      applied: recommendations.filter(item => item.applied).length,
      recoverableValue: recommendations.reduce((sum, item) => sum + item.stock * item.unitPrice, 0),
    };
  }, [inventoryItems]);

  const applyDiscount = (id: number) => {
    setInventoryItems(items => items.map(item =>
      item.id === id ? { ...item, applied: !item.applied } : item
    ));
  };

  const applyAllDiscounts = () => {
    setInventoryItems(items => items.map(item =>
      item.recommendedDiscount > 0 ? { ...item, applied: true } : item
    ));
  };

  const activateOffer = (id: string) => {
    setActivatedOffers(current => current.includes(id) ? current : [...current, id]);
  };

  const selectedInventoryBatches = useMemo(
    () => EXPIRY_BATCHES.filter(item => inventoryOutlet === "all" || item.outlet === inventoryOutlet),
    [inventoryOutlet]
  );

  const selectedStockHealth = useMemo(
    () => STOCK_HEALTH.filter(item => inventoryOutlet === "all" || item.outlet === inventoryOutlet),
    [inventoryOutlet]
  );

  const inventoryMetrics = useMemo(() => {
    const nearExpiry = selectedInventoryBatches.filter(item => item.daysLeft >= 0 && item.daysLeft <= 7);
    const lowStock = selectedStockHealth.filter(item => item.onHand <= item.reorder);
    return {
      tracked: selectedInventoryBatches.length,
      nearExpiry: nearExpiry.length,
      lowStock: lowStock.length,
      stockouts: selectedStockHealth.filter(item => item.onHand === 0).length,
      atRiskValue: selectedInventoryBatches
        .filter(item => item.daysLeft <= 7)
        .reduce((total, item) => total + item.stock * 145, 0),
    };
  }, [selectedInventoryBatches, selectedStockHealth]);

  const selectedStaff = useMemo(
    () => staffMembers.filter(member => staffOutlet === "all" || member.outlet === staffOutlet),
    [staffMembers, staffOutlet]
  );

  const staffMetrics = useMemo(() => {
    const total = selectedStaff.length || 1;
    const present = selectedStaff.filter(member => member.status === "Present" || member.status === "Late").length;
    return {
      present,
      attendance: Math.round(selectedStaff.reduce((sum, member) => sum + member.attendance, 0) / total),
      performance: Math.round(selectedStaff.reduce((sum, member) => sum + member.performance, 0) / total),
      training: Math.round(selectedStaff.reduce((sum, member) => sum + member.training, 0) / total),
      needsAttention: selectedStaff.filter(member => member.attendance < 90 || member.performance < 80 || member.training < 70).length,
    };
  }, [selectedStaff]);

  const updateStaffStatus = (id: number, status: StaffMember["status"]) => {
    setStaffMembers(members => members.map(member => member.id === id ? { ...member, status } : member));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("franchiseops_user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser) as AuthenticatedUser;
      if (!user.name || !user.email) throw new Error("Invalid user session");
      setAuthenticatedUser(user);
    } catch {
      localStorage.removeItem("franchiseops_user");
      localStorage.removeItem("franchiseops_token");
      router.replace("/login");
    }
  }, [router]);

  const signOut = () => {
    localStorage.removeItem("franchiseops_user");
    localStorage.removeItem("franchiseops_token");
    setAuthenticatedUser(null);
    router.replace("/login");
  };

  // ── Date filter ────────────────────────────────────────────────────────────
  const dateFilters = useMemo(() => {
    const today = new Date("2026-07-28");
    const end   = today.toISOString().slice(0, 10);
    const start = new Date(today);
    start.setDate(today.getDate() - parseInt(dateRange, 10));
    return { startDate: start.toISOString().slice(0, 10), endDate: end };
  }, [dateRange]);

  // ── Local mock seed ────────────────────────────────────────────────────────
  const localMockData = useMemo(() => {
    const mockOutlets = [
      { id: 1, outlet_name: "FranchiseOps - Bengaluru Central", manager_name: "Rahul Sharma",  address: "MG Road",        city: "Bengaluru", state: "Karnataka" },
      { id: 2, outlet_name: "FranchiseOps - Hyderabad Tech Park", manager_name: "Priya Reddy",  address: "HITEC City",     city: "Hyderabad", state: "Telangana" },
      { id: 3, outlet_name: "FranchiseOps - Chennai Marina",    manager_name: "Arjun Kumar",  address: "Anna Salai",     city: "Chennai",   state: "Tamil Nadu" },
      { id: 4, outlet_name: "FranchiseOps - Mumbai Andheri",    manager_name: "Neha Patel",   address: "Andheri East",   city: "Mumbai",    state: "Maharashtra" },
      { id: 5, outlet_name: "FranchiseOps - Pune Hinjawadi",    manager_name: "Vikram Joshi", address: "Hinjawadi Phase 1", city: "Pune",   state: "Maharashtra" },
    ];
    const today = new Date("2026-07-28");
    const records: any[] = [];
    mockOutlets.forEach(outlet => {
      let seed = outlet.id;
      const random = () => { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); };
      for (let i = 60; i >= 1; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5;
        let baseOrders = 150, baseAOV = 150, boost = 1.0;
        if      (outlet.city === "Bengaluru") { baseOrders = 180; baseAOV = 160; boost = isWeekend ? 1.25 : 1.0; }
        else if (outlet.city === "Hyderabad") { baseOrders = 190; baseAOV = 145; boost = isWeekend ? 0.70 : 1.30; }
        else if (outlet.city === "Chennai")   { baseOrders = 140; baseAOV = 135; boost = isWeekend ? 1.40 : 1.0; }
        else if (outlet.city === "Mumbai")    { baseOrders = 210; baseAOV = 170; boost = isWeekend ? 1.15 : 1.0; }
        else if (outlet.city === "Pune")      { baseOrders = 150; baseAOV = 140; boost = isWeekend ? 0.80 : 1.20; }
        const randM = 0.9 + random() * 0.2;
        const orders = Math.round(baseOrders * boost * randM);
        const customers = Math.round(orders * (1.1 + random() * 0.15));
        const aov = parseFloat((baseAOV * (0.95 + random() * 0.1)).toFixed(2));
        const revenue = parseFloat((orders * aov).toFixed(2));
        const costPct = 0.58 + random() * 0.10;
        const cost = parseFloat((revenue * costPct).toFixed(2));
        const profit = parseFloat((revenue - cost).toFixed(2));
        const upi  = parseFloat((revenue * (0.50 + random() * 0.10)).toFixed(2));
        const card = parseFloat((revenue * (0.25 + random() * 0.10)).toFixed(2));
        const cash = parseFloat((revenue - upi - card).toFixed(2));
        records.push({ id: outlet.id * 1000 + i, outletId: outlet.id, outletName: outlet.outlet_name, city: outlet.city, saleDate: date.toISOString().slice(0, 10), totalOrders: orders, customerCount: customers, grossRevenue: revenue, operatingCost: cost, netProfit: profit, averageOrderValue: aov, paymentSplit: { cash, card, upi } });
      }
    });
    return { outlets: mockOutlets, records };
  }, []);

  // ── Fetch / fallback ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { startDate, endDate } = dateFilters;
      const outletParam = selectedOutlet !== "all" ? `&outletId=${selectedOutlet}` : "";
      try {
        const resOutlets = await axios.get(`${BACKEND_URL}/outlets`);
        setOutlets(resOutlets.data);
        const resSummary = await axios.get(`${BACKEND_URL}/sales/summary?startDate=${startDate}&endDate=${endDate}${outletParam}`);
        setMetrics(resSummary.data);
        const resTrends  = await axios.get(`${BACKEND_URL}/sales/trends?startDate=${startDate}&endDate=${endDate}${outletParam}`);
        setTrendsData(resTrends.data);
        const resList    = await axios.get(`${BACKEND_URL}/sales/list?startDate=${startDate}&endDate=${endDate}${outletParam}&limit=200`);
        setSalesRecords(resList.data.records);
        setIsUsingFallback(false);
      } catch {
        setIsUsingFallback(true);
        setOutlets(localMockData.outlets);
        const filtered = localMockData.records.filter(r => {
          const inRange    = r.saleDate >= startDate && r.saleDate <= endDate;
          const matchOutlet = selectedOutlet === "all" || r.outletId === parseInt(selectedOutlet, 10);
          return inRange && matchOutlet;
        });
        let grossRevenue = 0, operatingCost = 0, netProfit = 0, totalOrders = 0, totalCustomers = 0, cash = 0, card = 0, upi = 0;
        filtered.forEach(r => { grossRevenue += r.grossRevenue; operatingCost += r.operatingCost; netProfit += r.netProfit; totalOrders += r.totalOrders; totalCustomers += r.customerCount; cash += r.paymentSplit.cash; card += r.paymentSplit.card; upi += r.paymentSplit.upi; });
        const averageOrderValue = totalOrders > 0 ? parseFloat((grossRevenue / totalOrders).toFixed(2)) : 0;
        const profitMargin = grossRevenue > 0 ? parseFloat(((netProfit / grossRevenue) * 100).toFixed(2)) : 0;
        setMetrics({ grossRevenue, operatingCost, netProfit, totalOrders, totalCustomers, averageOrderValue, profitMargin, paymentSplit: { cash, card, upi } });
        const tMap: Record<string, any> = {};
        filtered.forEach(r => {
          if (!tMap[r.saleDate]) tMap[r.saleDate] = { date: r.saleDate, grossRevenue: 0, operatingCost: 0, netProfit: 0, totalOrders: 0 };
          tMap[r.saleDate].grossRevenue  += r.grossRevenue;
          tMap[r.saleDate].operatingCost += r.operatingCost;
          tMap[r.saleDate].netProfit     += r.netProfit;
          tMap[r.saleDate].totalOrders   += r.totalOrders;
        });
        setTrendsData(Object.values(tMap).sort((a: any, b: any) => a.date.localeCompare(b.date)));
        setSalesRecords(filtered);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedOutlet, dateFilters, localMockData]);

  // ── Formatters & Sorting ───────────────────────────────────────────────────
  const formatCurrency = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  const formatNumber   = (val: number) => new Intl.NumberFormat("en-IN").format(val);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));
  };

  const processedRecords = useMemo(() => {
    let records = [...salesRecords];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      records = records.filter(r => r.outletName.toLowerCase().includes(term) || r.city.toLowerCase().includes(term) || r.saleDate.includes(term));
    }
    records.sort((a, b) => {
      const aVal = a[sortConfig.key], bVal = b[sortConfig.key];
      if (typeof aVal === "string") return sortConfig.direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
    return records;
  }, [salesRecords, searchTerm, sortConfig]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedRecords.slice(start, start + itemsPerPage);
  }, [processedRecords, currentPage]);

  const totalPages = Math.ceil(processedRecords.length / itemsPerPage);

  const paymentChartData = useMemo(() => [
    { name: "UPI Integration",  value: metrics.paymentSplit.upi,  color: "#4f46e5" },
    { name: "Credit/Debit Card", value: metrics.paymentSplit.card, color: "#06b6d4" },
    { name: "Cash Transactions", value: metrics.paymentSplit.cash, color: "#f59e0b" },
  ], [metrics]);

  const selectedOutletName = useMemo(() => {
    if (selectedOutlet === "all") return "All Outlets";
    const o = outlets.find((o: any) => String(o.id) === String(selectedOutlet));
    return o ? o.outlet_name.replace("FranchiseOps - ", "") : "Selected Outlet";
  }, [selectedOutlet, outlets]);

  const aiInsights = useMemo(() => {
    if (loading || trendsData.length < 3) return [];
    return computeAiInsights(trendsData, salesRecords, selectedOutletName);
  }, [trendsData, salesRecords, loading, selectedOutletName]);

  if (!authenticatedUser) return null;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 antialiased font-sans overflow-hidden">

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300 ease-in-out z-20"
        style={{ width: sidebarOpen ? "260px" : "64px", minWidth: sidebarOpen ? "260px" : "64px" }}
      >
        <div className="flex flex-col h-full bg-slate-900 text-slate-100 shadow-xl">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
            {sidebarOpen && (
              <div className="flex items-center space-x-2 overflow-hidden">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white leading-tight">FranchiseOps</p>
                  <p className="text-[10px] text-slate-400 font-medium">AI Intelligence</p>
                </div>
              </div>
            )}
            {!sidebarOpen && (
              <div className="mx-auto h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="ml-2 shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <Icons.ChevronLeft /> : <Icons.ChevronRight />}
            </button>
          </div>

          {/* Sidebar Section Label */}
          {sidebarOpen && (
            <div className="px-4 pt-4 pb-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Agent Workflow</p>
            </div>
          )}

          {/* Sidebar Steps List */}
          <nav className="flex-1 overflow-y-auto py-2 space-y-1 px-2">
            {WORKFLOW_STEPS.map(step => {
              const isSelected = selectedStep === step.id;
              return (
                <button
                  key={step.id}
                  title={!sidebarOpen ? `Step ${step.id}: ${step.name}` : undefined}
                  onClick={() => { setSelectedStep(step.id); setCurrentPage(1); }}
                  className={`w-full flex items-center rounded-xl transition-all duration-150 group ${
                    sidebarOpen ? "px-3 py-2.5 space-x-3" : "px-0 py-2.5 justify-center"
                  } ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className={`shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black border transition-colors ${
                    isSelected
                      ? "bg-white/15 border-white/20 text-white"
                      : step.active
                      ? "bg-indigo-900/50 border-indigo-700 text-indigo-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 group-hover:border-slate-600"
                  }`}>
                    {step.id}
                  </div>

                  {sidebarOpen && (
                    <div className="flex-1 text-left overflow-hidden">
                      <p className={`text-xs font-bold leading-tight truncate ${isSelected ? "text-white" : ""}`}>{step.name}</p>
                      {step.active && !isSelected && (
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Live</span>
                      )}
                    </div>
                  )}

                  {sidebarOpen && (
                    <StepIcon
                      name={step.icon}
                      className={`shrink-0 ${isSelected ? "text-white/80" : CATEGORY_COLORS[step.category] + " group-hover:text-white"}`}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {sidebarOpen && (
            <div className="px-4 py-4 border-t border-slate-800">
              <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Agent Step 3 Active</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-1">Last sync: 2026-07-28 07:22</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Area ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="shrink-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="h-16 px-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(o => !o)}
                className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors lg:hidden"
              >
                <Icons.Menu />
              </button>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                  Step {selectedStep}: {WORKFLOW_STEPS[selectedStep - 1].name}
                </h1>
                <p className="text-xs text-slate-500">{WORKFLOW_STEPS[selectedStep - 1].desc}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isUsingFallback && (
                <span className="flex items-center text-xs font-medium text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse mr-2"></span>
                  Demo Mode (API Offline)
                </span>
              )}
              {WORKFLOW_STEPS[selectedStep - 1].active ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  ● Fully Implemented
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
                  Planned Module
                </span>
              )}
              {authenticatedUser ? (
                <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700" aria-hidden="true">
                    {authenticatedUser.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="hidden leading-tight md:block">
                    <p className="max-w-32 truncate text-xs font-bold text-slate-800">{authenticatedUser.name}</p>
                    <p className="max-w-36 truncate text-[10px] text-slate-500">{authenticatedUser.email}</p>
                  </div>
                  <button onClick={signOut} className="rounded-lg px-2 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-red-600">
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex">
                  <Link href="/login" className="rounded-lg px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-indigo-700">Log in</Link>
                  <Link href="/signup" className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-indigo-700">Create account</Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Scrollable View */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto px-6 py-8">

            {selectedStep === 3 ? (
              <div className="space-y-8">

                {/* Controls Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
                      Outlet Performance Agent Dashboard
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center space-x-2">
                      <label htmlFor="outlet-select" className="text-xs font-semibold text-slate-500">Outlet:</label>
                      <select
                        id="outlet-select"
                        value={selectedOutlet}
                        onChange={e => { setSelectedOutlet(e.target.value); setCurrentPage(1); }}
                        className="text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="all">All Outlets (Consolidated)</option>
                        {outlets.map((o: any) => (
                          <option key={o.id} value={o.id}>{o.outlet_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label htmlFor="date-select" className="text-xs font-semibold text-slate-500">Range:</label>
                      <select
                        id="date-select"
                        value={dateRange}
                        onChange={e => { setDateRange(e.target.value); setCurrentPage(1); }}
                        className="text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="7">Last 7 Days</option>
                        <option value="14">Last 14 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="60">Last 60 Days</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sub-Feature Tabs */}
                <div className="flex p-1 bg-slate-200/70 rounded-xl border border-slate-200/50 w-full sm:w-fit">
                  {[
                    { key: "monitor", icon: <Icons.Monitor />, label: "1. Monitor Outlet Sales" },
                    { key: "trends",  icon: <Icons.Trend />,   label: "2. Analyze Revenue Trends" },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveFeature(tab.key)}
                      className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                        activeFeature === tab.key
                          ? "bg-white text-indigo-700 shadow-sm border border-slate-200/30 font-extrabold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* KPI Overview Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                  {[
                    { label: "Gross Revenue",    value: formatCurrency(metrics.grossRevenue),    sub: "↑ Healthy Cashflow", subColor: "text-emerald-600 bg-emerald-50", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, iconBg: "bg-indigo-50 text-indigo-600", valueColor: "text-slate-900" },
                    { label: "Operating Cost",   value: formatCurrency(metrics.operatingCost),   sub: `Cost: ${((metrics.operatingCost / (metrics.grossRevenue || 1)) * 100).toFixed(0)}% of Revenue`, subColor: "text-slate-500 bg-slate-100", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>, iconBg: "bg-amber-50 text-amber-600", valueColor: "text-slate-900" },
                    { label: "Net Profit",       value: formatCurrency(metrics.netProfit),       sub: `Margin: ${metrics.profitMargin}%`, subColor: "text-emerald-800 bg-emerald-50", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, iconBg: "bg-emerald-50 text-emerald-600", valueColor: "text-emerald-600" },
                    { label: "Total Orders",     value: formatNumber(metrics.totalOrders),       sub: `Customers: ${formatNumber(metrics.totalCustomers)}`, subColor: "text-slate-500 bg-slate-50", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>, iconBg: "bg-blue-50 text-blue-600", valueColor: "text-slate-900" },
                    { label: "Avg Order Value",  value: formatCurrency(metrics.averageOrderValue), sub: "Per Transaction Ticket", subColor: "text-slate-500 bg-slate-50", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, iconBg: "bg-cyan-50 text-cyan-600", valueColor: "text-slate-900" },
                  ].map((card, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">{card.label}</span>
                        <div className={`p-1.5 rounded-lg ${card.iconBg}`}>{card.icon}</div>
                      </div>
                      {loading ? (
                        <div className="h-8 bg-slate-100 animate-pulse rounded w-2/3 my-1"></div>
                      ) : (
                        <div>
                          <span className={`text-2xl font-black ${card.valueColor}`}>{card.value}</span>
                          <div className={`mt-1 inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${card.subColor}`}>{card.sub}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Feature 2: Analyze Revenue Trends */}
                {activeFeature === "trends" && (
                  <div className="space-y-8">

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Revenue Area Chart */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-base font-bold text-slate-900">Revenue, Costs & Profits</h3>
                            <p className="text-xs text-slate-500">Daily performance — {selectedOutletName}</p>
                          </div>
                          <div className="flex items-center space-x-3 text-xs font-semibold">
                            {[{ color: "bg-indigo-600", label: "Revenue" }, { color: "bg-emerald-500", label: "Profit" }, { color: "bg-amber-400", label: "Cost" }].map(l => (
                              <span key={l.label} className="flex items-center">
                                <span className={`h-2.5 w-2.5 ${l.color} rounded-full mr-1.5`}></span>
                                {l.label}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="h-72">
                          {loading ? <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl"></div> : (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                                  </linearGradient>
                                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} dy={10}
                                  tickFormatter={str => { if (!str) return ""; const p = str.split("-"); return `${p[2]}/${p[1]}`; }}
                                />
                                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} dx={-5}
                                  tickFormatter={num => num >= 100000 ? `${(num/100000).toFixed(1)}L` : num >= 1000 ? `${(num/1000).toFixed(0)}k` : num}
                                />
                                <Tooltip
                                  contentStyle={{ backgroundColor: "#fff", borderColor: "#e2e8f0", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
                                  labelStyle={{ fontWeight: "bold", fontSize: "12px", color: "#1e293b" }}
                                  formatter={(value: any, name: any) => {
                                    const label = name === "grossRevenue" ? "Gross Revenue" : name === "netProfit" ? "Net Profit" : "Operating Cost";
                                    return [formatCurrency(Number(value)), label];
                                  }}
                                />
                                <Area type="monotone" dataKey="grossRevenue"  stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
                                <Area type="monotone" dataKey="netProfit"     stroke="#10b981" strokeWidth={2}   fillOpacity={1} fill="url(#profGrad)" />
                                <Area type="monotone" dataKey="operatingCost" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
                              </AreaChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>

                      {/* Payment Breakdown Bar Chart */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Payment Breakdown</h3>
                          <p className="text-xs text-slate-500 mb-4">Distribution of transaction methods</p>
                        </div>
                        <div className="flex-1 min-h-[200px]">
                          {loading ? <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl"></div> : (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={paymentChartData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false}
                                  tickFormatter={num => num >= 100000 ? `${(num/100000).toFixed(0)}L` : num >= 1000 ? `${(num/1000).toFixed(0)}k` : num}
                                />
                                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} fontWeight="600" tickLine={false} width={110} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: "#fff", borderColor: "#e2e8f0", borderRadius: "12px" }}
                                  formatter={(value: any) => [formatCurrency(Number(value)), "Amount"]}
                                />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={22}>
                                  {paymentChartData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                          {paymentChartData.map((item, idx) => {
                            const total = metrics.paymentSplit.upi + metrics.paymentSplit.card + metrics.paymentSplit.cash;
                            const pct   = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
                            return (
                              <div key={idx}>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.name.split(" ")[0]}</p>
                                <p className="text-xs font-black text-slate-800 mt-0.5">{pct}%</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* ── AI Insights Component Panel ───────────────────────── */}
                    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-indigo-900/60 shadow-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                            <Icons.Brain />
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-white">AI Dynamic Revenue Insights</h3>
                            <p className="text-xs text-indigo-300/80">
                              Mathematical models · Linear Regression · CV Volatility · Period Growth · Z-Score Peak
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center space-x-1.5">
                          <Icons.Sparkle />
                          <span>{selectedOutletName} · Last {dateRange} Days</span>
                        </span>
                      </div>

                      {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-32 bg-white/5 animate-pulse rounded-xl border border-white/10"></div>
                          ))}
                        </div>
                      ) : aiInsights.length === 0 ? (
                        <div className="text-center py-8 text-indigo-300/60">
                          <p className="text-sm">Not enough data to calculate insights. Select a wider date range.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {aiInsights.map((insight, i) => (
                            <div
                              key={i}
                              className="relative bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-indigo-500/40 p-4 transition-all duration-200 group"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300/70">{insight.title}</p>
                                <div className="shrink-0 p-1.5 bg-white/10 rounded-lg text-indigo-300">
                                  <InsightIcon name={insight.icon} />
                                </div>
                              </div>
                              <p className="text-xl font-black text-white mb-1 leading-tight">{insight.value}</p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${insight.tagColor}`}>
                                {insight.tag}
                              </span>
                              <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">{insight.subtext}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {!loading && aiInsights.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-3">
                          {[
                            "β₁ = [n·Σxᵢyᵢ − ΣxᵢΣyᵢ] / [n·Σxᵢ² − (Σxᵢ)²]",
                            "CV = σ/μ × 100",
                            "MoM = (H₂ − H₁)/H₁ × 100",
                            "z = (xᵢ − μ)/σ",
                          ].map((formula, i) => (
                            <span key={i} className="text-[10px] font-mono text-indigo-400/60 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                              {formula}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* Feature 1: Monitor Sales Data Table */}
                {activeFeature === "monitor" && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Monitor Outlet Daily Sales</h3>
                        <p className="text-xs text-slate-500">Search and audit granular store log files</p>
                      </div>
                      <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Icons.Search />
                        </div>
                        <input
                          type="text"
                          placeholder="Search by city, outlet name, date..."
                          value={searchTerm}
                          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 placeholder-slate-400 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 select-none">
                          <tr>
                            {[
                              { key: "saleDate",      label: "Date"          },
                              { key: "outletName",    label: "Outlet"        },
                              { key: null,            label: "Location"      },
                              { key: "totalOrders",   label: "Orders",       right: true },
                              { key: "grossRevenue",  label: "Gross Revenue", right: true },
                              { key: "operatingCost", label: "Cost",         right: true },
                              { key: "netProfit",     label: "Net Profit",   right: true },
                              { key: null,            label: "Margin",       right: true },
                            ].map((col, ci) => (
                              <th
                                key={ci}
                                onClick={col.key ? () => handleSort(col.key!) : undefined}
                                className={`px-5 py-3.5 ${col.right ? "text-right" : ""} ${col.key ? "cursor-pointer hover:bg-slate-100 hover:text-slate-800 transition-colors" : ""}`}
                              >
                                {col.label} {col.key && sortConfig.key === col.key ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {loading ? (
                            <tr><td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                              <div className="flex flex-col items-center space-y-2">
                                <span className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></span>
                                <span className="font-semibold">Retrieving outlet audit data...</span>
                              </div>
                            </td></tr>
                          ) : paginatedRecords.length === 0 ? (
                            <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400 font-semibold">No matching records found.</td></tr>
                          ) : paginatedRecords.map(row => {
                            const margin = row.grossRevenue > 0 ? ((row.netProfit / row.grossRevenue) * 100).toFixed(1) : "0";
                            return (
                              <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-900">{row.saleDate}</td>
                                <td className="px-5 py-3 font-bold text-indigo-900">{row.outletName.replace("FranchiseOps - ", "")}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-slate-500 font-medium">
                                  <span className="inline-flex items-center"><Icons.Location /><span className="ml-1">{row.city}</span></span>
                                </td>
                                <td className="whitespace-nowrap px-5 py-3 text-right font-medium text-slate-600">{formatNumber(row.totalOrders)}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-right font-bold text-slate-900">{formatCurrency(row.grossRevenue)}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-right text-slate-500 font-medium">{formatCurrency(row.operatingCost)}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-right font-black text-emerald-600">{formatCurrency(row.netProfit)}</td>
                                <td className="whitespace-nowrap px-5 py-3 text-right">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">{margin}%</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {!loading && processedRecords.length > 0 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
                        <span className="font-semibold text-slate-500">
                          Showing <span className="text-slate-800 font-bold">{Math.min(processedRecords.length, (currentPage - 1) * itemsPerPage + 1)}–{Math.min(processedRecords.length, currentPage * itemsPerPage)}</span> of <span className="text-slate-800 font-black">{processedRecords.length}</span> audit logs
                        </span>
                        <div className="flex items-center space-x-1">
                          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">← Prev</button>
                          {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                            let pn = idx + 1;
                            if (currentPage > 3 && totalPages > 5) pn = currentPage + 2 <= totalPages ? currentPage - 3 + pn : totalPages - 5 + pn;
                            return (
                              <button key={pn} onClick={() => setCurrentPage(pn)} className={`w-8 h-8 rounded-lg border font-bold transition-all ${currentPage === pn ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-white border-slate-300 hover:bg-slate-50 text-slate-700"}`}>{pn}</button>
                            );
                          })}
                          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next →</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : selectedStep === 5 ? (
              <div className="space-y-6">
                <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                  <div><div className="flex items-center gap-2 text-indigo-700"><Icons.Staff /><span className="text-xs font-extrabold uppercase tracking-wider">Staff operations</span></div><h2 className="mt-1 text-lg font-black text-slate-900">Team readiness dashboard</h2><p className="mt-1 text-xs text-slate-500">Manage daily attendance, performance signals, skills and training coverage.</p></div>
                  <label className="flex items-center gap-3 text-xs font-bold text-slate-500">Outlet:<select value={staffOutlet} onChange={e => setStaffOutlet(e.target.value)} className="w-52 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700">{Object.entries(STAFF_OUTLETS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                </section>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  {[
                    { label: "On duty today", value: `${staffMetrics.present}/${selectedStaff.length}`, note: "Present or checked in", tone: "bg-emerald-50 text-emerald-700" },
                    { label: "Attendance rate", value: `${staffMetrics.attendance}%`, note: "Rolling 30 days", tone: "bg-blue-50 text-blue-700" },
                    { label: "Performance score", value: `${staffMetrics.performance}/100`, note: "Service, quality & sales", tone: "bg-indigo-50 text-indigo-700" },
                    { label: "Training complete", value: `${staffMetrics.training}%`, note: "Required learning paths", tone: "bg-violet-50 text-violet-700" },
                    { label: "Needs attention", value: staffMetrics.needsAttention, note: "Attendance, skill or score risk", tone: "bg-amber-50 text-amber-700" },
                  ].map(card => <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{card.label}</p><p className="mt-2 text-2xl font-black text-slate-900">{card.value}</p><span className={`mt-2 inline-block rounded-md px-2 py-1 text-[10px] font-bold ${card.tone}`}>{card.note}</span></div>)}
                </section>

                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
                  {([ ["overview", "Team overview"], ["attendance", "Attendance"], ["skills", "Skills & training"] ] as const).map(([tab, label]) => <button key={tab} onClick={() => setStaffTab(tab)} className={`rounded-md px-4 py-2 text-xs font-bold ${staffTab === tab ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600"}`}>{label}</button>)}
                </div>

                {staffTab === "overview" && <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                  <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-black text-slate-900">Team performance</h3><p className="mt-1 text-xs text-slate-500">Scores combine customer feedback, task completion and sales contribution.</p></div><span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">Updated today</span></div><div className="overflow-x-auto"><table className="w-full min-w-[660px] text-left text-xs"><thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Team member</th><th className="px-4 py-3">Role</th><th className="px-4 py-3 text-center">Attendance</th><th className="px-4 py-3 text-center">Performance</th><th className="px-5 py-3 text-right">Shift</th></tr></thead><tbody className="divide-y divide-slate-100">{selectedStaff.map(member => <tr key={member.id} className="hover:bg-slate-50"><td className="px-5 py-3"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-[10px] font-black text-indigo-700">{member.initials}</span><div><p className="font-bold text-slate-900">{member.name}</p><p className="text-[10px] text-slate-500">{STAFF_OUTLETS[member.outlet]}</p></div></div></td><td className="px-4 py-3 text-slate-600">{member.role}</td><td className="px-4 py-3 text-center font-bold text-slate-700">{member.attendance}%</td><td className="px-4 py-3 text-center"><span className={`rounded-md px-2 py-1 font-black ${member.performance >= 90 ? "bg-emerald-50 text-emerald-700" : member.performance >= 80 ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>{member.performance}</span></td><td className="px-5 py-3 text-right font-medium text-slate-600">{member.shift}</td></tr>)}</tbody></table></div></section>
                  <aside className="rounded-xl border border-amber-200 bg-amber-50 p-5"><h3 className="font-black text-amber-950">Manager actions</h3><p className="mt-1 text-xs text-amber-800">Prioritized from today’s team signals.</p><div className="mt-4 space-y-3"><div className="rounded-lg bg-white/80 p-3"><p className="text-xs font-bold text-slate-900">Backfill south outlet</p><p className="mt-1 text-[11px] text-slate-600">Arjun is absent for the evening kitchen shift. Assign a trained associate before 14:00.</p></div><div className="rounded-lg bg-white/80 p-3"><p className="text-xs font-bold text-slate-900">Coach Kabir on service recovery</p><p className="mt-1 text-[11px] text-slate-600">Performance and attendance are below target; schedule a check-in this week.</p></div><div className="rounded-lg bg-white/80 p-3"><p className="text-xs font-bold text-slate-900">Recognize Meera</p><p className="mt-1 text-[11px] text-slate-600">Strongest performance and complete training. Consider her for cross-training.</p></div></div></aside>
                </div>}

                {staffTab === "attendance" && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h3 className="font-black text-slate-900">Today’s attendance register</h3><p className="mt-1 text-xs text-slate-500">Update the check-in status and immediately see coverage risks.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Team member</th><th className="px-4 py-3">Scheduled shift</th><th className="px-4 py-3 text-center">30-day attendance</th><th className="px-5 py-3 text-right">Today’s status</th></tr></thead><tbody className="divide-y divide-slate-100">{selectedStaff.map(member => <tr key={member.id} className="hover:bg-slate-50"><td className="px-5 py-3"><p className="font-bold text-slate-900">{member.name}</p><p className="mt-0.5 text-[10px] text-slate-500">{member.role}</p></td><td className="px-4 py-3 text-slate-600">{member.shift}</td><td className="px-4 py-3 text-center font-bold text-slate-700">{member.attendance}%</td><td className="px-5 py-3 text-right"><select aria-label={`Attendance status for ${member.name}`} value={member.status} onChange={e => updateStaffStatus(member.id, e.target.value as StaffMember["status"])} className={`rounded-md border px-3 py-2 text-xs font-bold ${member.status === "Present" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : member.status === "Late" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-red-200 bg-red-50 text-red-700"}`}><option>Present</option><option>Late</option><option>Leave</option><option>Absent</option></select></td></tr>)}</tbody></table></div></section>}

                {staffTab === "skills" && <div className="grid gap-6 lg:grid-cols-2"><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h3 className="font-black text-slate-900">Skills coverage</h3><p className="mt-1 text-xs text-slate-500">Use these skills to make safer shift assignments.</p></div><div className="divide-y divide-slate-100">{selectedStaff.map(member => <div key={member.id} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="text-xs font-bold text-slate-900">{member.name}</p><div className="mt-2 flex flex-wrap gap-1.5">{member.skills.map(skill => <span key={skill} className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">{skill}</span>)}</div></div><span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{member.role}</span></div>)}</div></section><section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-black text-slate-900">Training progress</h3><p className="mt-1 text-xs text-slate-500">Mandatory paths: food safety, service standards and POS operations.</p><div className="mt-5 space-y-4">{selectedStaff.map(member => <div key={member.id}><div className="flex justify-between text-xs"><span className="font-bold text-slate-700">{member.name}</span><span className={`font-black ${member.training >= 90 ? "text-emerald-600" : member.training >= 70 ? "text-indigo-600" : "text-amber-600"}`}>{member.training}%</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${member.training >= 90 ? "bg-emerald-500" : member.training >= 70 ? "bg-indigo-500" : "bg-amber-500"}`} style={{ width: `${member.training}%` }} /></div></div>)}</div><div className="mt-6 rounded-lg bg-violet-50 p-3 text-xs text-violet-900"><span className="font-black">Recommended next step: </span>Enroll Arjun in food-safety refresher training before assigning food-prep shifts.</div></section></div>}
              </div>
            ) : selectedStep === 4 ? (
              <div className="space-y-6">
                <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div><h2 className="text-base font-black text-slate-900">Inventory control center</h2><p className="mt-1 text-xs text-slate-500">Batch-level stock, expiry risk, and recovery offers.</p></div>
                  <label className="flex items-center gap-3 text-xs font-bold text-slate-500">Outlet:<select value={inventoryOutlet} onChange={e => setInventoryOutlet(e.target.value)} className="w-52 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700">{Object.entries(INVENTORY_OUTLETS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                </section>
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[{ label: "Tracked batches", value: inventoryMetrics.tracked, note: "In selected outlet", tone: "bg-indigo-50 text-indigo-700" }, { label: "Near-expiry batches", value: inventoryMetrics.nearExpiry, note: "Expires within 7 days", tone: "bg-amber-50 text-amber-700" }, { label: "Low-stock alerts", value: inventoryMetrics.lowStock, note: "At or below reorder level", tone: "bg-orange-50 text-orange-700" }, { label: "Stockouts", value: inventoryMetrics.stockouts, note: "Require replenishment", tone: "bg-red-50 text-red-700" }].map(card => <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{card.label}</p><p className="mt-2 text-3xl font-black text-slate-900">{card.value}</p><span className={`mt-2 inline-block rounded-md px-2 py-1 text-[10px] font-bold ${card.tone}`}>{card.note}</span></div>)}
                </section>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1"><button onClick={() => setInventoryTab("offers")} className={`rounded-md px-4 py-2 text-xs font-bold ${inventoryTab === "offers" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600"}`}>Near-expiry offers</button><button onClick={() => setInventoryTab("health")} className={`rounded-md px-4 py-2 text-xs font-bold ${inventoryTab === "health" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600"}`}>Stock health</button></div>
                {inventoryTab === "offers" ? <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-black text-slate-900">Near-expiry recovery offers</h3><p className="mt-1 text-xs text-slate-500">{INVENTORY_OUTLETS[inventoryOutlet as keyof typeof INVENTORY_OUTLETS]} · Potential at-risk value: {formatCurrency(inventoryMetrics.atRiskValue)}</p></div><span className="w-fit rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">Rules: 7d 10% | 3d 25% | 1d 40%</span></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Product / batch</th><th className="px-4 py-3">Expiry</th><th className="px-4 py-3 text-center">Stock</th><th className="px-4 py-3 text-center">Offer</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{selectedInventoryBatches.map(item => { const active = activatedOffers.includes(item.id); return <tr key={item.id} className="hover:bg-slate-50"><td className="px-5 py-3"><p className="font-bold text-slate-900">{item.product}</p><p className="mt-0.5 text-[10px] text-slate-500">{item.batch} | {item.category}</p></td><td className="px-4 py-3">{item.daysLeft < 0 ? <span className="font-bold text-red-700">Expired</span> : <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">{item.daysLeft} days left</span>}</td><td className="px-4 py-3 text-center font-bold text-slate-700">{item.stock} units</td><td className="px-4 py-3 text-center font-black text-indigo-700">{item.offer ? `${item.offer}% off` : "Blocked"}</td><td className="px-5 py-3 text-right">{item.daysLeft < 0 ? <span className="text-[10px] font-bold text-red-600">Remove from sale</span> : item.offer ? <button onClick={() => activateOffer(item.id)} className={`rounded-md px-3 py-2 text-[10px] font-bold ${active ? "bg-emerald-100 text-emerald-700" : "bg-indigo-600 text-white"}`}>{active ? "Offer active" : `Activate ${item.offer}% offer`}</button> : "—"}</td></tr>})}</tbody></table></div></section> : <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h3 className="font-black text-slate-900">Stock health and replenishment</h3><p className="mt-1 text-xs text-slate-500">Suggested reorder quantity covers three days of expected use.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Product</th><th className="px-4 py-3 text-center">On hand</th><th className="px-4 py-3 text-center">Daily use</th><th className="px-4 py-3 text-center">Reorder level</th><th className="px-5 py-3 text-right">Recommendation</th></tr></thead><tbody className="divide-y divide-slate-100">{selectedStockHealth.map(item => <tr key={item.sku}><td className="px-5 py-3"><p className="font-bold text-slate-900">{item.product}</p><p className="mt-0.5 text-[10px] text-slate-500">{item.sku}</p></td><td className={`px-4 py-3 text-center font-black ${item.onHand === 0 ? "text-red-600" : item.onHand <= item.reorder ? "text-orange-600" : "text-emerald-600"}`}>{item.onHand}</td><td className="px-4 py-3 text-center text-slate-600">{item.dailyUse} units</td><td className="px-4 py-3 text-center text-slate-600">{item.reorder}</td><td className={`px-5 py-3 text-right font-bold ${item.urgent ? "text-red-600" : item.onHand <= item.reorder ? "text-orange-600" : "text-emerald-600"}`}>{item.recommendation}</td></tr>)}</tbody></table></div></section>}
                {false && <>
                <div className="flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-700"><Icons.Inventory /><span className="text-xs font-extrabold uppercase tracking-wider">Inventory Agent</span></div>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Stock-aware discount recommendations</h2>
                    <p className="mt-1 text-sm text-slate-600">Discount only slow-moving overstock. Low-stock items are automatically protected.</p>
                  </div>
                  <button onClick={applyAllDiscounts} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-indigo-700">
                    Apply all recommended discounts
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Overstocked items", value: inventorySummary.overstock, detail: "Eligible for a promotion", color: "text-amber-600 bg-amber-50" },
                    { label: "Low-stock items", value: inventorySummary.lowStock, detail: "Discounts blocked", color: "text-red-600 bg-red-50" },
                    { label: "Discounts applied", value: inventorySummary.applied, detail: "Live promotion decisions", color: "text-emerald-600 bg-emerald-50" },
                    { label: "At-risk stock value", value: formatCurrency(inventorySummary.recoverableValue), detail: "Value in recommended items", color: "text-indigo-600 bg-indigo-50" },
                  ].map(card => (
                    <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{card.label}</p>
                      <p className={`mt-2 inline-block rounded-lg px-2 py-1 text-2xl font-black ${card.color}`}>{card.value}</p>
                      <p className="mt-2 text-xs text-slate-500">{card.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-1 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div><h3 className="font-black text-slate-900">Product stock & discount queue</h3><p className="text-xs text-slate-500">Recommendations use stock cover, sales velocity, and time in inventory.</p></div>
                    <span className="mt-2 w-fit rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600 sm:mt-0">Auto-protection enabled</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-3">Product</th><th className="px-4 py-3 text-right">Stock</th><th className="px-4 py-3 text-right">Weekly sales</th><th className="px-4 py-3 text-right">Days held</th><th className="px-4 py-3">Stock status</th><th className="px-4 py-3">AI recommendation</th><th className="px-6 py-3 text-right">Action</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {inventoryItems.map(item => {
                          const isEligible = item.recommendedDiscount > 0;
                          const statusClass = item.status === "Overstock" ? "bg-amber-50 text-amber-700" : item.status === "Low stock" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700";
                          return <tr key={item.id} className="hover:bg-slate-50/70">
                            <td className="px-6 py-4"><p className="font-bold text-slate-900">{item.name}</p><p className="mt-0.5 text-slate-500">{item.category} · {formatCurrency(item.unitPrice)}</p></td>
                            <td className="px-4 py-4 text-right font-bold text-slate-700">{item.stock}<span className="ml-1 font-normal text-slate-400">/ min {item.reorderPoint}</span></td>
                            <td className="px-4 py-4 text-right font-medium text-slate-600">{item.weeklySales}</td>
                            <td className="px-4 py-4 text-right font-medium text-slate-600">{item.daysInStock} days</td>
                            <td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusClass}`}>{item.status}</span></td>
                            <td className="px-4 py-4">{isEligible ? <span className="font-black text-indigo-700">Offer {item.recommendedDiscount}% off</span> : <span className="font-semibold text-slate-500">No discount — protect stock</span>}</td>
                            <td className="px-6 py-4 text-right">{isEligible ? <button onClick={() => applyDiscount(item.id)} className={`rounded-lg px-3 py-2 text-[10px] font-bold transition-colors ${item.applied ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>{item.applied ? "Applied ✓" : `Apply ${item.recommendedDiscount}%`}</button> : <span className="text-[10px] font-bold text-red-500">Blocked</span>}</td>
                          </tr>;
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-900"><span className="font-black">How it works: </span>The agent only proposes a discount when stock is above the reorder point and sales velocity is slow. It never applies a discount to low-stock products.</div>
                </>}
              </div>
            ) : (
              /* Placeholder screen for non-active steps */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center max-w-2xl mx-auto space-y-6">
                <div className={`mx-auto h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner ${CATEGORY_BG[WORKFLOW_STEPS[selectedStep - 1].category]}`}>
                  <StepIcon name={WORKFLOW_STEPS[selectedStep - 1].icon} className={CATEGORY_COLORS[WORKFLOW_STEPS[selectedStep - 1].category]} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900">Step {selectedStep}: {WORKFLOW_STEPS[selectedStep - 1].name}</h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Strategic Development Roadmap Module</p>
                  <p className="text-sm text-slate-500 max-w-md mx-auto pt-1">{WORKFLOW_STEPS[selectedStep - 1].desc}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-left max-w-md mx-auto text-xs">
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60">
                    <p className="font-bold text-slate-700">Planned Integration</p>
                    <p className="text-slate-500 mt-1">Autonomous reasoning hooks will connect directly to raw CSV datasets and seed databases.</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60">
                    <p className="font-bold text-slate-700">Agent Capabilities</p>
                    <p className="text-slate-500 mt-1">Automated prompt chains triggered via temporal cron jobs or anomaly webhooks.</p>
                  </div>
                </div>
                <div className="pt-4 flex justify-center">
                  <button onClick={() => setSelectedStep(3)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-colors text-xs">
                    ← Return to Outlet Performance Dashboard
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* Footer */}
        <footer className="shrink-0 bg-white border-t border-slate-200 py-4 px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 font-medium">
            <span>© 2026 FranchiseOps AI. All rights reserved.</span>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Support Desk</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
