import { defaultEditorContent } from "../lib/content";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  handleCommandNavigation,
  handleImagePaste,
} from "./novel/headless";
import { useEffect, useState, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./novel/ui/extensions";
import { Separator } from "./novel/ui/ui/separator";

import GenerativeMenuSwitch from "./novel/ui/generative/generative-menu-switch";
import { uploadFn } from "./novel/ui/image-upload";
import { slashCommand, suggestionItems } from "./novel/ui/slash-command";

import hljs from "highlight.js";
import { useComments } from "../contexts/CommentsContext";
import { clearEvaluationHighlights } from "../utils/evaluationHighlighter";
import { getHighlightTracker } from "../utils/highlightTracker";

const extensions = [...defaultExtensions, slashCommand];

const NovelEditor = () => {
  const [initialContent, setInitialContent] = useState<null | JSONContent>(null);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [charsCount, setCharsCount] = useState();
  const [editorReady, setEditorReady] = useState(false);
  const editorRef = useRef<EditorInstance | null>(null);

  const [openAI, setOpenAI] = useState(false);

  const { comments, clearAllComments } = useComments();

  //Apply Codeblock Highlighting on the HTML from editor.getHTML()
  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      // @ts-ignore
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    const json = editor.getJSON();
    setCharsCount(editor.storage.characterCount.words());
    window.localStorage.setItem("html-content", highlightCodeblocks(editor.getHTML()));
    window.localStorage.setItem("novel-content", JSON.stringify(json));
    window.localStorage.setItem("markdown", editor.storage.markdown.getMarkdown());
    setSaveStatus("Saved");
  }, 500);

  useEffect(() => {
    const content = window.localStorage.getItem("novel-content");
    if (content) setInitialContent(JSON.parse(content));
    else setInitialContent(defaultEditorContent);
  }, []);

  // Apply highlights when comments change
  useEffect(() => {
    if (!editorReady || !editorRef.current) return;
    const tracker = getHighlightTracker(editorRef.current);
    tracker.applyHighlights();
  }, [comments, editorReady]);

  if (!initialContent) return null;

  return (
    <div className="relative w-full max-w-screen-lg mx-auto">
      <div className="flex absolute right-5 top-5 z-[8] mb-5 gap-2">
        <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">{saveStatus}</div>
        <div className={charsCount ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground" : "hidden"}>
          {charsCount} Words
        </div>
        {comments.length > 0 && (
          <div className="flex gap-2">
            <div className="rounded-lg bg-blue-100 px-2 py-1 text-sm text-blue-800">
              {comments.length} Evaluation{comments.length > 1 ? "s" : ""}
            </div>
            <button
              onClick={() => {
                if (editorRef.current) {
                  clearEvaluationHighlights(editorRef.current);
                }
              }}
              className="rounded-lg bg-gray-100 px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
            >
              Clear Highlights
            </button>
            <button
              onClick={() => {
                clearAllComments();
                if (editorRef.current) {
                  clearEvaluationHighlights(editorRef.current);
                }
              }}
              className="rounded-lg bg-red-100 px-2 py-1 text-sm text-red-700 hover:bg-red-200"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
      <EditorRoot
      >
        <EditorContent
          initialContent={initialContent}
          extensions={extensions}
          className="relative min-h-[500px] w-full max-w-screen-lg border-muted bg-background sm:rounded-lg sm:border sm:shadow-lg max-h-[80vh] overflow-y-auto"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onCreate={({ editor }) => {
            editorRef.current = editor;
            setEditorReady(true);
            // 首次进入自动应用已存的 anchors 高亮
            setTimeout(() => {
              const tracker = getHighlightTracker(editor);
              tracker.applyHighlights();
            }, 0);
          }}
          onUpdate={({ editor }) => {
            editorRef.current = editor;
            debouncedUpdates(editor);
            setSaveStatus("Unsaved");
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={() => {
                    if (item.command && editorRef.current) {
                      item.command({ editor: editorRef.current, range: { from: 0, to: 0 } });
                    }
                  }}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation="vertical" />
          </GenerativeMenuSwitch>
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default NovelEditor;
