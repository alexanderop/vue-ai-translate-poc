export interface TranslationState {
    germanText: string
    englishText: string
    isLoading: boolean
    modelReady: boolean
    progressPercentage: number
  }
  
  export interface TranslationOutput {
    translation_text: string
  }
  
  export type WorkerMessage = 
    | { status: 'progress'; result: { progress: number } }
    | { status: 'ready' }
    | { status: 'translation'; result: string }
  
  export interface WorkerCommand {
    action: 'download' | 'translate'
    input?: string
    model?: string
  }
  