import { getHeader } from "./layout/header";
import { getRoomsScreen } from "./layout/rooms";
import { getDashboard } from "./layout/dashboard";
import { getFooter } from "./layout/footer";
import { initAuthModal } from "./layout/auth";
import { Store } from "./store";

async function renderApp() {
    const app = document.getElementById('app');
    if (!app) return;

    const existingModal = document.getElementById('auth-modal-overlay');

    app.innerHTML = '';

    app.appendChild(getHeader(() => renderApp()));

    if (Store.currentRoomId === 0) {
        const roomsScreen = await getRoomsScreen((id: number) => {
            Store.currentRoomId = id;
            renderApp();
        });
        app.appendChild(roomsScreen);
    } else {
        const dashboardScreen = await getDashboard(Store.currentRoomId, () => {
            Store.currentRoomId = 0;
            renderApp();
        });
        app.appendChild(dashboardScreen);
    }

    app.appendChild(getFooter());

    if (!existingModal) {
        const authModal = initAuthModal(() => renderApp());
        document.body.appendChild(authModal);
    } else {
        document.body.appendChild(existingModal);
    }
}

document.addEventListener('DOMContentLoaded', renderApp);