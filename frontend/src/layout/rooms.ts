import { ResourceService } from "../api/services/resource";
import { Icons } from "../ui/icons";
import { skeletonGrid, errorBlock, emptyState } from "../ui/elements";

export const getRoomsScreen = async (onSelect: (id: number) => void): Promise<HTMLElement> => {
    const screen = document.createElement('main');
    screen.className = 'rooms-screen';

    const container = document.createElement('div');
    container.className = 'container';
    container.innerHTML = `
        <div class="rooms-hero">
            <div class="rooms-label">Resources</div>
            <h1 class="rooms-title">Reserve a <span>Workspace</span></h1>
            <p class="rooms-subtitle">Pick a conference room or hot desk to check availability and book a time slot.</p>
        </div>
        <div class="rooms-toolbar">
            <p class="rooms-count" id="rooms-count">Loading…</p>
        </div>
        <div id="grid-target"></div>
    `;
    screen.appendChild(container);

    const gridTarget = container.querySelector('#grid-target') as HTMLElement;
    const countEl = container.querySelector('#rooms-count') as HTMLElement;

    gridTarget.appendChild(skeletonGrid(4, 'rooms-loading'));

    try {
        const rooms = await ResourceService.list();
        const active = rooms.filter(r => r.is_active);

        countEl.innerHTML = `Showing <strong>${active.length}</strong> active resources`;
        gridTarget.innerHTML = '';

        if (active.length === 0) {
            gridTarget.appendChild(emptyState(Icons.desk, 'No active resources found.'));
            return screen;
        }

        const grid = document.createElement('div');
        grid.className = 'rooms-grid';

        active.forEach(room => {
            const isRoom = room.room_type === 'room';
            const card = document.createElement('div');
            card.className = 'room-card';
            card.innerHTML = `
                <div class="room-card-header">
                    <div class="room-icon-wrap ${isRoom ? 'type-room' : 'type-desk'}">${isRoom ? Icons.door : Icons.desk}</div>
                    <div class="room-status-dot"></div>
                </div>
                <div class="room-card-name">${room.name}</div>
                <div class="room-card-footer">
                    <span class="tag ${isRoom ? 'tag-room' : 'tag-desk'}">${isRoom ? 'Meeting Room' : 'Hot Desk'}</span>
                    <div class="room-card-arrow">${Icons.arrowRight}</div>
                </div>
            `;
            card.addEventListener('click', () => onSelect(room.id));
            grid.appendChild(card);
        });

        gridTarget.appendChild(grid);
    } catch {
        gridTarget.innerHTML = '';
        gridTarget.appendChild(errorBlock('Failed to load resources. Check API connection.', Icons.alert));
        countEl.textContent = '';
    }

    return screen;
};