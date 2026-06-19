# Arquitetura — Steady

> Resumo operacional. Arquivo histórico no Brain: `/Volumes/KHONSHU/Brain/Steady/`.

## Stack
| Camada | Tecnologia |
|--------|------------|
| Framework | Expo SDK 52 · React Native 0.76 · TypeScript |
| Navegação | Expo Router (`app/(tabs)`, `_layout.tsx`) |
| Estado | Zustand |
| Persistência | SQLite on-device (`expo-sqlite`) |
| Gráficos | `react-native-gifted-charts` |
| UI | `expo-linear-gradient` · fonte Inter (`useFonts`) · design `premium` (teal `#0F6E56`) |
| Domínio | Motor **farmacocinético** (curva de concentração GLP-1) |

## Estrutura
```
steady-mvp V1.5/
├── app/                 ← Expo Router
│   ├── _layout.tsx      ← fonts (Inter via useFonts + SplashScreen), providers
│   └── (tabs)/          ← Doses, Peso, Mais
├── src/                 ← componentes, stores (Zustand), db (SQLite), motor PK
└── docs/                ← este wiki
```

## Padrões / Regras
- **node_modules só no SSD interno** (`~/Documents/steady-mvp V1.5/`), nunca em disco externo (LESSON-DEPLOY-001).
- **SVG fontFamily** → tokens `Font.*`, não string `"Inter, sans-serif"` (quebra no Android).
- **Gradientes** → `expo-linear-gradient`. **StatusBar** `light` sobre hero verde.
- **Fonts** carregadas em `_layout.tsx` (`useFonts` + `SplashScreen.preventAutoHideAsync`).
- **UI:** carregar skills `premium` + design-system antes de codar; validar mockup no browser.

## Domínio — Motor PK
Tracker de GLP-1 (Ozempic/Mounjaro): regista injeções, calcula curva de concentração ao longo do tempo (semivida do fármaco) e mostra countdown até à próxima dose + gráfico. Peso com histórico/delta.

## Verificação
```bash
npx expo start            # dev
# correr no simulador iOS / Android; validar fonts e gradientes em ambos
```
