import { useState } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight, Plane, MapPin } from "lucide-react";

import { DESTINATION_ROUTES as ROUTE_POINTS, ROUTE_ORIGIN as ORIGIN_POINT } from "../../data/content";
import { scrollToSection } from "../../utils/scroll";
import Reveal from "../ui/Reveal";
import styles from "./Destinations.module.css";

const ease = [0.22, 1, 0.36, 1];

/* Curved flight path from the origin to a destination, bowed to the west */
const routePath = (to) => {
  const { x: x1, y: y1 } = ORIGIN_POINT;
  const dx = to.x - x1;
  const dy = to.y - y1;
  const len = Math.hypot(dx, dy);
  const bend = len * 0.22;
  const cx = (x1 + to.x) / 2 + (dy / len) * bend;
  const cy = (y1 + to.y) / 2 - (dx / len) * bend;
  return `M ${x1} ${y1} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${to.x} ${to.y}`;
};

function Destinations() {
  const { t } = useTranslation();
  const ROUTE_ORIGIN = { ...ORIGIN_POINT, ...t("routes.origin") };
  const DESTINATION_ROUTES = ROUTE_POINTS.map((d) => ({ ...d, ...t(`routes.places.${d.key}`) }));
  const [active, setActive] = useState(null);
  const reduceMotion = useReducedMotion();

  return (
    <section className={`vx-section ${styles.section}`} aria-labelledby="routes-title">
      <div className="vx-container">
        <Reveal className={styles.panel}>
          <div className={styles.glow} aria-hidden="true" />

          <div className={styles.copy}>
            <span className={styles.eyebrow}>{t("routes.eyebrow")}</span>
            <h2 id="routes-title" className={styles.title}>
              {t("routes.title")} <span className="vx-serif">{t("routes.accent")}</span>
            </h2>
            <p className={styles.lead}>
              {t("routes.lead")}
            </p>

            <ul className={styles.list} onMouseLeave={() => setActive(null)}>
              {DESTINATION_ROUTES.map((d, i) => (
                <li key={d.key}>
                  <button
                    type="button"
                    className={`${styles.row} ${active === d.key ? styles.rowOn : ""}`}
                    onMouseEnter={() => setActive(d.key)}
                    onFocus={() => setActive(d.key)}
                    onBlur={() => setActive(null)}
                    onClick={() => setActive((a) => (a === d.key ? null : d.key))}
                    aria-pressed={active === d.key}
                  >
                    <span className={styles.idx}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={styles.rowText}>
                      <strong>{d.country}</strong>
                      <small>{d.city}</small>
                    </span>
                    <span className={styles.code}>{d.code}</span>
                  </button>
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              className="vx-btn vx-btn--primary"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("contact");
              }}
            >
              {t("routes.cta")} <ArrowRight size={18} className="vx-flip" />
            </a>
          </div>

          <div className={styles.mapWrap}>
            <svg
              className={styles.map}
              viewBox="0 0 520 520"
              dir="ltr"
              role="img"
              aria-label={t("routes.aria", {
                from: ROUTE_ORIGIN.city,
                to: DESTINATION_ROUTES.map((d) => d.city).join(", "),
              })}
            >
              <defs>
                <pattern id="vx-dots" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="1.5" cy="1.5" r="1.1" fill="rgba(255,255,255,0.09)" />
                </pattern>
                <radialGradient id="vx-fade" cx="50%" cy="50%" r="55%">
                  <stop offset="0%" stopColor="#fff" />
                  <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
                <mask id="vx-dots-mask">
                  <rect width="520" height="520" fill="url(#vx-fade)" />
                </mask>
                <linearGradient id="vx-route" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff5a4f" />
                  <stop offset="45%" stopColor="#e0307a" />
                  <stop offset="100%" stopColor="#7fb2ff" />
                </linearGradient>
              </defs>

              <rect width="520" height="520" fill="url(#vx-dots)" mask="url(#vx-dots-mask)" />

              {/* Radar rings around the origin */}
              {[60, 120, 190].map((r, i) => (
                <circle
                  key={r}
                  cx={ROUTE_ORIGIN.x}
                  cy={ROUTE_ORIGIN.y}
                  r={r}
                  className={styles.ring}
                  style={{ animationDelay: `${i * 1.2}s` }}
                />
              ))}

              {DESTINATION_ROUTES.map((d, i) => {
                const path = routePath(d);
                const dim = active && active !== d.key;
                const on = active === d.key;
                return (
                  <g key={d.key} className={`${styles.route} ${dim ? styles.dim : ""} ${on ? styles.on : ""}`}>
                    <path d={path} className={styles.track} />
                    <Motion.path
                      id={`vx-route-${d.key}`}
                      d={path}
                      className={styles.line}
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.6, delay: 0.2 + i * 0.18, ease }}
                    />
                    {!reduceMotion && (
                      <g className={styles.plane}>
                        <path d="M-7 -1.6 L4 -1.6 L7 0 L4 1.6 L-7 1.6 Z M-1 -1.6 L-4 -6 L-2 -6 L3 -1.6 Z M-1 1.6 L-4 6 L-2 6 L3 1.6 Z M-7 -1.6 L-8.5 -4 L-6.5 -4 L-5 -1.6 Z M-7 1.6 L-8.5 4 L-6.5 4 L-5 1.6 Z" />
                        <animateMotion
                          dur={`${5.5 + i * 0.6}s`}
                          begin={`${1.8 + i * 0.7}s`}
                          repeatCount="indefinite"
                          rotate="auto"
                          keyPoints="0;1"
                          keyTimes="0;1"
                          calcMode="spline"
                          keySplines="0.45 0 0.55 1"
                        >
                          <mpath href={`#vx-route-${d.key}`} />
                        </animateMotion>
                      </g>
                    )}
                    <g
                      className={styles.node}
                      transform={`translate(${d.x} ${d.y})`}
                      onMouseEnter={() => setActive(d.key)}
                      onMouseLeave={() => setActive(null)}
                    >
                      <circle r="16" className={styles.nodeHalo} />
                      <circle r="6" className={styles.nodeDot} />
                      <text y="-38" className={styles.nodeCity}>{d.city}</text>
                      <text y="-24" className={styles.nodeCode}>{d.code}</text>
                    </g>
                  </g>
                );
              })}

              {/* Origin */}
              <g transform={`translate(${ROUTE_ORIGIN.x} ${ROUTE_ORIGIN.y})`}>
                <circle r="22" className={styles.originHalo} />
                <circle r="9" className={styles.originDot} />
                <text x="34" y="-6" className={styles.originCity}>{ROUTE_ORIGIN.city}</text>
                <text x="34" y="12" className={styles.originNote}>{t("routes.hub")}</text>
              </g>
            </svg>

            <div className={styles.legend}>
              <span>
                <MapPin size={14} /> {ROUTE_ORIGIN.city}, {ROUTE_ORIGIN.country}
              </span>
              <span>
                <Plane size={14} /> {t("routes.count", { count: DESTINATION_ROUTES.length })}
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default Destinations;
