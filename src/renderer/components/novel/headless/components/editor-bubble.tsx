import { isNodeSelection, useCurrentEditor, BubbleMenu } from "@tiptap/react";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import type { ReactNode, ComponentProps } from "react";
import type { Instance, Props } from "tippy.js";

export interface EditorBubbleProps extends Omit<ComponentProps<typeof BubbleMenu>, "editor"> {
  readonly children: ReactNode;
}

export const EditorBubble = forwardRef<HTMLDivElement, EditorBubbleProps>(
  ({ children, tippyOptions, ...rest }, ref) => {
    const { editor: currentEditor } = useCurrentEditor();
    const instanceRef = useRef<Instance<Props> | null>(null);

    useEffect(() => {
      if (!instanceRef.current || !tippyOptions?.placement) return;

      instanceRef.current.setProps({ placement: tippyOptions.placement });
      instanceRef.current.popperInstance?.update();
    }, [tippyOptions?.placement]);

    const bubbleMenuProps: Omit<ComponentProps<typeof BubbleMenu>, "children"> = useMemo(() => {
      const shouldShow: NonNullable<ComponentProps<typeof BubbleMenu>["shouldShow"]> = ({ editor, state }: any) => {
        const { selection } = state;
        const { empty } = selection;

        // don't show bubble menu if:
        // - the editor is not editable
        // - the selected node is an image
        // - the selection is empty
        // - the selection is a node selection (for drag handles)
        if (!editor.isEditable || editor.isActive("image") || empty || isNodeSelection(selection)) {
          return false;
        }
        return true;
      };

      return {
        shouldShow,
        tippyOptions: {
          onCreate: (val: any) => {
            instanceRef.current = val;

            instanceRef.current?.popper.firstChild?.addEventListener("blur", (event: Event) => {
              event.preventDefault();
              event.stopImmediatePropagation();
            });
          },
          moveTransition: "transform 0.15s ease-out",
          ...tippyOptions,
        },
        editor: currentEditor,
        ...rest,
      };
    }, [rest, tippyOptions]);

    if (!currentEditor) return null;

    return (
      // We need to add this because of https://github.com/ueberdosis/tiptap/issues/2658
      <div ref={ref}>
        <BubbleMenu {...bubbleMenuProps}>{children}</BubbleMenu>
      </div>
    );
  },
);

EditorBubble.displayName = "EditorBubble";

export default EditorBubble;
