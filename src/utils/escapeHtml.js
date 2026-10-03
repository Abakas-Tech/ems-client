// Escapes text before it is placed inside an HTML string (print templates,
// srcdoc documents, the letter canvas). Data such as worker names comes
// from users, so it must never be inserted as raw HTML.
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export default escapeHtml;
