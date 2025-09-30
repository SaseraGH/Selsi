document.addEventListener('DOMContentLoaded', () => {
    // Pastikan variabel 'database' sudah didefinisikan di <script> di index.html!
    if (typeof database === 'undefined') {
        console.error("ERROR: Variabel 'database' Firebase tidak ditemukan. Pastikan Anda sudah menginisialisasi Firebase di index.html.");
        return;
    }

    // --- Bagian 1: Timer Waktu Nyata ---
    // GANTI TANGGAL INI dengan tanggal anniversary Anda
    const startDate = new Date('2025-09-22T00:00:00'); 
    
    function updateTimer() {
        const now = new Date();
        const diff = now - startDate;

        if (diff < 0) {
            document.getElementById('timer-card').innerHTML = 
                '<p style="color: var(--accent-color); font-weight: bold;">Countdown menuju hari spesial kita!</p>';
            return;
        }

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const remainingSeconds = seconds % 60;
        const remainingMinutes = minutes % 60;
        const remainingHours = hours % 24;

        // Fungsi helper untuk format 2 digit
        const formatTime = (time) => time.toString().padStart(2, '0');

        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = formatTime(remainingHours);
        document.getElementById('minutes').textContent = formatTime(remainingMinutes);
        document.getElementById('seconds').textContent = formatTime(remainingSeconds);
    }

    updateTimer();
    setInterval(updateTimer, 1000);

    // --- Bagian 2: Efek Teks Mandarin Floating ---
    const symbols = ['爱', '喜欢', '永远', '心', '缘分', '想你', '抱抱', '💕', '✨', '💖'];
    const floatingArea = document.getElementById('floating-symbols');

    function createFloatingSymbol() {
        const symbol = document.createElement('span');
        symbol.classList.add('floating-symbol');
        symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];

        // Posisi dan durasi acak
        symbol.style.left = `${Math.random() * 100}vw`;
        symbol.style.fontSize = `${1 + Math.random() * 2}rem`; 
        symbol.style.animationDuration = `${10 + Math.random() * 10}s`; 
        symbol.style.animationDelay = `${-Math.random() * 15}s`; 

        floatingArea.appendChild(symbol);

        // Hapus elemen setelah selesai animasi
        symbol.addEventListener('animationend', () => {
            symbol.remove();
        });
    }

    // Buat simbol secara berkala
    setInterval(createFloatingSymbol, 800); 

    // --- Bagian 3: Panel Catatan dan Firebase ---
    
    const databaseRef = database.ref('romanticNotes'); 
    const noteForm = document.getElementById('note-form');
    const notesList = document.getElementById('notes-list');
    const panel = document.getElementById('notes-panel');
    const openBtn = document.getElementById('open-panel-btn');
    const closeBtn = document.getElementById('close-panel-btn');

    // Buka/Tutup Panel
    openBtn.addEventListener('click', () => panel.classList.add('open'));
    closeBtn.addEventListener('click', () => panel.classList.remove('open'));
    
    // Fungsi untuk menampilkan data
    function renderNotes(notesData) {
        notesList.innerHTML = '';
        
        const notesArray = [];
        for (let key in notesData) {
            notesArray.push({
                id: key, 
                ...notesData[key] 
            });
        }

        // Urutkan berdasarkan timestamp (terbaru di atas)
        notesArray.sort((a, b) => b.timestamp - a.timestamp); 

        if (notesArray.length === 0) {
            notesList.innerHTML = '<p style="text-align: center; color: #aaa;">Belum ada catatan manis. Tambahkan satu!</p>';
            return;
        }

        notesArray.forEach((note) => {
            const noteCard = document.createElement('div');
            noteCard.classList.add('note-card');
            noteCard.innerHTML = `
                <h5>${note.title}</h5>
                <p class="note-date">Tanggal: ${note.date}</p>
                <p>${note.description}</p>
                <button class="delete-btn" data-id="${note.id}">Hapus</button>
            `;
            notesList.appendChild(noteCard);
        });

        // Tambahkan event listener untuk tombol hapus (diperbaiki)
        notesList.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const noteIdToDelete = e.target.dataset.id;
                deleteNote(noteIdToDelete);
            });
        });
    }

    // DENGARKAN PERUBAHAN DATABASE (Real-time)
    databaseRef.on('value', (snapshot) => {
        const data = snapshot.val(); 
        renderNotes(data);
    });

    // TAMBAH CATATAN BARU
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('note-title').value;
        const date = document.getElementById('note-date').value;
        const description = document.getElementById('note-description').value;

        // Validasi dasar
        if (!title || !date || !description) {
            alert("Semua kolom harus diisi!");
            return;
        }

        const newNote = { 
            title, 
            date, 
            description,
            timestamp: Date.now() 
        };

        // Kirim data ke Firebase
        databaseRef.push(newNote)
            .then(() => {
                noteForm.reset();
            })
            .catch(error => {
                console.error("Gagal menyimpan ke Firebase:", error);
                alert("Gagal menyimpan catatan. Cek konsol browser Anda.");
            });
    });

    // HAPUS CATATAN
    function deleteNote(noteIdToDelete) {
        
        if (confirm("Yakin ingin menghapus kenangan manis ini?")) {
            databaseRef.child(noteIdToDelete).remove()
                .catch(error => {
                    console.error("Gagal menghapus dari Firebase:", error);
                    alert("Gagal menghapus catatan.");
                });
        }
    }
});
