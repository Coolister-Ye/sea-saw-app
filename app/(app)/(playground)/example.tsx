import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/sea-saw-design/accordion";
import { Text } from "react-native";

export default function Example() {
  return (
    <Accordion
      type="multiple"
      collapsible
      defaultValue={["item-1"]}
      className="w-full"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <Text>Is it accessible?</Text>
        </AccordionTrigger>
        <AccordionContent>
          <Text>Yes. It adheres to the WAI-ARIA design pattern.</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>
          <Text>What are universal components?</Text>
        </AccordionTrigger>
        <AccordionContent>
          <Text>
            In the world of React Native, universal components are components
            that work on both web and native platforms.
          </Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
