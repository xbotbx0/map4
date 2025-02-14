// استيراد وحدات Firebase المطلوبة من مكتبة Firebase الإصدار 9.6.1
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js"; // تهيئة التطبيق
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; // إدارة المصادقة
import { getDatabase, ref, update, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js"; // إدارة قاعدة البيانات

// تكوين Firebase باستخدام الإعدادات الخاصة بالمشروع
const firebaseConfig = {
    apiKey: "AIzaSyB9ZqQCZG9g3qclDz-kLHrNQparJT_iBXc", // مفتاح API لتحديد المشروع
    authDomain: "mypro-d8761.firebaseapp.com", // نطاق المصادقة
    databaseURL: "https://mypro-d8761-default-rtdb.firebaseio.com", // رابط قاعدة البيانات في Firebase
    projectId: "mypro-d8761", // معرف المشروع في Firebase
    storageBucket: "mypro-d8761.appspot.com", // تخزين الملفات والوسائط
    messagingSenderId: "439741574644", // معرف إرسال الرسائل السحابية
    appId: "1:439741574644:web:50b693546c7d32a5579da1" // معرف التطبيق
};

// تهيئة التطبيق باستخدام التكوين السابق
const app = initializeApp(firebaseConfig);

// الحصول على كائن المصادقة لإدارة تسجيل الدخول والخروج
const auth = getAuth(app);

// الحصول على كائن قاعدة البيانات للتعامل مع البيانات المخزنة
const db = getDatabase(app);

// التحقق من حالة المستخدم عند تسجيل الدخول أو الخروج
onAuthStateChanged(auth, (user) => {
    if (user) {
        // إذا كان المستخدم مسجلاً الدخول
        console.log("المستخدم مسجل دخول:", user.uid); // طباعة معرف المستخدم في وحدة التحكم

        // إنشاء مرجع لبيانات المستخدم في قاعدة البيانات
        const userRef = ref(db, 'users/' + user.uid);

        // تعريف دالة لحفظ بيانات الموقع والسرعة في قاعدة البيانات
        window.saveToDB = (lat, lng, speed, heading) => {
            console.log("حفظ البيانات للمستخدم:", user.uid, { lat, lng, speed, heading });

            // تحديث بيانات المستخدم في قاعدة البيانات
            update(userRef, {
                latitude: lat, // حفظ خط العرض
                longitude: lng, // حفظ خط الطول
                speed: speed, // حفظ السرعة
                heading: heading, // حفظ اتجاه الحركة
                timestamp: Date.now() // حفظ الطابع الزمني للوقت الحالي
            }).then(() => {
                console.log("تم حفظ البيانات بنجاح"); // تأكيد نجاح الحفظ
            }).catch((error) => {
                console.error('خطأ في حفظ البيانات:', error); // طباعة الخطأ إذا فشل الحفظ
            });

            
            // مراقبة بيانات المستخدم وتحديثها في الواجهة عند تغييرها في قاعدة البيانات
            onValue(userRef, (snapshot) => {
                const userData = snapshot.val(); // الحصول على البيانات الجديدة من قاعدة البيانات
                
                // تحديث بيانات المستخدم في المتغير العام ليتم استخدامها في الواجهة
                window.userInfo = {
                    username: userData?.username || 'غير معروف', // جلب اسم المستخدم أو تعيينه كـ "غير معروف"
                    email: user.email, // جلب البريد الإلكتروني للمستخدم
                    speed: userData?.speed || 0, // جلب السرعة أو تعيينها إلى 0 إذا لم تكن موجودة
                    heading: userData?.heading || 0, // جلب الاتجاه أو تعيينه إلى 0 إذا لم يكن موجودًا
                    coords: userData ? [userData.latitude, userData.longitude] : [0, 0] // حفظ الإحداثيات أو تعيينها إلى [0,0] إذا لم تكن موجودة
                };
            });

            // مراقبة جميع المواقع في قاعدة البيانات وعرضها على الخريطة
            const locationsRef = ref(db, 'locations');
            console.log("save");

        
            













// إنشاء أيقونة سهم دوار للإشارة إلى اتجاه المستخدمين
function createArrowIcon(heading) {
    return L.divIcon({
        className: 'rotating-arrow', // الفئة الخاصة بالتصميم
        iconSize: [30, 30], // حجم الأيقونة
        iconAnchor: [15, 15], // نقطة تثبيت الأيقونة
        html: `<div class="arrow" style="transform: rotate(${heading}deg);"></div>` // تدوير السهم وفق الاتجاه
    });
}

// مراقبة جميع المواقع في قاعدة البيانات وعرضها على الخريطة
const usersRef = ref(db, 'users');

onValue(usersRef, (snapshot) => {
    console.log("📡 استلام البيانات من قاعدة البيانات:", snapshot.val());
    const users = snapshot.val();

    if (!users || Object.keys(users).length === 0) {
        console.log("⚠️ لا توجد مواقع متاحة في قاعدة البيانات.");
        return;
    }

    window.locationsCache = JSON.stringify(users);

    // إزالة الماركرات القديمة
    if (window.locationsMarkers) {
        window.locationsMarkers.forEach(marker => map.removeLayer(marker));
    }
    window.locationsMarkers = [];

    // إضافة ماركر لكل مستخدم لديه موقع مسجل
    Object.entries(users).forEach(([userId, userData]) => {
        if (userData.latitude && userData.longitude) {
            const heading = userData.heading || 0; // الاتجاه الافتراضي 0 إذا لم يكن متاحًا

            const locationMarker = L.marker([userData.latitude, userData.longitude], {
                icon: createArrowIcon(heading) // استخدام أيقونة السهم بدلاً من الأيقونة الافتراضية
            }).bindPopup(`
                <div dir="rtl">
                    <b>اسم المستخدم:</b> ${userData.username || 'غير معروف'}<br>
                    <b>الإيميل:</b> ${userData.email || 'غير متاح'}<br>
                    <b>السرعة:</b> ${userData.speed || 'غير متاحة'} كم/س<br>
                    <b>الاتجاه:</b> ${heading}°<br>
                    <b>الإحداثيات:</b> ${userData.latitude.toFixed(4)}, ${userData.longitude.toFixed(4)}
                </div>
            `).addTo(map);

            window.locationsMarkers.push(locationMarker);
        }
    });
});




        };
    } else {
        // إذا لم يكن المستخدم مسجلاً الدخول، يتم توجيهه إلى صفحة تسجيل الدخول
        window.location.href = "login.html";
    }
});

// إضافة حدث لتسجيل الخروج عند الضغط على زر الخروج
document.querySelector('.logout-btn').addEventListener('click', async () => {
    try {
        await signOut(auth); // تسجيل خروج المستخدم من Firebase
        window.location.href = 'login.html'; // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
    } catch (error) {
        console.error("خطأ في تسجيل الخروج:", error); // طباعة الخطأ في وحدة التحكم إذا فشل تسجيل الخروج
        alert("حدث خطأ أثناء محاولة تسجيل الخروج"); // عرض رسالة تنبيهية للمستخدم
    }
});

// إنشاء أيقونة سهم دوار للإشارة إلى الاتجاه على الخريطة
const arrowIcon = L.divIcon({
    className: 'rotating-arrow', // تعيين اسم الفئة الخاصة بالأيقونة (يتم التحكم بها عبر CSS)
    iconSize: [30, 30], // حجم الأيقونة (عرض × ارتفاع)
    iconAnchor: [15, 15], // نقطة تثبيت الأيقونة (المكان الذي يتم وضعها فيه على الخريطة)
    html: '<div class="arrow"></div>' // محتوى الأيقونة، هنا يتم تمثيلها بعنصر div قابل للتخصيص عبر CSS
});

// إنشاء خريطة Leaflet مع إلغاء التحكم في التكبير الافتراضي
let map = L.map('map', {
    zoomControl: false // تعطيل زر التحكم في التكبير والتصغير الافتراضي
}).setView([24.774265, 46.738586], 13); // تعيين المركز الافتراضي للخريطة عند الإحداثيات (الرياض، السعودية) مع مستوى تكبير 13

// متغيرات لتتبع الموقع وحركة المستخدم
let marker = null; // مؤشر الموقع (marker) على الخريطة
let path = []; // مصفوفة لتخزين نقاط المسار (يتم استخدامها لرسم المسار الذي يتحرك عليه المستخدم)
let polyline = null; // خط متعدد القطع لرسم المسار
let isFirstUpdate = true; // متغير لتحديد ما إذا كانت هذه أول مرة يتم فيها تحديث الموقع
let currentPosition = null; // متغير لتخزين الموقع الحالي للمستخدم
let previousHeading = 0; // متغير لتخزين الاتجاه السابق للمستخدم

// إضافة طبقة خرائط من OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap' // إضافة نسبة المصدر لحقوق OpenStreetMap
}).addTo(map); // إضافة الطبقة إلى الخريطة

