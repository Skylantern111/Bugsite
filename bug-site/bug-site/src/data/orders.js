// Mock order history. Long/awkward fields are intentional — they're what
// breaks naive CSV export (Bug 26: Export Corruption).
export const ORDERS = [
    {
        id: 9821,
        date: '2026-06-14',
        status: 'Delivered',
        total: 129.00,
        carrier: 'legacy-carrier-api',
        items: [{ name: 'Mechanical Keyboard (TKL)', qty: 1, price: 129.00 }],
        shippingAddress: '1450 N. Innovation Loop, Suite 220, "The Annex Building", Austin, TX 78701',
    },
    {
        id: 9820,
        date: '2026-06-02',
        status: 'Delivered',
        total: 114.49,
        carrier: 'legacy-carrier-api',
        items: [
            { name: 'USB-C Hub (7-in-1)', qty: 1, price: 34.50 },
            { name: 'Wireless Mouse', qty: 1, price: 29.99 },
            { name: 'Desk Lamp', qty: 1, price: 49.99 },
        ],
        shippingAddress: '88 Harbor View Terrace, Apt 4B, Seattle, WA 98101',
    },
    {
        id: 9819,
        date: '2026-05-20',
        status: 'In Transit',
        total: 79.99,
        carrier: 'legacy-carrier-api',
        items: [{ name: 'Premium Noise-Canceling Headphones', qty: 1, price: 79.99 }],
        shippingAddress: '500 Market St, "Building C, Floor 9, near the loading dock entrance", San Francisco, CA 94105',
    },
];

export function getOrderCsvDescription(order) {
    return order.items.map((i) => i.name).join(', ');
}
