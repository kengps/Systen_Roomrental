const express = require('express');
const { createRoom, addRentDetails, listRentDetails, listRoom, collectRent, addTenetRoom, updatePrice, apartmant, apartmantData } = require('../../../adapters/controllers/roomController');
const { Hono } = require('hono');
const { UploadFiles ,DeleteFiles} = require('../../../adapters/controllers/uploadFilesController');


const appUploads = new Hono()



//apartmentName
// appRooms.post('/apartment-address', apartmant);
// appRooms.get('/apartment', apartmantData);


appUploads.post('/upload', async (c) => {
    const body = await c.req.parseBody();

    // ถ้าไม่รู้ว่า key คืออะไร
    const file = body.file ?? Object.values(body)[0]; // ใช้ key แรกถ้าไม่มี 'file'

    if (!file || typeof file === 'string') {
        return c.json({ error: 'File not found or invalid' }, 400);
    }

    const result = await UploadFiles(file)
    // ดำเนินการต่อ...
    return c.json({
        result
    });

});

appUploads.delete('/upload/file', async (c) => {

    const { key } = await c.req.query()
    // // ถ้าไม่รู้ว่า key คืออะไร
    // const file = body.file ?? Object.values(body)[0]; // ใช้ key แรกถ้าไม่มี 'file'

    // if (!file || typeof file === 'string') {
    //     return c.json({ error: 'File not found or invalid' }, 400);
    // }

    const result = await DeleteFiles(key)
    // // ดำเนินการต่อ...
    return c.json({
        result: 'df'
    });

});

module.exports = appUploads