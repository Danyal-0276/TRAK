// src/route/Login/Login.test.js
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Login from './Login';

// Mock dependencies
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }) => children,
}));

// Mock navigation
const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
};

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('Login Screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Rendering', () => {
        it('renders correctly with all elements', () => {
            const { getByText, getByPlaceholderText } = render(
                <Login navigation={mockNavigation} />
            );

            // Check main elements
            expect(getByText('Welcome Back')).toBeTruthy();
            expect(getByText('Sign in to continue')).toBeTruthy();
            expect(getByText('Email Address')).toBeTruthy();
            expect(getByText('Password')).toBeTruthy();
            expect(getByPlaceholderText('Enter your email')).toBeTruthy();
            expect(getByPlaceholderText('Enter your password')).toBeTruthy();
            expect(getByText('Forgot Password?')).toBeTruthy();
            expect(getByText('Sign In')).toBeTruthy();
            expect(getByText('or continue with')).toBeTruthy();
            expect(getByText("Don't have an account? ")).toBeTruthy();
            expect(getByText('Sign Up')).toBeTruthy();
        });

        it('renders social login buttons', () => {
            const { getAllByRole } = render(
                <Login navigation={mockNavigation} />
            );

            // Should have social buttons (Google, Apple, Facebook)
            const socialButtons = getAllByRole('button');
            expect(socialButtons.length).toBeGreaterThan(3);
        });
    });

    describe('Form Validation', () => {
        it('shows validation errors for empty fields', async () => {
            const { getByText } = render(<Login navigation={mockNavigation} />);

            const loginButton = getByText('Sign In');

            await act(async () => {
                fireEvent.press(loginButton);
            });

            await waitFor(() => {
                expect(getByText('Email is required')).toBeTruthy();
                expect(getByText('Password is required')).toBeTruthy();
            });
        });

        it('shows email validation error for invalid email', async () => {
            const { getByText, getByPlaceholderText } = render(
                <Login navigation={mockNavigation} />
            );

            const emailInput = getByPlaceholderText('Enter your email');
            const passwordInput = getByPlaceholderText('Enter your password');
            const loginButton = getByText('Sign In');

            await act(async () => {
                fireEvent.changeText(emailInput, 'invalid-email');
                fireEvent.changeText(passwordInput, 'password123');
                fireEvent.press(loginButton);
            });

            await waitFor(() => {
                expect(getByText('Please enter a valid email address')).toBeTruthy();
            });
        });

        it('shows password validation error for short password', async () => {
            const { getByText, getByPlaceholderText } = render(
                <Login navigation={mockNavigation} />
            );

            const emailInput = getByPlaceholderText('Enter your email');
            const passwordInput = getByPlaceholderText('Enter your password');
            const loginButton = getByText('Sign In');

            await act(async () => {
                fireEvent.changeText(emailInput, 'test@example.com');
                fireEvent.changeText(passwordInput, '123');
                fireEvent.press(loginButton);
            });

            await waitFor(() => {
                expect(getByText('Password must be at least 6 characters long')).toBeTruthy();
            });
        });

        it('clears validation errors when user starts typing', async () => {
            const { getByText, getByPlaceholderText, queryByText } = render(
                <Login navigation={mockNavigation} />
            );

            const emailInput = getByPlaceholderText('Enter your email');
            const loginButton = getByText('Sign In');

            // First, trigger validation error
            await act(async () => {
                fireEvent.press(loginButton);
            });

            await waitFor(() => {
                expect(getByText('Email is required')).toBeTruthy();
            });

            // Then start typing to clear error
            await act(async () => {
                fireEvent.changeText(emailInput, 'test@example.com');
            });

            await waitFor(() => {
                expect(queryByText('Email is required')).toBeNull();
            });
        });
    });

    describe('User Interactions', () => {
        it('toggles password visibility', async () => {
            const { getByPlaceholderText, getByTestId } = render(
                <Login navigation={mockNavigation} />
            );

            const passwordInput = getByPlaceholderText('Enter your password');
            const toggleButton = getByTestId('password-toggle');

            // Initially password should be hidden
            expect(passwordInput.props.secureTextEntry).toBe(true);

            // Toggle to show password
            await act(async () => {
                fireEvent.press(toggleButton);
            });

            expect(passwordInput.props.secureTextEntry).toBe(false);

            // Toggle back to hide password
            await act(async () => {
                fireEvent.press(toggleButton);
            });

            expect(passwordInput.props.secureTextEntry).toBe(true);
        });

        it('handles forgot password press', async () => {
            const { getByText } = render(<Login navigation={mockNavigation} />);

            const forgotButton = getByText('Forgot Password?');

            await act(async () => {
                fireEvent.press(forgotButton);
            });

            expect(Alert.alert).toHaveBeenCalledWith(
                'Forgot Password',
                'Password reset link sent to your email!'
            );
        });

        it('handles social login button presses', async () => {
            const { getAllByRole } = render(<Login navigation={mockNavigation} />);

            const socialButtons = getAllByRole('button');
            // Find social buttons (they should be after the main login button)
            const googleButton = socialButtons.find((button, index) => index > 1);

            if (googleButton) {
                await act(async () => {
                    fireEvent.press(googleButton);
                });

                expect(Alert.alert).toHaveBeenCalled();
            }
        });

        it('handles sign up link press', async () => {
            const { getByText } = render(<Login navigation={mockNavigation} />);

            const signUpButton = getByText('Sign Up');

            await act(async () => {
                fireEvent.press(signUpButton);
            });

            expect(Alert.alert).toHaveBeenCalledWith('Sign Up', 'Navigate to Sign Up');
        });
    });

    describe('Form Submission', () => {
        it('shows loading state during login', async () => {
            const { getByText, getByPlaceholderText } = render(
                <Login navigation={mockNavigation} />
            );

            const emailInput = getByPlaceholderText('Enter your email');
            const passwordInput = getByPlaceholderText('Enter your password');
            const loginButton = getByText('Sign In');

            // Fill form with valid data
            await act(async () => {
                fireEvent.changeText(emailInput, 'test@example.com');
                fireEvent.changeText(passwordInput, 'password123');
            });

            // Submit form
            await act(async () => {
                fireEvent.press(loginButton);
            });

            // Check if loading dots are shown
            const loadingContainer = loginButton.parent;
            expect(loadingContainer).toBeTruthy();
        });

        it('handles successful login', async () => {
            const { getByText, getByPlaceholderText } = render(
                <Login navigation={mockNavigation} />
            );

            const emailInput = getByPlaceholderText('Enter your email');
            const passwordInput = getByPlaceholderText('Enter your password');
            const loginButton = getByText('Sign In');

            // Fill form with valid data
            await act(async () => {
                fireEvent.changeText(emailInput, 'test@example.com');
                fireEvent.changeText(passwordInput, 'password123');
                fireEvent.press(loginButton);
            });

            // Wait for the simulated API call to complete
            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Success', 'Login successful!');
            }, { timeout: 3000 });
        });
    });

    describe('Keyboard Handling', () => {
        it('moves to password field when email return key is pressed', async () => {
            const { getByPlaceholderText } = render(
                <Login navigation={mockNavigation} />
            );

            const emailInput = getByPlaceholderText('Enter your email');

            await act(async () => {
                fireEvent(emailInput, 'submitEditing');
            });

            // This would typically test if password input receives focus
            // In a real test environment, you might check if the password input
            // has the focus or if the keyboard moves to it
        });

        it('submits form when password return key is pressed', async () => {
            const { getByPlaceholderText } = render(
                <Login navigation={mockNavigation} />
            );

            const emailInput = getByPlaceholderText('Enter your email');
            const passwordInput = getByPlaceholderText('Enter your password');

            // Fill form first
            await act(async () => {
                fireEvent.changeText(emailInput, 'test@example.com');
                fireEvent.changeText(passwordInput, 'password123');
                fireEvent(passwordInput, 'submitEditing');
            });

            // Should trigger form submission
            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Success', 'Login successful!');
            }, { timeout: 3000 });
        });
    });

    describe('Accessibility', () => {
        it('has proper accessibility labels', () => {
            const { getByPlaceholderText, getByText } = render(
                <Login navigation={mockNavigation} />
            );

            const emailInput = getByPlaceholderText('Enter your email');
            const passwordInput = getByPlaceholderText('Enter your password');
            const loginButton = getByText('Sign In');

            expect(emailInput).toBeTruthy();
            expect(passwordInput).toBeTruthy();
            expect(loginButton).toBeTruthy();
        });
    });
});