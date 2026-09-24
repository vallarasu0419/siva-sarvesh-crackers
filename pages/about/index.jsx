import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIndustry, faUsers, faShieldHalved, faTruckFast } from '@fortawesome/free-solid-svg-icons';
import Seo from '@/components/Seo';
import PageHero from '@/components/PageHero';
import Button from '@/components/Button';
import { BUSINESS } from '@/constants/config';
import styles from '@/styles/pages/Content.module.css';

const PILLARS = [
  { icon: faIndustry, title: 'Made in Sivakasi', text: 'Our unit on the Virudhunagar - Sattur road sits in the heart of India’s fireworks belt, close to the makers we have worked with for years.' },
  { icon: faShieldHalved, title: 'Quality you can trust', text: 'We stock tested, branded products and store them in licensed, dry godowns so they burn the way they should on the day.' },
  { icon: faUsers, title: 'Service with a phone call', text: 'Every order is confirmed by a person, not a bot. We tell you what is in stock, what it costs and when it will reach you.' },
  { icon: faTruckFast, title: 'Careful dispatch', text: 'Parcels are packed in sealed cartons and sent through licensed transporters to towns across Tamil Nadu.' },
];

export default function About() {
  return (
    <>
      <Seo title="About Us" description="About Siva Sarvesh Crackers, a Sivakasi crackers supplier run by P. Muthuraj B.E., with sister concern Akkammal Crackers." />
      <PageHero title="About Siva Sarvesh Crackers" tamilTitle={BUSINESS.tamilName} breadcrumb={[{ label: 'About' }]} />

      <section className="section">
        <div className={`container ${styles.split}`}>
          <div className="prose">
            <h2 className={styles.firstHeading}>A Sivakasi family business</h2>
            <p>
              Siva Sarvesh Crackers is run by {BUSINESS.owner} from Sivakasi, together with our sister concern {BUSINESS.sisterConcern}.
              We supply sparklers, flower pots, ground chakkars, rockets, fancy aerial shots and gift boxes to families,
              shops and celebrations across Tamil Nadu.
            </p>
            <p>
              Buying close to where crackers are made keeps our prices low. That is why most of our range is offered at up
              to 80% off the printed list price, and why our gift boxes are sold at a fixed net rate.
            </p>
            <h2>How we work</h2>
            <p>
              Crackers cannot be sold online under the 2018 Supreme Court order, so this website works as an order enquiry.
              You choose products and quantities, verify your email, and send us the list. Our team then calls you to
              confirm stock, the final amount and the delivery date. Payment is taken only after that call.
            </p>
            <h2>Our safety commitment</h2>
            <p>
              We follow the storage and transport rules for explosives, pack every order in sealed cartons, and share
              simple safety guidance with every customer. A great Diwali is one where everyone goes home happy.
            </p>
            <Button href="/products" icon={null}>See the price list</Button>
          </div>
          <ul className={styles.pillars}>
            {PILLARS.map((pillar) => (
              <li key={pillar.title}>
                <FontAwesomeIcon icon={pillar.icon} className={styles.pillarIcon} fixedWidth />
                <div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
