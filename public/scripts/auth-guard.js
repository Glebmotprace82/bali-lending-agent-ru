// scripts/auth-guard.js

// Ваши ключи Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCGjMoQyDZUE-TUc2oJ1fIsf3E8hFiyZB4",
  authDomain: "tourdone-lending-gleb82.firebaseapp.com",
  projectId: "tourdone-lending-gleb82",
  storageBucket: "tourdone-lending-gleb82.firebasestorage.app",
  messagingSenderId: "40827496212",
  appId: "1:40827496212:web:03e0921d9605393c8b8401"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Находим кнопку выхода, которую мы добавили в HTML
const logoutButton = document.getElementById('logout-button');

// --- ГЛАВНЫЙ ОХРАННИК ---
// Эта функция запускается при каждой загрузке страницы
auth.onAuthStateChanged(user => {
    if (user) {
        // Пользователь в системе. Все хорошо, ничего не делаем.
        console.log('Доступ разрешен для:', user.email);
    } else {
        // Пользователя в системе нет!
        // Немедленно перенаправляем его на страницу входа.
        console.log('Доступ запрещен! Перенаправление...');
        window.location.href = '/login.html';
    }
});
// --- КОНЕЦ ОХРАННИКА ---


// Добавляем действие для кнопки "Выйти"
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        auth.signOut().then(() => {
            // Выход успешен, отправляем на страницу входа
            console.log('Пользователь вышел из системы.');
            window.location.href = '/login.html';
        }).catch((error) => {
            console.error('Ошибка при выходе:', error);
        });
    });
}