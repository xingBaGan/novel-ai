import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { CommentContent } from "./Comments";

type DotEventDetail = {
  evaluationId?: string;
  anchor?: any;
  clientX: number;
  clientY: number;
};
const left_DELTA = -200;
export default function CommentTooltip() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [evaluationId, setEvaluationId] = useState<string | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<DotEventDetail>;
      const detail = custom.detail;
      if (!detail) return;
      setEvaluationId(detail.evaluationId);
      // 轻微偏移，避免遮挡指针
      setPos({ x: detail.clientX + 8, y: detail.clientY + 8 });
      setOpen(true);
    };
    window.addEventListener("comment-dot-click", handler as any, true);
    return () => window.removeEventListener("comment-dot-click", handler as any, true);
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onDocClick, true);
    return () => document.removeEventListener("mousedown", onDocClick, true);
  }, [open]);

  // 保证浮层底部不超过可视区域；若超过则向上偏移（至少 1px）
  useLayoutEffect(() => {
    if (!open) return;
    let raf = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const overflow = rect.bottom - window.innerHeight;
      if (overflow > 0) {
        // 放到软件右上角（视口右上角），留出 12px 边距
        const desiredLeft = Math.max(0, window.innerWidth - rect.width - 12);
        setPos({ x: desiredLeft - left_DELTA, y: 12 });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [open, pos.x, pos.y]);

  if (!open || !evaluationId) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        left: `${pos.x + left_DELTA}px`,
        top: `${pos.y}px`,
        zIndex: 9999,
      }}
    >
      <div style={{ maxWidth: 800, background: "white", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 10px 30px rgba(0,0,0,0.12)", borderRadius: 8, padding: 12 }}>
        <CommentContent id={evaluationId} />
      </div>
    </div>
  );
}


