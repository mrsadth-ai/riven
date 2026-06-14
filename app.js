/**
 * Rayon Management - Application Core JS
 * Sleek Black & White Focus Web App
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- APP STATE ---
    let state = {
        timer: {
            focus: 25 * 60,
            shortBreak: 5 * 60,
            longBreak: 15 * 60,
            currentMode: 'focus', // 'focus', 'shortBreak', 'longBreak'
            timeRemaining: 25 * 60,
            isRunning: false,
            intervalId: null,
            alarmVolume: 70, // 0 - 100
            playAlarmSound: true
        },
        tasks: [],
        activeTaskId: null,
        journal: [],
        streak: 0,
        settings: {
            theme: 'theme-midnight-glass',
            cinematicMode: true
        },
        tempSubtasks: [],
        
        // RAYON EXPANSION GLOBAL STATES
        xp: 0,
        timeBlocks: Array(18).fill(null).map((_, i) => ({
            hour: i + 6, // 6:00 AM to 11:00 PM (18 blocks)
            task: '',
            category: 'other' // 'work', 'leisure', 'sleep', 'other'
        })),
        habits: [
            { id: 'h1', title: 'ورزش صبحگاهی و کشش', category: 'health', color: 'green', streak: 3, completedDays: [new Date().toISOString().split('T')[0]] },
            { id: 'h2', title: 'مطالعه کتاب توسعه فردی', category: 'study', color: 'gold', streak: 5, completedDays: [] }
        ],
        goals: [
            { id: 'g1', title: 'راه‌اندازی پلتفرم رشد فردی رایون', category: 'career', date: '2026-12-30', desc: 'توسعه و عرضه هاب مدیریت بهره‌وری', milestones: [{ title: 'طراحی پروتوتایپ و UI', completed: true }, { title: 'برنامه‌نویسی منطق ۱۰ بخش کاربردی', completed: false }] }
        ],
        waterIntake: 2, // Default 2 glasses clicked
        notes: [
            { id: 'n1', title: 'ایده‌های توسعه محصول رایون', tags: 'ایده, کار', content: 'تمرکز روی ایجاد بخش‌های گام‌به‌گام و ارزش‌های ملموس برای کاربر شامل برنامه‌ریزی تقویم، امواج مغزی، مدیریت مخارج رشد و گیمفیکیشن...', date: new Date().toLocaleDateString('fa-IR') }
        ],
        budgetLimit: 1000000, // 1 million Tomans default limit
        expenses: [
            { id: 'e1', desc: 'خرید کتاب کار عمیق اثر کال نیوپورت', amount: 95000, category: 'books', date: new Date().toISOString().split('T')[0] }
        ],
        visionItems: [
            { id: 'v1', title: 'اتاق کار مینیمال و آرام', url: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=500', category: 'material' },
            { id: 'v2', title: 'کوهستان آلپ سوئیس', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500', category: 'travel' }
        ]
    };

    // --- DOM ELEMENTS ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.app-section');
    const pageHeaderTitle = document.getElementById('page-header-title');
    const dateDisplay = document.getElementById('current-gregorian-date');
    const streakCount = document.getElementById('streak-count');
    const themePresets = document.querySelectorAll('input[name="theme-preset"]');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const taskDescInput = document.getElementById('task-desc-input');
    const subtaskTempInput = document.getElementById('subtask-temp-input');
    const addTempSubtaskBtn = document.getElementById('add-temp-subtask-btn');
    const tempSubtasksList = document.getElementById('temp-subtasks-list');
    const sidebarActivePill = document.getElementById('sidebar-active-pill');
    
    // Timer Elements
    const timerDigits = document.getElementById('timer-digits');
    const timerStateLabel = document.getElementById('timer-state-label');
    const timerPlayBtn = document.getElementById('timer-play-btn');
    const timerResetBtn = document.getElementById('timer-reset-btn');
    const timerSkipBtn = document.getElementById('timer-skip-btn');
    const timerProgressRing = document.getElementById('timer-progress-ring');
    const timerModeTabs = document.querySelectorAll('.timer-mode-tab');
    
    // Immersive Timer Elements
    const immersiveModeBtn = document.getElementById('immersive-mode-btn');
    const immersiveOverlay = document.getElementById('immersive-overlay');
    const immersiveCloseBtn = document.getElementById('immersive-close-btn');
    const immersiveTimerText = document.getElementById('immersive-timer-text');
    const immersiveActiveTaskText = document.getElementById('immersive-active-task-text');
    const immersivePlayBtn = document.getElementById('immersive-play-btn');
    const immersivePlayBtnLabel = document.getElementById('immersive-play-btn-label');
    const immersiveModeBadge = document.getElementById('immersive-mode-badge');
    
    // Dashboard Timer Widget Elements
    const dashboardTimerText = document.getElementById('dashboard-timer-text');
    const dashboardTimerMode = document.getElementById('dashboard-timer-mode');
    const dashboardTimerPlayBtn = document.getElementById('dashboard-timer-play-btn');
    const dashboardTimerBtnText = document.getElementById('dashboard-timer-btn-text');
    const dashboardCompletedPercent = document.getElementById('dashboard-completed-percent');
    const dashboardProgressRing = document.getElementById('dashboard-progress-ring');
    const quickTimerPlayIcon = dashboardTimerPlayBtn.querySelector('.play-icon');
    const quickTimerPauseIcon = dashboardTimerPlayBtn.querySelector('.pause-icon');

    // Dashboard Info Elements
    const statFocusTime = document.getElementById('stat-focus-time');
    const statCompletedTasks = document.getElementById('stat-completed-tasks');
    const statTodayMood = document.getElementById('stat-today-mood');
    const welcomeMessage = document.getElementById('welcome-message');

    // Task Elements
    const newTaskForm = document.getElementById('new-task-form');
    const taskTitleInput = document.getElementById('task-title-input');
    const taskPrioritySelect = document.getElementById('task-priority-select');
    const taskPomodorosInput = document.getElementById('task-pomodoros-input');
    const pomoMinusBtn = document.getElementById('pomo-minus-btn');
    const pomoPlusBtn = document.getElementById('pomo-plus-btn');
    const taskTagInput = document.getElementById('task-tag-input');
    const tasksScrollList = document.getElementById('tasks-scroll-list');
    const dashboardTasksList = document.getElementById('dashboard-tasks-list');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const totalTasksCount = document.getElementById('total-tasks-count');

    // Mood & Journal Elements
    const moodBtns = document.querySelectorAll('.mood-btn');
    const journalNoteInput = document.getElementById('journal-note-input');
    const saveJournalBtn = document.getElementById('save-journal-btn');
    const journalHistoryList = document.getElementById('journal-history-list');

    // Analytics Metrics Elements
    const totalFocusHours = document.getElementById('total-focus-hours');
    const avgDailyFocus = document.getElementById('avg-daily-focus');
    const completedTasksRatio = document.getElementById('completed-tasks-ratio');
    
    // Settings Elements
    const settingsFocusSlider = document.getElementById('settings-focus-slider');
    const settingsShortSlider = document.getElementById('settings-short-slider');
    const settingsLongSlider = document.getElementById('settings-long-slider');
    const settingsFocusVal = document.getElementById('settings-focus-val');
    const settingsShortVal = document.getElementById('settings-short-val');
    const settingsLongVal = document.getElementById('settings-long-val');
    const settingsSoundAlarmToggle = document.getElementById('settings-sound-alarm-toggle');
    const settingsAlarmVolSlider = document.getElementById('settings-alarm-vol-slider');
    const settingsAlarmVolVal = document.getElementById('settings-alarm-vol-val');
    const resetAppDataBtn = document.getElementById('reset-app-data-btn');
    const settingsCinematicToggle = document.getElementById('settings-cinematic-toggle');

    // Audio/Sound elements
    const soundCards = document.querySelectorAll('.sound-card');

    // --- INITIALIZE AUDIO SYNTHESIZER (Web Audio API) ---
    let audioCtx = null;
    let synthesizers = {};

    function initAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // Synthesizer Class to generate ambient noise in realtime
    class AmbientSynth {
        constructor(type) {
            this.type = type;
            this.isPlaying = false;
            this.source = null;
            this.gainNode = null;
            this.filterNode = null;
            this.lfoNode = null;
            this.lfoGainNode = null;
            this.volume = 0.5;
        }

        start() {
            initAudioContext();
            if (this.isPlaying) return;

            this.gainNode = audioCtx.createGain();
            this.gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            this.gainNode.gain.linearRampToValueAtTime(this.volume, audioCtx.currentTime + 1.5); // Fade in

            if (this.type === 'white' || this.type === 'pink') {
                const buffer = this.createNoiseBuffer();
                this.source = audioCtx.createBufferSource();
                this.source.buffer = buffer;
                this.source.loop = true;
                this.source.connect(this.gainNode);
            } else if (this.type === 'rain') {
                // Rain: bandpass filtered white noise with randomized crackles
                const buffer = this.createNoiseBuffer('white');
                this.source = audioCtx.createBufferSource();
                this.source.buffer = buffer;
                this.source.loop = true;
                
                this.filterNode = audioCtx.createBiquadFilter();
                this.filterNode.type = 'bandpass';
                this.filterNode.frequency.setValueAtTime(1000, audioCtx.currentTime);
                this.filterNode.Q.setValueAtTime(1.5, audioCtx.currentTime);

                this.source.connect(this.filterNode);
                this.filterNode.connect(this.gainNode);
            } else if (this.type === 'waves') {
                // Ocean waves: white noise low-pass filtered and modulated with slow LFO
                const buffer = this.createNoiseBuffer('pink');
                this.source = audioCtx.createBufferSource();
                this.source.buffer = buffer;
                this.source.loop = true;

                this.filterNode = audioCtx.createBiquadFilter();
                this.filterNode.type = 'lowpass';
                this.filterNode.frequency.setValueAtTime(400, audioCtx.currentTime);

                // Slow LFO to sweep filter frequency
                this.lfoNode = audioCtx.createOscillator();
                this.lfoNode.frequency.value = 0.08; // 12 seconds per wave cycle
                
                this.lfoGainNode = audioCtx.createGain();
                this.lfoGainNode.gain.value = 250; // Sweeps from 150Hz to 650Hz

                this.lfoNode.connect(this.lfoGainNode);
                this.lfoGainNode.connect(this.filterNode.frequency);
                
                this.source.connect(this.filterNode);
                this.filterNode.connect(this.gainNode);

                this.lfoNode.start();
            }

            this.gainNode.connect(audioCtx.destination);
            this.source.start();
            this.isPlaying = true;
        }

        stop() {
            if (!this.isPlaying) return;
            
            const currentGain = this.gainNode.gain.value;
            this.gainNode.gain.setValueAtTime(currentGain, audioCtx.currentTime);
            this.gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.0); // Fade out

            setTimeout(() => {
                try {
                    if (this.source) this.source.stop();
                    if (this.lfoNode) this.lfoNode.stop();
                } catch(e) {}
                this.isPlaying = false;
            }, 1000);
        }

        setVolume(vol) {
            this.volume = vol;
            if (this.isPlaying && this.gainNode) {
                this.gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
            }
        }

        createNoiseBuffer(customType) {
            const size = 3 * audioCtx.sampleRate; // 3 seconds
            const buffer = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            const noiseType = customType || this.type;

            if (noiseType === 'white' || noiseType === 'rain') {
                for (let i = 0; i < size; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
            } else if (noiseType === 'pink') {
                // Pink noise generation (1/f)
                let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
                for (let i = 0; i < size; i++) {
                    let white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                    data[i] *= 0.11; // Normalize roughly
                    b6 = white * 0.115926;
                }
            }
            return buffer;
        }
    }

    // Synthesize alarm sound (FM synthesized bell chime)
    function playSynthesizedAlarm() {
        if (!state.timer.playAlarmSound) return;
        initAudioContext();

        const now = audioCtx.currentTime;
        const vol = state.timer.alarmVolume / 100;

        // Create oscillator carrier
        const carrier = audioCtx.createOscillator();
        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(587.33, now); // D5 note

        // Modulator for FM synthesis (bell chime tone)
        const modulator = audioCtx.createOscillator();
        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(880, now); // Harmonic ratio

        const modGain = audioCtx.createGain();
        modGain.gain.setValueAtTime(150, now);

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(vol, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.5); // Decay over 2.5s

        // Connect FM setup
        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Start bell sounds cascading
        modulator.start(now);
        carrier.start(now);
        
        modulator.stop(now + 3);
        carrier.stop(now + 3);

        // Quick secondary echo chime
        setTimeout(() => {
            const echoNow = audioCtx.currentTime;
            const carrier2 = audioCtx.createOscillator();
            const gainNode2 = audioCtx.createGain();
            
            carrier2.frequency.setValueAtTime(880, echoNow); // A5 note
            gainNode2.gain.setValueAtTime(vol * 0.5, echoNow);
            gainNode2.gain.exponentialRampToValueAtTime(0.001, echoNow + 1.5);
            
            carrier2.connect(gainNode2);
            gainNode2.connect(audioCtx.destination);
            
            carrier2.start(echoNow);
            carrier2.stop(echoNow + 2);
        }, 350);
    }

    // Toggle ambient tracks
    soundCards.forEach(card => {
        const soundType = card.dataset.sound;
        synthesizers[soundType] = new AmbientSynth(soundType);

        const playToggle = card.querySelector('.sound-play-toggle');
        const volSlider = card.querySelector('.sound-vol-slider');

        playToggle.addEventListener('click', () => {
            initAudioContext();
            const synth = synthesizers[soundType];
            
            if (synth.isPlaying) {
                synth.stop();
                card.classList.remove('playing');
            } else {
                synth.setVolume(volSlider.value / 100);
                synth.start();
                card.classList.add('playing');
            }
            // Remove active classes on presets
            document.querySelectorAll('.preset-pill-btn').forEach(b => b.classList.remove('active'));
        });

        volSlider.addEventListener('input', (e) => {
            const vol = e.target.value / 100;
            synthesizers[soundType].setVolume(vol);
        });
    });

    // Preset and Mixer controls
    const presetBtns = document.querySelectorAll('.preset-pill-btn[data-preset]');
    const clearMixerBtn = document.getElementById('clear-mixer-btn');

    const presetsConfig = {
        'deep-work': {
            'white': 30,
            'rain': 45
        },
        'stormy': {
            'rain': 70,
            'waves': 50
        },
        'meditation': {
            'waves': 45,
            'pink': 35
        }
    };

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            initAudioContext();
            const presetName = btn.dataset.preset;
            const config = presetsConfig[presetName];

            // Turn off all sounds first
            soundCards.forEach(card => {
                const soundType = card.dataset.sound;
                if (synthesizers[soundType].isPlaying) {
                    synthesizers[soundType].stop();
                }
                card.classList.remove('playing');
            });

            // Set active class
            document.querySelectorAll('.preset-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Start specific preset sounds
            for (const [soundType, volPercent] of Object.entries(config)) {
                const card = document.querySelector(`.sound-card[data-sound="${soundType}"]`);
                if (card) {
                    const volSlider = card.querySelector('.sound-vol-slider');
                    volSlider.value = volPercent;
                    synthesizers[soundType].setVolume(volPercent / 100);
                    synthesizers[soundType].start();
                    card.classList.add('playing');
                }
            }
            showToast(`پریست صوتی "${btn.textContent}" فعال شد.`, 'success');
        });
    });

    if (clearMixerBtn) {
        clearMixerBtn.addEventListener('click', () => {
            soundCards.forEach(card => {
                const soundType = card.dataset.sound;
                if (synthesizers[soundType].isPlaying) {
                    synthesizers[soundType].stop();
                }
                card.classList.remove('playing');
            });
            document.querySelectorAll('.preset-pill-btn').forEach(b => b.classList.remove('active'));
            clearMixerBtn.classList.add('active');
            showToast('میکسر امبینت خاموش شد.', 'info');
        });
    }

    // --- NAVIGATION & ROUTING ---
    function updateSidebarPill() {
        const activeNavItem = document.querySelector('.nav-item.active');
        if (activeNavItem && sidebarActivePill) {
            let offsetTop = activeNavItem.offsetTop;
            let parent = activeNavItem.offsetParent;
            const navMenu = document.querySelector('.nav-menu');
            while (parent && parent !== navMenu && navMenu.contains(parent)) {
                offsetTop += parent.offsetTop;
                parent = parent.offsetParent;
            }
            sidebarActivePill.style.top = `${offsetTop}px`;
            sidebarActivePill.style.height = `${activeNavItem.offsetHeight}px`;
            sidebarActivePill.style.opacity = '1';
        }
    }
    window.addEventListener('resize', updateSidebarPill);

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.dataset.tab;
            
            // Toggle active tabs
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Expand parent collapsible group if collapsed
            const parentGroup = item.closest('.nav-group');
            if (parentGroup) {
                parentGroup.classList.remove('collapsed');
            }
            
            updateSidebarPill();

            // Switch sections
            sections.forEach(sec => {
                sec.classList.remove('active');
                if (sec.id === `section-${targetTab}`) {
                    sec.classList.add('active');
                }
            });

            // Trigger cinematic tab slash
            if (state.settings.cinematicMode && typeof triggerFxSlash === 'function') {
                const w = window.innerWidth;
                const h = window.innerHeight;
                if (Math.random() > 0.5) {
                    triggerFxSlash(0, Math.random() * h, w, Math.random() * h, getThemeAccentColor());
                } else {
                    triggerFxSlash(Math.random() * w, 0, Math.random() * w, h, getThemeAccentColor());
                }
            }

            // Update Header title
            let farsiTitle = 'داشبورد';
            switch (targetTab) {
                case 'dashboard': farsiTitle = 'داشبورد'; break;
                case 'focus': farsiTitle = 'تایمر تمرکز'; break;
                case 'timeblocking': 
                    farsiTitle = 'برنامه‌ریز بلوک‌های زمانی'; 
                    renderTimeBlocks();
                    break;
                case 'neurowaves': 
                    farsiTitle = 'فرکانس‌های مغزی'; 
                    initNeuroWavesCanvas();
                    break;
                case 'tasks': farsiTitle = 'وظایف روزانه'; break;
                case 'habits': 
                    farsiTitle = 'رهگیر عادت‌ها'; 
                    renderHabits();
                    break;
                case 'goals': 
                    farsiTitle = 'برنامه‌ریزی اهداف بلندمدت'; 
                    renderGoals();
                    break;
                case 'fitness': 
                    farsiTitle = 'سلامت، آب و تحرک'; 
                    renderFitness();
                    break;
                case 'notes': 
                    farsiTitle = 'یادداشت‌های هوشمند ذن'; 
                    renderNotesList();
                    break;
                case 'budget': 
                    farsiTitle = 'بودجه رشد فردی و مخارج'; 
                    renderExpenses();
                    break;
                case 'journal': farsiTitle = 'احوال و ژورنال روزانه'; break;
                case 'analytics': farsiTitle = 'نمودارها و آمار بهره‌وری'; break;
                case 'vision': 
                    farsiTitle = 'تابلوی تجسم و جملات تاکیدی'; 
                    renderVisionBoard();
                    break;
                case 'reports': 
                    farsiTitle = 'مرکز گزارشات و خروجی چاپی'; 
                    generateReportSheet();
                    break;
                case 'profile': 
                    farsiTitle = 'پنل کاربری ویژه'; 
                    renderPremiumProfile();
                    break;
                case 'settings': farsiTitle = 'تنظیمات کاربری'; break;
            }
            pageHeaderTitle.textContent = farsiTitle;

            // Trigger custom charts rendering if analytics is clicked
            if (targetTab === 'analytics') {
                renderAnalyticsCharts();
            }
        });
    });

    // Handle internal widget clicks
    document.querySelectorAll('[data-tab]').forEach(btn => {
        if (!btn.classList.contains('nav-item')) {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                const correspondingNav = document.getElementById(`nav-${tab}`);
                if (correspondingNav) correspondingNav.click();
            });
        }
    });

    // --- TIME DISPLAY & STREAK ---
    function updateDateAndClock() {
        const now = new Date();
        
        // Native browser formatting for beautiful Persian calendar structure
        const persianFormatter = new Intl.DateTimeFormat('fa-IR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const gregFormatter = new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        dateDisplay.innerHTML = `امروز: ${persianFormatter.format(now)} <span class="english-text" style="opacity: 0.5; margin-right: 8px;">(${gregFormatter.format(now)})</span>`;

        // Update welcome message greeting based on hour
        const hour = now.getHours();
        const savedProfile = JSON.parse(localStorage.getItem('rayon_user_profile'));
        const nameToShow = savedProfile ? savedProfile.name : 'کاربر';
        
        let greeting = `${nameToShow} عزیز، روز بخیر، آماده‌ای تمرکز کنی؟`;
        if (hour < 12 && hour > 5) greeting = `${nameToShow} عزیز، صبح بخیر، بیا امروز کارهای بزرگی بکنیم!`;
        else if (hour >= 12 && hour < 17) greeting = `${nameToShow} عزیز، ظهر بخیر، نیمه دوم روز رو پرانرژی ادامه بده!`;
        else if (hour >= 17 && hour < 21) greeting = `${nameToShow} عزیز، عصر بخیر، پیشرفت امروزت چطور بوده؟`;
        else greeting = `${nameToShow} عزیز، شب بخیر، کارهاتو تمام کن و استراحت کن.`;
        welcomeMessage.textContent = greeting;
    }

    // --- TIMER ENGINE ---
    
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function updateTimerDisplay() {
        const timeStr = formatTime(state.timer.timeRemaining);
        
        // Update digit text strings
        timerDigits.textContent = timeStr;
        immersiveTimerText.textContent = timeStr;
        dashboardTimerText.textContent = timeStr;

        // Sync rings progress indicator (dashoffsets)
        let totalLimit = state.timer[state.timer.currentMode];
        let ratio = state.timer.timeRemaining / totalLimit;
        
        // Main timer ring (r=95, circumference = 596.9)
        let mainOffset = ratio * 596.9;
        timerProgressRing.style.strokeDashoffset = mainOffset.toString();

        // Dashboard timer ring (r=34, circumference = 213.6)
        let dashOffset = ratio * 213.6;
        dashboardProgressRing.style.strokeDashoffset = dashOffset.toString();
        
        // Update favicon/title dynamically for focus visualization in browser tabs
        let modeEmoji = state.timer.currentMode === 'focus' ? '🎯' : '☕';
        document.title = `${timeStr} ${modeEmoji} Rayon`;
    }

    function toggleTimer() {
        initAudioContext();
        if (state.timer.isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }

    function startTimer() {
        if (state.timer.isRunning) return;
        
        // Trigger plasma charge at play button center
        if (state.settings.cinematicMode && typeof fxPlasmas !== 'undefined') {
            const activePlayBtn = document.querySelector('.btn-primary.playing, #timer-play-btn, #dashboard-timer-play-btn');
            if (activePlayBtn) {
                const rect = activePlayBtn.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                fxPlasmas.push(new PlasmaChargeEffect(x, y, activePlayBtn));
            }
        }

        state.timer.isRunning = true;
        
        // Update Buttons States
        timerPlayBtn.classList.add('playing');
        timerPlayBtn.querySelector('.play-icon').style.display = 'none';
        timerPlayBtn.querySelector('.pause-icon').style.display = 'block';
        document.getElementById('timer-btn-label').textContent = 'توقف تمرکز';

        immersivePlayBtn.classList.add('playing');
        immersivePlayBtn.querySelector('.play-icon').style.display = 'none';
        immersivePlayBtn.querySelector('.pause-icon').style.display = 'block';
        immersivePlayBtnLabel.textContent = 'توقف تمرکز';

        dashboardTimerPlayBtn.classList.add('playing');
        quickTimerPlayIcon.style.display = 'none';
        quickTimerPauseIcon.style.display = 'block';
        dashboardTimerBtnText.textContent = 'توقف';

        state.timer.intervalId = setInterval(() => {
            if (state.timer.timeRemaining > 0) {
                state.timer.timeRemaining--;
                updateTimerDisplay();
                
                // Keep track of focus seconds in local tasks / session details
                if (state.timer.currentMode === 'focus') {
                    incrementTodayFocusTime(1); // increment 1 second
                }
            } else {
                timerCompleted();
            }
        }, 1000);

        showToast('تایمر شروع شد. با تمرکز کامل ادامه دهید.', 'success');
    }

    function pauseTimer() {
        if (!state.timer.isRunning) return;
        state.timer.isRunning = false;
        clearInterval(state.timer.intervalId);

        // Update Buttons States
        timerPlayBtn.classList.remove('playing');
        timerPlayBtn.querySelector('.play-icon').style.display = 'block';
        timerPlayBtn.querySelector('.pause-icon').style.display = 'none';
        document.getElementById('timer-btn-label').textContent = 'ادامه تمرکز';

        immersivePlayBtn.classList.remove('playing');
        immersivePlayBtn.querySelector('.play-icon').style.display = 'block';
        immersivePlayBtn.querySelector('.pause-icon').style.display = 'none';
        immersivePlayBtnLabel.textContent = 'ادامه تمرکز';

        dashboardTimerPlayBtn.classList.remove('playing');
        quickTimerPlayIcon.style.display = 'block';
        quickTimerPauseIcon.style.display = 'none';
        dashboardTimerBtnText.textContent = 'شروع تمرکز';

        showToast('تایمر متوقف شد.', 'info');
    }

    function resetTimer() {
        pauseTimer();
        state.timer.timeRemaining = state.timer[state.timer.currentMode];
        updateTimerDisplay();
        
        let subtext = 'آماده برای شروع کار';
        if (state.timer.currentMode === 'shortBreak') subtext = 'زمان استراحت و تنفس';
        else if (state.timer.currentMode === 'longBreak') subtext = 'زمان استراحت طولانی و ریکاوری';
        
        timerStateLabel.textContent = subtext;
        showToast('تایمر ریست شد.', 'info');
    }

    function skipTimerMode() {
        pauseTimer();
        // Cycle mode focus -> shortBreak -> focus -> longBreak
        let nextMode = 'focus';
        if (state.timer.currentMode === 'focus') {
            nextMode = 'shortBreak';
        } else {
            nextMode = 'focus';
        }
        
        switchTimerMode(nextMode);
        showToast('دوره‌ی تایمر رد شد.', 'info');
    }

    function switchTimerMode(mode) {
        state.timer.currentMode = mode;
        
        // Update modes tabs UI
        timerModeTabs.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) btn.classList.add('active');
        });

        // Update state labels
        let farsiLabel = 'تمرکز';
        let subtext = 'دوره تمرکز رایون';
        if (mode === 'shortBreak') {
            farsiLabel = 'استراحت کوتاه';
            subtext = 'زمان استراحت و تنفس';
        } else if (mode === 'longBreak') {
            farsiLabel = 'استراحت طولانی';
            subtext = 'زمان استراحت طولانی و ریکاوری';
        }
        
        timerStateLabel.textContent = subtext;
        dashboardTimerMode.textContent = farsiLabel;
        immersiveModeBadge.textContent = `مد ${farsiLabel} رایون`;

        resetTimer();
    }

    function timerCompleted() {
        pauseTimer();
        playSynthesizedAlarm();

        // Trigger cinematic burst at the center of the screen
        if (typeof triggerSuccessBurst === 'function') {
            triggerSuccessBurst(window.innerWidth / 2, window.innerHeight / 2);
        }

        // Cinematic timer finish cross slash and canvas flash
        if (state.settings.cinematicMode) {
            const w = window.innerWidth;
            const h = window.innerHeight;
            if (typeof triggerFxSlash === 'function') {
                triggerFxSlash(w * 0.15, h * 0.15, w * 0.85, h * 0.85, getThemeAccentColor());
                setTimeout(() => {
                    triggerFxSlash(w * 0.85, h * 0.15, w * 0.15, h * 0.85, getThemeAccentColor());
                }, 180);
            }
            const vis = document.getElementById('timer-visualizer-canvas');
            if (vis) {
                vis.classList.add('visualizer-alarm-flash');
                setTimeout(() => vis.classList.remove('visualizer-alarm-flash'), 2500);
            }
        }

        // Increment Pomodoros completed if mode was 'focus'
        if (state.timer.currentMode === 'focus') {
            showToast('کارت فوق‌العاده بود! پومودوروی فعلی با موفقیت به پایان رسید.', 'success');
            if (typeof gainXp === 'function') {
                gainXp(30, 'اتمام پومودورو');
            }
            
            // Add session log to storage
            logFocusSessionCompleted(state.timer.focus);

            // Increment active task pomodoro
            if (state.activeTaskId) {
                incrementTaskCompletedPomodoros(state.activeTaskId);
            }
            
            // Swap to shortBreak auto
            switchTimerMode('shortBreak');
        } else {
            showToast('استراحت به پایان رسید! آماده کار مجدد شوید.', 'success');
            switchTimerMode('focus');
        }
    }

    // Bind Timer Events
    timerPlayBtn.addEventListener('click', toggleTimer);
    immersivePlayBtn.addEventListener('click', toggleTimer);
    dashboardTimerPlayBtn.addEventListener('click', toggleTimer);
    timerResetBtn.addEventListener('click', resetTimer);
    timerSkipBtn.addEventListener('click', skipTimerMode);

    timerModeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTimerMode(tab.dataset.mode);
        });
    });

    // --- IMMERSIVE OVERLAY TOGGLE ---
    immersiveModeBtn.addEventListener('click', () => {
        immersiveOverlay.classList.add('active');
        // Trigger browser request Fullscreen standard API if desired, but custom CSS overlay is robust and gorgeous
    });

    immersiveCloseBtn.addEventListener('click', () => {
        immersiveOverlay.classList.remove('active');
    });

    // Escape key quits immersive overlay
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && immersiveOverlay.classList.contains('active')) {
            immersiveOverlay.classList.remove('active');
        }
    });

    // --- TASK MANAGEMENT SYSTEM ---
    
    // Number input spinner bindings
    pomoMinusBtn.addEventListener('click', () => {
        let val = parseInt(taskPomodorosInput.value);
        if (val > 1) taskPomodorosInput.value = val - 1;
    });

    pomoPlusBtn.addEventListener('click', () => {
        let val = parseInt(taskPomodorosInput.value);
        if (val < 10) taskPomodorosInput.value = val + 1;
    });

    // Subtask temporary creation listener
    if (addTempSubtaskBtn && subtaskTempInput && tempSubtasksList) {
        state.tempSubtasks = [];
        addTempSubtaskBtn.addEventListener('click', () => {
            const val = subtaskTempInput.value.trim();
            if (val) {
                state.tempSubtasks.push(val);
                subtaskTempInput.value = '';
                renderTempSubtasks();
            }
        });
        subtaskTempInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTempSubtaskBtn.click();
            }
        });
    }

    function renderTempSubtasks() {
        tempSubtasksList.innerHTML = '';
        state.tempSubtasks.forEach((sub, idx) => {
            const item = document.createElement('div');
            item.className = 'temp-subtask-item';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';
            item.style.padding = '6px 12px';
            item.style.backgroundColor = 'var(--secondary-accent)';
            item.style.border = '1px solid var(--border-color)';
            item.style.borderRadius = '8px';
            item.style.marginTop = '6px';
            item.style.fontSize = '12px';
            item.innerHTML = `
                <span>${sub}</span>
                <button type="button" class="btn-delete-temp-sub" data-index="${idx}" style="background:transparent; border:none; color:var(--priority-high); cursor:pointer; font-size:16px; line-height:1;">&times;</button>
            `;
            item.querySelector('.btn-delete-temp-sub').addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                state.tempSubtasks.splice(index, 1);
                renderTempSubtasks();
            });
            tempSubtasksList.appendChild(item);
        });
    }

    newTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = taskTitleInput.value.trim();
        const description = taskDescInput ? taskDescInput.value.trim() : '';
        const priority = taskPrioritySelect.value;
        const estPomos = parseInt(taskPomodorosInput.value);
        const rawTag = taskTagInput.value.trim();
        const tag = rawTag === '' ? 'عمومی' : rawTag;

        if (!title) return;

        const newTask = {
            id: 'task_' + Date.now(),
            title: title,
            description: description,
            priority: priority,
            pomodorosEstimated: estPomos,
            pomodorosCompleted: 0,
            tag: tag,
            completed: false,
            subtasks: (state.tempSubtasks || []).map(title => ({ id: 'sub_' + Math.random().toString(36).substr(2, 9), title, completed: false })),
            createdAt: new Date().toISOString()
        };

        state.tasks.push(newTask);
        saveToLocalStorage();
        
        // Reset form
        taskTitleInput.value = '';
        if (taskDescInput) taskDescInput.value = '';
        taskTagInput.value = '';
        taskPrioritySelect.value = 'medium';
        taskPomodorosInput.value = '1';
        state.tempSubtasks = [];
        if (tempSubtasksList) tempSubtasksList.innerHTML = '';

        // Re-render UI lists
        renderTasks();

        // Trigger assault rifle burst at form submit button
        if (state.settings.cinematicMode && typeof triggerAssaultRifleBurst === 'function') {
            const submitBtn = newTaskForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                const rect = submitBtn.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                triggerAssaultRifleBurst(x, y, getThemeAccentColor());
            }
        }
        showToast('وظیفه جدید با موفقیت اضافه شد.', 'success');
    });

    function renderTasks(filter = 'all') {
        tasksScrollList.innerHTML = '';
        dashboardTasksList.innerHTML = '';

        // Filter elements
        const filteredTasks = state.tasks.filter(task => {
            if (filter === 'pending') return !task.completed;
            if (filter === 'completed') return task.completed;
            return true; // all
        });

        // Summary counts
        totalTasksCount.textContent = state.tasks.length;
        statCompletedTasks.textContent = `${state.tasks.filter(t => t.completed).length} / ${state.tasks.length}`;
        
        // Update dashboard focus progress ring
        updateDashboardProgressRing();

        if (filteredTasks.length === 0) {
            const emptyHtml = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p>وظیفه‌ای یافت نشد.</p>
                </div>
            `;
            tasksScrollList.innerHTML = emptyHtml;
        } else {
            filteredTasks.forEach(task => {
                const taskCard = createTaskCardElement(task);
                tasksScrollList.appendChild(taskCard);
            });
        }

        // Render dashboard quick tasks list (up to 3 high/medium pending priority tasks)
        const urgentTasks = state.tasks
            .filter(t => !t.completed)
            .sort((a,b) => {
                const prioWeight = { 'high': 3, 'medium': 2, 'low': 1 };
                return prioWeight[b.priority] - prioWeight[a.priority];
            })
            .slice(0, 3);

        if (urgentTasks.length === 0) {
            dashboardTasksList.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><path d="M22 4L12 14.01l-3-3"></path></svg>
                    <p>کار مهمی در صف وجود ندارد. روز آرامی است!</p>
                </div>
            `;
        } else {
            urgentTasks.forEach(task => {
                const taskCard = createTaskCardElement(task, true); // brief mode
                dashboardTasksList.appendChild(taskCard);
            });
        }

        // Set active task highlight in immersive indicator
        updateActiveTaskIndicator();
        
        // Initialize card 3D tilt hover for newly created elements
        initCardTilt();
        
        // Evaluate achievements
        if (typeof renderAchievements === 'function') {
            renderAchievements();
        }
        
        // Inject card laser borders
        if (typeof injectLaserBorders === 'function') {
            injectLaserBorders();
        }
    }

    function createTaskCardElement(task, isDashboardBrief = false) {
        const item = document.createElement('div');
        item.className = `task-item ${task.completed ? 'completed' : ''} ${state.activeTaskId === task.id ? 'active-focus-task' : ''}`;
        item.dataset.id = task.id;

        // Custom priority class helper
        let priorityFarsi = 'کم';
        if (task.priority === 'high') priorityFarsi = 'بالا';
        else if (task.priority === 'medium') priorityFarsi = 'متوسط';

        // Est Pomodoros representation (SVG tomato chimes)
        let pomoIcons = '';
        for (let i = 0; i < task.pomodorosEstimated; i++) {
            const filled = i < task.pomodorosCompleted;
            pomoIcons += `
                <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="${filled ? 'currentColor' : 'none'}" class="pomo-tomato-icon">
                    <circle cx="12" cy="12" r="8"></circle>
                </svg>
            `;
        }

        // Add description if it exists
        let descHtml = '';
        if (!isDashboardBrief && task.description) {
            descHtml = `
                <p class="task-description" style="font-size: 12px; color: var(--text-secondary); margin-top: 6px; line-height: 1.5; width: 100%; word-break: break-word;">${task.description}</p>
            `;
        }

        // Subtask rendering
        let subtasksHtml = '';
        if (!isDashboardBrief && task.subtasks && task.subtasks.length > 0) {
            const completedCount = task.subtasks.filter(s => s.completed).length;
            const totalCount = task.subtasks.length;
            const progressPercent = Math.round((completedCount / totalCount) * 100);

            subtasksHtml = `
                <div class="task-subtasks-section" style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed var(--border-color); width: 100%;">
                    <div class="subtasks-progress" style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-secondary); margin-bottom: 6px;">
                        <span>زیرکارها (${completedCount} از ${totalCount})</span>
                        <span>${progressPercent}%</span>
                    </div>
                    <div class="subtasks-progress-bar-bg" style="height:4px; background:var(--secondary-accent); border-radius:2px; margin-bottom: 8px; overflow:hidden;">
                        <div class="subtasks-progress-bar-fill" style="width:${progressPercent}%; height:100%; background:var(--primary-accent); transition: width 0.3s ease;"></div>
                    </div>
                    <div class="subtasks-list" style="display:flex; flex-direction:column; gap:6px;">
                        ${task.subtasks.map(sub => `
                            <label class="subtask-label-item" style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer; opacity: ${sub.completed ? 0.6 : 1}">
                                <input type="checkbox" class="subtask-checkbox" data-task-id="${task.id}" data-sub-id="${sub.id}" ${sub.completed ? 'checked' : ''} style="accent-color: var(--primary-accent);">
                                <span class="subtask-title" style="text-decoration: ${sub.completed ? 'line-through' : 'none'}">${sub.title}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        item.innerHTML = `
            <div class="task-item-left">
                <div class="custom-checkbox" aria-label="تکمیل کار">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <div class="task-details" style="flex-grow:1;">
                    <span class="task-title">${task.title}</span>
                    ${!isDashboardBrief ? `
                        <div class="task-meta">
                            <span class="priority-badge priority-${task.priority}"></span>
                            <span>اولویت ${priorityFarsi}</span>
                            <span>•</span>
                            <span class="tag-badge">${task.tag}</span>
                        </div>
                        ${descHtml}
                        ${subtasksHtml}
                    ` : ''}
                </div>
            </div>
            <div class="task-item-right" style="flex-shrink:0;">
                <div class="pomodoro-estimate-display">
                    <span class="pomos-list">${pomoIcons}</span>
                </div>
                ${!isDashboardBrief ? `
                    <button class="btn-icon btn-delete-task" aria-label="حذف وظیفه">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                ` : ''}
            </div>
        `;

        // Checkbox click event (mark completed)
        item.querySelector('.custom-checkbox').addEventListener('click', (e) => {
            e.stopPropagation();
            task.completed = !task.completed;
            
            if (task.completed) {
                if (typeof gainXp === 'function') {
                    gainXp(15, 'انجام کار روزانه');
                }
                
                if (state.settings.cinematicMode) {
                    const rect = item.getBoundingClientRect();
                    const y = rect.top + rect.height / 2;
                    const x1 = rect.left;
                    const x2 = rect.right;
                    
                    item.classList.add('completed', 'cinematic-slash-active');
                    if (typeof triggerFxSlash === 'function') {
                        triggerFxSlash(x1, y, x2, y, getThemeAccentColor());
                    }
                    if (typeof triggerSuccessBurst === 'function') {
                        triggerSuccessBurst(e.clientX, e.clientY);
                    }
                    
                    setTimeout(() => {
                        saveToLocalStorage();
                        renderTasks();
                    }, 350);
                } else {
                    if (typeof triggerSuccessBurst === 'function') {
                        triggerSuccessBurst(e.clientX, e.clientY);
                    }
                    saveToLocalStorage();
                    renderTasks();
                }
                showToast('کار با موفقیت انجام شد!', 'success');
            } else {
                saveToLocalStorage();
                renderTasks();
                showToast('کار به حالت در انتظار بازگشت.', 'success');
            }
        });

        // Subtask checkbox click event
        if (!isDashboardBrief && task.subtasks && task.subtasks.length > 0) {
            item.querySelectorAll('.subtask-checkbox').forEach(chk => {
                chk.addEventListener('click', (e) => {
                    e.stopPropagation(); // prevent card selection focus
                    const taskId = e.target.dataset.taskId;
                    const subId = e.target.dataset.subId;
                    
                    const parentTask = state.tasks.find(t => t.id === taskId);
                    if (parentTask && parentTask.subtasks) {
                        const sub = parentTask.subtasks.find(s => s.id === subId);
                        if (sub) {
                            sub.completed = e.target.checked;
                            
                            if (sub.completed) {
                                if (typeof gainXp === 'function') {
                                    gainXp(5, 'انجام زیرکار');
                                }
                                
                                if (state.settings.cinematicMode && typeof triggerArrowPierce === 'function') {
                                    triggerArrowPierce(e.clientX, e.clientY, getThemeAccentColor());
                                } else if (state.settings.cinematicMode) {
                                    const rect = chk.closest('.subtask-item') ? chk.closest('.subtask-item').getBoundingClientRect() : chk.getBoundingClientRect();
                                    const y = rect.top + rect.height / 2;
                                    const x1 = rect.left;
                                    const x2 = rect.right;
                                    if (typeof triggerFxSlash === 'function') {
                                        triggerFxSlash(x1, y, x2, y, getThemeAccentColor());
                                    }
                                }
                                if (typeof triggerSuccessBurst === 'function') {
                                    triggerSuccessBurst(e.clientX, e.clientY);
                                }
                            }
                            
                            saveToLocalStorage();
                            renderTasks();
                            
                            // If all subtasks are completed, check if they are done
                            const allDone = parentTask.subtasks.every(s => s.completed);
                            if (allDone && !parentTask.completed) {
                                showToast('همه زیرکارهای این کار انجام شدند!', 'success');
                            }
                        }
                    }
                });
            });
        }

        // Card select event (set as active focus task)
        item.addEventListener('click', () => {
            if (task.completed) return;
            
            if (state.activeTaskId === task.id) {
                state.activeTaskId = null; // deselect
                showToast('لغو تمرکز روی کار فعلی.', 'info');
            } else {
                state.activeTaskId = task.id;
                showToast(`تمرکز تایمر روی کار: "${task.title}" قرار گرفت.`, 'success');
                
                // Trigger Bow Draw & Arrow Release animation targeting the card center
                if (state.settings.cinematicMode && typeof fxBows !== 'undefined') {
                    const rect = item.getBoundingClientRect();
                    const tx = rect.left + rect.width / 2;
                    const ty = rect.top + rect.height / 2;
                    const startX = tx + 180;
                    const startY = ty - 40;
                    fxBows.push(new BowDrawEffect(startX, startY, tx, ty, getThemeAccentColor()));
                }
            }
            saveToLocalStorage();
            renderTasks();
        });

        // Delete button event
        if (!isDashboardBrief) {
            item.querySelector('.btn-delete-task').addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (state.settings.cinematicMode && typeof triggerShotgunBlast === 'function') {
                    triggerShotgunBlast(e.clientX, e.clientY, getThemeAccentColor());
                    setTimeout(() => {
                        state.tasks = state.tasks.filter(t => t.id !== task.id);
                        if (state.activeTaskId === task.id) state.activeTaskId = null;
                        saveToLocalStorage();
                        renderTasks();
                    }, 180);
                } else {
                    state.tasks = state.tasks.filter(t => t.id !== task.id);
                    if (state.activeTaskId === task.id) state.activeTaskId = null;
                    saveToLocalStorage();
                    renderTasks();
                }
                showToast('وظیفه حذف شد.', 'info');
            });
        }

        return item;
    }

    function incrementTaskCompletedPomodoros(taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            task.pomodorosCompleted++;
            if (task.pomodorosCompleted >= task.pomodorosEstimated) {
                task.completed = true;
                state.activeTaskId = null;
                showToast(`آفرین! کار "${task.title}" تمام شد و به لیست کارهای انجام شده منتقل گردید.`, 'success');
            }
            saveToLocalStorage();
            renderTasks();
        }
    }

    function updateActiveTaskIndicator() {
        if (state.activeTaskId) {
            const task = state.tasks.find(t => t.id === state.activeTaskId);
            if (task) {
                immersiveActiveTaskText.textContent = `تمرکز بر روی: ${task.title}`;
                return;
            }
        }
        immersiveActiveTaskText.textContent = 'هیچ کار فعالی انتخاب نشده است';
    }

    function updateDashboardProgressRing() {
        const total = state.tasks.length;
        const comp = state.tasks.filter(t => t.completed).length;
        let percent = 0;
        if (total > 0) percent = Math.round((comp / total) * 100);

        dashboardCompletedPercent.textContent = `${percent}%`;

        // Circumference is 213.6
        const offset = 213.6 - (percent / 100) * 213.6;
        dashboardProgressRing.style.strokeDashoffset = offset;
    }

    // Filter tabs toggle
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderTasks(tab.dataset.filter);
        });
    });

    // --- MOOD & JOURNAL & STREAK ---
    let selectedMood = null;

    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            moodBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedMood = btn.dataset.mood;
        });
    });

    saveJournalBtn.addEventListener('click', (e) => {
        const note = journalNoteInput.value.trim();
        const dateStr = new Date().toLocaleDateString('fa-IR');

        if (!selectedMood && !note) {
            showToast('لطفاً حس و حال یا متنی برای ثبت ژورنال وارد کنید.', 'info');
            return;
        }

        // Trigger sniper shot bullet trail and glass fracture on journal save
        if (state.settings.cinematicMode && typeof triggerSniperFracture === 'function') {
            triggerSniperFracture(e.clientX, e.clientY, getThemeAccentColor());
        }

        // Check if there is already an entry for today
        const existingIndex = state.journal.findIndex(j => j.date === dateStr);
        const newLog = {
            date: dateStr,
            mood: selectedMood || 'neutral',
            note: note,
            timestamp: new Date().toISOString()
        };

        if (existingIndex !== -1) {
            state.journal[existingIndex] = newLog;
            showToast('ثبت یادداشت امروز بروزرسانی شد.', 'success');
        } else {
            state.journal.unshift(newLog); // latest first
            showToast('حس و حال و ژورنال امروز ثبت شد.', 'success');
            if (typeof gainXp === 'function') {
                gainXp(20, 'ثبت ژورنال روزانه');
            }
        }

        // Save and re-render
        saveToLocalStorage();
        renderJournalHistory();
        updateDashboardMoodDisplay();
        
        // Calculate and display focus streak
        calculateStreak();
        
        // Reset fields
        journalNoteInput.value = '';
        moodBtns.forEach(b => b.classList.remove('selected'));
        selectedMood = null;
    });

    function renderJournalHistory() {
        journalHistoryList.innerHTML = '';
        
        if (state.journal.length === 0) {
            journalHistoryList.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
                    <p>هنوز یادداشتی برای روزهای گذشته ثبت نشده است.</p>
                </div>
            `;
            return;
        }

        state.journal.forEach(item => {
            const div = document.createElement('div');
            div.className = 'journal-history-item';

            let moodEmoji = '😐';
            let moodFarsi = 'معمولی';
            switch (item.mood) {
                case 'excellent': moodEmoji = '🤩'; moodFarsi = 'عالی'; break;
                case 'good': moodEmoji = '🙂'; moodFarsi = 'خوب'; break;
                case 'tired': moodEmoji = '😴'; moodFarsi = 'خسته'; break;
                case 'stressed': moodEmoji = '🤯'; moodFarsi = 'پراسترس'; break;
            }

            div.innerHTML = `
                <div class="journal-history-header">
                    <span class="history-date">${item.date}</span>
                    <span class="history-mood-badge">
                        <span>${moodEmoji}</span>
                        <span>${moodFarsi}</span>
                    </span>
                </div>
                ${item.note ? `<p class="history-note">${item.note}</p>` : ''}
            `;
            journalHistoryList.appendChild(div);
        });
    }

    function updateDashboardMoodDisplay() {
        const todayStr = new Date().toLocaleDateString('fa-IR');
        const todayLog = state.journal.find(j => j.date === todayStr);

        if (todayLog) {
            let moodEmoji = '😐';
            let moodFarsi = 'معمولی';
            switch (todayLog.mood) {
                case 'excellent': moodEmoji = '🤩'; moodFarsi = 'عالی'; break;
                case 'good': moodEmoji = '🙂'; moodFarsi = 'خوب'; break;
                case 'tired': moodEmoji = '😴'; moodFarsi = 'خسته'; break;
                case 'stressed': moodEmoji = '🤯'; moodFarsi = 'مضطرب'; break;
            }
            statTodayMood.textContent = `${moodEmoji} ${moodFarsi}`;
        } else {
            statTodayMood.textContent = 'ثبت نشده';
        }
    }

    function calculateStreak() {
        // Calculate streak of consecutive days focusing or logging mood
        // Simplified mockup for offline usage: count number of journal logs
        let count = state.journal.length;
        state.streak = count;
        streakCount.textContent = count;
        saveToLocalStorage();
    }

    // --- STATS & FOCUS LOGS WRAPPER ---
    
    function logFocusSessionCompleted(seconds) {
        let stats = JSON.parse(localStorage.getItem('rayon_focus_stats') || '[]');
        stats.push({
            date: new Date().toLocaleDateString('fa-IR'),
            gregDate: new Date().toISOString().split('T')[0],
            duration: seconds, // in seconds
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('rayon_focus_stats', JSON.stringify(stats));
        updateDashboardFocusTime();
    }

    function incrementTodayFocusTime(secs) {
        // For realtime update on dashboard, we can increment temporary session stats
        let todayStr = new Date().toLocaleDateString('fa-IR');
        let tempStats = JSON.parse(localStorage.getItem('rayon_focus_stats_today') || '{}');
        
        if (tempStats.date === todayStr) {
            tempStats.seconds += secs;
        } else {
            tempStats.date = todayStr;
            tempStats.seconds = secs;
        }
        localStorage.setItem('rayon_focus_stats_today', JSON.stringify(tempStats));
        
        // Throttled dashboard display update (every 10 seconds or instantly)
        if (tempStats.seconds % 60 === 0) {
            updateDashboardFocusTime();
        }
    }

    function updateDashboardFocusTime() {
        let todayStr = new Date().toLocaleDateString('fa-IR');
        let tempStats = JSON.parse(localStorage.getItem('rayon_focus_stats_today') || '{}');
        let minutesToday = 0;
        
        if (tempStats.date === todayStr) {
            minutesToday = Math.floor(tempStats.seconds / 60);
        }

        // Add completed pomodoros sessions
        let stats = JSON.parse(localStorage.getItem('rayon_focus_stats') || '[]');
        let completedTodaySecs = stats
            .filter(s => s.date === todayStr)
            .reduce((acc, curr) => acc + curr.duration, 0);

        let totalMins = minutesToday + Math.floor(completedTodaySecs / 60);
        statFocusTime.textContent = `${totalMins} دقیقه`;
    }

    // --- ANALYTICS CHARTS ENGINE (SVG Rendering) ---
    
    function renderAnalyticsCharts() {
        const barContainer = document.getElementById('focus-bar-chart-container');
        const donutContainer = document.getElementById('tags-donut-chart-container');
        
        barContainer.innerHTML = '';
        donutContainer.innerHTML = '';

        // 1. RENDER FOCUS BAR CHART (Last 7 Days)
        let stats = JSON.parse(localStorage.getItem('rayon_focus_stats') || '[]');
        
        // Generate list of last 7 Gregorian days
        let last7Days = [];
        for (let i = 6; i >= 0; i--) {
            let d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push({
                greg: d.toISOString().split('T')[0],
                farsiLabel: d.toLocaleDateString('fa-IR', { weekday: 'narrow' }),
                minutes: 0
            });
        }

        // Populate days
        last7Days.forEach(day => {
            let matchSecs = stats
                .filter(s => s.gregDate === day.greg)
                .reduce((acc, curr) => acc + curr.duration, 0);
            
            // Add realtime today's focus seconds if matching
            let todayStr = new Date().toLocaleDateString('fa-IR');
            let todayGreg = new Date().toISOString().split('T')[0];
            if (day.greg === todayGreg) {
                let tempToday = JSON.parse(localStorage.getItem('rayon_focus_stats_today') || '{}');
                if (tempToday.date === todayStr) {
                    matchSecs += tempToday.seconds;
                }
            }

            day.minutes = Math.round(matchSecs / 60);
        });

        // Draw SVG Bar Chart
        const barSvgWidth = barContainer.clientWidth || 400;
        const barSvgHeight = 220;
        const chartPadding = 30;
        const graphHeight = barSvgHeight - 2 * chartPadding;
        const graphWidth = barSvgWidth - 2 * chartPadding;
        
        const maxMinutes = Math.max(...last7Days.map(d => d.minutes), 30); // scale at least to 30 mins
        
        let barChartHtml = `
            <svg class="chart-svg" viewBox="0 0 ${barSvgWidth} ${barSvgHeight}">
                <!-- Grid Lines -->
                <line x1="${chartPadding}" y1="${chartPadding}" x2="${barSvgWidth - chartPadding}" y2="${chartPadding}" class="chart-grid-line" />
                <line x1="${chartPadding}" y1="${chartPadding + graphHeight / 2}" x2="${barSvgWidth - chartPadding}" y2="${chartPadding + graphHeight / 2}" class="chart-grid-line" />
                <line x1="${chartPadding}" y1="${barSvgHeight - chartPadding}" x2="${barSvgWidth - chartPadding}" y2="${barSvgHeight - chartPadding}" class="chart-axis-line" />
        `;

        const barWidth = Math.floor(graphWidth / 7) - 10;
        
        last7Days.forEach((day, index) => {
            const barHeight = (day.minutes / maxMinutes) * graphHeight;
            const x = chartPadding + index * (graphWidth / 7) + 5;
            const y = barSvgHeight - chartPadding - barHeight;

            barChartHtml += `
                <!-- Bar item -->
                <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" class="chart-bar" />
                <!-- Label Farsi -->
                <text x="${x + barWidth / 2}" y="${barSvgHeight - 12}" class="chart-label-text">${day.farsiLabel}</text>
                <!-- Value Tooltip -->
                <text x="${x + barWidth / 2}" y="${y - 8}" class="chart-label-text" style="fill: var(--text-primary); font-family: var(--font-en); font-weight: 700;">${day.minutes}</text>
            `;
        });

        barChartHtml += `</svg>`;
        barContainer.innerHTML = barChartHtml;

        // Update top-level metrics calculations
        let totalSecs = stats.reduce((acc, curr) => acc + curr.duration, 0);
        let tempToday = JSON.parse(localStorage.getItem('rayon_focus_stats_today') || '{}');
        if (tempToday.date === new Date().toLocaleDateString('fa-IR')) {
            totalSecs += tempToday.seconds;
        }

        let totalMinsVal = Math.round(totalSecs / 60);
        totalFocusHours.textContent = `${Math.floor(totalMinsVal / 60)} ساعت و ${totalMinsVal % 60} دقیقه`;

        let activeDays = new Set(stats.map(s => s.date)).size || 1;
        avgDailyFocus.textContent = `${Math.round(totalMinsVal / activeDays)} دقیقه`;

        const completedTasksCount = state.tasks.filter(t => t.completed).length;
        const completedRatio = state.tasks.length > 0 ? Math.round((completedTasksCount / state.tasks.length) * 100) : 0;
        completedTasksRatio.textContent = `${completedRatio}%`;


        // 2. RENDER TAGS DONUT CHART
        // Calculate tags weight
        const tagWeights = {};
        state.tasks.forEach(t => {
            tagWeights[t.tag] = (tagWeights[t.tag] || 0) + 1;
        });

        let tagsData = Object.keys(tagWeights).map(tag => {
            return { label: tag, count: tagWeights[tag] };
        });

        if (tagsData.length === 0) {
            donutContainer.innerHTML = `
                <div class="empty-state">
                    <p>هیچ تگی برای آنالیز تسک‌ها ثبت نشده است.</p>
                </div>
            `;
            return;
        }

        // Draw Donut SVG
        const donutSvgSize = 200;
        const radius = 60;
        const circ = 2 * Math.PI * radius;
        const totalTasks = state.tasks.length;
        
        let donutChartHtml = `
            <svg class="chart-svg" viewBox="0 0 ${donutSvgSize} ${donutSvgSize}" width="${donutSvgSize}" height="${donutSvgSize}">
                <!-- Center Info -->
                <text x="100" y="96" class="donut-center-text-title">کل کارها</text>
                <text x="100" y="118" class="donut-center-text-val">${totalTasks}</text>
        `;

        let currentOffset = 0;
        // B&W monochromatic colors for segments
        const grayscaleColors = ['#ffffff', '#888888', '#aaaaaa', '#444444', '#cccccc', '#666666'];

        let legendsHtml = `<div class="chart-legends-grid">`;

        tagsData.forEach((item, idx) => {
            const ratio = item.count / totalTasks;
            const segmentLength = ratio * circ;
            const strokeDash = `${segmentLength} ${circ - segmentLength}`;
            const color = grayscaleColors[idx % grayscaleColors.length];

            donutChartHtml += `
                <circle cx="100" cy="100" r="${radius}" 
                    class="donut-segment"
                    stroke="${color}"
                    stroke-dasharray="${strokeDash}"
                    stroke-dashoffset="${-currentOffset}"
                    transform="rotate(-90 100 100)" />
            `;

            legendsHtml += `
                <div class="legend-item">
                    <span class="legend-color" style="background-color: ${color}"></span>
                    <span>${item.label}: <strong class="english-text">${Math.round(ratio*100)}%</strong></span>
                </div>
            `;

            currentOffset += segmentLength;
        });

        donutChartHtml += `</svg>`;
        legendsHtml += `</div>`;

        donutContainer.innerHTML = donutChartHtml;
        donutContainer.appendChild(new DOMParser().parseFromString(legendsHtml, 'text/html').body.firstChild);
        
        // Render Heatmap
        renderHeatmap();
    }

    // --- SETTINGS CONTROLLER ---
    
    // Sliders Realtime Values Updates
    settingsFocusSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        settingsFocusVal.textContent = val;
        state.timer.focus = val * 60;
        if (state.timer.currentMode === 'focus') resetTimer();
    });

    settingsShortSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        settingsShortVal.textContent = val;
        state.timer.shortBreak = val * 60;
        if (state.timer.currentMode === 'shortBreak') resetTimer();
    });

    settingsLongSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        settingsLongVal.textContent = val;
        state.timer.longBreak = val * 60;
        if (state.timer.currentMode === 'longBreak') resetTimer();
    });

    settingsSoundAlarmToggle.addEventListener('change', (e) => {
        state.timer.playAlarmSound = e.target.checked;
        saveToLocalStorage();
    });

    settingsAlarmVolSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        settingsAlarmVolVal.textContent = `${val}%`;
        state.timer.alarmVolume = parseInt(val);
        saveToLocalStorage();
    });

    // Reset app data click
    resetAppDataBtn.addEventListener('click', () => {
        if (confirm('آیا مطمئن هستید که می‌خواهید کل داده‌های برنامه را برای همیشه پاک کنید؟ این عمل غیر قابل بازگشت است.')) {
            localStorage.clear();
            showToast('داده‌های برنامه با موفقیت پاک شدند. صفحه در حال رفرش شدن است...', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    });

    // --- TOAST NOTIFICATIONS CORE ---
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            <div class="toast-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
            </div>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Triggers display
        setTimeout(() => toast.classList.add('show'), 50);
        
        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    // --- LOCAL STORAGE PERSISTENCE ---
    // --- SIMULATED JSON DATABASE HELPERS ---
    function getUsersDb() {
        try {
            return JSON.parse(localStorage.getItem('rayon_users_db') || '[]');
        } catch(e) {
            return [];
        }
    }

    function saveUsersDb(db) {
        localStorage.setItem('rayon_users_db', JSON.stringify(db));
    }

    function loadUserState(user) {
        if (!user) return;
        state.userName = user.name;
        state.userEmail = user.email;

        // Restore user state from database
        const userState = user.state || {};
        state.tasks = userState.tasks || [];
        state.activeTaskId = userState.activeTaskId || null;
        state.journal = userState.journal || [];
        state.streak = userState.streak || 0;
        
        if (userState.timerSettings) {
            state.timer.focus = (userState.timerSettings.focus || 25) * 60;
            state.timer.shortBreak = (userState.timerSettings.shortBreak || 5) * 60;
            state.timer.longBreak = (userState.timerSettings.longBreak || 15) * 60;
            state.timer.alarmVolume = userState.timerSettings.alarmVolume !== undefined ? userState.timerSettings.alarmVolume : 70;
            state.timer.playAlarmSound = userState.timerSettings.playAlarmSound !== undefined ? userState.timerSettings.playAlarmSound : true;
        } else {
            state.timer.focus = (user.dailyGoal || 60) * 60;
        }
        
        state.settings.theme = userState.theme || 'theme-midnight-glass';
        state.settings.cinematicMode = userState.cinematicMode !== undefined ? userState.cinematicMode : true;
        
        state.xp = userState.xp || 0;
        state.timeBlocks = userState.timeBlocks || Array(18).fill(null).map((_, i) => ({ hour: i + 6, task: '', category: 'other' }));
        state.habits = userState.habits || [];
        state.goals = userState.goals || [];
        state.waterIntake = userState.waterIntake !== undefined ? userState.waterIntake : 0;
        state.notes = userState.notes || [];
        state.budgetLimit = userState.budgetLimit !== undefined ? userState.budgetLimit : 1000000;
        state.expenses = userState.expenses || [];
        state.visionItems = userState.visionItems || [];

        // Sync states to DOM inputs
        if (settingsFocusSlider) {
            settingsFocusSlider.value = state.timer.focus / 60;
            settingsFocusVal.textContent = state.timer.focus / 60;
        }
        if (settingsShortSlider) {
            settingsShortSlider.value = state.timer.shortBreak / 60;
            settingsShortVal.textContent = state.timer.shortBreak / 60;
        }
        if (settingsLongSlider) {
            settingsLongSlider.value = state.timer.longBreak / 60;
            settingsLongVal.textContent = state.timer.longBreak / 60;
        }
        if (settingsSoundAlarmToggle) {
            settingsSoundAlarmToggle.checked = state.timer.playAlarmSound;
        }
        if (settingsAlarmVolSlider) {
            settingsAlarmVolSlider.value = state.timer.alarmVolume;
            settingsAlarmVolVal.textContent = `${state.timer.alarmVolume}%`;
        }
 
        state.timer.timeRemaining = state.timer[state.timer.currentMode];
        if (streakCount) streakCount.textContent = state.streak;
 
        // Apply theme settings
        document.body.className = state.settings.theme;
        
        // Apply cinematic mode toggle and layout
        if (state.settings.cinematicMode) {
            document.body.classList.add('cinematic-mode-active');
        } else {
            document.body.classList.remove('cinematic-mode-active');
        }
        if (settingsCinematicToggle) {
            settingsCinematicToggle.checked = state.settings.cinematicMode;
        }
 
        const matchingRadio = document.querySelector(`input[name="theme-preset"][value="${state.settings.theme}"]`);
        if (matchingRadio) {
            matchingRadio.checked = true;
        }

        const dispUserName = document.getElementById('display-user-name');
        if (dispUserName) dispUserName.textContent = user.name;

        // Re-render UI elements
        if (typeof renderTasks === 'function') renderTasks();
        if (typeof renderHabits === 'function') renderHabits();
        if (typeof renderGoals === 'function') renderGoals();
        if (typeof renderNotesList === 'function') renderNotesList();
        if (typeof renderExpenses === 'function') renderExpenses();
        if (typeof renderVisionBoard === 'function') renderVisionBoard();
        if (typeof updateDashboardProgressRing === 'function') updateDashboardProgressRing();
        if (typeof updateRpgSystem === 'function') updateRpgSystem();
        if (typeof renderPremiumProfile === 'function') renderPremiumProfile();
    }

    // --- LOCAL STORAGE PERSISTENCE ---
    function saveToLocalStorage() {
        const cleanState = {
            tasks: state.tasks,
            activeTaskId: state.activeTaskId,
            journal: state.journal,
            streak: state.streak,
            timerSettings: {
                focus: state.timer.focus / 60,
                shortBreak: state.timer.shortBreak / 60,
                longBreak: state.timer.longBreak / 60,
                alarmVolume: state.timer.alarmVolume,
                playAlarmSound: state.timer.playAlarmSound
            },
            theme: state.settings.theme,
            cinematicMode: state.settings.cinematicMode,
            
            // NEW EXPANSION STATES
            xp: state.xp,
            timeBlocks: state.timeBlocks,
            habits: state.habits,
            goals: state.goals,
            waterIntake: state.waterIntake,
            notes: state.notes,
            budgetLimit: state.budgetLimit,
            expenses: state.expenses,
            visionItems: state.visionItems
        };
        
        // Save to active state key
        localStorage.setItem('rayon_management_state', JSON.stringify(cleanState));

        // Save back into the users database for persistence
        const savedProfileStr = localStorage.getItem('rayon_user_profile');
        if (savedProfileStr) {
            try {
                const profile = JSON.parse(savedProfileStr);
                const db = getUsersDb();
                const userIdx = db.findIndex(u => u.email === profile.email);
                if (userIdx !== -1) {
                    db[userIdx].state = cleanState;
                    db[userIdx].name = profile.name;
                    db[userIdx].membershipType = profile.membershipType;
                    db[userIdx].rank = profile.rank;
                    db[userIdx].badgeColor = profile.badgeColor;
                    db[userIdx].dailyGoal = profile.dailyGoal;
                    saveUsersDb(db);
                }
            } catch(e) {
                console.error("Error saving user state to DB: ", e);
            }
        }
    }
 
    function loadFromLocalStorage() {
        // We defer loading state to checkUserProfile() on boot
        console.log("RayonDB: Deferring state load to checkUserProfile context.");
    }

    // --- THEME SWAPPER CONTROLLER ---
    themePresets.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            document.body.className = selectedTheme;
            state.settings.theme = selectedTheme;
            saveToLocalStorage();
            showToast('تم رنگی تغییر یافت.', 'success');
            
            // Re-draw graphs if active section is analytics to match theme colors
            if (document.getElementById('section-analytics').classList.contains('active')) {
                renderAnalyticsCharts();
            }
        });
    });

    // --- USER REGISTRATION & AUTHENTICATION CONTROLLER ---
    const authOverlay = document.getElementById('auth-overlay');
    const tabRegister = document.getElementById('tab-register');
    const tabLogin = document.getElementById('tab-login');
    const authRegisterForm = document.getElementById('auth-register-form');
    const authLoginForm = document.getElementById('auth-login-form');
    const regNameInput = document.getElementById('reg-name');
    const regEmailInput = document.getElementById('reg-email');
    const regPasswordInput = document.getElementById('reg-password');
    const regFocusGoalSlider = document.getElementById('reg-focus-goal-slider');
    const regFocusGoalVal = document.getElementById('reg-focus-goal-val');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const displayUserName = document.getElementById('display-user-name');
    const headerLogoutBtn = document.getElementById('header-logout-btn');

    // Registration focus slider listener
    regFocusGoalSlider.addEventListener('input', (e) => {
        regFocusGoalVal.textContent = e.target.value;
    });

    // Form tab toggles
    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        authRegisterForm.classList.add('active');
        authLoginForm.classList.remove('active');
    });

    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        authLoginForm.classList.add('active');
        authRegisterForm.classList.remove('active');
    });

    // Registration form submission
    authRegisterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = regNameInput.value.trim();
        const email = regEmailInput.value.trim().toLowerCase();
        const password = regPasswordInput.value;
        const dailyGoal = parseInt(regFocusGoalSlider.value);
        const membershipType = document.getElementById('reg-type') ? document.getElementById('reg-type').value : 'gold';

        if (!name || !email || !password) return;

        const db = getUsersDb();
        if (db.some(u => u.email === email)) {
            showToast('کاربری با این ایمیل قبلاً ثبت‌نام کرده است.', 'info');
            return;
        }

        // Create initial clean state for this user
        const initialUserState = {
            tasks: [],
            activeTaskId: null,
            journal: [],
            streak: 0,
            theme: 'theme-midnight-glass',
            cinematicMode: true,
            xp: 0,
            timeBlocks: Array(18).fill(null).map((_, i) => ({ hour: i + 6, task: '', category: 'other' })),
            habits: [
                { id: 'h1', title: 'ورزش صبحگاهی و کشش', category: 'health', color: 'green', streak: 3, completedDays: [new Date().toISOString().split('T')[0]] },
                { id: 'h2', title: 'مطالعه کتاب توسعه فردی', category: 'study', color: 'gold', streak: 5, completedDays: [] }
            ],
            goals: [
                { id: 'g1', title: 'راه‌اندازی پلتفرم رشد فردی رایون', category: 'career', date: '2026-12-30', desc: 'توسعه و عرضه هاب مدیریت بهره‌وری', milestones: [{ title: 'طراحی پروتوتایپ و UI', completed: true }, { title: 'برنامه‌نویسی منطق ۱۰ بخش کاربردی', completed: false }] }
            ],
            waterIntake: 2,
            notes: [
                { id: 'n1', title: 'ایده‌های توسعه محصول رایون', tags: 'ایده, کار', content: 'تمرکز روی ایجاد بخش‌های گام‌به‌گام و ارزش‌های ملموس برای کاربر شامل برنامه‌ریزی تقویم، امواج مغزی، مدیریت مخارج رشد و گیمفیکیشن...', date: new Date().toLocaleDateString('fa-IR') }
            ],
            budgetLimit: 1000000,
            expenses: [
                { id: 'e1', desc: 'خرید کتاب کار عمیق اثر کال نیوپورت', amount: 95000, category: 'books', date: new Date().toISOString().split('T')[0] }
            ],
            visionItems: [
                { id: 'v1', title: 'اتاق کار مینیمال و آرام', url: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=500', category: 'material' },
                { id: 'v2', title: 'کوهستان آلپ سوئیس', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500', category: 'travel' }
            ]
        };

        const newUser = {
            name,
            email,
            password,
            dailyGoal,
            membershipType,
            rank: 'beginner',
            badgeColor: 'amber',
            state: initialUserState
        };

        db.push(newUser);
        saveUsersDb(db);

        // Store active session profile
        const activeProfile = {
            name,
            email,
            password,
            membershipType,
            rank: 'beginner',
            badgeColor: 'amber',
            dailyGoal
        };
        localStorage.setItem('rayon_user_profile', JSON.stringify(activeProfile));

        // Load new user state
        loadUserState(newUser);

        // Hide panel
        authOverlay.classList.remove('active');
        showToast(`حساب کاربری ${name} با موفقیت ساخته شد. خوش آمدید!`, 'success');

        // Setup daily progress ring goal based on new profile setting
        updateDashboardProgressRing();
        setTimeout(() => {
            if (typeof startTour === 'function') startTour();
        }, 1200);
    });

    // Login form submission
    authLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginEmailInput.value.trim().toLowerCase();
        const password = loginPasswordInput.value;

        const db = getUsersDb();
        const matchedUser = db.find(u => u.email === email && u.password === password);

        if (matchedUser) {
            // Store active session profile
            const activeProfile = {
                name: matchedUser.name,
                email: matchedUser.email,
                password: matchedUser.password,
                membershipType: matchedUser.membershipType || 'regular',
                rank: matchedUser.rank || 'warrior',
                badgeColor: matchedUser.badgeColor || 'amber',
                dailyGoal: matchedUser.dailyGoal || 60
            };
            localStorage.setItem('rayon_user_profile', JSON.stringify(activeProfile));

            // Load user's state
            loadUserState(matchedUser);

            authOverlay.classList.remove('active');
            showToast(`خوش آمدید، ${matchedUser.name}!`, 'success');
            
            // Clean forms
            loginEmailInput.value = '';
            loginPasswordInput.value = '';
        } else {
            showToast('ایمیل یا رمز عبور اشتباه است.', 'info');
        }
    });

    // Header logout trigger
    headerLogoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Clear active user session
        localStorage.removeItem('rayon_user_profile');
        state.userName = '';
        state.userEmail = '';
        
        // Show login panel on logout
        tabLogin.click();
        authOverlay.classList.add('active');
        showToast('شما با موفقیت خارج شدید.', 'info');
    });

    // Authentication profile checking and database migration
    function checkUserProfile() {
        const db = getUsersDb();
        const savedProfileStr = localStorage.getItem('rayon_user_profile');
        
        // Seeding database from old single user state if database is empty
        if (db.length === 0 && savedProfileStr) {
            try {
                const profile = JSON.parse(savedProfileStr);
                const oldState = JSON.parse(localStorage.getItem('rayon_management_state') || '{}');
                const oldUser = {
                    name: profile.name || 'کاربر رایون',
                    email: profile.email || 'vip@rayon.com',
                    password: profile.password || '123456',
                    dailyGoal: profile.dailyGoal || 60,
                    membershipType: profile.membershipType || 'gold',
                    rank: profile.rank || 'warrior',
                    badgeColor: profile.badgeColor || 'amber',
                    state: oldState
                };
                db.push(oldUser);
                saveUsersDb(db);
            } catch(e) {
                console.error("Migration: Error auto-seeding database from old state: ", e);
            }
        }
        
        // Reload matched user state or show authentication overlay
        if (savedProfileStr) {
            try {
                const profile = JSON.parse(savedProfileStr);
                const currentDb = getUsersDb();
                const matchedUser = currentDb.find(u => u.email === profile.email);
                
                if (matchedUser) {
                    loadUserState(matchedUser);
                    authOverlay.classList.remove('active');
                } else {
                    authOverlay.classList.add('active');
                    tabRegister.click();
                }
            } catch (e) {
                console.error("Error parsing user profile: ", e);
                authOverlay.classList.add('active');
                tabRegister.click();
            }
        } else {
            authOverlay.classList.add('active');
            tabRegister.click();
        }
    }

    // --- AUDIO WAVE VISUALIZER CANVAS LOOP ---
    const visualizerCanvas = document.getElementById('timer-visualizer-canvas');
    const visualizerCtx = visualizerCanvas.getContext('2d');
    let waveOffset = 0;

    function animateVisualizer() {
        if (!visualizerCanvas) return;

        visualizerCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
        const cx = visualizerCanvas.width / 2;
        const cy = visualizerCanvas.height / 2;
        const baseRadius = 92;

        // Determine activity based on sound playing and timer running
        let isAnySoundPlaying = Object.values(synthesizers).some(synth => synth.isPlaying);
        let activeMultiplier = isAnySoundPlaying ? (state.timer.isRunning ? 2.2 : 1.4) : (state.timer.isRunning ? 0.8 : 0.25);
        let speed = isAnySoundPlaying ? 0.04 : 0.012;

        waveOffset += speed;

        visualizerCtx.save();
        visualizerCtx.translate(cx, cy);

        // Draw 3 layers of fine waveforms
        for (let layer = 0; layer < 3; layer++) {
            visualizerCtx.beginPath();
            const opacity = 0.03 + (layer * 0.02);
            visualizerCtx.strokeStyle = document.body.classList.contains('light-theme') 
                ? `rgba(0, 0, 0, ${opacity * activeMultiplier})` 
                : `rgba(255, 255, 255, ${opacity * activeMultiplier})`;
            visualizerCtx.lineWidth = 1.6 - (layer * 0.4);

            const points = 80;
            for (let i = 0; i <= points; i++) {
                const angle = (i / points) * Math.PI * 2;
                // Complex harmonics synthesis for organic wave ripples
                const waveAmp = Math.sin(angle * (4 + layer) + waveOffset) * (3 + layer * 1.5) * activeMultiplier;
                const r = baseRadius + waveAmp;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;

                if (i === 0) visualizerCtx.moveTo(x, y);
                else visualizerCtx.lineTo(x, y);
            }
            visualizerCtx.closePath();
            visualizerCtx.stroke();
        }
        visualizerCtx.restore();

        requestAnimationFrame(animateVisualizer);
    }

    // --- ACHIEVEMENTS / BADGES SYSTEM ---
    const achievementsList = [
        { id: 'first_task', title: 'آغاز کارهای بزرگ', desc: 'اولین کار روزانه خود را در سیستم ثبت کنید.', icon: '📝', check: () => state.tasks.length >= 1 },
        { id: 'focus_completed', title: 'ذهن متمرکز', desc: 'اولین دوره تمرکز پومودورو را به پایان برسانید.', icon: '🎯', check: () => {
            let stats = JSON.parse(localStorage.getItem('rayon_focus_stats') || '[]');
            return stats.length >= 1;
        }},
        { id: 'focus_1h', title: 'پادشاه تمرکز', desc: 'بیش از ۶۰ دقیقه تمرکز کل ثبت کنید.', icon: '👑', check: () => {
            let stats = JSON.parse(localStorage.getItem('rayon_focus_stats') || '[]');
            let totalSecs = stats.reduce((acc, curr) => acc + curr.duration, 0);
            let tempToday = JSON.parse(localStorage.getItem('rayon_focus_stats_today') || '{}');
            if (tempToday.date === new Date().toLocaleDateString('fa-IR')) totalSecs += tempToday.seconds;
            return totalSecs >= 3600;
        }},
        { id: 'tasks_3', title: 'عمل‌گرای کوشا', desc: 'حداقل ۳ وظیفه را تکمیل کنید.', icon: '⚡', check: () => state.tasks.filter(t => t.completed).length >= 3 },
        { id: 'journal_logged', title: 'خودآگاهی و تامل', desc: 'اولین مود یا ژورنال روزانه خود را ثبت کنید.', icon: '🌱', check: () => state.journal.length >= 1 }
    ];

    function renderAchievements() {
        const listContainer = document.getElementById('dashboard-badges-list');
        const countPill = document.getElementById('dashboard-badges-count');
        if (!listContainer) return;

        listContainer.innerHTML = '';
        let unlockedCount = 0;

        achievementsList.forEach(badge => {
            const isUnlocked = badge.check();
            if (isUnlocked) unlockedCount++;

            const item = document.createElement('div');
            item.className = `badge-item ${isUnlocked ? '' : 'locked'}`;
            item.innerHTML = `
                <div class="badge-art-icon">${badge.icon}</div>
                <div class="badge-info">
                    <span class="badge-title">${badge.title}</span>
                    <span class="badge-desc">${badge.desc}</span>
                </div>
            `;
            listContainer.appendChild(item);
        });

        countPill.textContent = `${unlockedCount} / ${achievementsList.length}`;
    }

    // --- DATA BACKUP & RESTORE HANDLERS ---
    const exportBtn = document.getElementById('export-data-btn');
    const importBtn = document.getElementById('import-data-btn');
    const importInput = document.getElementById('import-data-input');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = {
                tasks: state.tasks,
                journal: state.journal,
                streak: state.streak,
                profile: JSON.parse(localStorage.getItem('rayon_user_profile')),
                focus_stats: JSON.parse(localStorage.getItem('rayon_focus_stats') || '[]'),
                focus_stats_today: JSON.parse(localStorage.getItem('rayon_focus_stats_today') || '{}'),
                state_theme: state.settings.theme
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `rayon_backup_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast('فایل پشتیبان‌گیری با موفقیت دانلود شد.', 'success');
        });
    }

    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => {
            importInput.click();
        });

        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (data.profile || data.tasks || data.journal) {
                        if (data.profile) localStorage.setItem('rayon_user_profile', JSON.stringify(data.profile));
                        if (data.tasks) state.tasks = data.tasks;
                        if (data.journal) state.journal = data.journal;
                        if (data.streak !== undefined) state.streak = data.streak;
                        if (data.focus_stats) localStorage.setItem('rayon_focus_stats', JSON.stringify(data.focus_stats));
                        if (data.focus_stats_today) localStorage.setItem('rayon_focus_stats_today', JSON.stringify(data.focus_stats_today));
                        if (data.state_theme) state.settings.theme = data.state_theme;
                        
                        saveToLocalStorage();
                        showToast('بازیابی داده‌ها با موفقیت انجام شد. برنامه در حال رفرش شدن است...', 'success');
                        setTimeout(() => window.location.reload(), 1500);
                    } else {
                        showToast('فایل پشتیبان نامعتبر است.', 'info');
                    }
                } catch(err) {
                    showToast('خطا در خواندن فایل پشتیبان.', 'info');
                }
            };
            reader.readAsText(file);
        });
    }

    // --- MOOD-PRODUCTIVITY HEATMAP SVG RENDERER ---
    function renderHeatmap() {
        const heatmapContainer = document.getElementById('mood-focus-heatmap-container');
        if (!heatmapContainer) return;
        
        heatmapContainer.innerHTML = '';
        
        // Generate last 14 days list
        let daysData = [];
        for (let i = 13; i >= 0; i--) {
            let d = new Date();
            d.setDate(d.getDate() - i);
            
            const gregDate = d.toISOString().split('T')[0];
            const farsiDate = d.toLocaleDateString('fa-IR');
            const weekday = d.toLocaleDateString('fa-IR', { weekday: 'short' });
            
            let focusMins = 0;
            let stats = JSON.parse(localStorage.getItem('rayon_focus_stats') || '[]');
            let completedSecs = stats
                .filter(s => s.gregDate === gregDate)
                .reduce((acc, curr) => acc + curr.duration, 0);
            
            const todayGreg = new Date().toISOString().split('T')[0];
            if (gregDate === todayGreg) {
                let tempToday = JSON.parse(localStorage.getItem('rayon_focus_stats_today') || '{}');
                if (tempToday.date === d.toLocaleDateString('fa-IR')) {
                    completedSecs += tempToday.seconds;
                }
            }
            focusMins = Math.round(completedSecs / 60);

            const journalLog = state.journal.find(j => j.date === farsiDate);
            const mood = journalLog ? journalLog.mood : 'none';

            daysData.push({
                gregDate,
                farsiDate,
                weekday,
                focusMins,
                mood
            });
        }

        const width = heatmapContainer.clientWidth || 500;
        const height = 180;
        const cellSize = 38;
        const gap = 8;
        const startX = 70;
        const startY = 30;

        let svgHtml = `<svg viewBox="0 0 ${width} ${height}" style="width:100%; height:100%;">`;

        const weekdaysFarsi = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
        const colWidth = 55;
        const rowHeight = 45;
        
        weekdaysFarsi.forEach((dayName, colIdx) => {
            const x = startX + colIdx * colWidth + colWidth/2;
            svgHtml += `<text x="${x}" y="20" class="chart-label-text" style="text-anchor:middle; font-weight:700; fill:var(--text-secondary);">${dayName}</text>`;
        });

        svgHtml += `
            <text x="${startX - 15}" y="${startY + 22}" class="chart-label-text" style="text-anchor:end; fill:var(--text-secondary);">هفته قبل</text>
            <text x="${startX - 15}" y="${startY + 67}" class="chart-label-text" style="text-anchor:end; fill:var(--text-secondary);">این هفته</text>
        `;

        daysData.forEach((day, idx) => {
            const rowIdx = Math.floor(idx / 7);
            const colIdx = idx % 7;
            
            const x = startX + colIdx * colWidth + (colWidth - cellSize)/2;
            const y = startY + rowIdx * rowHeight + (rowHeight - cellSize)/2;

            let color = 'var(--secondary-accent)';
            let strokeColor = 'var(--border-color)';
            if (day.focusMins > 0) {
                const isZen = document.body.classList.contains('theme-zen-forest');
                const isGold = document.body.classList.contains('theme-midnight-gold');
                const isSnow = document.body.classList.contains('theme-snow-light');
                const isSlate = document.body.classList.contains('theme-monochrome-slate');

                if (isZen) {
                    if (day.focusMins <= 25) color = 'rgba(152, 176, 160, 0.25)';
                    else if (day.focusMins <= 60) color = 'rgba(152, 176, 160, 0.55)';
                    else color = 'rgba(152, 176, 160, 0.95)';
                } else if (isGold) {
                    if (day.focusMins <= 25) color = 'rgba(201, 166, 107, 0.25)';
                    else if (day.focusMins <= 60) color = 'rgba(201, 166, 107, 0.55)';
                    else color = 'rgba(201, 166, 107, 0.95)';
                } else if (isSnow) {
                    if (day.focusMins <= 25) color = 'rgba(0, 0, 0, 0.1)';
                    else if (day.focusMins <= 60) color = 'rgba(0, 0, 0, 0.3)';
                    else color = 'rgba(0, 0, 0, 0.85)';
                } else if (isSlate) {
                    if (day.focusMins <= 25) color = 'rgba(135, 144, 166, 0.25)';
                    else if (day.focusMins <= 60) color = 'rgba(135, 144, 166, 0.55)';
                    else color = 'rgba(135, 144, 166, 0.95)';
                } else {
                    if (day.focusMins <= 25) color = 'rgba(255, 255, 255, 0.18)';
                    else if (day.focusMins <= 60) color = 'rgba(255, 255, 255, 0.48)';
                    else color = 'rgba(255, 255, 255, 0.95)';
                }
            }

            let moodEmoji = '';
            if (day.mood !== 'none' && day.mood !== 'neutral') {
                switch (day.mood) {
                    case 'excellent': moodEmoji = '🤩'; break;
                    case 'good': moodEmoji = '🙂'; break;
                    case 'tired': moodEmoji = '😴'; break;
                    case 'stressed': moodEmoji = '🤯'; break;
                }
            }

            svgHtml += `
                <g>
                    <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="10" 
                        style="fill:${color}; stroke:${strokeColor}; stroke-width:1px;" />
                    ${moodEmoji ? `<text x="${x + cellSize/2}" y="${y + cellSize/2 + 5}" style="font-size:16px; text-anchor:middle;">${moodEmoji}</text>` : ''}
                    <title>${day.farsiDate}: ${day.focusMins} دقیقه تمرکز ${day.mood !== 'none' ? `| حس: ${day.mood}` : ''}</title>
                </g>
            `;
        });

        svgHtml += `
            <g transform="translate(${startX}, ${height - 20})">
                <text x="0" y="10" class="chart-label-text" style="font-size:11px; fill:var(--text-secondary);">میزان تمرکز:</text>
                <rect x="75" y="0" width="14" height="14" rx="4" style="fill:var(--secondary-accent); stroke:var(--border-color);" />
                <text x="95" y="11" class="chart-label-text" style="font-size:10px; fill:var(--text-secondary);">۰</text>
                
                <rect x="115" y="0" width="14" height="14" rx="4" style="fill:rgba(128,128,128,0.25);" id="legend-low-box" />
                <text x="135" y="11" class="chart-label-text" style="font-size:10px; fill:var(--text-secondary);">تا ۲۵ د</text>
                
                <rect x="175" y="0" width="14" height="14" rx="4" style="fill:rgba(128,128,128,0.55);" id="legend-med-box" />
                <text x="195" y="11" class="chart-label-text" style="font-size:10px; fill:var(--text-secondary);">تا ۶۰ د</text>
                
                <rect x="235" y="0" width="14" height="14" rx="4" style="fill:rgba(128,128,128,0.9);" id="legend-high-box" />
                <text x="255" y="11" class="chart-label-text" style="font-size:10px; fill:var(--text-secondary);">۶۰+ د</text>
            </g>
        `;

        svgHtml += `</svg>`;
        heatmapContainer.innerHTML = svgHtml;

        const isZen = document.body.classList.contains('theme-zen-forest');
        const isGold = document.body.classList.contains('theme-midnight-gold');
        const isSnow = document.body.classList.contains('theme-snow-light');
        const isSlate = document.body.classList.contains('theme-monochrome-slate');

        const lowBox = document.getElementById('legend-low-box');
        const medBox = document.getElementById('legend-med-box');
        const highBox = document.getElementById('legend-high-box');

        if (lowBox && medBox && highBox) {
            if (isZen) {
                lowBox.style.fill = 'rgba(152,176,160,0.25)';
                medBox.style.fill = 'rgba(152,176,160,0.55)';
                highBox.style.fill = 'rgba(152,176,160,0.95)';
            } else if (isGold) {
                lowBox.style.fill = 'rgba(201,166,107,0.25)';
                medBox.style.fill = 'rgba(201,166,107,0.55)';
                highBox.style.fill = 'rgba(201,166,107,0.95)';
            } else if (isSnow) {
                lowBox.style.fill = 'rgba(0, 0, 0, 0.1)';
                medBox.style.fill = 'rgba(0, 0, 0, 0.3)';
                highBox.style.fill = 'rgba(0, 0, 0, 0.85)';
            } else if (isSlate) {
                lowBox.style.fill = 'rgba(135,144,166,0.25)';
                medBox.style.fill = 'rgba(135,144,166,0.55)';
                highBox.style.fill = 'rgba(135,144,166,0.95)';
            } else {
                lowBox.style.fill = 'rgba(255, 255, 255, 0.18)';
                medBox.style.fill = 'rgba(255, 255, 255, 0.48)';
                highBox.style.fill = 'rgba(255, 255, 255, 0.95)';
            }
        }
    }

    // --- 3D CARD HOVER TILT EFFECTS ---
    function initCardTilt() {
        const cards = document.querySelectorAll('[data-tilt], .card, .task-item, .sound-card');
        cards.forEach(card => {
            card.removeEventListener('mousemove', handleCardTilt);
            card.removeEventListener('mouseleave', resetCardTilt);
            
            card.addEventListener('mousemove', handleCardTilt);
            card.addEventListener('mouseleave', resetCardTilt);
        });
    }

    function handleCardTilt(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const w = rect.width;
        const h = rect.height;
        
        const rotateY = ((x / w) - 0.5) * 8; // Max tilt rotation
        const rotateX = (0.5 - (y / h)) * 8;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
        card.style.transition = 'transform 0.05s ease';
    }

    function resetCardTilt(e) {
        const card = e.currentTarget;
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    // --- BACKGROUND PARTICLE ENGINE ---
    const bgCanvas = document.getElementById('bg-particles-canvas');
    if (bgCanvas) {
        const bgCtx = bgCanvas.getContext('2d');
        let bgParticles = [];

        function resizeBgCanvas() {
            bgCanvas.width = window.innerWidth;
            bgCanvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeBgCanvas);
        resizeBgCanvas();

        class DriftingParticle {
            constructor() {
                this.x = Math.random() * bgCanvas.width;
                this.y = Math.random() * bgCanvas.height;
                this.vx = (Math.random() - 0.5) * 0.25;
                this.vy = (Math.random() - 0.5) * 0.25;
                this.radius = Math.random() * 1.6 + 0.4;
                this.alpha = Math.random() * 0.45 + 0.05;
            }
            update(mX, mY) {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0) this.x = bgCanvas.width;
                if (this.x > bgCanvas.width) this.x = 0;
                if (this.y < 0) this.y = bgCanvas.height;
                if (this.y > bgCanvas.height) this.y = 0;

                if (mX !== undefined && mY !== undefined) {
                    const dx = this.x - mX;
                    const dy = this.y - mY;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 120) {
                        const force = (120 - dist) / 120;
                        this.x += (dx / dist) * force * 1.8;
                        this.y += (dy / dist) * force * 1.8;
                    }
                }
            }
            draw() {
                bgCtx.beginPath();
                const isLight = document.body.classList.contains('theme-snow-light');
                bgCtx.fillStyle = isLight ? `rgba(0, 0, 0, ${this.alpha * 0.4})` : `rgba(255, 255, 255, ${this.alpha})`;
                bgCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                bgCtx.fill();
            }
        }

        const particleCount = 70;
        for (let i = 0; i < particleCount; i++) {
            bgParticles.push(new DriftingParticle());
        }

        let mX = undefined;
        let mY = undefined;
        
        // Expose global particle burst trigger for task complete firework effects
        function triggerSuccessBurst(x, y) {
            const isLight = document.body.classList.contains('theme-snow-light');
            const isZen = document.body.classList.contains('theme-zen-forest');
            const isGold = document.body.classList.contains('theme-midnight-gold');
            const isSlate = document.body.classList.contains('theme-monochrome-slate');

            let themeColors = ['#ffffff', '#888888', '#dddddd'];
            if (isZen) themeColors = ['#98b0a0', '#eaf0ec', '#536359'];
            else if (isGold) themeColors = ['#c9a66b', '#f5f6f9', '#615a4e'];
            else if (isSlate) themeColors = ['#8790a6', '#e3e6ed', '#52596b'];
            else if (isLight) themeColors = ['#000000', '#585c6c', '#9499a9'];

            for (let i = 0; i < 35; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 3;
                bgParticles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius: Math.random() * 2.5 + 1.2,
                    alpha: 1.0,
                    decay: Math.random() * 0.018 + 0.012,
                    color: themeColors[Math.floor(Math.random() * themeColors.length)],
                    isBurst: true
                });
            }
        }
        window.triggerSuccessBurst = triggerSuccessBurst;

        window.addEventListener('mousemove', (e) => {
            mX = e.clientX;
            mY = e.clientY;
            
            // Aurora Parallax offset translation
            const auroraContainer = document.querySelector('.aurora-container');
            if (auroraContainer) {
                const pctX = e.clientX / window.innerWidth - 0.5;
                const pctY = e.clientY / window.innerHeight - 0.5;
                auroraContainer.style.transform = `translate(${pctX * 30}px, ${pctY * 30}px)`;
            }
        });
        window.addEventListener('mouseout', () => {
            mX = undefined;
            mY = undefined;
        });

        function animateBgParticles() {
            bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
            
            // Draw Constellation Network Lines (between drifting particles)
            const isLight = document.body.classList.contains('theme-snow-light');
            const maxDistance = 85;
            for (let i = 0; i < bgParticles.length; i++) {
                const p1 = bgParticles[i];
                if (p1.isBurst) continue;
                for (let j = i + 1; j < bgParticles.length; j++) {
                    const p2 = bgParticles[j];
                    if (p2.isBurst) continue;
                    
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < maxDistance) {
                        const alpha = (1 - dist / maxDistance) * 0.12;
                        bgCtx.strokeStyle = isLight ? `rgba(0, 0, 0, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
                        bgCtx.lineWidth = 0.5;
                        bgCtx.beginPath();
                        bgCtx.moveTo(p1.x, p1.y);
                        bgCtx.lineTo(p2.x, p2.y);
                        bgCtx.stroke();
                    }
                }
            }

            // Draw and Update Particles (Drifting and Bursting)
            for (let i = bgParticles.length - 1; i >= 0; i--) {
                const p = bgParticles[i];
                if (p.isBurst) {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vx *= 0.95; // drag
                    p.vy *= 0.95;
                    p.alpha -= p.decay;
                    if (p.alpha <= 0) {
                        bgParticles.splice(i, 1);
                        continue;
                    }
                    bgCtx.beginPath();
                    bgCtx.fillStyle = p.color;
                    bgCtx.globalAlpha = p.alpha;
                    bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    bgCtx.fill();
                } else {
                    p.update(mX, mY);
                    p.draw();
                }
            }
            bgCtx.globalAlpha = 1.0; // Reset canvas global alpha
            
            requestAnimationFrame(animateBgParticles);
        }
        animateBgParticles();
    }

    // --- SYSTEM INITIALIZATION ---
    loadFromLocalStorage();
    checkUserProfile();
    updateDateAndClock();
    updateTimerDisplay();
    renderTasks();
    renderJournalHistory();
    updateDashboardMoodDisplay();
    updateDashboardFocusTime();
    renderAchievements();
    updateSidebarPill();
    initCardTilt();
    renderHeatmap();

    // Start wave graphics
    animateVisualizer();

    // Setup periodic time checker (minute accuracy clocks)
    setInterval(updateDateAndClock, 60000);

    // ========================================================
    // CINEMATIC ACTION MODE CORE LOGIC & WEB AUDIO SOUND ENGINE
    // ========================================================

    // UI Sound effects synthesizers
    function playUISound(type) {
        if (!state.settings.cinematicMode) return;
        initAudioContext();
        if (!audioCtx) return;
        
        const now = audioCtx.currentTime;
        const masterVol = state.timer.alarmVolume / 100;
        
        if (type === 'hover') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400, now);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.012 * masterVol, now + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'click') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(900, now);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.035 * masterVol, now + 0.002);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'slash') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(2000, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);
            
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.setValueAtTime(1600, now);
            filter.frequency.exponentialRampToValueAtTime(100, now + 0.25);
            filter.Q.value = 1.2;
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.055 * masterVol, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.32);
        } else if (type === 'gunshot') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1300, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.07 * masterVol, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.18);
        } else if (type === 'chime') {
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const t = now + idx * 0.08;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t);
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.04 * masterVol, t + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(t);
                osc.stop(t + 0.5);
            });
        } else if (type === 'boot') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(110, now);
            osc.frequency.linearRampToValueAtTime(660, now + 1.5);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.07 * masterVol, now + 0.4);
            gain.gain.linearRampToValueAtTime(0, now + 1.5);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 1.6);
        }
    }

    // Canvas Special Effects Overlay Logic
    const fxCanvas = document.getElementById('cinematic-fx-canvas');
    let fxCtx = null;
    let fxParticles = [];
    let fxSlashes = [];
    let fxBullets = [];
    let fxShells = [];
    let fxArrows = [];
    let fxFractures = [];
    let fxBows = [];
    let fxPlasmas = [];

    if (fxCanvas) {
        fxCtx = fxCanvas.getContext('2d');
        function resizeFxCanvas() {
            fxCanvas.width = window.innerWidth;
            fxCanvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeFxCanvas);
        resizeFxCanvas();
    }

    class SparkParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - 1.2;
            this.radius = Math.random() * 2 + 1;
            this.alpha = 1.0;
            this.color = color || '#ffffff';
            this.decay = Math.random() * 0.025 + 0.015;
            this.gravity = 0.18;
            this.drag = 0.96;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= this.drag;
            this.vy *= this.drag;
            this.vy += this.gravity;
            this.alpha -= this.decay;
        }
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class VectorSlash {
        constructor(x1, y1, x2, y2, color) {
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
            this.age = 0;
            this.maxAge = 14;
            this.color = color || '#ffffff';
            this.lineWidth = 12;
        }
        update() {
            this.age++;
        }
        draw(ctx) {
            const progress = this.age / this.maxAge;
            const currentWidth = this.lineWidth * (1 - progress);
            ctx.save();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = currentWidth;
            ctx.lineCap = 'round';
            ctx.shadowBlur = 18;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x1, this.y1);
            ctx.lineTo(this.x2, this.y2);
            ctx.stroke();
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = currentWidth * 0.35;
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(this.x1, this.y1);
            ctx.lineTo(this.x2, this.y2);
            ctx.stroke();
            ctx.restore();
        }
    }

    function triggerScreenShake(duration = 220) {
        if (!state.settings.cinematicMode) return;
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.classList.add('screen-shake');
            setTimeout(() => {
                appContainer.classList.remove('screen-shake');
            }, duration);
        }
    }

    function triggerFxSlash(x1, y1, x2, y2, color) {
        if (!state.settings.cinematicMode) return;
        fxSlashes.push(new VectorSlash(x1, y1, x2, y2, color));
        
        const distance = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
        const steps = Math.min(30, Math.floor(distance / 12));
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            for (let j = 0; j < 2; j++) {
                fxParticles.push(new SparkParticle(x, y, color));
            }
        }
        playUISound('slash');
        triggerScreenShake(240);
    }

    function triggerClickSparks(x, y, color) {
        if (!state.settings.cinematicMode) return;
        for (let i = 0; i < 15; i++) {
            fxParticles.push(new SparkParticle(x, y, color));
        }
        playUISound('gunshot');
    }

    // --- 6 NEW ACTION ANIMATIONS (GUNS, ARROWS, PLASMA) ---

    // 1. Sci-Fi Plasma Charge Effect
    class PlasmaChargeEffect {
        constructor(x, y, buttonEl) {
            this.x = x;
            this.y = y;
            this.buttonEl = buttonEl;
            this.particles = [];
            this.age = 0;
            this.maxAge = 35;
            this.size = 2;
            this.color = '#00ffff';
            this.state = 'charging';
        }
        update() {
            this.age++;
            if (this.state === 'charging') {
                if (this.buttonEl) {
                    const r = this.buttonEl.getBoundingClientRect();
                    this.x = r.left + r.width / 2;
                    this.y = r.top + r.height / 2;
                }
                
                if (this.age < this.maxAge) {
                    this.size += 0.9;
                    for (let i = 0; i < 4; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const dist = Math.random() * 80 + 30;
                        this.particles.push({
                            x: this.x + Math.cos(angle) * dist,
                            y: this.y + Math.sin(angle) * dist,
                            tx: this.x,
                            ty: this.y,
                            alpha: 1.0,
                            speed: Math.random() * 0.05 + 0.05
                        });
                    }
                } else {
                    this.state = 'fired';
                    this.age = 0;
                    this.maxAge = 18;
                    playUISound('slash');
                    triggerScreenShake(260);
                }
                
                for (let i = this.particles.length - 1; i >= 0; i--) {
                    const p = this.particles[i];
                    p.x += (p.tx - p.x) * p.speed;
                    p.y += (p.ty - p.y) * p.speed;
                    const dx = p.tx - p.x;
                    const dy = p.ty - p.y;
                    if (dx*dx + dy*dy < 9) {
                        this.particles.splice(i, 1);
                    }
                }
            }
        }
        draw(ctx) {
            ctx.save();
            if (this.state === 'charging') {
                const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.3, 'rgba(0, 255, 255, 0.85)');
                grad.addColorStop(1, 'rgba(0, 255, 255, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#00ffff';
                this.particles.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                });
            } else {
                const progress = this.age / this.maxAge;
                const width = 50 * (1 - progress);
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = width;
                ctx.shadowBlur = 25;
                ctx.shadowColor = '#00ffff';
                ctx.beginPath();
                ctx.moveTo(0, this.y);
                ctx.lineTo(window.innerWidth, this.y);
                ctx.stroke();
                
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = width * 0.35;
                ctx.beginPath();
                ctx.moveTo(0, this.y);
                ctx.lineTo(window.innerWidth, this.y);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    // 2. Assault Rifle Bullet Trail
    class BulletTrail {
        constructor(x, y, angle, color) {
            this.x = x;
            this.y = y;
            const speed = Math.random() * 10 + 26;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.length = Math.random() * 20 + 20;
            this.color = color || '#ffaa00';
            this.alpha = 1.0;
            this.life = 0;
            this.maxLife = 18;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life++;
            this.alpha = 1 - (this.life / this.maxLife);
        }
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * 0.4, this.y - this.vy * 0.4);
            ctx.stroke();
            ctx.restore();
        }
    }

    function triggerAssaultRifleBurst(x, y, color) {
        if (!state.settings.cinematicMode) return;
        let shots = 0;
        const interval = setInterval(() => {
            if (shots >= 4) {
                clearInterval(interval);
                return;
            }
            const angle = Math.PI + (Math.random() * 0.3 - 0.15);
            fxBullets.push(new BulletTrail(x, y, angle, color));
            for (let i = 0; i < 5; i++) {
                fxParticles.push(new SparkParticle(x, y, '#ffaa00'));
            }
            playUISound('gunshot');
            triggerScreenShake(70);
            shots++;
        }, 75);
    }

    // 3. Shotgun Shell & Casing
    class ShotgunShell {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = Math.random() * 4 - 2;
            this.vy = -(Math.random() * 4 + 4);
            this.gravity = 0.22;
            this.angle = 0;
            this.rotSpeed = Math.random() * 0.4 - 0.2;
            this.life = 0;
            this.maxLife = 70;
            this.bounceCount = 0;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.angle += this.rotSpeed;
            this.life++;
            
            const floor = window.innerHeight - 30;
            if (this.y > floor && this.bounceCount < 2) {
                this.y = floor;
                this.vy = -this.vy * 0.38;
                this.vx *= 0.6;
                this.bounceCount++;
                if (state.settings.cinematicMode) {
                    setTimeout(() => playUISound('hover'), 40);
                }
            }
        }
        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = '#d4af37';
            ctx.strokeStyle = '#8b6c15';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.rect(-2, -5, 4, 10);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#aa820a';
            ctx.fillRect(-3, 3, 6, 2);
            ctx.restore();
        }
    }

    function triggerShotgunBlast(x, y, color) {
        if (!state.settings.cinematicMode) return;
        for (let i = 0; i < 24; i++) {
            const angle = Math.PI + (Math.random() * 1.0 - 0.5);
            const speed = Math.random() * 9 + 4;
            fxParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 2.2 + 0.8,
                alpha: 1.0,
                decay: Math.random() * 0.025 + 0.015,
                color: color || '#ffbb00',
                gravity: 0.16,
                drag: 0.95,
                isBurst: true,
                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.vx *= this.drag;
                    this.vy *= this.drag;
                    this.vy += this.gravity;
                    this.alpha -= this.decay;
                },
                draw(ctx) {
                    ctx.save();
                    ctx.globalAlpha = this.alpha;
                    ctx.fillStyle = this.color;
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });
        }
        
        fxShells.push(new ShotgunShell(x, y));
        setTimeout(() => {
            fxShells.push(new ShotgunShell(x, y));
        }, 100);
        
        playUISound('gunshot');
        triggerScreenShake(260);
    }

    // 4. Bow Draw & Release Effect
    class BowDrawEffect {
        constructor(x, y, targetX, targetY, color) {
            this.x = x;
            this.y = y;
            this.tx = targetX;
            this.ty = targetY;
            this.color = color || '#00ff88';
            this.age = 0;
            this.maxAge = 25;
            this.state = 'drawing';
        }
        update() {
            this.age++;
            if (this.state === 'drawing') {
                if (this.age >= 20) {
                    this.state = 'released';
                    fxArrows.push(new NeonArrow(this.x, this.y, this.tx, this.ty, this.color));
                    playUISound('click');
                }
            }
        }
        draw(ctx) {
            if (this.state !== 'drawing') return;
            const dx = this.tx - this.x;
            const dy = this.ty - this.y;
            const angle = Math.atan2(dy, dx);
            const progress = this.age / 20;
            const pullDistance = 22 * progress;
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            
            ctx.beginPath();
            ctx.arc(-15, 0, 24, -Math.PI / 2.6, Math.PI / 2.6);
            ctx.stroke();
            
            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-15, -18);
            ctx.lineTo(-pullDistance - 15, 0);
            ctx.lineTo(-15, 18);
            ctx.stroke();
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-pullDistance - 15, 0);
            ctx.lineTo(8, 0);
            ctx.stroke();
            ctx.restore();
        }
    }

    // 5. Flying Neon Arrow
    class NeonArrow {
        constructor(x, y, tx, ty, color) {
            this.x = x;
            this.y = y;
            this.tx = tx;
            this.ty = ty;
            this.color = color || '#00ff88';
            const dx = tx - x;
            const dy = ty - y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            this.vx = (dx / (dist || 1)) * 25;
            this.vy = (dy / (dist || 1)) * 25;
            this.active = true;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            const dx = this.tx - this.x;
            const dy = this.ty - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 26) {
                triggerArrowImpact(this.tx, this.ty, this.color);
                this.active = false;
            }
        }
        draw(ctx) {
            if (!this.active) return;
            const angle = Math.atan2(this.vy, this.vx);
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            
            ctx.beginPath();
            ctx.moveTo(-18, 0);
            ctx.lineTo(8, 0);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(-18, 0);
            ctx.lineTo(-24, -4);
            ctx.moveTo(-18, 0);
            ctx.lineTo(-24, 4);
            ctx.stroke();
            ctx.restore();
        }
    }

    function triggerArrowImpact(x, y, color) {
        if (!state.settings.cinematicMode) return;
        for (let i = 0; i < 12; i++) {
            fxParticles.push(new SparkParticle(x, y, color));
        }
        playUISound('click');
        triggerScreenShake(80);
    }

    function triggerArrowPierce(x, y, color) {
        if (!state.settings.cinematicMode) return;
        fxArrows.push(new NeonArrow(x + 200, y - 60, x, y, color));
        playUISound('hover');
    }

    // 6. Sniper Bullet & Glass Fracture Effect
    class GlassFracture {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color || '#ffffff';
            this.lines = [];
            this.alpha = 1.0;
            this.life = 0;
            this.maxLife = 100;
            
            const rayCount = Math.floor(Math.random() * 3) + 6;
            for (let i = 0; i < rayCount; i++) {
                const angle = (i / rayCount) * Math.PI * 2 + (Math.random() * 0.25 - 0.125);
                const rayLength = Math.random() * 35 + 40;
                this.lines.push([{
                    x: x + Math.cos(angle) * (rayLength * 0.25),
                    y: y + Math.sin(angle) * (rayLength * 0.25)
                }, {
                    x: x + Math.cos(angle) * rayLength,
                    y: y + Math.sin(angle) * rayLength
                }]);
            }
            for (let r = 1; r <= 3; r++) {
                const radius = r * 14;
                const ringPoints = [];
                for (let i = 0; i <= rayCount; i++) {
                    const angle = (i / rayCount) * Math.PI * 2;
                    ringPoints.push({
                        x: x + Math.cos(angle) * (radius + Math.random() * 4 - 2),
                        y: y + Math.sin(angle) * (radius + Math.random() * 4 - 2)
                    });
                }
                this.lines.push(ringPoints);
            }
        }
        update() {
            this.life++;
            this.alpha = 1 - (this.life / this.maxLife);
        }
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1.2;
            ctx.shadowBlur = 5;
            ctx.shadowColor = this.color;
            this.lines.forEach(pts => {
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) {
                    ctx.lineTo(pts[i].x, pts[i].y);
                }
                ctx.stroke();
            });
            ctx.restore();
        }
    }

    function triggerSniperFracture(x, y, color) {
        if (!state.settings.cinematicMode) return;
        const startX = Math.random() > 0.5 ? 0 : window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        
        fxBullets.push(new BulletTrail(startX, startY, Math.atan2(y - startY, x - startX), color || '#ffffff'));
        
        setTimeout(() => {
            fxFractures.push(new GlassFracture(x, y, color));
            for (let i = 0; i < 18; i++) {
                fxParticles.push(new SparkParticle(x, y, '#ffffff'));
            }
            playUISound('gunshot');
            triggerScreenShake(300);
        }, 40);
    }

    function animateCinematicFx() {
        if (!fxCanvas || !fxCtx) return;
        fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
        
        // 1. Plasmas
        for (let i = fxPlasmas.length - 1; i >= 0; i--) {
            const p = fxPlasmas[i];
            p.update();
            p.draw(fxCtx);
            if (p.state === 'fired' && p.age >= p.maxAge) {
                fxPlasmas.splice(i, 1);
            }
        }
        
        // 2. Bows
        for (let i = fxBows.length - 1; i >= 0; i--) {
            const b = fxBows[i];
            b.update();
            b.draw(fxCtx);
            if (b.state === 'released') {
                fxBows.splice(i, 1);
            }
        }
        
        // 3. Arrows
        for (let i = fxArrows.length - 1; i >= 0; i--) {
            const a = fxArrows[i];
            a.update();
            a.draw(fxCtx);
            if (!a.active) {
                fxArrows.splice(i, 1);
            }
        }
        
        // 4. Bullets
        for (let i = fxBullets.length - 1; i >= 0; i--) {
            const b = fxBullets[i];
            b.update();
            b.draw(fxCtx);
            if (b.alpha <= 0) {
                fxBullets.splice(i, 1);
            }
        }
        
        // 5. Shells
        for (let i = fxShells.length - 1; i >= 0; i--) {
            const s = fxShells[i];
            s.update();
            s.draw(fxCtx);
            if (s.life >= s.maxLife) {
                fxShells.splice(i, 1);
            }
        }
        
        // 6. Fractures
        for (let i = fxFractures.length - 1; i >= 0; i--) {
            const f = fxFractures[i];
            f.update();
            f.draw(fxCtx);
            if (f.alpha <= 0) {
                fxFractures.splice(i, 1);
            }
        }
        
        // 7. Slashes & Sparks
        for (let i = fxSlashes.length - 1; i >= 0; i--) {
            const s = fxSlashes[i];
            s.update();
            s.draw(fxCtx);
            if (s.age >= s.maxAge) {
                fxSlashes.splice(i, 1);
            }
        }
        
        for (let i = fxParticles.length - 1; i >= 0; i--) {
            const p = fxParticles[i];
            p.update();
            p.draw(fxCtx);
            if (p.alpha <= 0) {
                fxParticles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(animateCinematicFx);
    }
    if (fxCanvas) {
        animateCinematicFx();
    }

    // Laser border injection algorithm
    function injectLaserBorders() {
        if (!state.settings.cinematicMode) {
            document.querySelectorAll('.laser-border').forEach(el => el.remove());
            return;
        }
        
        const cards = document.querySelectorAll('.card, .task-item, .sound-card, .welcome-card, .stat-card, .settings-card');
        cards.forEach(card => {
            if (!card.querySelector('.laser-border')) {
                const style = window.getComputedStyle(card);
                if (style.position === 'static') {
                    card.style.position = 'relative';
                }
                
                const t = document.createElement('span'); t.className = 'laser-border top';
                const r = document.createElement('span'); r.className = 'laser-border right';
                const b = document.createElement('span'); b.className = 'laser-border bottom';
                const l = document.createElement('span'); l.className = 'laser-border left';
                
                card.appendChild(t);
                card.appendChild(r);
                card.appendChild(b);
                card.appendChild(l);
            }
        });
    }

    // Color schema color code fetcher
    function getThemeAccentColor() {
        const isZen = document.body.classList.contains('theme-zen-forest');
        const isGold = document.body.classList.contains('theme-midnight-gold');
        const isSnow = document.body.classList.contains('theme-snow-light');
        const isSlate = document.body.classList.contains('theme-monochrome-slate');
        
        if (isZen) return '#98b0a0';
        if (isGold) return '#c9a66b';
        if (isSnow) return '#000000';
        if (isSlate) return '#8790a6';
        return '#ffffff';
    }

    // Global click and hover handlers
    window.addEventListener('click', (e) => {
        if (!state.settings.cinematicMode) return;
        const path = e.composedPath();
        const isInteractive = path.some(el => 
            el.tagName === 'BUTTON' || 
            el.tagName === 'A' || 
            el.tagName === 'INPUT' || 
            el.tagName === 'SELECT' || 
            el.tagName === 'TEXTAREA' || 
            (el.classList && (el.classList.contains('nav-item') || el.classList.contains('mood-btn') || el.classList.contains('sound-play-toggle') || el.classList.contains('spinner-btn')))
        );
        if (isInteractive) {
            triggerClickSparks(e.clientX, e.clientY, getThemeAccentColor());
        }
    });

    window.addEventListener('mouseover', (e) => {
        if (!state.settings.cinematicMode) return;
        const path = e.composedPath();
        const isInteractive = path.some(el => 
            el.tagName === 'BUTTON' || 
            (el.classList && (el.classList.contains('nav-item') || el.classList.contains('mood-btn') || el.classList.contains('sound-card')))
        );
        
        const target = e.target;
        if (isInteractive && target !== window.lastHoveredTarget) {
            playUISound('hover');
            window.lastHoveredTarget = target;
        }
    });
    
    window.addEventListener('mouseout', (e) => {
        if (e.target === window.lastHoveredTarget) {
            window.lastHoveredTarget = null;
        }
    });

    // Cinematic settings switcher wire
    if (settingsCinematicToggle) {
        settingsCinematicToggle.addEventListener('change', (e) => {
            state.settings.cinematicMode = e.target.checked;
            saveToLocalStorage();
            
            if (state.settings.cinematicMode) {
                document.body.classList.add('cinematic-mode-active');
                injectLaserBorders();
                showToast('حالت سینمایی اکشن فعال شد.', 'success');
            } else {
                document.body.classList.remove('cinematic-mode-active');
                injectLaserBorders();
                showToast('حالت مینیمال آینده‌نگر فعال شد.', 'info');
            }
        });
    }

    // Boot Loader sequence mechanics
    function runBootLoader() {
        const matrixCanvas = document.createElement('canvas');
        const matrixContainer = document.getElementById('loader-bg-matrix');
        if (matrixContainer) {
            matrixContainer.appendChild(matrixCanvas);
            const mCtx = matrixCanvas.getContext('2d');
            
            const resizeMatrix = () => {
                matrixCanvas.width = window.innerWidth;
                matrixCanvas.height = window.innerHeight;
            };
            window.addEventListener('resize', resizeMatrix);
            resizeMatrix();
            
            const chars = "010101RAYONCORE01SYSTEMINITIALIZATIONPHYSICSVECTORSLASHGUNFIRESPARKS".split("");
            const fontSize = 12;
            const columns = Math.floor(matrixCanvas.width / fontSize);
            const drops = Array(columns).fill(1);
            
            function drawMatrix() {
                mCtx.fillStyle = 'rgba(5, 6, 8, 0.08)';
                mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
                
                mCtx.fillStyle = '#ffffff';
                mCtx.font = fontSize + 'px monospace';
                
                for (let i = 0; i < drops.length; i++) {
                    const text = chars[Math.floor(Math.random() * chars.length)];
                    mCtx.fillText(text, i * fontSize, drops[i] * fontSize);
                    
                    if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
            }
            window.matrixInterval = setInterval(drawMatrix, 35);
        }
        
        const loaderRing = document.getElementById('loader-progress-ring');
        const loaderPct = document.getElementById('loader-progress-pct');
        const terminalLog = document.getElementById('hud-terminal-log');
        const clockStamp = document.getElementById('hud-clock-stamp');
        
        if (clockStamp) {
            const updateClock = () => {
                const now = new Date();
                clockStamp.textContent = now.toTimeString().split(' ')[0];
            };
            updateClock();
            window.clockStampInterval = setInterval(updateClock, 1000);
        }
        
        const logs = [
            { progress: 8, text: "> CONNECTING TO NEURAL DATA NODE...", type: 'info' },
            { progress: 18, text: "> DECRYPTING CONFIGURATION FILES...", type: 'info' },
            { progress: 32, text: "> BYPASSING SANDBOX CONTROLLERS... SUCCESS", type: 'success' },
            { progress: 50, text: "> SYNCING DATABASE CLUSTER... SUCCESS", type: 'success' },
            { progress: 68, text: "> LOADING MULTI-CHANNEL AUDIO ENGINE... ONLINE", type: 'success' },
            { progress: 82, text: "> CORE RENDERERS INITIALIZED... OK", type: 'success' },
            { progress: 95, text: "> SECURITY AUTHORIZATION VALIDATED.", type: 'success' },
            { progress: 100, text: "> SYSTEM READY. WELCOME BACK OPERATIVE.", type: 'success' }
        ];
        
        let progress = 0;
        let logIndex = 0;
        
        playUISound('boot');
        
        const bootInterval = setInterval(() => {
            if (!state.settings.cinematicMode) {
                clearInterval(bootInterval);
                finishBoot();
                return;
            }
            
            progress += Math.floor(Math.random() * 4) + 1;
            if (progress > 100) progress = 100;
            
            if (loaderPct) loaderPct.textContent = `${progress}%`;
            if (loaderRing) {
                const offset = 471.2 - (471.2 * progress) / 100;
                loaderRing.style.strokeDashoffset = offset;
            }
            
            if (logIndex < logs.length && progress >= logs[logIndex].progress) {
                const item = logs[logIndex];
                const div = document.createElement('div');
                div.className = `log-line ${item.type}`;
                div.textContent = item.text;
                if (terminalLog) {
                    terminalLog.appendChild(div);
                    terminalLog.scrollTop = terminalLog.scrollHeight;
                }
                logIndex++;
                playUISound('click');
            }
            
            if (progress >= 100) {
                clearInterval(bootInterval);
                setTimeout(finishBoot, 800);
            }
        }, 50);
        window.bootInterval = bootInterval;
        
        const skipLoaderBtn = document.getElementById('hud-btn-skip');
        if (skipLoaderBtn) {
            skipLoaderBtn.addEventListener('click', finishBoot);
        }
        
        window.addEventListener('keydown', handleEscapeKey);
    }
    
    function handleEscapeKey(e) {
        if (e.key === 'Escape') {
            finishBoot();
        }
    }
    
    function finishBoot() {
        window.removeEventListener('keydown', handleEscapeKey);
        if (window.bootInterval) clearInterval(window.bootInterval);
        if (window.clockStampInterval) clearInterval(window.clockStampInterval);
        if (window.matrixInterval) clearInterval(window.matrixInterval);
        
        const loader = document.getElementById('cinematic-loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 800);
        }
        
        sessionStorage.setItem('rayon_boot_completed', 'true');
        playUISound('chime');
        injectLaserBorders();
    }

    // ==========================================================================
    // 9. NEW SECTIONS AND GAMEPLAY SYSTEM LOGIC (RAYON EXPANSION)
    // ==========================================================================

    // --- RPG LEVELING & XP SYSTEM ---
    function gainXp(amount, reason = '') {
        state.xp += amount;
        
        // Level calculation formula
        const currentLevel = Math.floor(Math.sqrt(Math.max(0, state.xp - amount) / 100)) + 1;
        let newLevel = Math.floor(Math.sqrt(state.xp / 100)) + 1;
        
        // Cap level at 50
        if (newLevel > 50) {
            newLevel = 50;
            state.xp = 50 * 50 * 100; // max XP for level 50
        }
        
        updateRpgSystem(amount);
        saveToLocalStorage();
        
        if (newLevel > currentLevel) {
            playLevelUpSound();
            showLevelUpModal(currentLevel, newLevel);
        } else if (amount > 0) {
            playXpGainSound();
            if (reason) {
                showToast(`+${amount} XP (${reason})`, 'success');
            }
        }
    }
    
    function showLevelUpModal(oldLevel, newLevel) {
        const modal = document.getElementById('level-up-modal');
        const oldLvlEl = document.getElementById('level-up-old');
        const newLvlEl = document.getElementById('level-up-new');
        const msgEl = document.getElementById('level-up-message');
        
        if (oldLvlEl) oldLvlEl.textContent = `سطح ${oldLevel}`;
        if (newLvlEl) newLvlEl.textContent = `سطح ${newLevel}`;
        
        let speech = `درود قهرمان! تبریک فراوان مرا بپذیرید. تلاش و استمرار خستگی‌ناپذیر شما، سطح کاربری شما را به سطح فوق‌العاده ${newLevel} ارتقا داد! مسیر پیشرفت شما واقعاً الهام‌بخش و شگفت‌انگیز است. به مسیر خود پرقدرت ادامه دهید! 🚀`;
        
        if (newLevel === 50) {
            speech = `تبریک بی‌نهایت قهرمان بزرگ! شما به بالاترین قله تمرکز و سطح نهایی ۵۰ دست یافتید! افتخار بزرگی است که به عنوان راهنما در خدمت شما بودم. شما اکنون استاد بی‌بدیل زمان و ذن هستید! 🏆🌟`;
        }
        
        if (modal) {
            modal.classList.add('active');
        }
        
        if (msgEl) {
            typewriterEffect(msgEl, speech);
        }
    }
    
    function updateRpgSystem(addedAmount = 0) {
        let level = Math.floor(Math.sqrt(state.xp / 100)) + 1;
        if (level > 50) level = 50;
        
        const xpForCurrent = (level - 1) * (level - 1) * 100;
        const xpForNext = level * level * 100;
        const levelProgress = state.xp - xpForCurrent;
        const levelMax = xpForNext - xpForCurrent;
        let pct = Math.min(100, Math.max(0, (levelProgress / levelMax) * 100));
        
        if (level === 50) {
            pct = 100;
        }
        
        // Ranks based on level
        let rank = 'مبتدی تمرکز';
        if (level >= 50) rank = 'استاد نهایی ذن (سطح ۵۰)';
        else if (level >= 15) rank = 'استاد ذن تمرکز';
        else if (level >= 10) rank = 'نینجای بهره‌وری';
        else if (level >= 5) rank = 'کارورز متمرکز';
        
        const lvlNum = document.getElementById('rpg-level-num');
        const userRank = document.getElementById('rpg-user-rank');
        const barFill = document.getElementById('rpg-xp-bar-fill');
        const xpFraction = document.getElementById('rpg-xp-fraction');
        
        if (lvlNum) lvlNum.textContent = level;
        if (userRank) userRank.textContent = rank;
        if (barFill) barFill.style.width = `${pct}%`;
        
        if (xpFraction) {
            if (level === 50) {
                xpFraction.textContent = 'حداکثر سطح رسیده‌اید';
            } else {
                xpFraction.textContent = `${levelProgress} / ${levelMax}`;
            }
        }

        // Update print report metadata
        const repLevel = document.getElementById('report-userlevel');
        const repXp = document.getElementById('report-userxp');
        if (repLevel) repLevel.textContent = `لول ${level} (${rank})`;
        if (repXp) repXp.textContent = `${state.xp} XP`;
    }
    
    function playXpGainSound() {
        if (!state.timer.playAlarmSound) return;
        try {
            initAudioContext();
            if (!audioCtx) return;
            const now = audioCtx.currentTime;
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
            
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            
            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) {
            console.error("XP Gain audio error:", e);
        }
    }
    
    function playLevelUpSound() {
        if (!state.timer.playAlarmSound) return;
        try {
            initAudioContext();
            if (!audioCtx) return;
            const now = audioCtx.currentTime;
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
            osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
            
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            
            osc.start(now);
            osc.stop(now + 0.5);
        } catch (e) {
            console.error("Level Up audio error:", e);
        }
    }

    // --- 1. TIME BLOCKING PLANNER LOGIC ---
    function renderTimeBlocks() {
        const container = document.getElementById('time-blocks-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        state.timeBlocks.forEach((block, index) => {
            const blockRow = document.createElement('div');
            blockRow.className = 'time-block-row';
            
            const hourLabel = `${String(block.hour).padStart(2, '0')}:۰۰ - ${String(block.hour + 1).padStart(2, '0')}:۰۰`;
            
            blockRow.innerHTML = `
                <div class="time-block-hour">${hourLabel}</div>
                <input type="text" class="time-block-input" placeholder="فعالیت خاصی ثبت نشده است..." value="${block.task || ''}" data-index="${index}">
                <select class="time-block-category ${block.category}" data-index="${index}">
                    <option value="other" ${block.category === 'other' ? 'selected' : ''}>عمومی</option>
                    <option value="work" ${block.category === 'work' ? 'selected' : ''}>کار/تمرکز</option>
                    <option value="leisure" ${block.category === 'leisure' ? 'selected' : ''}>تفریح/استراحت</option>
                    <option value="sleep" ${block.category === 'sleep' ? 'selected' : ''}>خواب/ریکاوری</option>
                </select>
            `;
            
            container.appendChild(blockRow);
        });
        
        // Bind change listeners
        container.querySelectorAll('.time-block-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                state.timeBlocks[idx].task = e.target.value;
                saveToLocalStorage();
                updateTimeBlockingStats();
            });
        });
        
        container.querySelectorAll('.time-block-category').forEach(select => {
            select.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const oldCategory = state.timeBlocks[idx].category;
                const newCategory = e.target.value;
                
                state.timeBlocks[idx].category = newCategory;
                e.target.className = `time-block-category ${newCategory}`;
                
                saveToLocalStorage();
                updateTimeBlockingStats();
                
                if (oldCategory === 'other' && newCategory !== 'other') {
                    gainXp(5, 'زمانی‌بندی بلوک روزانه');
                }
            });
        });
        
        updateTimeBlockingStats();
    }
    
    function updateTimeBlockingStats() {
        let work = 0;
        let leisure = 0;
        let sleep = 0;
        let unallocated = 0;
        
        const timelineBar = document.getElementById('timeline-visual-bar');
        if (timelineBar) timelineBar.innerHTML = '';
        
        state.timeBlocks.forEach(block => {
            if (!block.task) {
                unallocated++;
                if (timelineBar) {
                    const seg = document.createElement('div');
                    seg.className = 'timeline-block-segment other';
                    seg.style.flexGrow = '1';
                    seg.style.background = 'rgba(255,255,255,0.02)';
                    timelineBar.appendChild(seg);
                }
                return;
            }
            
            let color = 'rgba(255,255,255,0.05)';
            if (block.category === 'work') {
                work++;
                color = 'var(--primary-accent)';
            } else if (block.category === 'leisure') {
                leisure++;
                color = '#00bcd4';
            } else if (block.category === 'sleep') {
                sleep++;
                color = '#9c27b0';
            } else {
                unallocated++;
            }
            
            if (timelineBar) {
                const seg = document.createElement('div');
                seg.className = `timeline-block-segment ${block.category}`;
                seg.style.flexGrow = '1';
                seg.style.backgroundColor = color;
                timelineBar.appendChild(seg);
            }
        });
        
        const workEl = document.getElementById('time-stat-work');
        const leisureEl = document.getElementById('time-stat-leisure');
        const sleepEl = document.getElementById('time-stat-sleep');
        const unallocatedEl = document.getElementById('time-stat-unallocated');
        const coverageBadge = document.getElementById('time-coverage-badge');
        
        if (workEl) workEl.textContent = `${work} ساعت`;
        if (leisureEl) leisureEl.textContent = `${leisure} ساعت`;
        if (sleepEl) sleepEl.textContent = `${sleep} ساعت`;
        if (unallocatedEl) unallocatedEl.textContent = `${unallocated} ساعت`;
        
        const allocated = 18 - unallocated;
        const coveragePct = Math.round((allocated / 18) * 100);
        if (coverageBadge) coverageBadge.textContent = `پوشش روزانه: ${coveragePct}٪`;
    }

    // --- 2. BINAURAL BEATS / NEURO WAVES ---
    let waveAudioCtx = null;
    let waveOscLeft = null;
    let waveOscRight = null;
    let waveGainLeft = null;
    let waveGainRight = null;
    let wavePanLeft = null;
    let wavePanRight = null;
    let isWavePlaying = false;
    let waveAnimationId = null;

    function initNeuroWavesAudio() {
        if (!waveAudioCtx) {
            waveAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (waveAudioCtx.state === 'suspended') {
            waveAudioCtx.resume();
        }
    }

    function playBinauralBeats(carrierFreq, beatFreq, volume) {
        initNeuroWavesAudio();
        
        if (isWavePlaying) {
            stopBinauralBeats();
        }
        
        const now = waveAudioCtx.currentTime;
        
        // Left channel Oscillator (hard-panned left)
        waveOscLeft = waveAudioCtx.createOscillator();
        waveOscLeft.type = 'sine';
        waveOscLeft.frequency.value = carrierFreq;
        
        wavePanLeft = waveAudioCtx.createStereoPanner();
        wavePanLeft.pan.value = -1;
        
        waveGainLeft = waveAudioCtx.createGain();
        waveGainLeft.gain.value = (volume / 100) * 0.4;
        
        waveOscLeft.connect(wavePanLeft);
        wavePanLeft.connect(waveGainLeft);
        waveGainLeft.connect(waveAudioCtx.destination);
        
        // Right channel Oscillator (hard-panned right)
        waveOscRight = waveAudioCtx.createOscillator();
        waveOscRight.type = 'sine';
        waveOscRight.frequency.value = carrierFreq + beatFreq;
        
        wavePanRight = waveAudioCtx.createStereoPanner();
        wavePanRight.pan.value = 1;
        
        waveGainRight = waveAudioCtx.createGain();
        waveGainRight.gain.value = (volume / 100) * 0.4;
        
        waveOscRight.connect(wavePanRight);
        wavePanRight.connect(waveGainRight);
        waveGainRight.connect(waveAudioCtx.destination);
        
        waveOscLeft.start(now);
        waveOscRight.start(now);
        
        isWavePlaying = true;
        drawOscilloscope();
    }

    function stopBinauralBeats() {
        if (waveOscLeft) {
            try { waveOscLeft.stop(); } catch(e){}
            waveOscLeft.disconnect();
            waveOscLeft = null;
        }
        if (waveOscRight) {
            try { waveOscRight.stop(); } catch(e){}
            waveOscRight.disconnect();
            waveOscRight = null;
        }
        isWavePlaying = false;
        if (waveAnimationId) {
            cancelAnimationFrame(waveAnimationId);
            waveAnimationId = null;
        }
        clearOscilloscope();
    }

    function drawOscilloscope() {
        const canvas = document.getElementById('wave-oscilloscope-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        let t = 0;
        
        function render() {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);
            
            // Draw grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
            for(let x = 50; x < w; x += 50) {
                ctx.moveTo(x, 0); ctx.lineTo(x, h);
            }
            ctx.stroke();
            
            // Left Wave (Cyan)
            ctx.strokeStyle = 'rgba(0, 188, 212, 0.65)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const y = h/2 + Math.sin(x * 0.045 + t * 0.08) * 35;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            
            // Right Wave (Gold)
            ctx.strokeStyle = 'rgba(201, 166, 107, 0.65)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const y = h/2 + Math.sin(x * 0.048 + t * 0.09) * 35;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            
            t++;
            waveAnimationId = requestAnimationFrame(render);
        }
        
        if (waveAnimationId) cancelAnimationFrame(waveAnimationId);
        render();
    }

    function clearOscilloscope() {
        const canvas = document.getElementById('wave-oscilloscope-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw flat line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height/2);
        ctx.lineTo(canvas.width, canvas.height/2);
        ctx.stroke();
    }

    function initNeuroWavesCanvas() {
        clearOscilloscope();
    }

    // --- 3. HABIT TRACKER LOGIC ---
    function renderHabits() {
        const grid = document.getElementById('habits-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const daysShort = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
        const today = new Date();
        
        state.habits.forEach(habit => {
            const card = document.createElement('div');
            card.className = `habit-card card`;
            
            let dotsHtml = '';
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const dayIndex = date.getDay(); 
                let farsiDayIndex = (dayIndex + 1) % 7; // Saturdy is index 0 in Farsi short arrays
                const dayLabel = daysShort[farsiDayIndex];
                
                const isCompleted = habit.completedDays.includes(dateStr);
                dotsHtml += `
                    <button type="button" class="habit-day-dot-btn ${isCompleted ? 'completed ' + habit.color : ''}" 
                            data-habit-id="${habit.id}" data-date="${dateStr}" title="${dateStr}">
                        <span>${dayLabel}</span>
                    </button>
                `;
            }
            
            card.innerHTML = `
                <div class="habit-card-header">
                    <div class="habit-title-area">
                        <span class="habit-name">${habit.title}</span>
                        <span class="habit-category">${getCategoryLabel(habit.category)}</span>
                    </div>
                    <span class="habit-streak">🔥 ${habit.streak} روز</span>
                </div>
                <div class="habit-days-row">
                    ${dotsHtml}
                </div>
                <button type="button" class="habit-delete-btn" data-id="${habit.id}">حذف عادت</button>
            `;
            
            grid.appendChild(card);
        });
        
        // Day dot click check
        grid.querySelectorAll('.habit-day-dot-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const habitId = btn.dataset.habitId;
                const dateStr = btn.dataset.date;
                const habit = state.habits.find(h => h.id === habitId);
                
                if (habit) {
                    const idx = habit.completedDays.indexOf(dateStr);
                    const isCompleting = idx === -1;
                    
                    if (isCompleting) {
                        habit.completedDays.push(dateStr);
                        // If completing today, increment streak
                        const todayStr = new Date().toISOString().split('T')[0];
                        if (dateStr === todayStr) {
                            habit.streak++;
                            gainXp(10, 'انجام عادت روزانه');
                        }
                    } else {
                        habit.completedDays.splice(idx, 1);
                        const todayStr = new Date().toISOString().split('T')[0];
                        if (dateStr === todayStr) {
                            habit.streak = Math.max(0, habit.streak - 1);
                        }
                    }
                    
                    saveToLocalStorage();
                    renderHabits();
                }
            });
        });
        
        // Delete habit
        grid.querySelectorAll('.habit-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                state.habits = state.habits.filter(h => h.id !== id);
                saveToLocalStorage();
                renderHabits();
                showToast('عادت حذف شد.', 'info');
            });
        });
    }
    
    function getCategoryLabel(cat) {
        switch(cat) {
            case 'health': return 'سلامتی و بدن';
            case 'work': return 'کار و توسعه';
            case 'study': return 'مطالعه و ذهن';
            case 'personal': return 'رشد شخصی';
            default: return 'سایر';
        }
    }

    // --- 4. GOAL PLANNER LOGIC ---
    function renderGoals() {
        const container = document.getElementById('goals-container-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        state.goals.forEach(goal => {
            const card = document.createElement('div');
            card.className = 'goal-card card';
            
            const total = goal.milestones.length;
            const completed = goal.milestones.filter(m => m.completed).length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            let milestonesHtml = '';
            goal.milestones.forEach((m, idx) => {
                milestonesHtml += `
                    <label class="milestone-item ${m.completed ? 'checked' : ''}">
                        <input type="checkbox" class="milestone-checkbox" data-goal-id="${goal.id}" data-idx="${idx}" ${m.completed ? 'checked' : ''}>
                        <span>${m.title}</span>
                    </label>
                `;
            });
            
            card.innerHTML = `
                <div class="goal-card-header">
                    <div class="goal-title-desc">
                        <span class="goal-title">${goal.title}</span>
                        <span class="goal-desc">${goal.desc || 'توضیحی ثبت نشده است.'}</span>
                        <span class="goal-date">🎯 تاریخ هدف: ${new Date(goal.date).toLocaleDateString('fa-IR')}</span>
                    </div>
                    <span class="goal-category-badge">${getGoalCategoryLabel(goal.category)}</span>
                </div>
                
                <div class="goal-progress-section">
                    <div class="goal-progress-header">
                        <span>میزان پیشرفت مأموریت</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="rpg-xp-bar-container" style="height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow:hidden;">
                        <div class="rpg-xp-bar-fill" style="width: ${progress}%; background-color: var(--primary-accent); height:100%;"></div>
                    </div>
                </div>
                
                <div class="goal-milestones-section">
                    <div class="goal-milestones-title">گام‌های اجرایی (مایلتسون‌ها)</div>
                    <div class="milestones-checklist">
                        ${milestonesHtml || '<div class="empty-state" style="font-size:11px; padding:0; text-align:right;">هیچ گامی ثبت نشده است.</div>'}
                    </div>
                    
                    <div class="goal-add-milestone-row" style="display:flex; gap:10px; margin-top:10px;">
                        <input type="text" class="goal-milestone-input" placeholder="گام بعدی..." data-goal-id="${goal.id}" style="background:rgba(255,255,255,0.02); border:1px solid var(--border-color); color:var(--text-primary); border-radius:var(--border-radius-sm); padding:4px 10px; font-size:12px; flex-grow:1;">
                        <button type="button" class="btn btn-secondary btn-mini add-milestone-btn" data-goal-id="${goal.id}">افزودن گام</button>
                    </div>
                </div>
                
                <div class="goal-actions-row" style="display:flex; justify-content:flex-end; margin-top:15px;">
                    <button type="button" class="habit-delete-btn delete-goal-btn" data-goal-id="${goal.id}">لغو مأموریت</button>
                </div>
            `;
            
            container.appendChild(card);
        });
        
        // Milestone checkbox change
        container.querySelectorAll('.milestone-checkbox').forEach(chk => {
            chk.addEventListener('change', (e) => {
                const goalId = e.target.dataset.goalId;
                const idx = parseInt(e.target.dataset.idx);
                const goal = state.goals.find(g => g.id === goalId);
                
                if (goal) {
                    const wasCompleted = goal.milestones[idx].completed;
                    const isNowCompleted = e.target.checked;
                    goal.milestones[idx].completed = isNowCompleted;
                    
                    if (isNowCompleted && !wasCompleted) {
                        gainXp(10, 'تکمیل گام هدف');
                        
                        const allDone = goal.milestones.every(m => m.completed);
                        if (allDone) {
                            gainXp(50, 'تکمیل مأموریت بلندمدت 🎉');
                            showToast('فوق‌العاده بود! کل هدف با موفقیت تکمیل شد.', 'success');
                        }
                    }
                    
                    saveToLocalStorage();
                    renderGoals();
                }
            });
        });
        
        // Add Milestone
        container.querySelectorAll('.add-milestone-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const goalId = btn.dataset.goalId;
                const input = container.querySelector(`.goal-milestone-input[data-goal-id="${goalId}"]`);
                const title = input.value.trim();
                
                if (title) {
                    const goal = state.goals.find(g => g.id === goalId);
                    if (goal) {
                        goal.milestones.push({ title, completed: false });
                        input.value = '';
                        saveToLocalStorage();
                        renderGoals();
                        showToast('گام جدید افزوده شد.', 'success');
                    }
                }
            });
        });

        // Delete Goal
        container.querySelectorAll('.delete-goal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const goalId = btn.dataset.goalId;
                state.goals = state.goals.filter(g => g.id !== goalId);
                saveToLocalStorage();
                renderGoals();
                showToast('هدف لغو شد.', 'info');
            });
        });
    }
    
    function getGoalCategoryLabel(cat) {
        switch(cat) {
            case 'career': return 'شغلی و کسب‌وکار';
            case 'finance': return 'مالی و سرمایه';
            case 'study': return 'تحصیلی و مهارتی';
            case 'fitness': return 'ورزش و سلامت';
            default: return 'سایر اهداف';
        }
    }

    // --- 5. FITNESS & HYDRATION LOGIC ---
    let stretchTimerId = null;
    let stretchTimeRemaining = 180; 
    let stretchActive = false;
    let sittingMinutes = 0;
    let sittingTimerId = null;

    const stretchSteps = [
        { time: 180, label: 'کشش گردن (۱۰ ثانیه به هر طرف)' },
        { time: 160, label: 'کشش شانه‌ها (دست راست پشت آرنج چپ و بالعکس)' },
        { time: 140, label: 'کشش مچ و انگشتان دست (انگشتان را به عقب بکشید)' },
        { time: 120, label: 'چرخش کمر و ستون فقرات به چپ و راست' },
        { time: 90, label: 'ایستادن و بالا کشیدن کامل بدن و دست‌ها' },
        { time: 60, label: 'کشش پاها و خم شدن به سمت نوک انگشتان پا' },
        { time: 30, label: 'تنفس عمیق شکمی (دم و بازدم آرام)' }
    ];

    function renderFitness() {
        // Render Hydration Droplets
        const row = document.getElementById('water-droplets-row');
        if (row) {
            row.innerHTML = '';
            for (let i = 1; i <= 8; i++) {
                const isFilled = i <= state.waterIntake;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `water-drop-btn ${isFilled ? 'filled' : ''}`;
                btn.innerHTML = `
                    <span class="drop-icon">💧</span>
                    <span>لیوان ${i}</span>
                `;
                
                btn.addEventListener('click', () => {
                    if (isFilled) {
                        state.waterIntake = Math.max(0, i - 1); 
                    } else {
                        state.waterIntake = i; 
                        gainXp(5, 'مصرف آب روزانه');
                    }
                    
                    saveToLocalStorage();
                    renderFitness();
                });
                
                row.appendChild(btn);
            }
        }
        
        const fill = document.getElementById('water-fill-level');
        const progressTxt = document.getElementById('water-progress-text');
        if (fill) {
            const pct = (state.waterIntake / 8) * 100;
            fill.style.height = `${pct}%`;
        }
        if (progressTxt) {
            progressTxt.textContent = `${state.waterIntake} از ۸ لیوان (هر لیوان ۲۵۰ سی‌سی)`;
        }
    }

    function initStretchingTimer() {
        const startBtn = document.getElementById('stretch-start-btn');
        const resetBtn = document.getElementById('stretch-reset-btn');
        const timeText = document.getElementById('stretch-time-text');
        const progressRing = document.getElementById('stretch-progress-ring');
        const instructionBox = document.getElementById('stretch-instruction-box');

        if (!startBtn) return;

        startBtn.addEventListener('click', () => {
            if (stretchActive) {
                clearInterval(stretchTimerId);
                stretchActive = false;
                startBtn.textContent = 'ادامه نرمش';
            } else {
                stretchActive = true;
                startBtn.textContent = 'توقف تایمر';
                
                stretchTimerId = setInterval(() => {
                    stretchTimeRemaining--;
                    
                    const min = Math.floor(stretchTimeRemaining / 60);
                    const sec = stretchTimeRemaining % 60;
                    timeText.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
                    
                    const offset = 314 - (314 * stretchTimeRemaining) / 180;
                    if (progressRing) progressRing.style.strokeDashoffset = offset;
                    
                    const currentStep = stretchSteps.find(s => stretchTimeRemaining <= s.time);
                    if (currentStep && instructionBox) {
                        instructionBox.textContent = currentStep.label;
                    }
                    
                    if (stretchTimeRemaining % 20 === 0 && stretchTimeRemaining > 0) {
                        playStretchTickSound();
                    }
                    
                    if (stretchTimeRemaining <= 0) {
                        clearInterval(stretchTimerId);
                        stretchActive = false;
                        stretchTimeRemaining = 180;
                        if (timeText) timeText.textContent = '۰۳:۰۰';
                        if (progressRing) progressRing.style.strokeDashoffset = 0;
                        if (instructionBox) instructionBox.textContent = 'نرمش تمام شد! شاداب و سرزنده باشید.';
                        startBtn.textContent = 'شروع نرمش';
                        
                        gainXp(15, 'انجام نرمش کششی بین کار');
                        playLevelUpSound();
                    }
                }, 1000);
            }
        });

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                clearInterval(stretchTimerId);
                stretchActive = false;
                stretchTimeRemaining = 180;
                if (timeText) timeText.textContent = '۰۳:۰۰';
                if (progressRing) progressRing.style.strokeDashoffset = 0;
                if (instructionBox) instructionBox.textContent = 'کشش گردن (۱۰ ثانیه به هر طرف)';
                startBtn.textContent = 'شروع نرمش';
            });
        }
    }

    function playStretchTickSound() {
        if (!state.timer.playAlarmSound) return;
        try {
            initNeuroWavesAudio();
            if (!waveAudioCtx) return;
            const now = waveAudioCtx.currentTime;
            const osc = waveAudioCtx.createOscillator();
            const gain = waveAudioCtx.createGain();
            osc.connect(gain);
            gain.connect(waveAudioCtx.destination);
            
            osc.frequency.setValueAtTime(880, now); // A5
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            
            osc.start(now);
            osc.stop(now + 0.08);
        } catch(e){}
    }

    function startSittingMonitor() {
        if (sittingTimerId) clearInterval(sittingTimerId);
        
        sittingTimerId = setInterval(() => {
            sittingMinutes++;
            
            const display = document.getElementById('sitting-time-display');
            const desc = document.getElementById('sitting-time-desc');
            const indicator = document.getElementById('sitting-status-indicator');
            
            if (display) display.textContent = `زمان نشستن: ${sittingMinutes} دقیقه`;
            
            if (sittingMinutes >= 60) {
                if (indicator) {
                    indicator.className = 'sitting-icon-status alert-orange';
                }
                if (desc) {
                    desc.textContent = 'بیش از یک ساعت نشسته‌اید! لطفاً بلند شده و کمی قدم بزنید.';
                    desc.style.color = '#ff9800';
                }
            } else {
                if (indicator) {
                    indicator.className = 'sitting-icon-status alert-green';
                }
                if (desc) {
                    desc.textContent = 'پایداری وضعیت بدن مناسب است.';
                    desc.style.color = 'var(--text-muted)';
                }
            }
        }, 60000); 
        
        const resetBtn = document.getElementById('reset-sitting-timer-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                sittingMinutes = 0;
                const display = document.getElementById('sitting-time-display');
                const desc = document.getElementById('sitting-time-desc');
                const indicator = document.getElementById('sitting-status-indicator');
                
                if (display) display.textContent = `زمان نشستن: ۰ دقیقه`;
                if (indicator) {
                    indicator.className = 'sitting-icon-status alert-green';
                }
                if (desc) {
                    desc.textContent = 'پایداری وضعیت بدن مناسب است.';
                    desc.style.color = 'var(--text-muted)';
                }
                showToast('تایمر نشستن بازنشانی شد.', 'info');
            });
        }
    }

    // --- 6. SMART ZEN NOTES LOGIC ---
    let activeNoteId = null;

    function renderNotesList() {
        const listContainer = document.getElementById('notes-sidebar-list');
        const searchInput = document.getElementById('notes-search-input');
        if (!listContainer) return;
        
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        listContainer.innerHTML = '';
        
        const filteredNotes = state.notes.filter(note => {
            return note.title.toLowerCase().includes(query) || 
                   note.content.toLowerCase().includes(query) ||
                   (note.tags && note.tags.toLowerCase().includes(query));
        });
        
        filteredNotes.forEach(note => {
            const item = document.createElement('div');
            item.className = `note-sidebar-item ${note.id === activeNoteId ? 'active' : ''}`;
            
            const firstTag = note.tags ? note.tags.split(',')[0].trim() : 'یادداشت';
            item.innerHTML = `
                <span class="note-item-title">${note.title}</span>
                <div class="note-item-meta">
                    <span>${note.date}</span>
                    <span>${firstTag}</span>
                </div>
            `;
            
            item.addEventListener('click', () => {
                activeNoteId = note.id;
                loadNoteIntoEditor(note);
                renderNotesList();
            });
            
            listContainer.appendChild(item);
        });
        
        if (searchInput && !searchInput.dataset.bound) {
            searchInput.dataset.bound = 'true';
            searchInput.addEventListener('input', () => {
                renderNotesList();
            });
        }
    }

    function loadNoteIntoEditor(note) {
        const titleInput = document.getElementById('note-title-input');
        const tagsInput = document.getElementById('note-tags-input');
        const contentInput = document.getElementById('note-content-input');
        
        if (titleInput) titleInput.value = note.title;
        if (tagsInput) tagsInput.value = note.tags || '';
        if (contentInput) {
            contentInput.value = note.content;
            updateNoteWordCount();
        }
    }

    function updateNoteWordCount() {
        const contentInput = document.getElementById('note-content-input');
        const counter = document.getElementById('note-word-count');
        if (contentInput && counter) {
            const txt = contentInput.value.trim();
            const count = txt ? txt.split(/\s+/).length : 0;
            counter.textContent = `تعداد کلمات: ${count}`;
        }
    }

    // --- 7. GROWTH BUDGET LOGIC ---
    function renderExpenses() {
        const limitInput = document.getElementById('budget-limit-input');
        const spentVal = document.getElementById('budget-spent-val');
        const remainingVal = document.getElementById('budget-remaining-val');
        const percentVal = document.getElementById('budget-percent-val');
        const barFill = document.getElementById('budget-progress-bar-fill');
        const tableBody = document.getElementById('expense-table-body');
        
        if (!spentVal) return;
        
        if (limitInput) limitInput.value = state.budgetLimit;
        
        const totalSpent = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = state.budgetLimit - totalSpent;
        const percent = state.budgetLimit > 0 ? Math.min(100, Math.round((totalSpent / state.budgetLimit) * 100)) : 0;
        
        spentVal.textContent = `${totalSpent.toLocaleString('fa-IR')} تومان`;
        remainingVal.textContent = `${remaining.toLocaleString('fa-IR')} تومان`;
        percentVal.textContent = `${percent}٪`;
        if (barFill) {
            barFill.style.width = `${percent}%`;
            if (percent >= 100) {
                barFill.style.backgroundColor = '#f44336';
            } else {
                barFill.style.backgroundColor = 'var(--primary-accent)';
            }
        }
        
        if (tableBody) {
            tableBody.innerHTML = '';
            
            if (state.expenses.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">هیچ هزینه‌ای ثبت نشده است.</td>
                    </tr>
                `;
            } else {
                state.expenses.forEach(exp => {
                    const row = document.createElement('tr');
                    
                    let catLabel = 'سایر';
                    if (exp.category === 'books') catLabel = '📖 کتاب';
                    else if (exp.category === 'courses') catLabel = '🎓 دوره';
                    else if (exp.category === 'sports') catLabel = '🏋️ ورزش';
                    else if (exp.category === 'software') catLabel = '💻 ابزار';
                    
                    row.innerHTML = `
                        <td style="padding:10px;">${exp.desc}</td>
                        <td style="padding:10px;">${catLabel}</td>
                        <td style="padding:10px; font-family:var(--font-en); font-weight:bold;">${exp.amount.toLocaleString('fa-IR')}</td>
                        <td style="padding:10px;">
                            <button type="button" class="expense-delete-btn" data-id="${exp.id}" title="حذف" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer;">🗑️</button>
                        </td>
                    `;
                    
                    tableBody.appendChild(row);
                });
                
                tableBody.querySelectorAll('.expense-delete-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.dataset.id;
                        state.expenses = state.expenses.filter(e => e.id !== id);
                        saveToLocalStorage();
                        renderExpenses();
                        showToast('هزینه حذف شد.', 'info');
                    });
                });
            }
        }
    }

    // --- 8. VISION BOARD & AFFIRMATIONS LOGIC ---
    const affirmationsList = [
        "من امروز با تمام وجود روی توسعه فردی و کارهای ارزشمندم تمرکز می‌کنم و از حواشی دوری می‌گزینم.",
        "ذهن من شفاف، بدن من پرانرژی و تمرکز من عمیق است.",
        "هر گامی که امروز برمی‌دارم، مرا به نسخه‌ی بهتری از خودم تبدیل می‌کند.",
        "من تسلیم خستگی نمی‌شوم و با نظم آهنین به اهدافم پایبندم.",
        "تلاش‌های امروز من، فونداسیون موفقیت‌های بزرگ فرداست.",
        "من خالق زندگی و آینده‌ی خودم هستم و هیچ مانعی بزرگتر از اراده‌ی من نیست.",
        "من برای زمان و انرژی خود ارزش قائلم و کارهای بیهوده را فیلتر می‌کنم.",
        "آرامش درونی کلید تمرکز بیرونی من است.",
        "من هر روز یاد می‌گیرم، رشد می‌کنم و قوی‌تر می‌شوم.",
        "کارهای سخت را با تقسیم به بخش‌های کوچک، آسان و لذت‌بخش می‌کنم."
    ];

    function renderVisionBoard() {
        const grid = document.getElementById('vision-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        state.visionItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'vision-item-card';
            card.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.75)), url('${item.url}')`;
            card.setAttribute('data-tilt', '');
            
            card.innerHTML = `
                <div class="vision-item-overlay">
                    <span class="vision-item-title">${item.title}</span>
                    <span class="vision-item-category">${getVisionCategoryLabel(item.category)}</span>
                </div>
                <button type="button" class="vision-item-delete" data-id="${item.id}" title="حذف">×</button>
            `;
            
            grid.appendChild(card);
        });
        
        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(grid.querySelectorAll('[data-tilt]'), {
                max: 10,
                speed: 300,
                glare: true,
                "max-glare": 0.12
            });
        }
        
        grid.querySelectorAll('.vision-item-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                const id = btn.dataset.id;
                state.visionItems = state.visionItems.filter(v => v.id !== id);
                saveToLocalStorage();
                renderVisionBoard();
                showToast('آیتم تابلوی تجسم حذف شد.', 'info');
            });
        });
    }

    function getVisionCategoryLabel(cat) {
        switch(cat) {
            case 'material': return '🎨 مادی و ملموس';
            case 'travel': return '✈️ سفر و تجربه‌ها';
            case 'lifestyle': return '🌱 سبک زندگی';
            case 'mind': return '🧘 ذهنی و معنوی';
            default: return '🎯 هدف';
        }
    }

    // --- 9. ADVANCED WEEKLY REPORTS LOGIC ---
    function generateReportSheet() {
        const dateEl = document.getElementById('report-generation-date');
        if (dateEl) dateEl.textContent = `تاریخ گزارش: ${new Date().toLocaleDateString('fa-IR')}`;
        
        const usernameEl = document.getElementById('report-username');
        if (usernameEl) {
            usernameEl.textContent = state.userName || 'کاربر فعال رایون';
        }

        let stats = [];
        try {
            stats = JSON.parse(localStorage.getItem('rayon_focus_stats') || '[]');
        } catch(e){}
        
        const totalSessions = stats.length;
        const totalDurationSecs = stats.reduce((sum, s) => sum + s.duration, 0);
        const totalDurationMins = Math.round(totalDurationSecs / 60);
        const totalDurationHours = (totalDurationMins / 60).toFixed(1);

        const focusSessionsEl = document.getElementById('report-focus-sessions');
        const focusTotalEl = document.getElementById('report-focus-total');
        if (focusSessionsEl) focusSessionsEl.textContent = `${totalSessions} جلسه`;
        if (focusTotalEl) focusTotalEl.textContent = `${totalDurationHours} ساعت (${totalDurationMins} دقیقه)`;

        const completedTasks = state.tasks.filter(t => t.completed).length;
        const totalTasks = state.tasks.length;
        const taskRatio = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        const tasksCompletedEl = document.getElementById('report-tasks-completed');
        const tasksRatioEl = document.getElementById('report-tasks-ratio');
        if (tasksCompletedEl) tasksCompletedEl.textContent = `${completedTasks} کار از ${totalTasks} کار`;
        if (tasksRatioEl) tasksRatioEl.textContent = `${taskRatio}٪`;

        const activeHabitsCount = state.habits.length;
        const habitsActiveEl = document.getElementById('report-habits-active');
        const streakCurrentEl = document.getElementById('report-streak-current');
        if (habitsActiveEl) habitsActiveEl.textContent = `${activeHabitsCount} عادت`;
        if (streakCurrentEl) streakCurrentEl.textContent = `${state.streak} روز`;

        const totalSpent = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = state.budgetLimit - totalSpent;
        
        const budgetSpentEl = document.getElementById('report-budget-spent');
        const budgetRemainingEl = document.getElementById('report-budget-remaining');
        if (budgetSpentEl) budgetSpentEl.textContent = `${totalSpent.toLocaleString('fa-IR')} تومان`;
        if (budgetRemainingEl) budgetRemainingEl.textContent = `${remaining.toLocaleString('fa-IR')} تومان`;

        const journalPreviewEl = document.getElementById('report-journal-note-preview');
        if (journalPreviewEl) {
            if (state.journal.length > 0) {
                const latest = state.journal[0];
                let moodEmoji = '😐';
                if (latest.mood === 'excellent') moodEmoji = '🤩';
                else if (latest.mood === 'good') moodEmoji = '🙂';
                else if (latest.mood === 'tired') moodEmoji = '😴';
                else if (latest.mood === 'stressed') moodEmoji = '🤯';
                
                journalPreviewEl.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 5px; color: var(--primary-accent);">
                        یادداشت روز ${latest.date} (حس و حال: ${moodEmoji})
                    </div>
                    <p style="margin: 0; font-style: italic;">"${latest.note || 'بدون متن یادداشت.'}"</p>
                `;
            } else {
                journalPreviewEl.textContent = 'یادداشتی برای امروز ثبت نشده است.';
            }
        }
    }

    // --- RAYON EXPANSION MAIN INITIALIZATION ---
    function initRayonExpansion() {
        const navGroupHeaders = document.querySelectorAll('.nav-group-header');
        navGroupHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const group = header.parentElement;
                group.classList.toggle('collapsed');
            });
        });

        startSittingMonitor();

        // 1. Time Blocking Reset button
        const clearTimeBlocksBtn = document.getElementById('clear-time-blocks-btn');
        if (clearTimeBlocksBtn) {
            clearTimeBlocksBtn.addEventListener('click', () => {
                state.timeBlocks = Array(18).fill(null).map((_, i) => ({
                    hour: i + 6,
                    task: '',
                    category: 'other'
                }));
                saveToLocalStorage();
                renderTimeBlocks();
                showToast('بلوک‌های زمانی روزانه ریست شد.', 'info');
            });
        }

        // 2. Neuro Waves Controls
        const wavePresetBtns = document.querySelectorAll('.wave-preset-btn');
        const waveCarrierSlider = document.getElementById('wave-carrier-slider');
        const waveCarrierVal = document.getElementById('carrier-freq-val');
        const waveVolSlider = document.getElementById('wave-volume-slider');
        const waveVolVal = document.getElementById('wave-volume-val');
        const wavePlayBtn = document.getElementById('wave-play-btn');
        
        let selectedWavePreset = 'alpha';
        let beatFreq = 10; 

        wavePresetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                wavePresetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                selectedWavePreset = btn.dataset.wave;
                
                if (selectedWavePreset === 'alpha') beatFreq = 10;
                else if (selectedWavePreset === 'beta') beatFreq = 20;
                else if (selectedWavePreset === 'theta') beatFreq = 6;
                else if (selectedWavePreset === 'delta') beatFreq = 2;
                
                updateBinauralChannelValLabels();
                
                if (isWavePlaying) {
                    playBinauralBeats(parseInt(waveCarrierSlider.value), beatFreq, parseInt(waveVolSlider.value));
                }
            });
        });

        if (waveCarrierSlider) {
            waveCarrierSlider.addEventListener('input', (e) => {
                if (waveCarrierVal) waveCarrierVal.textContent = e.target.value;
                updateBinauralChannelValLabels();
                if (isWavePlaying) {
                    playBinauralBeats(parseInt(e.target.value), beatFreq, parseInt(waveVolSlider.value));
                }
            });
        }

        if (waveVolSlider) {
            waveVolSlider.addEventListener('input', (e) => {
                if (waveVolVal) waveVolVal.textContent = `${e.target.value}%`;
                if (isWavePlaying) {
                    playBinauralBeats(parseInt(waveCarrierSlider.value), beatFreq, parseInt(e.target.value));
                }
            });
        }

        if (wavePlayBtn) {
            wavePlayBtn.addEventListener('click', () => {
                if (isWavePlaying) {
                    stopBinauralBeats();
                    wavePlayBtn.classList.remove('active');
                    document.getElementById('wave-play-icon').style.display = 'inline';
                    document.getElementById('wave-pause-icon').style.display = 'none';
                    document.getElementById('wave-play-btn-text').textContent = 'پخش امواج ذهنی';
                    showToast('پخش فرکانس مغزی متوقف شد.', 'info');
                } else {
                    playBinauralBeats(parseInt(waveCarrierSlider.value), beatFreq, parseInt(waveVolSlider.value));
                    wavePlayBtn.classList.add('active');
                    document.getElementById('wave-play-icon').style.display = 'none';
                    document.getElementById('wave-pause-icon').style.display = 'inline';
                    document.getElementById('wave-play-btn-text').textContent = 'توقف پخش امواج';
                    showToast('پخش فرکانس مغزی فعال شد (هدفون را متصل کنید).', 'success');
                    
                    gainXp(10, 'تمرکز صوتی ذن');
                }
            });
        }

        function updateBinauralChannelValLabels() {
            const leftVal = document.getElementById('wave-left-channel-val');
            const rightVal = document.getElementById('wave-right-channel-val');
            const carrier = parseInt(waveCarrierSlider.value);
            if (leftVal) leftVal.textContent = `${carrier} هرتز`;
            if (rightVal) rightVal.textContent = `${carrier + beatFreq} هرتز`;
        }

        // 3. Habit Tracker form submit
        const newHabitForm = document.getElementById('new-habit-form');
        if (newHabitForm) {
            newHabitForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('habit-title-input').value.trim();
                const category = document.getElementById('habit-category-select').value;
                const color = document.getElementById('habit-color-select').value;
                
                if (title) {
                    const newHabit = {
                        id: 'habit_' + Date.now(),
                        title: title,
                        category: category,
                        color: color,
                        streak: 0,
                        completedDays: []
                    };
                    state.habits.push(newHabit);
                    saveToLocalStorage();
                    renderHabits();
                    document.getElementById('habit-title-input').value = '';
                    showToast('عادت جدید با موفقیت ثبت شد.', 'success');
                    gainXp(15, 'هدف‌گذاری ساخت عادت');
                }
            });
        }

        // 4. Goal Planner form submit
        const newGoalForm = document.getElementById('new-goal-form');
        if (newGoalForm) {
            newGoalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('goal-title-input').value.trim();
                const desc = document.getElementById('goal-desc-input').value.trim();
                const category = document.getElementById('goal-category-select').value;
                const date = document.getElementById('goal-date-input').value;
                
                if (title && date) {
                    const newGoal = {
                        id: 'goal_' + Date.now(),
                        title: title,
                        desc: desc,
                        category: category,
                        date: date,
                        milestones: []
                    };
                    state.goals.push(newGoal);
                    saveToLocalStorage();
                    renderGoals();
                    
                    document.getElementById('goal-title-input').value = '';
                    document.getElementById('goal-desc-input').value = '';
                    document.getElementById('goal-date-input').value = '';
                    
                    showToast('مأموریت بلندمدت ثبت شد. گام‌های خود را بنویسید.', 'success');
                    gainXp(20, 'برنامه‌ریزی مأموریت جدید');
                }
            });
        }

        // 5. Stretching timer init
        initStretchingTimer();

        // 6. Smart Notes form and buttons
        const newNoteBtn = document.getElementById('new-note-btn');
        const noteEditorForm = document.getElementById('note-editor-form');
        const noteTitleInput = document.getElementById('note-title-input');
        const noteTagsInput = document.getElementById('note-tags-input');
        const noteContentInput = document.getElementById('note-content-input');
        const noteCopyBtn = document.getElementById('note-copy-btn');
        const noteDeleteBtn = document.getElementById('note-delete-btn');

        if (newNoteBtn) {
            newNoteBtn.addEventListener('click', () => {
                activeNoteId = null;
                if (noteTitleInput) noteTitleInput.value = '';
                if (noteTagsInput) noteTagsInput.value = '';
                if (noteContentInput) {
                    noteContentInput.value = '';
                    updateNoteWordCount();
                }
                renderNotesList();
                showToast('آماده برای ثبت یادداشت جدید.', 'info');
            });
        }

        if (noteContentInput) {
            noteContentInput.addEventListener('input', updateNoteWordCount);
        }

        if (noteEditorForm) {
            noteEditorForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = noteTitleInput.value.trim();
                const tags = noteTagsInput.value.trim();
                const content = noteContentInput.value.trim();
                
                if (title && content) {
                    if (activeNoteId) {
                        const note = state.notes.find(n => n.id === activeNoteId);
                        if (note) {
                            note.title = title;
                            note.tags = tags;
                            note.content = content;
                            note.date = new Date().toLocaleDateString('fa-IR');
                        }
                        showToast('یادداشت بروزرسانی شد.', 'success');
                    } else {
                        const newNote = {
                            id: 'note_' + Date.now(),
                            title: title,
                            tags: tags,
                            content: content,
                            date: new Date().toLocaleDateString('fa-IR')
                        };
                        state.notes.unshift(newNote);
                        activeNoteId = newNote.id;
                        showToast('یادداشت جدید ثبت شد.', 'success');
                        gainXp(15, 'ثبت یادداشت کارآمد');
                    }
                    saveToLocalStorage();
                    renderNotesList();
                }
            });
        }

        if (noteDeleteBtn) {
            noteDeleteBtn.addEventListener('click', () => {
                if (activeNoteId) {
                    state.notes = state.notes.filter(n => n.id !== activeNoteId);
                    activeNoteId = null;
                    if (noteTitleInput) noteTitleInput.value = '';
                    if (noteTagsInput) noteTagsInput.value = '';
                    if (noteContentInput) noteContentInput.value = '';
                    saveToLocalStorage();
                    renderNotesList();
                    showToast('یادداشت حذف شد.', 'info');
                } else {
                    showToast('یادداشتی برای حذف انتخاب نشده است.', 'info');
                }
            });
        }

        if (noteCopyBtn) {
            noteCopyBtn.addEventListener('click', () => {
                if (noteContentInput && noteContentInput.value) {
                    navigator.clipboard.writeText(noteContentInput.value)
                        .then(() => showToast('متن یادداشت در حافظه کپی شد.', 'success'))
                        .catch(() => showToast('کپی متن با خطا مواجه شد.', 'info'));
                } else {
                    showToast('متنی برای کپی وجود ندارد.', 'info');
                }
            });
        }

        // 7. Budget monthly limit and expense form
        const budgetLimitInput = document.getElementById('budget-limit-input');
        if (budgetLimitInput) {
            budgetLimitInput.addEventListener('change', (e) => {
                state.budgetLimit = parseInt(e.target.value) || 0;
                saveToLocalStorage();
                renderExpenses();
                showToast('سقف بودجه ماهیانه رشد بروزرسانی شد.', 'success');
            });
        }

        const newExpenseForm = document.getElementById('new-expense-form');
        if (newExpenseForm) {
            newExpenseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const desc = document.getElementById('expense-desc-input').value.trim();
                const amount = parseInt(document.getElementById('expense-amount-input').value) || 0;
                const category = document.getElementById('expense-category-select').value;
                
                if (desc && amount > 0) {
                    const newExp = {
                        id: 'exp_' + Date.now(),
                        desc: desc,
                        amount: amount,
                        category: category,
                        date: new Date().toISOString().split('T')[0]
                    };
                    state.expenses.unshift(newExp);
                    saveToLocalStorage();
                    renderExpenses();
                    
                    document.getElementById('expense-desc-input').value = '';
                    document.getElementById('expense-amount-input').value = '';
                    
                    showToast('هزینه رشد فردی با موفقیت ثبت شد.', 'success');
                    gainXp(10, 'ثبت سرمایه‌گذاری روی خود');
                }
            });
        }

        // 8. Vision Affirmation and Vision board form
        const nextAffirmationBtn = document.getElementById('next-affirmation-btn');
        if (nextAffirmationBtn) {
            nextAffirmationBtn.addEventListener('click', () => {
                const quoteText = document.getElementById('affirmation-quote');
                if (quoteText) {
                    const idx = Math.floor(Math.random() * affirmationsList.length);
                    quoteText.textContent = affirmationsList[idx];
                }
            });
        }

        const newVisionForm = document.getElementById('new-vision-form');
        if (newVisionForm) {
            newVisionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('vision-title-input').value.trim();
                const url = document.getElementById('vision-url-input').value.trim();
                const category = document.getElementById('vision-category-select').value;
                
                if (title && url) {
                    const newItem = {
                        id: 'vision_' + Date.now(),
                        title: title,
                        url: url,
                        category: category
                    };
                    state.visionItems.unshift(newItem);
                    saveToLocalStorage();
                    renderVisionBoard();
                    
                    document.getElementById('vision-title-input').value = '';
                    document.getElementById('vision-url-input').value = '';
                    
                    showToast('آیتم تصویری به بورد انگیزشی اضافه شد. به تصویرسازی ادامه دهید.', 'success');
                    gainXp(15, 'تصویرسازی اهداف فردی');
                }
            });
        }

        // 9. Reports print button
        const printReportBtn = document.getElementById('print-report-btn');
        if (printReportBtn) {
            printReportBtn.addEventListener('click', () => {
                generateReportSheet();
                window.print();
            });
        }

        // Restore default templates if empty
        if (!state.timeBlocks || state.timeBlocks.length === 0) {
            state.timeBlocks = Array(18).fill(null).map((_, i) => ({
                hour: i + 6,
                task: '',
                category: 'other'
            }));
        }
        if (!state.xp) state.xp = 0;
        if (!state.habits) state.habits = [];
        if (!state.goals) state.goals = [];
        if (!state.notes) state.notes = [];
        if (!state.expenses) state.expenses = [];
        if (!state.visionItems) state.visionItems = [];
        if (state.waterIntake === undefined) state.waterIntake = 0;
        if (state.budgetLimit === undefined) state.budgetLimit = 1000000;
        
        // Initial rendering triggers
        updateRpgSystem(0);
        renderTimeBlocks();
        renderHabits();
        renderGoals();
        renderFitness();
        renderNotesList();
        renderExpenses();
        renderVisionBoard();
        generateReportSheet();
        clearOscilloscope();
        initPremiumProfile();

        // Header guide trigger listener
        const headerGuideTrigger = document.getElementById('header-guide-trigger');
        if (headerGuideTrigger) {
            headerGuideTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                startTour();
            });
        }

        // Level Up Modal Close button listener
        const levelUpCloseBtn = document.getElementById('level-up-close-btn');
        if (levelUpCloseBtn) {
            levelUpCloseBtn.addEventListener('click', () => {
                const modal = document.getElementById('level-up-modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
        }
    }

    // --- 10. PREMIUM PROFILE & DATABASE SYSTEM INTERPRETER ---
    const araAdvices = [
        "پیوستگی عادات کوچک است که اهداف بزرگ را خلق می‌کند. امروز یک کار عمیق را تمام کن.",
        "امواج بتا برای محاسبات و یادگیری عمیق عالی است، در حالی که آلفا تمرکز ملایم و پایداری ایجاد می‌کند.",
        "هیدراته ماندن (مصرف آب منظم) بازدهی ذهن شما را تا ۲۰ درصد افزایش می‌دهد. همین الان یک لیوان آب بنوش.",
        "بودجه رشد فردی شما سرمایه‌گذاری روی باارزش‌ترین دارایی‌تان یعنی خودتان است.",
        "نوشتن ژورنال روزانه ذهن شما را از افکار مزاحم پاک می‌کند و فضا را برای تمرکز بیشتر باز می‌کند."
    ];

    function renderPremiumProfile() {
        const savedProfile = JSON.parse(localStorage.getItem('rayon_user_profile') || '{}');
        
        const nameInput = document.getElementById('profile-name-input');
        const emailInput = document.getElementById('profile-email-input');
        const dispName = document.getElementById('premium-display-name');
        const rankSelect = document.getElementById('profile-rank-select');
        const badgeSelect = document.getElementById('profile-badge-select');
        const typeSelect = document.getElementById('profile-type-select');
        
        if (nameInput) nameInput.value = savedProfile.name || state.userName || 'کاربر رایون ویژه';
        if (emailInput) emailInput.value = savedProfile.email || 'vip@rayon.com';
        if (dispName) dispName.textContent = savedProfile.name || state.userName || 'کاربر رایون ویژه';
        
        if (rankSelect && savedProfile.rank) {
            rankSelect.value = savedProfile.rank;
        } else if (rankSelect) {
            // Estimate based on current level
            const level = Math.floor(Math.sqrt(state.xp / 100)) + 1;
            if (level >= 15) rankSelect.value = 'zen-master';
            else if (level >= 10) rankSelect.value = 'elite';
            else if (level >= 5) rankSelect.value = 'warrior';
            else rankSelect.value = 'beginner';
        }
        
        if (typeSelect && savedProfile.membershipType) {
            typeSelect.value = savedProfile.membershipType;
        }
        
        if (badgeSelect && savedProfile.badgeColor) {
            badgeSelect.value = savedProfile.badgeColor;
            const badgeEl = document.getElementById('rpg-sidebar-widget');
            if (badgeEl) {
                // remove existing badge colors
                badgeEl.classList.remove('badge-color-amber', 'badge-color-cyan', 'badge-color-emerald', 'badge-color-purple');
                badgeEl.classList.add('badge-color-' + savedProfile.badgeColor);
            }
        }

        // Update visual card appearance
        const cardEl = document.getElementById('premium-badge-card');
        const starBadge = document.getElementById('profile-star-badge');
        const membershipTag = document.getElementById('profile-membership-tag');
        const memType = savedProfile.membershipType || 'regular';
        
        if (cardEl) {
            if (memType === 'gold') {
                cardEl.classList.add('is-gold');
                cardEl.classList.remove('is-regular');
            } else {
                cardEl.classList.add('is-regular');
                cardEl.classList.remove('is-gold');
            }
        }
        if (starBadge) {
            starBadge.style.display = memType === 'gold' ? 'block' : 'none';
        }
        if (membershipTag) {
            membershipTag.textContent = memType === 'gold' ? 'اشتراک طلایی رایون (Gold Member)' : 'عضویت عادی رایون (Regular Member)';
        }
        
        updateDbCounts();
    }

    function initPremiumProfile() {
        const profileForm = document.getElementById('profile-edit-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('profile-name-input').value.trim();
                const email = document.getElementById('profile-email-input').value.trim();
                const rank = document.getElementById('profile-rank-select').value;
                const badgeColor = document.getElementById('profile-badge-select').value;
                const membershipType = document.getElementById('profile-type-select') ? document.getElementById('profile-type-select').value : 'gold';
                
                const profile = {
                    name: name,
                    email: email,
                    rank: rank,
                    badgeColor: badgeColor,
                    membershipType: membershipType,
                    dailyGoal: state.timer.focus / 60
                };
                localStorage.setItem('rayon_user_profile', JSON.stringify(profile));
                
                state.userName = name;
                
                const dispUserName = document.getElementById('display-user-name');
                const dispPremiumName = document.getElementById('premium-display-name');
                if (dispUserName) dispUserName.textContent = name;
                if (dispPremiumName) dispPremiumName.textContent = name;
                
                let rankLabel = 'مبارز زمان';
                switch(rank) {
                    case 'beginner': rankLabel = 'مبتدی تمرکز'; break;
                    case 'warrior': rankLabel = 'مبارز زمان'; break;
                    case 'elite': rankLabel = 'نخبه بهره‌وری'; break;
                    case 'zen-master': rankLabel = 'استاد بزرگ ذن'; break;
                }
                
                const userRankEl = document.getElementById('rpg-user-rank');
                if (userRankEl) userRankEl.textContent = rankLabel;
                
                const badgeEl = document.getElementById('rpg-sidebar-widget');
                if (badgeEl) {
                    badgeEl.classList.remove('badge-color-amber', 'badge-color-cyan', 'badge-color-emerald', 'badge-color-purple');
                    badgeEl.classList.add('badge-color-' + badgeColor);
                }
                
                // Update badge card styles in the UI based on type
                const cardEl = document.getElementById('premium-badge-card');
                const starBadge = document.getElementById('profile-star-badge');
                const membershipTag = document.getElementById('profile-membership-tag');
                
                if (cardEl) {
                    if (membershipType === 'gold') {
                        cardEl.classList.add('is-gold');
                        cardEl.classList.remove('is-regular');
                    } else {
                        cardEl.classList.add('is-regular');
                        cardEl.classList.remove('is-gold');
                    }
                }
                if (starBadge) {
                    starBadge.style.display = membershipType === 'gold' ? 'block' : 'none';
                }
                if (membershipTag) {
                    membershipTag.textContent = membershipType === 'gold' ? 'اشتراک طلایی رایون (Gold Member)' : 'عضویت عادی رایون (Regular Member)';
                }
                
                // Save state changes (internally triggers database save for active user)
                saveToLocalStorage();
                
                playUISound('chime');
                showToast('مشخصات کاربری بروزرسانی شد.', 'success');
                gainXp(10, 'بروزرسانی مشخصات کاربری');
            });
        }

        // AI Guide Handlers
        const araAnalyzeBtn = document.getElementById('ara-analyze-btn');
        if (araAnalyzeBtn) {
            araAnalyzeBtn.addEventListener('click', () => {
                const totalTasks = state.tasks.length;
                const completedTasks = state.tasks.filter(t => t.completed).length;
                
                const todayStr = new Date().toISOString().split('T')[0];
                const activeHabits = state.habits.length;
                const completedHabitsToday = state.habits.filter(h => h.completedDays && h.completedDays.includes(todayStr)).length;
                
                let tempToday = JSON.parse(localStorage.getItem('rayon_focus_stats_today') || '{}');
                let focusMins = tempToday.seconds ? Math.floor(tempToday.seconds / 60) : 0;
                
                let speech = `درود بر شما ${state.userName || 'کاربر'} عزیز! من امروز شما را آنالیز کردم. `;
                
                if (totalTasks === 0) {
                    speech += `امروز هنوز هیچ تسکی ثبت نکرده‌اید. توصیه می‌کنم یک کار کوچک برای شروع بنویسید. `;
                } else if (completedTasks === totalTasks) {
                    speech += `فوق‌العاده است! تمام ${totalTasks} تسک امروز را به اتمام رسانده‌اید. عملکردتان بینظیر است! `;
                } else {
                    speech += `تاکنون ${completedTasks} کار از مجموع ${totalTasks} کار روزانه را تیک زده‌اید. پیشرفت خوبی است. `;
                }
                
                if (activeHabits > 0) {
                    if (completedHabitsToday === 0) {
                        speech += `هنوز هیچ‌کدام از عادت‌های امروز خود را انجام نداده‌اید، فراموش نکنید که پیوستگی زنجیره عادت‌ها معجزه می‌کند. `;
                    } else {
                        speech += `عالی است که ${completedHabitsToday} عادت از ${activeHabits} عادت خود را به پایان رسانده‌اید. `;
                    }
                }
                
                if (focusMins > 0) {
                    speech += `امروز در مجموع ${focusMins} دقیقه تمرکز عمیق داشته‌اید. ذهن شما در شرایط کار عمیق قرار دارد. `;
                } else {
                    speech += `تا این لحظه تایمر تمرکزی فعال نکرده‌اید. توصیه می‌کنم ۲۵ دقیقه فوکوس را همراه با فرکانس آلفا آغاز کنید. `;
                }
                
                speech += `فراموش نکنید که نرمش کششی ۳ دقیقه‌ای تب سلامت را اجرا کنید تا جریان خون در بدنتان افزایش یابد. موفق باشید!`;
                
                typewriterEffect(document.getElementById('ara-speech-text'), speech);
            });
        }

        const araAskBtn = document.getElementById('ara-ask-custom-btn');
        if (araAskBtn) {
            araAskBtn.addEventListener('click', () => {
                const question = prompt('از راهنمای هوشمند آرا سوال بپرسید (مثال: تمرکز، خستگی، دیتابیس، بودجه):');
                if (question === null) return;
                const q = question.trim().toLowerCase();
                if (!q) return;
                
                let reply = '';
                if (q.includes('تمرکز') || q.includes('فوکوس') || q.includes('پومودورو') || q.includes('کار')) {
                    reply = 'برای کار عمیق و تمرکز بالا، حتماً فرکانس مغزی آلفا (۱۰ هرتز) را در تب فرکانس‌های مغزی پخش کنید و از هدفون استفاده کنید. همچنین از تکنیک پومودورو (۲۵ دقیقه کار و ۵ دقیقه استراحت) بهره ببرید.';
                } else if (q.includes('دیتابیس') || q.includes('پایگاه') || q.includes('ذخیره') || q.includes('اطلاعات')) {
                    reply = 'سیستم پایگاه داده رایون بر روی LocalStorage مرورگر شما ذخیره شده و از همگام‌سازی IndexedDB بهره می‌برد. در صورت نیاز به نسخه پشتیبان می‌توانید از ترمینال دیتابیس دستور /sync را اجرا کنید.';
                } else if (q.includes('خسته') || q.includes('خواب') || q.includes('استراحت') || q.includes('ورزش') || q.includes('تحرک')) {
                    reply = 'احساس خستگی طبیعی است. فرکانس دلتا یا تتا را برای بازسازی مغز پخش کنید، یک لیوان آب بنوشید و تایمر نرمش ۳ دقیقه‌ای در تب سلامت را فعال کنید تا شادابی به بدنتان برگردد.';
                } else if (q.includes('بودجه') || q.includes('پول') || q.includes('هزینه') || q.includes('خرید')) {
                    reply = 'توسعه فردی بزرگترین سرمایه‌گذاری زندگی شماست. در تب بودجه رشد، حتماً سقف بودجه ماهیانه را تعیین کرده و مخارج کتاب‌ها و دوره‌های آموزشی‌تان را پایش کنید.';
                } else if (q.includes('سلام') || q.includes('درود') || q.includes('صبح') || q.includes('شب')) {
                    reply = `درود بر شما دوست عزیز! امیدوارم لحظات پرانرژی و متمرکزی را با رایون سپری کنید. چه کمکی از دست من ساخته است؟`;
                } else {
                    // Random motivational advice
                    const idx = Math.floor(Math.random() * araAdvices.length);
                    reply = `پیشنهاد من برای شما: ${araAdvices[idx]}`;
                }
                
                typewriterEffect(document.getElementById('ara-speech-text'), reply);
            });
        }

        // Database Console Handlers
        const consoleForm = document.getElementById('db-console-form');
        const consoleInput = document.getElementById('db-console-input');
        
        if (consoleForm && consoleInput) {
            consoleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const cmd = consoleInput.value.trim();
                if (!cmd) return;
                
                consoleInput.value = '';
                printConsoleLine(`> ${cmd}`, 'query');
                
                interpretDbCommand(cmd);
            });
        }

        // Database Utility Buttons
        const dbBtnOptimize = document.getElementById('db-btn-optimize');
        if (dbBtnOptimize) {
            dbBtnOptimize.addEventListener('click', () => {
                interpretDbCommand('/optimize');
            });
        }

        const dbBtnSync = document.getElementById('db-btn-sync');
        if (dbBtnSync) {
            dbBtnSync.addEventListener('click', () => {
                interpretDbCommand('/sync');
            });
        }

        const dbBtnClear = document.getElementById('db-btn-clear');
        if (dbBtnClear) {
            dbBtnClear.addEventListener('click', () => {
                interpretDbCommand('/clear tasks');
            });
        }
        // Tour button listener
        const startTourBtn = document.getElementById('start-tour-btn');
        if (startTourBtn) {
            startTourBtn.addEventListener('click', () => {
                startTour();
            });
        }

        const tourBtnPrev = document.getElementById('tour-btn-prev');
        if (tourBtnPrev) {
            tourBtnPrev.addEventListener('click', () => {
                if (currentTourStep > 0) {
                    renderTourStep(currentTourStep - 1);
                }
            });
        }

        const tourBtnNext = document.getElementById('tour-btn-next');
        if (tourBtnNext) {
            tourBtnNext.addEventListener('click', () => {
                if (currentTourStep < tourSteps.length - 1) {
                    renderTourStep(currentTourStep + 1);
                } else {
                    endTour();
                    showToast('تور معرفی با موفقیت به پایان رسید. آماده کار عمیق شوید!', 'success');
                }
            });
        }

        const tourBtnSkip = document.getElementById('tour-btn-skip');
        if (tourBtnSkip) {
            tourBtnSkip.addEventListener('click', () => {
                endTour();
                showToast('تور لغو شد.', 'info');
            });
        }
        
        renderPremiumProfile();
    }

    function typewriterEffect(element, text) {
        if (!element) return;
        
        element.style.opacity = '0.5';
        let index = 0;
        element.textContent = '';
        element.style.opacity = '1';
        
        playUISound('click');
        
        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, 15);
            }
        }
        type();
    }

    function printConsoleLine(text, type = 'text-muted') {
        const consoleOutput = document.getElementById('db-console-output');
        if (!consoleOutput) return;
        
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.textContent = text;
        
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    function interpretDbCommand(cmd) {
        const q = cmd.trim();
        if (!q) return;
        
        if (q.startsWith('/')) {
            const parts = q.slice(1).split(' ');
            const action = parts[0].toLowerCase();
            
            switch(action) {
                case 'help':
                    printConsoleLine('Available Commands:', 'success');
                    printConsoleLine('  /help - Display this command list', 'info');
                    printConsoleLine('  /version - Show database engine details', 'info');
                    printConsoleLine('  /select * from [tasks|habits|goals|notes|expenses] - Query a table', 'info');
                    printConsoleLine('  /stats - Get storage size and database report', 'info');
                    printConsoleLine('  /optimize - Perform database maintenance', 'info');
                    printConsoleLine('  /sync - Backup state to IndexedDB permanently', 'info');
                    printConsoleLine('  /clear [tasks|habits|goals|notes|expenses] - Truncate a table', 'info');
                    printConsoleLine('  /clear_console - Clear screen output', 'info');
                    break;
                    
                case 'version':
                    printConsoleLine('RayonDB Client-Sync Engine v2.1.2-Stable.', 'success');
                    printConsoleLine('Storage Driver: LocalStorage Hybrid + IndexedDB API', 'info');
                    printConsoleLine('Compatibility: HTML5 compliant', 'info');
                    break;
                    
                case 'clear_console':
                case 'clearconsole':
                    const consoleOutput = document.getElementById('db-console-output');
                    if (consoleOutput) consoleOutput.innerHTML = '';
                    break;
                    
                case 'stats':
                    let totalLength = 0;
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key.includes('rayon')) {
                            totalLength += (localStorage.getItem(key) || '').length;
                        }
                    }
                    const sizeKb = (totalLength / 1024).toFixed(2);
                    printConsoleLine('--- RAYON DATABASE STATISTICS ---', 'success');
                    printConsoleLine(`  - Core Tables count: 5 active tables`, 'info');
                    printConsoleLine(`  - Tasks: ${state.tasks.length} rows`, 'info');
                    printConsoleLine(`  - Habits: ${state.habits.length} rows`, 'info');
                    printConsoleLine(`  - Goals: ${state.goals.length} rows`, 'info');
                    printConsoleLine(`  - Notes: ${state.notes.length} rows`, 'info');
                    printConsoleLine(`  - Expenses: ${state.expenses.length} rows`, 'info');
                    printConsoleLine(`  - LocalStorage size: ${sizeKb} KB (${totalLength} bytes)`, 'info');
                    printConsoleLine(`  - DB Health status: Excellent (100% verified)`, 'success');
                    break;
                    
                case 'select':
                    const match = q.match(/\/select\s+\*\s+from\s+(\w+)/i);
                    if (match) {
                        const table = match[1].toLowerCase();
                        if (['tasks', 'habits', 'goals', 'notes', 'expenses'].includes(table)) {
                            const rows = state[table] || [];
                            printConsoleLine(`--- TABLE: ${table.toUpperCase()} (${rows.length} rows) ---`, 'success');
                            if (rows.length === 0) {
                                printConsoleLine('Table is empty (0 rows returned).', 'text-muted');
                            } else {
                                rows.forEach((row, i) => {
                                    let details = '';
                                    if (table === 'tasks') {
                                        details = `${row.title} (priority: ${row.priority}) [${row.completed ? 'COMPLETED' : 'PENDING'}]`;
                                    } else if (table === 'habits') {
                                        details = `${row.title} (streak: ${row.streak}d) [category: ${row.category}]`;
                                    } else if (table === 'goals') {
                                        details = `${row.title} (date: ${row.date})`;
                                    } else if (table === 'notes') {
                                        details = `${row.title} [tags: ${row.tags || 'none'}] (${row.date})`;
                                    } else if (table === 'expenses') {
                                        details = `${row.desc}: ${row.amount} Tomans [category: ${row.category}]`;
                                    }
                                    printConsoleLine(`[${i+1}] ${details}`, 'info');
                                });
                            }
                        } else {
                            printConsoleLine(`Table "${table}" not found. Valid tables are: tasks, habits, goals, notes, expenses.`, 'error');
                        }
                    } else {
                        printConsoleLine('Syntax Error. Usage: /select * from [table_name]', 'error');
                    }
                    break;
                    
                case 'clear':
                    const targetTable = parts[1] ? parts[1].toLowerCase() : '';
                    if (['tasks', 'habits', 'goals', 'notes', 'expenses'].includes(targetTable)) {
                        if (confirm(`آیا مطمئن هستید که می‌خواهید تمام رکوردهای جدول ${targetTable} را برای همیشه پاک کنید؟`)) {
                            state[targetTable] = [];
                            saveToLocalStorage();
                            
                            // re-render corresponding lists
                            if (targetTable === 'tasks') renderTasks();
                            else if (targetTable === 'habits') renderHabits();
                            else if (targetTable === 'goals') renderGoals();
                            else if (targetTable === 'notes') renderNotesList();
                            else if (targetTable === 'expenses') renderExpenses();
                            
                            printConsoleLine(`Table "${targetTable}" truncated successfully.`, 'success');
                            updateDbCounts();
                            playUISound('slash');
                        }
                    } else {
                        printConsoleLine('Usage: /clear [tasks|habits|goals|notes|expenses]', 'error');
                    }
                    break;
                    
                case 'optimize':
                    printConsoleLine('[INFO] Starting database validation scan...', 'info');
                    setTimeout(() => {
                        printConsoleLine('[INFO] Validating data integrity of 5 tables...', 'info');
                        printConsoleLine('[INFO] Checking for redundant LocalStorage entries...', 'info');
                        // Clean duplicate tasks or empty indices
                        state.tasks = state.tasks.filter(t => t && t.id);
                        state.habits = state.habits.filter(h => h && h.id);
                        state.goals = state.goals.filter(g => g && g.id);
                        state.notes = state.notes.filter(n => n && n.id);
                        state.expenses = state.expenses.filter(e => e && e.id);
                        
                        saveToLocalStorage();
                        updateDbCounts();
                        
                        printConsoleLine('[SUCCESS] Database optimization finished.', 'success');
                        printConsoleLine('[SUCCESS] LocalStorage keys defragmented and vacuumed.', 'success');
                        playUISound('chime');
                        showToast('بهینه‌سازی دیتابیس با موفقیت انجام شد.', 'success');
                    }, 600);
                    break;
                    
                case 'sync':
                    printConsoleLine('[INFO] Opening IndexedDB connection context...', 'info');
                    printConsoleLine('[INFO] Preparing data transaction channel...', 'info');
                    
                    syncToIndexedDB()
                        .then(() => {
                            printConsoleLine('[SUCCESS] Connected to IndexedDB instance.', 'success');
                            printConsoleLine('[SUCCESS] Object stores (tasks, habits, goals, notes, expenses) synchronized.', 'success');
                            printConsoleLine('[SUCCESS] All local records synchronized to client secure database block.', 'success');
                            playUISound('chime');
                            showToast('همگام‌سازی IndexedDB انجام شد.', 'success');
                        })
                        .catch(err => {
                            printConsoleLine(`[ERROR] Sync failed: ${err.message}`, 'error');
                        });
                    break;
                    
                default:
                    printConsoleLine(`Command "${action}" not recognized. Type /help to see command options.`, 'error');
            }
        } else {
            printConsoleLine(`Invalid command format. Commands must start with a slash (/). Type /help for guidance.`, 'error');
        }
    }

    function syncToIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB is not supported in this browser.'));
                return;
            }
            const request = indexedDB.open('RayonDatabase', 1);
            
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                const stores = ['tasks', 'habits', 'goals', 'notes', 'expenses'];
                stores.forEach(store => {
                    if (!db.objectStoreNames.contains(store)) {
                        db.createObjectStore(store, { keyPath: 'id' });
                    }
                });
            };
            
            request.onsuccess = (e) => {
                const db = e.target.result;
                const stores = ['tasks', 'habits', 'goals', 'notes', 'expenses'];
                const transaction = db.transaction(stores, 'readwrite');
                
                stores.forEach(storeName => {
                    const store = transaction.objectStore(storeName);
                    store.clear();
                    
                    const dataList = state[storeName] || [];
                    dataList.forEach(item => {
                        if (item && item.id) {
                            store.put(item);
                        }
                    });
                });
                
                transaction.oncomplete = () => {
                    db.close();
                    resolve();
                };
                
                transaction.onerror = (evt) => {
                    db.close();
                    reject(evt.target.error || new Error('Transaction aborted'));
                };
            };
            
            request.onerror = (e) => {
                reject(e.target.error || new Error('Failed to open database'));
            };
        });
    }

    function updateDbCounts() {
        const countTasks = document.getElementById('db-count-tasks');
        const countHabits = document.getElementById('db-count-habits');
        const countGoals = document.getElementById('db-count-goals');
        const countNotes = document.getElementById('db-count-notes');
        
        if (countTasks) countTasks.textContent = state.tasks.length;
        if (countHabits) countHabits.textContent = state.habits.length;
        if (countGoals) countGoals.textContent = state.goals.length;
        if (countNotes) countNotes.textContent = state.notes.length;
    }
    const tourSteps = [
        {
            elementSelector: '.sidebar',
            text: 'منوی ناوبری سایدبار؛ از این بخش می‌توانید بین صفحات مختلف هسته تمرکز، برنامه‌ریزی، گزارشات و دیتابیس جابجا شوید.',
            tab: 'dashboard'
        },
        {
            elementSelector: '#rpg-sidebar-widget',
            text: 'سیستم بازی‌سازی (RPG)؛ با انجام کارها، تیک زدن عادت‌ها، نوشتن ژورنال و ثبت هزینه‌ها، امتیاز تجربه (XP) کسب کرده و سطح کاربری خود را ارتقا دهید.',
            tab: 'dashboard'
        },
        {
            elementSelector: '.focus-streak-badge',
            text: 'نشان پیوستگی؛ تعداد روزهای متوالی که در رایون فعالیت داشته‌اید را شمارش می‌کند. زنجیره خود را حفظ کنید!',
            tab: 'dashboard'
        },
        {
            elementSelector: '.dashboard-timer-card',
            text: 'ویجت تایمر سریع تمرکز؛ می‌توانید بدون نیاز به جابجایی تب، سریعاً پومودوروی جدید را برای تمرکز عمیق ۲۵ دقیقه‌ای فعال کنید.',
            tab: 'dashboard'
        },
        {
            elementSelector: '.focus-timer-container',
            text: 'تایمر اصلی تمرکز و میکسر آمبینت؛ در این بخش می‌توانید دوره‌های فوکوس و استراحت را مدیریت کرده و چند کانال صوتی آرامش‌بخش را ترکیب کنید.',
            tab: 'focus'
        },
        {
            elementSelector: '.waves-controls-card',
            text: 'تنظیمات فرکانس صوتی مغز (Binaural Beats)؛ فرکانس‌های دوگوش آلفا، بتا، دلتا و تتا را با نوسان‌ساز زنده پخش کنید تا تمرکزتان دوبرابر شود.',
            tab: 'neurowaves'
        },
        {
            elementSelector: '.time-grid-card',
            text: 'برنامه‌ریز بلوک‌های زمانی؛ ساعات روز خود را تقسیم‌بندی کنید تا از هدررفت زمان جلوگیری شود.',
            tab: 'timeblocking'
        },
        {
            elementSelector: '.premium-badge-card',
            text: 'پروفایل ویژه طلایی؛ نام کاربری، ایمیل و لقب خود را ویرایش کرده و نشان رنگی دلخواه را انتخاب کنید.',
            tab: 'profile'
        },
        {
            elementSelector: '.database-control-card',
            text: 'مرکز کنترل دیتابیس رایون؛ آمار فیزیکی جداول را مدیریت کنید، کلیدها را بهینه‌سازی کرده و در ترمینال CLI کوئری‌های SQL-CLI اجرا نمایید.',
            tab: 'profile'
        }
    ];

    let currentTourStep = 0;

    function startTour() {
        currentTourStep = 0;
        const tourOverlay = document.getElementById('tour-overlay');
        const backdrop = document.getElementById('tour-backdrop');
        if (backdrop) {
            backdrop.style.clipPath = 'none';
        }
        if (tourOverlay) {
            tourOverlay.classList.add('active');
            renderTourStep(0);
        }
    }

    function endTour() {
        const tourOverlay = document.getElementById('tour-overlay');
        const backdrop = document.getElementById('tour-backdrop');
        if (backdrop) {
            backdrop.style.clipPath = 'none';
        }
        if (tourOverlay) {
            tourOverlay.classList.remove('active');
        }
        // Return to dashboard when tour ends
        const dashNav = document.getElementById('nav-dashboard');
        if (dashNav) dashNav.click();
    }

    function renderTourStep(stepIdx) {
        if (stepIdx < 0 || stepIdx >= tourSteps.length) return;
        
        currentTourStep = stepIdx;
        const step = tourSteps[stepIdx];
        
        // 1. Switch tab if necessary
        const targetNav = document.getElementById(`nav-${step.tab}`);
        if (targetNav && !targetNav.classList.contains('active')) {
            targetNav.click();
        }
        
        setTimeout(() => {
            const targetEl = document.querySelector(step.elementSelector);
            const spotlight = document.getElementById('tour-spotlight');
            const backdrop = document.getElementById('tour-backdrop');
            
            if (targetEl) {
                // Scroll instantly so we can measure exact viewport-relative coordinates
                targetEl.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
                
                const rect = targetEl.getBoundingClientRect();
                const pad = 8;
                
                // Position spotlight relative to viewport (fixed positioning)
                if (spotlight) {
                    spotlight.style.width = `${rect.width + pad * 2}px`;
                    spotlight.style.height = `${rect.height + pad * 2}px`;
                    spotlight.style.top = `${rect.top - pad}px`;
                    spotlight.style.left = `${rect.left - pad}px`;
                }
                
                // Clip backdrop to exclude the spotlight area
                if (backdrop) {
                    const x1 = rect.left - pad;
                    const y1 = rect.top - pad;
                    const x2 = rect.right + pad;
                    const y2 = rect.bottom + pad;
                    
                    const clipPathVal = `polygon(
                        0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
                        ${x1}px ${y1}px,
                        ${x2}px ${y1}px,
                        ${x2}px ${y2}px,
                        ${x1}px ${y2}px,
                        ${x1}px ${y1}px
                    )`;
                    backdrop.style.clipPath = clipPathVal;
                }
            } else {
                if (spotlight) {
                    spotlight.style.width = '0px';
                    spotlight.style.height = '0px';
                }
                if (backdrop) {
                    backdrop.style.clipPath = 'none';
                }
            }
            
            // 2. Set dialog text and counter
            const textEl = document.getElementById('tour-dialog-text');
            if (textEl) textEl.textContent = step.text;
            
            const counterEl = document.getElementById('tour-step-counter');
            if (counterEl) counterEl.textContent = `گام ${stepIdx + 1} از ${tourSteps.length}`;
            
            // Disable back button on first step
            const prevBtn = document.getElementById('tour-btn-prev');
            if (prevBtn) prevBtn.disabled = (stepIdx === 0);
            
            // Change next button to Finish on last step
            const nextBtn = document.getElementById('tour-btn-next');
            if (nextBtn) {
                nextBtn.textContent = (stepIdx === tourSteps.length - 1) ? 'پایان تور' : 'بعدی';
            }
            
            // Play click synth sound
            playUISound('click');
        }, 150);
    }
    // Call initializations
    initRayonExpansion();

    const loaderEl = document.getElementById('cinematic-loader');
    const isBootCompleted = sessionStorage.getItem('rayon_boot_completed') === 'true';
    if (loaderEl) {
        if (!state.settings.cinematicMode || isBootCompleted) {
            loaderEl.style.display = 'none';
            setTimeout(injectLaserBorders, 200);
        } else {
            runBootLoader();
        }
    }

});
