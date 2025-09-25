import { useEffect, useRef, useState } from "react";
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


