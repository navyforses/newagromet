// Data Storage
let patients = JSON.parse(localStorage.getItem('patients')) || [];
let assessments = JSON.parse(localStorage.getItem('assessments')) || [];
let sessions = JSON.parse(localStorage.getItem('sessions')) || [];
let activities = JSON.parse(localStorage.getItem('activities')) || [];

let currentPatient = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeForms();
    initializeModal();
    updateDashboard();
    renderPatientsList();
    updateStatistics();
});

// Navigation
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewName = btn.dataset.view;
            switchView(viewName);

            // Update active nav button
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function switchView(viewName) {
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));

    const targetView = document.getElementById(viewName);
    if (targetView) {
        targetView.classList.add('active');
    }
}

// Forms
function initializeForms() {
    // Patient Form
    const patientForm = document.getElementById('patient-form');
    patientForm.addEventListener('submit', handlePatientSubmit);

    // Assessment Form
    const assessmentForm = document.getElementById('assessment-form');
    assessmentForm.addEventListener('submit', handleAssessmentSubmit);

    // Session Form
    const sessionForm = document.getElementById('session-form');
    sessionForm.addEventListener('submit', handleSessionSubmit);

    // Search
    const searchInput = document.getElementById('search-patients');
    searchInput.addEventListener('input', (e) => {
        filterPatients(e.target.value);
    });
}

function handlePatientSubmit(e) {
    e.preventDefault();

    const therapyTypes = Array.from(document.querySelectorAll('.therapy-type:checked'))
        .map(checkbox => checkbox.value);

    const patient = {
        id: Date.now().toString(),
        name: document.getElementById('patient-name').value,
        patientId: document.getElementById('patient-id').value,
        birthDate: document.getElementById('birth-date').value,
        gender: document.getElementById('gender').value,
        weight: parseFloat(document.getElementById('weight').value),
        height: parseFloat(document.getElementById('height').value),
        parentName: document.getElementById('parent-name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value || '',
        email: document.getElementById('email').value || '',
        asphyxiaSeverity: document.getElementById('asphyxia-severity').value,
        apgarScore: document.getElementById('apgar-score').value || '',
        apgarScore5: document.getElementById('apgar-score-5').value || '',
        admissionDate: document.getElementById('admission-date').value,
        diagnosis: document.getElementById('diagnosis').value,
        medicalHistory: document.getElementById('medical-history').value || '',
        rehabGoals: document.getElementById('rehab-goals').value || '',
        therapyTypes: therapyTypes,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };

    patients.push(patient);
    saveData();

    // Add activity
    addActivity('ახალი პაციენტი', `დაემატა პაციენტი: ${patient.name}`);

    // Reset form and switch view
    e.target.reset();
    switchView('patients');

    // Update nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === 'patients') {
            btn.classList.add('active');
        }
    });

    renderPatientsList();
    updateDashboard();
    updateStatistics();

    showNotification('პაციენტი წარმატებით დაემატა', 'success');
}

function handleAssessmentSubmit(e) {
    e.preventDefault();

    if (!currentPatient) return;

    const assessmentFields = document.querySelectorAll('.assessment-field');
    const scores = {};

    assessmentFields.forEach(field => {
        const category = field.dataset.category;
        const skill = field.dataset.skill;

        if (!scores[category]) {
            scores[category] = {};
        }

        scores[category][skill] = parseInt(field.value);
    });

    const assessment = {
        id: Date.now().toString(),
        patientId: currentPatient.id,
        patientName: currentPatient.name,
        date: new Date().toISOString(),
        scores: scores,
        notes: document.getElementById('assessment-notes').value || '',
        overallScore: calculateOverallScore(scores)
    };

    assessments.push(assessment);
    saveData();

    addActivity('შეფასება', `ჩატარდა შეფასება: ${currentPatient.name}`);

    e.target.reset();
    renderAssessmentHistory(currentPatient.id);
    updateDashboard();

    showNotification('შეფასება წარმატებით შეინახა', 'success');
}

function handleSessionSubmit(e) {
    e.preventDefault();

    if (!currentPatient) return;

    const session = {
        id: Date.now().toString(),
        patientId: currentPatient.id,
        patientName: currentPatient.name,
        type: document.getElementById('session-type').value,
        date: document.getElementById('session-date').value,
        time: document.getElementById('session-time').value,
        duration: parseInt(document.getElementById('session-duration').value),
        notes: document.getElementById('session-notes').value || '',
        status: 'scheduled',
        createdAt: new Date().toISOString()
    };

    sessions.push(session);
    saveData();

    addActivity('სესია დაიგეგმა', `${getTherapyTypeName(session.type)} - ${currentPatient.name}`);

    e.target.reset();
    renderSessionsList(currentPatient.id);
    updateDashboard();

    showNotification('სესია წარმატებით დაიგეგმა', 'success');
}

