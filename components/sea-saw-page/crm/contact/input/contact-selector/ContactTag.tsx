import React, { memo } from "react";
import { View, Pressable } from "react-native";
import { XMarkIcon } from "react-native-heroicons/outline";

import { Text } from "@/components/sea-saw-design/text";
import ContactAvatar from "./ContactAvatar";
import type { Contact } from "./types";

interface ContactTagProps {
  contact: Contact;
  onRemove?: (id: string | number) => void;
  readOnly?: boolean;
}

const ContactTag = memo(({ contact, onRemove, readOnly }: ContactTagProps) => (
  <View className="flex-row items-center bg-blue-50 border border-blue-200 rounded-md px-2.5 py-0.5">
    <ContactAvatar name={contact.name} size="small" />
    <Text className="text-sm text-blue-800 font-medium ml-1.5">
      {contact.name}
    </Text>
    {!readOnly && onRemove && (
      <Pressable
        onPress={() => onRemove(contact.id)}
        className="ml-1.5 p-0.5 rounded-full hover:bg-blue-100 active:bg-blue-200"
      >
        <XMarkIcon size={14} className="text-blue-400" />
      </Pressable>
    )}
  </View>
));
ContactTag.displayName = "ContactTag";

export default ContactTag;
