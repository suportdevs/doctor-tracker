const express = require('express');
const patient = require('../controllers/patient.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');

const router = express.Router();
router.param('id', validateObjectId);
router.use(authenticate, authorize('patients'));

router.route('/').get(patient.getPatients).post(patient.createPatient);
router.route('/:id').get(patient.getPatient).put(patient.updatePatient).delete(patient.deletePatient);

module.exports = router;
