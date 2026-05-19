import React from 'react';
import Svg, { Path, Circle, Ellipse, Defs, LinearGradient, Stop, RadialGradient, Rect } from 'react-native-svg';
import { View } from 'react-native';

export type MascotMood = 'thirsty' | 'sad' | 'neutral' | 'happy' | 'celebrate';

interface Props {
  mood: MascotMood;
  primary: string;
  size?: number;
}

/**
 * Premium AquaPulse glass — elegant crystal tumbler with realistic water,
 * gold rim, surface ripples, light refraction, and bubble animation feel.
 */
export default function AquaMascot({ mood, primary, size = 140 }: Props) {
  const config = {
    thirsty:   { fillPct: 0.15, color: '#FFB36B', accent: '#FF8A5C' },
    sad:       { fillPct: 0.30, color: '#7FA3C8', accent: '#5C7FA8' },
    neutral:   { fillPct: 0.55, color: primary,  accent: primary  },
    happy:     { fillPct: 0.78, color: primary,  accent: primary  },
    celebrate: { fillPct: 0.96, color: '#5BE3C4', accent: '#3DC9A8' },
  }[mood];

  // Crystal tumbler dimensions — slimmer, taller proportions for premium look
  const W = 120;
  const H = 120;
  const cupTop = 12;
  const cupBottom = 110;
  const cupHeight = cupBottom - cupTop;
  const cupTopWidth = 70;
  const cupBottomWidth = 52;
  const cupCx = W / 2;

  // Water level
  const waterHeight = cupHeight * config.fillPct;
  const waterY = cupBottom - waterHeight;
  // Water taper interpolation at waterY
  const yRatio = (waterY - cupTop) / cupHeight;
  const waterWidthAtTop = cupBottomWidth + (cupTopWidth - cupBottomWidth) * (1 - yRatio);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          {/* Crystal glass gradient */}
          <LinearGradient id="crystal" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
            <Stop offset="0.4" stopColor="#FFFFFF" stopOpacity="0.04" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.14" />
          </LinearGradient>

          {/* Water gradient with subtle highlights */}
          <LinearGradient id="aqua" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={config.color} stopOpacity="0.95" />
            <Stop offset="0.5" stopColor={config.color} stopOpacity="0.85" />
            <Stop offset="1" stopColor={config.accent} stopOpacity="0.7" />
          </LinearGradient>

          {/* Premium gold rim */}
          <LinearGradient id="rim" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={primary} stopOpacity="0.5" />
            <Stop offset="0.3" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="0.5" stopColor={primary} stopOpacity="1" />
            <Stop offset="0.7" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="1" stopColor={primary} stopOpacity="0.5" />
          </LinearGradient>

          {/* Bottom shadow / table reflection */}
          <RadialGradient id="shadow" cx="0.5" cy="0.5" rx="0.5" ry="0.2">
            <Stop offset="0" stopColor="#000000" stopOpacity="0.35" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>

          {/* Inner light gradient */}
          <LinearGradient id="innerLight" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.18" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Soft drop shadow under the glass */}
        <Ellipse cx={cupCx} cy={cupBottom + 6} rx={cupBottomWidth / 2 + 6} ry="4" fill="url(#shadow)" />

        {/* GLASS BODY — Crystal tumbler shape */}
        <Path
          d={`
            M ${cupCx - cupTopWidth / 2} ${cupTop}
            L ${cupCx - cupBottomWidth / 2} ${cupBottom - 3}
            Q ${cupCx - cupBottomWidth / 2} ${cupBottom + 3}, ${cupCx - cupBottomWidth / 2 + 5} ${cupBottom + 3}
            L ${cupCx + cupBottomWidth / 2 - 5} ${cupBottom + 3}
            Q ${cupCx + cupBottomWidth / 2} ${cupBottom + 3}, ${cupCx + cupBottomWidth / 2} ${cupBottom - 3}
            L ${cupCx + cupTopWidth / 2} ${cupTop}
            Z
          `}
          fill="url(#crystal)"
          stroke={primary}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* WATER inside — tapered to match glass walls */}
        <Path
          d={`
            M ${cupCx - waterWidthAtTop / 2 + 1.5} ${waterY}
            L ${cupCx - cupBottomWidth / 2 + 1.5} ${cupBottom - 3}
            Q ${cupCx - cupBottomWidth / 2 + 1.5} ${cupBottom + 1}, ${cupCx - cupBottomWidth / 2 + 6} ${cupBottom + 1}
            L ${cupCx + cupBottomWidth / 2 - 6} ${cupBottom + 1}
            Q ${cupCx + cupBottomWidth / 2 - 1.5} ${cupBottom + 1}, ${cupCx + cupBottomWidth / 2 - 1.5} ${cupBottom - 3}
            L ${cupCx + waterWidthAtTop / 2 - 1.5} ${waterY}
            Z
          `}
          fill="url(#aqua)"
        />

        {/* WATER SURFACE meniscus — elegant ellipse with double highlight */}
        <Ellipse cx={cupCx} cy={waterY + 0.5} rx={waterWidthAtTop / 2 - 2} ry="2.5" fill={config.accent} fillOpacity="0.6" />
        <Ellipse cx={cupCx} cy={waterY - 0.5} rx={waterWidthAtTop / 2 - 4} ry="1.2" fill="#FFFFFF" fillOpacity="0.65" />

        {/* Premium bubbles inside water */}
        {config.fillPct > 0.2 && (
          <>
            <Circle cx={cupCx - 14} cy={waterY + waterHeight * 0.45} r="2.4" fill="#FFFFFF" fillOpacity="0.65" />
            <Circle cx={cupCx - 14} cy={waterY + waterHeight * 0.45} r="0.9" fill="#FFFFFF" fillOpacity="1" />
            <Circle cx={cupCx + 8} cy={waterY + waterHeight * 0.65} r="1.6" fill="#FFFFFF" fillOpacity="0.55" />
            <Circle cx={cupCx + 16} cy={waterY + waterHeight * 0.35} r="2" fill="#FFFFFF" fillOpacity="0.5" />
            <Circle cx={cupCx + 16} cy={waterY + waterHeight * 0.35} r="0.7" fill="#FFFFFF" fillOpacity="0.95" />
            <Circle cx={cupCx - 6} cy={waterY + waterHeight * 0.78} r="1.2" fill="#FFFFFF" fillOpacity="0.4" />
          </>
        )}

        {/* Inner light reflection — left side gloss */}
        <Path
          d={`
            M ${cupCx - cupTopWidth / 2 + 5} ${cupTop + 4}
            L ${cupCx - cupBottomWidth / 2 + 4} ${cupBottom - 8}
          `}
          stroke="#FFFFFF"
          strokeOpacity="0.35"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Inner light reflection — right side (thinner) */}
        <Path
          d={`
            M ${cupCx + cupTopWidth / 2 - 4} ${cupTop + 6}
            L ${cupCx + cupBottomWidth / 2 - 3} ${cupBottom - 14}
          `}
          stroke="#FFFFFF"
          strokeOpacity="0.18"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Glass top rim — premium gold/primary glow */}
        <Path
          d={`M ${cupCx - cupTopWidth / 2 - 1} ${cupTop} L ${cupCx + cupTopWidth / 2 + 1} ${cupTop}`}
          stroke="url(#rim)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Inner rim highlight */}
        <Ellipse cx={cupCx} cy={cupTop + 1} rx={cupTopWidth / 2 - 2} ry="1.5" fill="#FFFFFF" fillOpacity="0.5" />
      </Svg>
    </View>
  );
}

export function pickMood(percent: number, minutesSinceLastDrink: number): MascotMood {
  if (percent >= 100) return 'celebrate';
  if (percent >= 70) return 'happy';
  if (minutesSinceLastDrink > 120) return 'thirsty';
  if (percent < 25) return 'sad';
  return 'neutral';
}

export function moodEmoji(mood: MascotMood): string {
  return mood === 'celebrate' ? '🎉' : mood === 'happy' ? '😊' : mood === 'neutral' ? '🙂' : mood === 'thirsty' ? '😩' : '😔';
}
