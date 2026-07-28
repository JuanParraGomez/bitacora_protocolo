# Graph Report - /var/folders/g7/pfdvkz7909b00p_pyfskx9q00000gp/T/graphify-scope-umdLLP  (2026-07-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1837 nodes · 2417 edges · 152 communities (133 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- scripts
- devDependencies
- properties
- task.schema.ts
- kv-store.repository.ts
- task-store.ts
- properties
- Implementation Plan: Graphify Codebase Memory
- structure-snapshot.schema.json
- LibrarySlideover.vue
- generate-structure.mjs
- optional-provider.service.ts
- Implementation Plan: Evolution-Ready Project Foundation
- graphify-workflow.mjs
- tasks/[id].vue
- tsconfig.json
- files
- reference-content.ts
- graphify-workflow.test.ts
- checksum
- project-store.test.ts
- library/[id].vue
- migration-service.mjs
- pages/index.vue
- create-legacy-fixtures.mjs
- dev-with-graphify.mjs
- fake-graphify.mjs
- library/index.vue
- buildMd
- new.vue
- Task aggregate
- Data Model: Bitácora de iteraciones guiada
- Tasks: Graphify Codebase Memory
- Tasks: Evolution-Ready Project Foundation
- Quickstart: Target Development Workflow
- Research: Evolution-Ready Project Foundation
- Data Model: Graphify Codebase Memory
- Quickstart: Graphify Codebase Memory
- Research: Graphify Codebase Memory
- Graph Workflow Contract
- Verification: Graphify Codebase Memory
- Feature modules
- Branch + GitHub workflow (obligatorio para esta sesión)
- Test-First Traceability Matrix
- example-capability/README.md
- server/README.md
- shared/README.md
- legacy/README.md
- tests/README.md
- RED-BASELINE.md
- US1-GREEN.md
- US2-GREEN.md
- US3-GREEN.md
- US4-GREEN.md
- Tasks: Bitácora de iteraciones guiada
- task-rules.ts
- TaskWorkspace.vue
- Implementation Plan: Bitácora de iteraciones guiada
- GuidedPhaseForm.vue
- Implementation Plan: Espacio de trabajo guiado por IA
- Tasks: Espacio de trabajo guiado por IA
- Implementation Plan: Formularios y prompts sincronizados por fase
- User Scenarios & Testing *(mandatory)*
- guided-iteration-task.ts
- Research: Formularios y prompts sincronizados por fase
- UI Contract: Área de formulario y prompt por fase
- Quickstart: Verificación de formularios y prompts por fase
- Tasks: Formularios y prompts sincronizados por fase
- Data Model: Formularios y prompts sincronizados por fase
- task-assistant.schema.ts
- Quickstart: Verificar la bitácora de iteraciones guiada
- Research: Bitácora de iteraciones guiada
- Specification Quality Checklist: Bitácora de iteraciones guiada
- UI Contract: Espacio de trabajo de tarea
- task-assistant-rules.ts
- emit
- mock-workspace-assistant.ts
- TaskChat.vue
- Quickstart: Espacio de trabajo guiado por IA
- Data Model: Espacio de trabajo guiado por IA
- repairTask
- dependencies
- AssistantSettingsModal.vue
- DashboardSidebar.vue
- Contract: Workspace Assistant Adapter
- Research: Espacio de trabajo guiado por IA
- useTaskIndex.ts
- sanitizeAssistanceSettings
- required
- Contract: Task Workspace UI
- PromptBox.vue
- edge
- owns
- nuxt-ui-setup.test.ts
- guided-workspace.spec.ts
- package.json
- enum
- useWorkspaceState.ts
- dependencies
- phaseSchema
- Tasks: Workspace conversacional de soluciones repetibles
- User Scenarios & Testing *(mandatory)*
- method-evidence.schema.ts
- Data Model: Workspace conversacional de soluciones repetibles
- project-store.ts
- task-deletion.ts
- ExecutionPhase.vue
- task-assistant-rules.test.ts
- Research: Workspace conversacional de soluciones repetibles
- EvaluationFeedback.vue
- Design Decisions
- Quickstart: Workspace conversacional de soluciones repetibles
- StructuredStageSummary.vue
- conversational-workspace-task.ts
- GuidancePhase.vue
- KvStoreRepository
- Contract: Persistent conversational workspace
- contracts/storage.ts
- Task
- database.ts
- Contract: Atomic storage batch
- Contract: Outcome workflow and evidence gates
- Implementation Evidence: Workspace conversacional de soluciones repetibles
- handleSendMessage
- useTaskIndex.test.ts
- Contract: Conversational turn and proposals
- performEvaluation
- buildPhaseRevision
- WorkspaceHeader.vue
- project.schema.ts
- useWorkspaceNotices.ts
- graphify-watch.mjs

