# Budget Tracker - Aplikasi Kelola Keuangan Anak Kos

Aplikasi web untuk mencatat pemasukan dan pengeluaran dengan saldo real-time, dibuat khusus untuk anak kos yang ingin mengatur keuangan dengan baik.

## Fitur

- ✅ **Set Saldo Awal Bulan** - Atur saldo awal setiap bulan
- ✅ **Catat Transaksi** - Tambah pemasukan dan pengeluaran dengan kategori
- ✅ **Saldo Real-time** - Saldo berubah otomatis saat ada transaksi baru
- ✅ **Riwayat Transaksi** - Lihat semua transaksi dengan filter
- ✅ **Multi-bulan** - Ganti antara bulan yang berbeda
- ✅ **Responsif** - Tampil bagus di mobile dan desktop
- ✅ **Real-time Sync** - Data tersinkron real-time dengan Firebase

## Teknologi

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Firebase Firestore** - Database real-time
- **date-fns** - Date utilities

## Setup

### 1. Install Dependencies

```bash
bun install
```

**Why Bun?**
- ⚡ 2-3x faster package installation
- 🚀 Faster JavaScript runtime  
- 📦 Built-in bundler and test runner
- 🔧 Drop-in replacement for npm/yarn

### 2. Setup Firebase

1. Buat project baru di [Firebase Console](https://console.firebase.google.com/)
2. Aktifkan Firestore Database
3. Copy konfigurasi Firebase ke file `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Firestore Rules

Set aturan Firestore (untuk development):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Catatan**: Aturan di atas membolehkan semua akses untuk development. Untuk production, implementasikan authentication dan rules yang lebih ketat.

### 4. Run Development Server

```bash
bun run dev
# or simply
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

**Bun Commands:**
```bash
# Development
bun dev

# Build for production  
bun run build

# Start production server
bun start

# Lint code
bun run lint
```

## Cara Pakai

1. **Set Saldo Awal**: Klik "Set Saldo Awal" untuk mengatur saldo bulan ini
2. **Tambah Transaksi**: Klik tombol "+" untuk menambah pemasukan/pengeluaran
3. **Lihat Riwayat**: Scroll ke bawah untuk melihat semua transaksi
4. **Ganti Bulan**: Gunakan dropdown untuk melihat data bulan lain

## Kategori Transaksi

### Pemasukan
- 💰 Gaji/Uang Saku
- 💼 Freelance
- 🎁 Hadiah
- 💸 Lainnya

### Pengeluaran
- 🍽️ Makanan
- 🚗 Transportasi
- 📚 Pendidikan
- 🎮 Hiburan
- 🏥 Kesehatan
- 🛒 Belanja
- 📄 Tagihan
- 💳 Lainnya

## Struktur Project

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard
│   └── globals.css         # Global styles
├── components/
│   ├── BalanceCard.tsx     # Komponen saldo
│   ├── TransactionForm.tsx # Form tambah transaksi
│   └── TransactionList.tsx # List riwayat transaksi
├── lib/
│   ├── firebase.ts         # Konfigurasi Firebase
│   ├── firestore.ts        # Service Firestore
│   └── utils.ts            # Utility functions
└── types/
    └── index.ts            # TypeScript interfaces
```

## Build untuk Production

```bash
bun run build
bun start
```

**Performance Benefits:**
- 30-50% faster build times with Bun
- Reduced memory usage during development
- Faster cold starts

## Tips Penggunaan

1. **Konsistensi**: Catat setiap transaksi sekecil apapun
2. **Kategorisasi**: Gunakan kategori yang tepat untuk analisis yang akurat
3. **Review Bulanan**: Cek pola pengeluaran setiap akhir bulan
4. **Target**: Set target pengeluaran dan pantau progressnya

## Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - bebas digunakan untuk keperluan pribadi dan komersial.