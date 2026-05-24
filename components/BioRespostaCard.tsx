import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, {
  Circle, Line, Rect, Path,
  Text as SvgText, Defs, LinearGradient,
  Stop, ClipPath, G,
} from 'react-native-svg';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';

const VBOX_W = 330;
const VBOX_H = 110;

export function BioRespostaCard() {
  const { width: screenWidth } = useWindowDimensions();
  const chartW = screenWidth - Spacing.md * 2;
  const chartH = Math.round(chartW * VBOX_H / VBOX_W);

  return (
    <View style={styles.card}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Bio Resposta</Text>
          <Text style={styles.subtitle}>Apple Health · WHOOP · actualizado 17:27</Text>
        </View>
        <Svg width={48} height={48} viewBox="0 0 48 48">
          <Defs>
            <LinearGradient id="br-ring" x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0%"   stopColor="#6366F1" />
              <Stop offset="33%"  stopColor="#0F6E56" />
              <Stop offset="66%"  stopColor="#F97316" />
              <Stop offset="100%" stopColor="#10B981" />
            </LinearGradient>
          </Defs>
          <Circle cx={24} cy={24} r={20} fill="none" stroke="#F3F4F6" strokeWidth={3.5} />
          <Circle
            cx={24} cy={24} r={20}
            fill="none" stroke="url(#br-ring)"
            strokeWidth={3.5} strokeDasharray="91 126"
            strokeLinecap="round"
            rotation={-90} origin="24, 24"
          />
          <SvgText x={24} y={25} fontSize={12} fontWeight="700" fill={Colors.text}
            textAnchor="middle">72</SvgText>
          <SvgText x={24} y={33} fontSize={7} fontWeight="700" fill={Colors.primary}
            textAnchor="middle">BOM</SvgText>
        </Svg>
      </View>

      {/* Chart */}
      <View style={styles.chartBorder}>
        <Svg width={chartW} height={chartH} viewBox={`0 0 ${VBOX_W} ${VBOX_H}`}>
          <Defs>
            <LinearGradient id="hm-fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%"   stopColor="#0F6E56" stopOpacity={0.14} />
              <Stop offset="100%" stopColor="#0F6E56" stopOpacity={0} />
            </LinearGradient>
            <ClipPath id="hm-clip">
              <Rect x={20} y={23} width={278} height={72} />
            </ClipPath>
          </Defs>

          {/* Event markers */}
          <G opacity={0.55}>
            <SvgText x={68}  y={14} fontSize={11} textAnchor="middle">🌙</SvgText>
            <SvgText x={148} y={14} fontSize={11} textAnchor="middle">🥣</SvgText>
            <SvgText x={179} y={14} fontSize={11} textAnchor="middle">🔥</SvgText>
            <SvgText x={227} y={14} fontSize={11} textAnchor="middle">🍱</SvgText>
            <SvgText x={267} y={14} fontSize={11} textAnchor="middle">⚡</SvgText>
          </G>

          {/* Y-axis labels */}
          <SvgText x={16} y={26} fontSize={7.5} fill="#C4C8CE" textAnchor="end">100</SvgText>
          <SvgText x={16} y={44} fontSize={7.5} fill="#C4C8CE" textAnchor="end">75</SvgText>
          <SvgText x={16} y={62} fontSize={7.5} fill="#C4C8CE" textAnchor="end">50</SvgText>
          <SvgText x={16} y={80} fontSize={7.5} fill="#C4C8CE" textAnchor="end">25</SvgText>
          <SvgText x={16} y={97} fontSize={7.5} fill="#C4C8CE" textAnchor="end">0</SvgText>

          {/* Sleep zone */}
          <Rect x={20} y={23} width={104} height={72} fill="rgba(129,140,248,0.07)" />

          {/* Horizontal gridlines */}
          <Line x1={20} y1={23} x2={298} y2={23} stroke="#E5E7EB" strokeWidth={0.8} />
          <Line x1={20} y1={41} x2={298} y2={41} stroke="#EDEEF0" strokeWidth={0.5} strokeDasharray="3 3" />
          <Line x1={20} y1={59} x2={298} y2={59} stroke="#E5E7EB" strokeWidth={0.6} />
          <Line x1={20} y1={77} x2={298} y2={77} stroke="#EDEEF0" strokeWidth={0.5} strokeDasharray="3 3" />
          <Line x1={20} y1={95} x2={298} y2={95} stroke="#E5E7EB" strokeWidth={0.8} />

          {/* Vertical gridlines */}
          <Line x1={116} y1={23} x2={116} y2={95} stroke="#E5E7EB" strokeWidth={0.6} />
          <Line x1={179} y1={23} x2={179} y2={95} stroke="#E5E7EB" strokeWidth={0.6} />
          <Line x1={243} y1={23} x2={243} y2={95} stroke="#E5E7EB" strokeWidth={0.6} />

          {/* Gradient fill */}
          <Path
            clipPath="url(#hm-clip)"
            d="M 20 82 C 38 82,55 86,72 86 C 92 86,108 83,116 80 C 124 76,130 70,140 62 C 150 54,162 42,179 32 C 183 29,187 31,192 36 C 198 40,205 46,215 52 C 222 56,228 58,237 54 C 246 50,258 44,275 43 C 283 42,292 42,298 43 L 298 95 L 20 95 Z"
            fill="url(#hm-fill)"
          />

          {/* Score line */}
          <Path
            clipPath="url(#hm-clip)"
            d="M 20 82 C 38 82,55 86,72 86 C 92 86,108 83,116 80 C 124 76,130 70,140 62 C 150 54,162 42,179 32 C 183 29,187 31,192 36 C 198 40,205 46,215 52 C 222 56,228 58,237 54 C 246 50,258 44,275 43 C 283 42,292 42,298 43"
            fill="none" stroke={Colors.primary}
            strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
          />

          {/* Now — dashed line */}
          <Line x1={298} y1={21} x2={298} y2={97}
            stroke={Colors.primary} strokeWidth={0.8}
            strokeDasharray="3 3" opacity={0.35} />
          {/* Now — dot */}
          <Circle cx={298} cy={43} r={3.5} fill={Colors.primary} stroke="white" strokeWidth={1.5} />

          {/* X-axis labels */}
          <SvgText x={20}  y={108} fontSize={8} fill="#9CA3AF" textAnchor="start">00:00</SvgText>
          <SvgText x={116} y={108} fontSize={8} fill="#9CA3AF" textAnchor="middle">06:00</SvgText>
          <SvgText x={179} y={108} fontSize={8} fill="#9CA3AF" textAnchor="middle">10:00</SvgText>
          <SvgText x={243} y={108} fontSize={8} fill="#9CA3AF" textAnchor="middle">14:00</SvgText>
          <SvgText x={298} y={108} fontSize={8} fill={Colors.primary} textAnchor="end" fontWeight="600">17:27</SvgText>
        </Svg>
      </View>

      {/* Metrics */}
      <View style={styles.metrics}>
        <View style={[styles.metric, styles.metricBorder]}>
          <Text style={styles.metricIcon}>🌙</Text>
          <Text style={styles.metricVal}>
            7<Text style={styles.metricUnit}>h</Text>{' '}32<Text style={styles.metricUnit}>m</Text>
          </Text>
          <Text style={styles.metricLabel}>Sono</Text>
        </View>
        <View style={[styles.metric, styles.metricBorder]}>
          <Text style={styles.metricIcon}>🏃</Text>
          <Text style={styles.metricVal}>
            8 420<Text style={styles.metricUnit}> pass.</Text>
          </Text>
          <Text style={styles.metricLabel}>Passos</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricIcon}>🍽️</Text>
          <Text style={styles.metricVal}>
            1 240<Text style={styles.metricUnit}> kcal</Text>
          </Text>
          <Text style={styles.metricLabel}>Calorias</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: 'rgba(15,110,86,0.12)',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    ...Shadow.sm,
    shadowColor: '#0F6E56',
    shadowOpacity: 0.09,
    shadowRadius: 16,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerLeft: { flex: 1, marginRight: 12, gap: 3 },
  title: {
    fontSize: 15, fontWeight: '600',
    color: Colors.text, letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11, color: Colors.textTertiary,
  },

  /* Chart */
  chartBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },

  /* Metrics */
  metrics: {
    flexDirection: 'row',
  },
  metric: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
  },
  metricBorder: {
    borderRightWidth: 0.5,
    borderRightColor: Colors.border,
  },
  metricIcon: {
    fontSize: 15,
    marginBottom: 5,
    opacity: 0.45,
  },
  metricVal: {
    fontSize: 15, fontWeight: '700',
    color: Colors.text, letterSpacing: -0.3,
    lineHeight: 18,
  },
  metricUnit: {
    fontSize: 11, fontWeight: '400',
    color: Colors.textTertiary,
  },
  metricLabel: {
    fontSize: 11, color: Colors.textTertiary,
    marginTop: 3, fontWeight: '500',
  },
});
