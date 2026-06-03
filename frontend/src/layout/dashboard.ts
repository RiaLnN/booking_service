import { BookingService } from "../api/services/booking";
import { Store } from "../store";
import { openAuthModal } from "./auth";
import type { BookResponse } from "../types/booking";

const BackIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>`;
const DoorIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M9 21V3h12v18"/><circle cx="16" cy="12" r="1" fill="currentColor" stroke="none"/></svg>`;
const CheckIcon = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const LockIcon  = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const InfoIcon  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
const ClockIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateHeader(iso: string): string {
    return new Date(iso).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function showBookingModal(slot: BookResponse, roomId: number, onBooked: () => void): void {
    const isAuth = !!Store.token;

    if (!isAuth) {
        openAuthModal();
        return;
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'booking-modal-backdrop';

    const startFmt = formatTime(slot.start_time);
    const endFmt   = formatTime(slot.end_time);
    const dateFmt  = formatDateHeader(slot.start_time);

    backdrop.innerHTML = `
        <div class="booking-modal">
            <h3 class="booking-modal-title">Book this slot?</h3>
            <div class="booking-modal-time">
                ${ClockIcon}
                ${dateFmt} · ${startFmt} – ${endFmt}
            </div>
            <div class="booking-modal-actions">
                <button class="btn-cancel-modal" id="bm-cancel">Cancel</button>
                <button class="btn-book" id="bm-confirm">Confirm booking</button>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);

    backdrop.querySelector('#bm-cancel')?.addEventListener('click', () => backdrop.remove());
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });

    backdrop.querySelector('#bm-confirm')?.addEventListener('click', async () => {
        const confirmBtn = backdrop.querySelector('#bm-confirm') as HTMLButtonElement;
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `<span class="spinner"></span> Booking…`;

        await BookingService.book({ start_time: startFmt, end_time: endFmt, resource_id: roomId });
        backdrop.remove();
        onBooked();
    });
}

export const getDashboard = async (
    roomId: number,
    onBack: () => void
): Promise<HTMLElement> => {
    const dashboard = document.createElement('main');
    dashboard.className = 'dashboard';

    const container = document.createElement('div');
    container.className = 'container';
    dashboard.appendChild(container);

    const backBtn = document.createElement('button');
    backBtn.className = 'btn-back';
    backBtn.innerHTML = `${BackIcon} Back to Resources`;
    backBtn.addEventListener('click', onBack);
    container.appendChild(backBtn);

    const layout = document.createElement('div');
    layout.className = 'dashboard-layout';
    container.appendChild(layout);

    const sidebar = document.createElement('aside');
    sidebar.className = 'resource-sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-label">Current Resource</div>
        <div class="sidebar-resource-card">
            <div class="sidebar-resource-icon type-room" id="sidebar-icon-wrap">${DoorIcon}</div>
            <div class="sidebar-resource-name" id="sidebar-name">Resource #${roomId}</div>
            <div class="sidebar-resource-meta" id="sidebar-meta">Loading…</div>
        </div>
        <div class="sidebar-stats" id="sidebar-stats">
            <div class="stat-row">
                <span class="stat-label"><span class="stat-dot available"></span> Available</span>
                <span class="stat-value" id="stat-available">—</span>
            </div>
            <div class="stat-row">
                <span class="stat-label"><span class="stat-dot booked"></span> Occupied</span>
                <span class="stat-value" id="stat-booked">—</span>
            </div>
        </div>
        <div class="sidebar-progress" id="sidebar-progress" style="display:none">
            <div class="progress-label">
                <span>Occupancy</span>
                <span id="occupancy-pct">0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill" style="width:0%"></div>
            </div>
        </div>
    `;
    layout.appendChild(sidebar);

    const timelineSection = document.createElement('section');
    timelineSection.className = 'timeline-main';

    const isAuth = !!Store.token;
    let authBanner = '';
    if (!isAuth) {
        authBanner = `
            <div class="auth-prompt-banner">
                ${InfoIcon}
                <span>
                    <button class="auth-prompt-link" id="banner-signin">Sign in</button>
                    to book available time slots.
                </span>
            </div>
        `;
    }

    timelineSection.innerHTML = `
        ${authBanner}
        <div class="timeline-header">
            <h2 class="timeline-title">Occupation Timeline</h2>
            <div class="timeline-legend">
                <div class="legend-item"><span class="legend-dot available"></span> Available</div>
                <div class="legend-item"><span class="legend-dot booked"></span> Occupied</div>
            </div>
        </div>
        <div id="slots-container">
            <div class="slots-skeleton">
                ${Array.from({length: 8}, () => '<div class="skeleton slot-skeleton"></div>').join('')}
            </div>
        </div>
    `;
    layout.appendChild(timelineSection);

    timelineSection.querySelector('#banner-signin')?.addEventListener('click', openAuthModal);

    const renderSlots = async () => {
        const slotsContainer = container.querySelector('#slots-container') as HTMLElement;

        try {
            const books = await BookingService.list(roomId);

            const available = books.filter(b => !b.is_booked).length;
            const booked = books.filter(b =>  b.is_booked).length;
            const pct = books.length ? Math.round((booked / books.length) * 100) : 0;

            const statAvail = sidebar.querySelector('#stat-available');
            const statBook = sidebar.querySelector('#stat-booked');
            if (statAvail) statAvail.textContent = String(available);
            if (statBook) statBook.textContent  = String(booked);

            const prog = sidebar.querySelector('#sidebar-progress') as HTMLElement;
            const fill = sidebar.querySelector('#progress-fill') as HTMLElement;
            const pctEl= sidebar.querySelector('#occupancy-pct');
            if (prog) prog.style.display = 'block';
            if (pctEl) pctEl.textContent = `${pct}%`;

            if (fill) {
                fill.style.width = `${pct}%`;
                fill.className = 'progress-fill' + (pct >= 80 ? ' high' : pct >= 50 ? ' mid' : '');
            }

            if (books.length > 0) {
                const meta = sidebar.querySelector('#sidebar-meta');
                if (meta) meta.textContent = formatDateHeader(books[0].start_time);
            }

            if (books.length === 0) {
                slotsContainer.innerHTML = `
                    <div class="timeline-empty">
                        <div class="timeline-empty-icon">${ClockIcon}</div>
                        <p>No time slots found for this resource.</p>
                    </div>
                `;
                return;
            }

            const grid = document.createElement('div');
            grid.className = 'slots-grid';

            books.forEach(book => {
                const card = document.createElement('div');
                const statusClass = book.is_booked ? 'booked' : 'available';
                card.className = `slot-card ${statusClass}`;

                const startFmt = formatTime(book.start_time);
                const endFmt   = formatTime(book.end_time);
                const statusIcon = book.is_booked ? LockIcon : CheckIcon;
                const statusText = book.is_booked ? 'Occupied' : 'Free';

                card.innerHTML = `
                    <div class="slot-time-label">${startFmt}</div>
                    <div class="slot-time-range">→ ${endFmt}</div>
                    <div class="slot-status-badge">${statusIcon} ${statusText}</div>
                `;

                if (!book.is_booked) {
                    card.title = 'Click to book this slot';
                    card.addEventListener('click', () => showBookingModal(book, roomId, renderSlots));
                }

                grid.appendChild(card);
            });

            slotsContainer.innerHTML = '';
            slotsContainer.appendChild(grid);

        } catch (e) {
            console.error(e);
            const slotsContainer = container.querySelector('#slots-container') as HTMLElement;
            slotsContainer.innerHTML = `
                <div class="rooms-error">
                    Failed to load timeline. Please check the API connection.
                </div>
            `;
        }
    };

    await renderSlots();

    return dashboard;
};