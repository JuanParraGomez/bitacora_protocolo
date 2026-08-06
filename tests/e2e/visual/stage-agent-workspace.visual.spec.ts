import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { buildPhaseRevision } from '../../../app/features/tasks/domain/task-assistant-rules';
import { repairTask, type Task } from '../../../app/features/tasks/domain/task.schema';
import { stageAgentWorkspaceTasks, stageAgentWorkspaceWorkspaceState } from '../../fixtures/tasks/stage-agent-workspace';
import { artifactPath, buildEvidenceScreenshotOptions, buildScreenshotOptions, shouldCaptureEvidence, shouldCaptureEvidenceScreenshot, shouldCompareBaseline, waitForStableUi } from '../helpers/visual-capture';
import { assertContained, assertNoOverlap, assertNoOverlapPairs, countPrimaryActions, fitsViewportWidth, isWithinWidthLimit, type Box, type NamedBox, type PrimaryAction } from '../helpers/visual-geometry';
import { VISUAL_SCENARIOS, type VisualScenarioId } from '../helpers/visual-scenarios';
import { WORKSPACE_UX_VIEWPORTS } from '../helpers/workspace-ux';

const INDEX_KEY = 'bitacora:index';
const PROJECTS_KEY = 'bitacora:projects';
const SETTINGS_KEY = 'bitacora:assistant-settings';

const visualScenarioStates = stageAgentWorkspaceWorkspaceState.visualScenarios;
const scenarioTaskIds: Record<VisualScenarioId, string> = {
  'IMG-UX-01': visualScenarioStates['IMG-UX-01'].taskId,
  'IMG-UX-02': visualScenarioStates['IMG-UX-02'].taskId,
  'IMG-UX-03': visualScenarioStates['IMG-UX-03'].taskId,
  'IMG-UX-04': visualScenarioStates['IMG-UX-04'].taskId,
  'IMG-UX-05': visualScenarioStates['IMG-UX-05'].taskId,
  'IMG-UX-06': visualScenarioStates['IMG-UX-06'].taskId,
};

function taskForScenario(id: VisualScenarioId): Task {
  const source = id === 'IMG-UX-06' ? stageAgentWorkspaceTasks.phase4 : id === 'IMG-UX-01' || id === 'IMG-UX-04' || id === 'IMG-UX-05'
    ? stageAgentWorkspaceTasks.phase1
    : stageAgentWorkspaceTasks.phase2;
  const task = repairTask(structuredClone(source));
  if (id === 'IMG-UX-05') task.id = scenarioTaskIds[id];
  if (id === 'IMG-UX-02' || id === 'IMG-UX-03') {
    const revision = buildPhaseRevision(task, task.fase);
    task.assistant.messages = [{
      id: 'visual-proposal-message',
      projectId: task.projectId,
      taskId: task.id,
      phase: task.fase,
      methodVersionId: null,
      baseRevision: revision,
      role: 'assistant',
      parts: [{ type: 'text', text: 'Revisemos la propuesta antes de continuar.' }],
      status: 'sent',
      createdAt: 1_725_000_001_000,
      primaryQuestion: '¿Quieres mantener el alcance actual?',
      contradictions: [],
      updates: [{
        id: 'visual-proposal-update',
        sourceMessageId: 'visual-proposal-message',
        projectId: task.projectId,
        taskId: task.id,
        phase: task.fase,
        methodVersionId: null,
        baseRevision: revision,
        status: 'proposed',
        field: 'f2.pasos',
        previousValue: task.f2.pasos,
        value: 'Pasos revisados y mas precisos',
      }],
    }];
  }
  if (id === 'IMG-UX-05') {
    task.assistant.evaluations = [{
      id: 'visual-failed-evaluation',
      taskId: task.id,
      phase: task.fase,
      responseRevision: buildPhaseRevision(task, task.fase),
      gateVersion: 'legacy-v1',
      methodVersionId: null,
      evaluatorVersion: 'mock-v1',
      status: 'needs-work',
      weaknesses: ['El alcance no coincide con la evidencia.', 'El criterio de éxito no es verificable.'],
      recommendations: ['Ajusta el alcance.', 'Define un criterio verificable.'],
      gatePassed: false,
      gateReasons: [
        'Define una hipótesis verificable para poder evaluar el análisis',
        'Define criterio(s) de éxito para cerrar la fase.',
      ],
      createdAt: 1_725_000_002_000,
    }];
  }
  return task;
}

