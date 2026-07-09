import type { StorybookConfig } from '@storybook/react-vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sharedObjectProxyPrefix = '/__storybook-proxy-29001'

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async config => {
    // Align Vite's module resolution with tsconfig paths so Storybook can resolve '@/*'
    return mergeConfig(config, {
      server: {

      },
      resolve: {
        alias: {
          '@': resolve(projectRoot, 'src'),
        },
      },
    })
  },
}
export default config
