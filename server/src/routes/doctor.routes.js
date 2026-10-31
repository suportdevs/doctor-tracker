const express = require('express');
const doctor = require('../controllers/doctor.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');

const router = express.Router();
router.param('id', validateObjectId);
router.param('patientId', validateObjectId);
router.use(authenticate);

// Also used by the Patients page, so "patients" permission is enough here.
router.get('/options', authorize('doctors', 'patients'), doctor.listOptions);

// Every route below needs the "doctors" permission.
router.use(authorize('doctors'));

router.route('/').get(doctor.listDoctors).post(doctor.createDoctor);
router.get('/filters', doctor.listFilterValues);
router.route('/:id').get(doctor.getDoctor).put(doctor.updateDoctor).delete(doctor.deleteDoctor);

// Patients of one doctor
router.route('/:id/patients').get(doctor.listDoctorPatients).post(doctor.addDoctorPatient);
router.delete('/:id/patients/:patientId', doctor.removeDoctorPatient);

module.exports = router;
