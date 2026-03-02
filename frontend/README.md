# Frontend Architecture

Feature-first React + Vite structure, organized for scaling and team collaboration.

## Folder Layout

```text
src/
  app/                    # App root, route wiring, providers composition
  assets/                 # Static images/icons used by UI
  features/               # Domain modules (pages/layouts/components by feature)
    auth/
    admin/
    halladmin/
    public/
    chat/
  shared/                 # Reusable cross-feature modules
    components/
    config/
    context/
    hooks/
    layout/
  index.css
  main.jsx
```

## Conventions

- Keep feature-specific code inside `src/features/<feature-name>/...`.
- Keep only reusable/common logic in `src/shared/...`.
- Route composition lives in `src/app/App.jsx`.
- Avoid adding new files back into legacy roots like `src/pages` or `src/components`.
