import { type EtaOrderEntry, type OrderEntry } from "./types";
import { EtdOrderTag } from "./EtdOrderTag.web";
import { EtaOrderTag } from "./EtaOrderTag.web";

type Props = {
  orders: OrderEntry[];
  etaOrders?: EtaOrderEntry[];
  onOrderClick: () => void;
};

export function ShippingCalendarCell({ orders, etaOrders = [], onOrderClick }: Props) {
  if (orders.length === 0 && etaOrders.length === 0) return null;
  return (
    <>
      {orders.map((order) => (
        <EtdOrderTag
          key={order.order_code}
          order={order}
          onOrderClick={onOrderClick}
        />
      ))}
      {etaOrders.map((entry) => (
        <EtaOrderTag
          key={`eta-${entry.outbound_code}`}
          entry={entry}
          onOrderClick={onOrderClick}
        />
      ))}
    </>
  );
}
