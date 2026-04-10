import Box from "@mui/material/Box";
import { OverviewStats } from "@/components/sea-saw-page/dashboard/overview";
import { ShippingCalendar } from "@/components/sea-saw-page/dashboard/ShippingCalendar";

export default function Index() {
  return (
    <Box sx={{ flex: 1, overflow: "auto", p: { xs: 1, md: 2 } }}>
      <OverviewStats />
      <ShippingCalendar />
    </Box>
  );
}
