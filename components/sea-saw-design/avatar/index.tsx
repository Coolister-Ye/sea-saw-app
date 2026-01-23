import React, { useState, useMemo, forwardRef } from "react";
import { Image } from "expo-image";
import { Text } from "@/components/sea-saw-design/text";
import { View } from "@/components/sea-saw-design/view";
import { Pressable } from "react-native";
import type { PressableProps } from "react-native";
import clsx from "clsx";
import { UserIcon } from "react-native-heroicons/outline";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Avatar component props following Ant Design's API design
 * @see https://ant.design/components/avatar
 */
export interface AvatarProps extends Omit<PressableProps, "onPress" | "children"> {
  /** Shape of avatar */
  shape?: "circle" | "square";
  /** Size of avatar: preset string or custom number (in pixels) */
  size?: "small" | "default" | "large" | number;
  /** Gap between text and avatar edge (for text scaling) */
  gap?: number;
  /** Source URL of the image */
  src?: string;
  /** Icon element to display */
  icon?: React.ReactNode;
  /** Alt text for accessibility */
  alt?: string;
  /** Custom className */
  className?: string;
  /** Background color for text/icon avatars */
  backgroundColor?: string;
  /** Gradient colors for background (overrides backgroundColor if provided). Requires at least 2 colors. */
  gradientColors?: [string, string, ...string[]];
  /** Gradient start position {x, y} (0-1) */
  gradientStart?: { x: number; y: number };
  /** Gradient end position {x, y} (0-1) */
  gradientEnd?: { x: number; y: number };
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Error handler when image fails to load */
  onError?: () => boolean | void;
  /** Children (typically text content) */
  children?: React.ReactNode;
}

const BLURHASH =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

const SIZE_MAP = {
  small: 24,
  default: 32,
  large: 40,
} as const;

/**
 * Avatar component for displaying user profile pictures, icons, or text
 *
 * @example
 * // Image avatar
 * <Avatar src="https://..." alt="User name" />
 *
 * // Text avatar
 * <Avatar>JD</Avatar>
 *
 * // Icon avatar
 * <Avatar icon={<UserIcon />} />
 *
 * // Custom size
 * <Avatar size={64}>AB</Avatar>
 */
export const Avatar = forwardRef<React.ComponentRef<typeof View>, AvatarProps>(
  (
    {
      shape = "circle",
      size = "default",
      gap = 4,
      src,
      icon,
      alt,
      className,
      backgroundColor = "#94a3b8", // slate-400
      gradientColors,
      gradientStart = { x: 0, y: 0 },
      gradientEnd = { x: 1, y: 1 },
      loading = false,
      onClick,
      onError,
      children,
      ...pressableProps
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);

    // Calculate actual size in pixels
    const sizeInPx = useMemo(
      () => (typeof size === "number" ? size : SIZE_MAP[size]),
      [size]
    );

    // Calculate text size based on avatar size
    const textSize = useMemo(() => {
      const baseSize = sizeInPx / 2;
      return Math.max(12, Math.min(baseSize, 24));
    }, [sizeInPx]);

    // Calculate icon size (slightly smaller than avatar)
    const iconSize = useMemo(() => sizeInPx * 0.6, [sizeInPx]);

    // Base container classes
    const containerClassName = clsx(
      "flex items-center justify-center overflow-hidden",
      shape === "circle" ? "rounded-full" : "rounded-lg",
      onClick && "hover:opacity-80 active:opacity-90",
      className
    );

    const containerStyle = {
      width: sizeInPx,
      height: sizeInPx,
    };

    // Loading state
    if (loading) {
      return (
        <View
          ref={ref}
          className={clsx(containerClassName, "bg-gray-300 animate-pulse")}
          style={containerStyle}
        />
      );
    }

    // Handle image error
    const handleImageError = () => {
      setImageError(true);
      onError?.();
    };

    // Background wrapper component (gradient or solid color)
    const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => {
      if (gradientColors && gradientColors.length > 0) {
        return (
          <LinearGradient
            colors={gradientColors}
            start={gradientStart}
            end={gradientEnd}
            className={containerClassName}
            style={containerStyle}
          >
            {children}
          </LinearGradient>
        );
      }

      return (
        <View
          className={containerClassName}
          style={{ ...containerStyle, backgroundColor }}
        >
          {children}
        </View>
      );
    };

    // Determine what to render (priority: src → icon → children → default icon)
    const renderContent = () => {
      // Try to render image first
      if (src && !imageError) {
        return (
          <Image
            source={{ uri: src }}
            alt={alt}
            placeholder={{ blurhash: BLURHASH }}
            contentFit="cover"
            transition={300}
            onError={handleImageError}
            className="w-full h-full"
            style={{ width: sizeInPx, height: sizeInPx }}
          />
        );
      }

      // Render icon if provided
      if (icon) {
        return (
          <BackgroundWrapper>
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<any>, {
                  size: iconSize,
                  className: "text-white",
                })
              : icon}
          </BackgroundWrapper>
        );
      }

      // Render text from children
      if (children) {
        const text = String(children);
        const displayText = text.slice(0, 2).toUpperCase();

        return (
          <BackgroundWrapper>
            <Text
              className="font-semibold text-white"
              style={{ fontSize: textSize - gap, lineHeight: textSize }}
            >
              {displayText}
            </Text>
          </BackgroundWrapper>
        );
      }

      // Default fallback icon
      return (
        <BackgroundWrapper>
          <UserIcon size={iconSize} className="text-white" />
        </BackgroundWrapper>
      );
    };

    // Wrap in Pressable if onClick is provided
    if (onClick) {
      return (
        <Pressable
          {...pressableProps}
          onPress={onClick}
          className={containerClassName}
          style={containerStyle}
        >
          {renderContent()}
        </Pressable>
      );
    }

    return (
      <View ref={ref} className={containerClassName} style={containerStyle}>
        {renderContent()}
      </View>
    );
  }
);

Avatar.displayName = "Avatar";
