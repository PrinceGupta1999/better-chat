import baseConfig from '@extension/tailwindcss-config';
import type { Config } from 'tailwindcss/types/config';
import { withUI } from '@extension/ui';

export default withUI({
  ...baseConfig,
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
}) as Config;
