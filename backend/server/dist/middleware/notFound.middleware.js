import ApiError from "../utils/ApiError.js";
const notFoundMiddleware = (req, _res, next) => {
    next(new ApiError(404, `sorry route ${req.originalUrl} not found`));
};
export default notFoundMiddleware;
//# sourceMappingURL=notFound.middleware.js.map