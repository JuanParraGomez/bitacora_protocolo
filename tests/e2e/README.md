# Pruebas visuales del workspace

La suite visual de spec 010 verifica los seis estados canónicos del workspace
en cuatro viewports: 1440×900, 1024×768, 390×844 y 320px. La ejecución es
serial porque los fixtures usan el mismo almacenamiento local de pruebas.

## Verificar baselines existentes

```bash
TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual
```

`test:visual` nunca actualiza baselines. Comprueba las capturas versionadas,
las invariantes geométricas, la acción primaria y los reportes de contraste.
Si el servidor ya está levantado en otro puerto, usa ese valor en
`TEST_BASE_URL`.

## Generar o actualizar baselines

Solo una decisión explícita de revisión puede generar o actualizar snapshots:

```bash
TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual:update
```

El comando escribe los snapshots Playwright en
`tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/` y los
artefactos de captura en
`specs/010-visual-testing-infra/evidence/actual/` con la convención
`ACTUAL-IMG-UX-XX-<viewport>.png`.

## Aprobar cambios

En un pull request:

1. Ejecuta primero `npm run test:visual` sin actualizar snapshots.
2. Revisa cada diff de snapshot y el artefacto `ACTUAL-*` correspondiente.
3. Compara el estado contra la matriz Capa C en
   `specs/010-visual-testing-infra/evidence/visual-comparison.md`.
4. Solo si el cambio visual está aprobado, ejecuta el comando `--update-snapshots`
   y revisa los archivos generados en el mismo diff.

El mockup nunca es baseline: las imágenes de `docs/ux-ui/mockups/rediseño-agente/`
son referencias generadas por IA. La aceptación contra esas referencias es
documental (Capa C), no una comparación automática de píxeles.

## Alcance de contraste

La suite reporta `color-contrast` para texto y una auditoría explícita 3:1 para
componentes visibles. Las violaciones del estado actual se reportan, pero no
bloquean esta infraestructura; su corrección pertenece a las specs 011–016.
