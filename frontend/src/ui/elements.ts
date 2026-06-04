
export function btn(className: string, html: string, id?: string): HTMLButtonElement {
    const el = document.createElement('button');
    el.className = className;
    el.innerHTML = html;
    if (id) el.id = id;
    return el;
}

export function errorBanner(msg: string): HTMLElement {
    const el = document.createElement('div');
    el.className = 'form-error-banner';
    el.textContent = msg;
    return el;
}

export function setLoading(button: HTMLButtonElement, label: string, loading: boolean): void {
    button.disabled = loading;
    button.innerHTML = loading
        ? `<span class="spinner"></span>${label}`
        : button.dataset.originalLabel ?? label;
    if (!loading) button.dataset.originalLabel = label;
}

export function skeletonGrid(count: number, className: string): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = className;
    for (let i = 0; i < count; i++) {
        const s = document.createElement('div');
        s.className = 'skeleton skeleton-card';
        wrap.appendChild(s);
    }
    return wrap;
}


export function errorBlock(msg: string, icon: string): HTMLElement {
    const el = document.createElement('div');
    el.className = 'state-error';
    el.innerHTML = `${icon}<span>${msg}</span>`;
    return el;
}

export function emptyState(icon: string, msg: string): HTMLElement {
    const el = document.createElement('div');
    el.className = 'state-empty';
    el.innerHTML = `<div class="state-empty-icon">${icon}</div><p>${msg}</p>`;
    return el;
}