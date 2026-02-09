const profile = require("../../frameworks/database/mongoDB/models/profile");
const { findParentByProfileId, canCreateRole, hasAnyUser, ensureUsernameUnique, ensureRoleUnique, hashPassword, registerUser, getListUserLineages } = require("../repositories/register");


exports.Registers = async (c) => {
    try {
        const { username, password, role, confirmPassword, profileId } = await c.req.json();


        let parentUser = null;
        const roleName = String(role).charAt(0).toUpperCase() + String(role).slice(1);

        if (profileId) {
            parentUser = await findParentByProfileId(profileId);
            await canCreateRole(parentUser.role, roleName);
        }


        await ensureUsernameUnique(username);
        const roleData = await ensureRoleUnique(roleName);
        const hashedPassword = await hashPassword(password, confirmPassword);

        const userProfile = {
            username,
            password: hashedPassword,
            role: roleData.id,
            enabled: true,
        };



        // จัดการ lineage และ parent
        if (roleName !== 'Developer') {
            if (roleName === 'Owner') {
                // Owner เป็นสายบนสุด - ไม่ต้องมี parent
                userProfile.parent = null;
                userProfile.lineage = [];
            } else {
                // Admin, User ต้องมี parent
                if (parentUser) {
                    userProfile.parent = parentUser._id;
                    userProfile.lineage = [...parentUser.lineage, parentUser._id];
                } else {
                    const error = new Error('Parent user is required for this role');
                    error.status = 400;
                    throw error;
                }
            }
        }

        const newUser = await registerUser(userProfile);

        return c.json({ status: 201, message: 'Register successfully', newUser });

    } catch (error) {
        return c.json({
            message: error.message || 'Internal Server Error',
        });
    }
};

exports.Registers3 = async (c) => {
    try {
        const { username, password, role, confirmPassword, profileId } = await c.req.json();


        try {
            let parentUser = null;
            if (data.profileId) {
                parentUser = await findParentByProfileId(profileId);
                await canCreateRole(parentUser.role, roleName);

            } else {
                // ไม่มี profileId → ตรวจว่ามี user อยู่แล้วหรือยัง
                const count = await profile.countDocuments();
                if (count > 0) {
                    throw new Error("Cannot create user without profileId (system already initialized)");
                }
                return count > 0;

            }

            // ตรวจสอบ username
            await ensureUsernameUnique(username);
            const roleData = await ensureRoleUnique(roleName);
            const hashedPassword = await hashPassword(password, confirmPassword);

            const userProfile = {
                username,
                password: hashedPassword,
                role: roleData.id,
                enabled: true,
            };

            if (parentUser) {
                userProfile.parent = parentUser._id;
                userProfile.lineage = [...parentUser.lineage, parentUser._id];
            } else {
                userProfile.lineage = []; // คนแรกของระบบ ไม่มีบรรพบุรุษ
            }




        } catch (error) {

        }




        // จัดการ lineage และ parent
        if (roleName !== 'Developer') {
            if (roleName === 'Owner') {
                // Owner เป็นสายบนสุด - ไม่ต้องมี parent
                userProfile.parent = null;
                userProfile.lineage = [];
            } else {
                // Admin, User ต้องมี parent
                if (parentUser) {
                    userProfile.parent = parentUser._id;
                    userProfile.lineage = [...parentUser.lineage, parentUser._id];
                } else {
                    const error = new Error('Parent user is required for this role');
                    error.status = 400;
                    throw error;
                }
            }
        }

        const newUser = await registerUser(userProfile);

        return c.json({ status: 201, message: 'Register successfully', newUser });

    } catch (error) {
        return c.json({
            message: error.message || 'Internal Server Error',
        });
    }
};



exports.RegistersWithTenant = async (value) => {
    try {
        const { username, password, role, confirmPassword, profileId } = value;


        let parentUser = null;

        if (profileId) {
            parentUser = await findParentByProfileId(profileId);
            await canCreateRole(parentUser.role, role);
        } else {
            const hasAnyUsers = await hasAnyUser();
            if (hasAnyUsers) {
                const error = new Error('Cannot create user without profileId (system already initialized)');
                error.status = 403;
                throw error;
            }
        }

        await ensureUsernameUnique(username);


        const roleData = await ensureRoleUnique(role);


        const hashedPassword = await hashPassword(password, confirmPassword);

        const userProfile = {
            username,
            password: hashedPassword,
            role: roleData.id,
            enabled: true,
        };

        if (parentUser) {
            userProfile.parent = parentUser._id;
            userProfile.lineage = [...parentUser.lineage, parentUser._id];
        } else {
            userProfile.lineage = [];
        }

        const newUser = await registerUser(userProfile);

        return newUser


    } catch (error) {

        throw error

    }
};


exports.getListUsers = async (c) => {
    const { userId } = c.req.param();


    try {
        const listUser = await getListUserLineages(userId);
        return c.json({ status: 201, message: 'Get list users successfully', listUser });
    } catch (error) {
        console.error("Error fetching lineage:", error);
        throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลสายผู้ใช้");
    }
}


