import React from "react";
import type { ParentIconMap } from "@/components/sea-saw-design/drawer/types";
import {
  HomeIcon,
  UsersIcon,
  UserIcon,
  BuildingOfficeIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  ChartBarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  UserCircleIcon,
  PencilSquareIcon,
  LockClosedIcon,
  BeakerIcon,
  DocumentTextIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

const ICON_STYLE = { width: 16, height: 16 };

/** Web: icon map for collapsed drawer display */
export const useParentIconMap = (): ParentIconMap => ({
  index: React.createElement(HomeIcon, { style: ICON_STYLE }),
  "(crm)": React.createElement(UsersIcon, { style: ICON_STYLE }),
  "(crm)/contact": React.createElement(UserIcon, { style: ICON_STYLE }),
  "(crm)/account": React.createElement(BuildingOfficeIcon, { style: ICON_STYLE }),
  "(crm)/bank-account": React.createElement(CreditCardIcon, { style: ICON_STYLE }),
  "(sales)": React.createElement(ShoppingCartIcon, { style: ICON_STYLE }),
  "(sales)/order": React.createElement(ClipboardDocumentListIcon, { style: ICON_STYLE }),
  "(production)": React.createElement(WrenchScrewdriverIcon, { style: ICON_STYLE }),
  "(production)/production": React.createElement(CogIcon, { style: ICON_STYLE }),
  "(pipeline)": React.createElement(ChartBarIcon, { style: ICON_STYLE }),
  "(pipeline)/pipeline": React.createElement(FunnelIcon, { style: ICON_STYLE }),
  "(download)": React.createElement(ArrowDownTrayIcon, { style: ICON_STYLE }),
  "(download)/download": React.createElement(ArrowDownTrayIcon, { style: ICON_STYLE }),
  "(setting)": React.createElement(CogIcon, { style: ICON_STYLE }),
  "(setting)/profile": React.createElement(UserCircleIcon, { style: ICON_STYLE }),
  "(setting)/profile-edit": React.createElement(PencilSquareIcon, { style: ICON_STYLE }),
  "(setting)/password": React.createElement(LockClosedIcon, { style: ICON_STYLE }),
  "(playground)": React.createElement(BeakerIcon, { style: ICON_STYLE }),
  "(playground)/playground": React.createElement(BeakerIcon, { style: ICON_STYLE }),
  "(playground)/example": React.createElement(DocumentTextIcon, { style: ICON_STYLE }),
});
