import { useEffect } from "react"
import { EditorContent, useEditor, useEditorState } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import {
  FiLink,
  FiList,
  FiMessageSquare,
  FiRotateCcw,
  FiRotateCw,
} from "react-icons/fi"

const ToolbarButton = ({ label, active = false, disabled = false, onClick, children }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={active}
    disabled={disabled}
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    className={`rich-editor-button ${active ? "is-active" : ""}`}
  >
    {children}
  </button>
)

const RichTextEditor = ({ value, onChange, labelledBy }) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          HTMLAttributes: {
            target: "_blank",
            rel: "noopener noreferrer nofollow",
          },
        },
      }),
      Placeholder.configure({ placeholder: "Start writing your blog post..." }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        "aria-labelledby": labelledBy,
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor: activeEditor }) => onChange(activeEditor.getHTML()),
  })

  const editorState = useEditorState({
    editor,
    selector: ({ editor: activeEditor }) => ({
      bold: activeEditor?.isActive("bold") ?? false,
      italic: activeEditor?.isActive("italic") ?? false,
      underline: activeEditor?.isActive("underline") ?? false,
      heading2: activeEditor?.isActive("heading", { level: 2 }) ?? false,
      heading3: activeEditor?.isActive("heading", { level: 3 }) ?? false,
      bulletList: activeEditor?.isActive("bulletList") ?? false,
      orderedList: activeEditor?.isActive("orderedList") ?? false,
      blockquote: activeEditor?.isActive("blockquote") ?? false,
      link: activeEditor?.isActive("link") ?? false,
      canUndo: activeEditor?.can().undo() ?? false,
      canRedo: activeEditor?.can().redo() ?? false,
      wordCount: activeEditor?.getText().trim().split(/\s+/).filter(Boolean).length ?? 0,
    }),
  })

  useEffect(() => {
    if (editor && editor.getHTML() !== (value || "")) {
      editor.commands.setContent(value || "", { emitUpdate: false })
    }
  }, [editor, value])

  const handleLink = async () => {
    if (!editor) return

    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run()
      return
    }

    const { default: Swal } = await import("sweetalert2")
    const result = await Swal.fire({
      title: "Add a link",
      input: "url",
      inputPlaceholder: "https://example.com",
      showCancelButton: true,
      confirmButtonText: "Add link",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#123e43",
      cancelButtonColor: "#52756c",
      inputValidator: (url) => {
        try {
          const parsedUrl = new URL(url)
          if (["http:", "https:"].includes(parsedUrl.protocol)) return undefined
        } catch {
          return "Enter a valid HTTP or HTTPS address."
        }

        return "Enter a valid HTTP or HTTPS address."
      },
    })

    if (result.isConfirmed && result.value) {
      editor.chain().focus().setLink({ href: result.value }).run()
    }
  }

  if (!editor) return null

  return (
    <div className="rich-editor-shell">
      <div role="toolbar" aria-label="Story formatting" className="rich-editor-toolbar">
        <div className="rich-editor-group">
          <ToolbarButton label="Bold" active={editorState.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton label="Italic" active={editorState.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <span className="italic">I</span>
          </ToolbarButton>
          <ToolbarButton label="Underline" active={editorState.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <span className="underline">U</span>
          </ToolbarButton>
          <ToolbarButton label={editorState.link ? "Remove link" : "Add link"} active={editorState.link} onClick={handleLink}>
            <FiLink aria-hidden="true" className="size-4" />
          </ToolbarButton>
        </div>

        <span aria-hidden="true" className="rich-editor-divider" />

        <div className="rich-editor-group">
          <ToolbarButton label="Heading 2" active={editorState.heading2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            H2
          </ToolbarButton>
          <ToolbarButton label="Heading 3" active={editorState.heading3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            H3
          </ToolbarButton>
          <ToolbarButton label="Bullet list" active={editorState.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <FiList aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Numbered list" active={editorState.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <span className="text-xs font-semibold">1.</span>
          </ToolbarButton>
          <ToolbarButton label="Quote" active={editorState.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <FiMessageSquare aria-hidden="true" className="size-4" />
          </ToolbarButton>
        </div>

        <span aria-hidden="true" className="rich-editor-divider" />

        <div className="rich-editor-group">
          <ToolbarButton label="Undo" disabled={!editorState.canUndo} onClick={() => editor.chain().focus().undo().run()}>
            <FiRotateCcw aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Redo" disabled={!editorState.canRedo} onClick={() => editor.chain().focus().redo().run()}>
            <FiRotateCw aria-hidden="true" className="size-4" />
          </ToolbarButton>
        </div>
      </div>

      <EditorContent editor={editor} />
      <div className="rich-editor-footer">
        <span>Rich text</span>
        <span>{editorState.wordCount} {editorState.wordCount === 1 ? "word" : "words"}</span>
      </div>
    </div>
  )
}

export default RichTextEditor