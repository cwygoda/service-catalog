export const NODE_WIDTH = 160;
export const NODE_HEIGHT = 40;
export const DATASTORE_HEIGHT = 52;
export const NODE_RADIUS = 8;

export { PARTITION_BY_TYPE } from '../../../core/services/graph-builder.js';

interface ColorDef {
  bg: string;
  stroke: string;
  text: string;
}

// Colorblind-safe palette (Wong + Tol inspired, luminance-distinct)
export const TYPE_COLORS: Record<string, ColorDef> = {
  'web-app': { bg: '#dbeafe', stroke: '#2563eb', text: '#1e40af' },
  'web-service': { bg: '#dcfce7', stroke: '#15803d', text: '#14532d' },
  'event-consumer': { bg: '#fef3c7', stroke: '#d97706', text: '#92400e' },
  'event-producer': { bg: '#fce7f3', stroke: '#be185d', text: '#9d174d' },
  'event-transformer': { bg: '#e0e7ff', stroke: '#4f46e5', text: '#3730a3' },
  library: { bg: '#ede9fe', stroke: '#7c3aed', text: '#5b21b6' },
  'data-store': { bg: '#cffafe', stroke: '#0e7490', text: '#155e75' },
};

export const DEFAULT_COLOR: ColorDef = {
  bg: '#f3f4f6',
  stroke: '#9ca3af',
  text: '#374151',
};

// Edge colors kept as fallback; primary edge coloring uses target node color
export const EDGE_COLORS: Record<string, string> = {
  http: '#6b7280',
  event: '#d97706',
  grpc: '#7c3aed',
  'data-store': '#0e7490',
};
