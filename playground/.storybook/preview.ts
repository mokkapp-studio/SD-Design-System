import type { Decorator, Preview } from '@storybook/react-vite';
import '../../tokens/tokens.css';
import './preview.css';

// El modo oscuro lo da tokens.css con [data-theme="dark"]: los componentes no escriben nada para dark.
const withTheme: Decorator = (Story, ctx) => {
  document.documentElement.dataset.theme = String(ctx.globals.theme ?? 'light');
  return Story();
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Tema',
      toolbar: {
        title: 'Tema',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [withTheme],
  parameters: { layout: 'fullscreen' },
};
export default preview;
