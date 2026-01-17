import React, { forwardRef } from 'react';

// Common border style for the "Pixel" look
const PIXEL_BORDER = "border-2 border-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
const PIXEL_BORDER_ACTIVE = "active:shadow-none active:translate-x-[2px] active:translate-y-[2px]";

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const PixelButton: React.FC<PixelButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  let bgClass = 'bg-white text-gray-900';
  if (variant === 'primary') bgClass = 'bg-blue-100 hover:bg-blue-200';
  if (variant === 'danger') bgClass = 'bg-red-100 hover:bg-red-200';
  if (variant === 'secondary') bgClass = 'bg-gray-100 hover:bg-gray-200';

  return (
    <button
      className={`px-3 py-1.5 text-sm font-bold transition-none ${PIXEL_BORDER} ${PIXEL_BORDER_ACTIVE} ${bgClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const PixelIconBtn: React.FC<PixelButtonProps> = ({ children, className = '', ...props }) => (
    <button
        className={`p-1.5 flex items-center justify-center hover:bg-gray-200 active:translate-y-[1px] ${className}`}
        {...props}
    >
        {children}
    </button>
)

interface PixelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-2 py-2 bg-white text-sm outline-none focus:bg-blue-50 border-2 border-gray-900 ${className}`}
        {...props}
      />
    );
  }
);
PixelInput.displayName = 'PixelInput';

interface PixelSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const PixelSelect: React.FC<PixelSelectProps> = ({ className = '', children, ...props }) => {
    return (
        <select className={`w-full px-2 py-2 bg-white text-sm outline-none focus:bg-blue-50 border-2 border-gray-900 ${className}`} {...props}>
            {children}
        </select>
    )
}

interface PixelSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const PixelSwitch: React.FC<PixelSwitchProps> = ({ checked, onChange }) => {
    return (
        <div 
            onClick={() => onChange(!checked)}
            className={`w-12 h-6 border-2 border-gray-900 cursor-pointer relative transition-colors ${checked ? 'bg-green-100' : 'bg-gray-200'}`}
        >
            <div className={`absolute top-0.5 bottom-0.5 w-4 bg-gray-900 transition-all ${checked ? 'left-[calc(100%-1.25rem)]' : 'left-0.5'}`}></div>
        </div>
    )
}

interface PixelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const PixelModal: React.FC<PixelModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-0 ${PIXEL_BORDER} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-900 bg-gray-100 px-4 py-2">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="hover:text-red-600 font-bold text-xl leading-none">&times;</button>
        </div>
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const PixelLabel: React.FC<{children: React.ReactNode, className?: string}> = ({children, className=''}) => (
    <label className={`block mb-1 text-xs font-bold text-gray-600 uppercase tracking-wider ${className}`}>{children}</label>
)
