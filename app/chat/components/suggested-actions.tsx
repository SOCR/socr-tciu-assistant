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
      title: '🕰️ Explain the concept of',
      label: 'Kime in Spacekime Analytics',
      action: 'Explain the fundamental concept of Kime in Spacekime Analytics and how it differs from traditional time series analysis.',
    },
    {
      title: '📊 Show me examples of',
      label: 'Complex-time transforms',
      action: 'Show examples of how complex-time transforms can be applied to longitudinal data analysis with explanations of the mathematical foundations.',
    },
    {
      title: '🧠 How does Spacekime reduce',
      label: 'inferential uncertainty?',
      action: 'How does the Spacekime framework help reduce inferential uncertainty in predictive analytics compared to traditional approaches?',
    },
    {
      title: '🌊 Applications of Spacekime in',
      label: 'economic forecasting',
      action: 'What are the practical applications of Spacekime Analytics in economic forecasting and time series prediction?',
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
