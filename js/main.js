/**
 * MHW Companion - Premium Main Logic
 * Enhanced for reliability, visibility, and performance.
 */

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize 3D Background
    if (typeof setupThreeJS === 'function') setupThreeJS();

    // 2. Setup Components
    setupVault();
    setupWall();
    setupGrounding();

    // 3. Register Scroll Animations (GSAP)
    gsap.registerPlugin(ScrollTrigger);

    // Force a refresh after a short delay to ensure layout is settled
    setTimeout(() => {
        ScrollTrigger.refresh();

        // Reveal elements with a safe animation (starts visible if no GSAP)
        gsap.utils.toArray('section').forEach(section => {
            const reveals = section.querySelectorAll('h1, h2, p, .vault-card, article');
            if (reveals.length) {
                gsap.fromTo(reveals,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        stagger: 0.1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 90%",
                            once: true
                        }
                    }
                );
            }
        });
    }, 500);
});

// --- Wellness Vault Logic ---
const setupVault = () => {
    const tabs = document.querySelectorAll('.vault-tab');
    const cards = document.querySelectorAll('.vault-card');
    if (!tabs.length || !cards.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update Tab UI
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const category = tab.dataset.category;

            // Filter Cards
            cards.forEach(card => {
                const isMatch = category === 'all' || card.dataset.category === category;
                if (isMatch) {
                    card.style.display = 'block';
                    gsap.fromTo(card, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4 });
                } else {
                    gsap.to(card, {
                        opacity: 0, scale: 0.95, duration: 0.3, onComplete: () => {
                            card.style.display = 'none';
                        }
                    });
                }
            });

            // Refresh ScrollTrigger as heights might change
            setTimeout(() => ScrollTrigger.refresh(), 400);
        });
    });
};

const openVideoModal = (id) => {
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('video-frame');
    if (!modal || !iframe) return;

    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0`;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    gsap.fromTo(modal, { opacity: 0, backdropFilter: 'blur(0px)' }, { opacity: 1, backdropFilter: 'blur(16px)', duration: 0.5 });
};

const closeVideoModal = () => {
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('video-frame');
    if (!modal) return;

    gsap.to(modal, {
        opacity: 0, duration: 0.3, onComplete: () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            if (iframe) iframe.src = '';
        }
    });
};

const toggleAudio = (audioId, btn) => {
    const audio = document.getElementById(audioId);
    const card = btn.closest('.vault-card');
    if (!audio || !card) return;

    const icon = btn.querySelector('i');
    const isPlaying = !audio.paused;

    // Stop all other audios first
    document.querySelectorAll('audio').forEach(a => {
        if (a !== audio) {
            a.pause();
            const otherCard = a.closest('.vault-card');
            if (otherCard) {
                otherCard.classList.remove('is-playing');
                const otherIcon = otherCard.querySelector('button i');
                if (otherIcon) otherIcon.className = 'ri-play-fill';
            }
        }
    });

    if (isPlaying) {
        audio.pause();
        card.classList.remove('is-playing');
        icon.className = 'ri-play-fill';
    } else {
        audio.play().catch(e => console.warn("Audio play blocked:", e));
        card.classList.add('is-playing');
        icon.className = 'ri-pause-fill';
    }
};

// --- Wall of Encouragement ---
const setupWall = () => {
    const list = document.getElementById('reviews-list');
    const form = document.getElementById('review-form');
    if (!list || !form) return;

    const fetchReviews = async () => {
        try {
            const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3000' : '';
            const res = await fetch(`${API_BASE}/api/reviews`);
            const data = await res.json();

            list.innerHTML = '';
            if (!data.reviews || !data.reviews.length) {
                list.innerHTML = '<div class="col-span-full py-20 text-center opacity-30"><i class="ri-quill-pen-line text-5xl mb-4 block"></i><p>The wall is waiting for your light...</p></div>';
                return;
            }

            data.reviews.forEach(r => {
                const div = document.createElement('div');
                div.className = 'bg-white p-8 rounded-[30px] border border-slate-50 shadow-xl hover:shadow-2xl transition-all reveal-init';
                div.innerHTML = `
                    <p class="text-slate-700 italic mb-6 leading-relaxed">"${r.review}"</p>
                    <div class="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Anonymous</span>
                        <span>${new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                `;
                list.appendChild(div);
                gsap.to(div, { opacity: 1, y: 0, duration: 0.8 });
            });
        } catch (e) { console.error("Review fetch error", e); }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('review-input');
        if (!input.value.trim()) return;

        try {
            const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3000' : '';
            await fetch(`${API_BASE}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ review: input.value })
            });
            input.value = '';
            fetchReviews();
        } catch (e) { console.error("Review submit error", e); }
    });

    fetchReviews();
};

// --- Grounding Tool ---
const setupGrounding = () => {
    const trigger = document.getElementById('breath-trigger');
    const circle = document.getElementById('breath-circle');
    const text = document.getElementById('breath-text');
    if (!trigger || !circle || !text) return;

    let isRunning = false;
    trigger.addEventListener('click', () => {
        if (isRunning) return;
        isRunning = true;

        const runBreath = () => {
            text.innerHTML = 'Inhale';
            gsap.to(circle, {
                scale: 1.5, duration: 4, ease: "sine.inOut", onComplete: () => {
                    text.innerHTML = 'Hold';
                    setTimeout(() => {
                        text.innerHTML = 'Exhale';
                        gsap.to(circle, { scale: 1, duration: 8, ease: "sine.inOut", onComplete: runBreath });
                    }, 7000);
                }
            });
        };
        runBreath();
    });
};

// --- Three.js Calming Background ---
const setupThreeJS = () => {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const blob = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2, 4),
        new THREE.MeshPhongMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.05 })
    );
    scene.add(blob);

    const particles = new THREE.Points(
        new THREE.BufferGeometry(),
        new THREE.PointsMaterial({ size: 0.015, color: 0x94a3b8, transparent: true, opacity: 0.3 })
    );
    const count = 1500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 15;
    particles.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(particles);

    scene.add(new THREE.PointLight(0xffffff, 1), new THREE.AmbientLight(0xffffff, 0.8));
    camera.position.z = 7;

    const animate = () => {
        const time = Date.now() * 0.0005;
        blob.rotation.y = time * 0.1;
        blob.scale.setScalar(1 + Math.sin(time) * 0.02);
        particles.rotation.y = time * 0.02;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };
    animate();
};
