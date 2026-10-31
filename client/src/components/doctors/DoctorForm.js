'use client';

import { api } from '@/services/api';
import { toDateInput } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Avatar, Field, Modal, Select, Spinner } from '@/components/ui';
import { ImageField } from '@/components/cms/MediaLibrary';
import { useForm } from '@/hooks/useForm';

const EMPTY = { name: '', specialization: '', hospital: '', phone: '', email: '', photo: '', status: 'active', joinedAt: '' };

// Create (doctor = null) or edit a doctor. `suggestions` fills the specialization/hospital datalists.
export default function DoctorForm({ open, doctor, suggestions, onClose, onSaved }) {
  // key on the inner form resets its state every time a different doctor is opened.
  return (
    <Modal open={open} onClose={onClose} title={doctor ? 'Edit doctor' : 'Add doctor'} description="All fields except the photo are required.">
      {open && <DoctorFields key={doctor?._id || 'new'} doctor={doctor} suggestions={suggestions} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function DoctorFields({ doctor, suggestions, onClose, onSaved }) {
  const { can } = useAuth();
  const form = useForm(doctor ? { ...EMPTY, ...doctor, joinedAt: toDateInput(doctor.joinedAt) } : { ...EMPTY, joinedAt: toDateInput(new Date()) });
  const { errors, bind } = form;

  const save = async (e) => {
    e.preventDefault();
    const { name, specialization, hospital, phone, email, photo, status, joinedAt } = form.values;
    const body = { name, specialization, hospital, phone, email, photo, status, joinedAt: joinedAt || undefined };
    const saved = await form.submit(
      () => (doctor ? api.put(`/doctors/${doctor._id}`, body) : api.post('/doctors', body)),
      doctor ? 'Doctor updated' : 'Doctor added',
    );
    if (saved) onSaved(saved);
  };

  return (
    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Field label="Full name" htmlFor="name" error={errors.name} className="sm:col-span-2">
        <input className="a-input" placeholder="Dr. Jane Smith" autoFocus {...bind('name')} />
      </Field>
      {/* Staff with website access can pick/upload from the media library; others paste a URL. */}
      <Field label="Photo (optional)" htmlFor="photo" error={errors.photo} className="sm:col-span-2">
        {can('website') ? (
          <ImageField value={form.values.photo} onChange={(v) => form.set('photo', v)} />
        ) : (
          <div className="flex items-center gap-3">
            <Avatar name={form.values.name} src={form.values.photo} size={44} />
            <input className="a-input" placeholder="https://… or /images/doctors/jane.jpg" {...bind('photo')} />
          </div>
        )}
      </Field>
      <Field label="Specialization" htmlFor="specialization" error={errors.specialization}>
        <input className="a-input" list="specializations" placeholder="Cardiology" {...bind('specialization')} />
        <datalist id="specializations">{suggestions?.specializations?.map((s) => <option key={s} value={s} />)}</datalist>
      </Field>
      <Field label="Hospital" htmlFor="hospital" error={errors.hospital}>
        <input className="a-input" list="hospitals" placeholder="City General Hospital" {...bind('hospital')} />
        <datalist id="hospitals">{suggestions?.hospitals?.map((h) => <option key={h} value={h} />)}</datalist>
      </Field>
      <Field label="Phone" htmlFor="phone" error={errors.phone}>
        <input className="a-input" type="tel" placeholder="+1 555 123 4567" {...bind('phone')} />
      </Field>
      <Field label="Email" htmlFor="email" error={errors.email}>
        <input className="a-input" type="email" placeholder="jane@clinic.com" {...bind('email')} />
      </Field>
      <Field label="Status" htmlFor="status" error={errors.status}>
        <Select id="status" value={form.values.status} onChange={(v) => form.set('status', v)} options={[['active', 'Active'], ['inactive', 'Inactive']]} />
      </Field>
      <Field label="Joined on" htmlFor="joinedAt" error={errors.joinedAt}>
        <input className="a-input" type="date" {...bind('joinedAt')} />
      </Field>
      <div className="flex justify-end gap-2 border-t border-ink-100 pt-4 dark:border-white/5 sm:col-span-2">
        <button type="button" className="a-btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="a-btn-primary" disabled={form.submitting}>{form.submitting && <Spinner />}{doctor ? 'Save changes' : 'Add doctor'}</button>
      </div>
    </form>
  );
}
