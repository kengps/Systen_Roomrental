
// exports.handleRequestError = (callback) => {
//     return async (req, res) => {
//         try {
//             await callback(req, res)
//         } catch (error) {
//             res.status(500).json({ message: 'Internal Server Error', error });
//         }
//     }
// }

// exports.handleRequestError = (callback) => {
//     return async (req, res) => {
//         try {
//             await callback(req, res);
//         } catch (error) {
//             res.status(error.status || 500).json({
//                 status: error.status || 500,
//                 message: error.message || "Internal Server Error",

//             });
//         }
//     };
// };

//hono
exports.handleRequestError = (callback) => {
    return async (c) => {
        try {
            return await callback(c);
        } catch (error) {
            return c.json({
                error: error.status || 500,
                status: error.status || 500,
                message: error.message || "Internal Server Error",

            })
        }
    };
};
