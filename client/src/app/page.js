import { redirect } from 'next/navigation';

// The app is the admin portal only — send visitors straight to it (guests land on the login page).
export default function Home() {
  redirect('/admin');
}
