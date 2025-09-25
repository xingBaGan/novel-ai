import { Editor } from "@tiptap/core";
import { EvaluationResult } from "../contexts/CommentsContext";
import { getHighlightTracker } from "./highlightTracker";

// Color mapping for different evaluation dimensions
export const EVALUATION_COLORS = {
  high: "#dcfce7", // green-100 - for high scores (8-10)
  medium: "#fef3c7", // yellow-100 - for medium scores (5-7)
  low: "#fee2e2", // red-100 - for low scores (1-4)
  default: "#e0e7ff", // indigo-100 - default highlight
} as const;

// Get color based on score
export const getScoreColor = (score: number): string => {
  if (score >= 85) return EVALUATION_COLORS.high;
  if (score >= 60) return EVALUATION_COLORS.medium;
  return EVALUATION_COLORS.low;
};

// 简化的高亮应用 - 只对用户选择的内容进行高亮
export const applyEvaluationHighlights = (
  editor: Editor, 
  evaluationId: string,
  textContent: string,
  selection: { from: number; to: number }
): void => {
  const tracker = getHighlightTracker(editor);
  if (evaluationId && textContent && selection)  {
    // 添加高亮锚点
    tracker.addHighlightAnchor(evaluationId, textContent, selection);
  }
  
  // 应用高亮
  tracker.applyHighlights();
};

// Clear all evaluation highlights
export const clearEvaluationHighlights = (editor: Editor): void => {
  const tracker = getHighlightTracker(editor);
  tracker.clearAllHighlights();
};

// Remove highlights for a specific evaluation
export const removeEvaluationHighlights = (editor: Editor, evaluationId: string): void => {
  const tracker = getHighlightTracker(editor);
  tracker.removeEvaluationHighlights(evaluationId);
};

// Validate and refresh highlights
export const refreshHighlights = (editor: Editor): void => {
  const tracker = getHighlightTracker(editor);
  tracker.validateAnchors();
  tracker.applyHighlights();
};

// Get highlight summary for UI display
export const getHighlightSummary = (evaluation: EvaluationResult): {
  totalHighlights: number;
  dimensions: Array<{ dimension: string; count: number; avgScore: number }>;
} => {
  const dimensions = evaluation.feedback.map((feedback) => ({
    dimension: feedback.dimension,
    count: feedback.example_quotes.length,
    avgScore: feedback.score,
  }));
  
  const totalHighlights = dimensions.reduce((sum, dim) => sum + dim.count, 0);
  
  return {
    totalHighlights,
    dimensions,
  };
};

// Get highlight statistics from tracker
export const getHighlightStats = (editor: Editor) => {
  const tracker = getHighlightTracker(editor);
  return tracker.getHighlightStats();
};
