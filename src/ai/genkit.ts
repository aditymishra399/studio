import {genkit, Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {genkitEval} from '@genkit-ai/evaluator';

const plugins: Plugin[] = [googleAI()];
if (process.env.NODE_ENV !== 'production') {
  plugins.push(genkitEval());
}

export const ai = genkit({
  plugins: plugins,
  model: 'googleai/gemini-2.0-flash',
  enableTracing: true,
  logLevel: 'debug',
});
