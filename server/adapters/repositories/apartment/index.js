const { default: mongoose } = require("mongoose");
const { ApartmentSchemaModel } = require("../../../frameworks/database/mongoDB/models/apartments/apartment");
const { Room } = require("../../../frameworks/database/mongoDB/models/roomDetail");
const { sendError } = require("../../../frameworks/webserver/utils/responseMessage");
const banks = require("../../../frameworks/database/mongoDB/models/apartments/banks");




exports.addressApartment = async (value) => {
    const {
        zipCode,
        tambon,
        amphure,
        province,
        phones,
        addressLine,
        profileId
    } = value

    console.log(`📦 Incoming value:`, value)

    try {
        const updated = await ApartmentSchemaModel.findOneAndUpdate(
            { owner: profileId },
            {
                $set: {

                    addressLine,
                    province,
                    amphure,
                    tambon,
                    zipCode,

                    phones
                }
            },
            { new: true, upsert: true }
        );




        return updated
    } catch (error) {
        console.error(`❌ Error saving apartment:`, error)
        throw error
    }
}
exports.apartmentData = async (profileId) => {


    const data = await ApartmentSchemaModel.findOne({
        owner: profileId
    }).exec();


    if (data && data.meters) {
        await data.populate('meters');
    }



    return data


}

exports.findRoom = async (roomId, session) => {
    try {
        const room = await Room.findOne({ _id: roomId }).session(session)


        return room

    } catch (error) {
        throw error
    }

}
exports.updateStatusRoom = async (roomId, statusTenancy) => {
    try {
        let status

        if (statusTenancy === 'moved') {
            status = 'available' //ถ้าออก ให้ห้องเป็น สเตตัสว่าง
        }
        if (statusTenancy === 'renting') {
            status = 'unavailable' //ถ้าเข้า ให้ห้องเป็น สเตตัสไม่ว่าง
        }
        const room = await Room.findByIdAndUpdate(
            { _id: roomId },
            { $set: { status: status } },
            { new: true }
        )


        return room

    } catch (error) {
        throw error
    }

}
exports.addServicesInApartment = async (accountId, services) => {

    try {

        const data = await ApartmentSchemaModel.findOne({
            owner: accountId
        }).exec();


        if (!data) {
            sendError('ไม่พบข้อมูล', 'Your Apartment')
            // const error = new Error("Your Apartment not found");
            // error.status = 404;
            // throw error;
        }

        // เช็คว่ามี name นี้อยู่แล้วหรือยัง
        const existServiceName = await data.services.some(s => s.name === services.name)



        if (existServiceName) {
            // throw new Error("Service name already exists");
            await sendError('ซ้ำ', 'Service name')
            const error = new Error("Service name already exists");
            error.status = 409;
            throw error;
        }


        // ถ้าไม่มี ให้เพิ่ม
        data.services.push(services);
        return await data.save();



    } catch (error) {
        throw error
    }

}
exports.getServicesInApartment = async (accountId) => {

    try {

        const data = await ApartmentSchemaModel.findOne({ owner: accountId }).select('services -_id').exec();


        if (!data) {
            sendError('ไม่พบข้อมูล', 'Your Apartment')
            // const error = new Error("Your Apartment not found");
            // error.status = 404;
            // throw error;
        }

        return data



    } catch (error) {
        throw error
    }

}
exports.BankAccount = async (ownerId, bankKey, accountNumber, accountName) => {
    try {
        const apartment = await ApartmentSchemaModel.findOne({ owner: ownerId }).select('_id');

        if (!apartment) {
            return sendError('ไม่พบ', 'No apartments');
        }

        const newBank = new banks({
            apartmentId: apartment._id,
            bankKey,

            accountNumber,
            accountName
        });

        return await newBank.save();
    } catch (error) {
        if (error.code === 11000 && error.keyPattern.accountNumber) {
            return sendError('ซ้ำ', 'Bank Number')

        }
        return sendError('เกิดข้อผิดพลาด', error.message || 'Internal server error');
    }
};

exports.getBankAccount = async (ownerId) => {


    try {
        const billApartment = await banks.aggregate([
            {
                $lookup: {
                    from: 'apartments', // ชื่อ collection ของ ApartmentSchemaModel
                    localField: 'apartmentId',
                    foreignField: '_id',
                    as: 'apartmentData'
                }
            },
            {
                $match: {
                    'apartmentData.owner': new mongoose.Types.ObjectId(ownerId),
                }
            },
            {
                $project: {
                    apartmentData: 0 // ถ้าไม่ต้องการข้อมูล apartment ใน result
                }
            }
        ]);
        console.log(`⩇⩇:⩇⩇🚨 ~ exports.getBankAccount= ~ billApartment :`, billApartment);


        if (!billApartment || billApartment.length === 0) {
            return sendError('ไม่พบ', `bill ${englishMonthMap[month] + ' ' + year} `);
        }

        return billApartment;

    } catch (error) {
        if (error.code === 11000 && error.keyPattern.accountNumber) {
            return sendError('ซ้ำ', 'Bank Number')

        }
        return sendError('เกิดข้อผิดพลาด', error.message || 'Internal server error');
    }
};


exports.deleteBankAccountId = async (id) => {

    try {

        return await banks.findOneAndDelete({ _id: id })

    } catch (error) {
        throw error
    }
}
