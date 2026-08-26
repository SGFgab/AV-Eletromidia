// State Management
let eventsData = [];
let activeFilter = 'all';
let currentViewMode = 'cards'; // 'cards' or 'grid'
let currentStep = 1;
let currentCalendarDate = new Date();

// Operator Authentication State
let isOperatorLoggedIn = false;
let currentOperatorUser = null;

// Supabase Client Instance
let supabaseClient = null;

// Initial Mock Data
const defaultMockEvents = [
    {
        id: 'evt-1',
        title: 'Convenção Anual Eletromidia 2026',
        applicantName: 'Mariana Costa',
        applicantEmail: 'mariana.costa@eletromidia.com.br',
        applicantPhone: '(11) 98877-6655',
        department: 'Diretoria / Executivo',
        date: '2026-08-28',
        startTime: '09:00',
        endTime: '17:00',
        setupBuffer: '60 min',
        eventType: 'Townhall / Geral',
        hasSpecificClient: true,
        clientName: 'Bradesco & Eletromidia',
        hasCOMedia: true,
        coMediaType: 'Vídeo em Loop no Videowall',
        coMediaFormat: '16:9 4K (3840x2160)',
        coMediaUrl: 'https://drive.google.com/drive/folders/eletromidia_convencao_2026',
        coTestNeeded: 'Sim',
        coTestDatetime: '2026-08-27T16:00',
        coInstructions: 'Executar vinhetas corporativas na abertura e no intervalo. Projetar a marca do cliente no videowall principal.',
        numPresentations: 3,
        presentationFormat: 'PowerPoint (.pptx)',
        presentationDevice: 'Notebook do Auditório (Recomendado)',
        numPresenters: 4,
        micsHandheld: 2,
        micsLapel: 2,
        micsAudience: 2,
        stageLayout: 'Poltronas / Lounge de Bate-Papo',
        streamingType: 'Microsoft Teams',
        needPassador: true,
        needStageMonitor: true,
        needTISupport: true,
        numAttendees: 85,
        numExternalGuests: 15,
        hasCatering: 'Sim (No Foyer do Auditório)',
        cateringTime: '12:30',
        logisticsNotes: 'Recepcionista no hall de entrada para credenciamento dos executivos externos.'
    },
    {
        id: 'evt-2',
        title: 'Apresentação Comercial de Mídia OOH',
        applicantName: 'Gabriel Carvalho',
        applicantEmail: 'gabriel.scarvalho@eletromidia.com.br',
        applicantPhone: '(11) 97123-4567',
        department: 'Comercial',
        date: '2026-08-29',
        startTime: '14:00',
        endTime: '16:00',
        setupBuffer: '30 min',
        eventType: 'Cliente Externo',
        hasSpecificClient: true,
        clientName: 'Nivea',
        hasCOMedia: true,
        coMediaType: 'Carrossel de Artes do Cliente',
        coMediaFormat: '16:9 Full HD (1920x1080)',
        coMediaUrl: 'https://drive.google.com/drive/folders/nivea_ooh_deck',
        coTestNeeded: 'Não',
        coInstructions: 'Subir os vídeos comerciais da campanha de Primavera.',
        numPresentations: 1,
        presentationFormat: 'PowerPoint (.pptx)',
        presentationDevice: 'Notebook do Auditório (Recomendado)',
        numPresenters: 2,
        micsHandheld: 2,
        micsLapel: 0,
        micsAudience: 1,
        stageLayout: 'Púlpito de Apresentação',
        streamingType: 'Sem Transmissão (Presencial Apenas)',
        needPassador: true,
        needStageMonitor: true,
        needTISupport: true,
        numAttendees: 20,
        numExternalGuests: 8,
        hasCatering: 'Sim (No Foyer do Auditório)',
        cateringTime: '15:30',
        logisticsNotes: 'Liberar acesso à garagem para 2 veículos da equipe Nivea.'
    },
    {
        id: 'evt-3',
        title: 'Treinamento de Equipe C.O. & Tecnologia',
        applicantName: 'Lucas Andrade',
        applicantEmail: 'lucas.andrade@eletromidia.com.br',
        applicantPhone: '(11) 96543-2100',
        department: 'Operações / C.O.',
        date: '2026-09-02',
        startTime: '10:00',
        endTime: '12:00',
        setupBuffer: '15 min',
        eventType: 'Treinamento',
        hasSpecificClient: false,
        clientName: '',
        hasCOMedia: false,
        numPresentations: 1,
        presentationFormat: 'PDF',
        presentationDevice: 'Notebook do Auditório (Recomendado)',
        numPresenters: 1,
        micsHandheld: 1,
        micsLapel: 0,
        micsAudience: 0,
        stageLayout: 'Púlpito de Apresentação',
        streamingType: 'Sem Transmissão (Presencial Apenas)',
        needPassador: true,
        needStageMonitor: false,
        needTISupport: true,
        numAttendees: 30,
        numExternalGuests: 0,
        hasCatering: 'Não',
        logisticsNotes: 'Nenhuma observação adicional.'
    }
];

// Helper: Normaliza o objeto do evento garantindo integridade de todos os campos
function normalizeEvent(evt) {
    if (!evt || typeof evt !== 'object') return null;
    return {
        id: evt.id || 'evt-' + Date.now(),
        title: (evt.title && evt.title !== 'undefined') ? evt.title : 'Evento sem título',
        applicantName: (evt.applicantName && evt.applicantName !== 'undefined') ? evt.applicantName : 'Não informado',
        applicantEmail: (evt.applicantEmail && evt.applicantEmail !== 'undefined') ? evt.applicantEmail : 'Não informado',
        applicantPhone: (evt.applicantPhone && evt.applicantPhone !== 'undefined') ? evt.applicantPhone : 'Não informado',
        department: (evt.department && evt.department !== 'undefined') ? evt.department : 'Geral',
        date: (evt.date && evt.date !== 'undefined') ? evt.date : new Date().toISOString().split('T')[0],
        startTime: (evt.startTime && evt.startTime !== 'undefined') ? evt.startTime : '09:00',
        endTime: (evt.endTime && evt.endTime !== 'undefined') ? evt.endTime : '10:00',
        setupBuffer: (evt.setupBuffer && evt.setupBuffer !== 'undefined') ? evt.setupBuffer : '30 min',
        eventType: (evt.eventType && evt.eventType !== 'undefined') ? evt.eventType : 'Interno',
        
        hasSpecificClient: Boolean(evt.hasSpecificClient),
        clientName: (evt.clientName && evt.clientName !== 'undefined') ? evt.clientName : '',
        
        hasCOMedia: Boolean(evt.hasCOMedia),
        coMediaType: (evt.coMediaType && evt.coMediaType !== 'undefined') ? evt.coMediaType : 'Vídeo em Loop',
        coMediaFormat: (evt.coMediaFormat && evt.coMediaFormat !== 'undefined') ? evt.coMediaFormat : '16:9 Full HD',
        coMediaUrl: (evt.coMediaUrl && evt.coMediaUrl !== 'undefined') ? evt.coMediaUrl : '',
        coTestNeeded: (evt.coTestNeeded && evt.coTestNeeded !== 'undefined') ? evt.coTestNeeded : 'Não',
        coTestDatetime: (evt.coTestDatetime && evt.coTestDatetime !== 'undefined') ? evt.coTestDatetime : '',
        coInstructions: (evt.coInstructions && evt.coInstructions !== 'undefined') ? evt.coInstructions : '',

        numPresentations: evt.numPresentations || 1,
        presentationFormat: (evt.presentationFormat && evt.presentationFormat !== 'undefined') ? evt.presentationFormat : 'PowerPoint (.pptx)',
        presentationDevice: (evt.presentationDevice && evt.presentationDevice !== 'undefined') ? evt.presentationDevice : 'Notebook do Auditório',
        numPresenters: evt.numPresenters || 1,
        micsHandheld: evt.micsHandheld || 0,
        micsLapel: evt.micsLapel || 0,
        micsAudience: evt.micsAudience || 0,
        stageLayout: (evt.stageLayout && evt.stageLayout !== 'undefined') ? evt.stageLayout : 'Púlpito de Apresentação',
        streamingType: (evt.streamingType && evt.streamingType !== 'undefined') ? evt.streamingType : 'Sem Transmissão (Presencial Apenas)',
        needPassador: Boolean(evt.needPassador),
        needStageMonitor: Boolean(evt.needStageMonitor),
        needTISupport: Boolean(evt.needTISupport),

        numAttendees: evt.numAttendees || 1,
        numExternalGuests: evt.numExternalGuests || 0,
        hasCatering: (evt.hasCatering && evt.hasCatering !== 'undefined') ? evt.hasCatering : 'Não',
        cateringTime: (evt.cateringTime && evt.cateringTime !== 'undefined') ? evt.cateringTime : '',
        logisticsNotes: (evt.logisticsNotes && evt.logisticsNotes !== 'undefined') ? evt.logisticsNotes : ''
    };
}

