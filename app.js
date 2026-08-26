// App State
let events = [];
let currentFilter = 'all';
let currentViewMode = 'cards';
let currentSearch = '';
let currentFormStep = 1;
let selectedDateGrid = new Date();

// Operator/Admin Authentication State
let isOperatorLoggedIn = false;
let currentOperatorRole = 'Diretor / Admin';

// Configuração de Usuários do Sistema (Pode ser estendido conforme necessário)
const systemUsers = [
    { user: 'diretor', pass: 'ELT@Estudio', role: 'Diretor / Admin' },
    { user: 'operador', pass: '2026', role: 'Operador C.O. & TI' }
];

// Pre-populated Sample Events for Eletromidia Auditório
const defaultEvents = [
    {
        id: 'evt-1',
        title: 'Pitch Comercial - Conta Itaú 2026',
        applicant_name: 'Mariana Silva',
        applicant_email: 'mariana.silva@eletromidia.com.br',
        department: 'Comercial',
        applicant_phone: '(11) 98888-1234',
        date: getOffsetDateString(0), // Hoje
        start_time: '14:00',
        end_time: '16:00',
        setup_buffer: '30 min',
        event_type: 'Cliente Externo',
        
        // Mídia & C.O.
        has_specific_client: true,
        client_name: 'Itaú Unibanco',
        has_co_media: true,
        co_media_type: 'Vinheta de Abertura / Encerramento',
        co_media_format: 'Formato Customizado do Videowall',
        co_media_url: 'https://drive.google.com/drive/folders/itau-eletromidia-2026',
        co_test_needed: 'Sim',
        co_test_datetime: getOffsetDateString(0) + 'T11:00',
        co_instructions: 'Exibir vinheta de boas-vindas do Itaú assim que o cliente chegar às 13h50 no auditório.',

        // AV & Palco
        num_presentations: 2,
        presentation_format: 'PowerPoint (.pptx)',
        presentation_device: 'Notebook do Auditório (Recomendado)',
        num_presenters: 3,
        mics_handheld: 2,
        mics_lapel: 2,
        mics_audience: 1,
        stage_layout: 'Poltronas / Lounge de Bate-Papo',
        streaming_type: 'Microsoft Teams',
        need_passador: true,
        need_stage_monitor: true,
        need_ti_support: true,

        // Logística
        num_attendees: 25,
        num_external_guests: 8,
        has_catering: 'Sim (No Foyer do Auditório)',
        catering_time: '15:30',
        logistics_notes: 'Liberar entrada dos convidados do Itaú na portaria principal.',
        created_at: new Date().toISOString()
    },
    {
        id: 'evt-2',
        title: 'Townhall Geral - Lançamento Q3 Eletromidia',
        applicant_name: 'Carlos Edu',
        applicant_email: 'carlos.edu@eletromidia.com.br',
        department: 'Recursos Humanos / Gente & Gestão',
        applicant_phone: '(11) 97777-4321',
        date: getOffsetDateString(2), // Daqui a 2 dias
        start_time: '10:00',
        end_time: '12:00',
        setup_buffer: '60 min',
        event_type: 'Townhall / Empresa',
        
        // Mídia & C.O.
        has_specific_client: false,
        client_name: '',
        has_co_media: true,
        co_media_type: 'Vídeo em Loop no Videowall',
        co_media_format: '16:9 4K (3840x2160)',
        co_media_url: 'https://drive.google.com/drive/folders/townhall-q3',
        co_test_needed: 'Não',
        co_test_datetime: '',
        co_instructions: 'Vídeo em loop do manifesto da Eletromidia durante o credenciamento.',

        // AV & Palco
        num_presentations: 1,
        presentation_format: 'PowerPoint (.pptx)',
        presentation_device: 'Notebook do Auditório (Recomendado)',
        num_presenters: 2,
        mics_handheld: 1,
        mics_lapel: 1,
        mics_audience: 2,
        stage_layout: 'Púlpito de Apresentação',
        streaming_type: 'YouTube Live / Gravação',
        need_passador: true,
        need_stage_monitor: true,
        need_ti_support: true,

        // Logística
        num_attendees: 70,
        num_external_guests: 0,
        has_catering: 'Sim (No Foyer do Auditório)',
        catering_time: '11:45',
        logistics_notes: 'Auditório em lotação máxima. Preparar transmissão interna para o Foyer.',
        created_at: new Date().toISOString()
    }
];

// Helper: Format Date String YYYY-MM-DD
function getOffsetDateString(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
}

// Helper: Format Display Date (ex: 26/08/2026)
function formatDateBR(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkOperatorSession();
    loadEvents();
    renderEvents();
    renderFichas();
    renderCalendarGrid();
    setupDefaultDate();
});

// Operator/Admin Session Management
function checkOperatorSession() {
    const logged = sessionStorage.getItem('eletromidia_operator_logged');
    const role = sessionStorage.getItem('eletromidia_operator_role');
    if (logged === 'true') {
        isOperatorLoggedIn = true;
        currentOperatorRole = role || 'Diretor / Admin';
    } else {
        isOperatorLoggedIn = false;
    }
    updateOperatorUI();
}

