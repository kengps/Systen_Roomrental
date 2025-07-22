const { default: mongoose } = require("mongoose");
const { ApartmentSchemaModel } = require("../../../frameworks/database/mongoDB/models/apartments/apartment");
const { Bill } = require("../../../frameworks/database/mongoDB/models/bill/bill");
const profile = require("../../../frameworks/database/mongoDB/models/profile");
const { sendError } = require("../../../frameworks/webserver/utils/responseMessage");


const englishMonthMap = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
};


// exports.ListBill = async (ownerId, month, year) => {
//     try {

//         const apartmantId = await ApartmentSchemaModel.findOne({ owner: ownerId }).select('_id').exec()



//         const billApartment = await Bill.find({
//             apartment: apartmantId._id,
//             'billingPeriod.month': Number(month),
//             'billingPeriod.year': Number(year),

//         })

//         if (!billApartment) {
//             return sendError('ไม่พบ', `bill ${englishMonthMap[month] + ' ' + year} `)
//         }

//         return billApartment
//     } catch (error) {
//         console.error('Error in BillingCategory:', error);
//         return { success: false, error: error.message };
//     }
// };


exports.ListBill = async (ownerId, month, year) => {
    try {
        const billApartment = await Bill.aggregate([
            {
                $lookup: {
                    from: 'apartments', // ชื่อ collection ของ ApartmentSchemaModel
                    localField: 'apartment',
                    foreignField: '_id',
                    as: 'apartmentData'
                }
            },
            {
                $match: {
                    'apartmentData.owner': new mongoose.Types.ObjectId(ownerId),
                    'billingPeriod.month': Number(month),
                    'billingPeriod.year': Number(year)
                }
            },
            {
                $project: {
                    apartmentData: 0 // ถ้าไม่ต้องการข้อมูล apartment ใน result
                }
            }
        ]);

        if (!billApartment || billApartment.length === 0) {
            return sendError('ไม่พบ', `bill ${englishMonthMap[month] + ' ' + year} `);
        }

        return billApartment;


    } catch (error) {
        console.error('Error in ListBill:', error);
        return { success: false, error: error.message };
    }
};