// Initialize Web App
document.addEventListener('DOMContentLoaded', async () => {
    loadIntegrationsConfig();
    initSupabase();
    await loadEvents();
    checkOperatorSession();
    renderEvents();
    renderFichasTecnicas();
    renderCalendarGrid();
});

// Load / Save Integrations (Slack, EmailJS, Supabase)
function loadIntegrationsConfig() {
    const slackUrl = localStorage.getItem('eletro_slack_webhook_url') || '';
    const emailKey = localStorage.getItem('eletro_emailjs_public_key') || '';
    const emailService = localStorage.getItem('eletro_emailjs_service_id') || '';
    const emailTemplate = localStorage.getItem('eletro_emailjs_template_id') || '';
    const supaUrl = localStorage.getItem('eletro_supabase_url') || '';
    const supaKey = localStorage.getItem('eletro_supabase_key') || '';

    const elSlack = document.getElementById('slack_webhook_url');
    const elEmailKey = document.getElementById('emailjs_public_key');
    const elEmailServ = document.getElementById('emailjs_service_id');
    const elEmailTemp = document.getElementById('emailjs_template_id');
    const elSupaUrl = document.getElementById('supabase_url');
    const elSupaKey = document.getElementById('supabase_key');

    if (elSlack) elSlack.value = slackUrl;
    if (elEmailKey) elEmailKey.value = emailKey;
    if (elEmailServ) elEmailServ.value = emailService;
    if (elEmailTemp) elEmailTemp.value = emailTemplate;
    if (elSupaUrl) elSupaUrl.value = supaUrl;
    if (elSupaKey) elSupaKey.value = supaKey;

    // Initialize EmailJS if public key exists
    if (emailKey && window.emailjs) {
        try {
            emailjs.init(emailKey);
        } catch (e) {
            console.warn('EmailJS init:', e);
        }
    }
}

function saveAllIntegrationsConfig() {
    const slackUrl = document.getElementById('slack_webhook_url')?.value.trim() || '';
    const emailKey = document.getElementById('emailjs_public_key')?.value.trim() || '';
    const emailService = document.getElementById('emailjs_service_id')?.value.trim() || '';
    const emailTemplate = document.getElementById('emailjs_template_id')?.value.trim() || '';
    const supaUrl = document.getElementById('supabase_url')?.value.trim() || '';
    const supaKey = document.getElementById('supabase_key')?.value.trim() || '';

    localStorage.setItem('eletro_slack_webhook_url', slackUrl);
    localStorage.setItem('eletro_emailjs_public_key', emailKey);
    localStorage.setItem('eletro_emailjs_service_id', emailService);
    localStorage.setItem('eletro_emailjs_template_id', emailTemplate);
    localStorage.setItem('eletro_supabase_url', supaUrl);
    localStorage.setItem('eletro_supabase_key', supaKey);

    if (emailKey && window.emailjs) {
        try {
            emailjs.init(emailKey);
        } catch (e) {}
    }

    initSupabase();
    showToast('Configurações de integrações salvas com sucesso!');
}

// Supabase Cloud Backend
function initSupabase() {
    const supaUrl = localStorage.getItem('eletro_supabase_url');
    const supaKey = localStorage.getItem('eletro_supabase_key');
    const indicator = document.getElementById('cloud-status-indicator');

    if (supaUrl && supaKey && window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(supaUrl, supaKey);
            if (indicator) indicator.classList.remove('hidden');
        } catch (e) {
            supabaseClient = null;
            if (indicator) indicator.classList.add('hidden');
        }
    } else {
        supabaseClient = null;
        if (indicator) indicator.classList.add('hidden');
    }
}

async function loadEvents() {
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('auditorio_events')
                .select('*')
                .order('date', { ascending: true });

            if (!error && Array.isArray(data) && data.length > 0) {
                eventsData = data.map(normalizeEvent).filter(Boolean);
                localStorage.setItem('eletromidia_auditorio_events', JSON.stringify(eventsData));
                return;
            }
        } catch (e) {
            console.warn('Erro ao carregar do Supabase, usando LocalStorage:', e);
        }
    }

    // Fallback LocalStorage
    const saved = localStorage.getItem('eletromidia_auditorio_events');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                eventsData = parsed.map(normalizeEvent).filter(Boolean);
            } else {
                eventsData = defaultMockEvents.map(normalizeEvent);
            }
        } catch (e) {
            eventsData = defaultMockEvents.map(normalizeEvent);
        }
    } else {
        eventsData = defaultMockEvents.map(normalizeEvent);
        saveEventsToStorage();
    }
}

async function saveEventsToStorage() {
    localStorage.setItem('eletromidia_auditorio_events', JSON.stringify(eventsData));
}

// Authentication / Operator Session
function checkOperatorSession() {
    const session = sessionStorage.getItem('eletromidia_operator_logged');
    if (session === 'true') {
        isOperatorLoggedIn = true;
        currentOperatorUser = sessionStorage.getItem('eletromidia_operator_user') || 'Diretor';
        updateUIForOperator(true);
    } else {
        isOperatorLoggedIn = false;
        currentOperatorUser = null;
        updateUIForOperator(false);
    }
}

function updateUIForOperator(isLoggedIn) {
    const loginBtn = document.getElementById('btn-operator-login');
    const badge = document.getElementById('operator-logged-badge');
    const navFichas = document.getElementById('nav-fichas');
    const navGoogle = document.getElementById('nav-google-settings');
    const roleTitle = document.getElementById('operator-role-title');

    if (isLoggedIn) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (badge) badge.classList.remove('hidden');
        if (roleTitle) roleTitle.textContent = currentOperatorUser + ' (Operador/Admin)';
        if (navFichas) navFichas.classList.remove('hidden');
        if (navGoogle) navGoogle.classList.remove('hidden');
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (badge) badge.classList.add('hidden');
        if (navFichas) navFichas.classList.add('hidden');
        if (navGoogle) navGoogle.classList.add('hidden');
    }

    renderEvents();
    renderFichasTecnicas();
}

