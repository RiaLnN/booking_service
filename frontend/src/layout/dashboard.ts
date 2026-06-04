import { BookingService } from "../api/services/booking";
import { Store } from "../store";
import { openAuthModal } from "./auth";
import { Icons } from "../ui/icons";
import { fmt } from "../ui/fmt";
import { skeletonGrid, errorBlock } from "../ui/elements";
import type { BookResponse } from "../types/booking";

function buildBookingModal(slot: BookResponse, onBooked: () => void): void {
    if (!Store.token) { openAuthModal(); return; }

    const backdrop = document.createElement('div');
    backdrop.className = 'booking-modal-backdrop';
    backdrop.innerHTML = `
        <div class="booking-modal">
            <h3 class="booking-modal-title">Book this slot?</h3>
            <div class="booking-modal-time">
                ${Icons.clock}
                ${fmt.date(slot.start_time)} · ${fmt.time(slot.start_time)} – ${fmt.time(slot.end_time)}
            </div>
            <div class="booking-modal-actions">
                <button class="btn-cancel-modal" id="bm-cancel">Cancel</button>
                <button class="btn-book" id="bm-confirm">Confirm booking</button>
            </div>
        </div>
    `;
    document.body.appendChild(backdrop);

    backdrop.querySelector('#bm-cancel')?.addEventListener('click', () => backdrop.remove());
    backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });

    backdrop.querySelector('#bm-confirm')?.addEventListener('click', async () => {
        const btn = backdrop.querySelector('#bm-confirm') as HTMLButtonElement;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span> Booking…`;
        try {
            await BookingService.occupy(slot.id);
        } finally {
            backdrop.remove();
            onBooked();
        }
    });
}

function buildSidebar(roomId: number): HTMLElement {
    const aside = document.createElement('aside');
    aside.className = 'resource-sidebar';
    aside.innerHTML = `
        <div class="sidebar-label">Current Resource</div>
        <div class="sidebar-resource-card">
            <div class="sidebar-resource-icon type-room">${Icons.door}</div>
            <div class="sidebar-resource-name">Resource #${roomId}</div>
            <div class="sidebar-resource-meta" id="sidebar-meta">Loading…</div>
        </div>
        <div class="sidebar-stats">
            <div class="stat-row">
                <span class="stat-label"><span class="stat-dot available"></span>Available</span>
                <span class="stat-value" id="stat-available">—</span>
            </div>
            <div class="stat-row">
                <span class="stat-label"><span class="stat-dot booked"></span>Occupied</span>
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
    return aside;
}

function updateSidebar(aside: HTMLElement, books: BookResponse[]): void {
    const available = books.filter(b => !b.is_booked).length;
    const booked = books.filter(b => b.is_booked).length;
    const pct = books.length ? Math.round((booked / books.length) * 100) : 0;

    const q = (sel: string) => aside.querySelector(sel);

    if (books.length > 0) (q('#sidebar-meta') as HTMLElement).textContent = fmt.date(books[0].start_time);
    (q('#stat-available') as HTMLElement).textContent = String(available);
    (q('#stat-booked') as HTMLElement).textContent = String(booked);
    (q('#sidebar-progress') as HTMLElement).style.display = 'block';
    (q('#occupancy-pct') as HTMLElement).textContent = `${pct}%`;

    const fill = q('#progress-fill') as HTMLElement;
    fill.style.width = `${pct}%`;
    fill.className = 'progress-fill' + (pct >= 80 ? ' high' : pct >= 50 ? ' mid' : '');
}

function buildSlotCard(book: BookResponse, onRefresh: () => void): HTMLElement {
    const card = document.createElement('div');
    card.className = `slot-card ${book.is_booked ? 'booked' : 'available'}`;
    card.innerHTML = `
        <div class="slot-time-label">${fmt.time(book.start_time)}</div>
        <div class="slot-time-range">→ ${fmt.time(book.end_time)}</div>
        <div class="slot-status-badge">${book.is_booked ? Icons.lock : Icons.check} ${book.is_booked ? 'Occupied' : 'Free'}</div>
    `;
    if (!book.is_booked) {
        card.title = 'Click to book';
        card.addEventListener('click', () => buildBookingModal(book, onRefresh));
    }
    return card;
}

export const getDashboard = async (roomId: number, onBack: () => void): Promise<HTMLElement> => {
    const dashboard = document.createElement('main');
    dashboard.className = 'dashboard';

    const container = document.createElement('div');
    container.className = 'container';
    dashboard.appendChild(container);

    const backBtn = document.createElement('button');
    backBtn.className = 'btn-back';
    backBtn.innerHTML = `${Icons.arrowLeft} Back to Resources`;
    backBtn.addEventListener('click', onBack);
    container.appendChild(backBtn);

    const layout = document.createElement('div');
    layout.className = 'dashboard-layout';
    container.appendChild(layout);

    const sidebar = buildSidebar(roomId);
    layout.appendChild(sidebar);

    const section = document.createElement('section');
    section.className = 'timeline-main';

    const authBanner = !Store.token
        ? `<div class="auth-prompt-banner">
               ${Icons.info}
               <span><button class="auth-prompt-link" id="banner-signin">Sign in</button> to book available time slots.</span>
           </div>`
        : '';

    section.innerHTML = `
        ${authBanner}
        <div class="timeline-header">
            <h2 class="timeline-title">Occupation Timeline</h2>
            <div class="timeline-legend">
                <div class="legend-item"><span class="legend-dot available"></span>Available</div>
                <div class="legend-item"><span class="legend-dot booked"></span>Occupied</div>
            </div>
        </div>
        <div id="slots-container">
            ${skeletonGrid(8, 'slots-skeleton').outerHTML}
        </div>
    `;
    layout.appendChild(section);

    section.querySelector('#banner-signin')?.addEventListener('click', openAuthModal);

    const renderSlots = async () => {
        const slotsContainer = container.querySelector('#slots-container') as HTMLElement;
        slotsContainer.innerHTML = skeletonGrid(8, 'slots-skeleton').outerHTML;

        try {
            const books = await BookingService.list(roomId);

            updateSidebar(sidebar, books);

            if (books.length === 0) {
                slotsContainer.innerHTML = '';
                slotsContainer.appendChild(
                    Object.assign(document.createElement('div'), {
                        className: 'timeline-empty',
                        innerHTML: `<div class="timeline-empty-icon">${Icons.clock}</div><p>No time slots found.</p>`,
                    })
                );
                return;
            }

            const grid = document.createElement('div');
            grid.className = 'slots-grid';
            books.forEach(b => grid.appendChild(buildSlotCard(b, renderSlots)));

            slotsContainer.innerHTML = '';
            slotsContainer.appendChild(grid);
        } catch {
            slotsContainer.innerHTML = '';
            slotsContainer.appendChild(errorBlock('Failed to load timeline. Check API connection.', Icons.alert));
        }
    };

    await renderSlots();
    return dashboard;
};