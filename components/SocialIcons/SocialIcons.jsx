import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { socialNetworks } from '@/constants/socialLinks';
import styles from './SocialIcons.module.css';

const ICONS = { facebook: faFacebookF, instagram: faInstagram, youtube: faYoutube };

/** Facebook / Instagram / YouTube links from constants/socialLinks.js. tone: light | dark */
export default function SocialIcons({ tone = 'light', size = 'md', showLabels = false }) {
  return (
    <ul className={`${styles.list} ${styles[tone]} ${styles[size]}`}>
      {socialNetworks.map((network) => (
        <li key={network.key}>
          <a href={network.url} target="_blank" rel="noopener noreferrer" aria-label={`Siva Sarvesh Crackers on ${network.label}`} className={styles.link}>
            <FontAwesomeIcon icon={ICONS[network.key]} fixedWidth />
            {showLabels && <span>{network.label}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}
