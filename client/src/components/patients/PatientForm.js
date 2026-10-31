'use client';

import { api } from '@/services/api';
import { CONDITIONS, GENDERS } from '@/constants';
import { useApi } from '@/hooks';
import { toDateInput } from '@/lib/utils';
import { Field, Modal, Select, Spinner } from '@/components/ui';
import { useForm } from '@/hooks/useForm';

const EMPTY = { name: '', age: '', gender: '', phone: '', email: '', condition: 'stable', diagnosis: '', notes: '', doctor: '', visitDate: '' };
const CONDITION_OPTIONS = Object.entries(CONDITIONS).map(([v, c]) => [v, c.label]);
const GENDER_OPTIONS = Object.entries(GENDERS);

/**
 * Create or edit a patient.
 *  - doctorId set → the patient is added under that doctor (POST /doctors/:id/patients) and the doctor can't be changed.
 *  - otherwise a doctor dropdown is shown.
 */
export default function PatientForm({ open, patient, doctorId, onClose, onSaved }) {
  return (
    <Modal open={open} onClose={onClose} title={patient ? 'Edit patient' : 'Add patient'} size="lg">
      {open && <PatientFields key={patient?._id || 'new'} patient={patient} doctorId={doctorId} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function PatientFields({ patient, doctorId, onClose, onSaved }) {
  const { data: doctors } = useApi(doctorId ? null : '/doctors/options');
  const form = useForm(patient
    ? { ...EMPTY, ...patient, doctor: patient.doctor?._id || patient.doctor || '', visitDate: toDateInput(patient.visitDate) }
    : { ...EMPTY, doctor: doctorId || '', visitDate: toDateInput(new Date()) });
  const { errors, bind, values } = form;

  const save = async (e) => {
    e.preventDefault();
    const body = { ...values, age: values.age === '' ? undefined : Number(values.age), visitDate: values.visitDate || undefined };
    ['_id', '__v', 'createdAt', 'updatedAt'].forEach((k) => delete body[k]);
    const saved = await form.submit(() => {
      if (patient) return api.put(`/patients/${patient._id}`, body);
      if (doctorId) return api.post(`/doctors/${doctorId}/patients`, body);
      return api.post('/patients', body);
    }, patient ? 'Patient updated' : 'Patient added');
    if (saved) onSaved(saved);
  };

  return (
    <form onSubmit={save} className="grid gap-4 sm:grid-cols-6" noValidate>
      <Field label="Full name" htmlFor="name" error={errors.name} className="sm:col-span-3">
        <input className="a-input" autoFocus {...bind('name')} />
      </Field>
      <Field label="Age" htmlFor="age" error={errors.age} className="sm:col-span-1">
        <input className="a-input" type="number" min="0" max="130" {...bind('age')} />
      </Field>
      <Field label="Gender" htmlFor="gender" error={errors.gender} className="sm:col-span-2">
        <Select id="gender" value={values.gender} onChange={(v) => form.set('gender', v)} options={GENDER_OPTIONS} placeholder="Select…" aria-invalid={errors.gender ? 'true' : undefined} />
      </Field>
      <Field label="Phone" htmlFor="phone" error={errors.phone} className="sm:col-span-3">
        <input className="a-input" type="tel" {...bind('phone')} />
      </Field>
      <Field label="Email" htmlFor="email" error={errors.email} className="sm:col-span-3">
        <input className="a-input" type="email" {...bind('email')} />
      </Field>
      {!doctorId && (
        <Field label="Doctor" htmlFor="doctor" error={errors.doctor} className="sm:col-span-3">
          <Select id="doctor" value={values.doctor} onChange={(v) => form.set('doctor', v)} placeholder={doctors ? 'Select a doctor…' : 'Loading…'}
            options={(doctors?.items || []).map((d) => [d._id, `${d.name} — ${d.specialization}`])} aria-invalid={errors.doctor ? 'true' : undefined} />
        </Field>
      )}
      <Field label="Condition" htmlFor="condition" error={errors.condition} className="sm:col-span-3">
        <Select id="condition" value={values.condition} onChange={(v) => form.set('condition', v)} options={CONDITION_OPTIONS} />
      </Field>
      <Field label="Diagnosis" htmlFor="diagnosis" error={errors.diagnosis} className="sm:col-span-3">
        <input className="a-input" placeholder="e.g. Hypertension" {...bind('diagnosis')} />
      </Field>
      <Field label="Visit date" htmlFor="visitDate" error={errors.visitDate} className="sm:col-span-3">
        <input className="a-input" type="date" {...bind('visitDate')} />
      </Field>
      <Field label="Notes" htmlFor="notes" error={errors.notes} className="sm:col-span-6">
        <textarea className="a-textarea" rows={3} {...bind('notes')} />
      </Field>
      <div className="flex justify-end gap-2 border-t border-ink-100 pt-4 dark:border-white/5 sm:col-span-6">
        <button type="button" className="a-btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="a-btn-primary" disabled={form.submitting}>{form.submitting && <Spinner />}{patient ? 'Save changes' : 'Add patient'}</button>
      </div>
    </form>
  );
}
