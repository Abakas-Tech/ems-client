// Languages offered on the public website (same set and native labels as
// the agency-public project). English stays the default.
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "am", label: "አማርኛ" },
  { code: "ar", label: "العربية" },
];

export const DEFAULT_LANGUAGE = "en";

// Languages written right-to-left.
export const RTL_LANGUAGES = ["ar"];

// localStorage key holding the visitor's chosen language.
export const LANGUAGE_STORAGE_KEY = "lang";

export default LANGUAGES;