function workspaceStateForScenario(id: VisualScenarioId, taskId: string) {
  const base = {
    activeProjectId: 'legacy',
    activeTaskId: taskId,
    expandedProjectIds: ['legacy'],
    sidebarCollapsed: false,
    draftByTask: {},
    summaryStateByTask: {},
    lastVisibleMessageByTask: {},
    agentPanelByTask: {} as Record<string, 'collapsed' | 'expanded'>,
    mobilePaneByTask: {} as Record<string, 'stage' | 'agent'>,
    activeOverlay: null,
    overlayProjectId: null,
    overlayRecordId: null,
  };
  if (id === 'IMG-UX-01' || id === 'IMG-UX-04') base.agentPanelByTask[taskId] = 'collapsed';
  if (id === 'IMG-UX-02' || id === 'IMG-UX-03') base.agentPanelByTask[taskId] = 'expanded';
  if (id === 'IMG-UX-04') base.mobilePaneByTask[taskId] = 'stage';
  if (id === 'IMG-UX-02' || id === 'IMG-UX-03') base.mobilePaneByTask[taskId] = 'agent';
  return base;
}

async function seedVisualWorkspace(page: Page, id: VisualScenarioId) {
  const task = taskForScenario(id);
  const taskId = scenarioTaskIds[id];
  const storedState = workspaceStateForScenario(id, taskId);
  await page.addInitScript((state) => {
    window.localStorage.setItem('bitacora:workspace-view-state', JSON.stringify(state));
  }, storedState);
  const indexTask = {
    id: task.id,
    projectId: task.projectId,
    nombre: task.nombre,
    fase: task.fase,
    estado: task.estado,
    tipo: task.tipo,
  };
  const response = await page.request.post('/api/storage/batch', {
    data: {
      operations: [
        { type: 'set', key: `bitacora:t:${task.id}`, value: JSON.stringify(task) },
        { type: 'set', key: INDEX_KEY, value: JSON.stringify({ tareas: [indexTask], registros: [] }) },
        { type: 'set', key: PROJECTS_KEY, value: JSON.stringify({
          schemaVersion: 1,
          activeProjectId: task.projectId,
          projects: [{ id: task.projectId, name: 'Visual workspace', status: 'active', lastActiveTaskId: task.id, createdAt: 1, updatedAt: 1 }],
        }) },
        { type: 'set', key: SETTINGS_KEY, value: JSON.stringify({ mode: 'codex', connectionStatus: 'deferred', schemaVersion: 1 }) },
      ],
    },
  });
  expect(response.ok()).toBe(true);
}

async function visibleBox(page: Page, selector: string): Promise<Box | null> {
  const boxes = await page.locator(selector).evaluateAll((elements) => elements.flatMap((element) => {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    if (style.display === 'none' || style.visibility === 'hidden' || rect.width <= 0 || rect.height <= 0) return [];
    return [{ x: rect.x, y: rect.y, width: rect.width, height: rect.height }];
  }));
  return boxes[0] ?? null;
}

async function visiblePrimaryActions(page: Page): Promise<PrimaryAction[]> {
  return page.locator('[data-primary-action="true"]').evaluateAll((elements) => elements.map((element) => {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      visible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0,
      primary: element.getAttribute('data-primary-action') === 'true',
    };
  }));
}

