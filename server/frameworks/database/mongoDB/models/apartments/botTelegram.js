// import mongoose, { Document, Schema } from 'mongoose';



// const BotGroupSchema = new Schema({
//     botId: { type: String, required: true },
//     chatIds: [{
//         id: { type: String, required: true },
//         groupName: { type: String, required: true },
//         about: { type: String },
//     }],
// }, { _id: false });

// const BotSchema = new Schema({
//     token: { type: String, required: true, unique: true },
//     profileId: { type: String, required: true },
//     apartmentId: { type: String, required: true },
//     isActive: { type: Boolean, default: true },
//     settings: { type: Schema.Types.Mixed },
//     lastActivity: { type: Date },
//     metadata: { type: Schema.Types.Mixed },
//     //   botGroup: { type: [BotGroupSchema] },
// }, {
//     timestamps: true
// });

// export const Bot = mongoose.model('Bot', BotSchema);
