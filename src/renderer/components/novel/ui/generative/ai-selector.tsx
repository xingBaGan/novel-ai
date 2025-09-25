import { Command, CommandInput } from "../ui/command";

import { useCompletion } from "@ai-sdk/react";
import { ArrowUp } from "lucide-react";
import { useEditor } from "novel";
import { addAIHighlight } from "novel";
import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "../ui/button";
import CrazySpinner from "../ui/icons/crazy-spinner";
import Magic from "../ui/icons/magic";
import { ScrollArea } from "../ui/scroll-area";
import AICompletionCommands from "./ai-completion-command";
import AISelectorCommands from "./ai-selector-commands";
//TODO: I think it makes more sense to create a custom Tiptap extension for this functionality https://tiptap.dev/docs/editor/ai/introduction
import { useComments } from "../../../../contexts/CommentsContext";
import { getHighlightTracker } from "../../../../utils/highlightTracker";

interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISelector({ onOpenChange }: AISelectorProps) {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");
  const [command, setCommand] = useState("");
  const { addCommentInString, setHighlightTracker } = useComments();

  // 初始化高亮追踪器
  useEffect(() => {
    if (editor) {
      const tracker = getHighlightTracker(editor);
      setHighlightTracker(tracker);
    }
  }, [editor, setHighlightTracker]);

  const { completion, complete, isLoading } = useCompletion({
    api: "/api/generate",
    onFinish: (prompt, completion) => {
      console.log('prompt', prompt, 'completion', completion);
      
      // 获取当前编辑器选择范围和选择的文本
      const editorSelection = editor ? {
        from: editor.state.selection.from,
        to: editor.state.selection.to,
      } : undefined;
      
      const selectedText = editor ? editor.state.doc.textBetween(
        editor.state.selection.from, 
        editor.state.selection.to
      ) : '';
      
      addCommentInString(completion, editorSelection, selectedText);
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  const onSelect = (value: string, option: string) => {
    complete(value, { body: { option } });
    setCommand(option);
  };
  const hasCompletion = completion.length > 0;
  
  const isEvaluate = command === "evaluate";
  return (
    <Command className="w-[350px]">
      {hasCompletion && !isEvaluate && (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <div className="prose p-2 px-4 prose-sm">
              <Markdown>{completion}</Markdown>
            </div>
          </ScrollArea>
        </div>
      )}

      {isLoading && (
        <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-muted-foreground text-purple-500">
          <Magic className="mr-2 h-4 w-4 shrink-0  " />
          AI is thinking
          <div className="ml-2 mt-1">
            <CrazySpinner />
          </div>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="relative">
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              autoFocus
              placeholder={hasCompletion ? "Tell AI what to do next" : "Ask AI to edit or generate..."}
              onFocus={() => editor && addAIHighlight(editor)}
            />
            <Button
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-900"
              onClick={() => {
                if (!editor) return;
                if (completion)
                  return complete(completion, {
                    body: { option: "zap", command: inputValue },
                  }).then(() => setInputValue(""));

                const slice = editor.state.selection.content();
                const text = editor.storage.markdown.serializer.serialize(slice.content);

                complete(text, {
                  body: { option: "zap", command: inputValue },
                }).then(() => setInputValue(""));
              }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          {hasCompletion ? (
            <AICompletionCommands
              onDiscard={() => {
                if (editor) {
                  editor.chain().unsetHighlight().focus().run();
                }
                onOpenChange(false);
              }}
              completion={completion}
            />
          ) : (
            <AISelectorCommands onSelect={onSelect} />
          )}
        </>
      )}
    </Command>
  );
}
