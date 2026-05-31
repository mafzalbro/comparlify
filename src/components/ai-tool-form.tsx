"use client";

import dynamic from "next/dynamic";
import React, { useActionState, useRef, useMemo, memo, createContext, useContext, useEffect } from "react";
import { useFormStatus } from "react-dom";
import {
  Sparkles,
  Copy,
  RefreshCw,
  Wand2,
  PlusCircle,
  Loader2,
  AlertCircle,
  Eye,
  Workflow,
  Download,
  FileDown,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useContinueGeneration } from "@/hooks/use-continue-generation";
import { useToast } from "@/hooks/use-toast";
import { MotionDiv } from "./motion-wrapper";
import { cn } from "@/lib/utils";

const MarkdownContent = dynamic(() => import("./markdown-content").then(m => m.MarkdownContent), {
  ssr: true,
  loading: () => <div className="animate-pulse bg-muted/20 h-40 rounded-xl w-full" />
});

const WorkflowRenderer = dynamic<any>(() => import("./workflow-renderer").then(m => m.WorkflowRenderer), {
  ssr: true,
});

const AIGenerationLoader = dynamic(() => import("./ai-generation-loader").then(m => m.AIGenerationLoader), {
  ssr: false
});

/**
 * Unified AI Action State
 */
export interface AIActionState {
  generatedContent: string | null;
  error: string | null | any;
}

// --- Context ---

interface AIToolFormContextValue {
  state: AIActionState;
  formAction: (payload: FormData) => void;
  isFormSubmitting: boolean;
  formRef: React.RefObject<HTMLFormElement | null>;
  showLoader: boolean;
  handleCopy: () => void;
  isContinuing: boolean;
  isContentIncomplete: boolean;
  handleContinue: () => void;
}

const AIToolFormContext = createContext<AIToolFormContextValue | null>(null);

function useAIToolForm() {
  const context = useContext(AIToolFormContext);
  if (!context) {
    throw new Error("AIToolForm sub-components must be rendered within AIToolForm.Root");
  }
  return context;
}

// --- Root Component ---

interface AIToolFormRootProps {
  action: (prevState: any, formData: FormData) => Promise<AIActionState>;
  initialState?: AIActionState;
  children: React.ReactNode;
  className?: string;
  dirty?: boolean; // For beforeunload guard
}

