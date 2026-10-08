/**
 * Vanta's original ES module sources (node_modules/vanta/src). We import these
 * instead of the UMD bundles in vanta/dist: the UMD export is a webpack
 * namespace object ({ __esModule, default }) and esbuild's production
 * CommonJS interop hands that whole object over as `default`, so calling it
 * failed with "TypeError: x is not a function" (only in `ng build`).
 */
declare module 'vanta/src/vanta.topology.js' {
  export interface VantaEffect {
    options: Record<string, any>;
    setOptions(options: Record<string, any>): void;
    resize(): void;
    destroy(): void;
  }

  export interface VantaTopologyOptions {
    el: HTMLElement | string;
    p5: unknown;
    THREE?: unknown;
    color?: number;
    backgroundColor?: number;
    points?: number;
    maxDistance?: number;
    spacing?: number;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    scale?: number;
    scaleMobile?: number;
    [option: string]: unknown;
  }

  const TOPOLOGY: (options: VantaTopologyOptions) => VantaEffect;
  export default TOPOLOGY;
}
