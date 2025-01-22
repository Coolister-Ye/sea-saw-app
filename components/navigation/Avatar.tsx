import React from "react";
import Image from "@/components/themed/Image";
import Text from "@/components/themed/Text";
import { Pressable, View } from "react-native";
import clsx from "clsx";
import _ from "lodash";
import { QuestionMarkCircleIcon } from "react-native-heroicons/outline";

type AvatarProps = {
  size?: "small" | "medium" | "large";
  source?: string; // Image URL (optional)
  text?: string; // Text for the avatar (optional)
  onPress?: () => void;
  className?: string;
};

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export const Avatar = ({
  size = "medium",
  source,
  text,
  onPress,
  className,
}: AvatarProps) => {
  const _className = clsx(
    size === "small" && "size-6 text-sm ",
    size === "medium" && "size-8 text-md",
    size === "large" && "size-10 text-lg",
    "items-center justify-center hover:opacity-90",
    className
  );
  const _textClassName = clsx(
    size === "small" && "text-xs",
    size === "medium" && "text-md",
    size === "large" && "text-lg",
    "font-medium text-white"
  );

  if (!source && !text) {
    return (
      <Pressable onPress={onPress} className={_className}>
        <View className={clsx(_className, "rounded-lg")}>
          <QuestionMarkCircleIcon
            size={size === "small" ? 24 : size === "medium" ? 32 : 40}
            className={clsx(_textClassName, "text-zinc-500")}
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
          className="h-full w-full"
        />
      ) : (
        <View className={clsx(_className, "rounded-lg bg-zinc-500 shadow-md")}>
          <Text className={_textClassName}>
            {text?.slice(0, 2).toUpperCase()}
          </Text>
        </View>
      )}
    </Pressable>
  );
};
