import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import TaskChat from './TaskChat.vue';

function createMessage(overrides: Record<string, unknown> = {}) {
  return {
    id: 'message-1',
    projectId: 'legacy',
    taskId: 'task-1',
    phase: 2,
    methodVersionId: null,
    baseRevision: 'rev-1',
    role: 'assistant',
    parts: [{ type: 'text', text: 'Mensaje del asistente' }],
    status: 'sent',
    createdAt: 1_725_000_000_000,
    primaryQuestion: null,
    contradictions: [],
    updates: [],
    ...overrides,
  };
}

function mountChat(props: Record<string, unknown> = {}) {
  return mount(TaskChat, {
    props: {
      messages: [],
      workspaceLabel: 'workspace demo',
      ...props,
    },
    global: {
      stubs: {
        UChatMessages: {
          props: ['messages'],
          template: `
            <div>
              <template v-for="message in messages" :key="message.id">
                <slot name="content" :message="message" />
              </template>
              <slot />
            </div>
          `,
        },
        UChatPrompt: {
          props: ['modelValue'],
          emits: ['update:modelValue', 'submit'],
          template: `
            <form @submit.prevent="$emit('submit', $event)">
              <textarea
                data-testid="composer"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
              />
              <slot name="footer" />
            </form>
          `,
        },
        UChatPromptSubmit: {
          emits: ['reload'],
          template: `
            <div>
              <button type="submit">Enviar</button>
              <button type="button" data-testid="retry-latest" @click="$emit('reload')">Reintentar</button>
            </div>
          `,
        },
      },
    },
  });
}

describe('TaskChat', () => {
  it('updates the draft and emits the trimmed send payload', async () => {
    const wrapper = mountChat();

    await wrapper.get('[data-testid="composer"]').setValue('  mensaje con espacios  ');
    await wrapper.get('form').trigger('submit');

    expect(wrapper.emitted('updateDraft')?.at(0)).toEqual(['  mensaje con espacios  ']);
    expect(wrapper.emitted('send')?.at(0)).toEqual(['mensaje con espacios']);
  });

  it('retries the latest failed user message from the composer footer', async () => {
    const wrapper = mountChat({
      messages: [
        createMessage({
          id: 'message-user-failed',
          role: 'user',
          status: 'error',
          parts: [{ type: 'text', text: 'reintentar esto' }],
          updates: [],
        }),
      ],
    });

    await wrapper.get('[data-testid="retry-latest"]').trigger('click');

    expect(wrapper.emitted('retry')?.at(0)).toEqual(['message-user-failed']);
  });

  it('emits accept, edit and reject decisions for assistant proposals', async () => {
    const wrapper = mountChat({
      messages: [
        createMessage({
          updates: [{
            id: 'proposal-1',
            sourceMessageId: 'message-1',
            projectId: 'legacy',
            taskId: 'task-1',
            phase: 2,
            methodVersionId: null,
            baseRevision: 'rev-1',
            field: 'f2.decision',
            value: 'Nueva decisión',
            previousValue: 'Vieja decisión',
            status: 'proposed',
          }],
        }),
      ],
    });

    await wrapper.get('button[aria-label="Aceptar propuesta"]').trigger('click');
    await wrapper.get('input').setValue('Decisión editada');
    await wrapper.get('button[aria-label="Editar propuesta"]').trigger('click');
    await wrapper.get('button[aria-label="Descartar propuesta"]').trigger('click');

    expect(wrapper.emitted('proposalDecision')?.[0]).toEqual([{
      action: 'accept',
      proposalId: 'proposal-1',
      baseRevision: 'rev-1',
    }]);
    expect(wrapper.emitted('proposalDecision')?.[1]).toEqual([{
      action: 'edit',
      proposalId: 'proposal-1',
      value: 'Decisión editada',
      baseRevision: 'rev-1',
    }]);
    expect(wrapper.emitted('proposalDecision')?.[2]).toEqual([{
      action: 'reject',
      proposalId: 'proposal-1',
      baseRevision: 'rev-1',
    }]);
  });
});
