import { useTranslation } from "react-i18next";
import Reveal from "./Reveal";
import styles from "./SectionHeading.module.css";

/* Eyebrow + title + lead used at the top of every section.
   Pass `ns` to read `<ns>.eyebrow / title / accent / lead` from the
   active language; explicit props override those values. */
function SectionHeading({
  ns,
  eyebrow,
  title,
  lead,
  align = "center",
  tone = "light",
  id,
  className = "",
}) {
  const { t } = useTranslation();
  const accent = ns ? t(`${ns}.accent`, { defaultValue: "" }) : "";
  const heading =
    title ??
    (ns && (
      <>
        {t(`${ns}.title`)}
        {accent && (
          <>
            {" "}
            <span className="vx-serif">{accent}</span>
          </>
        )}
      </>
    ));
  const eyebrowText = eyebrow ?? (ns && t(`${ns}.eyebrow`));
  const leadText = lead ?? (ns && t(`${ns}.lead`));

  return (
    <Reveal
      className={`${styles.head} ${styles[align]} ${styles[tone]} ${className}`}
    >
      {eyebrowText && <span className={styles.eyebrow}>{eyebrowText}</span>}
      <h2 className={styles.title} id={id}>
        {heading}
      </h2>
      {leadText && <p className={styles.lead}>{leadText}</p>}
    </Reveal>
  );
}

export default SectionHeading;
