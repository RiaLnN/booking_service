export const fmt = {
    time: (iso: string) =>
        new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

    date: (iso: string) =>
        new Date(iso).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }),

    toInputDateTime: (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },

    toISO: (localInput: string) => new Date(localInput).toISOString(),
};