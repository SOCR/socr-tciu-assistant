'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { memo } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import { useEbookContext } from '@/app/chat/lib/context/ebook-context';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const { isEbookPanelOpen } = useEbookContext();

  const suggestedActions = [
    {
      title: '🕰️ Explain',
      label: 'Kime in Spacekime Analytics',
      action: 'Explain the fundamental concept of Kime in Spacekime Analytics and how it differs from traditional time series analysis.',
    },
    {
      title: '📉 Illustrate TCIU reduction with',
      label: 'a Python example',
      action: 'Provide a Python code example demonstrating how Spacekime analytics can reduce Time Complexity and Inferential Uncertainty (TCIU) in a sample dataset. Explain the results.',
    },
    {
      title: '⚙️ Generate R code for',
      label: 'Spacekime transformation',
      action: 'Generate an R code snippet that performs a basic Spacekime transformation on a sample time series. Include comments to explain each step.',
    },
    {
      title: '🔎 Compare Spacekime with',
      label: 'traditional methods for TCIU',
      action: 'Compare and contrast Spacekime Analytics with traditional statistical methods in terms of addressing Time Complexity and Inferential Uncertainty (TCIU).',
    },
    {
      title: '🌊 Visualize',
      label: 'Spacekime analytics workflow',
      action: 'Illustrate the typical workflow of a Spacekime analytics project using a Mermaid diagram. Explain each stage.',
    },
    {
      title: '🧩 Diagram',
      label: 'components of TCIU',
      action: 'Create a Mermaid diagram to visualize the main components contributing to Time Complexity and Inferential Uncertainty (TCIU) in data analysis.',
    },
  ];

  // Determine grid and item visibility based on panel state
  let gridLayoutClasses = "grid sm:grid-cols-2 gap-2 w-full"; // Default when panel is closed
  let shouldShowMoreItems: (index: number) => 'block' | 'hidden sm:block' | 'hidden xl:block' | 'hidden' = 
    (index: number) => index > 1 ? 'hidden sm:block' : 'block'; // Default for panel closed

  if (isEbookPanelOpen) {
    // Panel is open: More restrictive layout - always single column, only two items
    gridLayoutClasses = "grid grid-cols-1 gap-2 w-full"; 
    shouldShowMoreItems = (index: number) => index > 1 ? 'hidden' : 'block'; 
  }

  return (
    <div
      data-testid="suggested-actions"
      className={gridLayoutClasses}
    >
      {suggestedActions.map((suggestedAction, index) => {
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 * index }}
            key={`suggested-action-${suggestedAction.title}-${index}`}
            className={shouldShowMoreItems(index)}
          >
            <Button
              variant="ghost"
              onClick={async () => {
                window.history.replaceState({}, '', `/chat/${chatId}`);

                append({
                  role: 'user',
                  content: suggestedAction.action,
                });
              }}
              className="text-left items-center border bg-secondary hover:bg-secondary/50 rounded-xl px-4 py-3.5 text-md flex-1 gap-1 sm:flex-col w-full h-auto justify-start"
            >
              <span className="font-light text-center">{suggestedAction.title}  {suggestedAction.label}</span>
              {/* <span className="text-muted-foreground text-center">
                {suggestedAction.label}
              </span> */}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
