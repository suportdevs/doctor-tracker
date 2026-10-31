const { z } = require('zod');
const mongoose = require('mongoose');

// Building blocks shared by several validators.
const phone = z.string().trim().min(5, 'Phone is too short').max(30).regex(/^[0-9+()\-\s.]+$/, 'Phone may only contain digits, spaces and + ( ) - .');
const objectId = z.string().refine((v) => mongoose.isValidObjectId(v), 'Invalid id');
const date = z.coerce.date({ invalid_type_error: 'Invalid date' });

module.exports = { phone, objectId, date };
