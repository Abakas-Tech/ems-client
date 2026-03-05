import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Loader.module.css";
import useLoader from "./../../../context/Loader/useLoader";

const dotVariants = {
  bounce: {
    y: [0, -12, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const Loader = () => {
  const { loading } = useLoader();

  return (
    <AnimatePresence>
      {loading && (
        <>
          <motion.div
            key="blur-overlay"
            className={styles.blurOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            key="loader"
            className={styles.loaderContainer}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.dotsWrapper}>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className={styles.dot}
                  variants={dotVariants}
                  animate="bounce"
                  transition={{ delay: i * 0.2 }}
                />
              ))}
            </div>
            <motion.p
              className={styles.loadingText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            ></motion.p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Loader;
