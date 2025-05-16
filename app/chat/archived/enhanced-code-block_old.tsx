'use client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import React, { useEffect, useState, useCallback } from 'react';
import { ClipboardIcon, CheckIcon } from 'lucide-react';
// Commenting out execution-related imports
// import { PlayIcon, SquareIcon, Loader2Icon, DownloadIcon } from 'lucide-react';
// import { useCodeRuntimes, ExecutionResult } from '../../lib/useCodeRuntimes';

type CodeProps = {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

// Commenting out CodeOutput component
/*
interface CodeOutputProps {
  result: ExecutionResult | null;
}

const CodeOutput: React.FC<CodeOutputProps> = ({ result }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  console.log('[CodeOutput Render] Rendering. Received plotData:', result?.plotData);

  useEffect(() => {
    console.log('[CodeOutput Effect] Running. Has plotData?:', !!result?.plotData, 'Has canvasRef?:', !!canvasRef.current);
    if (result?.plotData && canvasRef.current) {
      console.log('[CodeOutput Effect] PlotData and canvas ref found.', result.plotData);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      console.log('[CodeOutput Effect] Canvas context:', ctx);
      if (ctx) {
        try {
          console.log(`[CodeOutput Effect] Setting canvas dimensions: w=${result.plotData.width}, h=${result.plotData.height}`);
          canvas.width = result.plotData.width;
          canvas.height = result.plotData.height;
          console.log('[CodeOutput Effect] Attempting drawImage...');
          ctx.drawImage(result.plotData, 0, 0);
          console.log('[CodeOutput Effect] drawImage completed.');
        } catch (drawError: any) {
          console.error('[CodeOutput Effect] Error during canvas draw:', drawError);
        }
      } else {
          console.error('[CodeOutput Effect] Failed to get 2D context from canvas.');
      }
    } else if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            console.log('[CodeOutput Effect] Cleared canvas.');
        } else {
             console.error('[CodeOutput Effect] Could not get context to clear canvas.');
        }
    }
  }, [result?.plotData]);

  if (!result) return null;

  const hasOutput = result.stdout || result.stderr || result.error || result.returnValue !== undefined || result.plotData;
  if (!hasOutput) return null;

  return (
    <div className="mt-2 text-xs border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-zinc-800/50 overflow-hidden">
      {result.stdout && (
        <div className="p-2 border-b  border-gray-200 dark:border-gray-700">
          <strong className="font-medium text-gray-600 dark:text-gray-400">Output (stdout):</strong>
          <pre className="mt-1 max-h-80 overflow-y-auto whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200">{result.stdout}</pre>
        </div>
      )}
      {result.stderr && (
        <div className="p-2 border-b   border-gray-200 dark:border-gray-700 bg-red-50/30 dark:bg-red-900/10">
          <strong className="font-medium text-red-600 dark:text-red-400">Messages / Logs (stderr):</strong>
          <pre className="mt-1 max-h-80 overflow-y-auto whitespace-pre-wrap break-words text-red-700 dark:text-red-300">{result.stderr}</pre>
        </div>
      )}
      {result.error && (
        <div className="p-2 border-b   border-gray-200 dark:border-gray-700 bg-red-50/50 dark:bg-red-900/20">
          <strong className="font-medium text-red-700 dark:text-red-500">Execution Error:</strong>
          <pre className="mt-1 max-h-80 overflow-y-auto whitespace-pre-wrap break-words text-red-800 dark:text-red-400">{result.error}</pre>
        </div>
      )}
      {result.returnValue !== undefined && result.returnValue !== null && (
         <div className="p-2">
           <strong className="font-medium text-gray-600 dark:text-gray-400">Return Value:</strong>
           <pre className="mt-1 max-h-80 overflow-y-auto  whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200">
             {typeof result.returnValue === 'object' ? JSON.stringify(result.returnValue, null, 2) : String(result.returnValue)}
           </pre>
         </div>
      )}
      {result.plotData && (
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <strong className="font-medium text-gray-600 dark:text-gray-400">Plot Output:</strong>
              <div className="mt-1 flex justify-center items-center bg-white dark:bg-gray-900 p-1 rounded shadow-inner">
                  <canvas 
                      ref={canvasRef} 
                      className="max-w-full h-auto"
                  ></canvas>
              </div>
          </div>
      )}
    </div>
  );
};
*/

export function EnhancedCodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeProps) {
  const [content, setContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  // Commenting out all execution-related states
  /*
  const [blockStatus, setBlockStatus] = useState<'idle' | 'loading-runtime' | 'pending-execution' | 'executing' | 'error'>('idle');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExecutionPending, setIsExecutionPending] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  console.log('[EnhancedCodeBlock Render] Rendering. executionResult state:', executionResult);
  */

  const match = /language-(\w+)/.exec(className || '');
  let language = match ? match[1].toLowerCase() : '';
  if (language === 'js') language = 'javascript';
  if (language === 'py') language = 'python';

  // Commenting out execution-related variables
  // const isExecutable = ['python', 'javascript', 'r'].includes(language);
  // const { python, r, loadRuntime, executeCode, readFileFromVFS } = useCodeRuntimes();

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

  // Commenting out runtime status monitoring
  /*
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Runtime Status - Python: ${python.status}, R: ${r.status}`);
    }
  }, [python.status, r.status]);
  */

  const handleCopy = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [content]);

  // Commenting out execution-related functions
  /*
  const handleExecute = useCallback(async () => {
    if (!language || !isExecutable) return;
    
    setExecutionResult(null);
    setErrorMessage(null);
    setBlockStatus('idle');
    setIsExecutionPending(false);

    const targetRuntime = language === 'python' ? python : r;
    const langKey = language as 'python' | 'r';

    try {
      if (language === 'javascript') {
        console.log(`Proceeding to execute ${language} code directly...`);
        setBlockStatus('executing');
        const result = await executeCode('javascript', content);
        setExecutionResult(result);
        setBlockStatus('idle');
        return;
      }

      if (targetRuntime.status === 'ready') {
        console.log(`Runtime ${language} ready, executing directly...`);
        setBlockStatus('executing');
        const result = await executeCode(langKey, content);
        setExecutionResult(result);
        setBlockStatus('idle');
      } else if (targetRuntime.status === 'loading' || targetRuntime.status === 'initializing') {
        console.log(`Runtime for ${language} is already loading/initializing. Setting pending.`);
        setBlockStatus('loading-runtime');
        setIsExecutionPending(true);
        return; 
      } else if (targetRuntime.status === 'error') {
        console.error(`${language} runtime is in an error state.`);
        setErrorMessage(`Cannot execute: ${language} runtime failed to load previously.`);
        setBlockStatus('error');
        return;
      } else {
        setBlockStatus('loading-runtime');
        console.log(`Calling loadRuntime for ${language}...`);
        setIsExecutionPending(true);
        loadRuntime(langKey).catch(loadError => {
          console.error(`Error directly from loadRuntime call for ${language}:`, loadError);
          setErrorMessage(loadError.message || `Failed to initiate ${language} runtime loading.`);
          setBlockStatus('error');
          setIsExecutionPending(false);
        });
        console.log(`loadRuntime for ${language} initiated. Waiting for ready status...`);
      }
    } catch (error: any) {
      console.error(`Error during direct execution for ${language}:`, error);
      const message = error.message || 'An unexpected error occurred';
      setErrorMessage(message);
      setExecutionResult({ stdout: '', stderr: (error.stack || ''), error: message });
      setBlockStatus('error');
      setIsExecutionPending(false);
    }
  }, [language, isExecutable, content, python, r, loadRuntime, executeCode]);

  useEffect(() => {
    if (!isExecutionPending || !language || language === 'javascript') return;

    const targetRuntime = language === 'python' ? python : r;
    const langKey = language as 'python' | 'r';

    if (targetRuntime.status === 'ready') {
      console.log(`useEffect detected ${language} is ready and pending execution.`);
      setBlockStatus('executing');
      setIsExecutionPending(false);

      executeCode(langKey, content)
        .then(result => {
          console.log('[EnhancedCodeBlock Effect] executeCode successful. Setting result state:', result);
          setExecutionResult(result);
          setBlockStatus('idle');
        })
        .catch(execError => {
          console.error(`Error during execution triggered by useEffect for ${language}:`, execError);
          console.log('[EnhancedCodeBlock Effect] Setting error state after executeCode failure.');
          const message = execError.message || 'An unexpected error occurred during execution.';
          setErrorMessage(message);
          setExecutionResult({ stdout: '', stderr: (execError.stack || ''), error: message, plotData: null, generatedFilename: null });
          setBlockStatus('error');
        });
    } else if (targetRuntime.status === 'error') {
      console.error(`useEffect detected ${language} runtime entered error state while pending.`);
      setErrorMessage(targetRuntime.error?.message || `Runtime for ${language} failed to load.`);
      setBlockStatus('error');
      setIsExecutionPending(false);
    }
  }, [language, python, r, isExecutionPending, content, executeCode]);

  const handleDownload = useCallback(async (filename: string | null | undefined) => {
    if (!filename) return;
    if (isDownloading) return;

    setIsDownloading(true);
    setErrorMessage(null);

    try {
      const fileData = await readFileFromVFS(filename);
      if (!fileData) {
        throw new Error(`File "${filename}" not found or could not be read from VFS.`);
      }

      let mimeType = 'application/octet-stream';
      const extension = filename.split('.').pop()?.toLowerCase();
      if (extension === 'pdf') mimeType = 'application/pdf';
      else if (extension === 'csv') mimeType = 'text/csv';
      else if (extension === 'png') mimeType = 'image/png';
      else if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
      else if (extension === 'txt') mimeType = 'text/plain';

      const blob = new Blob([fileData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`Download initiated for ${filename}`);

    } catch (error: any) {
      console.error('Download failed:', error);
      setErrorMessage(error.message || 'Failed to download file.');
    } finally {
      setIsDownloading(false);
    }
  }, [readFileFromVFS, isDownloading]);
  */

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
  
  if (language || content.includes('\n')) {
    // Commenting out execution-related variables
    /*
    const isLoadingRuntime = blockStatus === 'loading-runtime' || (language !== 'javascript' && (language === 'python' ? python.status : r.status) === 'loading') || (language !== 'javascript' && (language === 'python' ? python.status : r.status) === 'initializing');
    const isExecutingCode = blockStatus === 'executing';
    const showRunButton = isExecutable && blockStatus !== 'loading-runtime' && blockStatus !== 'executing';
    const showStopButton = isExecutable && blockStatus === 'executing';
    const showLoadingIcon = isExecutable && (blockStatus === 'loading-runtime' || blockStatus === 'pending-execution');

    const canDownload = executionResult?.generatedFilename && !isDownloading;
    const downloadFilename = executionResult?.generatedFilename;
    */

    return (
      <div className="my-4 not-prose flex flex-col group relative">
        <div className="flex justify-between items-center text-xs text-gray-500 border-t border-l border-r border-gray-200 dark:border-gray-700 px-3 py-1 rounded-t-md bg-gray-50 dark:bg-zinc-800">
          <div>{language || 'text'}</div>
          <div className="flex gap-2 items-center">
            <button 
              onClick={handleCopy}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Copy code"
              title="Copy code"
            >
              {copied ? <CheckIcon size={14} className="text-green-500" /> : <ClipboardIcon size={14} />}
            </button>
            
            {/* Commenting out execution buttons
            <div className="relative w-5 h-5 flex items-center justify-center">
              {showLoadingIcon && <Loader2Icon size={14} className="animate-spin" />}
              {showRunButton && (
                <button 
                  onClick={handleExecute}
                  className={'p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors'}
                  aria-label={`Execute ${language} code`}
                  title={`Execute ${language} code`}
                  disabled={isLoadingRuntime || isExecutingCode}
                >
                  <PlayIcon size={14} />
                </button>
              )}
              {showStopButton && (
                <button 
                  className={'p-1 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors'}
                  aria-label={`Stop execution`}
                  title={`Stop execution`}
                  disabled={!isExecutingCode}
                >
                  <SquareIcon size={14} />
                </button>
              )}
            </div>
            */}
          </div>
        </div>
        
        <SyntaxHighlighter
          style={oneDark}
          language={language || 'text'}
          PreTag="div" 
          className="text-sm w-full overflow-x-auto !my-0"
          wrapLines={true}
          showLineNumbers={content.split('\n').length > 5}
          customStyle={{
            margin: 0,
            borderRadius: '0 0 0.5rem 0.5rem',
          }}
        >
          {content}
        </SyntaxHighlighter>
        
        {/* Commenting out status messages and execution results
        {(blockStatus === 'loading-runtime' || blockStatus === 'executing' || blockStatus === 'error' || blockStatus === 'pending-execution' || isDownloading || errorMessage) && (
           <div className="mt-2 p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-zinc-800 text-xs text-gray-600 dark:text-gray-400">
              {blockStatus === 'loading-runtime' && <span className="flex items-center gap-1"><Loader2Icon size={12} className="animate-spin"/>Loading {language} runtime...</span>}
              {blockStatus === 'pending-execution' && <span className="flex items-center gap-1"><Loader2Icon size={12} className="animate-spin"/>Waiting for {language} runtime...</span>}
              {blockStatus === 'executing' && <span className="flex items-center gap-1"><Loader2Icon size={12} className="animate-spin"/>Executing...</span>}
              {blockStatus === 'error' && <span className="text-red-600 dark:text-red-400">Error: {errorMessage || 'Failed to execute.'}</span>}
              {isDownloading && <span className="flex items-center gap-1"><Loader2Icon size={12} className="animate-spin"/>Downloading file...</span>}
              {errorMessage && blockStatus !== 'error' && <span className="text-red-600 dark:text-red-400">Error: {errorMessage}</span>}
           </div>
        )}
        
        <CodeOutput result={executionResult} />

        {downloadFilename && (
          <div className="mt-2 p-2 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-md bg-gray-50/50 dark:bg-zinc-800/50 flex items-center justify-start">
            <button 
              onClick={() => handleDownload(downloadFilename)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${canDownload ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900' : 'bg-gray-100 text-gray-500 opacity-70 cursor-not-allowed dark:bg-zinc-700 dark:text-zinc-400'}`}
              aria-label={`Download ${downloadFilename}`}
              title={`Download ${downloadFilename}`}
              disabled={!canDownload}
            >
              {isDownloading ? 
                <Loader2Icon size={14} className="animate-spin" /> :
                <DownloadIcon size={14} />
              }
              Download {downloadFilename}
            </button>
          </div>
        )}
        */}
      </div>
    );
  }
  
  return (
    <code
      className="text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md"
      {...props}
    >
      {content}
    </code>
  );
} 