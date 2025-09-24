import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

export type EvaluationResult = {
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
};

interface CommentsContextType {
  comments: EvaluationResult[];
  addCommentInString: (text: string) => void;
  removeCommentAt: (index: number) => void;
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
  const addCommentInString = useCallback((text: string) => {
    if (text) {
      try {
        const jsonText = text.replace(/\`\`\`json|\`\`\`/g, '');
        const evaluationResult = JSON.parse(jsonText);
        setComments((prev) => ([...(prev || []), evaluationResult] as EvaluationResult[]));
      } catch (error) {
        console.error('Error parsing evaluation result:', error);
      }
    }
  }, []);

  const removeCommentAt = useCallback((index: number) => {
    setComments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(comments));
    } catch (error) {
      console.error("Error saving comments to localStorage:", error);
    }
  }, [comments]);

  
  return (
    <CommentsContext.Provider value={{ comments, addCommentInString, removeCommentAt }}>
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


