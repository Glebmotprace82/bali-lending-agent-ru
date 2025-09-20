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
        Ты — SMM-специалист и талантливый копирайтер, который создает "сочные" посты о путешествиях на Бали. Ты пишешь для Instagram.

        **Задача:**
        На основе предоставленной информации напиши короткий, яркий и динамичный пост для Instagram.

        **Строгие правила:**
        1.  **Объем:** Итоговый текст должен быть объемом **400-600 символов**. Это очень важно.
        2.  **Стиль:** Текст должен быть легким для чтения, вдохновляющим и лаконичным. Избегай слишком длинных, витиеватых описаний.
        3.  **Структура:**
            * Начни с цепляющего заголовка или вопроса (1 предложение).
            * В основной части (2-3 предложения) передай главную эмоцию и суть дня, упомянув 1-2 ключевых места или события. Не нужно описывать всё подряд.
            * Заверши призывом к действию или открытым вопросом.
        4.  **Контент:** Используй **только** информацию из предоставленного текста. Сохрани ключевые эмодзи и хештеги, если они есть.

        Обязательное условие: в этот раз ${randomAngle}.

        Вот информация для работы:
        ${enrichedContext}`;

        const result = await model.generateContent(fullPrompt);
        const geminiResponse = await result.response;
        const text = geminiResponse.text();

        response.status(200).json({ text: text });

    } catch (error) {
        console.error("Критическая ошибка при вызове Gemini API:", error);
        response.status(500).json({ error: "Не удалось сгенерировать пост из-за внутренней ошибки сервера." });
    }
});