let locationsMarkers = []; // مصفوفة لتخزين ماركرات المواقع

// الحصول على عناصر HTML لعرض السرعة وزر توسيط الخريطة
const speedElement = document.getElementById('speed'); // عنصر HTML لعرض السرعة
const centerButton = document.getElementById('centerButton'); // زر لتوسيط الخريطة على الموقع الحالي

// دالة لتحديث الموقع على الخريطة عند تغيير الموقع الجغرافي
function updateLocation(position) {
    // استخراج الإحداثيات والسرعة والاتجاه من كائن الموقع الجغرافي
    const lat = position.coords.latitude; // خط العرض
    const lng = position.coords.longitude; // خط الطول
    const speed = position.coords.speed * 3.6; // تحويل السرعة من م/ث إلى كم/س
    const heading = position.coords.heading !== null ? position.coords.heading : previousHeading; 
    // استخدام الاتجاه من الموقع الجغرافي، أو الاتجاه السابق إذا لم يكن متاحًا

    // تحديث الموقع الحالي والاتجاه السابق
    currentPosition = { lat, lng };
    previousHeading = heading;

    // التحقق مما إذا كان المؤشر (marker) غير موجود، وإذا لم يكن موجودًا يتم إنشاؤه
    if (!marker) {
        marker = L.marker([lat, lng], { 
            icon: arrowIcon // تعيين أيقونة السهم المخصصة
        }).bindPopup(createPopupContent(speed, lat, lng)) // تعيين نافذة منبثقة تحتوي على بيانات الموقع
        .addTo(map); // إضافة المؤشر إلى الخريطة
        
        // تحديث دوران أيقونة السهم وفق الاتجاه الحالي
        const arrowElement = marker.getElement().querySelector('.arrow');
        if (arrowElement) {
            arrowElement.style.transform = `rotate(${heading}deg)`; // تدوير السهم ليتجه نحو الاتجاه الصحيح
        }
    } else {
        // إذا كان المؤشر موجودًا، يتم تحديث موقعه ومحتوى النافذة المنبثقة
        marker.setLatLng([lat, lng])
             .setPopupContent(createPopupContent(speed, lat, lng)); 

        // تحديث دوران أيقونة السهم بناءً على الاتجاه الجديد
        const arrowElement = marker.getElement().querySelector('.arrow');
        if (arrowElement) {
            arrowElement.style.transform = `rotate(${heading}deg)`;
        }
    }

    // إضافة الموقع الجديد إلى مسار الحركة
    path.push([lat, lng]);

    // إذا كان هناك مسار سابق، يتم حذفه من الخريطة
    if (polyline) map.removeLayer(polyline);

    // رسم مسار جديد باستخدام النقاط المخزنة
    polyline = L.polyline(path, {color: 'red'}).addTo(map);

    // تحديث عنصر عرض السرعة في واجهة المستخدم
    speedElement.textContent = `السرعة: ${speed.toFixed(1)} كم/س`;

    // عند أول تحديث فقط، يتم ضبط عرض الخريطة على الموقع الحالي
    if (isFirstUpdate) {
        map.setView([lat, lng], 13);
        isFirstUpdate = false;
    }

    // حفظ البيانات في قاعدة البيانات إذا كانت الدالة متاحة
    if (typeof window.saveToDB === 'function') {
        window.saveToDB(lat, lng, speed.toFixed(1), heading);
    }
}

