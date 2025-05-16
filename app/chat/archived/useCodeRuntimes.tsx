/** @jsxImportSource react */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { loadPyodide, PyodideInterface } from 'pyodide';
// Restore the direct import of WebR, remove Shelter import
import { WebR, WebROptions, WebRError } from 'webr'; 

// Define Shelter type inline for clarity, as it's accessed via instance
type Shelter = any; // Use 'any' for now, or define a minimal interface if needed

type RuntimeStatus = 'uninitialized' | 'loading' | 'initializing' | 'ready' | 'error' | 'executing';

// Define a standard result object
export interface ExecutionResult {
  stdout: string;
  stderr: string;
  returnValue?: any; // Optional return value from the execution
  error?: string | null; // Error message if execution failed
  // Use a type compatible with drawImage, like ImageBitmap
  plotData?: ImageBitmap | null; // Add field for captured plot image data
  generatedFilename?: string | null; // Add filename for potential download
}

interface RuntimeState {
  instance: PyodideInterface | WebR | null;
  status: RuntimeStatus;
  error: Error | null;
}

interface CodeRuntimesContextType {
  python: RuntimeState;
  r: RuntimeState;
  loadRuntime: (language: 'python' | 'r') => Promise<void>;
  executeCode: (language: 'python' | 'r' | 'javascript', code: string) => Promise<ExecutionResult>;
  readFileFromVFS: (filename: string) => Promise<Uint8Array | null>; // Add file reading function type
}

const defaultState: RuntimeState = { instance: null, status: 'uninitialized', error: null };

const CodeRuntimesContext = createContext<CodeRuntimesContextType | undefined>(undefined);

interface CodeRuntimesProviderProps {
  children: ReactNode;
  // Optional: Configuration for runtimes if needed later
  pyodideConfig?: any; // e.g., { indexURL: "/pyodide/" }
  // webROptions?: WebROptions;
}

