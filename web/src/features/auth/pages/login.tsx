import { Footer } from '@common/components/footer';
import { Header } from '@common/components/header';
import { LoginForm } from '@auth/components/login_form';
import '@auth/styles/signup.scss';

export function LoginPage() {
  return (
    <main className="signup-wrapper">
      <Header />
      <LoginForm />
      <Footer />
    </main>
  );
}
