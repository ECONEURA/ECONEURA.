const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({
    allErrors: true,
    strict: false,
    removeAdditional: 'failing',
    coerceTypes: true,
    useDefaults: true
});
addFormats(ajv);

function formatErrors(errors = []) {
    return errors.map((error) => ({
        message: error.message,
        instancePath: error.instancePath,
        keyword: error.keyword,
        params: error.params
    }));
}

function createValidator(schema, { target = 'body' } = {}) {
    const validate = ajv.compile(schema);

    return (req, _res, next) => {
        const payload = target === 'query' ? req.query : target === 'params' ? req.params : req.body;
        const valid = validate(payload);
        if (!valid) {
            const error = new Error('Payload validation failed');
            error.status = 400;
            error.code = 'VALIDATION_ERROR';
            error.details = formatErrors(validate.errors);
            return next(error);
        }
        return next();
    };
}

module.exports = {
    createValidator
};
