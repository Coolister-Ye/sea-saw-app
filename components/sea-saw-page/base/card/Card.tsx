import React, { ReactNode } from "react";
import { View } from "react-native";
import CardHeader from "./CardHeader";
import CardSection from "./CardSection";
import CardFooter from "./CardFooter";

interface CardProps {
  children: ReactNode;
  className?: string;
  accentClass?: string;
}

/**
 * Composable Card component for displaying entity details
 *
 * @example
 * <Card>
 *   <Card.Header
 *     code="PIP-001"
 *     status={<StatusTag />}
 *     right={<AccountPopover />}
 *   />
 *   <Card.Section title="Basic Info">
 *     <FieldGrid>
 *       <Field label="Type" value={type} />
 *       <Field label="Date" value={date} />
 *     </FieldGrid>
 *   </Card.Section>
 *   <Card.Footer metadata={item} onEdit={handleEdit} />
 * </Card>
 */
export default function Card({
  children,
  className = "",
  accentClass = ""
}: CardProps) {
  return (
    <View
      className={`bg-white rounded-xl overflow-hidden border border-slate-200/80 shadow-sm ${accentClass} ${className}`}
    >
      {children}
    </View>
  );
}

// Attach subcomponents
Card.Header = CardHeader;
Card.Section = CardSection;
Card.Footer = CardFooter;
