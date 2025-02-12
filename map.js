const redPulseIcon = L.divIcon({
    className: 'pulsing-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const greenArrowIcon = L.divIcon({
    className: 'arrow-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: '<div class="arrow"></div>'
});

let map = L.map('map', {
    zoomControl: false
}).setView([24.774265, 46.738586], 13);

let marker = null;
let arrowMarker = null;
let path = [];
let polyline = null;
let isFirstUpdate = true;
let currentPosition = null;
let lastPosition = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

const speedElement = document.getElementById('speed');
const centerButton = document.getElementById('centerButton');

function updateLocation(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const speed = position.coords.speed * 3.6;

    currentPosition = { lat, lng };

    if (!marker) {
        marker = L.marker([lat, lng], { icon: redPulseIcon })
            .bindPopup(createPopupContent(speed, lat, lng))
            .addTo(map);
    } else {
        marker.setLatLng([lat, lng])
            .setPopupContent(createPopupContent(speed, lat, lng));
    }

    if (speed > 0) {
        if (!arrowMarker) {
            arrowMarker = L.marker([lat, lng], { icon: greenArrowIcon }).addTo(map);
        } else {
            arrowMarker.setLatLng([lat, lng]);
        }

        if (lastPosition) {
            const angle = Math.atan2(lat - lastPosition.lat, lng - lastPosition.lng) * 180 / Math.PI;
            document.querySelector('.arrow').style.transform = `rotate(${angle}deg)`;
        }
    } else if (arrowMarker) {
        map.removeLayer(arrowMarker);
        arrowMarker = null;
    }

    lastPosition = { lat, lng };

    path.push([lat, lng]);

    if (polyline) map.removeLayer(polyline);
    polyline = L.polyline(path, { color: 'red' }).addTo(map);

    speedElement.textContent = `السرعة: ${speed.toFixed(1)} كم/س`;

    if (isFirstUpdate) {
        map.setView([lat, lng], 13);
        isFirstUpdate = false;
    }

    if (typeof window.saveToDB === 'function') {
        window.saveToDB(lat, lng, speed.toFixed(1));
    }
}

function handleError(error) {
    console.error('Geolocation error:', error);
    speedElement.textContent = 'خطأ في تحديد الموقع انقر للتحديث 🔄!';
}

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(updateLocation, handleError, {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
    });
}

window.addEventListener('resize', () => {
    map.invalidateSize();
});

L.control.zoom({
    position: 'bottomright'
}).addTo(map);

function focusOnLocation() {
    if (currentPosition) {
        map.setView([currentPosition.lat, currentPosition.lng], 17);
        marker.openPopup();
        setTimeout(() => marker.closePopup(), 3000);
    } else {
        alert("لا يوجد موقع متاح حاليًا!");
    }
}

document.getElementById('centerButton').addEventListener('click', focusOnLocation);

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