"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Extension, Node, mergeAttributes } from "@tiptap/core";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  CodeXml,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Palette,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
  Video,
} from "lucide-react";
import { uploadImageToStorage } from "@/services/storage.service";
import { cn } from "@/lib/utils";

/**
 * Preserves and controls `data-indent="1..7"` from legacy element-tiptap content.
 */
const DataIndentExtension = Extension.create({
  name: "dataIndent",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading", "blockquote"],
        attributes: {
          "data-indent": {
            default: null,
            parseHTML: (element) => element.getAttribute("data-indent"),
            renderHTML: (attributes) =>
              attributes["data-indent"]
                ? { "data-indent": attributes["data-indent"] }
                : {},
          },
        },
      },
    ];
  },
});

/**
 * Custom Image extension that preserves width, height, style, and data-display
 * attributes from legacy element-tiptap HTML content and supports inline alignment.
 */
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("width") || element.style.width || null,
        renderHTML: (attributes) =>
          attributes.width ? { width: attributes.width } : {},
      },
      height: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("height") || element.style.height || null,
        renderHTML: (attributes) =>
          attributes.height ? { height: attributes.height } : {},
      },
      "data-display": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-display"),
        renderHTML: (attributes) =>
          attributes["data-display"]
            ? { "data-display": attributes["data-display"] }
            : {},
      },
    };
  },
});

/**
 * Custom Iframe extension compatible with legacy `<iframe class="el-tiptap-iframe" src="...">`
 * and YouTube/Spotify embeds.
 */
const CustomIframe = Node.create({
  name: "iframe",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      frameborder: {
        default: "0",
      },
      allowfullscreen: {
        default: "true",
      },
      class: {
        default: "el-tiptap-iframe",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "tiptap-iframe-wrapper" },
      ["iframe", mergeAttributes(HTMLAttributes)],
    ];
  },
});

function normalizeEmbedUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  try {
    const u = new URL(trimmed);
    if (u.hostname.includes("youtube.com") && u.searchParams.has("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be" && u.pathname.length > 1) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
  } catch {
    // Fallback to raw string if not a valid URL
  }
  return trimmed;
}

