const mongoose = require('mongoose');

const RoleEnum = Object.freeze({
    DEVELOPER: 'Developer ',
    OWNER: 'Owner',
    ADMIN: 'Admin',
    USER: 'User',
});

const ROLE_LEVELS = {
    [RoleEnum.DEVELOPER]: 4,
    [RoleEnum.OWNER]: 3,
    [RoleEnum.ADMIN]: 2,
    [RoleEnum.USER]: 1,
};

const RoleSchema = mongoose.Schema(
    {
        name: { type: String, enum: ['Developer', 'Owner', 'Admin', 'User'] },
    },
    { timestamps: true }
);

const Role = mongoose.model('Role', RoleSchema);

function getOneLevelLowerRole(current) {
    const currentLevel = ROLE_LEVELS[current];
    const targetLevel = currentLevel - 1;
    const entry = Object.entries(ROLE_LEVELS).find(([_, level]) => level === targetLevel);
    return entry ? entry[0] : null;
}

// ✅ freeze object เพื่อป้องกันการแก้ไข enum
Object.freeze(RoleEnum);

module.exports = {
    Role,
    RoleEnum,
    ROLE_LEVELS,
    getOneLevelLowerRole,
};
