import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { HighlightTracker } from "../utils/highlightTracker";

export type EvaluationResult = {
  id: string; // 添加唯一ID
  analysis_score: {
    overall_score: number;
    neuro_score: number;
    craftsmanship_score: number;
  };
  feedback: {
    dimension: string;
    comment: string;
    example_quotes: string[];
    score: number;
  }[];
  overall_summary: string;
  createdAt: number; // 添加创建时间
};

interface CommentsContextType {
  comments: EvaluationResult[];
  addCommentInString: (text: string, editorSelection?: { from: number; to: number }, selectedText?: string) => void;
  removeCommentAt: (index: number) => void;
  clearAllComments: () => void;
  highlightTracker: HighlightTracker | null;
  setHighlightTracker: (tracker: HighlightTracker | null) => void;
  applyHighlights: () => void;
  getHighlightStats: () => {
    total: number;
    valid: number;
    invalid: number;
  };
  getCommentsById: (id: string) => EvaluationResult | undefined;
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

// Key for localStorage persistence
const LOCAL_STORAGE_KEY = "comments_context_evaluations";

export function CommentsProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage
  const [comments, setComments] = useState<EvaluationResult[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as EvaluationResult[]) : [];
    } catch (error) {
      console.error("Error reading comments from localStorage:", error);
      return [];
    }
  });
  
  const [highlightTracker, setHighlightTracker] = useState<HighlightTracker | null>(null);

  const addCommentInString = useCallback((text: string, editorSelection?: { from: number; to: number }, selectedText?: string) => {
    if (text) {
      try {
        const jsonText = text.replace(/\`\`\`json|\`\`\`/g, '');
        const evaluationData = JSON.parse(jsonText);
        
        // 添加ID和创建时间
        const evaluationResult: EvaluationResult = {
          ...evaluationData,
          id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
        };
        
        setComments((prev) => ([...(prev || []), evaluationResult] as EvaluationResult[]));
        
        // 如果有高亮追踪器和编辑器选择，添加高亮锚点
        if (highlightTracker && editorSelection && selectedText) {
          highlightTracker.addHighlightAnchor(evaluationResult.id, selectedText, editorSelection);
          highlightTracker.applyHighlights();
        }
      } catch (error) {
        console.error('Error parsing evaluation result:', error);
      }
    }
  }, [highlightTracker]);

  const removeCommentAt = useCallback((index: number) => {
    const commentToRemove = comments[index];
    if (commentToRemove && highlightTracker) {
      // 移除相关的高亮
      highlightTracker.removeEvaluationHighlights(commentToRemove.id);
    }
    
    setComments((prev) => prev.filter((_, i) => i !== index));
  }, [comments, highlightTracker]);

  const clearAllComments = useCallback(() => {
    if (highlightTracker) {
      highlightTracker.clearAllHighlights();
    }
    setComments([]);
  }, [highlightTracker]);

  const applyHighlights = useCallback(() => {
    if (highlightTracker) {
      highlightTracker.applyHighlights();
    }
  }, [highlightTracker]);

  const getHighlightStats = useCallback(() => {
    if (highlightTracker) {
      return highlightTracker.getHighlightStats();
    }
    return {
      total: 0,
      valid: 0,
      invalid: 0,
      byDimension: {},
    };
  }, [highlightTracker]);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(comments));
    } catch (error) {
      console.error("Error saving comments to localStorage:", error);
    }
  }, [comments]);

  const getCommentsById = useCallback((id: string) => {
    return comments.find((c) => c.id === id);
  }, [comments]);

  return (
    <CommentsContext.Provider value={{ 
      comments, 
      addCommentInString, 
      removeCommentAt, 
      clearAllComments,
      highlightTracker,
      setHighlightTracker,
      applyHighlights,
      getHighlightStats,
      getCommentsById,
    }}>
      {children}
    </CommentsContext.Provider>
  );
}

export function useComments() {
  const context = useContext(CommentsContext);
  if (context === undefined) {
    throw new Error("useComments must be used within a CommentsProvider");
  }
  return context;
}


