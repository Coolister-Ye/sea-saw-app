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
    order: "/api/sea-saw-crm/orders/",
    nestedOrder: "/api/sea-saw-crm/nested-orders/",
    pipeline: "/api/sea-saw-crm/pipelines/",
    company: "/api/sea-saw-crm/companies/",
    product: "/api/sea-saw-crm/products/",
    payment: "/api/sea-saw-crm/payments/",
    nestedPayment: "/api/sea-saw-crm/nested-payments/",
    productionOrder: "/api/sea-saw-crm/production-orders/",
    nestedProductionOrder: "/api/sea-saw-crm/nested-production-orders/",
    purchaseOrder: "/api/sea-saw-crm/purchase-orders/",
    nestedPurchaseOrder: "/api/sea-saw-crm/nested-purchase-orders/",
    supplier: "/api/sea-saw-crm/suppliers/",
    outboundOrder: "/api/sea-saw-crm/outbound-orders/",
    nestedOutboundOrder: "/api/sea-saw-crm/nested-outbound-orders/",

    listOrdersStats: "/api/sea-saw-crm/orders-stats/",
    listOrdersByMonth: "/api/sea-saw-crm/orders-stats/s2/",
    listContractsStats: "/api/sea-saw-crm/contracts-stats/",

    createProductionOrder: "/api/sea-saw-crm/pipelines/{id}/create_production/",
    createOutboundOrder: "/api/sea-saw-crm/pipelines/{id}/create_outbound/",
    createPurchaseOrder: "/api/sea-saw-crm/pipelines/{id}/create_purchase/",
    orderStatusTransition: "/api/sea-saw-crm/pipelines/{id}/transition/",
    pipelineStatusTransition: "/api/sea-saw-crm/pipelines/{id}/transition/",

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
