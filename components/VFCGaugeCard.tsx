import { useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, {
  Path, Line, Text as SvgText, Defs,
  LinearGradient, Stop,
} from 'react-native-svg';
import { Colors, Font, Spacing, Radius, Shadow } from '@/constants/theme';
import { useHealthStore } from '@/lib/health/appleHealth';

const VBOX_W = 358;
const VBOX_H = 173;
const VBOX_OFFSET_Y = 35;

export function VFCGaugeCard() {
  const { width: screenWidth } = useWindowDimensions();
  const svgW = screenWidth - Spacing.md * 2;
  const svgH = Math.round(svgW * VBOX_H / VBOX_W);

  const { data, loaded } = useHealthStore();

  useEffect(() => {
    if (!loaded) {
      useHealthStore.getState().load();
    }
  }, []);

  const angle = -90 + (data?.hrvValue ?? 0.7) / 3.0 * 180;
  const rad = (angle * Math.PI) / 180;
  const needleX2 = 179 + 70 * Math.cos(rad);
  const needleY2 = 196 + 70 * Math.sin(rad);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Variabilidade Freq. Cardíaca</Text>
      <Text style={styles.subtitle}>{`WHOOP · actualizado ${data?.lastUpdated ?? '—'}`}</Text>

      <Svg width={svgW} height={svgH} viewBox={`0 ${VBOX_OFFSET_Y} ${VBOX_W} ${VBOX_H}`}>
        <Defs>
          {/* Gauge gradient: azul → ciano → lima → laranja → vermelho */}
          <LinearGradient id="vfc-grad" x1="0" y1="0.5" x2="1" y2="0.5">
            <Stop offset="0%"   stopColor="#29B6F6" />
            <Stop offset="28%"  stopColor="#00E5FF" />
            <Stop offset="55%"  stopColor="#AEEA00" />
            <Stop offset="78%"  stopColor="#FFA000" />
            <Stop offset="100%" stopColor="#E65100" />
          </LinearGradient>
          {/* Needle fade: transparente → branco */}
          <LinearGradient id="vfc-needle" gradientUnits="userSpaceOnUse"
            x1={179} y1={196} x2={needleX2} y2={needleY2}>
            <Stop offset="0%"   stopColor="white" stopOpacity={0} />
            <Stop offset="100%" stopColor="white" stopOpacity={1} />
          </LinearGradient>
        </Defs>

        {/* Arco de fundo */}
        <Path
          d="M 97 196 A 95 95 0 1 1 261 196"
          fill="none" stroke="#F3F4F6"
          strokeWidth={4} strokeLinecap="round"
        />

        {/* Arco colorido — glow (sem filtro, usa opacidade) */}
        <Path
          d="M 97 196 A 95 95 0 1 1 261 196"
          fill="none" stroke="url(#vfc-grad)"
          strokeWidth={10} strokeLinecap="round"
          opacity={0.18}
        />

        {/* Arco colorido — principal */}
        <Path
          d="M 97 196 A 95 95 0 1 1 261 196"
          fill="none" stroke="url(#vfc-grad)"
          strokeWidth={4} strokeLinecap="round"
        />

        {/* Agulha com fade a branco */}
        <Line
          x1={179} y1={196} x2={needleX2} y2={needleY2}
          stroke="url(#vfc-needle)"
          strokeWidth={4} strokeLinecap="round"
        />

        {/* Valor central */}
        <SvgText
          x={179} y={148}
          fontSize={40} fontFamily={Font.bold} fill={Colors.text}
          textAnchor="middle" letterSpacing={-1}
        >{(data?.hrvValue ?? 0.7).toFixed(1)}</SvgText>

        {/* Status */}
        <SvgText
          x={179} y={165}
          fontSize={11} fontFamily={Font.semiBold} fill="#29B6F6"
          textAnchor="middle" letterSpacing={1.5}
        >{data?.hrvStatus ?? 'BAIXO'}</SvgText>

        {/* Timestamp */}
        <SvgText
          x={179} y={180}
          fontSize={11} fill={Colors.textTertiary}
          textAnchor="middle"
        >{data?.lastUpdated ?? '—'}</SvgText>

        {/* Labels escala */}
        <SvgText x={84}  y={204} fontSize={10} fill={Colors.textTertiary} textAnchor="middle">0.0</SvgText>
        <SvgText x={274} y={204} fontSize={10} fill={Colors.textTertiary} textAnchor="middle">3.0</SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    ...Shadow.md,
  },
  title: {
    fontSize: 15,
    fontFamily: Font.semiBold,
    color: Colors.text,
    letterSpacing: -0.2,
    paddingHorizontal: Spacing.md,
    paddingTop: 14,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: Font.regular,
    color: Colors.textTertiary,
    paddingHorizontal: Spacing.md,
    paddingTop: 3,
  },
});
