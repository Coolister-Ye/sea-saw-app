import { cn } from '@/lib/utils';
import { cssInterop } from 'nativewind';
import type { ComponentType } from 'react';

type IconProps = {
  as: ComponentType<any>;
  className?: string;
  size?: number;
  [key: string]: any;
};

function IconImpl({ as: IconComponent, ...props }: IconProps) {
  return <IconComponent {...props} />;
}

cssInterop(IconImpl, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: 'size',
      width: 'size',
    },
  },
});

/**
 * A wrapper component for Lucide icons with Nativewind `className` support via `cssInterop`.
 *
 * This component allows you to render any Lucide icon while applying utility classes
 * using `nativewind`. It avoids the need to wrap or configure each icon individually.
 *
 * @component
 * @example
 * ```tsx
 * import { Ionicons } from '@expo/vector-icons';
 * import { Icon } from '@/registry/components/ui/icon';
 *
 * <Icon as={Ionicons} className="text-red-500" size={16} />
 * ```
 *
 * @param {ComponentType} as - The icon component to render.
 * @param {string} className - Utility classes to style the icon using Nativewind.
 * @param {number} size - Icon size (defaults to 14).
 * @param {...any} ...props - Additional icon props passed to the "as" icon.
 */
function Icon({ as: IconComponent, className, size = 14, ...props }: IconProps) {
  return (
    <IconImpl
      as={IconComponent}
      className={cn('text-foreground', className)}
      size={size}
      {...props}
    />
  );
}

export { Icon };