// Patient Functions
function renderPatientsList(filteredPatients = null) {
    const container = document.getElementById('patients-list');
    const patientsToRender = filteredPatients || patients;

    if (patientsToRender.length === 0) {
        container.innerHTML = '<p class="empty-state">პაციენტები არ არიან დამატებული</p>';
        return;
    }

    container.innerHTML = patientsToRender.map(patient => `
        <div class="patient-card" onclick="openPatientModal('${patient.id}')">
            <div class="patient-card-header">
                <h3>${patient.name}</h3>
                <span class="severity-badge ${patient.asphyxiaSeverity}">
                    ${getSeverityName(patient.asphyxiaSeverity)}
                </span>
            </div>
            <div class="patient-card-info">
                <p><strong>ID:</strong> <span>${patient.patientId}</span></p>
                <p><strong>ასაკი:</strong> <span>${calculateAge(patient.birthDate)}</span></p>
                <p><strong>მშობელი:</strong> <span>${patient.parentName}</span></p>
                <p><strong>ტელეფონი:</strong> <span>${patient.phone}</span></p>
            </div>
            <div class="patient-card-footer">
                <span>დამატების თარიღი: ${formatDate(patient.createdAt)}</span>
                <span>${patient.status === 'active' ? '🟢 აქტიური' : '⚫ არააქტიური'}</span>
            </div>
        </div>
    `).join('');
}

function filterPatients(searchTerm) {
    const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.parentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderPatientsList(filtered);
}

// Modal Functions
function initializeModal() {
    const modal = document.getElementById('patient-modal');
    const closeBtn = document.querySelector('.modal-close');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        currentPatient = null;
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            currentPatient = null;
        }
    });

    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);

            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

function openPatientModal(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    currentPatient = patient;

    const modal = document.getElementById('patient-modal');
    document.getElementById('modal-patient-name').textContent = patient.name;

    // Render patient info
    renderPatientInfo(patient);

    // Render assessment history
    renderAssessmentHistory(patient.id);

    // Render sessions
    renderSessionsList(patient.id);

    // Render progress
    renderProgress(patient.id);

    // Show modal
    modal.classList.add('active');
}

function renderPatientInfo(patient) {
    const container = document.getElementById('patient-info');

    container.innerHTML = `
        <div class="patient-info-grid">
            <div class="info-card">
                <h4>პაციენტის ID</h4>
                <p>${patient.patientId}</p>
            </div>
            <div class="info-card">
                <h4>დაბადების თარიღი</h4>
                <p>${formatDate(patient.birthDate)}</p>
            </div>
            <div class="info-card">
                <h4>ასაკი</h4>
                <p>${calculateAge(patient.birthDate)}</p>
            </div>
            <div class="info-card">
                <h4>სქესი</h4>
                <p>${patient.gender === 'male' ? 'მამრობითი' : 'მდედრობითი'}</p>
            </div>
            <div class="info-card">
                <h4>წონა</h4>
                <p>${patient.weight} კგ</p>
            </div>
            <div class="info-card">
                <h4>სიმაღლე</h4>
                <p>${patient.height} სმ</p>
            </div>
            <div class="info-card">
                <h4>მშობელი</h4>
                <p>${patient.parentName}</p>
            </div>
            <div class="info-card">
                <h4>ტელეფონი</h4>
                <p>${patient.phone}</p>
            </div>
            ${patient.email ? `
                <div class="info-card">
                    <h4>ელ. ფოსტა</h4>
                    <p>${patient.email}</p>
                </div>
            ` : ''}
            ${patient.address ? `
                <div class="info-card">
                    <h4>მისამართი</h4>
                    <p>${patient.address}</p>
                </div>
            ` : ''}
            <div class="info-card">
                <h4>ასფიქსიის სიმძიმე</h4>
                <p><span class="severity-badge ${patient.asphyxiaSeverity}">${getSeverityName(patient.asphyxiaSeverity)}</span></p>
            </div>
            ${patient.apgarScore ? `
                <div class="info-card">
                    <h4>აპგარის ქულა (1 წთ)</h4>
                    <p>${patient.apgarScore}</p>
                </div>
            ` : ''}
            ${patient.apgarScore5 ? `
                <div class="info-card">
                    <h4>აპგარის ქულა (5 წთ)</h4>
                    <p>${patient.apgarScore5}</p>
                </div>
            ` : ''}
            <div class="info-card">
                <h4>მიღების თარიღი</h4>
                <p>${formatDate(patient.admissionDate)}</p>
            </div>
        </div>

        <div class="info-card" style="margin-top: 1.5rem;">
            <h4>დიაგნოზი</h4>
            <p>${patient.diagnosis}</p>
        </div>

        ${patient.medicalHistory ? `
            <div class="info-card" style="margin-top: 1.5rem;">
                <h4>ანამნეზი</h4>
                <p>${patient.medicalHistory}</p>
            </div>
        ` : ''}

        ${patient.rehabGoals ? `
            <div class="info-card" style="margin-top: 1.5rem;">
                <h4>რეაბილიტაციის მიზნები</h4>
                <p>${patient.rehabGoals}</p>
            </div>
        ` : ''}

        ${patient.therapyTypes && patient.therapyTypes.length > 0 ? `
            <div class="info-card" style="margin-top: 1.5rem;">
                <h4>თერაპიის ტიპები</h4>
                <p>${patient.therapyTypes.map(type => getTherapyTypeName(type)).join(', ')}</p>
            </div>
        ` : ''}
    `;
}

