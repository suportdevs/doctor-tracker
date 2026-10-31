'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

/**
 * Small form helper: values, per-field errors from the API (422 → errors[]), and a submitting flag.
 *   const form = useForm(initial);
 *   form.bind('name') → { value, onChange, 'aria-invalid' }
 *   form.submit(async (values) => api.post(...), 'Saved')
 */
export function useForm(initial) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = useCallback((name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  }, []);

  const bind = (name) => ({
    id: name,
    value: values[name] ?? '',
    onChange: (e) => set(name, e.target.value),
    'aria-invalid': errors[name] ? 'true' : undefined,
  });

  const submit = async (action, successMessage) => {
    setSubmitting(true);
    setErrors({});
    try {
      const result = await action(values);
      if (successMessage) toast.success(successMessage);
      return result;
    } catch (err) {
      const fieldErrors = {};
      for (const issue of err.data?.errors || []) fieldErrors[issue.path] ||= issue.message;
      setErrors(fieldErrors);
      toast.error(err.message);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return { values, setValues, set, errors, bind, submit, submitting, reset: () => { setValues(initial); setErrors({}); } };
}
