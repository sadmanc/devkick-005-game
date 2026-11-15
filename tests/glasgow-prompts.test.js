import { describe, expect, it } from 'vitest';
import { CHARACTERS, OTTER_TURN_SCHEMA, SYSTEM_PROMPT, systemPromptFor } from '../server/otter-prompt.js';
import fixture from './fixtures/glasgow-prompts.json';

// The Glasgow prompts are cached by the LLM vendor and tuned by the team: they must not change by a byte.
describe('Glasgow prompts are unchanged', () => {
  it('the otter, Senga and Hamish get exactly the same system prompt as before', () => {
    expect(Object.keys(CHARACTERS)).toEqual(Object.keys(fixture.prompts));
    for (const [id, prompt] of Object.entries(fixture.prompts)) expect(systemPromptFor(id)).toBe(prompt);
    expect(SYSTEM_PROMPT).toBe(fixture.SYSTEM_PROMPT);
  });
  it('the JSON schema the otter answers with is unchanged', () => {
    expect(OTTER_TURN_SCHEMA).toEqual(fixture.schema);
  });
});
