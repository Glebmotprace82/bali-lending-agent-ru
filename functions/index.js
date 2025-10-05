/**
 * Главный файл облачных функций Firebase.
 * Исправленная версия с единым методом получения API-ключа.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Функция для генерации текста с помощью модели Gemini.
 */
exports.generateText = functions.https.onCall(async (data, context) => {
  const GEMINI_API_KEY = functions.config().gemini.key;

  if (!GEMINI_API_KEY) {
    console.error("API-ключ Gemini не найден в конфигурации.");
    throw new functions.https.HttpsError(
      "failed-precondition",
      "API-ключ для Gemini не настроен. Пожалуйста, выполните команду `firebase functions:config:set gemini.key=ВАШ_КЛЮЧ`."
    );
  }

  const {prompt, useGrounding} = data;
  if (!prompt) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "В запросе на генерацию текста отсутствует поле 'prompt'."
    );
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    contents: [{parts: [{text: prompt}]}],
  };

  if (useGrounding) {
    payload.tools = [{"google_search": {}}];
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Ошибка от API Google (текст):", errorBody);
      throw new functions.https.HttpsError("internal", `Ошибка от API Google: ${response.status}`);
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        console.error("Неожиданный ответ от API Google (текст):", JSON.stringify(result));
        throw new functions.https.HttpsError("internal", "API Google вернуло неожиданный формат ответа.");
    }
    
    return {text: text};
  } catch (error) {
    console.error("Внутренняя ошибка функции generateText:", error);
    throw new functions.https.HttpsError("internal", "Произошла внутренняя ошибка при генерации текста.");
  }
});

/**
 * Функция для генерации изображений с помощью модели Imagen.
 * Теперь использует тот же надежный метод получения ключа, что и generateText.
 */
exports.generateImage = functions.https.onCall(async (data, context) => {
  // Используем тот же способ, что и в первой функции
  const GEMINI_API_KEY = functions.config().gemini.key;

  if (!GEMINI_API_KEY) {
    console.error("API-ключ Gemini не найден в конфигурации для функции изображений.");
    throw new functions.https.HttpsError(
      "failed-precondition",
      "API-ключ для Gemini/Imagen не настроен."
    );
  }
    
  const {prompt} = data;
  if (!prompt) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "В запросе на генерацию изображения отсутствует поле 'prompt'."
    );
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`;
  const payload = {
    instances: [{prompt: prompt}],
    parameters: {sampleCount: 1},
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Ошибка от API изображений Google:", errorBody);
      throw new functions.https.HttpsError("internal", `Ошибка от API изображений Google: ${response.status}`);
    }

    const result = await response.json();
    const base64Image = result?.predictions?.[0]?.bytesBase64Encoded;

    if (!base64Image) {
        console.error("Неожиданный ответ от API изображений:", JSON.stringify(result));
        throw new functions.https.HttpsError("not-found", "API не вернуло изображение в ответе.");
    }

    return {base64Image: base64Image};
  } catch (error) {
    console.error("Внутренняя ошибка функции generateImage:", error);
    throw new functions.https.HttpsError("internal", "Произошла внутренняя ошибка при генерации изображения.");
  }
});
