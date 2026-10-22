# Undangan Digital — Gita & Iwan (Ngunduh Mantu)

Undangan digital statis tema ilustrasi garis klasik: kertas ivory, bingkai renda, merak, dan rumah joglo yang digambar dengan SVG orisinal. Intro meniru gaya video referensi: judul "Ngunduh Mantu", nama mempelai muncul huruf per huruf dengan efek blur, lalu joglo tergambar garis demi garis.

## Menjalankan

Buka `index.html` di browser, atau sajikan folder ini dengan server statis apa pun. Tanpa proses build.

## Personalisasi nama tamu

Nama tamu dibaca dari **path URL**; segmen terakhir alamat menjadi nama tamu (tanda hubung dibaca sebagai spasi), contoh:

```
https://zyreejago.github.io/undangan-digital/bapak-joko-prasetyo/
```

Agar pola ini jalan di hosting statis, repo ini dilengkapi `vercel.json` (rewrite satu segmen path, untuk Vercel) dan `404.html` (penangkap path untuk GitHub Pages). Bentuk cadangan `index.html?to=Bapak+Joko+Prasetyo` juga didukung.

## Isi

- Sampul intro bergaya ilustrasi garis: bingkai renda, medali berputar pelan, dua merak, joglo, dan rangkaian bunga
- Ayat suci, profil mempelai, hitung mundur, rangkaian acara (Ngunduh Mantu & Resepsi)
- Kisah kami, galeri, amplop digital (salin nomor), RSVP & ucapan (tersimpan di localStorage)
- Musik latar petikan pentatonis (WebAudio), animasi GSAP + ScrollTrigger dengan cadangan IntersectionObserver
- Nama, tanggal, dan rekening bersifat fiktif untuk demo; foto adalah placeholder referensi
