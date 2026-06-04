
import { ResourceService } from "../api/services/resource";
import { BookingService } from "../api/services/booking";
import { Icons } from "../ui/icons";
import { fmt } from "../ui/fmt";
import { errorBlock } from "../ui/elements";
import type { Room, RoomCreate } from "../types/resource";
import type { BookCreate } from "../types/booking";

// ── helpers ─────────────────────────────────────────────────────────

function input(type: string, id: string, placeholder: string, extra = ''): string {
    return `<input type="${type}" id="${id}" class="auth-input" placeholder="${placeholder}" ${extra}>`;
}

function select(id: string, options: [string, string][]): string {
    const opts = options.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
    return `<select id="${id}" class="auth-input">${opts}</select>`;
}

function formGroup(label: string, icon: string, field: string): string {
    return `<div class="form-group"><label>${icon} ${label}</label>${field}</div>`;
}

// ── Room management ──────────────────────────────────────────────────

function buildRoomsPanel(onRefresh: () => void): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'admin-panel';

    wrap.innerHTML = `
        <div class="admin-panel-header">
            <h3>${Icons.door} Manage Resources</h3>
            <button class="admin-toggle-form btn-header btn-admin-ghost" id="toggle-create-room">
                ${Icons.plus} New Resource
            </button>
        </div>
        <div class="admin-create-form" id="create-room-form" style="display:none">
            <div class="admin-form-grid">
                ${formGroup('Name', Icons.list, input('text', 'room-name', 'Boardroom Alpha', 'minlength="3" maxlength="20"'))}
                ${formGroup('Type', Icons.settings, select('room-type', [['room', 'Meeting Room'], ['desk', 'Hot Desk']]))}
                <div class="form-group form-group-check">
                    <label class="check-label">
                        <input type="checkbox" id="room-active" checked>
                        <span>Active on creation</span>
                    </label>
                </div>
            </div>
            <div class="admin-form-actions">
                <button class="btn-header btn-signin" id="create-room-submit">${Icons.plus} Create</button>
                <div class="admin-form-msg" id="create-room-msg"></div>
            </div>
        </div>
        <div id="rooms-list-wrap"></div>
    `;

    wrap.querySelector('#toggle-create-room')?.addEventListener('click', () => {
        const form = wrap.querySelector('#create-room-form') as HTMLElement;
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });

    wrap.querySelector('#create-room-submit')?.addEventListener('click', async () => {
        const submitBtn = wrap.querySelector('#create-room-submit') as HTMLButtonElement;
        const msg = wrap.querySelector('#create-room-msg') as HTMLElement;
        const name = (wrap.querySelector('#room-name') as HTMLInputElement).value.trim();
        const room_type = (wrap.querySelector('#room-type') as HTMLSelectElement).value as RoomCreate['room_type'];
        const is_active = (wrap.querySelector('#room-active') as HTMLInputElement).checked;

        msg.textContent = '';
        if (name.length < 3) { msg.textContent = 'Name must be at least 3 characters.'; return; }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner"></span>Creating…`;

        try {
            await ResourceService.create({ name, room_type, is_active });
            msg.textContent = '✓ Created successfully';
            msg.className = 'admin-form-msg success';
            (wrap.querySelector('#room-name') as HTMLInputElement).value = '';
            await loadRoomsList();
        } catch (err: any) {
            msg.textContent = err?.response?.data?.detail ?? 'Failed to create resource.';
            msg.className = 'admin-form-msg error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `${Icons.plus} Create`;
        }
    });

    const loadRoomsList = async () => {
        const listWrap = wrap.querySelector('#rooms-list-wrap') as HTMLElement;
        listWrap.innerHTML = `<div class="admin-list-loading">Loading…</div>`;

        try {
            const rooms = await ResourceService.list();
            if (rooms.length === 0) {
                listWrap.innerHTML = `<p class="admin-empty">No resources yet.</p>`;
                return;
            }

            const table = document.createElement('div');
            table.className = 'admin-table';

            const header = document.createElement('div');
            header.className = 'admin-table-header';
            header.innerHTML = `<span>Name</span><span>Type</span><span>Status</span><span></span>`;
            table.appendChild(header);

            rooms.forEach(room => {
                const row = buildRoomRow(room, async () => {
                    await loadRoomsList();
                    onRefresh();
                });
                table.appendChild(row);
            });

            listWrap.innerHTML = '';
            listWrap.appendChild(table);
        } catch {
            listWrap.appendChild(errorBlock('Failed to load resources.', Icons.alert));
        }
    };

    loadRoomsList();
    return wrap;
}

