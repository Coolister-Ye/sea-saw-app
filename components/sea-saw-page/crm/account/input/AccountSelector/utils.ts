import { ROLE_COLORS } from "./constants";
import type { Account, AccountApiResponse, AccountRole } from "./types";

export const getRoleColors = (role?: AccountRole) => {
  return ROLE_COLORS[role ?? "PROSPECT"];
};

export const mapResponseToItems = (response: AccountApiResponse): Account[] => {
  return response.results.map((item) => ({
    id: item.pk ?? item.id ?? "",
    pk: item.pk ?? item.id,
    account_name: item.account_name ?? "",
    address: item.address,
    phone: item.phone,
    mobile: item.mobile,
    email: item.email,
    website: item.website,
    industry: item.industry,
    description: item.description,
    roles: item.roles,
  }));
};
