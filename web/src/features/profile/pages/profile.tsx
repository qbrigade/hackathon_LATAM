import { Footer } from '@common/components/footer';
import { Header } from '@common/components/header';
import ProfileComponent from '@profile/components/profile_component';
import '@auth/styles/signup.scss';

export function ProfilePage() {
  return (
    <main className="signup-wrapper">
      <Header />
      <ProfileComponent />
      <Footer />
    </main>
  );
}
