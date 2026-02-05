import { ButtonProps as RBButtonProps } from 'react-bootstrap';
export interface ButtonProps extends RBButtonProps {
    label: string;
    variant?: string;
    disabled?: boolean;
    size?: 'sm' | 'lg';
}
export declare const Button: React.FC<ButtonProps>;