## God Nodes (most connected - your core abstractions)
1. `scripts` - 31 edges
2. `repairTask()` - 28 edges
3. `buildPhaseRevision()` - 22 edges
4. `emit` - 18 edges
5. `repairTask()` - 17 edges
6. `Data Model: Workspace conversacional de soluciones repetibles` - 17 edges
7. `currentMethodVersion()` - 15 edges
8. `Task` - 15 edges
9. `Tasks: Workspace conversacional de soluciones repetibles` - 15 edges
10. `Tasks: Evolution-Ready Project Foundation` - 14 edges

## Surprising Connections (you probably didn't know these)
- `useTaskIndex()` --indirect_call--> `refresh()`  [INFERRED]
  app/features/tasks/composables/useTaskIndex.ts → scripts/graphify-watch.mjs
- `withConversation()` --calls--> `buildPhaseRevision()`  [EXTRACTED]
  tests/e2e/conversational-workspace.spec.ts → app/features/tasks/domain/task-assistant-rules.ts
- `seedTypedProposal()` --calls--> `buildPhaseRevision()`  [EXTRACTED]
  tests/e2e/conversational-workspace.spec.ts → app/features/tasks/domain/task-assistant-rules.ts
- `useWorkspaceState()` --indirect_call--> `selectProject()`  [INFERRED]
  app/features/tasks/composables/useWorkspaceState.ts → app/features/tasks/components/DashboardSidebar.vue
- `taskForPhaseOne()` --calls--> `repairTask()`  [EXTRACTED]
  app/features/tasks/domain/task-assistant-rules.test.ts → app/features/tasks/domain/task-rules.ts

## Import Cycles
- None detected.

## Communities (152 total, 19 thin omitted)

### Community 0 - "scripts"
Cohesion: 0.06
Nodes (31): scripts, architecture, architecture:check, build, build:production, db:backup, db:check, dev (+23 more)

### Community 1 - "devDependencies"
Cohesion: 0.15
Nodes (13): dependency-cruiser, devDependencies, dependency-cruiser, @playwright/test, @types/better-sqlite3, typescript, vitest, vue-tsc (+5 more)

### Community 2 - "properties"
Cohesion: 0.22
Nodes (9): properties, minLength, type, type, from, kind, to, minLength (+1 more)

### Community 3 - "task.schema.ts"
Cohesion: 0.06
Nodes (37): AssistantState, automationOpportunitySchema, Criterion, criterionImpactSchema, CriterionImprovement, criterionImprovementSchema, criterionPrioritySchema, criterionResultSchema (+29 more)

### Community 4 - "kv-store.repository.ts"
Cohesion: 0.21
Nodes (9): createKvStoreRepository(), storageBatchOperationObjectSchema, storageBatchOperationSchema, StorageBatchPayload, storageBatchSetValueSchema, storageHealthSchema, storageKeySchema, StorageValueInput (+1 more)

### Community 5 - "task-store.ts"
Cohesion: 0.23
Nodes (10): taskIndexSchema, mapStorageFailure(), normalizeIndex(), normalizeProjectId(), normalizeTaskId(), normalizeTaskPayload(), parseIndexRecord(), StorageClient (+2 more)

### Community 6 - "properties"
Cohesion: 0.20
Nodes (10): pattern, type, properties, pattern, type, id, path, purpose (+2 more)

### Community 7 - "Implementation Plan: Graphify Codebase Memory"
Cohesion: 0.06
Nodes (32): Content Quality, Feature Readiness, Notes, Requirement Completeness, Specification Quality Checklist: Graphify Codebase Memory, AI consultation behavior, Complexity Tracking, Constitution Check (+24 more)

### Community 8 - "structure-snapshot.schema.json"
Cohesion: 0.07
Nodes (27): edges, generatedAt, modules, schemaVersion, sourceHash, additionalProperties, items, type (+19 more)

### Community 9 - "LibrarySlideover.vue"
Cohesion: 0.07
Nodes (33): emit, automationEvidenceLabel, emit, filename, props, resourceKindLabel, close(), emit (+25 more)

### Community 10 - "generate-structure.mjs"
Cohesion: 0.27
Nodes (11): EXCLUDED, generateSnapshot(), moduleFor(), moduleId(), renderMermaid(), SOURCE_EXTENSIONS, sourceFiles(), writeSnapshot() (+3 more)

### Community 11 - "optional-provider.service.ts"
Cohesion: 0.23
Nodes (9): parseOptionalProviderResponse(), Adapter, createOptionalProviderService(), OptionalProviderResponse, OptionalProviderResult, OptionalProviderStatus, optionalProviderConfigSchema, optionalProviderRequestSchema (+1 more)