function updateOperatorUI() {
    const btnLogin = document.getElementById('btn-operator-login');
    const loggedBadge = document.getElementById('operator-logged-badge');
    const roleTitle = document.getElementById('operator-role-title');
    const navFichas = document.getElementById('nav-fichas');
    const navGoogle = document.getElementById('nav-google-settings');

    if (isOperatorLoggedIn) {
        if (btnLogin) btnLogin.classList.add('hidden');
        if (loggedBadge) loggedBadge.classList.remove('hidden');
        if (roleTitle) roleTitle.innerText = currentOperatorRole;
        if (navFichas) navFichas.classList.remove('hidden');
        if (navGoogle) navGoogle.classList.remove('hidden');
    } else {
        if (btnLogin) btnLogin.classList.remove('hidden');
        if (loggedBadge) loggedBadge.classList.add('hidden');
        if (navFichas) navFichas.classList.add('hidden');
        if (navGoogle) navGoogle.classList.add('hidden');
    }
}

function openOperatorLoginModal() {
    document.getElementById('operator-login-modal')?.classList.remove('hidden');
    lucide.createIcons();
}

function closeOperatorLoginModal() {
    document.getElementById('operator-login-modal')?.classList.add('hidden');
}

function handleOperatorLogin(event) {
    event.preventDefault();
    const inputUser = document.getElementById('operator_user')?.value.trim();
    const inputPass = document.getElementById('operator_pass')?.value.trim();

    // Match credentials from systemUsers array
    const matchedUser = systemUsers.find(u => 
        u.user.toLowerCase() === inputUser.toLowerCase() && u.pass === inputPass
    );

    if (matchedUser) {
        isOperatorLoggedIn = true;
        currentOperatorRole = matchedUser.role;
        sessionStorage.setItem('eletromidia_operator_logged', 'true');
        sessionStorage.setItem('eletromidia_operator_role', matchedUser.role);
        updateOperatorUI();
        closeOperatorLoginModal();
        showToast(`Bem-vindo(a), ${matchedUser.role}! Acesso liberado.`);
        switchTab('fichas');
    } else {
        showToast('Login ou senha incorretos.', 'error');
    }
}

function operatorLogout() {
    isOperatorLoggedIn = false;
    sessionStorage.removeItem('eletromidia_operator_logged');
    sessionStorage.removeItem('eletromidia_operator_role');
    updateOperatorUI();
    switchTab('calendar');
    showToast('Sessão encerrada.');
}

function handleRestrictedTab(tabName) {
    if (isOperatorLoggedIn) {
        switchTab(tabName);
    } else {
        openOperatorLoginModal();
    }
}

// Load events from LocalStorage or pre-populate
function loadEvents() {
    const stored = localStorage.getItem('eletromidia_auditorio_events');
    if (stored) {
        try {
            events = JSON.parse(stored);
        } catch (e) {
            events = defaultEvents;
        }
    } else {
        events = defaultEvents;
        saveEvents();
    }
}

function saveEvents() {
    localStorage.setItem('eletromidia_auditorio_events', JSON.stringify(events));
}

function setupDefaultDate() {
    const dateInput = document.getElementById('event_date');
    if (dateInput && !dateInput.value) {
        dateInput.value = getOffsetDateString(0);
    }
}

// Navigation Tabs
function switchTab(tabName) {
    // If user tries to access restricted tabs without login, prompt login
    if ((tabName === 'fichas' || tabName === 'google-settings') && !isOperatorLoggedIn) {
        openOperatorLoginModal();
        return;
    }

    const tabs = ['calendar', 'new-event', 'fichas', 'google-settings'];
    tabs.forEach(t => {
        const tabEl = document.getElementById(`tab-${t}`);
        const navEl = document.getElementById(`nav-${t}`);
        if (tabEl) tabEl.classList.add('hidden');
        if (navEl) {
            navEl.classList.remove('bg-zinc-900', 'text-orange-500', 'border', 'border-orange-500/30');
            navEl.classList.add('text-zinc-400');
        }
    });

    const activeTab = document.getElementById(`tab-${tabName}`);
    const activeNav = document.getElementById(`nav-${tabName}`);
    if (activeTab) activeTab.classList.remove('hidden');
    if (activeNav) {
        activeNav.classList.add('bg-zinc-900', 'text-orange-500', 'border', 'border-orange-500/30');
        activeNav.classList.remove('text-zinc-400');
    }

    if (tabName === 'fichas') renderFichas();
    if (tabName === 'calendar') renderEvents();
}

function openNewEventModal() {
    switchTab('new-event');
    goToStep(1);
}

