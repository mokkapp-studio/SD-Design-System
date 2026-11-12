import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './switch';
import type { SwitchProps } from './switch';

const variants = ['classic', 'surface', 'soft'] as const;
const sizes = ['1', '2', '3'] as const;

// Switch es controlado (el contrato no tiene defaultChecked): este envoltorio guarda el estado.
function Controlled(props: SwitchProps) {
  const [checked, setChecked] = useState(props.checked ?? false);
  return <Switch {...props} checked={checked} onCheckedChange={setChecked} />;
}

const meta: Meta<typeof Switch> = {
  title: 'Field/Switch',
  component: Switch,
  args: { variant: 'surface', size: '2', highContrast: false, checked: false, disabled: false, label: 'Notificaciones' },
  argTypes: {
    variant: { control: 'inline-radio', options: variants },
    size: { control: 'inline-radio', options: sizes },
    onCheckedChange: { action: 'onCheckedChange' },
  },
  render: (args) => <Controlled {...args} />,
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="sb-col">
      {variants.map((variant) => (
        <div className="sb-stack" key={variant}>
          <Controlled {...args} variant={variant} label={`${variant} apagado`} />
          <Controlled {...args} variant={variant} checked label={`${variant} encendido`} />
          <Controlled {...args} variant={variant} checked highContrast label={`${variant} highContrast`} />
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="sb-stack">
      {sizes.map((size) => (
        <Controlled key={size} {...args} size={size} checked label={`Size ${size}`} />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className="sb-stack">
      <Switch {...args} disabled label="Apagado" />
      <Switch {...args} disabled checked label="Encendido" />
    </div>
  ),
};

export const WithoutLabel: Story = { args: { label: undefined } };