### Community 12 - "Implementation Plan: Evolution-Ready Project Foundation"
Cohesion: 0.05
Nodes (38): Content Quality, Feature Readiness, Notes, Requirement Completeness, Specification Quality Checklist: Evolution-Ready Project Foundation, Checkpoint 0 — Baseline and recovery, Checkpoint 1 — Nuxt shell with compatibility storage, Checkpoint 2 — Tasks capability (+30 more)

### Community 13 - "graphify-workflow.mjs"
Cohesion: 0.25
Nodes (13): check(), directories, fail(), fingerprint(), generate(), inputs(), metadataPath, outputDir (+5 more)

### Community 14 - "tasks/[id].vue"
Cohesion: 0.06
Nodes (47): activeProjectName, activeWorkspaceProjectId, advance(), canContinue, completeCurrentTask(), composerDraft, createProject(), currentErrors (+39 more)

### Community 15 - "tsconfig.json"
Cohesion: 0.20
Nodes (9): app/**/*.test.ts, ./.nuxt/tsconfig.json, tests/**/*.ts, compilerOptions, allowJs, noEmit, strict, exclude (+1 more)

### Community 16 - "files"
Cohesion: 0.12
Nodes (16): bitacora:index, description, files, bitacora.sqlite, empty.sqlite, historical-assistant-secrets.sqlite, historical-custom-prompts.sqlite, historical-pre-assistant.sqlite (+8 more)

### Community 17 - "reference-content.ts"
Cohesion: 0.48
Nodes (4): escapeText(), REFERENCE_SECTIONS, ReferenceSection, renderReferenceText()

### Community 18 - "graphify-workflow.test.ts"
Cohesion: 0.33
Nodes (3): fake, root, workflow

### Community 19 - "checksum"
Cohesion: 0.70
Nodes (3): backupDatabase(), checksum(), verifyBackup()

### Community 20 - "project-store.test.ts"
Cohesion: 0.29
Nodes (4): createProjectStore(), atomicStorage(), delete(), StoredValues

### Community 21 - "library/[id].vue"
Cohesion: 0.50
Nodes (3): indexResponse, projectsResponse, route

### Community 23 - "pages/index.vue"
Cohesion: 0.14
Nodes (15): activeProject, expandedProjectIds, initialTask, newTaskTarget, persistActiveProject(), {
  projectCollection,
  projectGroups,
  activeProjectId,
  error: indexError,
  refresh: refreshIndex,
}, projectStore, recentTaskForProject() (+7 more)

### Community 36 - "new.vue"
Cohesion: 0.40
Nodes (4): activeProjectId, indexResponse, projectsResponse, route

### Community 46 - "Task aggregate"
Cohesion: 0.10
Nodes (19): ApplicationContract, Architecture metadata, CapabilityModule, Compatibility store, Data Model: Evolution-Ready Project Foundation, ExecutionPhase, GuidancePhase, JournalIndex (+11 more)

### Community 47 - "Data Model: Bitácora de iteraciones guiada"
Cohesion: 0.25
Nodes (8): CriterionImprovement, Data Model: Bitácora de iteraciones guiada, GuidedCriterion, Iteration, ProblemAnalysis, Repair migration rules, State transitions, Task (extensión compatible)

### Community 48 - "Tasks: Graphify Codebase Memory"
Cohesion: 0.10
Nodes (19): Dependencies & Execution Order, Implementation for User Story 1, Implementation for User Story 2, Implementation for User Story 3, Implementation Strategy, Incremental Delivery, MVP First, Non-negotiable Test-First Rule (+11 more)

### Community 49 - "Tasks: Evolution-Ready Project Foundation"
Cohesion: 0.12
Nodes (16): Completion Definition, Dependencies & Execution Order, Format: `[ID] [P?] [Story] Description`, Implementation Strategy, MVP First, Non-negotiable Test-First Rule, Parallel Example: Test-First Work, Phase 1: Complete Test Specification First (Red Suite) (+8 more)

### Community 50 - "Quickstart: Target Development Workflow"
Cohesion: 0.17
Nodes (11): Add a capability, Data safety before a migration checkpoint, FastAPI extraction rule, Initial setup, Prerequisites, Production-parity build, Quickstart: Target Development Workflow, Run locally (+3 more)

### Community 51 - "Research: Evolution-Ready Project Foundation"
Cohesion: 0.20
Nodes (9): Decision 1: Application architecture, Decision 2: Runtime versions, Decision 3: Persistence, Decision 4: Validation and contracts, Decision 5: Testing, Decision 6: Structure graph automation, Decision 7: Future Python service, Decision 8: Deployment (+1 more)