function openOperatorLoginModal() {
    document.getElementById('operator-login-modal').classList.remove('hidden');
    lucide.createIcons();
}

function closeOperatorLoginModal() {
    document.getElementById('operator-login-modal').classList.add('hidden');
}

function handleOperatorLogin(e) {
    e.preventDefault();
    const user = document.getElementById('operator_user').value.trim();
    const pass = document.getElementById('operator_pass').value.trim();

    // Check credentials: Diretor / ELT@Estudio
    if (user === 'Diretor' && pass === 'ELT@Estudio') {
        isOperatorLoggedIn = true;
        currentOperatorUser = user;
        sessionStorage.setItem('eletromidia_operator_logged', 'true');
        sessionStorage.setItem('eletromidia_operator_user', user);
        
        closeOperatorLoginModal();
        updateUIForOperator(true);
        showToast('Login realizado com sucesso! Área do Operador ativada.');
    } else {
        alert('Credenciais incorretas! Verifique o login e a senha.');
    }
}

function operatorLogout() {
    isOperatorLoggedIn = false;
    currentOperatorUser = null;
    sessionStorage.removeItem('eletromidia_operator_logged');
    sessionStorage.removeItem('eletromidia_operator_user');
    updateUIForOperator(false);
    switchTab('calendar');
    showToast('Você saiu da Área do Operador.');
}

function handleRestrictedTab(tabName) {
    if (!isOperatorLoggedIn) {
        openOperatorLoginModal();
        return;
    }
    switchTab(tabName);
}

