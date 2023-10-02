import stripTags from 'striptags';


const sanitize = (req, res, next) => {
    for (const prop in req.body) {
        if (typeof req.body[prop] === 'string') {
            req.body[prop] = stripTags(req.body[prop]);
        }
    }
    next();
};

export default sanitize;