### Community 52 - "Data Model: Graphify Codebase Memory"
Cohesion: 0.25
Nodes (7): Assistant Consultation Rule, Codebase Graph, Data Model: Graphify Codebase Memory, Freshness State, Graph Artifact Set, Graph Scope, Relationships

### Community 53 - "Quickstart: Graphify Codebase Memory"
Cohesion: 0.25
Nodes (7): Generate and consult the graph, Install the development tool, Keep it fresh, Prerequisites, Quickstart: Graphify Codebase Memory, Recovery, Register project-local Codex guidance

### Community 54 - "Research: Graphify Codebase Memory"
Cohesion: 0.25
Nodes (7): Decision 1: Use Graphify-Labs Graphify, not the installed `grapify` npm package, Decision 2: Keep Graphify outside the runtime and production dependency graph, Decision 3: Use project-local Codex guidance plus Graphify's Codex installer, Decision 4: Generate locally, refresh from the normal developer command surface, and verify freshness by fingerprint, Decision 5: Limit inputs and make failures non-blocking for runtime work, Research: Graphify Codebase Memory, Sources

### Community 55 - "Graph Workflow Contract"
Cohesion: 0.29
Nodes (6): Assistant guidance contract, Commands, Freshness metadata, Graph Workflow Contract, Inputs and exclusions, Purpose

### Community 56 - "Verification: Graphify Codebase Memory"
Cohesion: 0.40
Nodes (4): Completed, Known unrelated verification issue, Manual check, Verification: Graphify Codebase Memory

### Community 57 - "Feature modules"
Cohesion: 0.33
Nodes (5): Add a capability, Capability ownership, Current capabilities, Deferred provider removal criteria, Feature modules

### Community 58 - "Branch + GitHub workflow (obligatorio para esta sesión)"
Cohesion: 0.29
Nodes (6): Branch + GitHub workflow (obligatorio para esta sesión), Estado esperado en Git, Flujo recomendado por especificación, Graphify codebase context, Mandatory Test-First Workflow, Regla de seguridad de `main`

### Community 59 - "Test-First Traceability Matrix"
Cohesion: 0.50
Nodes (3): Feature 006: Conversational workspace traceability, Rule, Test-First Traceability Matrix

### Community 70 - "Tasks: Bitácora de iteraciones guiada"
Cohesion: 0.08
Nodes (25): Dependencies and execution order, Format: `[ID] [P?] [Story] Description`, Implementation for User Story 1, Implementation for User Story 2, Implementation for User Story 3, Implementation for User Story 4, Implementation strategy, Incremental delivery (+17 more)

### Community 71 - "task-rules.ts"
Cohesion: 0.06
Nodes (58): activeMethodVersion, activeOpportunities, emit, methodMaturity, methodSummary, props, syncImprovements(), task (+50 more)

### Community 72 - "TaskWorkspace.vue"
Cohesion: 0.03
Nodes (56): activeProject, assistanceSettings, canContinue, chatError, chatSendState, chatSuggestions, ChatUpdateStatus, conversationContext (+48 more)

### Community 73 - "Implementation Plan: Bitácora de iteraciones guiada"
Cohesion: 0.29
Nodes (7): Constitution Check, Documentation (this feature), Implementation Plan: Bitácora de iteraciones guiada, Project Structure, Source Code (repository root), Summary, Technical Context

### Community 74 - "GuidedPhaseForm.vue"
Cohesion: 0.17
Nodes (15): canContinue, canGoBack, continueMessage, currentPhaseInstruction, emit, onBack(), onContinue(), onDirtyPayload() (+7 more)

### Community 75 - "Implementation Plan: Espacio de trabajo guiado por IA"
Cohesion: 0.06
Nodes (29): Content Quality, Feature Readiness, Notes, Requirement Completeness, Specification Quality Checklist: Espacio de trabajo guiado por IA, Complexity Tracking, Constitution Check, Documentation (this feature) (+21 more)

### Community 76 - "Tasks: Espacio de trabajo guiado por IA"
Cohesion: 0.07
Nodes (29): Commit Boundaries, Dependencies & Execution Order, Format: `[ID] [P?] [Story] Description`, Implementation for User Story 1, Implementation for User Story 2, Implementation for User Story 3, Implementation for User Story 4, Implementation Strategy (+21 more)

### Community 77 - "Implementation Plan: Formularios y prompts sincronizados por fase"
Cohesion: 0.07
Nodes (25): Content Quality, Feature Readiness, Notes, Requirement Completeness, Specification Quality Checklist: Formularios y prompts sincronizados por fase, Complexity Tracking, Constitution Check, Documentation (this feature) (+17 more)

