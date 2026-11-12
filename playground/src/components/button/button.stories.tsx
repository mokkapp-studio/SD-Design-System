import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Plus } from '../icon/icons';
import { Icon } from '../icon/icon';
import { Button } from './button';

const variants = ['classic', 'solid', 'soft', 'surface', 'outline', 'ghost'] as const;
const colors = ['accent', 'neutral', 'error'] as const;
const sizes = ['1', '2', '3', '4'] as const;

const meta: Meta<typeof Button> = {
  title: 'Action/Button',
  component: Button,
  args: { children: 'Guardar cambios', variant: 'solid', color: 'accent', size: '2', highContrast: false, loading: false, disabled: false, type: 'button' },
  argTypes: {
    variant: { control: 'select', options: variants },
    color: { control: 'inline-radio', options: colors },
    size: { control: 'inline-radio', options: sizes },
    icon: { control: false },
    iconEnd: { control: false },
    onPress: { action: 'onPress' },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const VariantsByColor: Story = {
  render: (args) => (
    <div className="sb-col">
      {colors.map((color) => (
        <div className="sb-stack" key={color}>
          {variants.map((variant) => (
            <Button key={variant} {...args} variant={variant} color={color}>{variant}</Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="sb-stack">
      {sizes.map((size) => (
        <Button key={size} {...args} size={size} icon={<Icon icon={Plus} />} iconEnd={<Icon icon={ArrowRight} />}>Size {size}</Button>
      ))}
    </div>
  ),
};

export const HighContrast: Story = {
  render: (args) => (
    <div className="sb-col">
      {colors.map((color) => (
        <div className="sb-stack" key={color}>
          {variants.map((variant) => (
            <Button key={variant} {...args} variant={variant} color={color} highContrast>{variant}</Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className="sb-stack">
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant} disabled>{variant}</Button>
      ))}
    </div>
  ),
};

export const Loading: Story = {
  render: (args) => (
    <div className="sb-stack">
      {variants.map((variant) => (
        <Button key={variant} {...args} variant={variant} loading icon={<Icon icon={Plus} />}>{variant}</Button>
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  args: { icon: <Icon icon={Plus} />, iconEnd: <Icon icon={ArrowRight} />, children: 'Añadir' },
};
