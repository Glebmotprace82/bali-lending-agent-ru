const functions = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { defineString } = require('firebase-functions/params');
const prompts = require('./functionContent.json');

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
            model: "gemini-1.5-flash", // <--- ВОТ ЗДЕСЬ ДОБАВЛЕНА ЗАПЯТАЯ
            generationConfig: {
                temperature: 0.85,
            }
        });

        const context = request.body.context;

        if (!context) {
            return response.status(400).json({ error: prompts.errors.noContext });
        }
        
        const angles = prompts.angles;
        const randomAngle = angles[Math.floor(Math.random() * angles.length)];
        
        const p = prompts.promptContent;
        const fullPrompt = `${p.role}\n\n${p.task}\n\n${p.rules}\n\n${p.conditionPrefix} ${randomAngle}.\n\n${p.contextPrefix}\n${context}`;

        const result = await model.generateContent(fullPrompt);
        const geminiResponse = await result.response;
        const text = geminiResponse.text();

        response.status(200).json({ text: text });

    } catch (error) {
        console.error(prompts.errors.apiCallErrorLog, error);
        response.status(500).json({ error: prompts.errors.internalError });
    }
});
