package com.shengyu.memo.controller

import com.shengyu.memo.dto.AnalyzeRequest
import com.shengyu.memo.dto.AnalyzeResponse
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = ["*"])
class AnalyzeController(
    private val openAiService: com.shengyu.memo.service.OpenAiService
) {

    @PostMapping("/analyze")
    fun analyze(@RequestBody request: AnalyzeRequest): AnalyzeResponse {
        return openAiService.analyzeSentence(request.text)
    }
}
