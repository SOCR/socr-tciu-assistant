'use client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import React, { useEffect, useState } from 'react';

type CodeProps = {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeProps) {
  const [content, setContent] = useState<string>('');
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  
  // Extract the content from children safely
  useEffect(() => {
    if (children) {
      let childContent = '';
      if (typeof children === 'string') {
        childContent = children;
      } else if (Array.isArray(children)) {
        childContent = children.join('');
      } else {
        try {
          childContent = String(children);
        } catch (e) {
          console.error('Failed to stringify code content', e);
          childContent = '';
        }
      }
      
      setContent(childContent.replace(/\n$/, ''));
    }
  }, [children]);

  // Logger for debugging code component props
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Code Block Props:', { 
        inline, 
        className, 
        language, 
        contentLength: content.length,
        firstLines: content.split('\n').slice(0, 2).join('\n')
      });
    }
  }, [inline, className, language, content]);

  // Explicitly handle inline code (single backticks)
  if (inline === true) {
    return (
      <code
        className="text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md"
        {...props}
      >
        {content}
      </code>
    );
  }
  
  // Handle code blocks (triple backticks)
  // Use the SyntaxHighlighter for code blocks or if language is specified
  if (language || content.includes('\n')) {
    return (
      <div className="my-4 not-prose flex flex-col">
        {language && (
          <div className="text-xs text-gray-500 border-t border-l border-r border-gray-200 dark:border-gray-700 px-2 py-1 rounded-t-md bg-gray-50 dark:bg-zinc-800">
            {language}
          </div>
        )}
        <SyntaxHighlighter
          // @ts-ignore - Type issues with style property
          style={oneDark}
          language={language || 'text'}
          PreTag="div" 
          className="text-sm w-full overflow-x-auto !my-0"
          wrapLines={true}
          showLineNumbers={content.split('\n').length > 5}
          customStyle={{
            margin: 0,
            borderRadius: language ? '0 0 0.5rem 0.5rem' : '0.5rem',
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    );
  }
  
  // Fallback case - just render as inline code even if not marked as inline
  return (
    <code
      className="text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md"
      {...props}
    >
      {content}
    </code>
  );
}
