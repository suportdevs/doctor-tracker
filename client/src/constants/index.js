// Labels and colours shared by tables, filters, badges and charts.
export const CONDITIONS = {
  stable: { label: 'Stable', color: 'green', chart: '#219a77' },
  recovering: { label: 'Recovering', color: 'blue', chart: '#3b82f6' },
  under_observation: { label: 'Under observation', color: 'amber', chart: '#f0a020' },
  critical: { label: 'Critical', color: 'red', chart: '#e5484d' },
  discharged: { label: 'Discharged', color: 'gray', chart: '#cbd5e1' },
};

export const GENDERS = { male: 'Male', female: 'Female', other: 'Other' };

export const DOCTOR_SORTS = [['newest', 'Newest first'], ['oldest', 'Oldest first'], ['name', 'Name A–Z']];
export const PATIENT_SORTS = [['newest', 'Latest visit'], ['oldest', 'Oldest visit'], ['name', 'Name A–Z'], ['age', 'Age (oldest)']];

export const ROLE_LABELS = { admin: 'Administrator', manager: 'Clinic manager', editor: 'Website editor' };
