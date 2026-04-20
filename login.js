
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDiW7rFa4YUCmT-sOpffx3iVamfmlCxZxE",
    authDomain: "akunmwh.firebaseapp.com",
    projectId: "akunmwh",
    storageBucket: "akunmwh.firebasestorage.app",
    messagingSenderId: "953097983724",
    appId: "1:953097983724:web:d1f8701e7346411234b7c9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.getElementById("loginBtn").onclick = async () => {
  const sap = document.getElementById("sap").value.trim();
  const password = document.getElementById("password").value.trim();
  const loading = document.getElementById("loading");

  if (!sap || !password) {
    alert("No SAP dan Password wajib diisi");
    return;
  }

  loading.style.display = "block";

  try {
    const snap = await get(ref(db, `users/${sap}`));
    loading.style.display = "none";

    if (!snap.exists()) {
      alert("No SAP tidak terdaftar");
      return;
    }

    const data = snap.val();

    if (data.password === password) {
      // ✅ SIMPAN DATA LOGIN
      localStorage.setItem("login", "true");
      localStorage.setItem("nama", data.nama);
      localStorage.setItem("sap", sap);

      window.location.href = "home.html";
    } else {
      alert("Password salah");
    }

  } catch (err) {
    loading.style.display = "none";
    alert("Gagal login");
    console.error(err);
  }
};

