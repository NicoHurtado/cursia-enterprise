"use client";

import React, { useMemo } from "react";
import { convertToMarkdown } from "@/lib/content-parser";
import { cn } from "@/lib/utils";

interface LessonImage {
  url: string;
  title: string;
  description: string;
}

interface StructuredContentRendererProps {
  content: string;
  className?: string;
  images?: LessonImage[] | any;
}

export function StructuredContentRenderer({
  content,
  className,
  images,
}: StructuredContentRendererProps) {
  const renderedContent = useMemo(() => {
    const markdown = convertToMarkdown(content);
    return parseAndRender(markdown, images);
  }, [content, images]);

  return <div className={cn("space-y-4", className)}>{renderedContent}</div>;
}

function parseAndRender(markdown: string, images?: LessonImage[] | any) {
  const lines = markdown.split("\n");
  const elements: React.ReactNode[] = [];
  let currentKey = 0;

  // Normalize images
  const normalizedImages: LessonImage[] = images && Array.isArray(images)
    ? images.map((img: any) =>
      typeof img === 'string' ? { url: img, title: '', description: '' } : img
    )
    : [];

  let inCodeBlock = false;
  let codeBlockLanguage = "";
  let codeBlockContent: string[] = [];

  let inTable = false;
  let tableRows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle Image References [IMAGE:0], [IMAGE:1], etc.
    const imageMatch = line.match(/^\[IMAGE:(\d+)\]$/);
    if (imageMatch) {
      const imageIndex = parseInt(imageMatch[1]);
      if (normalizedImages[imageIndex]) {
        elements.push(
          <ImageDisplay
            key={currentKey++}
            image={normalizedImages[imageIndex]}
          />
        );
      }
      continue;
    }

    // Handle Code Blocks
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <CodeBlock
            key={currentKey++}
            language={codeBlockLanguage}
            code={codeBlockContent.join("\n")}
          />
        );
        inCodeBlock = false;
        codeBlockContent = [];
        codeBlockLanguage = "";
      } else {
        // Start of code block
        inCodeBlock = true;
        codeBlockLanguage = line.trim().replace("```", "");
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Handle Tables
    if (line.trim().startsWith("|")) {
      if (!inTable) {
        inTable = true;
      }
      // Parse row
      const row = line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());
      tableRows.push(row);
      continue;
    } else if (inTable) {
      // End of table (empty line or non-table line)
      elements.push(<Table key={currentKey++} rows={tableRows} />);
      inTable = false;
      tableRows = [];
      // Don't continue, process this line as normal text
    }

    // Handle Headers
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={currentKey++} className="text-3xl font-bold mt-6 mb-4">
          {parseInline(line.substring(2))}
        </h1>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={currentKey++} className="text-2xl font-bold mt-5 mb-3">
          {parseInline(line.substring(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={currentKey++} className="text-xl font-bold mt-4 mb-2">
          {parseInline(line.substring(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith("#### ")) {
      elements.push(
        <h4 key={currentKey++} className="text-lg font-bold mt-3 mb-2 text-slate-800 dark:text-slate-200">
          {parseInline(line.substring(5))}
        </h4>
      );
      continue;
    }

    // Handle Blockquotes
    if (line.trim().startsWith("> ")) {
      elements.push(
        <blockquote key={currentKey++} className="border-l-4 border-yellow-500 pl-4 py-2 my-4 italic bg-yellow-50 dark:bg-yellow-900/20 text-slate-700 dark:text-slate-300 rounded-r">
          {parseInline(line.trim().substring(2))}
        </blockquote>
      );
      continue;
    }

    // Handle Lists
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      elements.push(
        <ul key={currentKey++} className="list-disc list-inside ml-4">
          <li>{parseInline(line.trim().substring(2))}</li>
        </ul>
      );
      continue;
    }

    // Handle Paragraphs (skip empty lines)
    if (line.trim()) {
      elements.push(
        <p key={currentKey++} className="leading-relaxed text-gray-700 dark:text-gray-300">
          {parseInline(line)}
        </p>
      );
    }
  }

  // Flush remaining blocks
  if (inCodeBlock) {
    elements.push(
      <CodeBlock
        key={currentKey++}
        language={codeBlockLanguage}
        code={codeBlockContent.join("\n")}
      />
    );
  }
  if (inTable) {
    elements.push(<Table key={currentKey++} rows={tableRows} />);
  }

  return elements;
}

function parseInline(text: string): React.ReactNode[] {
  // Simple parser for **bold**, *italic*, `code`
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span
          key={index}
          className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded font-semibold text-black dark:text-white"
        >
          {part.slice(2, -2)}
        </span>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic text-gray-600 dark:text-gray-400">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono text-sm text-red-500"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden my-4">
      {language && (
        <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 uppercase font-mono border-b border-slate-700">
          {language}
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-slate-100">{code}</code>
      </pre>
    </div>
  );
}

function Table({ rows }: { rows: string[][] }) {
  if (rows.length === 0) return null;
  const header = rows[0];
  const body = rows.slice(2); // Skip header and separator line (---)

  return (
    <div className="overflow-x-auto my-4 border rounded-lg">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
          <tr>
            {header.map((cell, i) => (
              <th key={i} className="px-6 py-3 font-medium">
                {parseInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {body.map((row, i) => (
            <tr key={i} className="bg-white dark:bg-slate-900">
              {row.map((cell, j) => (
                <td key={j} className="px-6 py-4 whitespace-nowrap">
                  {parseInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface LessonImage {
  url: string;
  title: string;
  description: string;
}

function ImageDisplay({ image }: { image: LessonImage }) {
  return (
    <div className="my-6">
      <div className="border-none shadow-lg rounded-2xl bg-gradient-to-br from-white to-slate-50 overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
          <img
            src={image.url}
            alt={image.title || 'Imagen de la lección'}
            className="w-full h-full object-contain"
          />
        </div>
        {(image.title || image.description) && (
          <div className="p-6 bg-white">
            {image.title && (
              <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                {image.title}
              </h3>
            )}
            {image.description && (
              <p className="text-slate-600 leading-relaxed pl-3">
                {image.description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
