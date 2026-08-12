import { ZodError } from "zod";
import ApiError from "../utils/ApiError.js";
const validate = (schema) => (req, _res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof ZodError) {
            next(new ApiError(400, "Validation failed", error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }))));
            return;
        }
        next(error);
    }
};
export default validate;
//# sourceMappingURL=validate.middleware.js.map