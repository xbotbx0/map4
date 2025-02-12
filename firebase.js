import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, update, onDisconnect } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { get, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyB9ZqQCZG9g3qclDz-kLHrNQparJT_iBXc",
    authDomain: "mypro-d8761.firebaseapp.com",
    databaseURL: "https://mypro-d8761-default-rtdb.firebaseio.com",
    projectId: "mypro-d8761",
    storageBucket: "mypro-d8761.appspot.com",
    messagingSenderId: "439741574644",
    appId: "1:439741574644:web:50b693546c7d32a5579da1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("المستخدم مسجل دخول:", user.uid);
        const userRef = ref(db, 'users/' + user.uid);

        window.saveToDB = (lat, lng, speed) => {
            console.log("حفظ البيانات للمستخدم:", user.uid, { lat, lng, speed });
            update(userRef, {
                latitude: lat,
                longitude: lng,
                speed: speed,
                timestamp: Date.now()
            }).then(() => {
                console.log("تم حفظ البيانات بنجاح");
            }).catch((error) => {
                console.error('خطأ في حفظ البيانات:', error);
            });

            onValue(userRef, (snapshot) => {
                const userData = snapshot.val();
                window.userInfo = {
                    username: userData?.username || 'غير معروف',
                    email: user.email,
                    speed: userData?.speed || 0,
                    coords: userData ? [userData.latitude, userData.longitude] : [0, 0]
                };
            });
        };
    } else {
        window.location.href = "login.html";
    }
});

document.querySelector('.logout-btn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error("خطأ في تسجيل الخروج:", error);
        alert("حدث خطأ أثناء محاولة تسجيل الخروج");
    }
});