export function AIToolFormRoot({
  action,
  initialState = { generatedContent: null, error: null },
  children,
  className,
  dirty = false,
}: AIToolFormRootProps) {
  const [state, formAction, isFormSubmitting] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const { isContinuing, isContentIncomplete, handleContinue } = useContinueGeneration({
    formRef,
    content: state.generatedContent,
  });

  const showLoader = isFormSubmitting || isContinuing;

  const handleCopy = () => {
    if (state.generatedContent) {
      navigator.clipboard.writeText(state.generatedContent);
      toast({
        title: "Copied!",
        description: "Content successfully copied to your clipboard.",
      });
    }
  };

  // beforeunload guard
  useEffect(() => {
    if (!dirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const value = useMemo(() => ({
    state,
    formAction,
    isFormSubmitting,
    formRef,
    showLoader,
    handleCopy,
    isContinuing,
    isContentIncomplete,
    handleContinue
  }), [state, formAction, isFormSubmitting, showLoader, isContinuing, isContentIncomplete]);

  return (
    <AIToolFormContext.Provider value={value}>
      <div className={cn("w-full transition-all duration-500", className)}>
        <AIGenerationLoader show={showLoader} />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start max-w-[1600px] mx-auto">
          {children}
        </div>
      </div>
    </AIToolFormContext.Provider>
  );
}

// --- Sub-Components ---

export function AIToolFormConfig({ children, className }: { children: React.ReactNode; className?: string }) {
  const { formRef, formAction } = useAIToolForm();
  return (
    <MotionDiv
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("xl:col-span-4 sticky top-24", className)}
    >
      <div className="p-8 rounded-4xl bg-card/40 backdrop-blur-3xl border border-border/10 shadow-2xl space-y-8">
        <form ref={formRef} action={formAction} className="space-y-6">
          {children}
        </form>
      </div>
    </MotionDiv>
  );
}

export function AIToolFormHeader({ title, description, badge = "Premium Engine" }: { title: string; description: string; badge?: string }) {
  return (
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
        <Sparkles className="h-3 w-3" />
        <span className="text-[10px] font-black uppercase tracking-widest">{badge}</span>
      </div>
      <div>
        <h2 className="text-3xl font-black tracking-tight">{title}</h2>
        <p className="text-muted-foreground font-medium leading-relaxed mt-2 text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

export function AIToolFormSubmit({ label = "Generate Results" }: { label?: string }) {
  const { showLoader } = useAIToolForm();
  return <div className="pt-4"><SubmitButton label={label} isSubmitting={showLoader} /></div>;
}

export function AIToolFormOutput({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <MotionDiv
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className={cn("xl:col-span-8 min-h-[500px]", className)}
    >
      {children}
    </MotionDiv>
  );
}

export function AIToolFormResult() {
  const { state, showLoader, handleCopy, formRef, isContentIncomplete, handleContinue } = useAIToolForm();
  const [viewMode, setViewMode] = React.useState<"reading" | "workflow">("reading");
  const [structuredWorkflow, setStructuredWorkflow] = React.useState<any[] | null>(null);
  const [isStructuring, setIsStructuring] = React.useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleSwitchToWorkflow = async () => {
    setViewMode("workflow");
    if (!structuredWorkflow && state.generatedContent && !isStructuring) {
      setIsStructuring(true);
      const { structureWorkflowAction } = await import("@/app/actions/ai");
      const result = await structureWorkflowAction({ topic: state.generatedContent });
      if (((result as any).generatedContent)) {
        setStructuredWorkflow(((result as any).generatedContent));
      }
      setIsStructuring(false);
    }
  };
  
  if (!state.generatedContent || showLoader) return null;

  const handleExportPDF = async () => {
    if (!exportRef.current) return;
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");
    
    toast({ title: "Processing PDF...", description: "Please wait while we forge your document." });

    const canvas = await html2canvas(exportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#000000",
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`comparlify-ai-output-${Date.now()}.pdf`);
    
    toast({ title: "Success!", description: "PDF exported successfully." });
  };

  const handleExportImage = async () => {
    if (!exportRef.current) return;
    const { default: html2canvas } = await import("html2canvas");
    
    toast({ title: "Generating Image...", description: "Optimizing pixels for export." });

    const canvas = await html2canvas(exportRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#000000",
    });
    
    const link = document.createElement("a");
    link.download = `comparlify-ai-output-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    
    toast({ title: "Success!", description: "Image saved to downloads." });
  };

  return (
    <Card className="bg-transparent border-none rounded-none h-full flex flex-col overflow-visible shadow-none">
      <CardHeader className="flex flex-col md:flex-row items-center justify-between py-5 px-8 bg-secondary/40 backdrop-blur-md gap-6 rounded-t-4xl border-x border-t border-border/10 border-b-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-bold tracking-tight">AI Output</CardTitle>
          </div>

          <div className="flex items-center bg-background/60 p-1.5 rounded-2xl border border-border/5 shadow-inner">
            <button
              onClick={() => setViewMode("reading")}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                viewMode === "reading" 
                  ? "bg-primary text-primary-foreground shadow-[0_5px_15px_-5px_rgba(var(--primary-rgb),0.4)]" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent-surface/20"
              )}
            >
              <Eye className="h-3 w-3" /> Reading
            </button>
            <button
              onClick={handleSwitchToWorkflow}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                viewMode === "workflow" 
                  ? "bg-primary text-primary-foreground shadow-[0_5px_15px_-5px_rgba(var(--primary-rgb),0.4)]" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent-surface/20"
              )}
            >
              <Workflow className={cn("h-3 w-3", isStructuring && "animate-spin")} /> {isStructuring ? "Mapping..." : "Workflow"}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center bg-muted/50 p-1 rounded-full border border-border mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportPDF}
              className="h-8 w-8 p-0 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground"
              title="Export as PDF"
            >
              <FileDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportImage}
              className="h-8 w-8 p-0 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground"
              title="Export as Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="rounded-full bg-muted/50 border-border hover:bg-foreground/5 h-10 px-4 text-[10px] font-bold uppercase tracking-widest"
          >
            <Copy className="h-4 w-4 mr-2" /> Copy
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setStructuredWorkflow(null);
              formRef.current?.requestSubmit();
            }}
            className="rounded-full shadow-lg shadow-primary/20 h-10 px-6 font-black uppercase tracking-widest text-[9px]"
          >
            <RefreshCw className="h-3 w-3 mr-2" /> Re-Craft
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-y-auto custom-scrollbar bg-muted/30 dark:bg-muted/20">
        <div className="py-12 px-4 md:px-12 flex justify-center">
          <div 
            ref={exportRef} 
            className={cn(
               "min-h-[11in] w-full transition-all duration-700 ease-in-out relative",
               viewMode === "reading" 
                ? "max-w-[900px] bg-background shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] p-[0.6in] md:p-[1in] border border-border/10 rounded-sm" 
                : "max-w-none p-4"
            )}
          >
            {/* Paper texture overlay for reading mode */}
            {viewMode === "reading" && (
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]" />
            )}
            
            <div className="relative z-10">
             {viewMode === "reading" ? (
               <div className="prose prose-zinc dark:prose-invert max-w-none">
                 <MarkdownContent content={state.generatedContent} />
               </div>
             ) : (
               <WorkflowRenderer content={state.generatedContent} structuredData={structuredWorkflow} isLoading={isStructuring} />
             )}
            </div>
          </div>
        </div>
        
        {isContentIncomplete && (
          <div className="px-8 pb-8">
            <div className="pt-8 border-t border-border">
              <Button
                onClick={handleContinue}
                disabled={showLoader}
                className="w-full rounded-2xl h-12 bg-muted/50 hover:bg-muted border border-border"
                variant="outline"
                type="button"
              >
                {showLoader ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Continuing...</> : <><PlusCircle className="mr-2 h-4 w-4" /> Continue Generation</>}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AIToolFormEmpty() {
  const { state, showLoader } = useAIToolForm();
  
  if (state.generatedContent || showLoader) return null;

  return (
    <Card className="flex flex-col items-center justify-center h-full min-h-[500px] border-2 border-dashed border-border/20 rounded-4xl bg-secondary/5 group overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern-light opacity-5 group-hover:opacity-10 transition-opacity"></div>
      <div className="relative z-10 text-center px-10">
        <div className="p-10 bg-secondary/50 rounded-full w-fit mx-auto mb-10 shadow-inner group-hover:scale-110 transition-transform duration-700 border border-border/10 relative">
          <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
          <Wand2 className="relative z-10 mx-auto h-24 w-24 text-primary/20 group-hover:text-primary/40 transition-colors" />
        </div>
        <h3 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tight">Forge <span className="text-primary italic">Intelligence</span></h3>
        <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed font-medium">
          Input your parameters on the left and let our AI engine craft your high-fidelity content.
        </p>
      </div>
    </Card>
  );
}

export function AIToolFormError() {
  const { state, showLoader } = useAIToolForm();
  
  if (!state.error || showLoader) return null;

  return (
    <div className="mt-8">
      <Alert variant="destructive" className="rounded-2xl border-2 border-destructive/20 bg-destructive/10 backdrop-blur-md px-8 py-6">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-lg font-bold ml-2">Generation Failed</AlertTitle>
        <AlertDescription className="text-sm mt-1 ml-2 opacity-90">
          {typeof state.error === 'string' ? state.error : "An unexpected error occurred. Please try again."}
        </AlertDescription>
      </Alert>
    </div>
  );
}

// --- Legacy Convenience Wrapper ---

interface AIToolFormProps {
  title: string;
  description: string;
  action: (prevState: any, formData: FormData) => Promise<AIActionState>;
  initialState?: AIActionState;
  children: React.ReactNode;
  className?: string;
  submitLabel?: string;
  dirty?: boolean;
}

export function AIToolForm({
  title,
  description,
  action,
  initialState,
  children,
  className,
  submitLabel,
  dirty,
}: AIToolFormProps) {
  return (
    <AIToolFormRoot action={action} initialState={initialState} className={className} dirty={dirty}>
      <AIToolFormConfig>
        <AIToolFormHeader title={title} description={description} />
        <div className="space-y-6">
           {children}
        </div>
        <AIToolFormSubmit label={submitLabel} />
      </AIToolFormConfig>
      
      <AIToolFormOutput>
        <AIToolFormResult />
        <AIToolFormEmpty />
        <AIToolFormError />
      </AIToolFormOutput>
    </AIToolFormRoot>
  );
}

// --- Utilities ---

const SubmitButton = memo(function SubmitButton({ label, isSubmitting }: { label: string; isSubmitting: boolean }) {
  const { pending } = useFormStatus();
  const disabled = pending || isSubmitting;

  return (
    <Button
      type="submit"
      disabled={disabled}
      size="lg"
      className="w-full rounded-2xl h-14 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      {disabled ? <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Crafting...</> : <><Sparkles className="mr-3 h-5 w-5" /> {label}</>}
    </Button>
  );
});

// Attach sub-components to AIToolForm
AIToolForm.Root = AIToolFormRoot;
AIToolForm.Config = AIToolFormConfig;
AIToolForm.Header = AIToolFormHeader;
AIToolForm.Submit = AIToolFormSubmit;
AIToolForm.Output = AIToolFormOutput;
AIToolForm.Result = AIToolFormResult;
AIToolForm.Empty = AIToolFormEmpty;
AIToolForm.Error = AIToolFormError;
