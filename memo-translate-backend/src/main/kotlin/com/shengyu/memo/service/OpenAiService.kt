package com.shengyu.memo.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.shengyu.memo.dto.AnalyzeResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient

@Service
class OpenAiService(
    @Value("\${spring.ai.openai.api-key}") private val apiKey: String,
    @Value("\${spring.ai.openai.base-url}") private val baseUrl: String,
    @Value("\${spring.ai.openai.chat.options.model}") private val model: String,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(OpenAiService::class.java)
    
    private val restClient = RestClient.builder()
        .baseUrl(baseUrl)
        .build()

    fun analyzeSentence(text: String): AnalyzeResponse {
        logger.info("Analyzing text with model $model: ${text.take(50)}...")
        
        val systemPrompt = """
            You are an expert English tutor helping Chinese learners.
            Analyze the given English sentence and return ONLY a valid JSON object with this exact structure:
            {
              "grammar": "Detailed grammar analysis in Chinese",
              "phrases": ["key phrase 1", "key phrase 2"],
              "memoryTip": "A creative mnemonic tip in Chinese"
            }
            Do not include markdown formatting. Return only raw JSON.
        """.trimIndent()

        val requestBody = mapOf(
            "model" to model,
            "messages" to listOf(
                mapOf("role" to "system", "content" to systemPrompt),
                mapOf("role" to "user", "content" to "Analyze: \"$text\"")
            ),
            "temperature" to 0.7
        )

        try {
            val response = restClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer $apiKey")
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(Map::class.java) as Map<*, *>

            val choices = response["choices"] as? List<*>
            val message = (choices?.firstOrNull() as? Map<*, *>)?.get("message") as? Map<*, *>
            val content = message?.get("content") as? String
                ?: throw RuntimeException("Empty AI response")

            val cleanJson = content.trim()
                .removePrefix("```json").removePrefix("```")
                .removeSuffix("```").trim()

            logger.info("AI Response: $cleanJson")

            return objectMapper.readValue(cleanJson, AnalyzeResponse::class.java)
        } catch (e: Exception) {
            logger.error("AI Service Error", e)
            return AnalyzeResponse(
                grammar = "AI调用失败: ${e.message}",
                phrases = listOf("error"),
                memoryTip = "请检查API配置"
            )
        }
    }
}
