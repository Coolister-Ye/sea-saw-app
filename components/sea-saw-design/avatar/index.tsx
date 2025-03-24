import React from "react";
import Image from "@/components/themed/Image";
import Text from "@/components/themed/Text";
import { Pressable, View, ActivityIndicator } from "react-native";
import clsx from "clsx";
import { QuestionMarkCircleIcon } from "react-native-heroicons/outline";

type AvatarProps = {
  size?: "small" | "medium" | "large";
  source?: string;
  text?: string;
  onPress?: () => void;
  className?: string;
  isLoading?: boolean;
};

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export const Avatar = ({
  size = "medium",
  source,
  text,
  onPress,
  className,
  isLoading = false,
}: AvatarProps) => {
  const _className = clsx(
    "flex items-center justify-center rounded-lg hover:opacity-90",
    size === "small" && "w-6 h-6 text-sm",
    size === "medium" && "w-8 h-8 text-md",
    size === "large" && "w-10 h-10 text-lg",
    className
  );
  const _textClassName = clsx(
    "font-medium text-white",
    size === "small" && "text-xs",
    size === "medium" && "text-md",
    size === "large" && "text-lg"
  );

  if (isLoading) {
    return <View className={clsx(_className, "bg-gray-500 animate-pulse")} />;
  }

  if (!source && !text) {
    return (
      <Pressable onPress={onPress} className={_className}>
        <View className={_className}>
          <QuestionMarkCircleIcon
            size={size === "small" ? 24 : size === "medium" ? 32 : 40}
            className="text-zinc-500"
          />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} className={_className}>
      {source ? (
        <Image
          source={source}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
          className="w-full h-full rounded-lg"
        />
      ) : (
        <View className={clsx(_className, "bg-zinc-500 shadow-md")}>
          <Text className={_textClassName}>
            {text?.slice(0, 2).toUpperCase()}
          </Text>
        </View>
      )}
    </Pressable>
  );
};
