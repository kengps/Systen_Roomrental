const express = require('express')
const { addTanets, getTenantParent, updateTenancy, addBankAccount, getBanksAccount, deleteBanksAccount } = require('../../../adapters/controllers/apartmentController')
const { Hono } = require('hono')
const { auth } = require('../middleware/auth')
const { apartmant, apartmantData, addServices, getServices, assignServicesTenant, deleteServicesTenant } = require('../../../adapters/controllers/roomController')
const { getDataBilling, addBilling, Billing } = require('../../../adapters/controllers/billingController')
const { informationApartmentForTenant, BillingTenant } = require('../../../adapters/controllers/forTenantController')



const appApartment = new Hono()
//เพิ่มหอ
appApartment.post('/apartment-address', apartmant);

appApartment.post('/add-services', addServices);


appApartment.get('/apartment', apartmantData);

appApartment.get('/get-services', getServices);

appApartment.post('/tenants/:tenantId/services', assignServicesTenant);

appApartment.patch('/tenants/:tenantId/serviceUsage/:serviceUsageId', deleteServicesTenant);

//เพิ่มข้อมูลผู้เช่าใหม่ พร้อมสร้าง username
appApartment.post('/add-tenant', addTanets)

appApartment.get('/get-tenant', getTenantParent)

appApartment.put('/update-tenancy/:tenantId', updateTenancy)


//บัญชีธนาคารของฉัน
appApartment.post('/bank-account', addBankAccount)
appApartment.get('/bank-account/:accountId', getBanksAccount)
appApartment.delete('/bank-account/:bankId', deleteBanksAccount)

//bill ดึงข้อมูลที่ต้องใช้ในการแจ้งชำระ
appApartment.get('/data-billing/:accountId', getDataBilling)

appApartment.post('/billing', addBilling)

appApartment.get('/billing/:accountId', Billing)

// ข้อมูลฝั่งผู้เช่า
appApartment.get('/tenant/information-apartment/:accountId', informationApartmentForTenant);
appApartment.get('/tenant/billing/:accountId', BillingTenant);



module.exports = appApartment