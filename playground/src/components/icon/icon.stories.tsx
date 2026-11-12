import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, CaretDown, Check, CheckCircle, Eye, EyeSlash, GithubLogo, Info, LinkedinLogo, List, MagnifyingGlass, Minus, Plus, Trash, X, YoutubeLogo } from './icons';
import { Icon } from './icon';

const meta: Meta<typeof Icon> = {
  title: 'Media/Icon',
  component: Icon,
  args: { icon: Plus, weight: 'regular', size: '16' },
  argTypes: {
    icon: { control: false },
    weight: { control: 'inline-radio', options: ['regular', 'fill'] },
    size: { control: 'inline-radio', options: ['14', '16', '18', '20'] },
  },
};
export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {};

export const WeightsAndSizes: Story = {
  render: () => (
    <div className="sb-col">
      {(['regular', 'fill'] as const).map((weight) => (
        <div className="sb-stack" key={weight}>
          {(['14', '16', '18', '20'] as const).map((size) => (
            <Icon key={size} icon={Check} weight={weight} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Accessibility: Story = {
  render: () => (
    <div className="sb-stack">
      <Icon icon={Plus} />
      <Icon icon={Plus} label="Añadir" />
    </div>
  ),
};

// Una por cada entrada de icons/phosphor/registry.json (reexportadas por icons.ts).
const registry = { ArrowRight, CaretDown, Check, CheckCircle, Eye, EyeSlash, GithubLogo, Info, LinkedinLogo, List, MagnifyingGlass, Minus, Plus, Trash, X, YoutubeLogo };
export const Registro: Story = {
  render: () => (
    <div className="sb-stack">
      {Object.entries(registry).map(([name, glyph]) => (
        <Icon key={name} icon={glyph} size="20" label={name} />
      ))}
    </div>
  ),
};