async function visibleStageFieldBoxes(page: Page): Promise<NamedBox[]> {
  return page.locator('[data-pane="stage"] [data-stage-text-field]').evaluateAll((elements) => elements.flatMap((element, index) => {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const isVisible = style.display !== 'none'
      && style.visibility !== 'hidden'
      && rect.width > 0
      && rect.height > 0
      && rect.bottom > 0
      && rect.right > 0
      && rect.top < viewportHeight
      && rect.left < viewportWidth;
    if (!isVisible) return [];
    return [{
      name: `stage-field-${index + 1}`,
      box: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    }];
  }));
}

async function assertStageFooterDoesNotOverlapVisibleFields(page: Page, scenarioId: VisualScenarioId, viewportName: string) {
  const footer = await visibleBox(page, '[data-stage-footer]');
  if (!footer) return;
  const visibleFields = await visibleStageFieldBoxes(page);
  const footerFieldOverlaps = assertNoOverlap([
    { name: 'stage-footer', box: footer },
    ...visibleFields,
  ]);
  expect(footerFieldOverlaps, `${scenarioId}/${viewportName} footer overlaps visible stage fields: ${JSON.stringify(footerFieldOverlaps)}`).toEqual([]);
}

async function assertVisualGeometry(page: Page, scenarioId: VisualScenarioId, viewportName: string) {
  if (process.env.VISUAL_SEED_GEOMETRY_DEFECT === 'true' && scenarioId === 'IMG-UX-01' && viewportName === 'desktop-large') {
    await page.locator('.agent-panel').evaluate((element) => {
      element.style.transform = 'translateX(-100px)';
    });
  }

  const candidateRegions: Array<[string, string]> = [
    ['navigation', '.workspace-sidebar-frame, .workspace-navigation-drawer'],
    ['canvas', '.workspace-stage'],
    ['agent', '.agent-panel'],
  ];
  const regions: NamedBox[] = [];
  for (const [name, selector] of candidateRegions) {
    const box = await visibleBox(page, selector);
    if (box) regions.push({ name, box });
  }

  const overlaps = assertNoOverlap(regions);
  expect(overlaps, `${scenarioId}/${viewportName} layout overlaps: ${JSON.stringify(overlaps)}`).toEqual([]);

  const agent = regions.find((region) => region.name === 'agent')?.box;
  const stage = regions.find((region) => region.name === 'canvas')?.box;
  if (agent && stage && viewportName !== 'mobile' && viewportName !== 'mobile-narrow') {
    expect(assertContained(agent, {
      x: Math.min(agent.x, stage.x),
      y: Math.min(agent.y, stage.y),
      width: Math.max(agent.x + agent.width, stage.x + stage.width) - Math.min(agent.x, stage.x),
      height: Math.max(agent.y + agent.height, stage.y + stage.height) - Math.min(agent.y, stage.y),
    })).toBe(true);
    if (scenarioId === 'IMG-UX-01') {
      expect(await page.locator('.agent-panel').getAttribute('data-agent-state')).toBe('collapsed');
      expect(isWithinWidthLimit({ width: agent.width }, stage.width + agent.width, { maxPixels: 112, maxRatio: .12 })).toBe(true);
      await expect(page.getByRole('button', { name: 'Expandir agente IA' })).toHaveAttribute('aria-expanded', 'false');
    }
  }

  const stageOverflow = await page.locator('.workspace-stage').evaluate((element) => getComputedStyle(element).overflowY);
  const messagesOverflow = await page.locator('.task-chat__messages').evaluate((element) => getComputedStyle(element).overflowY);
  expect(stageOverflow === 'auto' || stageOverflow === 'scroll').toBe(true);
  expect(messagesOverflow === 'auto' || messagesOverflow === 'scroll').toBe(true);

  if (viewportName === 'mobile-narrow') {
    const horizontalOverflow = await page.locator('html').evaluate((element) => (
      element.scrollWidth > element.clientWidth
      || document.body.scrollWidth > document.body.clientWidth
    ));
    expect(horizontalOverflow, `${scenarioId}/${viewportName} horizontal overflow`).toBe(false);
  }

  if (scenarioId !== 'IMG-UX-06') {
    const stage = page.locator('.workspace-stage');
    const stageText = await stage.textContent();
    expect(stageText).not.toContain('ETAPA ACTIVA');
    expect(stageText).not.toContain('Lienzo de la etapa');
    expect(stageText).not.toContain('SÍNTESIS OPERATIVA');
    expect(stageText).not.toContain('Atrás');
    expect(await stage.locator('[data-stage-text-field]').count()).toBeGreaterThan(0);
    expect(await stage.locator('.guided-phase-form__progress-step').count()).toBe(4);
    const form = await visibleBox(page, '.workspace-stage__form-region');
    const footer = await visibleBox(page, '[data-stage-footer]');
    const agent = regions.find((region) => region.name === 'agent')?.box;
    if (form && agent) {
      expect(assertNoOverlapPairs([
        { name: 'form', box: form },
        { name: 'agent', box: agent },
      ], [['form', 'agent']])).toEqual([]);
    }
    if (footer && agent) {
      expect(assertNoOverlapPairs([
        { name: 'footer', box: footer },
        { name: 'agent', box: agent },
      ], [['footer', 'agent']])).toEqual([]);
    }
  }

  const composer = await visibleBox(page, '#task-chat-composer-input');
  if (scenarioId === 'IMG-UX-02') {
    const proposal = page.locator('.task-chat__proposal').first();
    await expect(proposal, `${scenarioId}/${viewportName} proposal card`).toBeVisible();
    await expect(proposal.locator('.task-chat__proposal-actions button')).toHaveCount(3);
    await expect(proposal).toContainText('Valor propuesto:');
    const proposalOverflow = await proposal.evaluate((element) => element.scrollWidth > element.clientWidth);
    expect(proposalOverflow, `${scenarioId}/${viewportName} proposal should wrap without overflow`).toBe(false);
  }
  if (composer && viewportName !== 'mobile' && viewportName !== 'mobile-narrow') {
    const agent = regions.find((region) => region.name === 'agent');
    expect(agent, `${scenarioId}/${viewportName} composer is visible without an agent panel`).toBeDefined();
    if (agent) {
      expect(composer.x).toBeGreaterThanOrEqual(agent.box.x);
      expect(composer.y).toBeGreaterThanOrEqual(agent.box.y);
      expect(composer.x + composer.width).toBeLessThanOrEqual(agent.box.x + agent.box.width);
      expect(composer.y + composer.height).toBeLessThanOrEqual(agent.box.y + agent.box.height);
    }
  }

  if (viewportName === 'mobile' || viewportName === 'mobile-narrow') {
    const viewport = page.viewportSize();
    const activePane = scenarioId === 'IMG-UX-02' || scenarioId === 'IMG-UX-03'
      ? agent
      : stage;
    expect(activePane, `${scenarioId}/${viewportName} active mobile pane`).toBeDefined();
    if (viewport && activePane) {
      expect(activePane.width, `${scenarioId}/${viewportName} active mobile pane width`).toBeGreaterThanOrEqual(viewport.width - 40);
      expect(activePane.x, `${scenarioId}/${viewportName} active mobile pane left edge`).toBeGreaterThanOrEqual(0);
      expect(activePane.x + activePane.width, `${scenarioId}/${viewportName} active mobile pane right edge`).toBeLessThanOrEqual(viewport.width);
    }
  }

  const actions = await visiblePrimaryActions(page);
  const primaryExpected = viewportName === 'mobile' || viewportName === 'mobile-narrow'
    ? (scenarioId === 'IMG-UX-02' || scenarioId === 'IMG-UX-03' ? 0 : 1)
    : 1;
  expect(countPrimaryActions(actions), `${scenarioId}/${viewportName} visible primary actions`).toBe(primaryExpected);
  const primaryAction = await visibleBox(page, '[data-primary-action="true"]');
  if (primaryExpected === 1) {
    expect(primaryAction, `${scenarioId}/${viewportName} primary action box`).not.toBeNull();
  }
  if (scenarioId === 'IMG-UX-04' && (viewportName === 'mobile' || viewportName === 'mobile-narrow')) {
    await assertStageFooterDoesNotOverlapVisibleFields(page, scenarioId, viewportName);
  }
  const controls = [
    ...(composer ? [{ name: 'composer', box: composer }] : []),
    ...(primaryAction ? [{ name: 'actions', box: primaryAction }] : []),
  ];
  const controlOverlaps = assertNoOverlap(controls);
  expect(controlOverlaps, `${scenarioId}/${viewportName} composer/action overlaps: ${JSON.stringify(controlOverlaps)}`).toEqual([]);
}

