import { Footer } from '@common/components/footer';
import { Header } from '@common/components/header';
import { SignUpForm } from '@auth/components/signup_form';
import '@auth/styles/signup.scss';

export function SignUpPage() {
  return (
    <main className="signup-wrapper">
      <Header />
      <SignUpForm />
      <Footer />
    </main>
  );
}
