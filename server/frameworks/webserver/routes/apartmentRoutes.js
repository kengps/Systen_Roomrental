const express = require('express')
const { addTanets, getTenantParent, updateTenancy, addBankAccount, getBanksAccount, deleteBanksAccount } = require('../../../adapters/controllers/apartmentController')
const { Hono } = require('hono')
const { auth } = require('../middleware/auth')
const { apartmant, apartmantData, addServices, getServices, assignServicesTenant, deleteServicesTenant, ImageLogo } = require('../../../adapters/controllers/roomController')
const { getDataBilling, addBilling, Billing, ListPayments, confirmPayments, canclePayments } = require('../../../adapters/controllers/billingController')
const { informationApartmentForTenant, BillingTenant, PayMentsTenant } = require('../../../adapters/controllers/forTenantController')
const { saveSlip, checkSlip, fullkey, getNotifications } = require('../../../adapters/controllers/slipuploadController')
const { checkBotUpdate, addSocialAccount, sendMessage } = require('../../../adapters/controllers/checkBotUpdate')
const { listBots, createBot, updateBot, deleteBot } = require('../../../adapters/controllers/botTelegramController')



const appApartment = new Hono()
//เพิ่มหอ
appApartment.post('/apartment-address', apartmant);

appApartment.post('/image-logo', ImageLogo);

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
appApartment.post('/billing', addBilling)
appApartment.get('/data-billing/:accountId', getDataBilling)
appApartment.get('/billing/:accountId', Billing)

//payment
appApartment.get('/payments/:accountId', ListPayments)
appApartment.post('/payments/confirm', confirmPayments);
appApartment.post('/checkslip', checkSlip);

appApartment.patch('/payments/cancel/:paymentId', canclePayments);


//*---------------------------Tenants------------------------------*//
// ข้อมูลฝั่งผู้เช่า
appApartment.get('/tenant/information-apartment/:accountId', informationApartmentForTenant);
appApartment.get('/tenant/billing/:accountId', BillingTenant);
appApartment.post('/tenant/payments', PayMentsTenant);







appApartment.get('/key', fullkey);

appApartment.post('/checkBotUpdate', checkBotUpdate);
appApartment.post('/add-social-account', addSocialAccount);
appApartment.post('/send-message', auth, sendMessage);

// Bot Telegram CRUD
appApartment.get('/bots', listBots);
appApartment.post('/bots', createBot);
appApartment.put('/bots/:id', updateBot);
appApartment.delete('/bots/:id', deleteBot);


// appApartment.get('/notifications',auth ,getNotifications);



module.exports = appApartment