async function reportContrast(page: Page, scenarioId: VisualScenarioId, viewportName: string) {
  const textRule = process.env.AXE_SEED_INVALID_RULE === 'true' ? 'visual-missing-rule' : 'color-contrast';
  const results = await new AxeBuilder({ page })
    .withRules([textRule])
    .analyze();
  const componentViolations = await page.locator('button, input, textarea, select, [role="button"]').evaluateAll((elements) => {
    function parseColor(value: string): [number, number, number, number] | null {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const channels = match[1].split(',').map((channel) => Number.parseFloat(channel.trim()));
      if (channels.length < 3 || channels.some((channel) => Number.isNaN(channel))) return null;
      return [channels[0], channels[1], channels[2], channels[3] ?? 1];
    }
    function luminance([red, green, blue]: [number, number, number, number]): number {
      const channel = (value: number) => {
        const normalized = value / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      };
      return (0.2126 * channel(red)) + (0.7152 * channel(green)) + (0.0722 * channel(blue));
    }
    function ratio(foreground: [number, number, number, number], background: [number, number, number, number]): number {
      const foregroundLuminance = luminance(foreground);
      const backgroundLuminance = luminance(background);
      return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
    }
    return elements.flatMap((element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden' || rect.width <= 0 || rect.height <= 0) return [];
      const foreground = parseColor(style.color);
      let background = parseColor(style.backgroundColor);
      let ancestor = element.parentElement;
      while (background && background[3] < 1 && ancestor) {
        const ancestorColor = parseColor(window.getComputedStyle(ancestor).backgroundColor);
        if (ancestorColor && ancestorColor[3] === 1) background = ancestorColor;
        ancestor = ancestor.parentElement;
      }
      if (!foreground || !background || background[3] < 1) return [];
      const contrastRatio = ratio(foreground, background);
      if (contrastRatio >= 3) return [];
      return [{
        target: element.getAttribute('aria-label') || element.getAttribute('data-primary-action') || element.tagName.toLowerCase(),
        html: element.outerHTML.slice(0, 240),
        foreground: style.color,
        background: background ? `rgba(${background[0]}, ${background[1]}, ${background[2]}, ${background[3]})` : 'unknown',
        ratio: Number(contrastRatio.toFixed(2)),
      }];
    });
  });
  const report = {
    scenarioId,
    viewportName,
    rules: {
      text: 'color-contrast (4.5:1 AA text threshold)',
      components: 'computed foreground/background audit (3:1 UI component threshold)',
    },
    violations: results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map((node) => ({
        impact: node.impact,
        target: node.target,
        html: node.html,
        failureSummary: node.failureSummary,
      })),
    })),
    componentViolations,
  };
  await test.info().attach(`axe-contrast-${scenarioId}-${viewportName}`, {
    body: JSON.stringify(report, null, 2),
    contentType: 'application/json',
  });
  console.log(`[axe-contrast] ${scenarioId}/${viewportName}: ${report.violations.length} violation rule(s), ${report.violations.reduce((count, violation) => count + violation.nodes.length, 0)} node(s)`);
  for (const violation of report.violations) {
    for (const node of violation.nodes) {
      console.log(`[axe-contrast-node] ${scenarioId}/${viewportName} ${violation.id} impact=${node.impact ?? 'none'} target=${JSON.stringify(node.target)} html=${node.html}`);
    }
  }
  for (const violation of report.componentViolations) {
    console.log(`[axe-component-contrast] ${scenarioId}/${viewportName} ratio=${violation.ratio} target=${violation.target} foreground=${violation.foreground} background=${violation.background} html=${violation.html}`);
  }
  expect(report.violations, `${scenarioId}/${viewportName} axe contrast violations`).toEqual([]);
  expect(report.componentViolations, `${scenarioId}/${viewportName} component contrast violations`).toEqual([]);
}

