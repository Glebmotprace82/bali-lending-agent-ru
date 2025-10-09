/**
 * Главный файл облачных функций Firebase.
 * ИСПРАВЛЕННАЯ ВЕРСИЯ: Использует переменные окружения (`process.env`) 
 * вместо устаревшего `functions.config()`.
 */

const functions = require("firebase-functions");
const {defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();

// Secret Manager: объявляем секрет GEMINI_KEY
const GEMINI_KEY = defineSecret("GEMINI_KEY");

/**
 * Функция для генерации текста с помощью модели Gemini.
 */
exports.generateText = functions
  .runWith({secrets: [GEMINI_KEY]})
  .https.onCall(async (data, context) => {
  const apiKey = GEMINI_KEY.value();

  if (!apiKey) {
    console.error("Переменная окружения GEMINI_KEY не найдена.");
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Ключ API не настроен на сервере."
    );
  }

  const {prompt, useGrounding} = data;
  if (!prompt) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "В запросе на генерацию текста отсутствует поле 'prompt'."
    );
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
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
 */
exports.generateImage = functions
  .runWith({secrets: [GEMINI_KEY]})
  .https.onCall(async (data, context) => {
  const apiKey = GEMINI_KEY.value();

  if (!apiKey) {
    console.error("Переменная окружения GEMINI_KEY не найдена для функции изображений.");
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Ключ API не настроен на сервере."
    );
  }
    
  const {prompt} = data;
  if (!prompt) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "В запросе на генерацию изображения отсутствует поле 'prompt'."
    );
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
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