// Navigation Tabs
function switchTab(tabName) {
    const tabs = ['calendar', 'new-event', 'fichas', 'google-settings'];
    tabs.forEach(t => {
        const section = document.getElementById(`tab-${t}`);
        const navBtn = document.getElementById(`nav-${t}`);
        if (section) section.classList.add('hidden');
        if (navBtn) {
            navBtn.classList.remove('bg-zinc-900', 'text-orange-500', 'border', 'border-orange-500/30');
            navBtn.classList.add('text-zinc-400');
        }
    });

    const activeSection = document.getElementById(`tab-${tabName}`);
    const activeNavBtn = document.getElementById(`nav-${tabName}`);

    if (activeSection) activeSection.classList.remove('hidden');
    if (activeNavBtn) {
        activeNavBtn.classList.add('bg-zinc-900', 'text-orange-500', 'border', 'border-orange-500/30');
        activeNavBtn.classList.remove('text-zinc-400');
    }

    if (tabName === 'calendar') {
        renderEvents();
        renderCalendarGrid();
    } else if (tabName === 'fichas') {
        renderFichasTecnicas();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openNewEventModal() {
    switchTab('new-event');
    resetForm();
}

// View Mode Toggle (Cards vs Grid)
function setViewMode(mode) {
    currentViewMode = mode;
    const cardsView = document.getElementById('events-cards-view');
    const gridView = document.getElementById('events-grid-view');
    const cardsBtn = document.getElementById('view-cards-btn');
    const gridBtn = document.getElementById('view-grid-btn');

    if (mode === 'cards') {
        cardsView.classList.remove('hidden');
        gridView.classList.add('hidden');
        cardsBtn.classList.add('bg-zinc-800', 'text-white');
        cardsBtn.classList.remove('text-zinc-400');
        gridBtn.classList.remove('bg-zinc-800', 'text-white');
        gridBtn.classList.add('text-zinc-400');
    } else {
        cardsView.classList.add('hidden');
        gridView.classList.remove('hidden');
        gridBtn.classList.add('bg-zinc-800', 'text-white');
        gridBtn.classList.remove('text-zinc-400');
        cardsBtn.classList.remove('bg-zinc-800', 'text-white');
        cardsBtn.classList.add('text-zinc-400');
        renderCalendarGrid();
    }
}

// Filter Events
function filterEvents(type) {
    activeFilter = type;
    const buttons = ['all', 'co', 'client', 'today'];
    buttons.forEach(b => {
        const btn = document.getElementById(`filter-${b}`);
        if (btn) {
            if (b === type) {
                btn.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-orange-500 text-black shadow-md shadow-orange-500/20";
            } else {
                btn.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800";
            }
        }
    });
    renderEvents();
}

function handleSearch() {
    renderEvents();
}

// Detecção de Conflitos de Horário
function findTimeConflict(date, startTime, endTime, excludeEventId = null) {
    if (!date || !startTime || !endTime) return null;

    // Normaliza minutos para comparação
    const toMinutes = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const newStart = toMinutes(startTime);
    const newEnd = toMinutes(endTime);

    if (newEnd <= newStart) {
        return { isInvalidRange: true };
    }

    // Procura eventos no mesmo dia com sobreposição de horário
    for (const evt of eventsData) {
        if (excludeEventId && evt.id === excludeEventId) continue;
        if (evt.date === date) {
            const existStart = toMinutes(evt.startTime);
            const existEnd = toMinutes(evt.endTime);

            // Condição de sobreposição: (StartA < EndB) && (EndA > StartB)
            if (newStart < existEnd && newEnd > existStart) {
                return evt; // Retorna o evento que está em conflito
            }
        }
    }

    return null;
}

function checkTimeConflictRealtime() {
    const date = document.getElementById('event_date')?.value;
    const startTime = document.getElementById('start_time')?.value;
    const endTime = document.getElementById('end_time')?.value;

    const alertBanner = document.getElementById('conflict-alert-banner');
    const alertMsg = document.getElementById('conflict-alert-message');

    if (!date || !startTime || !endTime) {
        if (alertBanner) alertBanner.classList.add('hidden');
        return;
    }

    const conflict = findTimeConflict(date, startTime, endTime);

    if (conflict) {
        if (conflict.isInvalidRange) {
            if (alertMsg) alertMsg.textContent = 'O horário de término deve ser posterior ao horário de início.';
        } else {
            if (alertMsg) alertMsg.innerHTML = `Já existe a reserva <strong>"${conflict.title}"</strong> agendada para <strong>${formatDateBR(conflict.date)}</strong> das <strong>${conflict.startTime} às ${conflict.endTime}</strong> (Solicitante: ${conflict.applicantName}).`;
        }
        if (alertBanner) alertBanner.classList.remove('hidden');
    } else {
        if (alertBanner) alertBanner.classList.add('hidden');
    }
}

// Render Event Cards
function renderEvents() {
    const container = document.getElementById('events-cards-view');
    if (!container) return;

    const searchTerm = (document.getElementById('search-input')?.value || '').toLowerCase();
    const todayStr = new Date().toISOString().split('T')[0];

    const filtered = eventsData.filter(evt => {
        if (!evt) return false;
        // Filter by tab/type
        if (activeFilter === 'co' && !evt.hasCOMedia) return false;
        if (activeFilter === 'client' && !evt.hasSpecificClient) return false;
        if (activeFilter === 'today' && evt.date !== todayStr) return false;

        // Filter by Search
        if (searchTerm) {
            const matchesTitle = (evt.title || '').toLowerCase().includes(searchTerm);
            const matchesClient = (evt.clientName || '').toLowerCase().includes(searchTerm);
            const matchesApplicant = (evt.applicantName || '').toLowerCase().includes(searchTerm);
            const matchesDept = (evt.department || '').toLowerCase().includes(searchTerm);
            return matchesTitle || matchesClient || matchesApplicant || matchesDept;
        }

        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-12 text-center bg-zinc-950 border border-zinc-800/80 rounded-2xl">
                <i data-lucide="calendar-x" class="w-12 h-12 mx-auto text-zinc-600 mb-3"></i>
                <h3 class="text-base font-bold text-zinc-300">Nenhum evento encontrado</h3>
                <p class="text-xs text-zinc-500 mt-1">Tente mudar o filtro de busca ou cadastre uma nova reserva.</p>
                <button onclick="switchTab('new-event')" class="mt-4 bg-orange-500 text-black font-bold text-xs px-4 py-2 rounded-lg hover:bg-orange-400">Solicitar Reserva Agora</button>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    // Sort by date & time
    filtered.sort((a, b) => ((a.date || '') + (a.startTime || '')).localeCompare((b.date || '') + (b.startTime || '')));

    container.innerHTML = filtered.map(evt => {
        const formattedDate = formatDateBR(evt.date);
        const totalMics = (parseInt(evt.micsHandheld) || 0) + (parseInt(evt.micsLapel) || 0) + (parseInt(evt.micsAudience) || 0);
        const clientDisplayName = evt.clientName || 'Cliente';

        return `
            <div class="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all rounded-2xl p-5 flex flex-col justify-between shadow-lg relative group">
                
                <div>
                    <!-- Header Badges -->
                    <div class="flex items-center justify-between gap-2 mb-3">
                        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-900 border border-zinc-700 text-orange-400">
                            ${evt.department || 'Geral'}
                        </span>
                        
                        <div class="flex items-center space-x-1">
                            ${evt.hasCOMedia ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center space-x-1" title="Com Mídia C.O."><i data-lucide="tv" class="w-3 h-3"></i><span>C.O.</span></span>` : ''}
                            ${evt.hasSpecificClient ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center space-x-1" title="Cliente Específico"><i data-lucide="building" class="w-3 h-3"></i><span>${clientDisplayName}</span></span>` : ''}
                        </div>
                    </div>

                    <!-- Title -->
                    <h3 class="text-base font-black text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                        ${evt.title || 'Sem título'}
                    </h3>

                    <!-- Date & Time Box -->
                    <div class="mt-3 bg-black/60 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
                        <div class="flex items-center space-x-2 text-zinc-300 font-semibold">
                            <i data-lucide="calendar" class="w-4 h-4 text-orange-500"></i>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="flex items-center space-x-1 text-orange-400 font-bold">
                            <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                            <span>${evt.startTime || '00:00'} - ${evt.endTime || '00:00'}</span>
                        </div>
                    </div>

                    <!-- Quick Details -->
                    <div class="mt-3 space-y-1.5 text-xs text-zinc-400">
                        <div class="flex items-center justify-between">
                            <span class="text-zinc-500">Solicitante:</span>
                            <span class="font-medium text-zinc-200">${evt.applicantName || 'Não informado'}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-zinc-500">Tipo:</span>
                            <span class="font-medium text-zinc-200">${evt.eventType || 'Interno'}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-zinc-500">Microfones:</span>
                            <span class="font-medium text-zinc-200">${totalMics} unidades</span>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <button onclick="openEventDetailModal('${evt.id}')" class="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5">
                        <i data-lucide="eye" class="w-3.5 h-3.5 text-orange-500"></i>
                        <span>${isOperatorLoggedIn ? 'Ver Ficha Técnica' : 'Ver Resumo'}</span>
                    </button>

                    ${isOperatorLoggedIn ? `
                        <!-- Botões Exclusivos do Operador -->
                        <button onclick="addSingleEventToGoogleCalendar('${evt.id}')" class="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 p-2 rounded-xl transition-all" title="Adicionar ao Google Agenda">
                            <i data-lucide="share-2" class="w-4 h-4"></i>
                        </button>
                        <button onclick="downloadICSFile('${evt.id}')" class="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 p-2 rounded-xl transition-all" title="Baixar arquivo .ics">
                            <i data-lucide="download" class="w-4 h-4"></i>
                        </button>
                        <button onclick="deleteEvent('${evt.id}')" class="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 p-2 rounded-xl transition-all" title="Excluir agendamento">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    ` : ''}
                </div>

            </div>
        `;
    }).join('');

    lucide.createIcons();
}

// Render Calendar Grid Month View
function renderCalendarGrid() {
    const gridContainer = document.getElementById('calendar-days-grid');
    const monthYearTitle = document.getElementById('calendar-month-year');
    if (!gridContainer || !monthYearTitle) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    monthYearTitle.textContent = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    let gridHTML = '';

    for (let i = 0; i < firstDayIndex; i++) {
        gridHTML += `<div class="bg-black/30 min-h-[90px] rounded-xl p-1.5 opacity-30"></div>`;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let day = 1; day <= totalDays; day++) {
        const monthFormatted = String(month + 1).padStart(2, '0');
        const dayFormatted = String(day).padStart(2, '0');
        const dateStr = `${year}-${monthFormatted}-${dayFormatted}`;

        const dayEvents = eventsData.filter(e => e.date === dateStr);
        const isToday = dateStr === todayStr;

        gridHTML += `
            <div class="bg-black border ${isToday ? 'border-orange-500 font-black' : 'border-zinc-800/80'} min-h-[100px] rounded-xl p-2 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                <div class="flex items-center justify-between text-xs">
                    <span class="px-1.5 py-0.5 rounded ${isToday ? 'bg-orange-500 text-black' : 'text-zinc-400'}">${day}</span>
                    ${dayEvents.length > 0 ? `<span class="text-[10px] text-orange-400 font-bold">${dayEvents.length} evt</span>` : ''}
                </div>
                <div class="space-y-1 my-1 overflow-y-auto max-h-[70px] scrollbar-none">
                    ${dayEvents.map(evt => `
                        <div onclick="openEventDetailModal('${evt.id}')" class="bg-zinc-900 hover:bg-zinc-800 p-1.5 rounded text-[10px] cursor-pointer truncate border-l-2 ${evt.hasCOMedia ? 'border-pink-500' : 'border-orange-500'} font-medium text-zinc-200">
                            ${evt.startTime || '00:00'} ${evt.title || 'Sem título'}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    gridContainer.innerHTML = gridHTML;
}

function prevMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendarGrid();
}

function nextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendarGrid();
}

function currentMonth() {
    currentCalendarDate = new Date();
    renderCalendarGrid();
}

// Render Fichas Técnicas Tab (Operator / C.O.)
function renderFichasTecnicas() {
    const container = document.getElementById('fichas-container');
    if (!container) return;

    if (!isOperatorLoggedIn) {
        container.innerHTML = `
            <div class="text-center py-12 bg-black border border-zinc-800 rounded-2xl p-6">
                <i data-lucide="lock" class="w-12 h-12 mx-auto text-orange-500 mb-3"></i>
                <h3 class="text-lg font-black text-white">Acesso Restrito ao Operador</h3>
                <p class="text-xs text-zinc-400 mt-1 max-w-md mx-auto">Esta seção é reservada para a equipe do C.O. e TI consultar as especificações de cada evento. Faça login para continuar.</p>
                <button onclick="openOperatorLoginModal()" class="mt-4 bg-orange-500 text-black font-black text-xs px-5 py-2.5 rounded-xl hover:bg-orange-400 shadow-lg">Fazer Login de Operador</button>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    if (eventsData.length === 0) {
        container.innerHTML = `<p class="text-zinc-500 text-xs text-center py-8">Nenhuma ficha técnica cadastrada.</p>`;
        return;
    }

    const sorted = [...eventsData].sort((a, b) => ((a.date || '') + (a.startTime || '')).localeCompare((b.date || '') + (b.startTime || '')));

    container.innerHTML = sorted.map((evt, index) => {
        return `
            <div class="bg-black border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl">
                
                <!-- Ficha Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-4 gap-2">
                    <div>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs font-mono font-bold text-orange-500">FICHA #${index + 1}</span>
                            <span class="text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">${evt.department || 'Geral'}</span>
                        </div>
                        <h3 class="text-lg font-black text-white mt-1">${evt.title || 'Sem título'}</h3>
                        <p class="text-xs text-zinc-400">Solicitante: <strong class="text-zinc-200">${evt.applicantName || 'Não informado'}</strong> (${evt.applicantEmail || 'Sem e-mail'}) - Tel: ${evt.applicantPhone || 'N/I'}</p>
                    </div>

                    <div class="flex items-center space-x-2">
                        <button onclick="addSingleEventToGoogleCalendar('${evt.id}')" class="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 font-bold">
                            <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
                            <span>Google Agenda</span>
                        </button>
                        <button onclick="printFichaPDF('${evt.id}')" class="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 font-bold">
                            <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                            <span>Imprimir Ficha</span>
                        </button>
                    </div>
                </div>

                <!-- Spec Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    
                    <!-- Col 1: Agenda & Logística -->
                    <div class="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                        <h4 class="font-bold text-orange-400 uppercase text-[11px] tracking-wider flex items-center space-x-1">
                            <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                            <span>Agenda & Logística</span>
                        </h4>
                        <div><strong class="text-zinc-400">Data:</strong> <span class="text-white">${formatDateBR(evt.date)}</span></div>
                        <div><strong class="text-zinc-400">Horário:</strong> <span class="text-white">${evt.startTime || '00:00'} às ${evt.endTime || '00:00'}</span></div>
                        <div><strong class="text-zinc-400">Setup Pré-evento:</strong> <span class="text-amber-400 font-bold">${evt.setupBuffer || '30 min'}</span></div>
                        <div><strong class="text-zinc-400">Tipo:</strong> <span class="text-white">${evt.eventType || 'Interno'}</span></div>
                        <div><strong class="text-zinc-400">Público:</strong> <span class="text-white">${evt.numAttendees || 0} pessoas (${evt.numExternalGuests || 0} externos)</span></div>
                        <div><strong class="text-zinc-400">Coffee Break:</strong> <span class="text-white">${evt.hasCatering || 'Não'} ${evt.cateringTime ? `(${evt.cateringTime})` : ''}</span></div>
                    </div>

                    <!-- Col 2: Mídia & C.O. -->
                    <div class="bg-zinc-950 p-4 rounded-xl border border-pink-500/20 space-y-2">
                        <h4 class="font-bold text-pink-400 uppercase text-[11px] tracking-wider flex items-center space-x-1">
                            <i data-lucide="tv" class="w-3.5 h-3.5"></i>
                            <span>Operação C.O. & Mídias</span>
                        </h4>
                        <div><strong class="text-zinc-400">Mídia C.O.:</strong> <span class="${evt.hasCOMedia ? 'text-pink-400 font-bold' : 'text-zinc-500'}">${evt.hasCOMedia ? 'SIM (Requer Exibição)' : 'Não'}</span></div>
                        ${evt.hasSpecificClient ? `<div><strong class="text-zinc-400">Cliente:</strong> <span class="text-blue-400 font-bold">${evt.clientName || 'Cliente'}</span></div>` : ''}
                        ${evt.hasCOMedia ? `
                            <div><strong class="text-zinc-400">Tipo de Mídia:</strong> <span class="text-white">${evt.coMediaType || 'Vídeo em Loop'}</span></div>
                            <div><strong class="text-zinc-400">Formato:</strong> <span class="text-white">${evt.coMediaFormat || '16:9 Full HD'}</span></div>
                            <div><strong class="text-zinc-400">Teste Prévio C.O.:</strong> <span class="text-white">${evt.coTestNeeded || 'Não'} ${evt.coTestDatetime ? `(${evt.coTestDatetime.replace('T', ' ')})` : ''}</span></div>
                            ${evt.coMediaUrl ? `<div class="pt-1"><a href="${evt.coMediaUrl}" target="_blank" class="text-pink-400 underline font-bold flex items-center space-x-1"><i data-lucide="external-link" class="w-3 h-3"></i><span>Abrir Arquivos de Mídia</span></a></div>` : ''}
                        ` : ''}
                    </div>

                    <!-- Col 3: TI, AV & Palco -->
                    <div class="bg-zinc-950 p-4 rounded-xl border border-cyan-500/20 space-y-2">
                        <h4 class="font-bold text-cyan-400 uppercase text-[11px] tracking-wider flex items-center space-x-1">
                            <i data-lucide="mic" class="w-3.5 h-3.5"></i>
                            <span>Palco & Equipamentos AV</span>
                        </h4>
                        <div><strong class="text-zinc-400">Apresentadores:</strong> <span class="text-white">${evt.numPresenters || 1} no palco</span></div>
                        <div><strong class="text-zinc-400">Apresentações:</strong> <span class="text-white">${evt.numPresentations || 1} em ${evt.presentationFormat || 'PowerPoint'}</span></div>
                        <div><strong class="text-zinc-400">Dispositivo:</strong> <span class="text-white">${evt.presentationDevice || 'Notebook do Auditório'}</span></div>
                        <div><strong class="text-zinc-400">Microfones:</strong> <span class="text-white">${evt.micsHandheld || 0} mão, ${evt.micsLapel || 0} lapela, ${evt.micsAudience || 0} plateia</span></div>
                        <div><strong class="text-zinc-400">Layout Palco:</strong> <span class="text-white">${evt.stageLayout || 'Púlpito'}</span></div>
                        <div><strong class="text-zinc-400">Transmissão:</strong> <span class="text-white">${evt.streamingType || 'Presencial'}</span></div>
                        <div class="text-[11px] text-cyan-300 font-semibold pt-1">
                            ${evt.needPassador ? '✓ Passador' : ''} ${evt.needStageMonitor ? '✓ Retorno' : ''} ${evt.needTISupport ? '✓ Suporte TI' : ''}
                        </div>
                    </div>

                </div>

                ${evt.coInstructions || evt.logisticsNotes ? `
                    <div class="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 text-xs space-y-1">
                        ${evt.coInstructions ? `<p><strong class="text-pink-400">Instruções C.O.:</strong> <span class="text-zinc-300">${evt.coInstructions}</span></p>` : ''}
                        ${evt.logisticsNotes ? `<p><strong class="text-emerald-400">Instruções Logística:</strong> <span class="text-zinc-300">${evt.logisticsNotes}</span></p>` : ''}
                    </div>
                ` : ''}

            </div>
        `;
    }).join('');

    lucide.createIcons();
}

// Modal Detail View
function openEventDetailModal(eventId) {
    const rawEvt = eventsData.find(e => e.id === eventId);
    if (!rawEvt) return;
    const evt = normalizeEvent(rawEvt);

    const modal = document.getElementById('event-modal');
    const content = document.getElementById('modal-content');

    const formattedDate = formatDateBR(evt.date);

    if (isOperatorLoggedIn) {
        // Full Detailed Modal for Operators
        content.innerHTML = `
            <div class="space-y-6">
                <!-- Header -->
                <div class="border-b border-zinc-800 pb-4">
                    <div class="flex items-center justify-between">
                        <span class="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                            ${evt.department || 'Geral'}
                        </span>
                        <span class="text-xs text-zinc-500 font-mono">ID: ${evt.id}</span>
                    </div>
                    <h2 class="text-xl font-black text-white mt-2">${evt.title || 'Sem título'}</h2>
                    <p class="text-xs text-zinc-400 mt-1">Solicitado por <strong class="text-zinc-200">${evt.applicantName || 'Não informado'}</strong> (${evt.applicantEmail || 'Sem e-mail'}) - Contato: ${evt.applicantPhone || 'N/A'}</p>
                </div>

                <!-- Google Agenda Callout Box (OPERADOR) -->
                <div class="bg-gradient-to-r from-blue-950/60 to-zinc-900 border border-blue-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                    <div class="flex items-center space-x-3">
                        <div class="bg-blue-600 p-2.5 rounded-xl text-white">
                            <i data-lucide="share-2" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h4 class="text-xs font-bold text-blue-300">Integração Google Agenda</h4>
                            <p class="text-[11px] text-zinc-400">Exclusivo Operador: Adicione esta reunião diretamente na sua agenda institucional.</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2 w-full sm:w-auto">
                        <button onclick="addSingleEventToGoogleCalendar('${evt.id}')" class="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md">
                            + Google Agenda
                        </button>
                        <button onclick="downloadICSFile('${evt.id}')" class="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs px-3 py-2 rounded-xl transition-all" title="Baixar .ics">
                            <i data-lucide="download" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>

                <!-- Specs Breakdown -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    <!-- Bloco Agenda -->
                    <div class="bg-black p-4 rounded-xl border border-zinc-800 space-y-2">
                        <h4 class="font-bold text-orange-500 uppercase text-[11px] tracking-wider">Horários & Tipo</h4>
                        <div><strong class="text-zinc-400">Data:</strong> <span class="text-white">${formattedDate}</span></div>
                        <div><strong class="text-zinc-400">Horário:</strong> <span class="text-white">${evt.startTime || '00:00'} às ${evt.endTime || '00:00'}</span></div>
                        <div><strong class="text-zinc-400">Setup Pré-evento:</strong> <span class="text-amber-400 font-bold">${evt.setupBuffer || '30 min'}</span></div>
                        <div><strong class="text-zinc-400">Tipo de Evento:</strong> <span class="text-white">${evt.eventType || 'Interno'}</span></div>
                        <div><strong class="text-zinc-400">Público Esperado:</strong> <span class="text-white">${evt.numAttendees || 0} pessoas</span></div>
                    </div>

                    <!-- Bloco Mídia C.O. -->
                    <div class="bg-black p-4 rounded-xl border border-pink-500/20 space-y-2">
                        <h4 class="font-bold text-pink-400 uppercase text-[11px] tracking-wider">Mídia & C.O.</h4>
                        <div><strong class="text-zinc-400">Exibição C.O.:</strong> <span class="${evt.hasCOMedia ? 'text-pink-400 font-bold' : 'text-zinc-500'}">${evt.hasCOMedia ? 'SIM' : 'Não'}</span></div>
                        ${evt.hasSpecificClient ? `<div><strong class="text-zinc-400">Cliente Específico:</strong> <span class="text-blue-400 font-bold">${evt.clientName || 'Cliente'}</span></div>` : ''}
                        ${evt.hasCOMedia ? `
                            <div><strong class="text-zinc-400">Tipo Mídia:</strong> <span class="text-white">${evt.coMediaType || 'Vídeo em Loop'}</span></div>
                            <div><strong class="text-zinc-400">Resolução:</strong> <span class="text-white">${evt.coMediaFormat || '16:9 Full HD'}</span></div>
                            ${evt.coMediaUrl ? `<div class="pt-1"><a href="${evt.coMediaUrl}" target="_blank" class="text-pink-400 underline font-bold flex items-center space-x-1"><i data-lucide="external-link" class="w-3 h-3"></i><span>Link da Mídia</span></a></div>` : ''}
                        ` : ''}
                    </div>

                    <!-- Bloco Palco & AV -->
                    <div class="bg-black p-4 rounded-xl border border-cyan-500/20 space-y-2 md:col-span-2">
                        <h4 class="font-bold text-cyan-400 uppercase text-[11px] tracking-wider">Configuração de Palco & Som</h4>
                        <div class="grid grid-cols-2 gap-2">
                            <div><strong class="text-zinc-400">Apresentadores:</strong> <span class="text-white">${evt.numPresenters || 1}</span></div>
                            <div><strong class="text-zinc-400">Layout Palco:</strong> <span class="text-white">${evt.stageLayout || 'Púlpito'}</span></div>
                            <div><strong class="text-zinc-400">Microfones Mão:</strong> <span class="text-white">${evt.micsHandheld || 0}</span></div>
                            <div><strong class="text-zinc-400">Microfones Lapela:</strong> <span class="text-white">${evt.micsLapel || 0}</span></div>
                            <div><strong class="text-zinc-400">Transmissão:</strong> <span class="text-white">${evt.streamingType || 'Presencial'}</span></div>
                            <div><strong class="text-zinc-400">Suporte TI:</strong> <span class="text-white">${evt.needTISupport ? 'Sim (Local)' : 'Não'}</span></div>
                        </div>
                    </div>

                </div>

                <!-- Footer Actions -->
                <div class="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <button onclick="deleteEvent('${evt.id}')" class="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center space-x-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                        <span>Cancelar Reserva</span>
                    </button>
                    <button onclick="closeEventModal()" class="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all">
                        Fechar
                    </button>
                </div>
            </div>
        `;
    } else {
        // Public / Collaborator Clean Summary View
        content.innerHTML = `
            <div class="space-y-6">
                <!-- Header -->
                <div class="border-b border-zinc-800 pb-4">
                    <div class="flex items-center justify-between">
                        <span class="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                            ${evt.department || 'Geral'}
                        </span>
                        <span class="px-2.5 py-0.5 rounded text-[11px] font-bold bg-zinc-900 text-zinc-300">
                            ${evt.eventType || 'Interno'}
                        </span>
                    </div>
                    <h2 class="text-xl font-black text-white mt-2">${evt.title || 'Sem título'}</h2>
                    <p class="text-xs text-zinc-400 mt-1">Reservado por <strong class="text-zinc-200">${evt.applicantName || 'Não informado'}</strong></p>
                </div>

                <!-- Info Box -->
                <div class="bg-black p-5 rounded-2xl border border-zinc-800 space-y-3 text-sm">
                    <div class="flex items-center justify-between">
                        <span class="text-zinc-400">Data do Evento:</span>
                        <span class="font-bold text-white flex items-center space-x-2">
                            <i data-lucide="calendar" class="w-4 h-4 text-orange-500"></i>
                            <span>${formattedDate}</span>
                        </span>
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-zinc-400">Horário Reservado:</span>
                        <span class="font-bold text-orange-400 flex items-center space-x-2">
                            <i data-lucide="clock" class="w-4 h-4"></i>
                            <span>${evt.startTime || '00:00'} às ${evt.endTime || '00:00'}</span>
                        </span>
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-zinc-400">Departamento:</span>
                        <span class="font-medium text-zinc-200">${evt.department || 'Geral'}</span>
                    </div>

                    ${evt.hasSpecificClient ? `
                        <div class="flex items-center justify-between border-t border-zinc-800 pt-2">
                            <span class="text-zinc-400">Cliente Relacionado:</span>
                            <span class="font-bold text-blue-400">${evt.clientName || 'Cliente'}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400">
                    <p class="flex items-center space-x-2">
                        <i data-lucide="info" class="w-4 h-4 text-orange-500 flex-shrink-0"></i>
                        <span>Para ver requisitos técnicos detalhados de áudio e vídeo, consulte a equipe do C.O. na Área do Operador.</span>
                    </p>
                </div>

                <!-- Footer -->
                <div class="flex justify-end pt-2 border-t border-zinc-800">
                    <button onclick="closeEventModal()" class="bg-orange-500 hover:bg-orange-400 text-black font-black text-xs px-6 py-2.5 rounded-xl transition-all">
                        Entendi
                    </button>
                </div>
            </div>
        `;
    }

    modal.classList.remove('hidden');
    lucide.createIcons();
}

function closeEventModal() {
    document.getElementById('event-modal').classList.add('hidden');
}

// Multi-step Form Controls
function goToStep(step) {
    if (step > currentStep) {
        if (!validateStep(currentStep)) return;
    }

    currentStep = step;

    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`form-step-${i}`);
        const indicator = document.getElementById(`step-indicator-${i}`);
        if (stepEl) {
            if (i === step) {
                stepEl.classList.remove('hidden');
            } else {
                stepEl.classList.add('hidden');
            }
        }
        if (indicator) {
            if (i === step) {
                indicator.className = "py-2.5 px-1 border-b-2 border-orange-500 text-orange-400 font-extrabold";
            } else if (i < step) {
                indicator.className = "py-2.5 px-1 border-b-2 border-emerald-500 text-emerald-400 font-bold";
            } else {
                indicator.className = "py-2.5 px-1 border-b-2 border-zinc-800 text-zinc-600 font-bold";
            }
        }
    }
}

function validateStep(step) {
    if (step === 1) {
        const title = document.getElementById('event_title').value.trim();
        const name = document.getElementById('applicant_name').value.trim();
        const email = document.getElementById('applicant_email').value.trim();
        const dept = document.getElementById('department').value;
        const date = document.getElementById('event_date').value;
        const start = document.getElementById('start_time').value;
        const end = document.getElementById('end_time').value;

        if (!title || !name || !email || !dept || !date || !start || !end) {
            alert('Por favor, preencha todos os campos obrigatórios (*) do Passo 1!');
            return false;
        }

        // Validação de Conflito de Horário
        const conflict = findTimeConflict(date, start, end);
        if (conflict) {
            if (conflict.isInvalidRange) {
                alert('O horário de término deve ser posterior ao horário de início!');
                return false;
            }
            const confirmOverride = confirm(
                `ATENÇÃO: Já existe uma reserva cadastrada para este horário!\n\n` +
                `Evento em conflito: "${conflict.title}"\n` +
                `Horário: ${conflict.startTime} às ${conflict.endTime}\n` +
                `Solicitante: ${conflict.applicantName} (${conflict.department})\n\n` +
                `Deseja ajustar os horários antes de prosseguir? Clique em "Cancelar" para escolher outro horário.`
            );
            if (!confirmOverride) return false;
        }
    }
    return true;
}

function toggleClientInput() {
    const checked = document.getElementById('has_specific_client').checked;
    const container = document.getElementById('client_name_container');
    if (checked) {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

function toggleCOMediaOptions() {
    const checked = document.getElementById('has_co_media').checked;
    const container = document.getElementById('co_media_options');
    if (checked) {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

function toggleCateringDetails() {
    const val = document.getElementById('has_catering').value;
    const container = document.getElementById('catering_time_container');
    if (val !== 'Não') {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

// Handle New Event Form Submit
async function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateStep(1)) return;

    const rawEvent = {
        id: 'evt-' + Date.now(),
        title: document.getElementById('event_title').value.trim(),
        applicantName: document.getElementById('applicant_name').value.trim(),
        applicantEmail: document.getElementById('applicant_email').value.trim(),
        applicantPhone: document.getElementById('applicant_phone').value.trim(),
        department: document.getElementById('department').value,
        date: document.getElementById('event_date').value,
        startTime: document.getElementById('start_time').value,
        endTime: document.getElementById('end_time').value,
        setupBuffer: document.getElementById('setup_buffer').value,
        eventType: document.querySelector('input[name="event_type"]:checked')?.value || 'Interno',
        
        hasSpecificClient: document.getElementById('has_specific_client').checked,
        clientName: document.getElementById('client_name').value.trim(),
        
        hasCOMedia: document.getElementById('has_co_media').checked,
        coMediaType: document.getElementById('co_media_type').value,
        coMediaFormat: document.getElementById('co_media_format').value,
        coMediaUrl: document.getElementById('co_media_url').value.trim(),
        coTestNeeded: document.querySelector('input[name="co_test_needed"]:checked')?.value || 'Não',
        coTestDatetime: document.getElementById('co_test_datetime').value,
        coInstructions: document.getElementById('co_instructions').value.trim(),

        numPresentations: document.getElementById('num_presentations').value,
        presentationFormat: document.getElementById('presentation_format').value,
        presentationDevice: document.getElementById('presentation_device').value,
        numPresenters: document.getElementById('num_presenters').value,
        micsHandheld: document.getElementById('mics_handheld').value,
        micsLapel: document.getElementById('mics_lapel').value,
        micsAudience: document.getElementById('mics_audience').value,
        stageLayout: document.getElementById('stage_layout').value,
        streamingType: document.getElementById('streaming_type').value,
        needPassador: document.getElementById('need_passador').checked,
        needStageMonitor: document.getElementById('need_stage_monitor').checked,
        needTISupport: document.getElementById('need_ti_support').checked,

        numAttendees: document.getElementById('num_attendees').value,
        numExternalGuests: document.getElementById('num_external_guests').value,
        hasCatering: document.getElementById('has_catering').value,
        cateringTime: document.getElementById('catering_time').value,
        logisticsNotes: document.getElementById('logistics_notes').value.trim()
    };

    const newEvent = normalizeEvent(rawEvent);

    eventsData.unshift(newEvent);
    saveEventsToStorage();

    // Salva no Supabase se configurado
    if (supabaseClient) {
        try {
            await supabaseClient.from('auditorio_events').insert([newEvent]);
        } catch (err) {
            console.warn('Erro ao salvar no Supabase:', err);
        }
    }

    // Envio Automático para o Slack
    sendSlackNotification(newEvent);

    // Envio Automático de E-mail de Confirmação (EmailJS)
    sendEmailConfirmation(newEvent);

    resetForm();
    switchTab('calendar');

    showToast('Agendamento cadastrado com sucesso!');

    // Abre o modal de detalhes do evento
    openEventDetailModal(newEvent.id);
}

function resetForm() {
    const form = document.getElementById('booking-form');
    if (form) form.reset();
    goToStep(1);
    document.getElementById('client_name_container')?.classList.add('hidden');
    document.getElementById('co_media_options')?.classList.add('hidden');
    document.getElementById('catering_time_container')?.classList.add('hidden');
    document.getElementById('conflict-alert-banner')?.classList.add('hidden');
}

async function deleteEvent(eventId) {
    if (!isOperatorLoggedIn) {
        openOperatorLoginModal();
        return;
    }
    if (confirm('Tem certeza de que deseja cancelar e excluir esta reserva?')) {
        eventsData = eventsData.filter(e => e.id !== eventId);
        saveEventsToStorage();

        if (supabaseClient) {
            try {
                await supabaseClient.from('auditorio_events').delete().eq('id', eventId);
            } catch (err) {
                console.warn('Erro ao excluir no Supabase:', err);
            }
        }

        closeEventModal();
        renderEvents();
        renderFichasTecnicas();
        renderCalendarGrid();
        showToast('Reserva excluída com sucesso.');
    }
}

// ==========================================
// INTEGRAÇÃO: SLACK NOTIFICATION
// ==========================================
async function sendSlackNotification(evt) {
    const webhookUrl = localStorage.getItem('eletro_slack_webhook_url');
    if (!webhookUrl) return;

    const formattedDate = formatDateBR(evt.date);
    const totalMics = (parseInt(evt.micsHandheld) || 0) + (parseInt(evt.micsLapel) || 0) + (parseInt(evt.micsAudience) || 0);

    const payload = {
        text: `🗓️ *Novo Agendamento no Auditório Eletromidia!*\n*Evento:* ${evt.title}\n*Data:* ${formattedDate} (${evt.startTime} às ${evt.endTime})\n*Solicitante:* ${evt.applicantName} (${evt.department})\n*Mídia C.O.:* ${evt.hasCOMedia ? 'SIM' : 'Não'}\n*Microfones:* ${totalMics}`,
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "🗓️ Novo Agendamento do Auditório",
                    emoji: true
                }
            },
            {
                type: "section",
                fields: [
                    { type: "mrkdwn", text: `*Evento:*\n${evt.title}` },
                    { type: "mrkdwn", text: `*Departamento:*\n${evt.department}` },
                    { type: "mrkdwn", text: `*Data & Horário:*\n${formattedDate} (${evt.startTime} - ${evt.endTime})` },
                    { type: "mrkdwn", text: `*Solicitante:*\n${evt.applicantName}` },
                    { type: "mrkdwn", text: `*Mídia C.O.:*\n${evt.hasCOMedia ? '✅ SIM (Videowall)' : '❌ Não'}` },
                    { type: "mrkdwn", text: `*Setup Técnico:*\n${evt.numPresenters} apresentador(es) | ${totalMics} mic(s)` }
                ]
            },
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: `*Auditório Principal Eletromidia HQ* | Notificação Automática`
                    }
                ]
            }
        ]
    };

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors', // Permite envio direto do navegador via webhook
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log('Notificação enviada ao Slack com sucesso.');
    } catch (e) {
        console.warn('Erro ao enviar mensagem ao Slack:', e);
    }
}

async function testSlackNotification() {
    const webhookUrl = document.getElementById('slack_webhook_url')?.value.trim();
    if (!webhookUrl) {
        alert('Por favor, cole o URL do Webhook do Slack antes de testar!');
        return;
    }

    const testPayload = {
        text: "⚡ *Teste de Conexão - Auditório Eletromidia*\nO bot de notificações do Slack foi configurado e está funcionando perfeitamente! 🚀"
    };

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });
        showToast('Mensagem de teste enviada ao Slack! Verifique seu canal.');
    } catch (e) {
        alert('Falha ao enviar mensagem de teste ao Slack. Verifique o URL.');
    }
}

// ==========================================
// INTEGRAÇÃO: EMAILJS CONFIRMATION
// ==========================================
async function sendEmailConfirmation(evt) {
    const serviceId = localStorage.getItem('eletro_emailjs_service_id');
    const templateId = localStorage.getItem('eletro_emailjs_template_id');

    if (!serviceId || !templateId || !window.emailjs || !evt.applicantEmail) return;

    const templateParams = {
        to_name: evt.applicantName,
        to_email: evt.applicantEmail,
        event_title: evt.title,
        event_date: formatDateBR(evt.date),
        event_time: `${evt.startTime} às ${evt.endTime}`,
        department: evt.department,
        event_type: evt.eventType
    };

    try {
        await emailjs.send(serviceId, templateId, templateParams);
        console.log('E-mail de confirmação enviado via EmailJS com sucesso.');
    } catch (e) {
        console.warn('Erro ao disparar e-mail pelo EmailJS:', e);
    }
}

// Google Calendar Sync Functions (EXCLUSIVE TO OPERATORS)
function addSingleEventToGoogleCalendar(eventId) {
    if (!isOperatorLoggedIn) {
        alert('A vinculação ao Google Agenda é uma função exclusiva da Área do Operador!');
        openOperatorLoginModal();
        return;
    }

    const rawEvt = eventsData.find(e => e.id === eventId);
    if (!rawEvt) return;
    const evt = normalizeEvent(rawEvt);

    const startIso = (evt.date || '').replace(/-/g, '') + 'T' + (evt.startTime || '00:00').replace(':', '') + '00';
    const endIso = (evt.date || '').replace(/-/g, '') + 'T' + (evt.endTime || '00:00').replace(':', '') + '00';

    const title = encodeURIComponent(`[Auditório Eletromidia] ${evt.title}`);
    let detailsStr = `Solicitante: ${evt.applicantName} (${evt.department})\n`;
    detailsStr += `Tipo: ${evt.eventType}\n`;
    if (evt.hasSpecificClient) detailsStr += `Cliente: ${evt.clientName}\n`;
    if (evt.hasCOMedia) detailsStr += `Mídia C.O.: ${evt.coMediaType} (${evt.coMediaUrl || 'Link pendente'})\n`;
    detailsStr += `AV: ${evt.numPresenters} apresentador(es), ${evt.micsHandheld} mic(s) mão, ${evt.micsLapel} lapela.\n`;
    detailsStr += `Observações C.O.: ${evt.coInstructions || 'N/A'}`;

    const details = encodeURIComponent(detailsStr);
    const location = encodeURIComponent('Auditório Principal - Eletromidia HQ');

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;

    window.open(gcalUrl, '_blank');
}

function downloadICSFile(eventId) {
    const rawEvt = eventsData.find(e => e.id === eventId);
    if (!rawEvt) return;
    const evt = normalizeEvent(rawEvt);

    const startIso = (evt.date || '').replace(/-/g, '') + 'T' + (evt.startTime || '00:00').replace(':', '') + '00';
    const endIso = (evt.date || '').replace(/-/g, '') + 'T' + (evt.endTime || '00:00').replace(':', '') + '00';

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Eletromidia//Agenda Auditorio//PT
BEGIN:VEVENT
SUMMARY:[Auditório Eletromidia] ${evt.title}
DESCRIPTION:Solicitante: ${evt.applicantName} (${evt.department})
LOCATION:Auditório Principal - Eletromidia HQ
DTSTART:${startIso}
DTEND:${endIso}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `agendamento_${evt.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function copyWebCalLink() {
    navigator.clipboard.writeText("webcal://eletromidia.com.br/api/auditorio/ical.ics");
    showToast('Link do iCal copiado para a área de transferência!');
}

function printFichaPDF(eventId) {
    window.print();
}

function exportAllFichasPDF() {
    window.print();
}

// Helpers
function formatDateBR(dateStr) {
    if (!dateStr || dateStr === 'undefined') return 'Data N/I';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');

    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 4000);
}
