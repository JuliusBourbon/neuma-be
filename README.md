# API Documentation — Aplikasi Edukasi Alfabet & BISINDO

Base URL: `http://localhost:3000/api`

Semua endpoint (kecuali `/auth/*` dan `/health`) memerlukan header:
```
Authorization: Bearer <token>
```

---

## 1. Auth

### POST /auth/register
Mendaftarkan akun baru dan langsung mengembalikan token.

**Body:**
```json
{
  "name": "Budi",
  "password": "rahasia123"
}
```

**Response 201:**
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "uuid",
    "name": "Budi"
  }
}
```

**Error:**
- `409` — Nama sudah digunakan

---

### POST /auth/login
Login menggunakan Nama & Password.

**Body:**
```json
{
  "name": "Budi",
  "password": "rahasia123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "uuid",
    "name": "Budi",
    "avatarSeed": "starter-fox",
    "avatarStyle": "adventurer"
  }
}
```

**Error:**
- `401` — Nama atau password salah

---

## 2. User

### GET /users/me
Mengambil profil lengkap user, termasuk data onboarding jika ada.

**Response 200:**
```json
{
  "id": "uuid",
  "name": "Budi",
  "avatarSeed": "starter-fox",
  "avatarStyle": "adventurer",
  "createdAt": "2026-07-01T00:00:00.000Z",
  "onboarding": {
    "school": "SDN 1 Contoh",
    "age": 8,
    "grade": "3",
    "hobby": "menggambar"
  }
}
```

---

### PATCH /users/me
Update nama dan/atau avatar.

**Body (semua field opsional):**
```json
{
  "name": "Budi Santoso",
  "avatarStyle": "bottts",
  "avatarSeed": "robot-blue"
}
```

**Response 200:** Data user terbaru.

**Error:**
- `409` — Nama sudah digunakan pengguna lain

---

### PATCH /users/me/password
Ganti password.

**Body:**
```json
{
  "oldPassword": "rahasia123",
  "newPassword": "rahasiabaru"
}
```

**Response 200:**
```json
{ "message": "Password berhasil diubah" }
```

**Error:**
- `400` — Password lama salah / password baru < 6 karakter

---

## 3. Onboarding

### POST /onboarding
Submit atau update data onboarding (idempotent — boleh dipanggil ulang).

**Body (semua opsional):**
```json
{
  "school": "SDN 1 Contoh",
  "age": 8,
  "grade": "3",
  "hobby": "menggambar"
}
```

**Response 200:** Data onboarding tersimpan.

---

### GET /onboarding
Mengambil data onboarding user saat ini.

**Response 200:**
```json
{
  "school": "SDN 1 Contoh",
  "age": 8,
  "grade": "3",
  "hobby": "menggambar"
}
```

---

## 4. Level

### GET /levels
Menampilkan 26 level (A-Z) beserta status per user. Dipakai di Homepage.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "letter": "A",
    "order": 1,
    "title": "Huruf A",
    "status": "COMPLETED",
    "bestScore": 130
  },
  {
    "id": "uuid",
    "letter": "B",
    "order": 2,
    "title": "Huruf B",
    "status": "UNLOCKED",
    "bestScore": 0
  },
  {
    "id": "uuid",
    "letter": "C",
    "order": 3,
    "title": "Huruf C",
    "status": "LOCKED",
    "bestScore": 0
  }
]
```

> `status` bernilai: `LOCKED` | `UNLOCKED` | `COMPLETED`

---

### GET /levels/:id
Detail level, termasuk leaderboard. Otomatis unlock jika level sebelumnya sudah selesai.

**Response 200:**
```json
{
  "level": {
    "id": "uuid",
    "letter": "B",
    "order": 2,
    "title": "Huruf B",
    "description": "Belajar mengenal dan mengisyaratkan huruf B dalam BISINDO"
  },
  "userProgress": {
    "status": "UNLOCKED",
    "bestScore": 0
  },
  "leaderboard": [
    {
      "userId": "uuid",
      "name": "Ani",
      "avatarSeed": "robot-blue",
      "avatarStyle": "bottts",
      "score": 150
    }
  ],
  "userRank": {
    "rank": 3,
    "score": 100
  }
}
```

**Error:**
- `403` — Level masih terkunci
- `404` — Level tidak ditemukan

---

