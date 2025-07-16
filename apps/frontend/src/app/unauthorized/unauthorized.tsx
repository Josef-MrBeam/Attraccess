import { memo, useState } from 'react';
import { RegistrationForm } from './registrationForm';
import { LoginForm } from './loginForm';
import { UnauthorizedLayout } from './unauthorized-layout/layout';
import { SSOLogin } from './ssoLogin';
import { PasswordResetForm } from './password-reset/passwordResetForm';

export const Unauthorized = memo(function UnauthorizedComponent() {
  const [formToShow, setFormToShow] = useState<'login' | 'register' | 'forgotPassword'>('login');

  return (
    <UnauthorizedLayout>
      {formToShow === 'login' && (
        <LoginForm
          onNeedsAccount={() => setFormToShow('register')}
          onForgotPassword={() => setFormToShow('forgotPassword')}
        />
      )}
      {formToShow === 'register' && <RegistrationForm onHasAccount={() => setFormToShow('login')} />}
      {formToShow === 'forgotPassword' && <PasswordResetForm onGoBack={() => setFormToShow('login')} />}
      <SSOLogin />
    </UnauthorizedLayout>
  );
});

Unauthorized.displayName = 'Unauthorized';
