"use client";

import { useEffect, useRef, useState } from "react";
import { Node, mergeAttributes } from "@tiptap/core";
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
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
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
 * Custom Image extension that preserves width, height, style, and data-display
 * attributes from legacy element-tiptap HTML content.
 */
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) =>
          attributes.width ? { width: attributes.width } : {},
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute("height"),
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
    if (
      u.hostname.includes("youtube.com") &&
      u.searchParams.has("v")
    ) {
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

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: {
          openOnClick: !editable,
          autolink: true,
        },
      }),
      TextStyleKit,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TableKit.configure({
        table: { resizable: true },
      }),
      CustomImage.configure({
        inline: false,
        allowBase64: true,
      }),
      CustomIframe,
    ],
    content,
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
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const publicUrl = await uploadImageToStorage(file);
      editor.chain().focus().setImage({ src: publicUrl }).run();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "이미지 업로드 중 오류가 발생했습니다."
      );
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
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
    <div className="rounded-[7px] border border-[#bdc0c4] bg-white overflow-hidden focus-within:border-[#242d3c]">
      {/* Hidden Image Upload Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileSelect}
        className="hidden"
      />

      {/* Rich Text Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#f3f3f3] border-b border-[#bdc0c4]/70 text-[#242d3c]">
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
          title="제목 1 (H1)"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="제목 2 (H2)"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="제목 3 (H3)"
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
          title="굵게 (Bold)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="기울임 (Italic)"
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
          title="취소선 (Strike)"
        >
          <Strikethrough className="w-4 h-4" />
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

        {/* Alignment */}
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

        <span className="h-4 w-px bg-[#bdc0c4] mx-0.5" />

        {/* Lists, Blockquote, HR */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="글머리 기호 목록"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="번호 매기기 목록"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="인용구 (Blockquote)"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="구분선 삽입"
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

        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          title="본문 이미지 업로드"
        >
          {uploadingImage ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#ff8080]" />
          ) : (
            <ImagePlus className="w-4 h-4" />
          )}
        </ToolbarButton>

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
