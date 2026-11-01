// Private admin app: keep it out of search engines.
export default function robots() {
  return { rules: { userAgent: '*', disallow: '/' } };
}