// Form Multi-step Navigation
function goToStep(stepNumber) {
    // Validate required fields when advancing from Step 1
    if (stepNumber > currentFormStep) {
        if (currentFormStep === 1) {
            const title = document.getElementById('event_title')?.value.trim();
            const applicant = document.getElementById('applicant_name')?.value.trim();
            const email = document.getElementById('applicant_email')?.value.trim();
            const dept = document.getElementById('department')?.value;
            const date = document.getElementById('event_date')?.value;
            const start = document.getElementById('start_time')?.value;
            const end = document.getElementById('end_time')?.value;

            if (!title || !applicant || !email || !dept || !date || !start || !end) {
                showToast('Preencha os campos obrigatórios (*) na Etapa 1 antes de prosseguir.', 'error');
                return;
            }

            // Conflict Check
            const conflict = checkTimeConflict(date, start, end);
            if (conflict) {
                showToast(`Atenção: Já existe um evento agendado neste horário ("${conflict.title}").`, 'warning');
            }
        }
    }

    currentFormStep = stepNumber;
    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`form-step-${i}`);
        const indEl = document.getElementById(`step-indicator-${i}`);
        if (stepEl) {
            if (i === stepNumber) stepEl.classList.remove('hidden');
            else stepEl.classList.add('hidden');
        }
        if (indEl) {
            if (i === stepNumber) {
                indEl.className = 'py-2.5 px-1 border-b-2 border-orange-500 text-orange-400 font-bold';
            } else if (i < stepNumber) {
                indEl.className = 'py-2.5 px-1 border-b-2 border-emerald-500 text-emerald-400 font-bold';
            } else {
                indEl.className = 'py-2.5 px-1 border-b-2 border-zinc-800 text-zinc-600 font-bold';
            }
        }
    }
}

// Dynamic Form Field Toggles
function toggleClientInput() {
    const chk = document.getElementById('has_specific_client');
    const container = document.getElementById('client_name_container');
    if (chk && container) {
        if (chk.checked) container.classList.remove('hidden');
        else container.classList.add('hidden');
    }
}

function toggleCOMediaOptions() {
    const chk = document.getElementById('has_co_media');
    const container = document.getElementById('co_media_options');
    if (chk && container) {
        if (chk.checked) container.classList.remove('hidden');
        else container.classList.add('hidden');
    }
}

function toggleCateringDetails() {
    const select = document.getElementById('has_catering');
    const container = document.getElementById('catering_time_container');
    if (select && container) {
        if (select.value.includes('Sim')) container.classList.remove('hidden');
        else container.classList.add('hidden');
    }
}

// Check Time Conflict
function checkTimeConflict(date, startTime, endTime, excludeId = null) {
    return events.find(e => {
        if (excludeId && e.id === excludeId) return false;
        if (e.date !== date) return false;
        
        // Simple time overlap logic
        return (startTime < e.end_time && endTime > e.start_time);
    });
}

// Submit Booking Form with Custom Validation
function handleFormSubmit(event) {
    event.preventDefault();

    // Field Validations
    const title = document.getElementById('event_title')?.value.trim();
    const applicant_name = document.getElementById('applicant_name')?.value.trim();
    const applicant_email = document.getElementById('applicant_email')?.value.trim();
    const department = document.getElementById('department')?.value;
    const date = document.getElementById('event_date')?.value;
    const start_time = document.getElementById('start_time')?.value;
    const end_time = document.getElementById('end_time')?.value;

    if (!title || !applicant_name || !applicant_email || !department || !date || !start_time || !end_time) {
        showToast('Por favor, preencha todos os campos obrigatórios (*).', 'error');
        goToStep(1);
        return;
    }

    const newEvent = {
        id: 'evt-' + Date.now(),
        title: title,
        applicant_name: applicant_name,
        applicant_email: applicant_email,
        department: department,
        applicant_phone: document.getElementById('applicant_phone')?.value || '',
        date: date,
        start_time: start_time,
        end_time: end_time,
        setup_buffer: document.getElementById('setup_buffer')?.value || '30 min',
        event_type: document.querySelector('input[name="event_type"]:checked')?.value || 'Interno',

        // Mídia & C.O.
        has_specific_client: document.getElementById('has_specific_client')?.checked || false,
        client_name: document.getElementById('client_name')?.value || '',
        has_co_media: document.getElementById('has_co_media')?.checked || false,
        co_media_type: document.getElementById('co_media_type')?.value || '',
        co_media_format: document.getElementById('co_media_format')?.value || '',
        co_media_url: document.getElementById('co_media_url')?.value || '',
        co_test_needed: document.querySelector('input[name="co_test_needed"]:checked')?.value || 'Não',
        co_test_datetime: document.getElementById('co_test_datetime')?.value || '',
        co_instructions: document.getElementById('co_instructions')?.value || '',

        // AV & Palco
        num_presentations: parseInt(document.getElementById('num_presentations')?.value || '1'),
        presentation_format: document.getElementById('presentation_format')?.value || 'PowerPoint (.pptx)',
        presentation_device: document.getElementById('presentation_device')?.value || 'Notebook do Auditório (Recomendado)',
        num_presenters: parseInt(document.getElementById('num_presenters')?.value || '1'),
        mics_handheld: parseInt(document.getElementById('mics_handheld')?.value || '0'),
        mics_lapel: parseInt(document.getElementById('mics_lapel')?.value || '0'),
        mics_audience: parseInt(document.getElementById('mics_audience')?.value || '0'),
        stage_layout: document.getElementById('stage_layout')?.value || 'Púlpito de Apresentação',
        streaming_type: document.getElementById('streaming_type')?.value || 'Sem Transmissão (Presencial Apenas)',
        need_passador: document.getElementById('need_passador')?.checked || false,
        need_stage_monitor: document.getElementById('need_stage_monitor')?.checked || false,
        need_ti_support: document.getElementById('need_ti_support')?.checked || false,

        // Logística
        num_attendees: parseInt(document.getElementById('num_attendees')?.value || '1'),
        num_external_guests: parseInt(document.getElementById('num_external_guests')?.value || '0'),
        has_catering: document.getElementById('has_catering')?.value || 'Não',
        catering_time: document.getElementById('catering_time')?.value || '',
        logistics_notes: document.getElementById('logistics_notes')?.value || '',
        created_at: new Date().toISOString()
    };

    events.unshift(newEvent);
    saveEvents();

    // Re-render UI components
    renderEvents();
    renderFichas();
    renderCalendarGrid();

    showToast('Solicitação enviada com sucesso! Evento registrado no calendário.');
    
    // Reset form
    document.getElementById('booking-form').reset();
    toggleClientInput();
    toggleCOMediaOptions();
    toggleCateringDetails();
    setupDefaultDate();
    goToStep(1);

    // Show modal with the newly created event details & Google Calendar button
    openEventDetailModal(newEvent.id);
}