function renderAssessmentHistory(patientId) {
    const container = document.getElementById('assessments-list');
    const patientAssessments = assessments.filter(a => a.patientId === patientId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (patientAssessments.length === 0) {
        container.innerHTML = '<p class="empty-state">შეფასებები არ არის</p>';
        return;
    }

    container.innerHTML = patientAssessments.map(assessment => `
        <div class="assessment-item">
            <div class="assessment-item-header">
                <div>
                    <strong>${formatDate(assessment.date)}</strong>
                </div>
                <div>
                    ჯამური ქულა: <strong style="color: var(--primary-color);">${assessment.overallScore}%</strong>
                </div>
            </div>
            <div class="assessment-scores">
                ${Object.entries(assessment.scores).map(([category, skills]) => `
                    <div class="score-item">
                        <div class="score-label">${getCategoryName(category)}</div>
                        <div class="score-value">${calculateCategoryScore(skills)}%</div>
                    </div>
                `).join('')}
            </div>
            ${assessment.notes ? `
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--gray-200);">
                    <strong>შენიშვნები:</strong> ${assessment.notes}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function renderSessionsList(patientId) {
    const container = document.getElementById('sessions-list-container');
    const patientSessions = sessions.filter(s => s.patientId === patientId)
        .sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));

    if (patientSessions.length === 0) {
        container.innerHTML = '<p class="empty-state">სესიები არ არის</p>';
        return;
    }

    container.innerHTML = patientSessions.map(session => `
        <div class="session-item">
            <div class="session-icon" style="background: ${getTherapyColor(session.type)}">
                ${getTherapyIcon(session.type)}
            </div>
            <div class="session-info">
                <h4>${getTherapyTypeName(session.type)}</h4>
                <p>${formatDate(session.date)} ${session.time} (${session.duration} წუთი)</p>
                ${session.notes ? `<p style="margin-top: 0.5rem;">${session.notes}</p>` : ''}
            </div>
            <span class="session-status ${session.status}">
                ${getStatusName(session.status)}
            </span>
        </div>
    `).join('');
}