export const CodeRuntimesProvider = ({
  children,
  pyodideConfig = { indexURL: "/pyodide/" }, 
}: CodeRuntimesProviderProps) => {
  const [pythonState, setPythonState] = useState<RuntimeState>(defaultState);
  const [rState, setRState] = useState<RuntimeState>(defaultState);

  const loadPython = useCallback(async () => {
    if (pythonState.status !== 'uninitialized' && pythonState.status !== 'error') return;

    setPythonState({ instance: null, status: 'loading', error: null });
    try {
      const pyodideInstance = await (window as any).loadPyodide(pyodideConfig);
      setPythonState({ instance: pyodideInstance, status: 'ready', error: null });
    } catch (error) {
      setPythonState({ instance: null, status: 'error', error: error as Error });
    }
  }, [pythonState.status, pyodideConfig]);

  // --- Restore original loadR function ---
  const loadR = useCallback(async () => {
    if (rState.status !== 'uninitialized' && rState.status !== 'error') return;

    setRState({ instance: null, status: 'loading', error: null });
    try {
      // Instantiate WebR using the imported class, setting baseUrl to local path
      const webRInstance = new WebR({
        baseUrl: '/webr/' // Point to local public path (ensure v0.4.2 assets are here)
      }); 
      setRState(prev => ({ ...prev, status: 'initializing' })); 
      await webRInstance.init();
      setRState({ instance: webRInstance, status: 'ready', error: null });
    } catch (error) {
      setRState({ instance: null, status: 'error', error: error as Error });
    }
  }, [rState.status]);
  // --- End of restored loadR function ---

  const loadRuntime = useCallback(async (language: 'python' | 'r') => {
    if (language === 'python') {
      await loadPython();
    } else if (language === 'r') {
      await loadR();
    }
  }, [loadPython, loadR]);

  // --- executeCode function ---
  const executeCode = useCallback(async (
    language: 'python' | 'r' | 'javascript',
    code: string
  ): Promise<ExecutionResult> => {
    
    const startTime = performance.now();
    let baseResult: Omit<ExecutionResult, 'stdout' | 'stderr'> = { error: null, plotData: null, generatedFilename: null };
    let stdout = '';
    let stderr = '';

    try {
      if (language === 'python') {
        if (pythonState.status !== 'ready') {
          throw new Error('Python runtime not ready.');
        }
        if (!pythonState.instance) {
            throw new Error('Python instance is null.');
        }
        setPythonState(prev => ({ ...prev, status: 'executing' }));
        const pyodide = pythonState.instance as PyodideInterface;
        pyodide.setStdout({ batched: (msg) => stdout += msg + '\n' });
        pyodide.setStderr({ batched: (msg) => stderr += msg + '\n' });
        const result = await pyodide.runPythonAsync(code);
        baseResult.returnValue = result;
        
      } else if (language === 'r') {
        if (rState.status !== 'ready') {
          throw new Error('R runtime not ready.');
        }
        if (!rState.instance) {
            throw new Error('R instance is null.');
        }
        setRState(prev => ({ ...prev, status: 'executing' }));

        const webR = rState.instance as WebR;
        let shelter: Shelter | null = null; 
        let resultRObject: any = null; // Declare RObject variable outside try
        try {
          if (!(webR as any).Shelter) {
            throw new Error('webR instance does not have a Shelter constructor.');
          }
          shelter = await new (webR as any).Shelter(); 
          
          const result = await shelter.captureR(code, {
              captureStreams: true,
              captureConditions: false, 
          });
          
          // Assign result.result to the outer variable
          resultRObject = result.result;

          // Process output streams
          stdout = result.output.filter((o: { type: string; data: string }) => o.type === 'stdout').map((o: { data: string }) => o.data).join('\n');
          stderr = result.output.filter((o: { type: string; data: string }) => o.type === 'stderr').map((o: { data: string }) => o.data).join('\n');
          
          // --- Simplified returnValue & filename Handling --- 
          baseResult.returnValue = null; // Default: Don't display complex R return objects
          baseResult.generatedFilename = null; 

          // Only attempt filename detection if RObject exists and has toArray
          if (resultRObject && typeof resultRObject.toArray === 'function') {
            try {
                const arr = await resultRObject.toArray();
                // Check if it specifically returned a single string filename
                if (arr && arr.length === 1 && typeof arr[0] === 'string' && arr[0].match(/\.(csv|pdf|png|jpe?g|txt)$/i)) {
                    baseResult.generatedFilename = arr[0];
                    // Optionally set returnValue to the filename string as well?
                    // baseResult.returnValue = arr[0]; 
                } else {
                    // If not a filename, maybe store first few elements for display? Or keep null.
                    // baseResult.returnValue = arr.slice(0, 5); // Example: show first 5 elements
                     baseResult.returnValue = '[RObject]'; // Or just indicate an object was returned
                }
            } catch (conversionError: any) {
                 stderr += `Conversion Error: ${conversionError.message}\n`;
                 baseResult.returnValue = '[RObject Conversion Error]';
            }
          } else if (resultRObject) {
              // Handle non-array convertible RObjects if necessary, or just indicate presence
              baseResult.returnValue = '[RObject]'; 
          }
          // --- End Simplified Handling ---
          
          // Process captured images 
          if (result.images && result.images.length > 0) {
            baseResult.plotData = result.images[0] as ImageBitmap; 
          } else {
             // Ensure plotData is null if no images captured
             baseResult.plotData = null;
          }

        } catch (executionError: any) { 
            baseResult.error = executionError.message || String(executionError);
            stderr += `Execution Error: ${executionError.message || String(executionError)}`;
        } finally {
           if (shelter) { 
             try {
               await shelter.purge(); 
             } catch (purgeError: any) {
                stderr += `Purge Error: ${purgeError.message || String(purgeError)}`;
             }
           }
        }

      } else if (language === 'javascript') {
        // Basic JS execution (not sandboxed! Use with caution)
        try {
          // Note: This uses eval, which has security implications.
          // A safer approach involves using Web Workers or a proper JS sandbox library.
          // For POC, we capture return value. Stdout/stderr requires console overriding.
          const result = eval(code);
          baseResult.returnValue = result;
          stdout = '[JavaScript execution via eval - stdout not captured]'; // Placeholder
        } catch (e: any) { 
          baseResult.error = e.message || String(e);
          stderr = e.stack || ''; // Capture stack trace in stderr
        }

      } else {
        throw new Error(`Unsupported language: ${language}`);
      }

    } catch (error: any) {
      // This catch is for errors *outside* the inner try/catch (e.g., status checks)
      baseResult.error = error.message || String(error);
      // Append error to stderr as well
      stderr += `Error: ${error.message || String(error)}`; 
    } finally {
      // Reset status after execution attempt
      if (language === 'python') setPythonState(prev => ({ ...prev, status: 'ready' }));
      if (language === 'r') setRState(prev => ({ ...prev, status: 'ready' }));
      
      // Reset Python stdout/stderr handlers
      if (language === 'python' && pythonState.instance) {
          (pythonState.instance as PyodideInterface).setStdout({}); 
          (pythonState.instance as PyodideInterface).setStderr({});
      }
    }

    const endTime = performance.now();
    console.log(`Execution time (${language}): ${(endTime - startTime).toFixed(2)}ms`);

    return {
      ...baseResult,
      stdout,
      stderr,
    };

  }, [pythonState, rState]);
  // --- End of executeCode function ---

  // --- Add readFileFromVFS function ---
  const readFileFromVFS = useCallback(async (filename: string): Promise<Uint8Array | null> => {
    if (rState.status !== 'ready' || !rState.instance) {
      return null;
    }
    const webR = rState.instance as WebR;
    try {
      // Access the Emscripten Filesystem (FS) - may be nested under 'module'
      const fs = (webR as any).module?.FS || (webR as any).FS;
      if (!fs || typeof fs.readFile !== 'function') {
          throw new Error('WebR FS API not found or readFile is not a function.');
      }
      // Read file as binary data (Uint8Array)
      const data = fs.readFile(filename, { encoding: 'binary' });
      return data;
    } catch (error: any) {
      // Check for common Emscripten file not found error
      if (error.message?.includes('FS error') || error.name?.includes('FSReqWrap')) { 
        // File likely doesn't exist
      }
      return null;
    }
  }, [rState]); // Depends on rState
  // --- End readFileFromVFS function ---

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
    python: pythonState,
    r: rState,
    loadRuntime,
    executeCode,
    readFileFromVFS, // Add to context value
  }), [pythonState, rState, loadRuntime, executeCode, readFileFromVFS]);

  return (
    <CodeRuntimesContext.Provider value={contextValue}>
      {children}
    </CodeRuntimesContext.Provider>
  );
};

export const useCodeRuntimes = (): CodeRuntimesContextType => {
  const context = useContext(CodeRuntimesContext);
  if (context === undefined) {
    throw new Error('useCodeRuntimes must be used within a CodeRuntimesProvider');
  }
  return context;
}; 