// Render Event Cards
function renderEvents() {
    const container = document.getElementById('events-cards-view');
    if (!container) return;

    let filtered = events.filter(e => {
        // Filter tabs
        if (currentFilter === 'co' && !e.has_co_media) return false;
        if (currentFilter === 'client' && !e.has_specific_client) return false;
        if (currentFilter === 'today' && e.date !== getOffsetDateString(0)) return false;

        // Search text
        if (currentSearch) {
            const query = currentSearch.toLowerCase();
            const matchTitle = e.title.toLowerCase().includes(query);
            const matchClient = (e.client_name || '').toLowerCase().includes(query);
            const matchApplicant = e.applicant_name.toLowerCase().includes(query);
            const matchDept = e.department.toLowerCase().includes(query);
            return matchTitle || matchClient || matchApplicant || matchDept;
        }

        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full bg-zinc-950 border border-zinc-800/80 rounded-2xl p-12 text-center shadow-xl">
                <i data-lucide="calendar-x" class="w-12 h-12 text-zinc-700 mx-auto mb-3"></i>
                <h3 class="text-base font-bold text-white">Nenhum agendamento encontrado</h3>
                <p class="text-xs text-zinc-400 mt-1">Tente ajustar os filtros de busca ou crie uma nova reserva.</p>
                <button onclick="openNewEventModal()" class="mt-4 bg-orange-500 text-black font-bold px-4 py-2 rounded-lg text-xs hover:bg-orange-400 transition-all">Reservar Novo Evento</button>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    container.innerHTML = filtered.map(e => `
        <div class="bg-zinc-950 border border-zinc-800/80 hover:border-orange-500/50 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all group">
            <div>
                <div class="flex items-start justify-between gap-2 mb-3">
                    <div>
                        <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-2">
                            ${e.event_type}
                        </span>
                        <h3 class="font-bold text-base text-white group-hover:text-orange-400 transition-colors leading-snug">
                            ${e.title}
                        </h3>
                    </div>
                </div>

                <!-- Badges -->
                <div class="flex flex-wrap gap-1.5 mb-4">
                    ${e.has_specific_client ? `<span class="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold flex items-center gap-1"><i data-lucide="briefcase" class="w-3 h-3"></i> ${e.client_name}</span>` : ''}
                    ${e.has_co_media ? `<span class="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] font-bold flex items-center gap-1"><i data-lucide="tv" class="w-3 h-3"></i> Mídia C.O.</span>` : ''}
                    ${e.need_ti_support ? `<span class="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold flex items-center gap-1"><i data-lucide="mic" class="w-3 h-3"></i> Suporte TI</span>` : ''}
                </div>

                <!-- Date & Time Info -->
                <div class="bg-black p-3.5 rounded-xl border border-zinc-800/80 space-y-1.5 text-xs mb-4">
                    <div class="flex items-center justify-between text-zinc-300">
                        <span class="flex items-center gap-1.5 text-orange-400 font-bold">
                            <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                            ${formatDateBR(e.date)}
                        </span>
                        <span class="flex items-center gap-1.5 text-zinc-100 font-extrabold">
                            <i data-lucide="clock" class="w-3.5 h-3.5 text-zinc-500"></i>
                            ${e.start_time} - ${e.end_time}
                        </span>
                    </div>
                    <div class="text-[11px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-900">
                        <span>Solicitante: <strong class="text-zinc-200">${e.applicant_name}</strong></span>
                        <span>Dep: <strong class="text-zinc-200">${e.department}</strong></span>
                    </div>
                </div>

                <!-- Technical Summary -->
                <div class="grid grid-cols-3 gap-2 text-[11px] text-center bg-black/60 p-2.5 rounded-xl border border-zinc-800/60 text-zinc-300 mb-4">
                    <div>
                        <div class="text-zinc-500 text-[9px] uppercase font-bold">Apresentação</div>
                        <div class="font-bold text-white">${e.num_presentations} deck(s)</div>
                    </div>
                    <div>
                        <div class="text-zinc-500 text-[9px] uppercase font-bold">Palco</div>
                        <div class="font-bold text-white">${e.num_presenters} pessoa(s)</div>
                    </div>
                    <div>
                        <div class="text-zinc-500 text-[9px] uppercase font-bold">Microfones</div>
                        <div class="font-bold text-white">${e.mics_handheld + e.mics_lapel + e.mics_audience} mic(s)</div>
                    </div>
                </div>
            </div>

            <div class="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <button onclick="openEventDetailModal('${e.id}')" class="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-2 rounded-xl transition-colors border border-zinc-800 flex items-center justify-center gap-1.5">
                    <i data-lucide="eye" class="w-3.5 h-3.5 text-orange-500"></i>
                    <span>Ver Detalhes</span>
                </button>
                <a href="${buildGoogleCalendarURL(e)}" target="_blank" title="Adicionar ao Google Agenda" class="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl text-xs font-bold flex items-center justify-center transition-colors">
                    <i data-lucide="calendar-plus" class="w-4 h-4"></i>
                </a>
                <button onclick="downloadICSFile('${e.id}')" title="Baixar Arquivo .ICS" class="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 p-2 rounded-xl text-xs font-bold border border-zinc-800 flex items-center justify-center transition-colors">
                    <i data-lucide="download" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

// Render Fichas Técnicas (Full Detailed Print Layout View for Operators & Admin)
function renderFichas() {
    const container = document.getElementById('fichas-container');
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = `<p class="text-xs text-zinc-400">Nenhuma ficha técnica registrada.</p>`;
        return;
    }

    container.innerHTML = events.map(e => `
        <div class="ficha-card bg-black border border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">${e.event_type}</span>
                        ${e.has_specific_client ? `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">CLIENTE: ${e.client_name}</span>` : ''}
                    </div>
                    <h3 class="text-xl font-black text-white">${e.title}</h3>
                    <p class="text-xs text-zinc-400 mt-1">Data: <strong class="text-orange-400">${formatDateBR(e.date)}</strong> | Horário: <strong class="text-white">${e.start_time} às ${e.end_time}</strong> (Setup: ${e.setup_buffer})</p>
                </div>
                <div class="flex items-center space-x-2">
                    <a href="${buildGoogleCalendarURL(e)}" target="_blank" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-colors">
                        <i data-lucide="calendar-plus" class="w-4 h-4"></i>
                        <span>Google Agenda</span>
                    </a>
                    <button onclick="downloadICSFile('${e.id}')" class="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-colors">
                        <i data-lucide="download" class="w-4 h-4"></i>
                        <span>.ICS</span>
                    </button>
                    <button onclick="deleteEvent('${e.id}')" class="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-xl text-xs font-bold transition-colors" title="Cancelar Agendamento">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>

            <!-- Grid 3 Colunas de Especificações -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                
                <!-- Coluna 1: Responsável & Geral -->
                <div class="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-3">
                    <h4 class="font-bold text-orange-400 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                        <i data-lucide="user" class="w-4 h-4"></i>
                        <span>Organização & Contato</span>
                    </h4>
                    <div class="space-y-1 text-zinc-300">
                        <p><strong>Solicitante:</strong> ${e.applicant_name}</p>
                        <p><strong>E-mail:</strong> ${e.applicant_email}</p>
                        <p><strong>Área:</strong> ${e.department}</p>
                        <p><strong>Telefone:</strong> ${e.applicant_phone || 'Não informado'}</p>
                        <p><strong>Participantes Totais:</strong> ${e.num_attendees} pessoas (${e.num_external_guests} externos)</p>
                    </div>
                </div>

                <!-- Coluna 2: C.O. & Mídia -->
                <div class="bg-zinc-950 p-4 rounded-xl border ${e.has_co_media ? 'border-pink-500/30' : 'border-zinc-800/80'} space-y-3">
                    <h4 class="font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5 ${e.has_co_media ? 'text-pink-400' : 'text-zinc-500'}">
                        <i data-lucide="tv" class="w-4 h-4"></i>
                        <span>Painéis & C.O. (Operações)</span>
                    </h4>
                    ${e.has_co_media ? `
                        <div class="space-y-1.5 text-zinc-300">
                            <p><strong>Tipo Mídia:</strong> ${e.co_media_type}</p>
                            <p><strong>Formato:</strong> ${e.co_media_format}</p>
                            <p><strong>Teste Prévia C.O.:</strong> ${e.co_test_needed} ${e.co_test_datetime ? '(' + e.co_test_datetime.replace('T', ' ') + ')' : ''}</p>
                            ${e.co_media_url ? `<p class="truncate"><strong>Link Mídia:</strong> <a href="${e.co_media_url}" target="_blank" class="text-pink-400 underline">Acessar Arquivos</a></p>` : ''}
                            ${e.co_instructions ? `<p class="italic text-zinc-400 bg-black p-2 rounded border border-zinc-800 mt-2">"${e.co_instructions}"</p>` : ''}
                        </div>
                    ` : `<p class="text-zinc-500 italic">Sem mídias ou vinhetas solicitadas para o C.O.</p>`}
                </div>

                <!-- Coluna 3: AV / TI / Som / Palco -->
                <div class="bg-zinc-950 p-4 rounded-xl border border-cyan-500/30 space-y-3">
                    <h4 class="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                        <i data-lucide="mic" class="w-4 h-4"></i>
                        <span>Equipamentos AV & Palco</span>
                    </h4>
                    <div class="space-y-1 text-zinc-300">
                        <p><strong>Apresentações:</strong> ${e.num_presentations} (${e.presentation_format}) via ${e.presentation_device}</p>
                        <p><strong>Palco:</strong> ${e.num_presenters} pessoa(s) em layout "${e.stage_layout}"</p>
                        <p><strong>Microfones:</strong> ${e.mics_handheld} Mão | ${e.mics_lapel} Lapela | ${e.mics_audience} Q&A</p>
                        <p><strong>Transmissão:</strong> ${e.streaming_type}</p>
                        <div class="flex flex-wrap gap-2 pt-1">
                            ${e.need_passador ? '<span class="bg-zinc-900 text-zinc-300 px-1.5 py-0.5 rounded text-[10px]">Passador laser</span>' : ''}
                            ${e.need_stage_monitor ? '<span class="bg-zinc-900 text-zinc-300 px-1.5 py-0.5 rounded text-[10px]">Monitor Retorno</span>' : ''}
                            ${e.need_ti_support ? '<span class="bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold">Suporte TI Local</span>' : ''}
                        </div>
                    </div>
                </div>

            </div>

            <!-- Logística & Coffee Break Footer -->
            ${(e.has_catering && e.has_catering !== 'Não') || e.logistics_notes ? `
                <div class="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <i data-lucide="coffee" class="w-4 h-4 text-emerald-400"></i>
                        <span><strong>Catering:</strong> ${e.has_catering} ${e.catering_time ? 'às ' + e.catering_time : ''}</span>
                    </div>
                    ${e.logistics_notes ? `<span class="text-zinc-400 italic">Obs: ${e.logistics_notes}</span>` : ''}
                </div>
            ` : ''}
        </div>
    `).join('');

    lucide.createIcons();
}

// Open Detailed Event Modal
function openEventDetailModal(eventId) {
    const e = events.find(item => item.id === eventId);
    if (!e) return;

    const content = document.getElementById('modal-content');
    if (!content) return;

    content.innerHTML = `
        <div class="space-y-6">
            <div class="border-b border-zinc-800 pb-4 pr-8">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase">${e.event_type}</span>
                <h2 class="text-2xl font-black text-white mt-1">${e.title}</h2>
                <p class="text-xs text-zinc-400 mt-1">Data: <strong class="text-orange-400">${formatDateBR(e.date)}</strong> | Horário: <strong class="text-white">${e.start_time} às ${e.end_time}</strong></p>
            </div>

            <!-- Google Calendar Direct Sync Callout -->
            <div class="bg-gradient-to-r from-orange-950/40 via-amber-950/40 to-zinc-900 border border-orange-500/30 p-4.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div class="flex items-center space-x-3">
                    <div class="bg-orange-600 p-2.5 rounded-xl text-black font-black shadow-lg">
                        <i data-lucide="calendar-plus" class="w-6 h-6 stroke-[2.5]"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-sm text-white">Sincronizar com Google Agenda</h4>
                        <p class="text-xs text-orange-200">Adicione este evento e seus requisitos à sua agenda em 1-clique.</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2 w-full sm:w-auto">
                    <a href="${buildGoogleCalendarURL(e)}" target="_blank" class="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-1.5">
                        <span>Adicionar ao Google Agenda</span>
                        <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                    </a>
                    <button onclick="downloadICSFile('${e.id}')" class="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs px-3 py-2.5 rounded-xl border border-zinc-800 flex items-center justify-center space-x-1 transition-colors">
                        <i data-lucide="download" class="w-3.5 h-3.5"></i>
                        <span>.ICS</span>
                    </button>
                </div>
            </div>

            <!-- Ficha Técnica Resumida no Modal -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div class="bg-black p-4 rounded-xl border border-zinc-800 space-y-2">
                    <h4 class="font-bold text-orange-400 uppercase text-[10px]">Organização & Contato</h4>
                    <p class="text-zinc-300"><strong>Solicitante:</strong> ${e.applicant_name} (${e.applicant_email})</p>
                    <p class="text-zinc-300"><strong>Departamento:</strong> ${e.department}</p>
                    <p class="text-zinc-300"><strong>Público Esperado:</strong> ${e.num_attendees} pessoas (${e.num_external_guests} externos)</p>
                </div>

                <div class="bg-black p-4 rounded-xl border border-zinc-800 space-y-2">
                    <h4 class="font-bold text-pink-400 uppercase text-[10px]">Mídia & Operações C.O.</h4>
                    <p class="text-zinc-300"><strong>Cliente Específico:</strong> ${e.has_specific_client ? e.client_name : 'Não'}</p>
                    <p class="text-zinc-300"><strong>Mídia no Videowall:</strong> ${e.has_co_media ? e.co_media_type + ' (' + e.co_media_format + ')' : 'Não solicitada'}</p>
                    ${e.co_media_url ? `<p class="text-zinc-300 truncate"><strong>Link:</strong> <a href="${e.co_media_url}" target="_blank" class="text-pink-400 underline">Abrir Mídia</a></p>` : ''}
                </div>

                <div class="bg-black p-4 rounded-xl border border-zinc-800 space-y-2 md:col-span-2">
                    <h4 class="font-bold text-cyan-400 uppercase text-[10px]">Equipamentos de Áudio & Vídeo (AV)</h4>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-zinc-300">
                        <div><strong>Decks:</strong> ${e.num_presentations} (${e.presentation_format})</div>
                        <div><strong>Pessoas Palco:</strong> ${e.num_presenters}</div>
                        <div><strong>Microfones:</strong> ${e.mics_handheld} Mão, ${e.mics_lapel} Lapela</div>
                        <div><strong>Streaming:</strong> ${e.streaming_type}</div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end pt-2">
                <button onclick="closeEventModal()" class="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors">Fechar</button>
            </div>
        </div>
    `;

    document.getElementById('event-modal').classList.remove('hidden');
    lucide.createIcons();
}

function closeEventModal() {
    const modal = document.getElementById('event-modal');
    if (modal) modal.classList.add('hidden');
}

// Build Google Calendar Web Render Link
function buildGoogleCalendarURL(e) {
    const title = encodeURIComponent(`[Auditório Eletromidia] ${e.title}`);
    
    // Format dates to ISO UTC format YYYYMMDDTHHMMSSZ
    const startDateClean = e.date.replace(/-/g, '');
    const startTimeClean = e.start_time.replace(':', '') + '00';
    const endTimeClean = e.end_time.replace(':', '') + '00';
    
    const dates = `${startDateClean}T${startTimeClean}/${startDateClean}T${endTimeClean}`;

    const detailsText = `EVENTO NO AUDITÓRIO ELETROMIDIA\n
Solicitante: ${e.applicant_name} (${e.department})
Cliente: ${e.has_specific_client ? e.client_name : 'N/A'}

FICHA TÉCNICA RESUMIDA:
- Mídia C.O.: ${e.has_co_media ? e.co_media_type : 'Sem mídias prévias'}
- Palco & Apresentadores: ${e.num_presenters} pessoa(s)
- Microfones: ${e.mics_handheld} mão, ${e.mics_lapel} lapela
- Transmissão: ${e.streaming_type}
- Suporte TI: ${e.need_ti_support ? 'Sim' : 'Não'}

Link da Mídia C.O.: ${e.co_media_url || 'N/A'}`;

    const details = encodeURIComponent(detailsText);
    const location = encodeURIComponent('Auditório Principal - Eletromidia SP');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

// Generate & Download iCal (.ics) File
function downloadICSFile(eventId) {
    const e = events.find(item => item.id === eventId);
    if (!e) return;

    const startDateClean = e.date.replace(/-/g, '');
    const startTimeClean = e.start_time.replace(':', '') + '00';
    const endTimeClean = e.end_time.replace(':', '') + '00';

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Eletromidia//Auditorio Agenda//PT-BR',
        'BEGIN:VEVENT',
        `UID:${e.id}@eletromidia.com.br`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${startDateClean}T${startTimeClean}`,
        `DTEND:${startDateClean}T${endTimeClean}`,
        `SUMMARY:[Auditório Eletromidia] ${e.title}`,
        `DESCRIPTION:Solicitante: ${e.applicant_name} | Depto: ${e.department}\\nCliente: ${e.has_specific_client ? e.client_name : 'N/A'}\\nMídia C.O.: ${e.has_co_media ? e.co_media_type : 'N/A'}`,
        'LOCATION:Auditório Principal - Eletromidia',
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `auditorio_eletromidia_${e.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Arquivo .ICS gerado com sucesso!');
}

// Delete Event (Operator/Admin Only)
function deleteEvent(eventId) {
    if (!isOperatorLoggedIn) {
        showToast('Apenas administradores autenticados podem cancelar reservas.', 'error');
        openOperatorLoginModal();
        return;
    }

    if (confirm('Tem certeza que deseja cancelar esta reserva do auditório?')) {
        events = events.filter(e => e.id !== eventId);
        saveEvents();
        renderEvents();
        renderFichas();
        renderCalendarGrid();
        showToast('Reserva removida da agenda.');
    }
}

// Calendar Month Grid View Generator
function renderCalendarGrid() {
    const gridContainer = document.getElementById('calendar-days-grid');
    if (!gridContainer) return;

    const year = selectedDateGrid.getFullYear();
    const month = selectedDateGrid.getMonth();

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    document.getElementById('calendar-month-year').innerText = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = '';

    // Blank cells before month start
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="h-24 bg-black/40 rounded-xl border border-zinc-900/50"></div>`;
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        const isToday = dateStr === getOffsetDateString(0);

        html += `
            <div class="h-24 bg-black p-1.5 rounded-xl border ${isToday ? 'border-orange-500 bg-orange-500/5' : 'border-zinc-800/80'} overflow-y-auto space-y-1">
                <div class="text-[11px] font-bold ${isToday ? 'text-orange-400' : 'text-zinc-400'} flex items-center justify-between">
                    <span>${day}</span>
                    ${isToday ? '<span class="text-[9px] bg-orange-500 text-black px-1 rounded font-black">HOJE</span>' : ''}
                </div>
                ${dayEvents.map(e => `
                    <div onclick="openEventDetailModal('${e.id}')" class="text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-200 p-1 rounded cursor-pointer truncate border-l-2 ${e.has_co_media ? 'border-pink-500' : 'border-orange-500'}">
                        <strong>${e.start_time}</strong> ${e.title}
                    </div>
                `).join('')}
            </div>
        `;
    }

    gridContainer.innerHTML = html;
}

function prevMonth() {
    selectedDateGrid.setMonth(selectedDateGrid.getMonth() - 1);
    renderCalendarGrid();
}

function nextMonth() {
    selectedDateGrid.setMonth(selectedDateGrid.getMonth() + 1);
    renderCalendarGrid();
}

function currentMonth() {
    selectedDateGrid = new Date();
    renderCalendarGrid();
}

// View Modes
function setViewMode(mode) {
    currentViewMode = mode;
    const cardsView = document.getElementById('events-cards-view');
    const gridView = document.getElementById('events-grid-view');
    const btnCards = document.getElementById('view-cards-btn');
    const btnGrid = document.getElementById('view-grid-btn');

    if (mode === 'cards') {
        cardsView.classList.remove('hidden');
        gridView.classList.add('hidden');
        btnCards.className = 'px-3 py-1 rounded-md bg-zinc-800 text-white font-bold';
        btnGrid.className = 'px-3 py-1 rounded-md text-zinc-400 hover:text-white font-bold';
    } else {
        cardsView.classList.add('hidden');
        gridView.classList.remove('hidden');
        btnCards.className = 'px-3 py-1 rounded-md text-zinc-400 hover:text-white font-bold';
        btnGrid.className = 'px-3 py-1 rounded-md bg-zinc-800 text-white font-bold';
        renderCalendarGrid();
    }
}

// Search & Filtering
function filterEvents(filter) {
    currentFilter = filter;
    ['all', 'co', 'client', 'today'].forEach(f => {
        const btn = document.getElementById(`filter-${f}`);
        if (btn) {
            if (f === filter) {
                btn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-orange-500 text-black shadow-md shadow-orange-500/20';
            } else {
                btn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 text-zinc-300 hover:bg-zinc-800';
            }
        }
    });
    renderEvents();
}

function handleSearch() {
    const input = document.getElementById('search-input');
    if (input) {
        currentSearch = input.value;
        renderEvents();
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.innerText = message;
    if (type === 'warning') {
        toast.className = 'fixed bottom-5 right-5 z-50 transform translate-y-0 opacity-100 transition-all duration-300 bg-amber-500 text-black px-5 py-3.5 rounded-xl shadow-2xl font-black text-sm flex items-center space-x-2';
    } else if (type === 'error') {
        toast.className = 'fixed bottom-5 right-5 z-50 transform translate-y-0 opacity-100 transition-all duration-300 bg-red-600 text-white px-5 py-3.5 rounded-xl shadow-2xl font-black text-sm flex items-center space-x-2';
    } else {
        toast.className = 'fixed bottom-5 right-5 z-50 transform translate-y-0 opacity-100 transition-all duration-300 bg-orange-500 text-black px-5 py-3.5 rounded-xl shadow-2xl font-black text-sm flex items-center space-x-2';
    }

    setTimeout(() => {
        toast.className = 'fixed bottom-5 right-5 z-50 transform translate-y-20 opacity-0 transition-all duration-300 bg-orange-500 text-black px-5 py-3.5 rounded-xl shadow-2xl font-black text-sm flex items-center space-x-2';
    }, 3500);
}

// Settings Action Handlers
function copyWebCalLink() {
    navigator.clipboard.writeText('webcal://eletromidia.com.br/api/auditorio/ical.ics');
    showToast('Link iCal copiado para a área de transferência!');
}

function saveGoogleConfig() {
    showToast('Configurações da API Google Calendar salvas com sucesso!');
}

function exportAllFichasPDF() {
    window.print();
}
