# Example capability

This deliberately small capability documents the ownership contract for adding a future feature.

- **Owner:** the capability directory under `app/features/example-capability`.
- **Allowed dependencies:** presentation-neutral code from `shared` and public application contracts.
- **Forbidden dependencies:** private internals from `tasks`, `library`, or `reference`, and server-only modules.
- **Removal path:** delete this directory and its traceability entry; the core task workflow must remain green.

Replace this example with a real capability only when its behavior has a test-first specification.
