import React, { memo } from "react";
import { View } from "react-native";
import { EnvelopeIcon } from "@heroicons/react/20/solid";

import { Text } from "@/components/sea-saw-design/text";
import ContactAvatar from "./ContactAvatar";
import type { Contact } from "./types";

interface ContactItemProps {
  contact: Contact;
}

const ContactItem = memo(({ contact }: ContactItemProps) => (
  <View className="flex-row items-center">
    <ContactAvatar name={contact.name} />
    <View className="flex-1 ml-3">
      <Text className="text-sm font-medium text-gray-800">{contact.name}</Text>
      {contact.email && (
        <View className="flex-row items-center mt-0.5">
          <EnvelopeIcon className="w-3 h-3 text-gray-400 mr-1" />
          <Text className="text-xs text-gray-500">{contact.email}</Text>
        </View>
      )}
    </View>
  </View>
));
ContactItem.displayName = "ContactItem";

export default ContactItem;
