import { create } from "lodash";

export const constants = {
  localhost: {
    // apiDomain: "http://192.168.0.88:8000",
    // apiDomain: "http://localhost:8000",
    apiDomain: "http://192.168.3.204:8001",
  },
  prod: {
    apiDomain: "https://coolister.top:8000",
  },
  api: {
    getMskLocation: "/sea-saw-api/list-msk-loc",
    getProductOffer: "/sea-saw-api/product-offer",
    listFields: "/sea-saw-crm/fields/",

    contact: "/api/sea-saw-crm/contacts/",
    order: "/api/sales/orders/",
    nestedOrder: "/api/sales/nested-orders/",
    pipeline: "/api/pipeline/pipelines/",
    account: "/api/sea-saw-crm/accounts/",
    company: "/api/sea-saw-crm/companies/",
    product: "/api/sea-saw-crm/products/",
    payment: "/api/finance/payments/",
    nestedPayment: "/api/finance/nested-payments/",
    productionOrder: "/api/production/production-orders/",
    nestedProductionOrder: "/api/production/nested-production-orders/",
    purchaseOrder: "/api/sea-saw-crm/purchase-orders/",
    nestedPurchaseOrder: "/api/procurement/nested-purchase-orders/",
    supplier: "/api/sea-saw-crm/suppliers/",
    outboundOrder: "/api/sea-saw-crm/outbound-orders/",
    nestedOutboundOrder: "/api/warehouse/nested-outbound-orders/",

    listOrdersStats: "/api/sales/orders-stats/",
    listOrdersByMonth: "/api/sales/orders-stats/s2/",
    listContractsStats: "/api/sea-saw-crm/contracts-stats/",

    createProductionOrder: "/api/pipeline/pipelines/{id}/create_production/",
    createOutboundOrder: "/api/pipeline/pipelines/{id}/create_outbound/",
    createPurchaseOrder: "/api/pipeline/pipelines/{id}/create_purchase/",
    orderStatusTransition: "/api/pipeline/pipelines/{id}/transition/",
    pipelineStatusTransition: "/api/pipeline/pipelines/{id}/transition/",

    login: "/api/token/",
    tokenVerify: "/api/token/verify/",
    tokenRefresh: "/api/token/refresh/",
    userProfile: "/api/auth/user-detail/",
    setPasswd: "/auth/users/set_password/",
    register: "/api/auth/register/",
    profileUpdate: "/api/auth/profile/update/",

    listDownloads: "/api/download/download-tasks/",
    crmDownload: "/api/sea-saw-crm/download/",

    getUserColPreference: "/api/preference/user-column-preference/",
    createUserColPreference: "/api/preference/user-column-preference/",
  },
  agGridLicense:
    "115cf8e0-b7b1-4f71-9de7-943f7999b3f9[v32]0102_NDEwMjMyOTYwMDAwMA==a6199e52fee935ae85626d004d2023c7",
};
