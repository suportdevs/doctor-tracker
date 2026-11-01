'use client';

import { Activity, Building2, CalendarDays, ImageIcon, Mail, Phone, Stethoscope, UserRound } from 'lucide-react';
import { api } from '@/services/api';
import { toDateInput } from '@/lib/utils';
import { Avatar, Field, Input, Modal, Select, Spinner } from '@/components/ui';
import { useForm } from '@/hooks/useForm';

const EMPTY = { name: '', specialization: '', hospital: '', phone: '', email: '', photo: '', status: 'active', joinedAt: '' };
const STATUS_OPTIONS = [['active', 'Active'], ['inactive', 'Inactive']];

// Create (doctor = null) or edit a doctor. `suggestions` fills the specialization/hospital datalists.
export default function DoctorForm({ open, doctor, suggestions, onClose, onSaved }) {
  // key on the inner form resets its state every time a different doctor is opened.
  return (
    <Modal open={open} onClose={onClose} title={doctor ? 'Edit doctor' : 'Add doctor'}>
      {open && <DoctorFields key={doctor?._id || 'new'} doctor={doctor} suggestions={suggestions} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function DoctorFields({ doctor, suggestions, onClose, onSaved }) {
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
    <form onSubmit={save} className="space-y-4" noValidate>
      {/* Live preview of the photo (or initials) next to the name. */}
      <div className="flex items-end gap-3">
        <Avatar name={form.values.name || '?'} src={form.values.photo} size={56} />
        <Field label="Full name" htmlFor="name" error={errors.name} className="flex-1">
          <Input icon={UserRound} placeholder="Dr. Jane Smith" autoFocus {...bind('name')} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Specialization" htmlFor="specialization" error={errors.specialization}>
          <Input icon={Stethoscope} list="specializations" placeholder="Cardiology" {...bind('specialization')} />
          <datalist id="specializations">{suggestions?.specializations?.map((s) => <option key={s} value={s} />)}</datalist>
        </Field>
        <Field label="Hospital" htmlFor="hospital" error={errors.hospital}>
          <Input icon={Building2} list="hospitals" placeholder="City General Hospital" {...bind('hospital')} />
          <datalist id="hospitals">{suggestions?.hospitals?.map((h) => <option key={h} value={h} />)}</datalist>
        </Field>
        <Field label="Phone" htmlFor="phone" error={errors.phone}>
          <Input icon={Phone} type="tel" placeholder="+1 555 123 4567" {...bind('phone')} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input icon={Mail} type="email" placeholder="jane@clinic.com" {...bind('email')} />
        </Field>
        <Field label="Status" htmlFor="status" error={errors.status}>
          <Select id="status" icon={Activity} value={form.values.status} onChange={(v) => form.set('status', v)} options={STATUS_OPTIONS} />
        </Field>
        <Field label="Joined on" htmlFor="joinedAt" error={errors.joinedAt}>
          <Input icon={CalendarDays} type="date" {...bind('joinedAt')} />
        </Field>
      </div>

      <Field label="Photo URL (optional)" htmlFor="photo" error={errors.photo}>
        <Input icon={ImageIcon} placeholder="https://… or /images/doctors/jane.jpg" {...bind('photo')} />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="a-btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="a-btn-primary" disabled={form.submitting}>{form.submitting && <Spinner />}{doctor ? 'Save changes' : 'Add doctor'}</button>
      </div>
    </form>
  );
}
