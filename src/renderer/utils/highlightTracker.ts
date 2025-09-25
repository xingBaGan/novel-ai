import { Editor } from "@tiptap/core";

// 简化的高亮锚点数据结构
export interface HighlightAnchor {
  id: string;
  textContent: string;
  position: {
    from: number;
    to: number;
  };
  highlight: {
    color: string;
    evaluationId: string;
  };
  createdAt: number;
  isValid: boolean;
}

// 简化的高亮追踪器类
export class HighlightTracker {
  private anchors: Map<string, HighlightAnchor> = new Map();
  private editor: Editor | null = null;
  private static readonly SIMILARITY_THRESHOLD = 0.65; // 放宽校验阈值（0~1）
  
  constructor(editor: Editor) {
    this.editor = editor;
    this.loadFromStorage();
  }
  
  // 添加高亮锚点 - 只对用户选择的内容进行高亮
  addHighlightAnchor(
    evaluationId: string,
    textContent: string,
    selection: { from: number; to: number }
  ): HighlightAnchor {
    const anchor: HighlightAnchor = {
      id: `${evaluationId}-${Date.now()}`,
      textContent: textContent,
      position: {
        from: selection.from,
        to: selection.to,
      },
      highlight: {
        color: "#e0e7ff", // 默认蓝色高亮
        evaluationId: evaluationId,
      },
      createdAt: Date.now(),
      isValid: true,
    };
    
    this.anchors.set(anchor.id, anchor);
    this.saveToStorage();
    return anchor;
  }
  
  // 验证并更新锚点 - 简化版本
  validateAnchors(): void {
    if (!this.editor) return;
    
    const doc = this.editor.state.doc;
    const docSize = doc.content.size;
    
    this.anchors.forEach((anchor) => {
      const from = Math.max(0, Math.min(anchor.position.from, docSize));
      const to = Math.max(0, Math.min(anchor.position.to, docSize));
      if (from >= to) {
        anchor.isValid = false;
        return;
      }
      const currentText = doc.textBetween(from, to, "\n");
      // 宽松校验：文本完全相同 或 相似度超过阈值（允许少量编辑）
      anchor.isValid = this.areTextsSimilar(anchor.textContent, currentText);
    });
    
    this.saveToStorage();
  }
  
  // 应用所有有效的高亮
  applyHighlights(): void {
    if (!this.editor) return;
    this.validateAnchors();
    
    // 清除现有高亮
    this.clearAllHighlights();
    
    // 应用有效的高亮
    this.anchors.forEach((anchor) => {
      if (anchor.isValid) {
        this.applySingleHighlight(anchor);
      }
    });
  }
  
  // 移除特定评估的高亮
  removeEvaluationHighlights(evaluationId: string): void {
    const toRemove: string[] = [];
    
    this.anchors.forEach((anchor, id) => {
      if (anchor.highlight.evaluationId === evaluationId) {
        toRemove.push(id);
      }
    });
    
    toRemove.forEach(id => this.anchors.delete(id));
    this.saveToStorage();
    this.applyHighlights();
  }
  
  // 清除所有高亮
  clearAllHighlights(): void {
    if (!this.editor) return;
    
    const { state } = this.editor;
    const { tr } = state;
    
    state.doc.descendants((node, pos) => {
      if (node.marks) {
        node.marks.forEach((mark) => {
          if (mark.type.name === "ai-highlight") {
            tr.removeMark(pos, pos + node.nodeSize, mark.type);
          }
        });
      }
    });
    
    this.editor.view.dispatch(tr);
  }
  
  // 获取高亮统计信息
  getHighlightStats(): {
    total: number;
    valid: number;
    invalid: number;
  } {
    const stats = {
      total: this.anchors.size,
      valid: 0,
      invalid: 0,
    };
    
    this.anchors.forEach((anchor) => {
      if (anchor.isValid) {
        stats.valid++;
      } else {
        stats.invalid++;
      }
    });
    
    return stats;
  }
  
  // 私有方法
  private applySingleHighlight(anchor: HighlightAnchor): void {
    if (!this.editor) return;
    
    const docSize = this.editor.state.doc.content.size;
    const from = Math.max(0, Math.min(anchor.position.from, docSize));
    const to = Math.max(0, Math.min(anchor.position.to, docSize));
    if (from >= to) return;
    this.editor!
    .chain()
    .setTextSelection({ from, to })
    .setAIHighlight({ color: anchor.highlight.color })
    .run();
  }
  
  private findTextPositions(content: string, searchText: string): Array<{ from: number; to: number }> {
    const positions: Array<{ from: number; to: number }> = [];
    let index = 0;
    
    while (index < content.length) {
      const foundIndex = content.toLowerCase().indexOf(searchText.toLowerCase(), index);
      if (foundIndex === -1) break;
      
      positions.push({
        from: foundIndex,
        to: foundIndex + searchText.length,
      });
      
      index = foundIndex + 1;
    }
    
    return positions;
  }

  // 判断两段文本是否相似（大小写不敏感，允许小幅编辑/插入/删除）
  private areTextsSimilar(a: string, b: string): boolean {
    const s1 = (a || "").trim().toLowerCase();
    const s2 = (b || "").trim().toLowerCase();
    if (s1.length === 0 || s2.length === 0) return false;
    if (s1 === s2) return true;

    // 快速包含判断：短文本完全包含于长文本
    if (s1.includes(s2) || s2.includes(s1)) {
      const shortLen = Math.min(s1.length, s2.length);
      const longLen = Math.max(s1.length, s2.length);
      const ratio = shortLen / longLen;
      return ratio >= HighlightTracker.SIMILARITY_THRESHOLD;
    }

    // 计算标准化 Levenshtein 相似度
    const dist = this.levenshteinDistance(s1, s2);
    const maxLen = Math.max(s1.length, s2.length);
    const similarity = 1 - dist / maxLen;
    return similarity >= HighlightTracker.SIMILARITY_THRESHOLD;
  }

  // Levenshtein 距离（空间优化版）
  private levenshteinDistance(a: string, b: string): number {
    const n = a.length;
    const m = b.length;
    if (n === 0) return m;
    if (m === 0) return n;

    let prev = new Array(m + 1);
    let curr = new Array(m + 1);
    for (let j = 0; j <= m; j++) prev[j] = j;

    for (let i = 1; i <= n; i++) {
      curr[0] = i;
      const ai = a.charCodeAt(i - 1);
      for (let j = 1; j <= m; j++) {
        const cost = ai === b.charCodeAt(j - 1) ? 0 : 1;
        curr[j] = Math.min(
          prev[j] + 1,        // 删除
          curr[j - 1] + 1,    // 插入
          prev[j - 1] + cost  // 替换
        );
      }
      // 交换行
      const tmp = prev; prev = curr; curr = tmp;
    }
    return prev[m];
  }
  
  private saveToStorage(): void {
    try {
      const data = Array.from(this.anchors.entries());
      localStorage.setItem('highlight_anchors', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving highlight anchors:', error);
    }
  }
  
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('highlight_anchors');
      if (stored) {
        const data = JSON.parse(stored) as [string, HighlightAnchor][];
        this.anchors = new Map(data);
      }
    } catch (error) {
      console.error('Error loading highlight anchors:', error);
    }
  }
}

// 单例实例
let highlightTrackerInstance: HighlightTracker | null = null;

export const getHighlightTracker = (editor: Editor): HighlightTracker => {
  if (!highlightTrackerInstance) {
    highlightTrackerInstance = new HighlightTracker(editor);
  }
  return highlightTrackerInstance;
};

export const clearHighlightTracker = (): void => {
  highlightTrackerInstance = null;
};