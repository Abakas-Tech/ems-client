import Reveal from "./Reveal";
import styles from "./SectionHeading.module.css";

/* Eyebrow + title + lead paragraph used at the top of every section. */
function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "center",
  tone = "light",
  id,
  className = "",
}) {
  return (
    <Reveal
      className={`${styles.head} ${styles[align]} ${styles[tone]} ${className}`}
    >
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      <h2 className={styles.title} id={id}>
        {title}
      </h2>
      {lead && <p className={styles.lead}>{lead}</p>}
    </Reveal>
  );
}

export default SectionHeading;
