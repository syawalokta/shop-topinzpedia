"use client";

/**
 * Motion primitives reusable berbasis Framer Motion.
 * Animasi dibuat halus dan hemat: fade-up saat masuk viewport,
 * stagger untuk grid, dan otomatis dimatikan bila pengguna
 * mengaktifkan prefers-reduced-motion.
 */
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];

type FadeUpProps = HTMLMotionProps<"div"> & {
  delay?: number;
  /** Jarak pergeseran vertikal awal (px) */
  offset?: number;
};

export function FadeUp({
  delay = 0,
  offset = 24,
  children,
  ...props
}: FadeUpProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
  delay = 0,
  children,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ---- Stagger: container + item untuk grid ---- */

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

export function Stagger({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-72px" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  const reduceMotion = useReducedMotion();

  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: EASE },
    },
  };

  return (
    <motion.div variants={item} {...props}>
      {children}
    </motion.div>
  );
}