function buildRoomRow(room: Room, onDelete: () => void): HTMLElement {
    const row = document.createElement('div');
    row.className = 'admin-table-row';

    const isRoom = room.room_type === 'room';
    row.innerHTML = `
        <span class="admin-cell-name">
            <span class="admin-resource-icon ${isRoom ? 'type-room' : 'type-desk'}">${isRoom ? Icons.door : Icons.desk}</span>
            ${room.name}
        </span>
        <span><span class="tag ${isRoom ? 'tag-room' : 'tag-desk'}">${isRoom ? 'Meeting Room' : 'Hot Desk'}</span></span>
        <span><span class="status-pill ${room.is_active ? 'active' : 'inactive'}">${room.is_active ? 'Active' : 'Inactive'}</span></span>
        <span class="admin-row-actions">
            <button class="btn-delete" data-id="${room.id}" title="Delete">${Icons.trash}</button>
        </span>
    `;

    row.querySelector('.btn-delete')?.addEventListener('click', async e => {
        const delBtn = (e.currentTarget as HTMLButtonElement);
        if (!confirm(`Delete "${room.name}"? This cannot be undone.`)) return;
        delBtn.disabled = true;
        try {
            await ResourceService.remove(room.id);
            onDelete();
        } catch {
            delBtn.disabled = false;
        }
    });

    return row;
}

// ── Booking slot management ──────────────────────────────────────────

function buildSlotsPanel(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'admin-panel';

    const now = new Date();
    const defStart = fmt.toInputDateTime(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0));
    const defEnd = fmt.toInputDateTime(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0));

    wrap.innerHTML = `
        <div class="admin-panel-header">
            <h3>${Icons.calendar} Create Time Slots</h3>
        </div>
        <div class="admin-create-form">
            <div class="admin-form-grid">
                ${formGroup('Resource ID', Icons.door, input('number', 'slot-room-id', '1', 'min="1"'))}
                ${formGroup('Start time', Icons.clock, input('datetime-local', 'slot-start', '', `value="${defStart}"`))}
                ${formGroup('End time', Icons.clock, input('datetime-local', 'slot-end', '', `value="${defEnd}"`))}
            </div>
            <div class="admin-form-actions">
                <button class="btn-header btn-signin" id="create-slot-submit">${Icons.plus} Create Slot</button>
                <div class="admin-form-msg" id="create-slot-msg"></div>
            </div>
        </div>
        <div id="slot-preview"></div>
    `;

    wrap.querySelector('#create-slot-submit')?.addEventListener('click', async () => {
        const submitBtn = wrap.querySelector('#create-slot-submit') as HTMLButtonElement;
        const msg = wrap.querySelector('#create-slot-msg') as HTMLElement;

        const resource_id = Number((wrap.querySelector('#slot-room-id') as HTMLInputElement).value);
        const startRaw = (wrap.querySelector('#slot-start') as HTMLInputElement).value;
        const endRaw = (wrap.querySelector('#slot-end') as HTMLInputElement).value;

        msg.textContent = '';

        if (!resource_id || !startRaw || !endRaw) {
            msg.textContent = 'Fill in all fields.';
            msg.className = 'admin-form-msg error';
            return;
        }
        if (new Date(startRaw) >= new Date(endRaw)) {
            msg.textContent = 'Start time must be before end time.';
            msg.className = 'admin-form-msg error';
            return;
        }

        const payload: BookCreate = {
            resource_id,
            start_time: fmt.toISO(startRaw),
            end_time: fmt.toISO(endRaw),
        };

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner"></span>Creating…`;

        try {
            const created = await BookingService.create(payload);
            msg.innerHTML = `✓ Slot #${created.id} created: ${fmt.time(created.start_time)} – ${fmt.time(created.end_time)}`;
            msg.className = 'admin-form-msg success';
        } catch (err: any) {
            msg.textContent = err?.response?.data?.detail ?? 'Failed to create slot.';
            msg.className = 'admin-form-msg error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `${Icons.plus} Create Slot`;
        }
    });

    return wrap;
}

