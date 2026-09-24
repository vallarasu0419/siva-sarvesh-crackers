import { useState } from 'react';
import { useRouter } from 'next/router';
import { faRightToBracket, faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Seo from '@/components/Seo';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { apiRequest } from '@/lib/api/client';
import { isValidEmail } from '@/lib/validation';
import { SITE_NAME } from '@/constants/config';
import styles from '@/styles/pages/Admin.module.css';

function safeNext(next) {
  return typeof next === 'string' && next.startsWith('/admin/') && !next.startsWith('/admin/login') ? next : '/admin/dashboard';
}

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!isValidEmail(form.email)) nextErrors.email = 'Enter your admin email address.';
    if (!form.password) nextErrors.password = 'Enter your password.';
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await apiRequest('/api/auth/login', { method: 'POST', body: form });
      router.replace(safeNext(router.query.next));
    } catch (error) {
      setFormError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <Seo title="Admin Login" noIndex />
      <form className={styles.loginCard} onSubmit={submit} noValidate>
        <p className={styles.loginBrand}>{SITE_NAME}</p>
        <h1 className={styles.loginTitle}>Admin login</h1>
        {formError && <p className={styles.formError} role="alert">{formError}</p>}
        <Input label="Email" name="email" type="email" autoComplete="username" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} prefix={<FontAwesomeIcon icon={faUser} />} />
        <Input label="Password" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} prefix={<FontAwesomeIcon icon={faLock} />} />
        <Button type="submit" size="lg" fullWidth loading={loading} icon={faRightToBracket}>Login</Button>
      </form>
    </div>
  );
}

AdminLogin.getLayout = (page) => page;
