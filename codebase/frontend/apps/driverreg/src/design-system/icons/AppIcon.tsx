import React from 'react';
import Svg, {Circle, Path, Rect} from 'react-native-svg';

export type AppIconName = 'identity'|'nrc'|'licence'|'face'|'vehicle'|'document'|'camera'|'review'|'correction'|'approval'|'support';

export function AppIcon({name, color = 'currentColor', size = 24}: {name: AppIconName; color?: string; size?: number}) {
  const common = {fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const paths: Record<AppIconName, React.ReactNode> = {
    identity: <><Circle cx="12" cy="8" r="3" {...common}/><Path d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6" {...common}/></>,
    nrc: <><Rect x="3" y="5" width="18" height="14" rx="2" {...common}/><Circle cx="8" cy="11" r="2" {...common}/><Path d="M12 10h6M12 14h5M6 16h4" {...common}/></>,
    licence: <><Rect x="3" y="5" width="18" height="14" rx="2" {...common}/><Path d="M7 9h4M7 13h10M7 16h7" {...common}/></>,
    face: <><Circle cx="12" cy="12" r="8" {...common}/><Path d="M9 10h.01M15 10h.01M9 15c2 1.5 4 1.5 6 0" {...common}/></>,
    vehicle: <><Path d="M4 15l2-6h12l2 6v4h-2v-2H6v2H4z" {...common}/><Path d="M6 15h12M8 12h8" {...common}/></>,
    document: <><Path d="M6 3h8l4 4v14H6zM14 3v5h4M9 13h6M9 17h6" {...common}/></>,
    camera: <><Path d="M4 8h4l2-2h4l2 2h4v11H4z" {...common}/><Circle cx="12" cy="13" r="3" {...common}/></>,
    review: <><Path d="M5 4h14v16H5zM8 9h8M8 13h5" {...common}/><Path d="m14 16 1.5 1.5L19 14" {...common}/></>,
    correction: <><Path d="M4 20h4l11-11-4-4L4 16zM13 7l4 4" {...common}/></>,
    approval: <><Circle cx="12" cy="12" r="9" {...common}/><Path d="m8 12 3 3 5-6" {...common}/></>,
    support: <><Circle cx="12" cy="12" r="9" {...common}/><Path d="M9.5 9a2.7 2.7 0 1 1 3.2 2.7c-.7.3-.7.8-.7 1.3M12 17h.01" {...common}/></>,
  };
  return <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>{paths[name]}</Svg>;
}
