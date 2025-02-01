import { pipeline, env, TranslationPipeline} from '@huggingface/transformers';
import type { WorkerMessage, WorkerCommand, TranslationOutput } from '../types/translator'

// Configure Transformers.js
env.allowLocalModels = false

let translator: TranslationPipeline | null = null

const progressCallback = (progressInfo: { status: string } & ({ progress?: number } | { progress: number })): void => {
  if ('progress' in progressInfo) {
    self.postMessage({
      status: 'progress',
      result: { progress: progressInfo.progress || 0 }
    } as WorkerMessage)
  }
}

// Handle messages with type checking
self.addEventListener('message', async (event: MessageEvent<WorkerCommand>) => {
  const { action, input, model } = event.data

  try {
    switch (action) {
      case 'download':
        if (model) {
          translator = await pipeline('translation', model, {
            progress_callback: progressCallback,
            device: 'webgpu',
          })
          self.postMessage({ status: 'ready' } as WorkerMessage)
        }
        break
        
      case 'translate':
        if (input && translator) {
          const output = await translator(input) as TranslationOutput[]
          self.postMessage({ 
            status: 'translation',
            result: output[0].translation_text
          } as WorkerMessage)
        }
        break
    }
  } catch (error) {
    console.error('Translation error:', error)
    self.postMessage({
      status: 'translation',
      result: 'Error during translation. Please try again.'
    } as WorkerMessage)
  }
})

// Required for TypeScript modules
export {}