async function assertShellContract(page: Page, viewportName: string, scenarioId: VisualScenarioId) {
  const header = page.getByRole('region', { name: 'Contexto del workspace' });
  await expect(header.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
  if (viewportName === 'mobile' || viewportName === 'mobile-narrow') {
    await expect(header.locator('[data-mobile-context]')).toHaveText(/Etapa [1-4] de 4 · .+/);
    await expect(header.locator('[data-stage-chip]')).toHaveCount(0);
  } else {
    await expect(header.locator('[data-stage-chip]')).toHaveText(/Etapa [1-4] de 4/);
  }

  if (viewportName === 'desktop-large') {
    const sidebar = page.getByRole('navigation', { name: 'Navegación de tareas' });
    await expect(sidebar.locator('[data-shell-region="navigation"]')).toHaveCount(1);
    await expect(sidebar.locator('[data-shell-region="search"]')).toHaveCount(1);
    await expect(sidebar.locator('[data-shell-region="projects"]')).toHaveCount(1);
    await expect(sidebar.locator('[data-shell-region="user-footer"]')).toHaveCount(1);
    for (const label of ['Biblioteca', 'Ajustes']) {
      await expect(sidebar.locator(`[aria-label="${label}"]`)).toHaveCount(1);
    }
  } else {
    await expect(header.getByRole('button', { name: 'Abrir navegación' })).toBeVisible();
    await expect(header.getByLabel('Más opciones del workspace')).toBeVisible();
    await expect(page.locator('.workspace-navigation-drawer')).toHaveCount(0);
  }

  await expect(page.locator('[data-primary-action="true"]')).toHaveCount(1);
  if (scenarioId === 'IMG-UX-05') {
    await expect(page.getByRole('heading', { name: '2 correcciones pendientes' })).toBeVisible();
    await expect(page.locator('[data-testid="stage-inline-issue"]').filter({ hasText: 'Define una hipótesis verificable para poder evaluar el análisis' })).toHaveCount(1);
    await expect(page.locator('[data-testid="stage-inline-issue"]').filter({ hasText: 'Define criterio(s) de éxito para cerrar la fase.' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Ver recomendaciones del agente' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reevaluar etapa' })).toHaveCount(1);
    await expect(page.locator('[data-agent-correction-badge]')).toHaveCount(1);
  }
  console.log(`[shell-contract] ${scenarioId}/${viewportName} verified`);
}

test.describe('stage-agent workspace visual baselines', () => {
  for (const scenario of VISUAL_SCENARIOS) {
    test(`${scenario.id} canonical state across contract viewports`, async ({ page }) => {
      await seedVisualWorkspace(page, scenario.id);
      for (const viewport of WORKSPACE_UX_VIEWPORTS) {
        await test.step(`${scenario.id} / ${viewport.name}`, async () => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.goto(`/tasks/${scenarioTaskIds[scenario.id]}`);
          await waitForStableUi(page);
          await expect(page.getByRole('main')).toBeVisible();
          await assertShellContract(page, viewport.name, scenario.id);
          await assertVisualGeometry(page, scenario.id, viewport.name);
          await reportContrast(page, scenario.id, viewport.name);
          if (scenario.id === 'IMG-UX-04' && (viewport.name === 'mobile' || viewport.name === 'mobile-narrow')) {
            const stageTab = page.getByRole('tab', { name: 'Etapa' });
            const agentTab = page.getByRole('tab', { name: /Agente/ });
            const tablistBox = await page.getByRole('tablist', { name: 'Planos del workspace' }).boundingBox();
            expect(tablistBox, `${scenario.id}/${viewport.name} segmented control box`).not.toBeNull();
            expect(tablistBox?.height, `${scenario.id}/${viewport.name} compact segmented control height`).toBeLessThanOrEqual(56);
            await expect(stageTab.locator('[data-pane-icon="stage"]')).toBeVisible();
            await expect(agentTab.locator('[data-pane-icon="agent"]')).toBeVisible();
            await agentTab.click();
            await expect(agentTab).toBeFocused();
            await expect(page.getByLabel('Chat de asistencia')).toBeVisible();
            const agentBox = await page.locator('[data-pane="agent"]').boundingBox();
            expect(agentBox, `${scenario.id}/${viewport.name} agent pane box`).not.toBeNull();
            if (tablistBox && agentBox) {
              expect(
                agentBox.y - (tablistBox.y + tablistBox.height),
                `${scenario.id}/${viewport.name} gap between segmented control and agent`,
              ).toBeLessThanOrEqual(16);
            }
            await reportContrast(page, scenario.id, `${viewport.name}-agent`);
            const agentOverflow = await page.locator('html').evaluate((element) => (
              element.scrollWidth > element.clientWidth
              || document.body.scrollWidth > document.body.clientWidth
            ));
            expect(agentOverflow, `${scenario.id}/${viewport.name}-agent horizontal overflow`).toBe(false);
            if (shouldCompareBaseline()) {
              await expect(page).toHaveScreenshot(
                `${scenario.id}-${viewport.name}-agent.png`,
                buildScreenshotOptions(page),
              );
            }
            if (shouldCaptureEvidenceScreenshot()) {
              const evidenceRoot = process.env.VISUAL_EVIDENCE_ROOT?.trim()
                || 'specs/015-responsive-workspace/evidence/actual';
              await page.screenshot({
                path: `${evidenceRoot.replace(/\/$/, '')}/ACTUAL-${scenario.id}-${viewport.name}-agent.png`,
                ...buildEvidenceScreenshotOptions(page),
              });
            }
            await stageTab.click();
            await expect(stageTab).toBeFocused();
          }
          if (scenario.id === 'IMG-UX-04' && (viewport.name === 'mobile' || viewport.name === 'mobile-narrow')) {
            await page.evaluate(() => { document.documentElement.style.zoom = '200%'; });
            const assertZoomPane = async (pane: 'stage' | 'agent') => {
              const zoomOverflow = await page.locator('html').evaluate((element) => (
                element.scrollWidth > element.clientWidth
                || document.body.scrollWidth > document.body.clientWidth
              ));
              expect(zoomOverflow, `IMG-UX-04/${viewport.name}/${pane} zoom 200% horizontal overflow`).toBe(false);
              const selector = pane === 'stage'
                ? '.workspace-header, .workspace-pane-tabs__tablist, [data-pane="stage"], [data-stage-footer]'
                : '.workspace-header, .workspace-pane-tabs__tablist, [data-pane="agent"], .task-chat__composer';
              const visibleControls = await page.locator(selector).evaluateAll((elements) => elements.flatMap((element) => {
                const rect = element.getBoundingClientRect();
                const style = getComputedStyle(element);
                return style.display === 'none' || rect.width <= 0 || rect.height <= 0 ? [] : [{
                  x: rect.x, y: rect.y, width: rect.width, height: rect.height,
                }];
              }));
              expect(visibleControls.length, `IMG-UX-04/${viewport.name}/${pane} essential controls`).toBe(4);
              expect(
                visibleControls.every((box) => fitsViewportWidth(box, viewport.width)),
                `IMG-UX-04/${viewport.name}/${pane} zoom boxes: ${JSON.stringify(visibleControls)}`,
              ).toBe(true);
              const tabBoxes = await page.getByRole('tab').evaluateAll((elements) => elements.map((element) => {
                const rect = element.getBoundingClientRect();
                return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
              }));
              expect(assertNoOverlap([
                { name: 'stage-tab', box: tabBoxes[0] },
                { name: 'agent-tab', box: tabBoxes[1] },
              ])).toEqual([]);
              const paneBox = await page.locator(`[data-pane="${pane}"]`).boundingBox();
              const tabBox = await page.getByRole('tablist', { name: 'Planos del workspace' }).boundingBox();
              expect(paneBox && tabBox ? paneBox.y >= tabBox.y + tabBox.height : false).toBe(true);
            };
            await assertZoomPane('stage');
            await page.getByRole('tab', { name: /Agente/ }).click();
            await page.locator('.task-chat__composer').scrollIntoViewIfNeeded();
            await assertZoomPane('agent');
            await page.getByRole('tab', { name: 'Etapa' }).click();
            await page.locator('[data-stage-footer]').scrollIntoViewIfNeeded();
            await expect(page.getByRole('button', { name: 'Guardar borrador' })).toBeVisible();
            await expect(page.locator('[data-primary-action="true"]')).toBeVisible();
            await assertStageFooterDoesNotOverlapVisibleFields(page, scenario.id, `${viewport.name}-zoom-stage`);
            await page.evaluate(() => { document.documentElement.style.zoom = ''; });
          }
          if (scenario.id === 'IMG-UX-03' && viewport.name === 'tablet') {
            await page.evaluate(() => { document.documentElement.style.zoom = '200%'; });
            const zoomOverflow = await page.locator('html').evaluate((element) => (
              element.scrollWidth > element.clientWidth
              || document.body.scrollWidth > document.body.clientWidth
            ));
            expect(zoomOverflow, 'IMG-UX-03/tablet zoom 200% horizontal overflow').toBe(false);
            const zoomRegions = await page.locator('.workspace-header, .workspace-stage, .agent-panel, .task-chat__composer').evaluateAll((elements) => elements.map((element) => {
              const rect = element.getBoundingClientRect();
              return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
            }));
            expect(zoomRegions.length, 'IMG-UX-03/tablet zoom essential regions').toBe(4);
            expect(zoomRegions.every((box) => fitsViewportWidth(box, viewport.width))).toBe(true);
            expect(assertNoOverlap([
              { name: 'stage', box: zoomRegions[1] },
              { name: 'agent', box: zoomRegions[2] },
            ]), `IMG-UX-03/tablet zoom regions: ${JSON.stringify(zoomRegions)}`).toEqual([]);
            await page.locator('.task-chat__composer').scrollIntoViewIfNeeded();
            await expect(page.getByPlaceholder('Escribe al agente…')).toBeVisible();
            await page.evaluate(() => { document.documentElement.style.zoom = ''; });
          }
          if (process.env.VISUAL_SEED_DEFECT === 'true' && scenario.id === 'IMG-UX-01' && viewport.name === 'desktop-large') {
            await page.evaluate(() => {
              const defect = document.createElement('div');
              defect.id = 'visual-seeded-defect';
              defect.style.cssText = 'position:fixed;inset:0;background:#ff0000;z-index:2147483647;';
              document.body.append(defect);
            });
          }
          if (process.env.VISUAL_SEED_DEFECT === 'true' && scenario.id === 'IMG-UX-01' && viewport.name === 'desktop-large') {
            await expect(page.locator('#visual-seeded-defect')).toHaveCount(0);
          }
          if (shouldCompareBaseline()) {
            await expect(page).toHaveScreenshot(`${scenario.id}-${viewport.name}.png`, buildScreenshotOptions(page));
          }
          if (shouldCaptureEvidenceScreenshot() && shouldCaptureEvidence(scenario.id, viewport.name)) {
            await page.screenshot({ path: artifactPath(scenario.id, viewport.name), ...buildEvidenceScreenshotOptions(page) });
          }
        });
      }
    });
  }
});
