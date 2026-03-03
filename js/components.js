/**
 * Global Components for MHW Companion
 * Ensures UI consistency across all pages
 */

const components = {
    navbar: (isInsidePages = false) => {
        const prefix = isInsidePages ? '../' : '';
        const homePath = isInsidePages ? '../index.html' : 'index.html';
        const chatPath = isInsidePages ? 'chat.html' : 'pages/chat.html';
        const wallPath = isInsidePages ? 'anonyoms.html' : 'pages/anonyoms.html';
        const loginPath = isInsidePages ? 'login.html' : 'pages/login.html';
        const signupPath = isInsidePages ? 'signup.html' : 'pages/signup.html';
        const userId = localStorage.getItem('user_id');

        let authContent = `
            <a href="${loginPath}" class="hidden sm:block text-sm font-bold text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest">Log In</a>
            <a href="${signupPath}" class="bg-blue-600 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-xl shadow-blue-200 hover:bg-slate-900 transition-all transform hover:-translate-y-0.5 uppercase tracking-widest">Join Free</a>
        `;

        if (userId) {
            authContent = `
                <div class="flex items-center gap-6">
                    <div class="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 italic font-black">W</div>
                    <button id="logout-trigger" class="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors">Logout</button>
                </div>
            `;
        }

        return `
        <header class="fixed top-0 left-0 w-full z-[4000] px-6 pt-6">
            <nav class="max-w-6xl mx-auto glass-nav px-6 py-4 rounded-[2rem] flex items-center justify-between shadow-sm border border-white/50">
                <div class="flex items-center">
                    <a href="${homePath}" class="flex items-center gap-4">
                        <img src="${prefix}assets/images/logo.png" alt="MHW Logo" class="h-10 w-10 object-contain">
                        <span class="font-display font-black text-xl tracking-tight text-slate-900 hidden md:block">MHW <span class="text-blue-600 italic">Companion</span></span>
                    </a>
                </div>
                
                <div class="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <a href="${homePath}" class="hover:text-blue-600 transition-colors">Home</a>
                    <a href="${homePath}#about" class="hover:text-blue-600 transition-colors">Story</a>
                    <a href="${homePath}#therapy" class="hover:text-blue-600 transition-colors">Hub</a>
                    <a href="${chatPath}" class="hover:text-blue-600 transition-colors">Support</a>
                    <a href="${wallPath}" class="hover:text-blue-600 transition-colors">Wall</a>
                </div>

                <div class="flex items-center gap-6" id="auth-nav">
                    ${authContent}
                </div>
            </nav>
        </header>
        `;
    },

    footer: (isInsidePages = false) => {
        const prefix = isInsidePages ? '../' : '';
        return `
    <footer class="bg-slate-900 py-32">
        <div class="max-w-6xl mx-auto px-6">
            <div class="flex flex-col md:flex-row justify-between items-center gap-12 border-b border-slate-800 pb-20">
                <div class="text-center md:text-left">
                     <img src="${prefix}assets/images/logo.png" alt="MHW Logo" class="h-12 w-12 object-contain mb-6 grayscale brightness-200 inline-block md:block">
                     <p class="text-slate-500 font-medium max-w-xs">Your sanctuary for mental resilience and quiet self-discovery.</p>
                </div>
                <div class="flex flex-wrap justify-center gap-12 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <a href="#" class="hover:text-white transition-colors">Privacy</a>
                    <a href="#" class="hover:text-white transition-colors">Terms</a>
                    <a href="#" class="hover:text-white transition-colors">Crisis Line</a>
                    <a href="#" class="hover:text-white transition-colors">Contact</a>
                </div>
            </div>
            <div class="pt-12 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
                &copy; 2026 MHW Community. All Rights Reserved.
            </div>
        </div>
    </footer>
    `;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const isPagesDir = window.location.pathname.includes('/pages/');

    const navPlaceholder = document.getElementById('navbar-placeholder');
    if (navPlaceholder) {
        navPlaceholder.innerHTML = components.navbar(isPagesDir);

        // Setup logout listener if it exists
        const logoutTrigger = document.getElementById('logout-trigger');
        if (logoutTrigger) {
            logoutTrigger.addEventListener('click', () => {
                localStorage.removeItem('user_id');
                window.location.reload();
            });
        }
    }

    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = components.footer(isPagesDir);
    }
});
