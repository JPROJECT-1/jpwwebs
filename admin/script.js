const webName = document.getElementById("webName");
const domain = document.getElementById("domain");
const webContent = document.getElementById("webContent");
const addDataBtn = document.getElementById("addDataBtn");
const jdl = document.getElementById("jdl");
const dataTable = document.getElementById("dataTable");

// Tambah data baru
addDataBtn.addEventListener("click", () => {
  const ref2 = firebase.database().ref("data");
  ref2.once("value", (snapshot) => {
    const data = snapshot.val();

    const name = webName.value.trim();
    const selectedDomain = domain.value;
    const content = webContent.value.trim();
    const url = `${name}${selectedDomain}`;

    if (!name || !content) {
      alert("Nama web dan konten harus diisi!");
      return;
    }

    const exists = Object.values(data).some((item) => item.url === url);

    if (exists) {
      alert("URL sudah ada. Silakan pilih URL yang lain.");
      return;
    }

    const ref = firebase.database().ref("data");
    ref.once("value", (snapshot) => {
      const count = snapshot.numChildren();
      const newData = { url, web: content };

      ref
        .child(count)
        .set(newData)
        .then(() => {
          alert("Data berhasil ditambahkan!");
          webName.value = "";
          webContent.value = "";
          fetchData();
        });
    });
  });
});

// Ambil data dari Firebase
function fetchData() {
  const ref = firebase.database().ref("data");
  ref.once("value", (snapshot) => {
    const data = snapshot.val();
    dataTable.innerHTML = "";
    for (const id in data) {
      const row = data[id];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.url}</td>
        <td>
          <button onclick="editData('${id}')">Edit</button>
          <button onclick="deleteData('${id}')">Hapus</button>
        </td>
      `;
      dataTable.appendChild(tr);
    }
  });
}

// Hapus data dari Firebase
function deleteData(id) {
  const ref = firebase.database().ref(`data/${id}`);
  ref.remove().then(() => {
    alert("Data berhasil dihapus!");
    fetchData();
  });
}

// Edit data
function editData(id) {
  const ref = firebase.database().ref("data");
  ref.once("value", (snapshot) => {
    const wco = snapshot.val();
    const url = wco[id].url;
    const content = wco[id].web;
    const [name, domainExt] = url.split(".");

    // Set value ke form edit
    webName.value = name;
    domain.value = `.${domainExt}`;
    webContent.value = content;

    addDataBtn.textContent = "Simpan Perubahan";
    jdl.textContent = "Edit Data";

    // Atur onClick untuk simpan perubahan
    addDataBtn.onclick = () => {
      const data = wco;

      // Ambil nilai yang baru dimasukkan oleh user
      const name = webName.value.trim();
      const selectedDomain = domain.value;
      const content = webContent.value.trim();
      const newUrl = `${name}${selectedDomain}`;

      // Validasi inputan
      if (!name || !content) {
        alert("Nama web dan konten harus diisi!");
        return; // Berhenti jika ada error
      }

      // Cek apakah URL baru sudah ada, kecuali untuk URL yang sama dengan yang sedang diedit
      const exists = Object.values(data).some(
        (item) => item.url === newUrl && item.url !== url
      );

      if (exists) {
        alert("URL sudah ada. Silakan pilih URL yang lain.");
        return; // Berhenti jika URL sudah ada
      }

      // Update data di Firebase
      const ref = firebase.database().ref(`data/${id}`);
      ref
        .set({ url: newUrl, web: content })
        .then(() => {
          alert("Data berhasil diperbarui!");
          webName.value = "";
          webContent.value = "";
          addDataBtn.textContent = "Tambah Data";
          jdl.textContent = "Tambah Data";
          addDataBtn.onclick = addDataHandler; // Kembali ke fungsi tambah data
          fetchData(); // Refresh data di tabel
        })
        .catch((error) => {
          console.error("Error updating data:", error);
          alert("Terjadi kesalahan saat memperbarui data.");
        });
    };
  });
}

// Default handler untuk tambah data
function addDataHandler() {
  addDataBtn.click();
}

// Muat data saat halaman dimuat
fetchData();
