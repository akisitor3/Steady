# Steady — MVP

Tracker GLP-1 com camada farmacocinética. App nativo iOS/Android (React Native + Expo).

## O que já está feito (MVP — parte 1)

- **Motor PK** (`lib/pk/engine.ts`) — calcula o medicamento ativo no corpo. Validado: steady state = 1,6× a dose.
- **Base de dados** SQLite on-device (`lib/db/`) — sem nuvem, sem contas.
- **Ecrã Doses** — registo em 1 toque, cartões de estado, gráfico G1 (medicamento no corpo), histórico.
- **Ecrã Peso** — registo + variação.
- **Ecrã Mais** — seletor de medicamento (tirzepatida/semaglutida) + avisos legais.

## Como correr

Precisas de Node 18+ e a app **Expo Go** no telemóvel (App Store / Play Store).

```bash
cd steady
npm install
npx expo start
```

Lê o QR code com a Expo Go (Android) ou a câmara (iOS).

## Próximos passos (roadmap)

- Adicionar G2 (curva intra-semana) e G3 (steady state)
- Lembretes automáticos de injeção (expo-notifications)
- Módulos Água + Efeitos secundários (fechar o MVP)
- Fase 2: foto-calorias IA + paywall

## Aviso

Ferramenta de bem-estar. Não é dispositivo médico. Dados PK de fontes públicas (FDA, StatPearls).
Consultar sempre o médico antes de alterar dose ou medicação.
