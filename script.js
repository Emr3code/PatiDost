// --- Veri Yapısı ve Başlangıç Verileri ---
// Eğer localStorage boşsa örnek verilerle başlatalım
const defaultPets = [
    {
        id: 1,
        name: "Pamuk",
        type: "cat",
        breed: "Tekir",
        age: "2 Yaşında",
        img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
        tasks: [
            { id: 101, title: "Sabah Maması", time: "08:00", done: true },
            { id: 102, title: "Akşam Maması", time: "20:00", done: false }
        ]
    },
    {
        id: 2,
        name: "Baron",
        type: "dog",
        breed: "Golden",
        age: "4 Yaşında",
        img: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
        tasks: [
            { id: 201, title: "Vitamin İlacı", time: "09:00", done: false },
            { id: 202, title: "Yürüyüş", time: "18:00", done: false }
        ]
    }
];

// Uygulama Durumu (State)
let pets = JSON.parse(localStorage.getItem('pets')) || defaultPets;
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// --- Başlatma Fonksiyonları ---
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    renderPets();
    renderHealth();
    renderNotes();
    updateStats();
});

// --- Görünüm Yönetimi (Tab Switching) ---
function switchTab(tabName) {
    // Sidebar active class değişimi
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Section değişimi
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    
    // İlgili ID'yi bul (dashboard -> dashboard-view)
    const viewId = tabName + '-view';
    const activeSection = document.getElementById(viewId);
    if(activeSection) {
        activeSection.classList.add('active');
    }
    
    // Mobil menüyü kapat
    document.getElementById('sidebar').classList.remove('active');
}

// --- Dashboard Render ---
function renderDashboard() {
    const container = document.getElementById('daily-tasks');
    container.innerHTML = '';
    let hasTask = false;

    pets.forEach(pet => {
        pet.tasks.forEach(task => {
            hasTask = true;
            const div = document.createElement('div');
            div.className = 'task-card';
            div.innerHTML = `
                <div class="task-info">
                    <h4>${task.title} <small>(${pet.name})</small></h4>
                    <span><i class="far fa-clock"></i> ${task.time}</span>
                </div>
                <div class="task-check ${task.done ? 'completed' : ''}" onclick="toggleTask(${pet.id}, ${task.id})">
                    <i class="fas fa-check"></i>
                </div>
            `;
            container.appendChild(div);
        });
    });

    if (!hasTask) {
        container.innerHTML = '<div class="empty-state">Bugün için görev yok 🎉</div>';
    }
    updateStats();
}

// --- Pets Render ---
function renderPets() {
    const grid = document.getElementById('pets-grid');
    grid.innerHTML = '';

    pets.forEach(pet => {
        const card = document.createElement('div');
        card.className = 'pet-card';
        card.innerHTML = `
            <button class="delete-btn" onclick="deletePet(${pet.id})"><i class="fas fa-trash"></i></button>
            <div class="pet-img-wrapper">
                <img src="${pet.img}" alt="${pet.name}">
            </div>
            <div class="pet-info">
                <h3>${pet.name}</h3>
                <span class="pet-type">${pet.type}</span>
                <div class="pet-stats">
                    <div class="stat"><h5>Cins</h5><span>${pet.breed}</span></div>
                    <div class="stat"><h5>Yaş</h5><span>${pet.age}</span></div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- Health Render (Basit Aşı Takvimi) ---
function renderHealth() {
    const list = document.getElementById('health-list');
    list.innerHTML = '';
    
    pets.forEach(pet => {
        const div = document.createElement('div');
        div.className = 'task-card'; // Stil yeniden kullanımı
        div.style.marginBottom = '10px';
        div.innerHTML = `
            <div class="task-info">
                <h4>Karma Aşı 💉 <small>(${pet.name})</small></h4>
                <span>Son Tarih: 12.01.2024 - <b style="color:var(--primary)">Gelecek: 12.01.2025</b></span>
            </div>
            <div class="status-badge" style="background:#e0f7fa; color:#006064; padding:5px 10px; border-radius:10px; font-size:0.8rem;">
                Planlandı
            </div>
        `;
        list.appendChild(div);
    });
}

// --- Notes Render ---
function renderNotes() {
    const grid = document.getElementById('notes-grid');
    grid.innerHTML = '';
    
    if(notes.length === 0) {
        grid.innerHTML = '<p style="color:#aaa; text-align:center; grid-column:1/-1;">Henüz not eklenmedi.</p>';
        return;
    }

    notes.forEach((note, index) => {
        const div = document.createElement('div');
        div.className = 'stat-card';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'flex-start';
        div.innerHTML = `
            <h4 style="margin-bottom:5px;">Not #${index + 1}</h4>
            <p style="color:#666; font-size:0.9rem;">${note}</p>
        `;
        grid.appendChild(div);
    });
}

// --- CRUD İşlemleri ---

// 1. Görev Durumu Değiştirme
function toggleTask(petId, taskId) {
    const pet = pets.find(p => p.id === petId);
    const task = pet.tasks.find(t => t.id === taskId);
    task.done = !task.done;
    saveData();
    renderDashboard();
    showToast(task.done ? 'Görev tamamlandı!' : 'Görev geri alındı.');
}

// 2. Yeni Pet Ekleme
document.getElementById('addPetForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('petName').value;
    const type = document.getElementById('petType').value;
    const breed = document.getElementById('petBreed').value;
    const age = document.getElementById('petAge').value;

    // Basit bir resim atama (Türe göre)
    let img = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80"; // Default Dog
    if(type === 'cat') img = "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=300&q=80";
    if(type === 'bird') img = "https://images.unsplash.com/photo-1552728089-57bdde30ebd1?auto=format&fit=crop&w=300&q=80";

    const newPet = {
        id: Date.now(),
        name,
        type,
        breed,
        age,
        img,
        tasks: [
            { id: Date.now() + 1, title: 'Mama', time: '09:00', done: false }
        ]
    };

    pets.push(newPet);
    saveData();
    renderPets();
    renderDashboard();
    renderHealth();
    closeModal('addPetModal');
    document.getElementById('addPetForm').reset();
    showToast('Yeni dostumuz eklendi! 🐾');
    switchTab('pets');
});

// 3. Pet Silme
function deletePet(id) {
    if(confirm('Bu profili silmek istediğine emin misin?')) {
        pets = pets.filter(p => p.id !== id);
        saveData();
        renderPets();
        renderDashboard();
        renderHealth();
        showToast('Profil silindi.');
    }
}

// 4. Not Ekleme (Basit Prompt ile)
function addNotePrompt() {
    const text = prompt("Notunuzu girin:");
    if(text) {
        notes.push(text);
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
        showToast('Not kaydedildi.');
    }
}

// --- Yardımcı Fonksiyonlar ---

function saveData() {
    localStorage.setItem('pets', JSON.stringify(pets));
    updateStats();
}

function updateStats() {
    document.getElementById('total-pets').innerText = pets.length;
    // Basit bir logic: Her hayvan için 1 yaklaşan aşı varsayalım
    document.getElementById('upcoming-vaccines').innerText = pets.length; 
}

// Modal Kontrol
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}
// Modal dışına tıklayınca kapatma
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// Toast Bildirim
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Mobile Sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}
