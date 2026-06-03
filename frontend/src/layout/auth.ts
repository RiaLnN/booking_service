import { AuthService } from "../api/services/auth";

const CloseIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const MailIcon  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
const LockIcon  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const UserIcon  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const AlertIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

export const initAuthModal = (onSuccess: () => void): HTMLElement => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'auth-modal-overlay';

    let isLoginMode = true;

    const renderModalContent = () => {
        overlay.innerHTML = `
            <div class="auth-modal">
                <button class="modal-close" id="modal-close-btn" title="Close">${CloseIcon}</button>

                <h2 class="auth-title">${isLoginMode ? 'Welcome back' : 'Create account'}</h2>
                <p class="auth-subtitle">${isLoginMode ? 'Sign in to manage your bookings.' : 'Register to start reserving workspaces.'}</p>

                <div class="auth-error" id="auth-error-block">${AlertIcon} <span id="auth-error-text"></span></div>

                <form class="auth-form" id="auth-form-element" novalidate>
                    ${!isLoginMode ? `
                        <div class="form-group">
                            <label for="auth-username">${UserIcon} Username</label>
                            <input type="text" id="auth-username" class="auth-input" autocomplete="username"
                                required placeholder="ivan_dev">
                        </div>
                        <div class="auth-divider"><span>account</span></div>
                    ` : ''}
                    <div class="form-group">
                        <label for="auth-email">${MailIcon} Email address</label>
                        <input type="email" id="auth-email" class="auth-input" autocomplete="email"
                            required placeholder="ivan@tuke.sk">
                    </div>
                    <div class="form-group">
                        <label for="auth-password">${LockIcon} Password</label>
                        <input type="password" id="auth-password" class="auth-input" autocomplete="${isLoginMode ? 'current-password' : 'new-password'}"
                            required placeholder="••••••••" minlength="6">
                    </div>
                    <button type="submit" class="btn-submit" id="auth-submit-btn">
                        ${isLoginMode ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div class="auth-switch">
                    ${isLoginMode ? "Don't have an account?" : 'Already have an account?'}
                    <button class="auth-switch-btn" id="auth-mode-switch">
                        ${isLoginMode ? 'Register' : 'Sign In'}
                    </button>
                </div>
            </div>
        `;

        setupEvents();

        setTimeout(() => {
            const firstInput = overlay.querySelector('.auth-input') as HTMLInputElement;
            firstInput?.focus();
        }, 100);
    };

    const setLoading = (loading: boolean) => {
        const btn = overlay.querySelector('#auth-submit-btn') as HTMLButtonElement;
        const inputs = overlay.querySelectorAll('.auth-input') as NodeListOf<HTMLInputElement>;
        if (!btn) return;
        btn.disabled = loading;
        inputs.forEach(i => i.disabled = loading);
        if (loading) {
            btn.innerHTML = `<span class="spinner"></span> ${isLoginMode ? 'Signing in…' : 'Creating…'}`;
        } else {
            btn.innerHTML = isLoginMode ? 'Sign In' : 'Create Account';
        }
    };

    const showError = (msg: string) => {
        const block = overlay.querySelector('#auth-error-block') as HTMLElement;
        const text  = overlay.querySelector('#auth-error-text') as HTMLElement;
        if (!block || !text) return;
        text.textContent = msg;
        block.style.display = 'flex';
        block.style.alignItems = 'center';
        block.style.gap = '8px';
    };

    const hideError = () => {
        const block = overlay.querySelector('#auth-error-block') as HTMLElement;
        if (block) block.style.display = 'none';
    };

    const setupEvents = () => {
        overlay.querySelector('#modal-close-btn')?.addEventListener('click', closeModal);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        overlay.querySelector('#auth-mode-switch')?.addEventListener('click', () => {
            isLoginMode = !isLoginMode;
            renderModalContent();
        });

        // Clear error on input
        overlay.querySelectorAll('.auth-input').forEach(input => {
            input.addEventListener('input', hideError);
        });

        const form = overlay.querySelector('#auth-form-element') as HTMLFormElement;
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError();

            const email    = (overlay.querySelector('#auth-email')    as HTMLInputElement)?.value.trim();
            const password = (overlay.querySelector('#auth-password') as HTMLInputElement)?.value;

            if (!email || !password) {
                showError('Please fill in all fields.');
                return;
            }
            if (password.length < 6) {
                showError('Password must be at least 6 characters.');
                return;
            }

            setLoading(true);

            try {
                if (isLoginMode) {
                    await AuthService.login({ email, password });
                } else {
                    const username = (overlay.querySelector('#auth-username') as HTMLInputElement)?.value.trim();
                    if (!username) { showError('Please enter a username.'); setLoading(false); return; }
                    await AuthService.register({ username, email, password });
                }

                closeModal();
                onSuccess();

            } catch (error: any) {
                setLoading(false);
                const detail = error?.response?.data?.detail;
                if (typeof detail === 'string') {
                    showError(detail);
                } else if (Array.isArray(detail)) {
                    showError(detail[0]?.msg || 'Validation error.');
                } else {
                    showError(isLoginMode
                        ? 'Invalid email or password.'
                        : 'Registration failed. The email may already be in use.');
                }
            }
        });
    };

    const closeModal = () => {
        overlay.classList.remove('active');
    };

    renderModalContent();

    return overlay;
};

export const openAuthModal = () => {
    document.getElementById('auth-modal-overlay')?.classList.add('active');
};