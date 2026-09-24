import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import Seo from '@/components/Seo';
import PageHero from '@/components/PageHero';
import styles from '@/styles/pages/Content.module.css';

const DOS = [
  { title: 'Buy from licensed sellers', text: 'Buy crackers only from authorised, reliable sources that follow storage and packing rules.' },
  { title: 'Store them cool and dry', text: 'Keep crackers in a closed box away from heat, sunlight, stoves and electrical points.' },
  { title: 'Read the instructions', text: 'Follow the directions and warnings printed on each product.' },
  { title: 'Keep water and sand ready', text: 'Keep a bucket of water and a bucket of sand close to where you light crackers.' },
  { title: 'Light them in open spaces', text: 'Choose an open ground away from buildings, vehicles, dry leaves and anything that catches fire.' },
  { title: 'Supervise children', text: 'Children should light crackers only with an adult standing next to them.' },
  { title: 'Wear cotton clothes', text: 'Loose synthetic clothes catch fire easily. Wear fitted cotton clothes and footwear.' },
  { title: 'Use a long incense stick', text: 'Light crackers at arm’s length with a long agarbatti or sparkler, and step back quickly.' },
];

const DONTS = [
  { title: 'Do not hold lit crackers', text: 'Never hold fireworks in your hand while lighting them, unless the product is made to be hand-held, like sparklers.' },
  { title: 'Do not relight a dud', text: 'If a cracker does not go off, wait 15 minutes, then soak it in water. Never go back and relight it.' },
  { title: 'Do not light near flammables', text: 'Keep away from petrol, gas cylinders, curtains, hay and parked vehicles.' },
  { title: 'Do not use tins or bottles', text: 'Never light crackers inside tins, bottles or pots. The pieces fly out like shrapnel.' },
  { title: 'Do not carry them in pockets', text: 'Friction and heat can set crackers off. Carry them in a closed box.' },
];

export default function SafetyTips() {
  return (
    <>
      <Seo title="Safety Tips" description="Simple fireworks safety tips from Siva Sarvesh Crackers for a safe and happy Diwali." />
      <PageHero title="Safety Tips" tamilTitle="பாதுகாப்பு குறிப்புகள்" description="A safe Diwali is a happy Diwali. Please read these before you light up." breadcrumb={[{ label: 'Safety Tips' }]} />

      <section className="section">
        <div className={`container ${styles.safetyGrid}`}>
          <div>
            <h2 className={styles.dosTitle}><FontAwesomeIcon icon={faCircleCheck} /> Do</h2>
            <ul className={styles.tips}>
              {DOS.map((tip) => (
                <li key={tip.title} className={styles.tipDo}>
                  <h3>{tip.title}</h3>
                  <p>{tip.text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className={styles.dontsTitle}><FontAwesomeIcon icon={faCircleXmark} /> Don&apos;t</h2>
            <ul className={styles.tips}>
              {DONTS.map((tip) => (
                <li key={tip.title} className={styles.tipDont}>
                  <h3>{tip.title}</h3>
                  <p>{tip.text}</p>
                </li>
              ))}
            </ul>
            <aside className={styles.after}>
              <FontAwesomeIcon icon={faTriangleExclamation} className={styles.afterIcon} />
              <div>
                <h3>After the celebration</h3>
                <p>Soak used crackers and ash in water overnight before putting them in the bin. For burns, cool the skin under running water for 10 minutes and see a doctor for anything more than a small burn.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
