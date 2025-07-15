
const { ApartmentSchemaModel } = require("../../../frameworks/database/mongoDB/models/apartments/apartment");
const meter = require("../../../frameworks/database/mongoDB/models/apartments/meter");
const profile = require("../../../frameworks/database/mongoDB/models/profile");
const mongoose = require('mongoose');

exports.addMeters = async (accountId, metersData) => {
    try {
        if (!accountId) {
            const error = new Error("accountId is required");
            error.status = 400;
            throw error;
        }

        if (!metersData || Object.keys(metersData).length === 0) {
            const error = new Error("At least one meter data is required");
            error.status = 400;
            throw error;
        }

        // หา apartment
        const apartment = await ApartmentSchemaModel.findOne({
            owner: new mongoose.Types.ObjectId(accountId),
        });

        if (!apartment) {
            const error = new Error("Apartment not found");
            error.status = 404;
            throw error;
        }

        const updatedMeters = [];

        // Loop ตาม meterType (water, electric)
        for (const meterType in metersData) {
            const meterInfo = metersData[meterType];

            if (!meterInfo || typeof meterInfo !== "object") continue;

            const { billingType, rate, flatRate, otherMethodName, otherMethodDetail } = meterInfo;

            if (!billingType) {
                const error = new Error(`billingType is required for meter type ${meterType}`);
                error.status = 400;
                throw error;
            }

            // หา existing meter (ถ้ามี)
            let existingMeter = await meter.findOne({
                apartmentId: apartment._id,
                meterType,
            });

            if (existingMeter) {
                // Update
                existingMeter.billingType = billingType;

                if (billingType === "flatRate") {
                    if (typeof flatRate !== "number") {
                        const error = new Error(`flatRate must be a number for ${meterType}`);
                        error.status = 400;
                        throw error;
                    }
                    existingMeter.flatRate = flatRate;
                    existingMeter.rate = undefined;
                    existingMeter.otherMethodName = undefined;
                    existingMeter.otherMethodDetail = undefined;

                } else if (billingType === "perUnit") {
                    if (typeof rate !== "number") {
                        const error = new Error(`rate must be a number for ${meterType}`);
                        error.status = 400;
                        throw error;
                    }
                    existingMeter.rate = rate;
                    existingMeter.flatRate = undefined;
                    existingMeter.otherMethodName = undefined;
                    existingMeter.otherMethodDetail = undefined;

                } else if (billingType === "other") {
                    if (!otherMethodName || !otherMethodDetail) {
                        const error = new Error(`otherMethodName and otherMethodDetail are required for ${meterType}`);
                        error.status = 400;
                        throw error;
                    }
                    existingMeter.otherMethodName = otherMethodName;
                    existingMeter.otherMethodDetail = otherMethodDetail;
                    existingMeter.flatRate = undefined;
                    existingMeter.rate = undefined;

                } else {
                    const error = new Error(`Invalid billingType for ${meterType}`);
                    error.status = 400;
                    throw error;
                }

                await existingMeter.save();
                updatedMeters.push(existingMeter);

            } else {
                // Create new meter
                const newMeter = new meter({
                    apartmentId: apartment._id,
                    meterType,
                    billingType,
                });

                if (billingType === "flatRate") {
                    if (typeof flatRate !== "number") {
                        const error = new Error(`flatRate must be a number for ${meterType}`);
                        error.status = 400;
                        throw error;
                    }
                    newMeter.flatRate = flatRate;

                } else if (billingType === "perUnit") {
                    if (typeof rate !== "number") {
                        const error = new Error(`rate must be a number for ${meterType}`);
                        error.status = 400;
                        throw error;
                    }
                    newMeter.rate = rate;

                } else if (billingType === "other") {
                    if (!otherMethodName || !otherMethodDetail) {
                        const error = new Error(`otherMethodName and otherMethodDetail are required for ${meterType}`);
                        error.status = 400;
                        throw error;
                    }
                    newMeter.otherMethodName = otherMethodName;
                    newMeter.otherMethodDetail = otherMethodDetail;

                } else {
                    const error = new Error(`Invalid billingType for ${meterType}`);
                    error.status = 400;
                    throw error;
                }

                const savedMeter = await newMeter.save();

                // เพิ่ม meter เข้า apartment.meters ถ้ายังไม่มี
                if (!apartment.meters.includes(savedMeter._id)) {
                    apartment.meters.push(savedMeter._id);
                }

                updatedMeters.push(savedMeter);
            }
        }

        await apartment.save();

        return updatedMeters;

    } catch (error) {
        console.error("❌ Error in addMeters:", error);
        throw error;
    }
};




exports.getMeters = async (accountId) => {
    try {

        const apartment = await ApartmentSchemaModel.findOne({
            owner: new mongoose.Types.ObjectId(accountId),
        }).populate('meters').select('meters -_id');

        return apartment
        //const result  = await meter.find()

    } catch (error) {
        console.error("❌ Error in addMeters:", error);
        throw error;
    }
};