// دالة لمعالجة أخطاء تحديد الموقع الجغرافي
function handleError(error) {
    console.error('Geolocation error:', error); // طباعة الخطأ في وحدة التحكم
    speedElement.textContent = 'خطأ في تحديد الموقع انقر للتحديث 🔄!'; // عرض رسالة خطأ في واجهة المستخدم
}

// التحقق مما إذا كان المتصفح يدعم تحديد الموقع الجغرافي
if (navigator.geolocation) {
    // متابعة تغييرات الموقع بشكل مستمر
    navigator.geolocation.watchPosition(updateLocation, handleError, {
        enableHighAccuracy: true, // استخدام أعلى دقة ممكنة في تحديد الموقع
        maximumAge: 30000, // استخدام الموقع المحفوظ لمدة 30 ثانية قبل طلب موقع جديد
        timeout: 27000 // مهلة انتظار لمدة 27 ثانية قبل ظهور خطأ إذا لم يتم الحصول على الموقع
    });
}

// إضافة مستمع لحدث تغيير حجم النافذة لإعادة ضبط حجم الخريطة تلقائيًا
window.addEventListener('resize', () => {
    map.invalidateSize(); // تحديث حجم الخريطة عند تغيير حجم النافذة
});

// إضافة أزرار التكبير والتصغير إلى الخريطة في الزاوية اليمنى السفلية
L.control.zoom({
    position: 'bottomright' // تحديد موقع عناصر التحكم في التكبير والتصغير
}).addTo(map);