const FONT_SIZES = [
  { label: "기본 크기", value: "" },
  { label: "13px", value: "13px" },
  { label: "15px", value: "15px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "28px", value: "28px" },
];

const LINE_HEIGHTS = [
  { label: "줄간격", value: "" },
  { label: "1.4", value: "1.4" },
  { label: "1.6", value: "1.6" },
  { label: "1.7 (기본)", value: "1.7" },
  { label: "1.85", value: "1.85" },
  { label: "2.0", value: "2.0" },
];

interface TiptapReviewEditorProps {
  content: string;
  onChange?: (html: string) => void;
  editable?: boolean;
}

export function TiptapReviewEditor({
  content,
  onChange,
  editable = true,
}: TiptapReviewEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const uploadAndInsertFiles = useCallback(
    async (
      files: File[],
      insertAtUrl: (publicUrl: string) => void
    ): Promise<void> => {
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      setUploadingImage(true);
      try {
        for (const file of imageFiles) {
          const publicUrl = await uploadImageToStorage(file);
          insertAtUrl(publicUrl);
        }
      } catch (err) {
        alert(
          err instanceof Error
            ? err.message
            : "이미지 업로드 중 오류가 발생했습니다."
        );
      } finally {
        setUploadingImage(false);
      }
    },
    []
  );

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        link: {
          openOnClick: !editable,
          autolink: true,
        },
      }),
      DataIndentExtension,
      TextStyleKit,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TableKit.configure({
        table: { resizable: true },
      }),
      CustomImage.configure({
        inline: true,
        allowBase64: true,
      }),
      CustomIframe,
    ],
    content,
    editorProps: {
      handleDrop: (view, event, _slice, moved) => {
        if (
          moved ||
          !editable ||
          !event.dataTransfer ||
          !event.dataTransfer.files ||
          event.dataTransfer.files.length === 0
        ) {
          return false;
        }
        const files = Array.from(event.dataTransfer.files).filter((file) =>
          file.type.startsWith("image/")
        );
        if (files.length === 0) return false;

        event.preventDefault();
        const coordinates = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });

        void uploadAndInsertFiles(files, (publicUrl) => {
          const { schema } = view.state;
          const imageNode = schema.nodes.image?.create({ src: publicUrl });
          if (!imageNode) return;
          const pos = coordinates?.pos ?? view.state.selection.from;
          const tr = view.state.tr.insert(pos, imageNode);
          view.dispatch(tr);
        });
        return true;
      },
      handlePaste: (view, event) => {
        if (!editable || !event.clipboardData?.files?.length) {
          return false;
        }
        const files = Array.from(event.clipboardData.files).filter((file) =>
          file.type.startsWith("image/")
        );
        if (files.length === 0) return false;

        event.preventDefault();
        void uploadAndInsertFiles(files, (publicUrl) => {
          const { schema } = view.state;
          const imageNode = schema.nodes.image?.create({ src: publicUrl });
          if (!imageNode) return;
          const tr = view.state.tr.replaceSelectionWith(imageNode);
          view.dispatch(tr);
        });
        return true;
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getHTML());
    },
  });

  // Sync external content when loaded asynchronously (e.g. in edit or detail view)
  useEffect(() => {
    if (!editor) return;
    if (content && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  if (!editor) {
    return (
      <div className="py-12 text-center text-sm text-[#808080]">
        에디터를 준비하는 중입니다...
      </div>
    );
  }

  const handleImageFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    await uploadAndInsertFiles(files, (publicUrl) => {
      editor.chain().focus().setImage({ src: publicUrl }).run();
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAdjustIndent = (delta: number) => {
    const types = ["paragraph", "heading", "blockquote"] as const;
    for (const type of types) {
      if (editor.isActive(type)) {
        const current = Number(editor.getAttributes(type)["data-indent"] || 0);
        const next = Math.max(0, Math.min(7, current + delta));
        editor
          .chain()
          .focus()
          .updateAttributes(type, {
            "data-indent": next === 0 ? null : String(next),
          })
          .run();
        return;
      }
    }
  };

  const handleSetLink = () => {
    const previousUrl = editor.getAttributes("link").href ?? "";
    const url = window.prompt("링크 URL을 입력하세요:", previousUrl);
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  const handleInsertIframe = () => {
    const raw = window.prompt(
      "YouTube 주소 또는 임베드(iframe) URL을 입력하세요:"
    );
    if (!raw || !raw.trim()) return;
    const src = normalizeEmbedUrl(raw);
    editor
      .chain()
      .focus()
      .insertContent({
        type: "iframe",
        attrs: { src },
      })
      .run();
  };

  if (!editable) {
    return (
      <div className="tiptap-readonly editorial-prose max-w-[68ch] mx-auto">
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div className="rounded-[7px] border border-[#bdc0c4] bg-white focus-within:border-[#242d3c]">
      {/* Hidden Image Upload Input (supports single or multiple images) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageFileSelect}
        className="hidden"
      />

      {/* Sticky Toolbar Header (frosted translucent section with breathing room below the 52px site header) */}
      <div className="sticky top-[52px] z-30 pt-2.5 pb-2 px-2 bg-white/80 backdrop-blur-md border-b border-[#bdc0c4]/50">
        <div className="rounded-[7px] overflow-hidden border border-[#bdc0c4]/80 bg-[#f3f3f3]/90 backdrop-blur-md shadow-sm">
          {/* Rich Text Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-2 text-[#242d3c]">
        {/* History */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="실행 취소 (Undo)"
        >
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="다시 실행 (Redo)"
        >
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>

        <span className="h-4 w-px bg-[#bdc0c4] mx-0.5" />

        {/* Paragraph & Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph")}
          title="본문 단락"
        >
          <Pilcrow className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="제목 1 (# )"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="제목 2 (## )"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="제목 3 (### )"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        {/* Font Size & Line Height */}
        <select
          onChange={(e) => {
            const val = e.target.value;
            if (!val) {
              editor.chain().focus().unsetFontSize().run();
            } else {
              editor.chain().focus().setFontSize(val).run();
            }
          }}
          defaultValue=""
          aria-label="글자 크기"
          className="px-2 py-1 rounded-[7px] border border-[#bdc0c4] bg-white text-xs font-bold text-[#242d3c] focus:outline-none"
        >
          {FONT_SIZES.map((s) => (
            <option key={s.label} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => {
            const val = e.target.value;
            if (!val) {
              editor.chain().focus().unsetLineHeight().run();
            } else {
              editor.chain().focus().setLineHeight(val).run();
            }
          }}
          defaultValue=""
          aria-label="줄간격"
          className="px-2 py-1 rounded-[7px] border border-[#bdc0c4] bg-white text-xs font-bold text-[#242d3c] focus:outline-none"
        >
          {LINE_HEIGHTS.map((lh) => (
            <option key={lh.label} value={lh.value}>
              {lh.label}
            </option>
          ))}
        </select>

        <span className="h-4 w-px bg-[#bdc0c4] mx-0.5" />

        {/* Text Marks */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="굵게 (**텍스트**)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="기울임 (*텍스트*)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="밑줄 (Underline)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="취소선 (~~텍스트~~)"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="인라인 코드 (`코드`)"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="코드 블록 (```)"
        >
          <CodeXml className="w-4 h-4" />
        </ToolbarButton>

        {/* Text Color & Highlight */}
        <label
          title="글자 색상"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-[7px] hover:bg-white cursor-pointer"
        >
          <Palette className="w-4 h-4 text-[#242d3c]" />
          <input
            type="color"
            defaultValue="#171717"
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
            className="w-4 h-4 border-0 p-0 bg-transparent cursor-pointer"
          />
        </label>

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHighlight({ color: "#fff3a3" }).run()
          }
          active={editor.isActive("highlight")}
          title="형광펜 하이라이트"
        >
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>

        <span className="h-4 w-px bg-[#bdc0c4] mx-0.5" />

        {/* Alignment & Indent */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="왼쪽 정렬"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="가운데 정렬"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="오른쪽 정렬"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          title="양쪽 정렬"
        >
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => handleAdjustIndent(1)}
          title="들여쓰기 (Indent)"
        >
          <IndentIncrease className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => handleAdjustIndent(-1)}
          title="내어쓰기 (Outdent)"
        >
          <IndentDecrease className="w-4 h-4" />
        </ToolbarButton>

        <span className="h-4 w-px bg-[#bdc0c4] mx-0.5" />

        {/* Lists, Blockquote (>), HR */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="글머리 기호 목록 (- )"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="번호 매기기 목록 (1. )"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="인용구 들여쓰기 (> )"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="구분선 삽입 (---)"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <span className="h-4 w-px bg-[#bdc0c4] mx-0.5" />

        {/* Link, Image Upload, Video/Iframe, Table */}
        <ToolbarButton
          onClick={handleSetLink}
          active={editor.isActive("link")}
          title="링크 삽입/수정"
        >
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="링크 해제"
          >
            <Link2Off className="w-4 h-4 text-[#ff8080]" />
          </ToolbarButton>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          title="이미지 파일 업로드 및 본문 삽입 (드래그 앤 드롭 또는 Ctrl+V 붙여넣기도 지원)"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] bg-white border border-[#bdc0c4] text-xs font-bold text-[#242d3c] hover:border-[#242d3c] transition-colors cursor-pointer disabled:opacity-50"
        >
          {uploadingImage ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ff8080]" />
              <span>업로드 중...</span>
            </>
          ) : (
            <>
              <ImagePlus className="w-3.5 h-3.5 text-[#ff8080]" />
              <span>이미지 첨부</span>
            </>
          )}
        </button>

        <ToolbarButton
          onClick={handleInsertIframe}
          title="YouTube / 외부 영상 임베드 (Iframe)"
        >
          <Video className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          title="표 삽입 (3x3)"
        >
          <TableIcon className="w-4 h-4" />
        </ToolbarButton>

        {editor.isActive("table") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().deleteTable().run()}
            title="표 삭제"
          >
            <Trash2 className="w-4 h-4 text-[#ff8080]" />
          </ToolbarButton>
        )}
      </div>

      {/* Contextual Image Size & Display Controls when an image is selected */}
      {editor.isActive("image") && (
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 bg-[#242d3c] text-[#f0f8ff] text-xs">
          <span className="font-bold text-[#ff8080] mr-1">이미지 크기:</span>
          {[
            { label: "25%", width: "25%" },
            { label: "50%", width: "50%" },
            { label: "75%", width: "75%" },
            { label: "100%", width: "100%" },
            { label: "원본", width: null },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .updateAttributes("image", {
                    width: preset.width,
                    height: null,
                  })
                  .run()
              }
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-[#ff8080] hover:text-[#242d3c] font-bold transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
          <span className="h-3.5 w-px bg-white/25 mx-1" />
          <span className="font-bold text-[#ff8080] mr-1">배치:</span>
          {[
            { label: "인라인", display: null },
            { label: "독립 블록", display: "block" },
            { label: "왼쪽 띄우기", display: "left" },
            { label: "오른쪽 띄우기", display: "right" },
          ].map((mode) => (
            <button
              key={mode.label}
              type="button"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .updateAttributes("image", {
                    "data-display": mode.display,
                  })
                  .run()
              }
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-[#ff8080] hover:text-[#242d3c] font-bold transition-colors cursor-pointer"
            >
              {mode.label}
            </button>
          ))}
        </div>
      )}
        </div>
      </div>

      {/* Editable Content Area */}
      <div className="p-4 sm:p-5 min-h-[380px] editorial-prose">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active = false,
  disabled = false,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={cn(
        "p-1.5 rounded-[7px] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
        active
          ? "bg-[#242d3c] text-[#f0f8ff]"
          : "text-[#242d3c] hover:bg-white"
      )}
    >
      {children}
    </button>
  );
}
