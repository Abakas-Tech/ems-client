export const KPI_MOCK = [
  {
    key: "registered",
    label: "Total Registered",
    value: 1240,
    delta: 8.2,
    icon: "bi-person-plus",
    gradient: "cyan",
    sparkline: [12, 18, 14, 22, 19, 28, 24, 31, 27, 35, 30, 38],
  },
  {
    key: "active",
    label: "Active Workers",
    value: 864,
    delta: 4.6,
    icon: "bi-person-check",
    gradient: "purple",
    sparkline: [20, 22, 21, 25, 24, 27, 26, 29, 28, 31, 30, 33],
  },
  {
    key: "tickets",
    label: "Tickets Issued",
    value: 610,
    delta: -2.1,
    icon: "bi-ticket-perforated",
    gradient: "pink",
    sparkline: [30, 28, 29, 27, 26, 28, 25, 24, 26, 23, 22, 21],
  },
  {
    key: "departed",
    label: "Departed (30d)",
    value: 96,
    delta: 12.9,
    icon: "bi-airplane",
    gradient: "blue",
    sparkline: [4, 6, 5, 7, 6, 9, 8, 10, 9, 11, 10, 13],
  },
];

// Candidate journey — order matters, this drives the pipeline flow visual
export const PIPELINE_MOCK = [
  {
    key: "registered",
    label: "Registered",
    count: 1240,
    icon: "bi-person-plus",
  },
  { key: "lmis", label: "LMIS Cleared", count: 980, icon: "bi-patch-plus" },
  {
    key: "embassy",
    label: "Embassy Cleared",
    count: 760,
    icon: "bi-buildings",
  },
  {
    key: "ticket",
    label: "Ticket Issued",
    count: 610,
    icon: "bi-ticket-perforated",
  },
  { key: "departed", label: "Departed", count: 540, icon: "bi-airplane" },
  { key: "returned", label: "Returned", count: 45, icon: "bi-arrow-clockwise" },
];

export const REGISTRATION_TREND_MOCK = [
  { month: "Sep", count: 78 },
  { month: "Oct", count: 92 },
  { month: "Nov", count: 84 },
  { month: "Dec", count: 101 },
  { month: "Jan", count: 96 },
  { month: "Feb", count: 112 },
  { month: "Mar", count: 105 },
  { month: "Apr", count: 128 },
  { month: "May", count: 119 },
  { month: "Jun", count: 134 },
  { month: "Jul", count: 122 },
  { month: "Aug", count: 141 },
];

export const OFFICE_DISTRIBUTION_MOCK = [
  { name: "Addis Ababa HQ", value: 520 },
  { name: "Hawassa Branch", value: 310 },
  { name: "Adama Branch", value: 240 },
  { name: "Bahir Dar Branch", value: 170 },
];

export const TOP_AGENTS_MOCK = [
  { name: "Selam T.", placements: 142 },
  { name: "Dawit K.", placements: 118 },
  { name: "Rahel M.", placements: 96 },
  { name: "Yonas B.", placements: 84 },
  { name: "Hana G.", placements: 71 },
];

export const RECENT_ACTIVITY_MOCK = [
  {
    id: 1,
    icon: "bi-ticket-perforated",
    message: "Ticket issued for Meron A.",
    time: "12 min ago",
  },
  {
    id: 2,
    icon: "bi-patch-plus",
    message: "LMIS status cleared — 4 candidates",
    time: "48 min ago",
  },
  {
    id: 3,
    icon: "bi-airplane",
    message: "Departure confirmed — Dubai office",
    time: "2 hrs ago",
  },
  {
    id: 4,
    icon: "bi-person-plus",
    message: "New batch registered — Adama office",
    time: "3 hrs ago",
  },
  {
    id: 5,
    icon: "bi-buildings",
    message: "Embassy interview scheduled — 6 candidates",
    time: "5 hrs ago",
  },
];
