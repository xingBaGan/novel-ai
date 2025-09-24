import { createContext, useContext, useState, ReactNode, useCallback } from "react";

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
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<EvaluationResult[]>([]);
  const addCommentInString = useCallback((text: string) => {
    if (text) {
      try {
        const jsonText = text.replace(/\`\`\`json|\`\`\`/g, '');
        const evaluationResult = JSON.parse(jsonText);
        setComments([...(comments || []), evaluationResult] as EvaluationResult[]);
      } catch (error) {
        console.error('Error parsing evaluation result:', error);
      }
    }
  }, [comments]);
  return (
    <CommentsContext.Provider value={{ comments, addCommentInString }}>
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


