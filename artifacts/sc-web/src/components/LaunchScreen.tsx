import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = { onFinish: () => void };

export function LaunchScreen({ onFinish }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [barPct, setBarPct] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);

  const handleImageLoad = () => {
    setImgLoaded(true);
  };

  useEffect(() => {
    if (!imgLoaded) return;

    setBarPct(0);
    let current = 0;
    intervalRef.current = setInterval(() => {
      current = Math.min(current + (Math.random() * 3 + 1), 100);
      setBarPct(current);
      if (current >= 100) {
        clearInterval(intervalRef.current!);
        setTimeout(() => {
          setVisible(false);
          setTimeout(onFinish, 400);
        }, 300);
      }
    }, 40);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [imgLoaded]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            backgroundColor: "#F8F6F3",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 36,
          }}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 14, stiffness: 140 }}
          >
            <img
              src={`${import.meta.env.BASE_URL}assets/brainbloom-logo.png`}
              alt="BrainBloom"
              width={260}
              height={260}
              onLoad={handleImageLoad}
              style={{ objectFit: "contain" }}
            />
          </motion.div>

          <AnimatePresence>
            {imgLoaded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ width: 220, display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div style={{
                  height: 4, borderRadius: 4,
                  backgroundColor: "#E8E4E0",
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    borderRadius: 4,
                    width: `${barPct}%`,
                    background: "linear-gradient(90deg, #2D7A4F, #7DD4A8)",
                    transition: "width 0.04s linear",
                  }} />
                </div>
                <div style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#B0B8C8",
                  fontFamily: "Inter, sans-serif",
                }}>
                  {Math.round(barPct)}%
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
