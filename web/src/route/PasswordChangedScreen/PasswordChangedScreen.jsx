import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { AuthSuccessIcon, AuthPrimaryButton } from '../../components/auth/AuthForm';

const PasswordChangedScreen = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Password changed"
      subtitle="Your password has been updated. You can now sign in with your new password."
    >
      <AuthSuccessIcon />
      <AuthPrimaryButton type="button" onClick={() => navigate('/login')}>
        Sign in
      </AuthPrimaryButton>
    </AuthLayout>
  );
};

export default PasswordChangedScreen;
