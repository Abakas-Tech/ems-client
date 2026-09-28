// Finance transaction categories — must match the backend's
// utils/constant/financeCategory.constant.js (validation + DB ENUM).
//
// `bucket` decides where a category lands in the summary, whose net is
//   income - expenses - commission - vat
// so only "income" categories add to it; everything else (expenses,
// salary, agent commission, VAT, ...) is subtracted.
const FINANCE_CATEGORIES = [
  { value: "income", label: "Income", bucket: "income" },
  { value: "expense", label: "Expense", bucket: "expenses" },
  { value: "vat", label: "VAT", bucket: "vat" },
  { value: "salary", label: "Salary", bucket: "expenses" },
  { value: "office_income", label: "Office Income", bucket: "income" },
  { value: "office_expense", label: "Office Expense", bucket: "expenses" },
  {
    value: "agent_commission",
    label: "Agent Commission",
    bucket: "commission",
  },
  {
    value: "partner_commission",
    label: "Partner Commission",
    bucket: "income",
  },
  { value: "ticket_expense", label: "Ticket Expense", bucket: "expenses" },
];

const findCategory = (value) =>
  FINANCE_CATEGORIES.find((category) => category.value === value);

// Human label for a stored category value (falls back to the raw value).
export const getCategoryLabel = (value) =>
  findCategory(value)?.label || String(value ?? "");

// Whether a transaction of this category adds to the summary (+) rather
// than being deducted (-).
export const isIncomeCategory = (value) =>
  findCategory(value)?.bucket === "income";

// Sums a transaction list into the four summary buckets.
export const sumByBucket = (transactions = []) =>
  transactions.reduce(
    (totals, t) => {
      const bucket = findCategory(t.category)?.bucket;
      if (bucket) totals[bucket] += Number(t.amount || 0);
      return totals;
    },
    { income: 0, expenses: 0, commission: 0, vat: 0 },
  );

export default FINANCE_CATEGORIES;
