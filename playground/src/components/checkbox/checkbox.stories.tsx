import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './checkbox';
import type { CheckboxProps } from './checkbox';

const variants = ['classic', 'surface', 'soft'] as const;
const sizes = ['1', '2', '3'] as const;
const values = [false, true, 'indeterminate'] as const;

// Checkbox es controlado (el contrato no tiene defaultChecked): este envoltorio guarda el estado.
function Controlled(props: CheckboxProps) {
  const [checked, setChecked] = useState(props.checked ?? false);
  return <Checkbox {...props} checked={checked} onCheckedChange={setChecked} />;
}

const meta: Meta<typeof Checkbox> = {
  title: 'Field/Checkbox',
  component: Checkbox,
  args: { variant: 'surface', size: '2', highContrast: false, checked: false, disabled: false, label: 'Recibir novedades' },
  argTypes: {
    variant: { control: 'inline-radio', options: variants },
    size: { control: 'inline-radio', options: sizes },
    checked: { control: 'inline-radio', options: [false, true, 'indeterminate'] },
    onCheckedChange: { action: 'onCheckedChange' },
  },
  render: (args) => <Controlled {...args} />,
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const VariantsByValue: Story = {
  render: (args) => (
    <div className="sb-col">
      {variants.map((variant) => (
        <div className="sb-stack" key={variant}>
          {values.map((checked) => (
            <Controlled key={String(checked)} {...args} variant={variant} checked={checked} label={`${variant} · ${String(checked)}`} />
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
        <Controlled key={size} {...args} size={size} checked label={`Size ${size}`} />
      ))}
    </div>
  ),
};

export const HighContrast: Story = {
  render: (args) => (
    <div className="sb-col">
      {variants.map((variant) => (
        <div className="sb-stack" key={variant}>
          <Controlled {...args} variant={variant} highContrast checked label={`${variant} highContrast`} />
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className="sb-col">
      {variants.map((variant) => (
        <div className="sb-stack" key={variant}>
          {values.map((checked) => (
            <Checkbox key={String(checked)} {...args} variant={variant} checked={checked} disabled label={`${variant} · ${String(checked)}`} />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Indeterminate: Story = { args: { checked: 'indeterminate', label: 'Seleccionar todo' } };

export const WithoutLabel: Story = { args: { label: undefined } };
