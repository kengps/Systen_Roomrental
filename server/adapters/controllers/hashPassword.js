const bcrypt = require("bcryptjs");

exports.generateHashPassword = (password) => {
    console.log(`⩇⩇:⩇⩇🚨  file: hashPassword.js:4  password :`, password);

    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                reject(err);
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    reject(err)
                }
                resolve(hash)

            })

        })
    })

}