import { Footer } from '@common/components/footer';
import { Header } from '@common/components/header';
import '@auth/styles/signup.scss';
import { ConfirmEmailNotice } from '@auth/components/confirm_email_notice';

export function ConfirmEmailPage() {
  return (
    <main>
      <Header />
      <ConfirmEmailNotice />
      <Footer />
    </main>
  );
}
