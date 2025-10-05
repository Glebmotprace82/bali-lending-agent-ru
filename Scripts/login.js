// scripts/login.js

// Ваши ключи Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCGjMoQyDZUE-TUc2oJ1fIsf3E8hFiyZB4",
  authDomain: "tourdone-lending-gleb82.firebaseapp.com",
  projectId: "tourdone-lending-gleb82",
  storageBucket: "tourdone-lending-gleb82.firebasestorage.app",
  messagingSenderId: "40827496212",
  appId: "1:40827496212:web:03e0921d9605393c8b8401"
};

// Инициализация Firebase с вашими ключами
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Получаем элементы со страницы
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

// Добавляем обработчик на отправку формы
loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Отменяем стандартную отправку формы
    
    const email = emailInput.value;
    const password = passwordInput.value;
    
    errorMessage.textContent = ''; // Очищаем старые ошибки

    // Отправляем email и пароль в Firebase
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Вход успешен!
            // Перенаправляем пользователя на закрытую страницу
            window.location.href = '/members.html';
        })
        .catch((error) => {
            // Если Firebase вернул ошибку (неверный пароль и т.д.)
            errorMessage.textContent = 'Неверный email или пароль.';
            console.error("Ошибка входа:", error);
        });
});