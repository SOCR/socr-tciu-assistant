import Link from 'next/link';
import React, { memo, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';
import { DebugMarkdown } from '../debug-markdown';

// Special rehype plugin to better handle code blocks
import rehypeRaw from 'rehype-raw';

// Define the components for ReactMarkdown
const components: Partial<Components> = {
  // @ts-ignore - The type definition doesn't include the inline property but it's actually passed
  code: CodeBlock,
  
  // Keep all other component renderers the same
  ol: ({ node, children, ...props }) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }) => {
    return (
      // @ts-ignore - Link props are incompatible with the expected type
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },
};

// Configure the plugins for markdown processing
const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeRaw];

// Enable debug mode in development with query param ?debug=true
const isDebugMode = typeof window !== 'undefined' && 
  window.location.search.includes('debug=true');

// Fix broken inline code: turns ```python to proper format
const preprocessMarkdown = (markdown: string): string => {
  // Fix triple backtick content that's incorrectly formatted with no newlines
  // Make sure we capture the ENTIRE language tag without breaking it
  return markdown.replace(/```([\w-]+)(?!\n)/g, '```$1\n');
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const [showDebug, setShowDebug] = useState(isDebugMode);
  const processedMarkdown = preprocessMarkdown(children);

  // Add a dev-only button to toggle debug view
  const toggleButton = process.env.NODE_ENV === 'development' ? (
    <button 
      onClick={() => setShowDebug(!showDebug)} 
      className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2 py-1 rounded absolute top-0 right-0 opacity-50 hover:opacity-100"
    >
      {showDebug ? 'Hide Debug' : 'Debug'}
    </button>
  ) : null;

  return (
    <div className="relative">
      {toggleButton}
      
      <ReactMarkdown 
        remarkPlugins={remarkPlugins} 
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {processedMarkdown}
      </ReactMarkdown>

      {showDebug && (
        <>
          <DebugMarkdown markdown={children} />
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
            <h4 className="text-sm font-semibold mb-2">Preprocessed Markdown</h4>
            <pre className="text-xs overflow-auto whitespace-pre-wrap break-all bg-white p-2 rounded">{processedMarkdown}</pre>
          </div>
        </>
      )}
    </div>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
