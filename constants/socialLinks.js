/**
 * Single source of truth for social media links.
 * Used by the Header, Footer, Contact page and every email template.
 */
export const socialLinks = {
  facebook: 'https://www.facebook.com/sivasarveshcrackers',
  instagram: 'https://www.instagram.com/sivasarveshcrackers',
  youtube: 'https://www.youtube.com/@sivasarveshcrackers',
};

export const socialNetworks = [
  { key: 'facebook', label: 'Facebook', url: socialLinks.facebook, color: '#1877F2' },
  { key: 'instagram', label: 'Instagram', url: socialLinks.instagram, color: '#C13584' },
  { key: 'youtube', label: 'YouTube', url: socialLinks.youtube, color: '#FF0000' },
];
