const functions = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { defineString } = require('firebase-functions/params');

// Загружаем переменные из .env файла для локального тестирования
require("dotenv").config();

// Определяем секрет для развертывания
const geminiApiKey = defineString("GEMINI_API_KEY");

exports.generatePost = functions.https.onRequest(async (request, response) => {
    // Настраиваем CORS
    response.set('Access-control-Allow-Origin', '*');
    if (request.method === 'OPTIONS') {
        response.set('Access-control-Allow-Methods', 'POST');
        response.set('Access-control-Allow-Headers', 'Content-Type');
        response.status(204).send('');
        return;
    }

    try {
        // Используем ключ, определенный выше
        const genAI = new GoogleGenerativeAI(geminiApiKey.value());
        
        // --- ИСПРАВЛЕННЫЙ БЛОК ---
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest", // <--- ВОТ ЗДЕСЬ ДОБАВЛЕНА ЗАПЯТАЯ
            generationConfig: {
                temperature: 0.85,
            }
        });

        const context = request.body.context;

        if (!context) {
            return response.status(400).json({ error: "Не был предоставлен контекст (context)." });
        }
        
        const angles = [
            "сделай акцент на духовных и мистических аспектах",
            "сфокусируйся на приключениях, драйве и активных действиях",
            "опиши этот день с точки зрения гурмана, обращая внимание на еду, напитки и запахи",
            "создай пост, который в первую очередь передает ощущение роскоши, комфорта и заботы",
            "напиши текст, делая упор на уникальные факты, историю и культурные детали"
        ];
        const randomAngle = angles[Math.floor(Math.random() * angles.length)];
        
        const fullPrompt = `**Роль:**
Ты — не просто гид, а "проводник" в сакральный и настоящий мир Бали. Твой стиль — эпический, глубокий, ты умеешь переплетать древние мифы, природные явления, личные ощущения и исторические факты в единое повествование.

**Задача:**
На основе предоставленного текста напиши яркий и эмоциональный пост для Instagram. Итоговый текст должен быть объемом примерно 1000-1200 символов.
Обязательное условие: в этот раз ${randomAngle}.

Строго придерживайся только той информации, которая предоставлена в тексте. Категорически запрещено добавлять любые факты или услуги, которых нет в исходном тексте. Сохрани основной смысл, все эмодзи и хештеги, если они есть.

Вот текст для работы:
${context}`;

        const result = await model.generateContent(fullPrompt);
        const geminiResponse = await result.response;
        const text = geminiResponse.text();

        response.status(200).json({ text: text });

    } catch (error) {
        console.error("Критическая ошибка при вызове Gemini API:", error);
        response.status(500).json({ error: "Не удалось сгенерировать пост из-за внутренней ошибки сервера." });
    }
});
