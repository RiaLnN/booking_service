import { AuthService } from "../api/services/auth";
import { Icons } from "../ui/icons";

export const initAuthModal = (onSuccess: () => void): HTMLElement => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'auth-modal-overlay';

    let isLogin = true;

    const render = () => {
        overlay.innerHTML = `
            <div class="auth-modal">
                <button class="modal-close" id="modal-close-btn">${Icons.close}</button>
                <h2 class="auth-title">${isLogin ? 'Welcome back' : 'Create account'}</h2>
                <p class="auth-subtitle">${isLogin ? 'Sign in to manage your bookings.' : 'Register to start reserving workspaces.'}</p>
                <div class="auth-error" id="auth-error"></div>
                <form class="auth-form" id="auth-form" novalidate>
                    ${!isLogin ? `
                        <div class="form-group">
                            <label>${Icons.user} Username</label>
                            <input type="text" id="auth-username" class="auth-input" autocomplete="username" placeholder="ivan_dev">
                        </div>` : ''}
                    <div class="form-group">
                        <label>${Icons.mail} Email address</label>
                        <input type="email" id="auth-email" class="auth-input" autocomplete="email" placeholder="ivan@tuke.sk">
                    </div>
                    <div class="form-group">
                        <label>${Icons.keyRound} Password</label>
                        <input type="password" id="auth-password" class="auth-input" autocomplete="${isLogin ? 'current-password' : 'new-password'}" placeholder="••••••••" minlength="6">
                    </div>
                    <button type="submit" class="btn-submit" id="auth-submit">${isLogin ? 'Sign In' : 'Create Account'}</button>
                </form>
                <div class="auth-switch">
                    ${isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button class="auth-switch-btn" id="auth-mode-switch">${isLogin ? 'Register' : 'Sign In'}</button>
                </div>
            </div>
        `;
        attachEvents();
        setTimeout(() => (overlay.querySelector('.auth-input') as HTMLInputElement)?.focus(), 80);
    };

    const showError = (msg: string) => {
        const el = overlay.querySelector('#auth-error') as HTMLElement;
        el.innerHTML = `${Icons.alert}<span>${msg}</span>`;
        el.style.display = 'flex';
    };

    const hideError = () => {
        const el = overlay.querySelector('#auth-error') as HTMLElement;
        if (el) el.style.display = 'none';
    };

    const setLoading = (loading: boolean, label: string) => {
        const btn = overlay.querySelector('#auth-submit') as HTMLButtonElement;
        const inputs = overlay.querySelectorAll<HTMLInputElement>('.auth-input');
        btn.disabled = loading;
        inputs.forEach(i => { i.disabled = loading; });
        btn.innerHTML = loading ? `<span class="spinner"></span>${label}…` : label;
    };

    const close = () => overlay.classList.remove('active');

    const attachEvents = () => {
        overlay.querySelector('#modal-close-btn')?.addEventListener('click', close);
        overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
        overlay.querySelector('#auth-mode-switch')?.addEventListener('click', () => { isLogin = !isLogin; render(); });
        overlay.querySelectorAll('.auth-input').forEach(i => i.addEventListener('input', hideError));

        (overlay.querySelector('#auth-form') as HTMLFormElement).addEventListener('submit', async e => {
            e.preventDefault();
            hideError();

            const email = (overlay.querySelector('#auth-email') as HTMLInputElement).value.trim();
            const password = (overlay.querySelector('#auth-password') as HTMLInputElement).value;

            if (!email || !password) { showError('Please fill in all fields.'); return; }
            if (password.length < 6) { showError('Password must be at least 6 characters.'); return; }

            const label = isLogin ? 'Sign In' : 'Create Account';
            setLoading(true, label);

            try {
                if (isLogin) {
                    await AuthService.login({ email, password });
                } else {
                    const username = (overlay.querySelector('#auth-username') as HTMLInputElement)?.value.trim();
                    if (!username) { showError('Please enter a username.'); setLoading(false, label); return; }
                    await AuthService.register({ username, email, password });
                }
                close();
                onSuccess();
            } catch (err: any) {
                setLoading(false, label);
                const detail = err?.response?.data?.detail;
                showError(
                    typeof detail === 'string' ? detail :
                    Array.isArray(detail) ? detail[0]?.msg :
                    isLogin ? 'Invalid email or password.' : 'Registration failed. Email may already be in use.'
                );
            }
        });
    };

    render();
    return overlay;
};

export const openAuthModal = () =>
    document.getElementById('auth-modal-overlay')?.classList.add('active');