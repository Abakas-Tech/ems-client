/* Smoothly scroll to an in-page section, compensating for the fixed header. */
export const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (!el) return false;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const top = el.getBoundingClientRect().top + window.scrollY - (id === "home" ? 0 : 72);
  window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
  return true;
};
