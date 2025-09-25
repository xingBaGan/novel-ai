import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Editor } from "@tiptap/core";
import { getHighlightTracker } from "../../../../utils/highlightTracker";

const pluginKey = new PluginKey("comment-anchors-plugin");

export const CommentAnchors = Extension.create({
  name: "comment-anchors",

  addProseMirrorPlugins() {
    const editor: Editor = this.editor as any;

    return [
      new Plugin({
        key: pluginKey,
        state: {
          init: (_, { doc }) => DecorationSet.create(doc, []),
          apply: (tr, old) => {
            // 如果文档没变且没有强制刷新标记，就直接返回原有装饰
            if (!tr.docChanged && !tr.getMeta(pluginKey)) return old;
            return buildDecorations(editor);
          },
        },
        props: {
          decorations: (state) => (pluginKey.getState(state) as DecorationSet),
        },
        // 不在 view.update 中 dispatch，避免无限事务循环
        view: () => ({
          update: () => {
            // no-op; 依赖 docChanged 或外部显式 meta 刷新
          },
        }),
      }),
    ];
  },
});

function buildDecorations(editor: Editor): DecorationSet {
  const { state } = editor;
  const doc = state.doc;
  const tracker = getHighlightTracker(editor as any);

  const widgets: Decoration[] = [];
  // 读取 anchors（通过 tracker 的内部结构）
  // 为避免直接访问私有成员，这里通过 getHighlightStats 无法取到详细列表，
  // 简化方案：从 localStorage 读取并过滤有效范围，再渲染。
  try {
    const stored = localStorage.getItem("highlight_anchors");
    if (stored) {
      const entries = JSON.parse(stored) as [string, any][];
      let runningIndex = 0;
      for (const [, anchor] of entries) {
        const from = Math.max(0, Math.min(anchor.position?.from ?? 0, doc.content.size));
        const to = Math.max(0, Math.min(anchor.position?.to ?? 0, doc.content.size));
        if (to <= from) continue;

        // 小圆点放在末尾位置
        const pos = to;
        runningIndex += 1;
        const label = String(runningIndex);
        const deco = Decoration.widget(pos, () => {
          const dot = document.createElement("button");
          dot.textContent = label;
          dot.type = "button";
          dot.className = "comment-anchor-dot";
          dot.style.width = "12px";
          dot.style.height = "12px";
          dot.style.borderRadius = "9999px";
          dot.style.background = "#7c3aed"; // 紫色
          dot.style.boxShadow = "0 0 0 2px white";
          dot.style.cursor = "pointer";
          dot.style.display = "inline-block";
          dot.style.transform = "translateY(2px)";
          dot.style.marginLeft = "2px";
          dot.style.marginTop = "5px";
          dot.style.fontSize = "10px";
          dot.style.fontWeight = "bold";
          dot.style.color = "#fff";
          dot.style.textAlign = "center";
          dot.style.lineHeight = "12px";
          dot.style.verticalAlign = "top";
          dot.setAttribute("aria-label", "Show comment");
          dot.dataset.evaluationId = anchor.highlight?.evaluationId ?? "";
          dot.addEventListener("click", (ev) => {
            const custom = new CustomEvent("comment-dot-click", {
              detail: {
                evaluationId: anchor.highlight?.evaluationId,
                anchor,
                clientX: (ev as MouseEvent).clientX,
                clientY: (ev as MouseEvent).clientY,
              },
              bubbles: true,
            });
            dot.dispatchEvent(custom);
          });
          return dot;
        }, { side: 1 });
        widgets.push(deco);
      }
    }
  } catch (e) {
    // 读取失败忽略
  }

  return DecorationSet.create(doc, widgets);
}

export default CommentAnchors;


