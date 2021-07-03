import { Plugin } from 'chart.js';
import verticalLinePlugin from './index.js';

export interface VerticalLinePluginParams {
  strokeColor: string;
  lineWidth?: number;
}

declare function verticalLinePlugin(
  params: VerticalLinePluginParams
): Plugin<'line', Record<string, unknown>>;

export = verticalLinePlugin;
