package com.shengyu.memo.dto

data class TranslationResponse(
    val original: String = "",
    val translated: String = "",
    val phonetic: String? = null,
    val dictionary: List<DictEntry>? = null,
    val definitions: List<DefEntry>? = null,
    val examples: List<String>? = null
)

data class DictEntry(
    val pos: String = "",
    val terms: List<String> = emptyList()
)

data class DefEntry(
    val pos: String = "",
    val defs: List<String> = emptyList()
)