### GET /levels/:id/materials
Materi pembelajaran (umum, BISINDO, contoh kata) sebelum tes.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "type": "GENERAL_INTRO",
    "content": "Huruf B adalah huruf kedua dalam alfabet...",
    "mediaUrl": null,
    "order": 1
  },
  {
    "id": "uuid",
    "type": "BISINDO_INTRO",
    "content": "Cara mengisyaratkan huruf B dalam BISINDO...",
    "mediaUrl": "https://.../huruf-b-bisindo.mp4",
    "order": 2
  },
  {
    "id": "uuid",
    "type": "WORD_EXAMPLE",
    "content": "Contoh kata: Bola, Buku, Baju",
    "mediaUrl": null,
    "order": 3
  }
]
```

---

## 5. Attempt (Tes & Scoring)

### POST /attempts
Memulai sesi tes baru untuk sebuah level. Streak otomatis reset karena sesi baru.

**Body:**
```json
{ "levelId": "uuid" }
```

**Response 201:**
```json
{
  "attemptId": "uuid",
  "levelId": "uuid"
}
```

---

### POST /attempts/:attemptId/answers
Submit jawaban untuk satu soal. Bisa dipanggil berkali-kali untuk soal yang sama; poin hanya dihitung dari percobaan ke-1 dan ke-2.

**Body:**
```json
{
  "questionId": "uuid",
  "userAnswer": "A"
}
```

> Untuk soal `SIGN_PRACTICE`, `userAnswer` diisi huruf hasil deteksi model ONNX di device.

**Response 200:**
```json
{
  "isCorrect": true,
  "attemptNumber": 1,
  "pointsEarned": 100,
  "streakBonus": 20,
  "totalThisAnswer": 120
}
```

**Aturan poin:**
| Kondisi | Poin |
|---|---|
| Benar percobaan ke-1 | 100 |
| Benar percobaan ke-2 | 50 |
| Benar percobaan ke-3+ | 0 (latihan) |
| Streak bonus (benar berturut di percobaan ke-1) | +10, +20, +30, dst |
| Salah | 0, streak reset |

**Error:**
- `400` — Sesi sudah selesai / soal tidak sesuai level
- `403` — Bukan pemilik sesi
- `404` — Sesi/soal tidak ditemukan

---

### POST /attempts/:attemptId/skip
Melewati soal (0 poin, memutus streak). Dicatat sebagai audit trail.

**Body:**
```json
{ "questionId": "uuid" }
```

**Response 200:**
```json
{
  "skipped": true,
  "questionId": "uuid"
}
```

---

### POST /attempts/:attemptId/finish
Menyelesaikan sesi tes. Mengambil skor terbaik per soal, update `bestScore` jika lebih tinggi, unlock level berikutnya, dan cek achievement baru.

**Response 200:**
```json
{
  "attemptId": "uuid",
  "totalScore": 320,
  "newAchievements": [
    {
      "code": "COMPLETE_LEVEL_1",
      "title": "Langkah Pertama",
      "unlockedAt": "2026-07-23T10:00:00.000Z"
    }
  ]
}
```

**Error:**
- `400` — Belum ada soal dikerjakan / sesi sudah pernah diselesaikan

---

## 6. Achievement

### GET /achievements
List semua achievement beserta status unlocked untuk user saat ini.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "code": "COMPLETE_LEVEL_1",
    "title": "Langkah Pertama",
    "description": "Selesaikan level pertama (huruf A)",
    "isUnlocked": true
  },
  {
    "id": "uuid",
    "code": "COMPLETE_LEVEL_5",
    "title": "Semangat Belajar",
    "description": "Selesaikan 5 level",
    "isUnlocked": false
  }
]
```

---

## 7. Avatar

### GET /avatars
List semua avatar beserta status unlocked dan preview URL (DiceBear).

**Response 200:**
```json
[
  {
    "id": "seed-starter-fox",
    "label": "Rubah Petualang",
    "previewUrl": "https://api.dicebear.com/9.x/adventurer/svg?seed=starter-fox",
    "isUnlocked": true
  },
  {
    "id": "seed-robot-blue",
    "label": "Robot Biru",
    "previewUrl": "https://api.dicebear.com/9.x/bottts/svg?seed=robot-blue",
    "isUnlocked": false
  }
]
```

---

### POST /avatars/select
Memilih avatar aktif (harus sudah unlocked).

**Body:**
```json
{ "avatarId": "seed-starter-fox" }
```

**Response 200:** Data user dengan avatar terbaru.

**Error:**
- `403` — Avatar belum terbuka
- `404` — Avatar tidak ditemukan

---

## 8. Misc

### GET /health
Health check server, tanpa autentikasi.

**Response 200:**
```json
{ "status": "ok" }
```

---

## Ringkasan Kode Error Umum

| Kode | Arti |
|---|---|
| 400 | Bad Request — validasi gagal atau state tidak valid |
| 401 | Unauthorized — token tidak ada/tidak valid |
| 403 | Forbidden — tidak berhak mengakses resource ini |
| 404 | Not Found — resource tidak ditemukan |
| 409 | Conflict — data sudah ada (mis. nama duplikat) |
| 500 | Internal Server Error |

---

## Status Implementasi

| Tahap | Status |
|---|---|
| 0. Setup Project | ✅ |
| 1. Database Schema | ✅ |
| 2. Auth & User Management | ✅ |
| 3. Onboarding | ✅ |
| 4. Level & Materi | ✅ |
| 5. Tes & Scoring | ✅ |
| 6. Achievement & Avatar | ✅ |
| 7. Setting | ✅ |
```