function renderProgress(patientId) {
    const container = document.getElementById('progress-charts');
    const patientAssessments = assessments.filter(a => a.patientId === patientId)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (patientAssessments.length === 0) {
        container.innerHTML = '<p class="empty-state">პროგრესის მონაცემები არ არის</p>';
        return;
    }

    // Create progress visualization
    const categories = ['motor', 'cognitive', 'feeding'];

    container.innerHTML = `
        <div style="display: grid; gap: 2rem;">
            ${categories.map(category => {
                const scores = patientAssessments.map(a => ({
                    date: formatDate(a.date),
                    score: calculateCategoryScore(a.scores[category] || {})
                }));

                return `
                    <div style="background: var(--gray-50); padding: 1.5rem; border-radius: 8px;">
                        <h4 style="margin-bottom: 1rem;">${getCategoryName(category)}</h4>
                        <div style="display: flex; align-items: flex-end; gap: 0.5rem; height: 200px;">
                            ${scores.map(s => `
                                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                                    <div style="width: 100%; background: var(--primary-color); border-radius: 4px 4px 0 0; height: ${s.score}%; min-height: 5px; position: relative;">
                                        <span style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 0.875rem; font-weight: 600; color: var(--gray-900);">${s.score}%</span>
                                    </div>
                                    <span style="font-size: 0.75rem; color: var(--gray-600); writing-mode: vertical-rl; text-orientation: mixed;">${s.date}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Dashboard Functions
function updateDashboard() {
    // Update statistics
    document.getElementById('total-patients').textContent = patients.length;
    document.getElementById('active-patients').textContent = patients.filter(p => p.status === 'active').length;
    document.getElementById('scheduled-sessions').textContent = sessions.filter(s => s.status === 'scheduled').length;
    document.getElementById('total-assessments').textContent = assessments.length;

    // Update recent activity
    renderRecentActivity();
}

function renderRecentActivity() {
    const container = document.getElementById('recent-activity');
    const recentActivities = activities.slice(-10).reverse();

    if (recentActivities.length === 0) {
        container.innerHTML = '<p class="empty-state">აქტივობა არ არის</p>';
        return;
    }

    container.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-header">
                <span class="activity-title">${activity.title}</span>
                <span class="activity-time">${formatDateTime(activity.timestamp)}</span>
            </div>
            <div class="activity-description">${activity.description}</div>
        </div>
    `).join('');
}

function addActivity(title, description) {
    activities.push({
        id: Date.now().toString(),
        title,
        description,
        timestamp: new Date().toISOString()
    });
    saveData();
}

function updateStatistics() {
    // This function can be expanded to generate more detailed statistics
    // For now, it's called to ensure data is updated
}

// Utility Functions
function calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = Math.abs(today - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
        return `${diffDays} დღე`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} თვე`;
    } else {
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        return `${years} წელი ${months} თვე`;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ka-GE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ka-GE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getSeverityName(severity) {
    const names = {
        'mild': 'მსუბუქი',
        'moderate': 'საშუალო',
        'severe': 'მძიმე'
    };
    return names[severity] || severity;
}

function getCategoryName(category) {
    const names = {
        'motor': 'მოტორული უნარები',
        'cognitive': 'შემეცნებითი',
        'feeding': 'კვება'
    };
    return names[category] || category;
}

function getTherapyTypeName(type) {
    const names = {
        'physical': 'ფიზიოთერაპია',
        'occupational': 'ოკუპაციური თერაპია',
        'speech': 'ლოგოპედია',
        'cognitive': 'შემეცნებითი თერაპია',
        'sensory': 'სენსორული ინტეგრაცია'
    };
    return names[type] || type;
}

function getTherapyColor(type) {
    const colors = {
        'physical': '#DBEAFE',
        'occupational': '#D1FAE5',
        'speech': '#FEF3C7',
        'cognitive': '#E0E7FF',
        'sensory': '#FCE7F3'
    };
    return colors[type] || '#F3F4F6';
}

function getTherapyIcon(type) {
    const icons = {
        'physical': '💪',
        'occupational': '🎨',
        'speech': '🗣️',
        'cognitive': '🧠',
        'sensory': '👐'
    };
    return icons[type] || '📋';
}

function getStatusName(status) {
    const names = {
        'scheduled': 'დაგეგმილი',
        'completed': 'დასრულებული',
        'cancelled': 'გაუქმებული'
    };
    return names[status] || status;
}

function calculateCategoryScore(skills) {
    if (!skills || Object.keys(skills).length === 0) return 0;

    const values = Object.values(skills);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const max = values.length * 2; // Max score per skill is 2

    return Math.round((sum / max) * 100);
}

function calculateOverallScore(scores) {
    const categories = Object.keys(scores);
    if (categories.length === 0) return 0;

    const categoryScores = categories.map(cat => calculateCategoryScore(scores[cat]));
    const sum = categoryScores.reduce((acc, val) => acc + val, 0);

    return Math.round(sum / categories.length);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10B981' : '#3B82F6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Data Persistence
function saveData() {
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('assessments', JSON.stringify(assessments));
    localStorage.setItem('sessions', JSON.stringify(sessions));
    localStorage.setItem('activities', JSON.stringify(activities));
}

// Export/Import Functions
function exportData() {
    const data = {
        patients,
        assessments,
        sessions,
        activities,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rehabilitation-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            if (confirm('ნამდვილად გსურთ მონაცემების იმპორტი? არსებული მონაცემები შეიცვლება.')) {
                patients = data.patients || [];
                assessments = data.assessments || [];
                sessions = data.sessions || [];
                activities = data.activities || [];

                saveData();
                updateDashboard();
                renderPatientsList();
                updateStatistics();

                showNotification('მონაცემები წარმატებით იმპორტირდა', 'success');
            }
        } catch (error) {
            alert('შეცდომა მონაცემების იმპორტისას');
        }
    };
    reader.readAsText(file);
}

// Console helper for demo purposes
console.log('%c პერინატალური რეაბილიტაციის სისტემა ', 'background: #4F46E5; color: white; font-size: 16px; padding: 10px;');
console.log('დახმარება:');
console.log('- exportData() - მონაცემების ექსპორტი');
console.log('- patients - პაციენტების სია');
console.log('- assessments - შეფასებების სია');
console.log('- sessions - სესიების სია');
