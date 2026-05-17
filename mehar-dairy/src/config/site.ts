export const siteConfig = {
  name: 'Mehar Dairy & Fattening Farm',
  nameUrdu: 'مہر ڈیری اینڈ فیٹننگ فارم',
  tagline: 'Premium Qurbani Animals for Eid ul-Adha 2026',
  taglineUrdu: 'قربانی 2026 کے لیے اعلیٰ معیار کے جانور',
  description:
    'Hand-raised, vet-checked premium cattle and small animals — ethically farmed in the heart of Punjab, Pakistan.',
  whatsapp: '923030911125',
  phone: '+92 303 0911125',
  email: 'mehardairy@gmail.com',
  address: 'Mehar Dairy & Fattening Farm, Punjab, Pakistan',
  social: {
    whatsapp: 'https://wa.me/923030911125',
  },
}

export function getWhatsAppUrl(message: string) {
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`
}
