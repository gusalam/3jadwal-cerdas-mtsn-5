import { useEffect, useRef, useState } from "react";

export const useStaggerFadeIn = (itemCount: number, staggerMs = 120, threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  const getItemStyle = (index: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.5s ease-out ${index * staggerMs}ms, transform 0.5s ease-out ${index * staggerMs}ms`,
  });

  return { ref, visible, getItemStyle };
};
