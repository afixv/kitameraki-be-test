## 🚀 Memulai Proyek Secara Lokal

Ikuti langkah-langkah ini untuk menjalankan proyek di mesin lokal Anda.

### 1. Prasyarat

Pastikan Anda telah menginstal perangkat lunak berikut:

-   [**Node.js**](https://nodejs.org/) (versi LTS, 18.x atau lebih tinggi direkomendasikan).
-   [**Azure Functions Core Tools**](https://github.com/Azure/azure-functions-core-tools) (v4). Anda bisa menginstalnya secara global melalui npm:
    ```bash
    npm install -g azure-functions-core-tools@4 --unsafe-perm true
    ```-   [**Akun Azure**](https://azure.microsoft.com/free/) dengan langganan aktif.
-   **Instansi Azure Cosmos DB** yang sudah dibuat. (Lihat langkah 3b).

### 2. Kloning Repository

```bash
git clone <URL_REPOSITORY_ANDA>
cd <NAMA_FOLDER_PROYEK>
```

### 3. Instalasi dan Konfigurasi

**a. Instal Dependensi Proyek**
Jalankan perintah berikut di root proyek:
```bash
npm install
```

**b. Siapkan Azure Cosmos DB**
Proyek ini memerlukan koneksi ke database Cosmos DB.
1.  Di Portal Azure, buat sumber daya **Azure Cosmos DB for NoSQL**.
2.  Selama pembuatan, pilih mode kapasitas **Serverless** (ideal untuk development).
3.  Setelah sumber daya dibuat, buka **Data Explorer**.
4.  Buat database baru dengan ID: `TaskApp`.
5.  Buat container baru dengan ID: `Tasks`.
6.  Untuk **Partition key**, masukkan nilai berikut: `/organizationId`. Langkah ini **sangat penting** agar API berfungsi dengan benar.

**c. Konfigurasi Koneksi Lokal**
1.  Di Portal Azure, navigasikan ke sumber daya Cosmos DB Anda, lalu ke bagian **Keys**. Salin nilai **PRIMARY CONNECTION STRING**.
2.  Di root proyek Anda, buat file baru bernama `local.settings.json`.
3.  Salin dan tempel konten berikut ke dalam file tersebut, ganti placeholder dengan connection string Anda.

    ```json
    {
      "IsEncrypted": false,
      "Values": {
        "AzureWebJobsStorage": "",
        "FUNCTIONS_WORKER_RUNTIME": "node",
        "CosmosDbConnectionString": "PASTE_YOUR_COSMOS_DB_CONNECTION_STRING_HERE"
      }
    }
    ```
    *Catatan: File `local.settings.json` sudah ada di dalam `.gitignore` untuk mencegah rahasia Anda bocor ke source control.*

### 4. Menjalankan Aplikasi

Setelah semua konfigurasi selesai, jalankan aplikasi dengan perintah:

```bash
npm start
```

Perintah ini akan secara otomatis:
1.  Menjalankan `npm run clean` untuk membersihkan direktori `dist`.
2.  Menjalankan `npm run build` untuk meng-compile kode TypeScript ke JavaScript.
3.  Memulai host Azure Functions secara lokal.

Anda akan melihat daftar endpoint HTTP yang tersedia di terminal, biasanya berjalan di `http://localhost:7071`.

```
Functions:

        BulkDeleteTasks: [DELETE] http://localhost:7071/api/BulkDeleteTasks
        DeleteTask: [DELETE] http://localhost:7071/api/DeleteTask
        GetTask: [GET] http://localhost:7071/api/GetTask
        GetTasks: [GET] http://localhost:7071/api/GetTasks
        InsertTask: [POST] http://localhost:7071/api/InsertTask
        UpdateTask: [POST,PATCH] http://localhost:7071/api/UpdateTask
```

Aplikasi backend Anda sekarang siap menerima permintaan!

## 📖 Dokumentasi API Endpoints

| Endpoint | Method | Deskripsi | Query Parameters | Request Body (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `/api/InsertTask` | `POST` | Membuat tugas baru. | `organizationId` | `{ "title": "string", "description": "string", ... }` |
| `/api/GetTasks` | `GET` | Mendapatkan semua tugas untuk sebuah organisasi. | `organizationId` | (kosong) |
| `/api/GetTask` | `GET` | Mendapatkan detail satu tugas. | `id`, `organizationId` | (kosong) |
| `/api/UpdateTask` | `PATCH`, `POST` | Memperbarui sebagian atau seluruh data tugas. | `id`, `organizationId` | `{ "title": "string", "status": "completed", ... }` |
| `/api/DeleteTask` | `DELETE` | Menghapus satu tugas. | `id`, `organizationId` | (kosong) |
| `/api/BulkDeleteTasks`| `DELETE` | Menghapus beberapa tugas sekaligus. | `organizationId` | `[ "id1", "id2", "id3" ]` |