### Community 78 - "User Scenarios & Testing *(mandatory)*"
Cohesion: 0.15
Nodes (13): Assumptions, Edge Cases, Feature Specification: Bitácora de iteraciones guiada, Functional Requirements, Key Entities, Measurable Outcomes, Requirements *(mandatory)*, Success Criteria *(mandatory)* (+5 more)

### Community 80 - "Research: Formularios y prompts sincronizados por fase"
Cohesion: 0.29
Nodes (6): Decision: componente reutilizable de distribución de fase, con diseño responsive por CSS, Decision: conservar el agregado `Task` y sus cuatro objetos de fase, Decision: distinguir prompt automático y prompt personalizado con la marca persistida existente, Decision: pruebas rojas primero en dominio, persistencia y navegador, Decision: una función de composición por etapa y observación local del formulario, Research: Formularios y prompts sincronizados por fase

### Community 81 - "UI Contract: Área de formulario y prompt por fase"
Cohesion: 0.33
Nodes (5): Accessibility requirements, Non-goals, Required interaction contract, Scope, UI Contract: Área de formulario y prompt por fase

### Community 82 - "Quickstart: Verificación de formularios y prompts por fase"
Cohesion: 0.33
Nodes (5): Compatibility verification, Manual browser verification, Preconditions, Quickstart: Verificación de formularios y prompts por fase, Test-first sequence

### Community 83 - "Tasks: Formularios y prompts sincronizados por fase"
Cohesion: 0.09
Nodes (22): Dependencies & Execution Order, Format: `[ID] [P?] [Story] Description`, Implementation for User Story 1, Implementation for User Story 2, Implementation for User Story 3, Implementation Strategy, Incremental Delivery, MVP First (+14 more)

### Community 84 - "Data Model: Formularios y prompts sincronizados por fase"
Cohesion: 0.40
Nodes (4): Data Model: Formularios y prompts sincronizados por fase, State transition: prompt synchronization, Task (aggregate existente), Validation rules

### Community 85 - "task-assistant.schema.ts"
Cohesion: 0.06
Nodes (40): assistanceConnectionStatusSchema, assistanceModeSchema, assistanceSettingsSchema, assistantMessageSchema, assistantMessageStatusSchema, assistantRoleSchema, assistantStateDefaults, assistantStateSchema (+32 more)

### Community 86 - "Quickstart: Verificar la bitácora de iteraciones guiada"
Cohesion: 0.29
Nodes (6): Datos de prueba cubiertos, Evidencia de accesibilidad y foco, Prerrequisitos, Quickstart: Verificar la bitácora de iteraciones guiada, Recorrido manual repetible, Verificación automatizada mínima

### Community 87 - "Research: Bitácora de iteraciones guiada"
Cohesion: 0.29
Nodes (6): Decision: conservar las cuatro fases y enriquecer sus datos, Decision: generar prompts de etapa desde una única composición de datos vigente, Decision: modelar criterios como registros estructurados y derivar el resumen final, Decision: preservar la posición de lectura al insertar una iteración, Decision: probar primero dominio, integración y navegador para los comportamientos observables, Research: Bitácora de iteraciones guiada

### Community 88 - "Specification Quality Checklist: Bitácora de iteraciones guiada"
Cohesion: 0.33
Nodes (5): Content Quality, Feature Readiness, Notes, Requirement Completeness, Specification Quality Checklist: Bitácora de iteraciones guiada

### Community 89 - "UI Contract: Espacio de trabajo de tarea"
Cohesion: 0.33
Nodes (5): Alcance, Eventos observables, Invariantes de compatibilidad, Requisitos de accesibilidad, UI Contract: Espacio de trabajo de tarea

### Community 90 - "task-assistant-rules.ts"
Cohesion: 0.13
Nodes (23): applyAssistantResponse(), handleProposalDecision(), applyAssistantUpdates(), applyExplicitProposalDecision(), asApplied(), asConflict(), asRejected(), assignByPath() (+15 more)

### Community 91 - "emit"
Cohesion: 0.13
Nodes (15): closeSettings(), emit, onRequestBack(), onRequestContinue(), onSelectProject(), onSelectTask(), onTaskDirty(), onTaskSave() (+7 more)

### Community 92 - "mock-workspace-assistant.ts"
Cohesion: 0.09
Nodes (31): assistantTurnSchema, Contradiction, buildGapValue(), buildPrimaryQuestion(), buildUpdatesFromMessage(), ChatRequest, ChatResponse, deterministicId() (+23 more)

### Community 93 - "TaskChat.vue"
Cohesion: 0.08
Nodes (26): ariaStatus, ChatMessage, ChatSendStatus, ChatUpdate, decide(), draft, emit, internalDraft (+18 more)

