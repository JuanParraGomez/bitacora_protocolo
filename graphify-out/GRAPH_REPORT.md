# Graph Report - /var/folders/g7/pfdvkz7909b00p_pyfskx9q00000gp/T/graphify-scope-joD3RE  (2026-07-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1227 nodes · 1507 edges · 117 communities (96 shown, 21 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 27
- Community 29
- Community 33
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 116

## God Nodes (most connected - your core abstractions)
1. `scripts` - 31 edges
2. `repairTask()` - 17 edges
3. `buildPhaseRevision()` - 16 edges
4. `repairTask()` - 14 edges
5. `Tasks: Evolution-Ready Project Foundation` - 14 edges
6. `Tasks: Espacio de trabajo guiado por IA` - 14 edges
7. `Task` - 12 edges
8. `Tasks: Bitácora de iteraciones guiada` - 12 edges
9. `Quickstart: Target Development Workflow` - 11 edges
10. `Tasks: Graphify Codebase Memory` - 11 edges

## Surprising Connections (you probably didn't know these)
- `useTaskIndex()` --indirect_call--> `refresh()`  [INFERRED]
  app/features/tasks/composables/useTaskIndex.ts → scripts/graphify-watch.mjs
- `syncImprovements()` --calls--> `deriveCriterionImprovements()`  [EXTRACTED]
  app/features/tasks/components/ReviewPhase.vue → app/features/tasks/domain/task-rules.ts
- `applyAssistantResponse()` --calls--> `applyAssistantUpdates()`  [EXTRACTED]
  app/features/tasks/components/TaskWorkspace.vue → app/features/tasks/domain/task-assistant-rules.ts
- `handleSendMessage()` --calls--> `buildPhaseRevision()`  [EXTRACTED]
  app/features/tasks/components/TaskWorkspace.vue → app/features/tasks/domain/task-assistant-rules.ts
- `performEvaluation()` --calls--> `buildPhaseRevision()`  [EXTRACTED]
  app/features/tasks/components/TaskWorkspace.vue → app/features/tasks/domain/task-assistant-rules.ts

## Import Cycles
- None detected.

