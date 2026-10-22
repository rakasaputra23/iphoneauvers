import Script from 'next/script';
import markup from './markup';

export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: markup }} />
      {/* Logika ponsel (layar kunci, WhatsApp, cerita). Cerita diedit di public/phone.js bagian STORY */}
      <Script src="/phone.js" strategy="afterInteractive" />
    </>
  );
}
