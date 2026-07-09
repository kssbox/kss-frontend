import type { Preview } from '@storybook/react'
import React from 'react'
import './style.css'


const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#333333',
        },
      ],
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'default',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: ['pro', 'default'],
        dynamicTitle: true,
      },
    },
    colorScheme: {
      description: 'Color scheme',
      defaultValue: 'light',
      toolbar: {
        title: 'Color Scheme',
        icon: 'contrast',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const root = document.documentElement
      root.setAttribute('data-theme', context.globals.theme)

      if (context.globals.colorScheme === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }

      return React.createElement(
        'div',
        {
          'data-theme': context.globals.theme,
          className: context.globals.colorScheme === 'dark' ? 'dark' : '',
        },
        React.createElement(Story, null)
      )
    },
  ],
}

export default preview
