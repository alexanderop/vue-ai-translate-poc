import { pipeline, env } from '@xenova/transformers'
import type { TranslationPipeline } from '@xenova/transformers'
import type { WorkerMessage, WorkerCommand, TranslationOutput } from '../types/translator'

// Configure Transformers.js
env.allowLocalModels = false

let translator: TranslationPipeline | null = null

// Type-safe progress callback
const progressCallback = (data: { progress: number }): void => {
  self.postMessage({
    status: 'progress',
    result: data
  } as WorkerMessage)
}

// Handle messages with type checking
self.addEventListener('message', async (event: MessageEvent<WorkerCommand>) => {
  const { action, input, model } = event.data

  try {
    switch (action) {
      case 'download':
        if (model) {
          translator = await pipeline('translation', model, {
            progress_callback: progressCallback
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
