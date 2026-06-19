# Lições Aprendidas — Steady

> Índice operacional. Completo no Brain: `/Volumes/KHONSHU/Brain/Steady/lessons/` + `lessons.md`.

## ⭐ Críticas
- **DEPLOY-001** — Nunca instalar `node_modules` em disco externo (`/Volumes/...`); trabalhar sempre no SSD interno (`~/Documents/steady-mvp V1.5/`).
- **SVG fontFamily** — usar tokens `Font.*`, não string `"Inter, sans-serif"` (quebra a renderização no Android).
- **Gradientes/fonts** — `expo-linear-gradient` (não `react-native-linear-gradient`); Inter via `useFonts` + `SplashScreen` em `_layout.tsx`; `StatusBar style="light"` sobre hero verde escuro.
- **UI** — carregar skills `premium` + design-system **antes** de qualquer ecrã; abrir mockup no browser para validar.

> Consultar a pasta `Brain/Steady/lessons/` antes de diagnosticar erros do zero.