### Community 94 - "Quickstart: Espacio de trabajo guiado por IA"
Cohesion: 0.11
Nodes (17): Aggregate verification, Browser, Domain and adapter, Focused verification, Guided usability check, Manual visual check, Persistence and compatibility, Preconditions (+9 more)

### Community 95 - "Data Model: Espacio de trabajo guiado por IA"
Cohesion: 0.12
Nodes (16): AssistanceSettings, AssistantMessage, AssistantState, Compatibility strategy, Continue rule, Data Model: Espacio de trabajo guiado por IA, Default, Derived task groups (+8 more)

### Community 96 - "repairTask"
Cohesion: 0.23
Nodes (10): hashForValue(), repairTask(), buildTaskSnapshot(), buildWorkspaceTask(), ProjectSeed, seedConversationalTask(), seedTypedProposal(), seedWorkspace() (+2 more)

### Community 97 - "dependencies"
Cohesion: 0.13
Nodes (15): better-sqlite3, express, nuxt, @nuxt/ui, dependencies, better-sqlite3, express, nuxt (+7 more)

### Community 98 - "AssistantSettingsModal.vue"
Cohesion: 0.21
Nodes (12): close(), closeButtonRef, dialogRef, emit, getFocusableElements(), onDocumentKeydown(), props, save() (+4 more)

### Community 99 - "DashboardSidebar.vue"
Cohesion: 0.05
Nodes (43): activeGroups, archivedGroups, createProjectName, createProjectOpen, effectiveSearch, emit, isExpanded(), localSearch (+35 more)

### Community 100 - "Contract: Workspace Assistant Adapter"
Cohesion: 0.20
Nodes (9): ChatRequest, ChatResponse, Contract: Workspace Assistant Adapter, Deferred adapter requirements, EvaluationRequest, EvaluationResponse, Interface, Mock behavior (+1 more)

### Community 101 - "Research: Espacio de trabajo guiado por IA"
Cohesion: 0.20
Nodes (9): Decision: adaptar el dashboard para móvil mediante overlays accesibles, Decision: conservar conversación y evaluaciones dentro de la tarea, Decision: convertir el corpus analítico legacy en instrucciones internas confiables, Decision: integrar Nuxt UI sin copiar las plantillas completas, Decision: mantener el gate determinista como condición obligatoria, Decision: no añadir AI SDK, Vueform ni proveedores al MVP, Decision: usar actualizaciones de formulario tipadas y con control de concurrencia, Decision: versionar evaluaciones mediante una huella canónica de respuestas (+1 more)

### Community 102 - "useTaskIndex.ts"
Cohesion: 0.15
Nodes (19): alignIndexToProjects(), createLegacyProject(), dedupeById(), fallbackProjectCollection(), fallbackTaskIndex, isMissingStorageKey(), isRecordLike(), normalizedProjectIdSchema (+11 more)

### Community 103 - "sanitizeAssistanceSettings"
Cohesion: 0.67
Nodes (3): loadAssistanceSettings(), sanitizeAssistanceSettings(), saveAssistanceSettings()

### Community 104 - "required"
Cohesion: 0.22
Nodes (9): dependencies, id, owns, path, purpose, module, additionalProperties, required (+1 more)

### Community 105 - "Contract: Task Workspace UI"
Cohesion: 0.22
Nodes (8): Chat behavior, Contract: Task Workspace UI, Desktop regions, Evaluation feedback, Guided form behavior, Responsive behavior, Save and navigation, Sidebar behavior

### Community 106 - "PromptBox.vue"
Cohesion: 0.36
Nodes (7): emit, onPromptInput(), PromptSaveState, props, regenerate(), save(), statusText

### Community 107 - "edge"
Cohesion: 0.25
Nodes (8): from, kind, to, $defs, edge, additionalProperties, required, type

### Community 108 - "owns"
Cohesion: 0.33
Nodes (7): items, minLength, type, items, type, uniqueItems, owns

### Community 109 - "nuxt-ui-setup.test.ts"
Cohesion: 0.53
Nodes (5): escapeRegExp(), hasArrayValue(), packageJson(), readText(), root()

### Community 111 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 112 - "enum"
Cohesion: 0.40
Nodes (5): calls, implements, imports, persists, enum

### Community 113 - "useWorkspaceState.ts"
Cohesion: 0.13
Nodes (18): isOverlayState(), isRecord(), isSummaryState(), nonEmptyString(), OVERLAY_STATES, readStoredState(), StoredWorkspaceState, SUMMARY_STATES (+10 more)

### Community 114 - "dependencies"
Cohesion: 0.50
Nodes (4): type, uniqueItems, dependencies, type

### Community 117 - "Tasks: Workspace conversacional de soluciones repetibles"
Cohesion: 0.06
Nodes (35): Dependencies and execution order, Format: `[ID] [P?] [Story] Description`, Implementation, Implementation, Implementation, Implementation, Implementation, Implementation strategy (+27 more)

