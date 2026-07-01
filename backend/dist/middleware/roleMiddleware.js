"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied no permision",
                msg: req.user
            });
        }
        next();
    };
};
exports.default = ;
//# sourceMappingURL=roleMiddleware.js.map