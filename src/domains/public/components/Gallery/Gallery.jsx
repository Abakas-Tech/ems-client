import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Expand, Images, RotateCw } from "lucide-react";

import getGalleryItems from "../../api/gallery.api";
import SectionHeading from "../ui/SectionHeading";
import styles from "./Gallery.module.css";

const PAGE = 6;
const ease = [0.22, 1, 0.36, 1];

function Gallery() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [visible, setVisible] = useState(PAGE);
  const [selected, setSelected] = useState(null);
  const lastTrigger = useRef(null);
  const closeBtn = useRef(null);
  const touchX = useRef(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await getGalleryItems();
      setItems(Array.isArray(res?.data) ? res.data : []);
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const open = (index, e) => {
    lastTrigger.current = e?.currentTarget || null;
    setSelected(index);
  };
  const close = useCallback(() => setSelected(null), []);
  const step = useCallback(
    (dir) =>
      setSelected((i) =>
        i === null ? i : (i + dir + items.length) % items.length,
      ),
    [items.length],
  );

  /* Lightbox: keyboard, scroll lock, focus in / focus back */
  useEffect(() => {
    if (selected === null) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    closeBtn.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [selected, close, step]);

  useEffect(() => {
    if (selected === null && lastTrigger.current) {
      lastTrigger.current.focus?.();
      lastTrigger.current = null;
    }
  }, [selected]);

  const current = selected !== null ? items[selected] : null;
  const shown = items.slice(0, visible);

  return (
    <section
      id="gallery"
      className={`vx-section ${styles.section}`}
      aria-labelledby="gallery-title"
    >
      <div className="vx-container">
        <SectionHeading
          id="gallery-title"
          ns="gallery"
        />

        {status === "loading" && (
          <div className={styles.grid} aria-busy="true" aria-label={t("gallery.loading")}>
            {Array.from({ length: PAGE }, (_, i) => (
              <div key={i} className={`${styles.tile} ${styles.skeleton}`} />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className={styles.state}>
            <Images size={28} />
            <p>{t("gallery.error")}</p>
            <button type="button" className="vx-btn vx-btn--ghost vx-btn--sm" onClick={load}>
              <RotateCw size={15} /> {t("gallery.retry")}
            </button>
          </div>
        )}

        {status === "ready" && items.length === 0 && (
          <div className={styles.state}>
            <Images size={28} />
            <p>{t("gallery.empty")}</p>
          </div>
        )}

        {status === "ready" && items.length > 0 && (
          <>
            <ul className={styles.grid}>
              {shown.map((item, index) => (
                <Motion.li
                  key={item.id ?? index}
                  className={styles.tile}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                  transition={{ duration: 0.7, delay: (index % PAGE) * 0.06, ease }}
                >
                  <button
                    type="button"
                    className={styles.tileBtn}
                    onClick={(e) => open(index, e)}
                    aria-label={`${t("gallery.open")}: ${item.title || t("gallery.image", { n: index + 1 })}`}
                  >
                    <img
                      src={item.image_url}
                      alt={item.title || t("gallery.image", { n: index + 1 })}
                      loading="lazy"
                      decoding="async"
                      className={styles.img}
                    />
                    <span className={styles.tileShade} aria-hidden="true" />
                    <span className={styles.tileMeta}>
                      {item.title && <span className={styles.tileTitle}>{item.title}</span>}
                      <span className={styles.expand} aria-hidden="true">
                        <Expand size={16} />
                      </span>
                    </span>
                  </button>
                </Motion.li>
              ))}
            </ul>

            <div className={styles.more}>
              <span className={styles.count}>
                {t("gallery.showing", { shown: shown.length, total: items.length })}
              </span>
              {visible < items.length && (
                <button
                  type="button"
                  className="vx-btn vx-btn--dark"
                  onClick={() => setVisible((v) => v + PAGE)}
                >
                  {t("gallery.more")}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {current && (
          <Motion.div
            className={styles.lightbox}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lightbox-title"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.lbTop} onClick={(e) => e.stopPropagation()}>
              <span className={styles.lbCounter}>
                {String(selected + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
              <button
                ref={closeBtn}
                type="button"
                className={styles.lbBtn}
                onClick={close}
                aria-label={t("gallery.close")}
              >
                <X size={20} />
              </button>
            </div>

            <Motion.figure
              key={selected}
              className={styles.lbFigure}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                touchX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (touchX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
                touchX.current = null;
              }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease }}
            >
              <img
                src={current.image_url}
                alt={current.title || t("gallery.image", { n: selected + 1 })}
                className={styles.lbImg}
              />
              {(current.title || current.description) && (
                <figcaption className={styles.lbCaption}>
                  {current.title && <h3 id="lightbox-title">{current.title}</h3>}
                  {current.description && <p>{current.description}</p>}
                </figcaption>
              )}
              {!current.title && (
                <span id="lightbox-title" className={styles.srOnly}>
                  {t("gallery.image", { n: selected + 1 })}
                </span>
              )}
            </Motion.figure>

            {items.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.lbBtn} ${styles.lbNav} ${styles.lbPrev}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  aria-label={t("gallery.prev")}
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  className={`${styles.lbBtn} ${styles.lbNav} ${styles.lbNext}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  aria-label={t("gallery.next")}
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </Motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Gallery;
