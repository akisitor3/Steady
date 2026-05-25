import { useWindowDimensions } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { WeekPoint } from '@/lib/pk/engine';

const VIEW_H = 44;
const SIDE_PAD = 4;

interface Props {
  weekly: WeekPoint[];
  ss: number;
}

export function HeroPKChart({ weekly, ss }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  // 32 horizontal padding from hero card + 2px visual
  const svgWidth = screenWidth - 32 - 2;

  if (weekly.length === 0) {
    return <Svg width={svgWidth} height={VIEW_H} />;
  }

  const maxTotal = Math.max(...weekly.map((p) => p.total));
  const barAreaWidth = svgWidth - SIDE_PAD * 2;
  const barCount = weekly.length;
  const gap = Math.min(4, barAreaWidth / barCount * 0.25);
  const barW = Math.max(4, (barAreaWidth - gap * (barCount - 1)) / barCount);

  const toY = (val: number) => {
    if (maxTotal === 0) return VIEW_H;
    return VIEW_H - (val / maxTotal) * (VIEW_H - 4);
  };

  const ssY = ss > 0 && maxTotal > 0 ? toY(ss) : null;

  return (
    <Svg width={svgWidth} height={VIEW_H}>
      {weekly.map((p, i) => {
        const x = SIDE_PAD + i * (barW + gap);
        const residualH = maxTotal > 0 ? (p.residual / maxTotal) * (VIEW_H - 4) : 0;
        const freshH = maxTotal > 0 ? (p.fresh / maxTotal) * (VIEW_H - 4) : 0;

        return (
          <React.Fragment key={p.week}>
            {/* Residual bar (bottom) */}
            {residualH > 0 && (
              <Rect
                x={x}
                y={VIEW_H - residualH - freshH}
                width={barW}
                height={residualH}
                fill="rgba(255,255,255,0.30)"
                rx={1}
              />
            )}
            {/* Fresh bar (top) */}
            {freshH > 0 && (
              <Rect
                x={x}
                y={VIEW_H - freshH}
                width={barW}
                height={freshH}
                fill="rgba(255,255,255,0.80)"
                rx={1}
              />
            )}
          </React.Fragment>
        );
      })}

      {ssY !== null && (
        <Line
          x1={SIDE_PAD}
          y1={ssY}
          x2={svgWidth - SIDE_PAD}
          y2={ssY}
          stroke="rgba(255,255,255,0.45)"
          strokeWidth={1}
          strokeDasharray="4,3"
        />
      )}
    </Svg>
  );
}

// React needs to be in scope for JSX (React Native 0.76 still needs it for Fragment)
import React from 'react';