// دالة لتوسيط الخريطة على الموقع الحالي عند الضغط على زر التوسيط
function focusOnLocation() {
    if (currentPosition) { // التحقق مما إذا كان هناك موقع متاح
        map.setView([currentPosition.lat, currentPosition.lng], 13); // ضبط الخريطة على الموقع الحالي
        marker.openPopup(); // فتح النافذة المنبثقة للمؤشر
        setTimeout(() => marker.closePopup(), 3000); // إغلاق النافذة تلقائيًا بعد 3 ثوانٍ
    } else {
        alert("لا يوجد موقع متاح حاليًا!"); // تنبيه المستخدم في حالة عدم توفر موقع
    }
} 

// ربط زر التوسيط بوظيفة التركيز على الموقع
document.getElementById('centerButton').addEventListener('click', focusOnLocation);

// دالة لإنشاء محتوى النافذة المنبثقة التي تظهر عند النقر على المؤشر
function createPopupContent(speed, lat, lng) {
    return `
        <div dir="rtl" style="text-align: right;">
            <h4 style="margin: 5px 0;">معلومات المستخدم</h4>
            <hr style="margin: 5px 0;">
            <b>الاسم:</b> ${window.userInfo?.username || 'غير معروف'}<br>
            <b>الإيميل:</b> ${window.userInfo?.email || 'غير معروف'}<br>
            <b>السرعة:</b> ${speed.toFixed(1)} كم/س<br>
            <b>الإحداثيات:</b><br>
            ${lat.toFixed(6)}, ${lng.toFixed(6)}
        </div>
    `;
}