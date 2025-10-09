# Frontend Implementation - Supplier Dropdown untuk Check-in Form

## Overview
Implementasi dropdown supplier untuk form check-in visitor di VMS frontend dengan urutan form yang telah diubah sesuai permintaan.

## Perubahan yang Diimplementasikan

### 1. Urutan Form Check-in (Baru)
1. **Tanggal** - Pilih tanggal kunjungan
2. **Nama** - Nama visitor
3. **Keperluan** - Pilih keperluan (Meeting, Delivery, Contractor, Sortir)
4. **Dari** - Conditional field:
   - Jika keperluan = "Delivery" → Dropdown supplier
   - Jika keperluan lainnya → Input text manual
5. **Bertemu** - Nama host/employee
6. **Jumlah Tamu** - Jumlah visitor
7. **No Polisi** - Nomor kendaraan

### 2. Conditional Logic untuk Field "Dari"
- **Delivery**: Menampilkan dropdown dengan data supplier dari database sanoh-scm
- **Lainnya**: Menampilkan input text untuk mengisi asal visitor secara manual

### 3. Data yang Disimpan
- Ketika keperluan = "Delivery" dan memilih supplier, yang tersimpan di kolom `visitor_from` adalah `bp_code` supplier
- Ketika keperluan lainnya, yang tersimpan adalah teks yang diinput manual

## File yang Dimodifikasi

### 1. `src/services/apiService.ts`
**Ditambahkan:**
- Interface `Supplier` untuk tipe data supplier
- Fungsi `fetchSupplierData()` - mengambil semua supplier
- Fungsi `searchSuppliers()` - mencari supplier berdasarkan keyword
- Fungsi `getSupplierByCode()` - mengambil supplier berdasarkan bp_code

### 2. `src/components/Tablet/CheckInForm.tsx`
**Dimodifikasi:**
- Import fungsi supplier dari apiService
- State `suppliers` untuk menyimpan data supplier
- Fungsi `fetchSuppliers()` untuk mengambil data supplier
- Fungsi `handleSupplierChange()` untuk menangani perubahan dropdown supplier
- Conditional rendering untuk field "Dari"
- Urutan form diubah sesuai permintaan

## API Endpoints yang Digunakan

### Backend Endpoints (sudah diimplementasikan sebelumnya)
```
GET /api/supplier/                    # Get all suppliers
GET /api/supplier/?search={term}      # Search suppliers
GET /api/supplier/{bpCode}            # Get specific supplier
```

## Struktur Data Supplier

### Interface Supplier
```typescript
interface Supplier {
  value: string;    // bp_code (yang akan disimpan)
  label: string;    // bp_name (yang ditampilkan)
  code: string;     // bp_code
  name: string;     // bp_name
  address: string;  // bp_address
  email: string;    // bp_email
}
```

### Contoh Data dari Database
```
bp_code: "AKMP"
bp_name: "ANDA KAMA MULYA PRANATA PT"
status: "Active"
```

## Cara Kerja

### 1. Load Data Supplier
```typescript
useEffect(() => {
  fetchEmployees();
  fetchSuppliers(); // Load supplier data saat component mount
}, []);
```

### 2. Conditional Rendering
```typescript
{formData.visitor_needs === 'Delivery' ? (
  <select name="visitor_from" onChange={handleSupplierChange}>
    <option value="" disabled>Pilih Supplier</option>
    {suppliers.map((supplier) => (
      <option key={supplier.value} value={supplier.value}>
        {supplier.label}
      </option>
    ))}
  </select>
) : (
  <input type="text" name="visitor_from" onChange={handleChange} />
)}
```

### 3. Handle Supplier Selection
```typescript
const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedSupplierCode = e.target.value;
  setFormData({ ...formData, visitor_from: selectedSupplierCode });
};
```

## Testing

### 1. Test Database Connection
Pastikan backend API berjalan dan dapat mengakses database sanoh-scm:
```bash
curl -X GET "http://localhost:8000/api/supplier/test-connection"
```

### 2. Test Frontend
1. Buka aplikasi frontend
2. Navigate ke halaman check-in
3. Pilih keperluan "Delivery"
4. Verifikasi dropdown supplier muncul
5. Pilih supplier dan submit form
6. Cek database bahwa `visitor_from` berisi `bp_code` supplier

## Error Handling

### 1. API Error
```typescript
const fetchSuppliers = async () => {
  try {
    const data = await fetchSupplierData();
    setSuppliers(data);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    // Fallback: set empty array atau show error message
  }
};
```

### 2. Empty Supplier List
Jika tidak ada data supplier, dropdown akan kosong dan user perlu memilih supplier lain atau mengubah keperluan.

## Performance Considerations

### 1. Data Loading
- Supplier data di-load sekali saat component mount
- Data disimpan di state untuk menghindari re-fetch

### 2. Search Functionality
Jika diperlukan, bisa ditambahkan search functionality untuk supplier:
```typescript
const [searchTerm, setSearchTerm] = useState('');
const filteredSuppliers = suppliers.filter(supplier => 
  supplier.label.toLowerCase().includes(searchTerm.toLowerCase())
);
```

## Future Enhancements

### 1. Search dalam Dropdown
- Tambahkan input search di dalam dropdown
- Filter supplier berdasarkan keyword

### 2. Pagination
- Jika supplier banyak, implementasikan pagination
- Load supplier secara lazy

### 3. Caching
- Cache supplier data di localStorage
- Refresh cache secara berkala

## Troubleshooting

### 1. Dropdown Tidak Muncul
- Cek console untuk error API
- Pastikan backend API berjalan
- Cek network tab untuk request ke `/api/supplier/`

### 2. Data Supplier Kosong
- Cek database sanoh-scm apakah ada data di tabel business_partner
- Cek status supplier (harus 'active')
- Test API endpoint langsung

### 3. Data Tidak Tersimpan
- Cek apakah `visitor_from` berisi `bp_code` bukan `bp_name`
- Cek console untuk error saat submit
- Verifikasi data yang dikirim ke backend

## Contoh Penggunaan

### 1. User Flow untuk Delivery
1. User pilih tanggal
2. User isi nama
3. User pilih keperluan "Delivery"
4. Dropdown supplier muncul
5. User pilih supplier (contoh: "ANDA KAMA MULYA PRANATA PT")
6. Field "Bertemu" otomatis set ke "Warehouse"
7. User isi jumlah tamu dan no polisi
8. Submit form
9. Data tersimpan dengan `visitor_from = "AKMP"`

### 2. User Flow untuk Meeting
1. User pilih tanggal
2. User isi nama
3. User pilih keperluan "Meeting"
4. Field "Dari" menjadi input text
5. User ketik asal visitor (contoh: "PT ABC")
6. User isi host dan field lainnya
7. Submit form
8. Data tersimpan dengan `visitor_from = "PT ABC"`

Implementasi ini memberikan pengalaman user yang lebih baik dengan dropdown supplier yang terintegrasi dengan database sanoh-scm.
