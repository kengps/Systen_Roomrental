const { ROLE_LEVELS, Role } = require("../../../frameworks/database/mongoDB/models/roleModel")

const Profile = require("../../../frameworks/database/mongoDB/models/profile")

const bcrypt = require('bcrypt');
const { sendError } = require("../../../frameworks/webserver/utils/responseMessage");


exports.findParentByProfileId = async (id) => {

    const user = await Profile.findOne({ _id: id })
        .select('-password')
        .populate('role', 'name');

    if (!user) {
        const error = new Error("Username not found!!");
        error.status = 404;
        throw error;
    }
    return user;
};

exports.canCreateRole = async (currentRole, role) => {
    if (ROLE_LEVELS[currentRole.name] <= ROLE_LEVELS[role]) {
        const error = new Error("You cannot create users with the same or higher role level than you.");
        error.status = 404;
        throw error;
    }
}
// ตัวอย่างการใช้งาน canCreateRole function
exports.canCreateRole2 = async (parentRole, newRole) => {
    const roleHierarchy = {
        'Developer': ['Owner', 'Master', 'Admin', 'User'], // Developer สามารถสร้างได้ทุก role
        'Owner': ['Master', 'Admin', 'User'], // Owner สามารถสร้าง Master, Admin, User
        'Master': ['Admin', 'User'], // Master สามารถสร้าง Admin, User
        'Admin': ['User'], // Admin สามารถสร้างแค่ User
        'User': [] // User สร้างไม่ได้
    };

    if (!roleHierarchy[parentRole] || !roleHierarchy[parentRole].includes(newRole)) {
        throw new Error(`${parentRole} cannot create ${newRole} role`);
    }
};

exports.hasAnyUser = async () => {
    const count = await Profile.estimatedDocumentCount();
    return count > 0;

}
exports.ensureUsernameUnique = async (username) => {

    const usernameIsExist = await Profile.findOne({ username })


    if (usernameIsExist) {
        const error = new Error("Username already exists!");
        error.status = 404;
        throw error;
    }
    return !!usernameIsExist;
}

exports.ensureRoleUnique = async (role) => {

    let roleIsExist = await Role.findOne({ name: role }); // ค้นหาจาก 'name'


    if (!roleIsExist) {
        roleIsExist = new Role({ name: role }); // ตั้งค่า name แทน role
        await roleIsExist.save();
    }


    return roleIsExist;
}

exports.hashPassword = async (password, cfPassword) => {
    if (password !== cfPassword) {
        const error = new Error("Password and confirm password do not match");
        error.status = 400;
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

exports.registerUser = async (profiles) => {
    const { username, password, role, enable, parent, lineage } = profiles

    const data = new Profile({
        username,
        password,
        role,
        enable,
        parent,
        lineage,
    });
    return await data.save();
}

exports.findOwner = async (accountId) => {
    try {
        const account = await Profile.findById({ _id: accountId }).populate('lineage')


        if (!account) {
            sendError('ไม่พบ', 'Account')
            //hrow new Error('Account not found');

        }

        const ownersInLineage = await Profile.find({
            _id: { $in: account.lineage }
        }).select('_id');

        const ownerIds = ownersInLineage.map(owner => owner._id);

        return ownerIds[0]?.toString() || null;

    } catch (error) {
        throw error
    }

}



exports.diableAccountId = async (accountId) => {
    try {
        const data = await Profile.findOneAndUpdate(
            { _id: accountId },
            { $set: { enabled: false } },
            { new: true }
        )

        return data

    } catch (error) {
        throw error
    }

}