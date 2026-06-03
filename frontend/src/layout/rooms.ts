import { ResuorceService } from "../api/services/resource";

const DoorIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M9 21V3h12v18"/><path d="M9 8h4"/><circle cx="16" cy="12" r="1" fill="currentColor" stroke="none"/></svg>`;

const DeskIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="3" rx="1"/><path d="M5 10v7"/><path d="M19 10v7"/><rect x="8" y="14" width="8" height="3" rx="1"/></svg>`;

const ArrowRightIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;

const AlertIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

export const getRoomsScreen = async (onRoomSelect: (id: number) => void): Promise<HTMLElement> => {
    const screen = document.createElement('main');
    screen.className = 'rooms-screen';

    const container = document.createElement('div');
    container.className = 'container';

    container.innerHTML = `
        <div class="rooms-hero">
            <div class="rooms-label">Resources</div>
            <h1 class="rooms-title">Reserve a <span>Workspace</span></h1>
            <p class="rooms-subtitle">Pick a conference room or hot desk to check availability and book your time slot.</p>
        </div>
        <div class="rooms-toolbar">
            <p class="rooms-count" id="rooms-count-label">Loading...</p>
        </div>
        <div id="rooms-grid-target" class="rooms-loading">
            <div class="skeleton skeleton-card"></div>
            <div class="skeleton skeleton-card"></div>
            <div class="skeleton skeleton-card"></div>
            <div class="skeleton skeleton-card"></div>
        </div>
    `;

    screen.appendChild(container);

    // Load rooms
    try {
        const rooms = await ResuorceService.list();
        const activeRooms = rooms.filter(r => r.is_active);

        const countLabel = container.querySelector('#rooms-count-label');
        if (countLabel) {
            countLabel.innerHTML = `Showing <strong>${activeRooms.length}</strong> active resources`;
        }

        const gridTarget = container.querySelector('#rooms-grid-target') as HTMLElement;
        gridTarget.className = 'rooms-grid';
        gridTarget.innerHTML = '';

        if (activeRooms.length === 0) {
            gridTarget.innerHTML = `
                <div class="rooms-empty">
                    <div class="rooms-empty-icon">${DeskIcon}</div>
                    <p>No active resources found.</p>
                </div>
            `;
            return screen;
        }

        activeRooms.forEach(room => {
            const card = document.createElement('div');
            card.className = 'room-card';

            const isRoom = room.type === 'room';
            const iconWrapClass = isRoom ? 'type-room' : 'type-desk';
            const icon = isRoom ? DoorIcon : DeskIcon;
            const typeLabel = isRoom ? 'Meeting Room' : 'Hot Desk';
            const tagClass = isRoom ? 'tag-room' : 'tag-desk';

            card.innerHTML = `
                <div class="room-card-header">
                    <div class="room-icon-wrap ${iconWrapClass}">${icon}</div>
                    <div class="room-status-dot"></div>
                </div>
                <div class="room-card-name">${room.name}</div>
                <div class="room-card-footer">
                    <span class="tag ${tagClass}">${typeLabel}</span>
                    <div class="room-card-arrow">${ArrowRightIcon}</div>
                </div>
            `;

            card.addEventListener('click', () => onRoomSelect(room.id));
            gridTarget.appendChild(card);
        });

    } catch (error) {
        const gridTarget = container.querySelector('#rooms-grid-target') as HTMLElement;
        gridTarget.className = 'rooms-grid';
        gridTarget.innerHTML = `
            <div class="rooms-error">
                ${AlertIcon}
                Failed to load resources. Please check the API connection.
            </div>
        `;
        const countLabel = container.querySelector('#rooms-count-label');
        if (countLabel) countLabel.textContent = '';
    }

    return screen;
};