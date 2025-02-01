import { pipeline, TextStreamer, TranslationPipeline } from '@huggingface/transformers';
import type { PipelineType, ProgressCallback } from '@huggingface/transformers';

class MyTranslationPipeline {
  static task: PipelineType = 'translation';
  static model = 'Xenova/nllb-200-distilled-600M';
  static instance: TranslationPipeline | null = null;

  static async getInstance(progress_callback?: ProgressCallback) {
    if (!this.instance) {
      this.instance = await pipeline(this.task, this.model, { progress_callback }) as TranslationPipeline;
    }
    return this.instance;
  }
}

// Define message types
interface TranslationRequest {
  text: string;
  src_lang: string;
  tgt_lang: string;
}

// Listen for messages from the main thread
self.addEventListener('message', async (event: MessageEvent<TranslationRequest>) => {
  try {
    // Get the translation pipeline
    const translator = await MyTranslationPipeline.getInstance(x => {
      self.postMessage(x);
    });

    // Create text streamer for partial outputs
    const streamer = new TextStreamer(translator.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (text: string) => {
        self.postMessage({
          status: 'update',
          output: text
        });
      }
    });

    // Perform translation
    const output = await translator(event.data.text, {
      // @ts-ignore
      tgt_lang: event.data.tgt_lang,
      src_lang: event.data.src_lang,
      streamer,
    });

    // Send final output
    self.postMessage({
      status: 'complete',
      output,
    });
  } catch (error) {
    self.postMessage({
      status: 'error',
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
}); 