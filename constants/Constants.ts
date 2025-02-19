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

    listContacts: "/api/sea-saw-crm/contacts/",
    createContacts: "/api/sea-saw-crm/contacts/",
    deleteContacts: "/api/sea-saw-crm/contacts/{id}/",
    updateContacts: "/api/sea-saw-crm/contacts/{id}/",

    listContracts: "/api/sea-saw-crm/contracts/",
    createContracts: "/api/sea-saw-crm/contracts/",
    deleteContracts: "/api/sea-saw-crm/contracts/{id}/",
    updateContracts: "/api/sea-saw-crm/contracts/{id}/",

    listDeals: "/api/sea-saw-crm/deals/",
    updateDeals: "/api/sea-saw-crm/deals/{id}/",
    deleteDeals: "/api/sea-saw-crm/deals/{id}/",
    createDeals: "/api/sea-saw-crm/deals/",

    listOrders: "/api/sea-saw-crm/orders/",
    updateOrders: "/api/sea-saw-crm/orders/{id}/",
    deleteOrders: "/api/sea-saw-crm/orders/{id}/",
    createOrders: "/api/sea-saw-crm/orders/",

    listCompanies: "/api/sea-saw-crm/companies/",
    updateCompanies: "/api/sea-saw-crm/companies/{id}/",
    deleteCompanies: "/api/sea-saw-crm/companies/{id}/",
    createCompanies: "/api/sea-saw-crm/companies/",

    deleteProducts: "/api/sea-saw-crm/products/{id}/",

    listOrdersStats: "/api/sea-saw-crm/orders-stats/",
    listOrdersByMonth: "/api/sea-saw-crm/orders-stats/s2/",
    listContractsStats: "/api/sea-saw-crm/contracts-stats/",

    login: "/api/token/",
    tokenVerify: "/api/token/verify/",
    tokenRefresh: "/api/token/refresh/",
    userProfile: "/api/auth/user-detail/",
    setPasswd: "/auth/users/set_password/",

    listDownloads: "/api/download/download-tasks/",
    crmDownload: "/api/sea-saw-crm/download/",

    getUserColPreference: "/api/preference/user-column-preference/",
    createUserColPreference: "/api/preference/user-column-preference/",
  },
  agGridLicense:
    "115cf8e0-b7b1-4f71-9de7-943f7999b3f9[v32]0102_NDEwMjMyOTYwMDAwMA==a6199e52fee935ae85626d004d2023c7",
};
