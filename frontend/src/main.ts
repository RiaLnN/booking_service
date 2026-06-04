import { getHeader } from "./layout/header";
import { getRoomsScreen } from "./layout/rooms";
import { getDashboard } from "./layout/dashboard";
import { getFooter } from "./layout/footer";
import { initAuthModal } from "./layout/auth";
import { getAdminPanel } from "./layout/admin";
import { Store } from "./store";

async function renderApp() {
    const app = document.getElementById('app');
    if (!app) return;

    const existingModal = document.getElementById('auth-modal-overlay');
    app.innerHTML = '';
    app.appendChild(getHeader(() => renderApp()));

    const view = Store.currentView;

    if (view === 'admin' && Store.isAdmin) {
        app.appendChild(getAdminPanel(() => {
            Store.currentView = 'rooms';
            renderApp();
        }));
    } else if (Store.currentRoomId === 0) {
        const rooms = await getRoomsScreen(id => {
            Store.currentRoomId = id;
            renderApp();
        });
        app.appendChild(rooms);
    } else {
        const dash = await getDashboard(Store.currentRoomId, () => {
            Store.currentRoomId = 0;
            renderApp();
        });
        app.appendChild(dash);
    }

    app.appendChild(getFooter());

    if (!existingModal) {
        document.body.appendChild(initAuthModal(() => renderApp()));
    } else {
        document.body.appendChild(existingModal);
    }
}

document.addEventListener('DOMContentLoaded', renderApp);