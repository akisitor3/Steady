# Steady — Wiki do Projeto

> App móvel iOS/Android — tracker de medicamentos **GLP-1** (Ozempic/Mounjaro) com **motor farmacocinético**.
>
> Fonte de verdade local compilada do Brain (`/Volumes/KHONSHU/Brain/Steady/`), que é o arquivo histórico master.

---

## 📋 Índice Rápido
- [Arquitetura](./ARCHITECTURE.md)
- [Tarefas Atuais](./TODO.md)
- [Lições Aprendidas](./LESSONS.md)
- [Índice de Handoffs](./HANDOFFS_INDEX.md)

---

## 🎯 Estado Actual
**Código activo:** `~/Documents/steady-mvp V1.5/` · **Arquivo:** `/Volumes/KHONSHU/Steady/`
**Repo:** `https://github.com/akisitor3/Steady` (branch `main`)
**Stack:** Expo SDK 52 · React Native 0.76 · TypeScript · **Expo Router** (`app/(tabs)`) · SQLite on-device (`expo-sqlite`) · Zustand · `react-native-gifted-charts` · `expo-linear-gradient`
**Design system:** `premium` (typeui.sh) — teal **`#0F6E56`**, fonte **Inter**

### Ecrãs
- **Doses** — hero card countdown + gráfico + registo de injeção
- **Peso** — registo + histórico com delta
- **Mais** — seletor de medicamento + coming soon

### Próximo
**Food Tracking** (prioridade imediata) — ver [TODO.md](./TODO.md).

---

## ⚠️ Regra crítica
**NUNCA instalar `node_modules` em disco externo** (LESSON-DEPLOY-001) — trabalhar sempre em `~/Documents/steady-mvp V1.5/`, nunca em `/Volumes/KHONSHU/Steady/`.

---

## 🎨 UI / Design
- Carregar **sempre** as skills `premium` + design-system **antes** de qualquer ecrã/UI.
- Tokens: teal `#0F6E56`, Inter; SVG usa tokens `Font.*` (não `fontFamily="Inter"` literal — quebra no Android).
- Após implementar UI: **abrir o mockup HTML no browser** para validar.
- Hero verde escuro → `StatusBar style="light"`; gradientes via `expo-linear-gradient` (não `react-native-linear-gradient`).

---

## 🧠 Lições Críticas
| # | Lição |
|---|-------|
| DEPLOY-001 | Nunca `node_modules` em disco externo → trabalhar em `~/Documents/steady-mvp V1.5/` |
| — | SVG `fontFamily` deve usar tokens `Font.*`, não string `"Inter"` (compat Android) |
| — | `expo-linear-gradient` (não `react-native-linear-gradient`); Inter via `useFonts`+`SplashScreen` em `_layout.tsx` |

Ver [LESSONS.md](./LESSONS.md) (índice; completo no Brain).

---

## 📜 Handoffs Recentes
- `2026-05-24__home-screen-premium-design`
Ver [HANDOFFS_INDEX.md](./HANDOFFS_INDEX.md).

---

## 🔗 Ligações
- **Brain master:** `/Volumes/KHONSHU/Brain/Steady/`
- **GitHub:** `https://github.com/akisitor3/Steady`

---

## 📝 Manutenção
- Início de sessão: ler este wiki + Brain `LAST_SESSION`. Fecho: actualizar **os dois wikis** (repo `docs/` + Brain).
