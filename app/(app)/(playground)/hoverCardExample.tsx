import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Text } from "@/components/ui/text";
import Modal from "react-native-modal";

export default function HoverCardExample() {
  return (
    <Modal isVisible={true}>
      <HoverCard openDelay={0}>
        <HoverCardTrigger>
          <Text>Hover</Text>
        </HoverCardTrigger>
        <HoverCardContent>
          <Text>The React Framework – created and maintained by @vercel.</Text>
        </HoverCardContent>
      </HoverCard>
    </Modal>
  );
}
