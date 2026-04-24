import { Locale } from '@/lib/i18n';
import ContactForm from '@/components/forms/ContactForm';

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const localeValue = locale as Locale;

  return <ContactForm locale={localeValue} />;
}
