// Helpers that turn query-string values into MongoDB filters.

// User text inside a RegExp must be escaped, otherwise "(" or "*" breaks the query.
const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Builds a case-insensitive "contains" condition over several fields.
const searchFilter = (q, fields) => {
  const term = String(q || '').trim().slice(0, 100);
  if (!term) return null;
  const regex = new RegExp(escapeRegex(term), 'i');
  return { $or: fields.map((field) => ({ [field]: regex })) };
};

// ?from=2026-01-01&to=2026-01-31 → { $gte, $lte } (the "to" day is included in full).
const dateRange = (from, to) => {
  const range = {};
  const start = from ? new Date(from) : null;
  const end = to ? new Date(to) : null;
  if (start && !Number.isNaN(start.getTime())) range.$gte = start;
  if (end && !Number.isNaN(end.getTime())) {
    end.setUTCHours(23, 59, 59, 999);
    range.$lte = end;
  }
  return Object.keys(range).length ? range : null;
};

module.exports = { escapeRegex, searchFilter, dateRange };
