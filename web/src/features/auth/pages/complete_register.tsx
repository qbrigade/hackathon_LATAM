import { Footer } from '@common/components/footer';
import { Header } from '@common/components/header';
import '@auth/styles/signup.scss';

export function CompleteRegisterPage() {
  return (
    <main className="signup-wrapper">
      <Header />
      <Footer />
    </main>
  );
}