// ── My bookings panel (admin view) ───────────────────────────────────

function buildMyBookingsPanel(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'admin-panel';
    wrap.innerHTML = `
        <div class="admin-panel-header">
            <h3>${Icons.list} All My Bookings</h3>
            <button class="btn-header btn-admin-ghost" id="refresh-bookings">${Icons.settings} Refresh</button>
        </div>
        <div id="my-bookings-list"></div>
    `;

    const load = async () => {
        const listEl = wrap.querySelector('#my-bookings-list') as HTMLElement;
        listEl.innerHTML = `<div class="admin-list-loading">Loading…</div>`;

        try {
            const books = await BookingService.my();
            if (books.length === 0) {
                listEl.innerHTML = `<p class="admin-empty">No bookings yet.</p>`;
                return;
            }

            const table = document.createElement('div');
            table.className = 'admin-table';

            const header = document.createElement('div');
            header.className = 'admin-table-header';
            header.innerHTML = `<span>Slot ID</span><span>Start</span><span>End</span><span>Status</span><span></span>`;
            table.appendChild(header);

            books.forEach(b => {
                const row = document.createElement('div');
                row.className = 'admin-table-row';
                row.innerHTML = `
                    <span class="mono">#${b.id}</span>
                    <span class="mono">${fmt.time(b.start_time)}</span>
                    <span class="mono">${fmt.time(b.end_time)}</span>
                    <span><span class="status-pill ${b.is_booked ? 'active' : 'inactive'}">${b.is_booked ? 'Booked' : 'Free'}</span></span>
                    <span class="admin-row-actions">
                        <button class="btn-delete" data-id="${b.id}" title="Delete">${Icons.trash}</button>
                    </span>
                `;
                row.querySelector('.btn-delete')?.addEventListener('click', async e => {
                    const delBtn = e.currentTarget as HTMLButtonElement;
                    if (!confirm(`Delete booking #${b.id}?`)) return;
                    delBtn.disabled = true;
                    try { await BookingService.remove(b.id); await load(); }
                    catch { delBtn.disabled = false; }
                });
                table.appendChild(row);
            });

            listEl.innerHTML = '';
            listEl.appendChild(table);
        } catch {
            listEl.appendChild(errorBlock('Failed to load bookings.', Icons.alert));
        }
    };

    wrap.querySelector('#refresh-bookings')?.addEventListener('click', load);
    load();
    return wrap;
}

// ── Main export ───────────────────────────────────────────────────────

export const getAdminPanel = (onRoomsChanged: () => void): HTMLElement => {
    const page = document.createElement('main');
    page.className = 'admin-page';
    page.innerHTML = `
        <div class="container">
            <div class="admin-hero">
                <div class="rooms-label">${Icons.shield} Admin Panel</div>
                <h1 class="rooms-title">Manage <span>Workspace</span></h1>
                <p class="rooms-subtitle">Create and manage resources, time slots, and bookings.</p>
            </div>
        </div>
    `;

    const container = page.querySelector('.container') as HTMLElement;
    container.appendChild(buildRoomsPanel(onRoomsChanged));
    container.appendChild(buildSlotsPanel());
    container.appendChild(buildMyBookingsPanel());

    return page;
};