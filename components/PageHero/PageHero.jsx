import Breadcrumb from '../Breadcrumb';
import styles from './PageHero.module.css';

/** Compact night-sky banner used at the top of inner pages. `actions` renders buttons under the description. */
export default function PageHero({ title, tamilTitle, description, breadcrumb = [], actions }) {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        {breadcrumb.length > 0 && <Breadcrumb items={[{ label: 'Home', href: '/' }, ...breadcrumb]} />}
        <h1 className={styles.title}>{title}</h1>
        {tamilTitle && <p className={`${styles.tamil} tamil`}>{tamilTitle}</p>}
        {description && <p className={styles.description}>{description}</p>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </section>
  );
}
