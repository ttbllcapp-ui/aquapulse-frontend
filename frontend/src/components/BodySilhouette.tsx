import React from 'react';
import Svg, { Path, Circle, Ellipse, Defs, LinearGradient as SvgLinearGradient, Stop, G } from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
  /** 0..1 — overall hydration fill */
  hydration: number;
  primary: string;
  waterMid: string;
  waterDeep: string;
  outline: string;
  /** highlighted organ key (optional) */
  highlight?: 'brain' | 'heart' | 'lungs' | 'kidneys' | 'muscles' | 'skin' | 'blood' | 'bones' | null;
}

/**
 * Stylized human silhouette with organ overlays.
 * Hydration drives the global "fill" gradient from feet upward.
 */
export default function BodySilhouette({ width = 220, height = 420, hydration, primary, waterMid, waterDeep, outline, highlight = null }: Props) {
  // Clamp 0..1
  const h = Math.max(0, Math.min(1, hydration));
  // Water surface y inside viewBox 0..420 (head at top, feet at bottom)
  const surfaceY = 420 - h * 420;

  const orgSel = (k: string) => (highlight && highlight === k ? primary : `${primary}cc`);

  return (
    <Svg width={width} height={height} viewBox="0 0 220 420">
      <Defs>
        <SvgLinearGradient id="bodyWater" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={waterMid} stopOpacity="0.85" />
          <Stop offset="1" stopColor={waterDeep} stopOpacity="0.95" />
        </SvgLinearGradient>
        <SvgLinearGradient id="bodyGlass" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={primary} stopOpacity="0.10" />
          <Stop offset="1" stopColor={primary} stopOpacity="0.04" />
        </SvgLinearGradient>
        {/* Clip body shape for water fill */}
        <SvgLinearGradient id="organGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={primary} stopOpacity="0.95" />
          <Stop offset="1" stopColor={waterDeep} stopOpacity="0.95" />
        </SvgLinearGradient>
      </Defs>

      {/* Body outer fill (glass) */}
      <G>
        {/* Head */}
        <Circle cx="110" cy="38" r="28" fill="url(#bodyGlass)" stroke={outline} strokeWidth="1.2" />
        {/* Neck */}
        <Path d="M100 64 L120 64 L122 76 L98 76 Z" fill="url(#bodyGlass)" stroke={outline} strokeWidth="1.2" />
        {/* Torso */}
        <Path
          d="M70 78 Q110 70 150 78 L156 170 Q150 220 144 248 L138 318 L82 318 L76 248 Q70 220 64 170 Z"
          fill="url(#bodyGlass)"
          stroke={outline}
          strokeWidth="1.2"
        />
        {/* Left arm */}
        <Path d="M62 90 Q42 110 38 160 L46 240 L60 244 L60 200 Q66 152 70 102 Z" fill="url(#bodyGlass)" stroke={outline} strokeWidth="1.2" />
        {/* Right arm */}
        <Path d="M158 90 Q178 110 182 160 L174 240 L160 244 L160 200 Q154 152 150 102 Z" fill="url(#bodyGlass)" stroke={outline} strokeWidth="1.2" />
        {/* Left leg */}
        <Path d="M82 320 L78 396 L100 408 L108 320 Z" fill="url(#bodyGlass)" stroke={outline} strokeWidth="1.2" />
        {/* Right leg */}
        <Path d="M138 320 L142 396 L120 408 L112 320 Z" fill="url(#bodyGlass)" stroke={outline} strokeWidth="1.2" />
      </G>

      {/* Water fill rising from feet — masked-ish by overlaying outline color outside body via outer rect strategy.
          For simplicity we draw filled body parts proportional to hydration. */}
      <G opacity={0.55}>
        {/* Cover each part with the water gradient up to surfaceY using rect-on-path approximation */}
        {/* We approximate fill by drawing the same paths in water color with an overlay clip rectangle */}
        <Path
          d={`M0 ${surfaceY} L220 ${surfaceY} L220 420 L0 420 Z`}
          fill="url(#bodyWater)"
        />
      </G>

      {/* Re-draw outline above for crispness */}
      <G>
        <Circle cx="110" cy="38" r="28" fill="none" stroke={outline} strokeWidth="1.2" />
        <Path d="M100 64 L120 64 L122 76 L98 76 Z" fill="none" stroke={outline} strokeWidth="1.2" />
        <Path
          d="M70 78 Q110 70 150 78 L156 170 Q150 220 144 248 L138 318 L82 318 L76 248 Q70 220 64 170 Z"
          fill="none"
          stroke={outline}
          strokeWidth="1.2"
        />
        <Path d="M62 90 Q42 110 38 160 L46 240 L60 244 L60 200 Q66 152 70 102 Z" fill="none" stroke={outline} strokeWidth="1.2" />
        <Path d="M158 90 Q178 110 182 160 L174 240 L160 244 L160 200 Q154 152 150 102 Z" fill="none" stroke={outline} strokeWidth="1.2" />
        <Path d="M82 320 L78 396 L100 408 L108 320 Z" fill="none" stroke={outline} strokeWidth="1.2" />
        <Path d="M138 320 L142 396 L120 408 L112 320 Z" fill="none" stroke={outline} strokeWidth="1.2" />
      </G>

      {/* Organs — small subtle dots */}
      <G>
        {/* Brain */}
        <Circle cx="110" cy="34" r="10" fill={orgSel('brain')} opacity={highlight === 'brain' ? 1 : 0.65} />
        {/* Lungs */}
        <Ellipse cx="94" cy="118" rx="14" ry="22" fill={orgSel('lungs')} opacity={highlight === 'lungs' ? 1 : 0.55} />
        <Ellipse cx="126" cy="118" rx="14" ry="22" fill={orgSel('lungs')} opacity={highlight === 'lungs' ? 1 : 0.55} />
        {/* Heart */}
        <Circle cx="104" cy="128" r="9" fill="#FF6B6B" opacity={highlight === 'heart' ? 1 : 0.85} />
        {/* Kidneys */}
        <Ellipse cx="90" cy="186" rx="6" ry="11" fill={orgSel('kidneys')} opacity={highlight === 'kidneys' ? 1 : 0.7} />
        <Ellipse cx="130" cy="186" rx="6" ry="11" fill={orgSel('kidneys')} opacity={highlight === 'kidneys' ? 1 : 0.7} />
      </G>
    </Svg>
  );
}
