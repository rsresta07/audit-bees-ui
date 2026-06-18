import React from 'react';
import { Button, ButtonProps } from '@mantine/core';

interface CommonButtonProps extends ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: any;
  href?: string;
  mb?: string | number;
  disabled?: boolean;
}

export function CommonButton({ children, ...props }: CommonButtonProps) {
  return (
    <Button {...props}>
      {children}
    </Button>
  );
}
