# Steady — CLAUDE.md

App móvel iOS/Android de tracking de medicamentos GLP-1 (Ozempic / Mounjaro) com motor farmacocinético.

---

## Caminhos

| Local | Path |
|---|---|
| Código activo (SSD) | `/Users/arkadiann/Documents/steady-mvp V1.5/` |
| GitHub | `https://github.com/akisitor3/Steady` (branch `main`) |
| Brain Vault | `/Volumes/KHONSHU/Brain/Steady/` |

---

## Stack

- Expo SDK 52 · React Native 0.76 · TypeScript
- SQLite on-device (`expo-sqlite`) · Zustand · `react-native-gifted-charts`
- Design system: `premium` (typeui.sh) — teal `#0F6E56`, Inter

---

## Estrutura de ficheiros

```
app/
  _layout.tsx              — root layout
  (tabs)/
    _layout.tsx            — tab navigator (3 tabs activas)
    index.tsx              — ecrã Doses (hero card PK + gráfico)
    weight.tsx             — ecrã Peso
    more.tsx               — ecrã Mais (seletor medicamento)
components/
  BodyLevelChart.tsx       — gráfico de linha gifted-charts
lib/
  pk/
    engine.ts              — motor farmacocinético Q(t) = Q₀ × 0.5^(t/5)
    medications.ts         — lista de medicamentos GLP-1
  db/                      — SQLite helpers
  store/                   — Zustand stores
constants/
  theme.ts                 — design tokens (cores, tipografia, sombras premium)
```

---

## Identidade Visual

Inspiração: **Apple** — branco, espaço, precisão, tipografia Inter.

| Token | Valor |
|---|---|
| Cor primária | `#0F6E56` (teal) — **substitui o `#3B82F6` da skill premium** |
| Cor clara | `#1D9E75` |
| Cor escura | `#0A5240` |
| Gradiente hero | `linear-gradient(145deg, #1D9E75, #0F6E56, #0A5240)` |
| Sombra | dupla teal — `rgba(15,110,86,0.34)` + `rgba(15,110,86,0.20)` |
| Tipografia | Inter — escala 12/14/16/18/24/30/36 |
| Surface | `#FFFFFF` · Background: `#F5F5F7` |

---

## Skills de design (obrigatório para qualquer trabalho de UI)

Antes de qualquer tarefa de UI/UX, ler SEMPRE por esta ordem:
1. `.claude/skills/design-system/SKILL.md` — sistema visual premium do Steady
2. Secção **Identidade Visual** acima — cores e tokens do Steady

---

## Segurança (obrigatório antes de commit / push / deploy)

Antes de qualquer `git commit`, `git push` ou deploy, correr **sempre** a skill `vibe-security`.
Só avançar se não houver findings críticos ou altos por resolver.

---

## Regras de trabalho

1. **Fonte de verdade: GitHub.** Trabalhar sempre a partir do clone de `https://github.com/akisitor3/Steady` (branch `main`). Antes de qualquer sessão, fazer `git pull` para garantir que o código local está actualizado.
2. **Design system:** cor primária é `#0F6E56` (override do `#3B82F6` da skill premium). Usar gradiente `linear-gradient(145deg, #1D9E75, #0F6E56, #0A5240)`.
3. Após cada commit: actualizar `/Volumes/KHONSHU/Brain/Steady/LAST_SESSION.md` + `lessons/` + `todo.md`.
4. Mockups de referência: `preview-dashboard.html` e `preview-mood-diary.html` na raiz do projecto.
5. Emulador Android: `Serral_Pixel_8_API_35`. Correr com `npx expo start --android`.

---

## Motor PK (farmacocinética)

- Fórmula: `Q(t) = Q₀ × 0.5^(t/t½)` onde `t½ = 5 dias` (Tirzepatida)
- `Q₀ = 7.9 mg` (acumulação steady state após 4 semanas com dose 5 mg/semana)
- Ficheiro: `lib/pk/engine.ts` — função `bodyLevel()` já implementada
- Próxima dose = residual + 5.0 mg

---

## Ecrãs existentes

| Ecrã | Ficheiro | Estado |
|---|---|---|
| Doses | `app/(tabs)/index.tsx` | ✅ Completo (hero card + gráfico sawtooth) |
| Peso | `app/(tabs)/weight.tsx` | ✅ Completo |
| Mais | `app/(tabs)/more.tsx` | ✅ Completo (seletor medicamento) |
| Comida | `app/(tabs)/food.tsx` | ❌ Não existe — mockup HTML feito |

---

## Próximos passos (ver Brain/Steady/todo.md para detalhe)

1. **[PRIORITY HIGH]** Criar `app/(tabs)/food.tsx` — UI food tracking baseada no `preview-dashboard.html`
2. **[PRIORITY HIGH]** Testar no emulador `Serral_Pixel_8_API_35`
3. **[PRIORITY MEDIUM]** Gráfico G2 intra-semana — `components/IntraWeekChart.tsx`
4. **[PRIORITY MEDIUM]** Cards `BioResposta.tsx` + `VFCGauge.tsx`
5. **[PRIORITY LOW]** Integração Apple Health / WHOOP

---

## Início de sessão

**NÃO activar brainstorming no arranque.** Ler o estado do projecto é suficiente — não é uma tarefa criativa nova.

Executar por esta ordem:
1. Carregar skill `karpathy-guidelines`
2. Ler `/Volumes/KHONSHU/Brain/Steady/LAST_SESSION.md` — estado real da última sessão
3. Ler `/Volumes/KHONSHU/Brain/Steady/todo.md` — tarefas activas e próximos passos
4. Resumir o estado ao utilizador em 3–4 linhas e aguardar instrução

## Fecho de sessão

Actualizar **todos** os ficheiros abaixo antes de terminar:

### 1. LAST_SESSION.md
Caminho: `/Volumes/KHONSHU/Brain/Steady/LAST_SESSION.md`
- Tabela de commits (hash → descrição)
- O que foi feito (por tópico)
- Descobertas importantes
- Próximos passos concretos

### 2. Handoff
Caminho: `/Volumes/KHONSHU/Brain/Steady/handoffs/YYYY-MM-DD__topico.md`
- Usar o template em `/Volumes/KHONSHU/Brain/Steady/handoffs/TEMPLATE.md`
- Nunca usar formato livre

### 3. Lesson (se aplicável)
Caminho: `/Volumes/KHONSHU/Brain/Steady/lessons/LESSON-[AREA]-[NNN].md`
- Criar uma lesson por cada erro, decisão técnica relevante ou padrão aprendido
- Usar o template em `/Volumes/KHONSHU/Brain/Steady/lessons/TEMPLATE.md`

### 4. todo.md
Caminho: `/Volumes/KHONSHU/Brain/Steady/todo.md`
- Usar o template em `/Volumes/KHONSHU/Brain/Steady/TEMPLATE-todo.md`
- Mover tarefas concluídas para a secção Done
- Adicionar tarefas novas descobertas durante a sessão
- Actualizar status e Next Action das tarefas em curso
