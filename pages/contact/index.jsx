import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone, faEnvelope, faClock, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import Seo from '@/components/Seo';
import PageHero from '@/components/PageHero';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SocialIcons from '@/components/SocialIcons';
import SuccessPopup from '@/components/SuccessPopup';
import ErrorPopup from '@/components/ErrorPopup';
import { BUSINESS } from '@/constants/config';
import { validateContactMessage } from '@/lib/validation';
import { apiRequest } from '@/lib/api/client';
import styles from '@/styles/pages/Content.module.css';

const EMPTY_FORM = { name: '', email: '', mobile: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [popup, setPopup] = useState(null);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const check = validateContactMessage(form);
    if (!check.valid) {
      setErrors(check.errors);
      return;
    }
    setSending(true);
    try {
      const data = await apiRequest('/api/contact', { method: 'POST', body: form });
      setForm(EMPTY_FORM);
      setPopup({ type: 'success', message: data.message });
    } catch (error) {
      if (error.fields) setErrors(error.fields);
      setPopup({ type: 'error', message: error.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Seo title="Contact Us" description="Contact Siva Sarvesh Crackers, Sivakasi. Call, WhatsApp or send us a message about your Diwali order." />
      <PageHero title="Contact Us" tamilTitle="தொடர்பு கொள்ள" description="Call or WhatsApp us for bulk orders, stock questions or delivery updates." breadcrumb={[{ label: 'Contact Us' }]} />

      <section className="section">
        <div className={`container ${styles.contactGrid}`}>
          <div className={styles.contactCard}>
            <h2>{BUSINESS.name}</h2>
            <ul className={styles.contactList}>
              <li>
                <FontAwesomeIcon icon={faLocationDot} fixedWidth />
                <span><strong>Address</strong>{BUSINESS.addressLines.join(' ')}</span>
              </li>
              <li>
                <FontAwesomeIcon icon={faPhone} fixedWidth />
                <span>
                  <strong>Phone / GPay</strong>
                  {BUSINESS.phones.map((phone) => (
                    <a key={phone.tel} href={`tel:${phone.tel}`}>{phone.number} ({phone.name})</a>
                  ))}
                </span>
              </li>
              <li>
                <FontAwesomeIcon icon={faWhatsapp} fixedWidth />
                <span><strong>WhatsApp</strong><a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noopener noreferrer">Chat with us on WhatsApp</a></span>
              </li>
              <li>
                <FontAwesomeIcon icon={faEnvelope} fixedWidth />
                <span><strong>Email</strong><a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></span>
              </li>
              <li>
                <FontAwesomeIcon icon={faClock} fixedWidth />
                <span><strong>Business hours</strong>{BUSINESS.hours}</span>
              </li>
            </ul>
            <SocialIcons tone="dark" showLabels />
            <iframe
              title="Siva Sarvesh Crackers location on Google Maps"
              src={BUSINESS.mapEmbedUrl}
              className={styles.map}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <form className={styles.formCard} onSubmit={submit} noValidate>
            <h2>Send us a message</h2>
            <p className="muted">We reply within one working day.</p>
            <div className="form-grid">
              <Input label="Name" name="name" required value={form.name} onChange={update('name')} error={errors.name} autoComplete="name" />
              <Input label="Mobile" name="mobile" required value={form.mobile} onChange={update('mobile')} error={errors.mobile} inputMode="tel" autoComplete="tel" prefix="+91" />
              <Input label="Email" name="email" type="email" required value={form.email} onChange={update('email')} error={errors.email} autoComplete="email" className="span-2" />
              <Input label="Message" name="message" required multiline value={form.message} onChange={update('message')} error={errors.message} className="span-2" />
            </div>
            <div className={styles.formActions}>
              <Button type="submit" loading={sending} icon={faPaperPlane}>Send message</Button>
            </div>
          </form>
        </div>
      </section>

      <SuccessPopup open={popup?.type === 'success'} onClose={() => setPopup(null)} title="Message sent" message={popup?.message} />
      <ErrorPopup open={popup?.type === 'error'} onClose={() => setPopup(null)} title="Message not sent" message={popup?.message} />
    </>
  );
}
