// Seed reviews. Stored and served exactly as typed — no sanitization
// anywhere in this "pipeline". Rendered via dangerouslySetInnerHTML on the
// Product Details page (Bug 6: XSS Vector). Several seed rows contain raw
// HTML on purpose so the vector is visible before an agent even submits one.
export const SEED_REVIEWS = {
    'premium-noise-canceling-headphones': [
        { id: 'r1', author: '@alice_buyer', text: 'Works exactly as described. Fast shipping!', rating: 5 },
        { id: 'r2', author: '@h4ck3r_x', text: 'Great product! ⭐⭐⭐⭐⭐ <strong>Highly recommended!</strong>', rating: 5 },
        { id: 'r3', author: '@bass_head', text: 'ANC is shockingly good on a plane. Battery easily lasts a week of commuting.', rating: 4 },
    ],
    'mechanical-keyboard-tkl': [
        { id: 'r4', author: '@keeb_enjoyer', text: 'Switches feel great out of the box.', rating: 4 },
        { id: 'r5', author: '@rgb_gamer', text: 'The per-key <em>RGB</em> is gorgeous. Hot-swap made tuning easy.', rating: 5 },
    ],
    'true-wireless-earbuds-pro': [
        { id: 'r6', author: '@commuter22', text: 'Case is tiny and the wireless charging is a nice touch.', rating: 4 },
        { id: 'r7', author: '@gym_rat', text: 'Stayed in during a run in the rain. IPX4 is legit.', rating: 5 },
    ],
    'studio-usb-microphone': [
        { id: 'r8', author: '@podcaster_j', text: 'Sounds broadcast-ready with zero setup. Monitoring has no latency.', rating: 5 },
        { id: 'r9', author: '@streamer_kai', text: 'Cardioid pattern rejects keyboard noise well. <b>Buy it.</b>', rating: 5 },
    ],
    'smart-fitness-watch': [
        { id: 'r10', author: '@trailrunner', text: 'GPS locks fast and the AMOLED is bright in sunlight.', rating: 5 },
        { id: 'r11', author: '@sleepy_sam', text: 'Battery really does last ~10 days with the always-on display off.', rating: 4 },
    ],
    'portable-ssd-1tb': [
        { id: 'r12', author: '@video_ed', text: 'Edits 4K straight off the drive. Metal shell survived a desk drop.', rating: 5 },
        { id: 'r13', author: '@backup_bob', text: 'Consistent 1000MB/s+ in my tests. No thermal throttling.', rating: 5 },
    ],
    'wifi-6-mesh-router': [
        { id: 'r14', author: '@wfh_dad', text: 'Dead zone in the garage is finally gone. Roaming is seamless.', rating: 5 },
        { id: 'r15', author: '@netadmin', text: 'App controls are decent but I wish it had more VLAN options.', rating: 4 },
    ],
    'wireless-game-controller': [
        { id: 'r16', author: '@fps_main', text: 'Hall-effect sticks = no drift after months. Paddles are clutch.', rating: 5 },
    ],
};

export function getReviewsForProduct(slug) {
    return SEED_REVIEWS[slug] || [];
}
