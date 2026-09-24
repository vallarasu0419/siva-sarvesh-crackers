import {
  faBomb, faRocket, faGift, faChild, faWandMagicSparkles, faFire, faStar, faBolt,
  faFan, faPencil, faLink, faBurst, faSun, faDroplet, faFireFlameCurved, faMusic, faScroll, faCircle,
} from '@fortawesome/free-solid-svg-icons';

/** Placeholder icon per category when a product has no photo yet. */
const ICONS = {
  'single-sound-crackers': faBurst,
  'ground-chakkars': faFan,
  'flower-pots': faFireFlameCurved,
  pencils: faPencil,
  'twinkling-stars': faStar,
  bombs: faBomb,
  'electric-crackers': faBolt,
  'chain-crackers': faLink,
  'bijili-crackers': faFire,
  'fancy-crackers': faSun,
  'multi-colour-shots': faSun,
  'fancy-fountains': faDroplet,
  'kids-special': faChild,
  rockets: faRocket,
  'paper-shots': faScroll,
  'laddu-flower-pots': faCircle,
  sparklers: faWandMagicSparkles,
  'colour-matches': faFire,
  'music-crayon': faMusic,
  'gift-boxes': faGift,
};

export function getCategoryIcon(slug) {
  return ICONS[slug] || faStar;
}