### Community 118 - "User Scenarios & Testing *(mandatory)*"
Cohesion: 0.06
Nodes (31): Content Quality, Feature Readiness, Notes, Requirement Completeness, Specification Quality Checklist: Workspace conversacional de soluciones repetibles, Complexity Tracking, Constitution Check, Documentation (this feature) (+23 more)

### Community 119 - "method-evidence.schema.ts"
Cohesion: 0.09
Nodes (24): AutomationOpportunity, AutomationOpportunityClassification, automationOpportunityClassificationSchema, automationOpportunitySchema, CriterionResult, criterionResultSchema, evidenceKindSchema, EvidenceReference (+16 more)

### Community 120 - "Data Model: Workspace conversacional de soluciones repetibles"
Cohesion: 0.10
Nodes (19): Atomic operations, AutomationOpportunity, Compatibility strategy, Data Model: Workspace conversacional de soluciones repetibles, DerivedResultMaturity, EvidenceReference, ExecutionIteration, FormUpdate (+11 more)

### Community 121 - "project-store.ts"
Cohesion: 0.18
Nodes (7): Project, invalidStoredValue(), MoveTaskResult, parseMoveIndex(), parseMoveTask(), ProjectStore, StorageClient

### Community 122 - "task-deletion.ts"
Cohesion: 0.22
Nodes (9): buildNextIndex(), deleteTask(), FALLBACK_INDEX, LegacyStorage, parseIndex(), runBatch(), TaskIndex, batch() (+1 more)

### Community 123 - "ExecutionPhase.vue"
Cohesion: 0.22
Nodes (13): appendIteration(), emit, getApplicableConditionRows(), getIterationEvidence(), getSuccessCriteriaRows(), iterationRefs, joinTextLines(), normalizeTextLines() (+5 more)

### Community 124 - "task-assistant-rules.test.ts"
Cohesion: 0.12
Nodes (18): InstructionKey, PhaseInstruction, phaseInstructions, canContinueByAssistant(), getLatestCurrentEvaluation(), isEvaluationCurrent(), isGateOpen(), decideAssistantProposals (+10 more)

### Community 125 - "Research: Workspace conversacional de soluciones repetibles"
Cohesion: 0.14
Nodes (13): Decision: automatización como hipótesis o candidato con evidencia, Decision: composición en página para respetar límites de features, Decision: compuertas `outcome-v2`, Decision: conservar deep links sin desmontar el shell, Decision: conversación como superficie principal, sin tercera columna permanente, Decision: escritura batch transaccional dentro del runtime existente, Decision: evolucionar `f1`–`f4` como única fuente de verdad, Decision: no añadir dependencias ni proveedor (+5 more)

### Community 126 - "EvaluationFeedback.vue"
Cohesion: 0.18
Nodes (11): emit, EvaluationStatus, hasEvaluationHistory, hasRetryAction, onRetry(), props, sortedEvaluationHistory, status (+3 more)

### Community 127 - "Design Decisions"
Cohesion: 0.40
Nodes (5): Datos y compatibilidad, Design Decisions, Interacción y guardado, Pruebas y verificación, Reglas y prompts

### Community 129 - "Quickstart: Workspace conversacional de soluciones repetibles"
Cohesion: 0.15
Nodes (12): Actual outcomes on Tuesday, July 28, 2026, Aggregate gates, Conversational workspace, Focused verification, Library reuse, Mandatory red-green sequence, Migration checkpoints, Preconditions (+4 more)

### Community 130 - "StructuredStageSummary.vue"
Cohesion: 0.14
Nodes (12): contradictions, currentMessages, emit, isExpanded, isUseful, phase, phaseLabel, primaryQuestion (+4 more)

### Community 131 - "conversational-workspace-task.ts"
Cohesion: 0.31
Nodes (10): AutomationCandidateFixture, buildAutomationCandidate(), buildConversationalProject(), buildExecutionIteration(), buildMethodVersion(), ConversationalProjectFixture, ExecutionIterationFixture, MethodVersionFixture (+2 more)

### Community 132 - "GuidancePhase.vue"
Cohesion: 0.25
Nodes (7): addCriterion(), emit, openQuestionRows, props, riskRows, subproblemRows, task

### Community 133 - "KvStoreRepository"
Cohesion: 0.24
Nodes (3): KvStoreRepository, StorageHealth, StorageRow

### Community 134 - "Contract: Persistent conversational workspace"
Cohesion: 0.22
Nodes (8): Accessibility and safety, Context restoration, Contract: Persistent conversational workspace, Desktop composition, Overlay taxonomy, Responsive composition, Route compatibility, Structured summary states

