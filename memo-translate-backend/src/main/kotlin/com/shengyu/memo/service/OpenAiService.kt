package com.shengyu.memo.service

import com.shengyu.memo.config.OpenAiProperties
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Flux

/**
 * Service for interacting with OpenAI-compatible APIs in a streaming fashion.
 * Designed with a focus on extensibility and clean separation of concerns.
 */
@Service
class OpenAiService(
    private val properties: OpenAiProperties
) {
    private val logger = LoggerFactory.getLogger(OpenAiService::class.java)
    
    private val webClient = WebClient.builder()
        .baseUrl(properties.baseUrl)
        .defaultHeader("Authorization", "Bearer ${properties.apiKey}")
        .build()

    /**
     * Entry point for sentence analysis (Grammar, Phrases, Tips).
     */
    fun analyzeSentenceStream(text: String): Flux<String> {
        val messages = listOf(
            mapOf("role" to "system", "content" to Prompts.SYSTEM_ANALYZER),
            mapOf("role" to "user", "content" to "Analyze: \"$text\"")
        )
        return streamChatCompletion(messages, "Analysis: ${text.take(30)}...")
    }

    /**
     * Entry point for follow-up conversational questions about a context.
     */
    fun chatStream(context: String, message: String): Flux<String> {
        val messages = listOf(
            mapOf("role" to "system", "content" to Prompts.systemChat(context)),
            mapOf("role" to "user", "content" to message)
        )
        return streamChatCompletion(messages, "Chat Query: ${message.take(30)}...")
    }

    /**
     * Core orchestration method for streaming completions to avoid redundancy.
     */
    private fun streamChatCompletion(messages: List<Map<String, String>>, debugTag: String): Flux<String> {
        val requestBody = mapOf(
            "model" to properties.chat.options.model,
            "messages" to messages,
            "stream" to true,
            "temperature" to properties.chat.options.temperature
        )

        return webClient.post()
            .uri("/chat/completions")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(requestBody)
            .retrieve()
            .bodyToFlux(String::class.java)
            .handle { line, sink ->
                SseParser.parseDelta(line)?.let { sink.next(it) }
            }
            .doOnSubscribe { logger.info("AI Request Started [$debugTag]") }
            .doOnError { e -> logger.error("AI Request Failed [$debugTag]: ${e.message}") }
    }

    /**
     * Centralized management of system prompts for easier tuning.
     */
    private object Prompts {
        const val SYSTEM_ANALYZER = """
            You are an expert English tutor. Analyze the sentence or vocabulary.
            YOUR RESPONSE MUST FOLLOW THIS PRECISE STRUCTURE:
            
            [grammar]
            (Provide a clear, professional analysis using standard Markdown bullet points and bold text. NO internal headers like ###.)
            
            [phrases]
            (List key phrases separated by commas)
            
            [tip]
            (Provide a professional learning tip or mnemonic in one or two short paragraphs.)
            
            Always use double newlines between paragraphs for clear rendering.
        """

        fun systemChat(context: String) = """
            You are an expert English tutor. The user is asking about this context: "$context".
            
            Guidelines:
            1. Provide a professional answer in Chinese.
            2. Use standard Markdown: **bold** for emphasis, `code` for terms, and simple bullet points for lists.
            3. NO large headers (like # or ##).
            4. Use double newlines between paragraphs.
        """.trimIndent()
    }
}
