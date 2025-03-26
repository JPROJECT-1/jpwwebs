// Variabel untuk menyimpan data dari Firebase
let firebaseData = [];

// Fungsi untuk mengambil data dari Firebase
async function fetchDataFromFirebase() {
  // const snapshot = await firebase.database().ref("data").once("value");
  // firebaseData = snapshot.val() || [];

  const snapshot = await firebase.database().ref("data").once("value");
  const data = snapshot.val();

  if (data) {
    firebaseData = Object.values(data); // Ubah objek menjadi array tanpa slot kosong
  } else {
    firebaseData = [];
  }
}

// Panggil fungsi untuk mengambil data
fetchDataFromFirebase();

// Elemen HTML
const searchBox = document.getElementById("search-box");
const autocompleteList = document.getElementById("autocomplete-list");

// Fungsi untuk menampilkan rekomendasi
function showRecommendations(query) {
  autocompleteList.innerHTML = ""; // Bersihkan daftar

  if (!query) return; // Jangan tampilkan jika query kosong

  // Filter data berdasarkan URL
  const filtered = firebaseData
    .filter((item) => item.url.toLowerCase().includes(query.toLowerCase()))
    .map((item) => item.url);

  // Tampilkan URL yang cocok
  filtered.forEach((url) => {
    const div = document.createElement("div");
    div.className = "autocomplete-item";
    div.textContent = url;

    // Tambahkan event klik
    div.onclick = () => {
      searchBox.value = url;
      autocompleteList.innerHTML = "";
    };

    autocompleteList.appendChild(div);
  });
}

// Event listener untuk input
searchBox.addEventListener("input", (e) => {
  const query = e.target.value;
  showRecommendations(query);
});

// Event listener untuk klik di luar autocomplete
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-container")) {
    autocompleteList.innerHTML = "";
  }
});

// Fungsi untuk pencarian
function triggerSearch() {
  const query = searchBox.value.trim();
  const selectedItem = firebaseData.find((item) => item.url === query);

  if (selectedItem) {
    makeblob(selectedItem.web);
  } else {
    alert("URL tidak ditemukan.");
  }
}

function makeblob(html) {
  const blob = new Blob([html], { type: "text/html" });
  const blobUrl = URL.createObjectURL(blob);
  setweb(blobUrl);
}

function setweb(url) {
  document
    .querySelectorAll('link[rel="stylesheet"]')
    .forEach((link) => link.remove());

  // Kosongkan body
  document.body.innerHTML = "";

  // Tambahkan iframe fullscreen
  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "100vw";
  iframe.style.height = "100vh";
  iframe.style.border = "none";

  // Masukkan iframe ke dalam body
  document.body.appendChild(iframe);
}