## Communities (117 total, 21 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (31): scripts, architecture, architecture:check, build, build:production, db:backup, db:check, dev (+23 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (13): dependency-cruiser, devDependencies, dependency-cruiser, @playwright/test, @types/better-sqlite3, typescript, vitest, vue-tsc (+5 more)

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (9): properties, minLength, type, type, from, kind, to, minLength (+1 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (27): AssistantState, Criterion, criterionImpactSchema, CriterionImprovement, criterionImprovementSchema, criterionPrioritySchema, criterionSchema, criterionStatusSchema (+19 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (13): createKvStoreRepository(), KvStoreRepository, DatabaseOptions, openDatabase(), probeDatabase(), resolveDatabasePath(), storageHealthSchema, storageKeySchema (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.20
Nodes (4): AssistanceSettings, createTaskStore(), StorageClient, TaskStore

### Community 6 - "Community 6"
Cohesion: 0.20
Nodes (10): pattern, type, properties, pattern, type, id, path, purpose (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (32): Content Quality, Feature Readiness, Notes, Requirement Completeness, Specification Quality Checklist: Graphify Codebase Memory, AI consultation behavior, Complexity Tracking, Constitution Check (+24 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (27): edges, generatedAt, modules, schemaVersion, sourceHash, additionalProperties, items, type (+19 more)

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (10): filename, props, LibraryRecord, libraryRecordSchema, LibraryRecordSummary, libraryRecordSummarySchema, createLibraryStore(), LibraryStorage (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.27
Nodes (11): EXCLUDED, generateSnapshot(), moduleFor(), moduleId(), renderMermaid(), SOURCE_EXTENSIONS, sourceFiles(), writeSnapshot() (+3 more)

### Community 11 - "Community 11"
Cohesion: 0.23
Nodes (9): parseOptionalProviderResponse(), Adapter, createOptionalProviderService(), OptionalProviderResponse, OptionalProviderResult, OptionalProviderStatus, optionalProviderConfigSchema, optionalProviderRequestSchema (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.05
Nodes (38): Content Quality, Feature Readiness, Notes, Requirement Completeness, Specification Quality Checklist: Evolution-Ready Project Foundation, Checkpoint 0 — Baseline and recovery, Checkpoint 1 — Nuxt shell with compatibility storage, Checkpoint 2 — Tasks capability (+30 more)

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (13): check(), directories, fail(), fingerprint(), generate(), inputs(), metadataPath, outputDir (+5 more)

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (21): advance(), canContinue, completeCurrentTask(), currentErrors, error, hydrated, id, { index, activeTasks, completedItems, refresh: refreshIndex, error: indexError } (+13 more)

### Community 15 - "Community 15"
Cohesion: 0.20
Nodes (9): app/**/*.test.ts, ./.nuxt/tsconfig.json, tests/**/*.ts, compilerOptions, allowJs, noEmit, strict, exclude (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.20
Nodes (9): bitacora:index, description, files, bitacora.sqlite, empty.sqlite, interrupted.sqlite, malformed.sqlite, preservationRule (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.48
Nodes (4): escapeText(), REFERENCE_SECTIONS, ReferenceSection, renderReferenceText()

### Community 18 - "Community 18"
Cohesion: 0.33
Nodes (3): fake, root, workflow

### Community 19 - "Community 19"
Cohesion: 0.70
Nodes (3): backupDatabase(), checksum(), verifyBackup()

### Community 20 - "Community 20"
Cohesion: 0.47
Nodes (5): useTaskIndex(), onChange(), refresh(), schedule(), watched

### Community 21 - "Community 21"
Cohesion: 0.50
Nodes (3): record, route, storage

### Community 46 - "Community 46"
Cohesion: 0.10
Nodes (19): ApplicationContract, Architecture metadata, CapabilityModule, Compatibility store, Data Model: Evolution-Ready Project Foundation, ExecutionPhase, GuidancePhase, JournalIndex (+11 more)

### Community 47 - "Community 47"
Cohesion: 0.25
Nodes (8): CriterionImprovement, Data Model: Bitácora de iteraciones guiada, GuidedCriterion, Iteration, ProblemAnalysis, Repair migration rules, State transitions, Task (extensión compatible)

### Community 48 - "Community 48"
Cohesion: 0.10
Nodes (19): Dependencies & Execution Order, Implementation for User Story 1, Implementation for User Story 2, Implementation for User Story 3, Implementation Strategy, Incremental Delivery, MVP First, Non-negotiable Test-First Rule (+11 more)

### Community 49 - "Community 49"
Cohesion: 0.12
Nodes (16): Completion Definition, Dependencies & Execution Order, Format: `[ID] [P?] [Story] Description`, Implementation Strategy, MVP First, Non-negotiable Test-First Rule, Parallel Example: Test-First Work, Phase 1: Complete Test Specification First (Red Suite) (+8 more)

### Community 50 - "Community 50"
Cohesion: 0.17
Nodes (11): Add a capability, Data safety before a migration checkpoint, FastAPI extraction rule, Initial setup, Prerequisites, Production-parity build, Quickstart: Target Development Workflow, Run locally (+3 more)

### Community 51 - "Community 51"
Cohesion: 0.20
Nodes (9): Decision 1: Application architecture, Decision 2: Runtime versions, Decision 3: Persistence, Decision 4: Validation and contracts, Decision 5: Testing, Decision 6: Structure graph automation, Decision 7: Future Python service, Decision 8: Deployment (+1 more)

### Community 52 - "Community 52"
Cohesion: 0.25
Nodes (7): Assistant Consultation Rule, Codebase Graph, Data Model: Graphify Codebase Memory, Freshness State, Graph Artifact Set, Graph Scope, Relationships

### Community 53 - "Community 53"
Cohesion: 0.25
Nodes (7): Generate and consult the graph, Install the development tool, Keep it fresh, Prerequisites, Quickstart: Graphify Codebase Memory, Recovery, Register project-local Codex guidance

### Community 54 - "Community 54"
Cohesion: 0.25
Nodes (7): Decision 1: Use Graphify-Labs Graphify, not the installed `grapify` npm package, Decision 2: Keep Graphify outside the runtime and production dependency graph, Decision 3: Use project-local Codex guidance plus Graphify's Codex installer, Decision 4: Generate locally, refresh from the normal developer command surface, and verify freshness by fingerprint, Decision 5: Limit inputs and make failures non-blocking for runtime work, Research: Graphify Codebase Memory, Sources

### Community 55 - "Community 55"
Cohesion: 0.29
Nodes (6): Assistant guidance contract, Commands, Freshness metadata, Graph Workflow Contract, Inputs and exclusions, Purpose

### Community 56 - "Community 56"
Cohesion: 0.40
Nodes (4): Completed, Known unrelated verification issue, Manual check, Verification: Graphify Codebase Memory

### Community 57 - "Community 57"
Cohesion: 0.33
Nodes (5): Add a capability, Capability ownership, Current capabilities, Deferred provider removal criteria, Feature modules

### Community 58 - "Community 58"
Cohesion: 0.29
Nodes (6): Branch + GitHub workflow (obligatorio para esta sesión), Estado esperado en Git, Flujo recomendado por especificación, Graphify codebase context, Mandatory Test-First Workflow, Regla de seguridad de `main`

### Community 70 - "Community 70"
Cohesion: 0.08
Nodes (25): Dependencies and execution order, Format: `[ID] [P?] [Story] Description`, Implementation for User Story 1, Implementation for User Story 2, Implementation for User Story 3, Implementation for User Story 4, Implementation strategy, Incremental delivery (+17 more)

### Community 71 - "Community 71"
Cohesion: 0.07
Nodes (45): appendIteration(), emit, iterationRefs, props, task, emit, props, syncImprovements() (+37 more)

### Community 72 - "Community 72"
Cohesion: 0.04
Nodes (51): applyAssistantResponse(), assistanceSettings, canContinue, chatError, chatSendState, chatSuggestions, ChatUpdateStatus, conversationContext (+43 more)

### Community 73 - "Community 73"
Cohesion: 0.29
Nodes (7): Constitution Check, Documentation (this feature), Implementation Plan: Bitácora de iteraciones guiada, Project Structure, Source Code (repository root), Summary, Technical Context

### Community 74 - "Community 74"
Cohesion: 0.08
Nodes (31): emit, EvaluationStatus, hasEvaluationHistory, hasRetryAction, onRetry(), props, sortedEvaluationHistory, status (+23 more)

### Community 75 - "Community 75"
Cohesion: 0.06
Nodes (29): Content Quality, Feature Readiness, Notes, Requirement Completeness, Specification Quality Checklist: Espacio de trabajo guiado por IA, Complexity Tracking, Constitution Check, Documentation (this feature) (+21 more)

### Community 76 - "Community 76"
Cohesion: 0.07
Nodes (29): Commit Boundaries, Dependencies & Execution Order, Format: `[ID] [P?] [Story] Description`, Implementation for User Story 1, Implementation for User Story 2, Implementation for User Story 3, Implementation for User Story 4, Implementation Strategy (+21 more)

### Community 77 - "Community 77"
Cohesion: 0.07
Nodes (25): Content Quality, Feature Readiness, Notes, Requirement Completeness, Specification Quality Checklist: Formularios y prompts sincronizados por fase, Complexity Tracking, Constitution Check, Documentation (this feature) (+17 more)

### Community 78 - "Community 78"
Cohesion: 0.15
Nodes (13): Assumptions, Edge Cases, Feature Specification: Bitácora de iteraciones guiada, Functional Requirements, Key Entities, Measurable Outcomes, Requirements *(mandatory)*, Success Criteria *(mandatory)* (+5 more)

### Community 80 - "Community 80"
Cohesion: 0.29
Nodes (6): Decision: componente reutilizable de distribución de fase, con diseño responsive por CSS, Decision: conservar el agregado `Task` y sus cuatro objetos de fase, Decision: distinguir prompt automático y prompt personalizado con la marca persistida existente, Decision: pruebas rojas primero en dominio, persistencia y navegador, Decision: una función de composición por etapa y observación local del formulario, Research: Formularios y prompts sincronizados por fase

### Community 81 - "Community 81"
Cohesion: 0.33
Nodes (5): Accessibility requirements, Non-goals, Required interaction contract, Scope, UI Contract: Área de formulario y prompt por fase

### Community 82 - "Community 82"
Cohesion: 0.33
Nodes (5): Compatibility verification, Manual browser verification, Preconditions, Quickstart: Verificación de formularios y prompts por fase, Test-first sequence

### Community 83 - "Community 83"
Cohesion: 0.09
Nodes (22): Dependencies & Execution Order, Format: `[ID] [P?] [Story] Description`, Implementation for User Story 1, Implementation for User Story 2, Implementation for User Story 3, Implementation Strategy, Incremental Delivery, MVP First (+14 more)

### Community 84 - "Community 84"
Cohesion: 0.40
Nodes (4): Data Model: Formularios y prompts sincronizados por fase, State transition: prompt synchronization, Task (aggregate existente), Validation rules

### Community 85 - "Community 85"
Cohesion: 0.07
Nodes (26): assistanceConnectionStatusSchema, assistanceModeSchema, assistantMessageStatusSchema, assistantRoleSchema, assistantStateDefaults, AssistantTextPart, assistantTextPartSchema, criterionConfSchema (+18 more)

### Community 86 - "Community 86"
Cohesion: 0.29
Nodes (6): Datos de prueba cubiertos, Evidencia de accesibilidad y foco, Prerrequisitos, Quickstart: Verificar la bitácora de iteraciones guiada, Recorrido manual repetible, Verificación automatizada mínima

### Community 87 - "Community 87"
Cohesion: 0.29
Nodes (6): Decision: conservar las cuatro fases y enriquecer sus datos, Decision: generar prompts de etapa desde una única composición de datos vigente, Decision: modelar criterios como registros estructurados y derivar el resumen final, Decision: preservar la posición de lectura al insertar una iteración, Decision: probar primero dominio, integración y navegador para los comportamientos observables, Research: Bitácora de iteraciones guiada

### Community 88 - "Community 88"
Cohesion: 0.33
Nodes (5): Content Quality, Feature Readiness, Notes, Requirement Completeness, Specification Quality Checklist: Bitácora de iteraciones guiada

### Community 89 - "Community 89"
Cohesion: 0.33
Nodes (5): Alcance, Eventos observables, Invariantes de compatibilidad, Requisitos de accesibilidad, UI Contract: Espacio de trabajo de tarea

### Community 90 - "Community 90"
Cohesion: 0.18
Nodes (24): applyAssistantUpdates(), assignByPath(), AssistantUpdateResult, buildPhaseRevision(), buildPhaseSnapshot(), canContinueByAssistant(), classifyResponseConflict(), classifyUpdateConflict() (+16 more)

### Community 92 - "Community 92"
Cohesion: 0.12
Nodes (20): buildUpdatesFromMessage(), ChatRequest, ChatResponse, chatResponseSchema, EvaluationRequest, EvaluationResponse, evaluationResponseSchema, hasText() (+12 more)

### Community 93 - "Community 93"
Cohesion: 0.12
Nodes (15): ariaStatus, ChatMessage, ChatSendStatus, ChatUpdate, draft, emit, isReady, latestFailedMessage (+7 more)

### Community 94 - "Community 94"
Cohesion: 0.11
Nodes (17): Aggregate verification, Browser, Domain and adapter, Focused verification, Guided usability check, Manual visual check, Persistence and compatibility, Preconditions (+9 more)

### Community 95 - "Community 95"
Cohesion: 0.12
Nodes (16): AssistanceSettings, AssistantMessage, AssistantState, Compatibility strategy, Continue rule, Data Model: Espacio de trabajo guiado por IA, Default, Derived task groups (+8 more)

### Community 96 - "Community 96"
Cohesion: 0.15
Nodes (14): appendEvaluation(), markEvaluationError(), onEvaluationRequest(), onEvaluationRetry(), performEvaluation(), getPhaseInstructionKey(), InstructionKey, PhaseInstruction (+6 more)

### Community 97 - "Community 97"
Cohesion: 0.13
Nodes (15): better-sqlite3, express, nuxt, @nuxt/ui, dependencies, better-sqlite3, express, nuxt (+7 more)

### Community 98 - "Community 98"
Cohesion: 0.24
Nodes (10): close(), closeButtonRef, dialogRef, emit, getFocusableElements(), props, save(), selectedMode (+2 more)

### Community 99 - "Community 99"
Cohesion: 0.20
Nodes (8): completedList, hasActiveTasks, hasCompleted, phases, props, selectedTask, selectedTaskLabel, TaskIndex

### Community 100 - "Community 100"
Cohesion: 0.20
Nodes (9): ChatRequest, ChatResponse, Contract: Workspace Assistant Adapter, Deferred adapter requirements, EvaluationRequest, EvaluationResponse, Interface, Mock behavior (+1 more)

### Community 101 - "Community 101"
Cohesion: 0.20
Nodes (9): Decision: adaptar el dashboard para móvil mediante overlays accesibles, Decision: conservar conversación y evaluaciones dentro de la tarea, Decision: convertir el corpus analítico legacy en instrucciones internas confiables, Decision: integrar Nuxt UI sin copiar las plantillas completas, Decision: mantener el gate determinista como condición obligatoria, Decision: no añadir AI SDK, Vueform ni proveedores al MVP, Decision: usar actualizaciones de formulario tipadas y con control de concurrencia, Decision: versionar evaluaciones mediante una huella canónica de respuestas (+1 more)

### Community 102 - "Community 102"
Cohesion: 0.33
Nodes (8): dedupeById(), fallbackTaskIndex, isRecordLike(), parseRecordSummary(), parseTaskIndex(), parseTaskSummary(), recordSummarySchema, taskSummarySchema

### Community 103 - "Community 103"
Cohesion: 0.25
Nodes (8): assistanceSettingsSchema, assistantMessageSchema, assistantStateSchema, normalizeArray(), phaseEvaluationSchema, repairAssistantState(), repairAssistantStateForTask(), sanitizeAssistanceSettings()

### Community 104 - "Community 104"
Cohesion: 0.22
Nodes (9): dependencies, id, owns, path, purpose, module, additionalProperties, required (+1 more)

### Community 105 - "Community 105"
Cohesion: 0.22
Nodes (8): Chat behavior, Contract: Task Workspace UI, Desktop regions, Evaluation feedback, Guided form behavior, Responsive behavior, Save and navigation, Sidebar behavior

### Community 106 - "Community 106"
Cohesion: 0.36
Nodes (7): emit, onPromptInput(), PromptSaveState, props, regenerate(), save(), statusText

### Community 107 - "Community 107"
Cohesion: 0.25
Nodes (8): from, kind, to, $defs, edge, additionalProperties, required, type

### Community 108 - "Community 108"
Cohesion: 0.33
Nodes (7): items, minLength, type, items, type, uniqueItems, owns

### Community 109 - "Community 109"
Cohesion: 0.53
Nodes (5): escapeRegExp(), hasArrayValue(), packageJson(), readText(), root()

### Community 111 - "Community 111"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 112 - "Community 112"
Cohesion: 0.40
Nodes (5): calls, implements, imports, persists, enum

### Community 113 - "Community 113"
Cohesion: 0.40
Nodes (5): Datos y compatibilidad, Design Decisions, Interacción y guardado, Pruebas y verificación, Reglas y prompts

### Community 114 - "Community 114"
Cohesion: 0.50
Nodes (4): type, uniqueItems, dependencies, type

## Knowledge Gaps
- **678 isolated node(s):** `props`, `filename`, `libraryRecordSchema`, `STORAGE_KEYS`, `LibraryStorage` (+673 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Task` connect `Community 74` to `Community 3`, `Community 5`, `Community 71`, `Community 72`, `Community 90`, `Community 92`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `repairTask()` connect `Community 90` to `Community 3`, `Community 4`, `Community 5`, `Community 103`, `Community 71`, `Community 92`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `scripts` connect `Community 0` to `Community 111`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **What connects `props`, `filename`, `libraryRecordSchema` to the rest of the system?**
  _678 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.10837438423645321 - nodes in this community are weakly interconnected._