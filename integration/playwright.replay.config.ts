import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import { devices as replayDevices } from '@replayio/playwright';
import defaultConfig from './playwright.config.ts';

const config: PlaywrightTestConfig = {
  ...defaultConfig,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chromium'] }
    },
    {
      name: 'replay-chromium',
      use: { ...replayDevices['Replay Chromium'] }
    },
    {
      name: 'replay-firefox',
      use: { ...replayDevices['Replay Firefox'] }
    }
  ]
};

export default config;
