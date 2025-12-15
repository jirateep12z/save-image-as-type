import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { Cn } from '@/utils';
import { BUTTON_VARIANTS } from './button-variants';

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: ComponentProps<'button'> &
  VariantProps<typeof BUTTON_VARIANTS> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={Cn(BUTTON_VARIANTS({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