### Community 135 - "contracts/storage.ts"
Cohesion: 0.16
Nodes (13): runStorageBatch(), StorageBatchRepository, BATCH_ALLOWED_EXACT_KEYS, isBatchAllowedKey(), StorageBatchOperation, StorageBatchOperationType, StorageBatchPayload, StorageCompatibilityError (+5 more)

### Community 136 - "Task"
Cohesion: 0.29
Nodes (5): actorRows, emit, props, task, Task

### Community 137 - "database.ts"
Cohesion: 0.48
Nodes (4): DatabaseOptions, openDatabase(), probeDatabase(), resolveDatabasePath()

### Community 138 - "Contract: Atomic storage batch"
Cohesion: 0.29
Nodes (6): Compatibility, Contract: Atomic storage batch, Endpoint, Failure, Request, Success

### Community 139 - "Contract: Outcome workflow and evidence gates"
Cohesion: 0.29
Nodes (6): Automation evidence, Contract: Outcome workflow and evidence gates, Legacy mapping, Method maturity, Stage labels, Stage state

### Community 140 - "Implementation Evidence: Workspace conversacional de soluciones repetibles"
Cohesion: 0.15
Nodes (12): Human-only criteria, Implementation Evidence: Workspace conversacional de soluciones repetibles, Phase 1: Setup and test harness, Phase 2: Foundational storage, schemas and migration (in progress), Phase 3: User Story 1 - Convertir un problema en método repetible, Phase 4 independent-review corrections, Phase 4: User Story 2 - Responder conversando y confirmar de forma simple, Phase 5 independent-review corrections (+4 more)

### Community 141 - "handleSendMessage"
Cohesion: 0.33
Nodes (6): cloneTask(), handleSendMessage(), onChatRetry(), onChatSubmit(), readTextFromMessage(), setUserMessageStatus()

### Community 143 - "useTaskIndex.test.ts"
Cohesion: 0.40
Nodes (4): StorageResponse, storageUrl(), stubStorage(), STORAGE_KEYS

### Community 144 - "Contract: Conversational turn and proposals"
Cohesion: 0.33
Nodes (5): Contract: Conversational turn and proposals, Failure and recovery, Proposal decision, Request, Response

### Community 145 - "performEvaluation"
Cohesion: 0.33
Nodes (6): appendEvaluation(), markEvaluationError(), onEvaluationRequest(), onEvaluationRetry(), performEvaluation(), getPhaseInstructionKey()

### Community 146 - "buildPhaseRevision"
Cohesion: 0.24
Nodes (11): buildPhaseRevision(), classifyResponseConflict(), classifyUpdateConflict(), hashSnapshot(), isAllowedPhaseFieldPath(), validateUpdateForTask(), createMockWorkspaceAssistant(), MockWorkspaceAdapterOptions (+3 more)

### Community 147 - "WorkspaceHeader.vue"
Cohesion: 0.40
Nodes (3): emit, navigationButton, props

### Community 151 - "project.schema.ts"
Cohesion: 0.25
Nodes (9): createLegacyProject(), normalizeProjectCandidate(), projectCollectionSchema, projectDescriptionSchema, projectIdSchema, projectSchema, projectStatusSchema, repairProjectCollection() (+1 more)

### Community 152 - "useWorkspaceNotices.ts"
Cohesion: 0.40
Nodes (3): emit, WorkspaceNotice, WorkspaceNoticeTone

### Community 153 - "graphify-watch.mjs"
Cohesion: 0.60
Nodes (4): onChange(), refresh(), schedule(), watched

## Knowledge Gaps
- **988 isolated node(s):** `emit`, `props`, `emit`, `filename`, `resourceKindLabel` (+983 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `KvStoreRepository` connect `KvStoreRepository` to `database.ts`, `kv-store.repository.ts`, `task-rules.ts`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `repairTask()` connect `repairTask` to `task.schema.ts`, `task-store.ts`, `task-rules.ts`, `mock-workspace-assistant.ts`, `buildPhaseRevision`, `task-assistant.schema.ts`, `task-assistant-rules.ts`, `task-assistant-rules.test.ts`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `Task` connect `Task` to `repairTask`, `StructuredStageSummary.vue`, `task.schema.ts`, `GuidancePhase.vue`, `task-store.ts`, `task-rules.ts`, `TaskWorkspace.vue`, `GuidedPhaseForm.vue`, `task-assistant-rules.ts`, `ExecutionPhase.vue`, `mock-workspace-assistant.ts`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `emit`, `props`, `emit` to the rest of the system?**
  _988 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `task.schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.059379217273954114 - nodes in this community are weakly interconnected._
- **Should `Implementation Plan: Graphify Codebase Memory` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._