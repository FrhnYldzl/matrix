/**
 * LLM Catalog — every model tagged by capability + HuggingFace-grade metadata.
 *
 * Each AI connector (Claude, OpenAI, Replicate, HuggingFace) owns a list of
 * models. Every model is tagged with:
 *   - structured Capability flags (Matrix's semantic layer)
 *   - HF-style TaskType taxonomy (industry standard)
 *   - parameters / license / libraries / precision / architecture / carbon
 *   - hostedOn: list of Engine (inference provider) connector ids that host it
 */

export type Capability =
  | "reasoning"
  | "creation"
  | "code"
  | "vision"
  | "image-gen"
  | "audio"
  | "video"
  | "extraction"
  | "synthesis"
  | "tool-use"
  | "long-context"
  | "fast-inference"
  | "low-cost"
  | "fine-tuning"
  | "multimodal"
  | "open-source";

/** HF-style fine-grained task taxonomy. Grouped below by meta-category. */
export type TaskType =
  // Multimodal
  | "audio-text-to-text"
  | "image-text-to-text"
  | "image-text-to-image"
  | "image-text-to-video"
  | "visual-qa"
  | "document-qa"
  | "video-text-to-text"
  | "visual-document-retrieval"
  | "any-to-any"
  // Computer Vision
  | "depth-estimation"
  | "image-classification"
  | "object-detection"
  | "image-segmentation"
  | "text-to-image"
  | "image-to-text"
  | "image-to-image"
  | "image-to-video"
  | "unconditional-image-gen"
  | "video-classification"
  | "text-to-video"
  | "zero-shot-image-classification"
  | "mask-generation"
  | "zero-shot-object-detection"
  | "text-to-3d"
  | "image-to-3d"
  | "image-feature-extraction"
  | "keypoint-detection"
  | "video-to-video"
  // Natural Language Processing
  | "text-classification"
  | "token-classification"
  | "table-qa"
  | "question-answering"
  | "zero-shot-classification"
  | "translation"
  | "summarization"
  | "feature-extraction"
  | "text-generation"
  | "fill-mask"
  | "sentence-similarity"
  | "text-ranking"
  // Audio
  | "text-to-speech"
  | "text-to-audio"
  | "automatic-speech-recognition"
  | "audio-to-audio"
  | "audio-classification"
  | "voice-activity-detection"
  // Tabular
  | "tabular-classification"
  | "tabular-regression"
  | "time-series-forecasting"
  // RL / Other
  | "reinforcement-learning"
  | "robotics"
  | "graph-ml";

export type TaskGroup =
  | "multimodal"
  | "vision"
  | "nlp"
  | "audio"
  | "tabular"
  | "rl-other";

export const taskGroupOf: Record<TaskType, TaskGroup> = {
  "audio-text-to-text": "multimodal",
  "image-text-to-text": "multimodal",
  "image-text-to-image": "multimodal",
  "image-text-to-video": "multimodal",
  "visual-qa": "multimodal",
  "document-qa": "multimodal",
  "video-text-to-text": "multimodal",
  "visual-document-retrieval": "multimodal",
  "any-to-any": "multimodal",
  "depth-estimation": "vision",
  "image-classification": "vision",
  "object-detection": "vision",
  "image-segmentation": "vision",
  "text-to-image": "vision",
  "image-to-text": "vision",
  "image-to-image": "vision",
  "image-to-video": "vision",
  "unconditional-image-gen": "vision",
  "video-classification": "vision",
  "text-to-video": "vision",
  "zero-shot-image-classification": "vision",
  "mask-generation": "vision",
  "zero-shot-object-detection": "vision",
  "text-to-3d": "vision",
  "image-to-3d": "vision",
  "image-feature-extraction": "vision",
  "keypoint-detection": "vision",
  "video-to-video": "vision",
  "text-classification": "nlp",
  "token-classification": "nlp",
  "table-qa": "nlp",
  "question-answering": "nlp",
  "zero-shot-classification": "nlp",
  translation: "nlp",
  summarization: "nlp",
  "feature-extraction": "nlp",
  "text-generation": "nlp",
  "fill-mask": "nlp",
  "sentence-similarity": "nlp",
  "text-ranking": "nlp",
  "text-to-speech": "audio",
  "text-to-audio": "audio",
  "automatic-speech-recognition": "audio",
  "audio-to-audio": "audio",
  "audio-classification": "audio",
  "voice-activity-detection": "audio",
  "tabular-classification": "tabular",
  "tabular-regression": "tabular",
  "time-series-forecasting": "tabular",
  "reinforcement-learning": "rl-other",
  robotics: "rl-other",
  "graph-ml": "rl-other",
};

export const taskLabel: Record<TaskType, string> = {
  "audio-text-to-text": "Audio+Text → Text",
  "image-text-to-text": "Image+Text → Text",
  "image-text-to-image": "Image+Text → Image",
  "image-text-to-video": "Image+Text → Video",
  "visual-qa": "Visual QA",
  "document-qa": "Document QA",
  "video-text-to-text": "Video+Text → Text",
  "visual-document-retrieval": "Visual Doc Retrieval",
  "any-to-any": "Any-to-Any",
  "depth-estimation": "Depth Estimation",
  "image-classification": "Image Classification",
  "object-detection": "Object Detection",
  "image-segmentation": "Image Segmentation",
  "text-to-image": "Text → Image",
  "image-to-text": "Image → Text",
  "image-to-image": "Image → Image",
  "image-to-video": "Image → Video",
  "unconditional-image-gen": "Unconditional Image Gen",
  "video-classification": "Video Classification",
  "text-to-video": "Text → Video",
  "zero-shot-image-classification": "Zero-shot Image Cls",
  "mask-generation": "Mask Generation",
  "zero-shot-object-detection": "Zero-shot Object Det",
  "text-to-3d": "Text → 3D",
  "image-to-3d": "Image → 3D",
  "image-feature-extraction": "Image Feature Extraction",
  "keypoint-detection": "Keypoint Detection",
  "video-to-video": "Video → Video",
  "text-classification": "Text Classification",
  "token-classification": "Token Classification",
  "table-qa": "Table QA",
  "question-answering": "Question Answering",
  "zero-shot-classification": "Zero-shot Classification",
  translation: "Translation",
  summarization: "Summarization",
  "feature-extraction": "Feature Extraction",
  "text-generation": "Text Generation",
  "fill-mask": "Fill-Mask",
  "sentence-similarity": "Sentence Similarity",
  "text-ranking": "Text Ranking",
  "text-to-speech": "Text → Speech",
  "text-to-audio": "Text → Audio",
  "automatic-speech-recognition": "Auto Speech Recognition",
  "audio-to-audio": "Audio → Audio",
  "audio-classification": "Audio Classification",
  "voice-activity-detection": "Voice Activity Detection",
  "tabular-classification": "Tabular Classification",
  "tabular-regression": "Tabular Regression",
  "time-series-forecasting": "Time Series Forecasting",
  "reinforcement-learning": "Reinforcement Learning",
  robotics: "Robotics",
  "graph-ml": "Graph ML",
};

export interface LLMModel {
  id: string;
  name: string;
  connectorId: string;
  vendor: string;
  contextWindow: number;
  inputCostPerMTok?: number;
  outputCostPerMTok?: number;
  capabilities: Capability[];
  tagline: string;
  recommendedFor: string[];
  status: "ga" | "preview" | "deprecated";
  // ── HF-grade metadata (Sprint A) ──────────────────────────────────────
  parameters?: number; // in billions (0.5, 7, 70, 405). 0 = proprietary / unknown
  license?: string;
  libraries?: string[];
  taskTypes?: TaskType[];
  precision?: ("fp32" | "fp16" | "bf16" | "int8" | "int4" | "int2")[];
  architecture?: "dense" | "moe" | "hybrid";
  /** gram-CO2 emitted per million tokens of inference (approx) */
  carbonGCO2PerMTok?: number;
  /** connector ids (usually Engines / inference providers) that host this model */
  hostedOn?: string[];
}

export const capabilityLabels: Record<Capability, string> = {
  reasoning: "Akıl Yürütme",
  creation: "Yaratım",
  code: "Kod",
  vision: "Görsel Anlama",
  "image-gen": "Görsel Üretim",
  audio: "Ses",
  video: "Video",
  extraction: "Parse/Sınıflandırma",
  synthesis: "Özet/Çeviri",
  "tool-use": "Tool Use",
  "long-context": "Uzun Bağlam",
  "fast-inference": "Hızlı",
  "low-cost": "Düşük Maliyet",
  "fine-tuning": "Fine-tune",
  multimodal: "Multi-modal",
  "open-source": "Açık Kaynak",
};

export const capabilityTone: Record<
  Capability,
  "ion" | "nebula" | "quantum" | "solar" | "crimson"
> = {
  reasoning: "nebula",
  creation: "nebula",
  code: "ion",
  vision: "ion",
  "image-gen": "solar",
  audio: "solar",
  video: "solar",
  extraction: "quantum",
  synthesis: "quantum",
  "tool-use": "ion",
  "long-context": "ion",
  "fast-inference": "quantum",
  "low-cost": "quantum",
  "fine-tuning": "nebula",
  multimodal: "nebula",
  "open-source": "quantum",
};

// ---------------------------------------------------------------------------
// Seed catalog — HF-grade metadata for all models
// ---------------------------------------------------------------------------

export const llmModels: LLMModel[] = [
  // ============ Anthropic Claude ============
  {
    id: "m-claude-opus-46",
    name: "Claude Opus 4.6",
    connectorId: "c-claude",
    vendor: "anthropic.com",
    contextWindow: 200_000,
    inputCostPerMTok: 15,
    outputCostPerMTok: 75,
    capabilities: [
      "reasoning", "creation", "code", "tool-use",
      "long-context", "multimodal", "vision",
    ],
    tagline: "Ağır muhakeme ve çok-adımlı karar için sınıfının en iyisi.",
    recommendedFor: ["orchestrator", "business-exec", "complex-research", "strategy"],
    status: "ga",
    parameters: 0,
    license: "proprietary-anthropic",
    libraries: ["anthropic-sdk"],
    taskTypes: ["text-generation", "visual-qa", "document-qa"],
    precision: ["fp16"],
    architecture: "dense",
    carbonGCO2PerMTok: 4.2,
    hostedOn: ["c-claude"],
  },
  {
    id: "m-claude-sonnet-46",
    name: "Claude Sonnet 4.6",
    connectorId: "c-claude",
    vendor: "anthropic.com",
    contextWindow: 200_000,
    inputCostPerMTok: 3,
    outputCostPerMTok: 15,
    capabilities: [
      "reasoning", "creation", "code", "tool-use",
      "long-context", "multimodal", "vision", "low-cost",
    ],
    tagline: "Çoğu domain subagent'ı için doğru denge — hız + zeka + fiyat.",
    recommendedFor: ["domain-subagents", "skill-orchestrator", "default"],
    status: "ga",
    parameters: 0,
    license: "proprietary-anthropic",
    libraries: ["anthropic-sdk"],
    taskTypes: ["text-generation", "visual-qa", "summarization", "translation"],
    precision: ["fp16"],
    architecture: "dense",
    carbonGCO2PerMTok: 2.1,
    hostedOn: ["c-claude"],
  },
  {
    id: "m-claude-haiku-46",
    name: "Claude Haiku 4.6",
    connectorId: "c-claude",
    vendor: "anthropic.com",
    contextWindow: 200_000,
    inputCostPerMTok: 0.8,
    outputCostPerMTok: 4,
    capabilities: [
      "extraction", "synthesis", "fast-inference", "low-cost", "tool-use",
    ],
    tagline: "Yüksek hacim, sınıflandırma ve özet için hızlı ve ucuz.",
    recommendedFor: ["classifier", "ticket-triage", "expense-categorizer"],
    status: "ga",
    parameters: 0,
    license: "proprietary-anthropic",
    libraries: ["anthropic-sdk"],
    taskTypes: ["text-classification", "summarization", "token-classification"],
    precision: ["fp16"],
    architecture: "dense",
    carbonGCO2PerMTok: 0.6,
    hostedOn: ["c-claude"],
  },

  // ============ OpenAI ============
  {
    id: "m-gpt5",
    name: "GPT-5",
    connectorId: "c-openai",
    vendor: "openai.com",
    contextWindow: 128_000,
    inputCostPerMTok: 10,
    outputCostPerMTok: 30,
    capabilities: [
      "reasoning", "creation", "code", "vision", "tool-use", "multimodal",
    ],
    tagline: "Yedek muhakeme katmanı — Claude'un alternatifi.",
    recommendedFor: ["fallback-reasoning", "creative-ideation"],
    status: "ga",
    parameters: 0,
    license: "proprietary-openai",
    libraries: ["openai-sdk"],
    taskTypes: ["text-generation", "visual-qa", "document-qa"],
    precision: ["fp16"],
    architecture: "dense",
    carbonGCO2PerMTok: 3.4,
    hostedOn: ["c-openai"],
  },
  {
    id: "m-gpt5-mini",
    name: "GPT-5 Mini",
    connectorId: "c-openai",
    vendor: "openai.com",
    contextWindow: 128_000,
    inputCostPerMTok: 0.5,
    outputCostPerMTok: 1.5,
    capabilities: [
      "synthesis", "extraction", "fast-inference", "low-cost", "tool-use",
    ],
    tagline: "Hızlı ve ucuz sınıflandırma / özet için.",
    recommendedFor: ["lead-scorer", "batch-classifier"],
    status: "ga",
    parameters: 0,
    license: "proprietary-openai",
    libraries: ["openai-sdk"],
    taskTypes: ["text-classification", "summarization"],
    precision: ["fp16"],
    architecture: "dense",
    carbonGCO2PerMTok: 0.5,
    hostedOn: ["c-openai"],
  },
  {
    id: "m-gpt-whisper",
    name: "Whisper-v4",
    connectorId: "c-openai",
    vendor: "openai.com",
    contextWindow: 0,
    inputCostPerMTok: 0.006,
    capabilities: ["audio", "synthesis", "multimodal"],
    tagline: "Çoklu-dil ses transkripsiyon.",
    recommendedFor: ["meeting-notes-synthesizer", "podcast-transcript"],
    status: "ga",
    parameters: 1.5,
    license: "proprietary-openai",
    libraries: ["openai-sdk"],
    taskTypes: ["automatic-speech-recognition"],
    precision: ["fp16"],
    architecture: "dense",
    carbonGCO2PerMTok: 0.2,
    hostedOn: ["c-openai"],
  },
  {
    id: "m-dall-e4",
    name: "DALL·E 4",
    connectorId: "c-openai",
    vendor: "openai.com",
    contextWindow: 0,
    inputCostPerMTok: 40,
    capabilities: ["image-gen", "multimodal"],
    tagline: "Fotorealistik görsel üretimi.",
    recommendedFor: ["ad-copy-generator", "creative"],
    status: "ga",
    parameters: 0,
    license: "proprietary-openai",
    libraries: ["openai-sdk"],
    taskTypes: ["text-to-image", "image-to-image"],
    precision: ["fp16"],
    architecture: "dense",
    carbonGCO2PerMTok: 18,
    hostedOn: ["c-openai"],
  },

  // ============ Replicate ============
  {
    id: "m-llama-4-70b",
    name: "Llama 4 70B Instruct",
    connectorId: "c-replicate",
    vendor: "meta.com",
    contextWindow: 128_000,
    inputCostPerMTok: 0.65,
    outputCostPerMTok: 2.75,
    capabilities: [
      "reasoning", "creation", "code", "tool-use", "open-source", "long-context",
    ],
    tagline: "Üst-orta seviye açık kaynak, self-host seçeneğiyle.",
    recommendedFor: ["cost-optimized-subagent", "privacy-sensitive"],
    status: "ga",
    parameters: 70,
    license: "llama-4",
    libraries: ["pytorch", "transformers", "gguf", "vllm", "mlx"],
    taskTypes: ["text-generation", "summarization", "text-classification"],
    precision: ["fp16", "int8", "int4"],
    architecture: "dense",
    carbonGCO2PerMTok: 1.5,
    hostedOn: [
      "c-replicate", "c-groq", "c-together-ai", "c-fireworks", "c-cerebras",
    ],
  },
  {
    id: "m-flux-pro",
    name: "Flux 1.1 Pro",
    connectorId: "c-replicate",
    vendor: "blackforestlabs.ai",
    contextWindow: 0,
    inputCostPerMTok: 0,
    capabilities: ["image-gen", "open-source"],
    tagline: "DALL·E rakibi open-source görsel üretici.",
    recommendedFor: ["brand-asset-gen", "product-mockup"],
    status: "ga",
    parameters: 12,
    license: "flux-non-commercial",
    libraries: ["pytorch", "diffusers", "safetensors"],
    taskTypes: ["text-to-image", "image-to-image"],
    precision: ["fp16", "int8"],
    architecture: "dense",
    carbonGCO2PerMTok: 14,
    hostedOn: ["c-replicate", "c-fal", "c-together-ai"],
  },
  {
    id: "m-sdxl-turbo",
    name: "SDXL Turbo",
    connectorId: "c-replicate",
    vendor: "stability.ai",
    contextWindow: 0,
    capabilities: ["image-gen", "fast-inference", "low-cost", "open-source"],
    tagline: "Ultra-hızlı görsel üretimi, batch iş için.",
    recommendedFor: ["bulk-image-gen", "ad-creative-variations"],
    status: "ga",
    parameters: 3.5,
    license: "stabilityai-non-commercial",
    libraries: ["pytorch", "diffusers", "safetensors"],
    taskTypes: ["text-to-image", "unconditional-image-gen"],
    precision: ["fp16", "int8", "int4"],
    architecture: "dense",
    carbonGCO2PerMTok: 4,
    hostedOn: ["c-replicate", "c-fal"],
  },

  // ============ HuggingFace ============
  {
    id: "m-mistral-large-2",
    name: "Mistral Large 2",
    connectorId: "c-huggingface",
    vendor: "mistral.ai",
    contextWindow: 128_000,
    inputCostPerMTok: 2,
    outputCostPerMTok: 6,
    capabilities: [
      "reasoning", "code", "creation", "tool-use", "long-context", "open-source",
    ],
    tagline: "Avrupa yapımı, tool-use'de güçlü açık kaynak model.",
    recommendedFor: ["eu-data-residency", "code-review"],
    status: "ga",
    parameters: 123,
    license: "mrl-non-commercial",
    libraries: ["pytorch", "transformers", "vllm", "gguf"],
    taskTypes: ["text-generation", "translation"],
    precision: ["fp16", "bf16", "int8"],
    architecture: "dense",
    carbonGCO2PerMTok: 2.3,
    hostedOn: ["c-huggingface", "c-together-ai", "c-fireworks"],
  },
  {
    id: "m-qwen-25-72b",
    name: "Qwen 2.5 72B",
    connectorId: "c-huggingface",
    vendor: "alibaba",
    contextWindow: 128_000,
    inputCostPerMTok: 0.35,
    outputCostPerMTok: 1.4,
    capabilities: [
      "reasoning", "creation", "code", "multimodal", "open-source", "low-cost",
    ],
    tagline: "Çok dilli + kod için güçlü ve ekonomik.",
    recommendedFor: ["multilingual-synth", "chinese-market"],
    status: "ga",
    parameters: 72,
    license: "qwen",
    libraries: ["pytorch", "transformers", "gguf", "vllm", "mlx"],
    taskTypes: ["text-generation", "translation", "text-classification"],
    precision: ["fp16", "int8", "int4"],
    architecture: "dense",
    carbonGCO2PerMTok: 1.5,
    hostedOn: [
      "c-huggingface", "c-together-ai", "c-fireworks", "c-novita",
    ],
  },
  {
    id: "m-deepseek-r1",
    name: "DeepSeek R1",
    connectorId: "c-huggingface",
    vendor: "deepseek.com",
    contextWindow: 128_000,
    inputCostPerMTok: 0.55,
    outputCostPerMTok: 2.19,
    capabilities: ["reasoning", "code", "open-source", "low-cost"],
    tagline: "Matematik ve kod muhakemesinde Claude seviyesinde, 20x ucuz.",
    recommendedFor: ["complex-reasoning-budget", "code-agent"],
    status: "ga",
    parameters: 671,
    license: "mit",
    libraries: ["pytorch", "transformers", "vllm", "gguf"],
    taskTypes: ["text-generation", "question-answering"],
    precision: ["fp16", "bf16", "int8", "int4"],
    architecture: "moe",
    carbonGCO2PerMTok: 3.1,
    hostedOn: [
      "c-huggingface", "c-together-ai", "c-fireworks", "c-hyperbolic",
    ],
  },
  {
    id: "m-whisper-v3-large",
    name: "Whisper v3 Large",
    connectorId: "c-huggingface",
    vendor: "openai.com",
    contextWindow: 0,
    capabilities: ["audio", "synthesis", "open-source", "low-cost"],
    tagline: "En iyi açık kaynak ses transkripsiyon.",
    recommendedFor: ["meeting-transcript", "podcast-clipping"],
    status: "ga",
    parameters: 1.55,
    license: "apache-2.0",
    libraries: ["pytorch", "transformers", "onnx", "gguf"],
    taskTypes: ["automatic-speech-recognition", "audio-to-audio"],
    precision: ["fp16", "int8"],
    architecture: "dense",
    carbonGCO2PerMTok: 0.15,
    hostedOn: ["c-huggingface", "c-replicate", "c-fal"],
  },
  {
    id: "m-flux-schnell",
    name: "Flux Schnell",
    connectorId: "c-huggingface",
    vendor: "blackforestlabs.ai",
    contextWindow: 0,
    capabilities: ["image-gen", "fast-inference", "low-cost", "open-source"],
    tagline: "Anında görsel üretimi, apache 2.0 lisansı.",
    recommendedFor: ["batch-image-pipeline"],
    status: "ga",
    parameters: 12,
    license: "apache-2.0",
    libraries: ["pytorch", "diffusers", "safetensors"],
    taskTypes: ["text-to-image"],
    precision: ["fp16", "int8", "int4"],
    architecture: "dense",
    carbonGCO2PerMTok: 2.8,
    hostedOn: ["c-huggingface", "c-fal", "c-together-ai", "c-replicate"],
  },
  {
    id: "m-llava-next",
    name: "LLaVA-Next 34B",
    connectorId: "c-huggingface",
    vendor: "llava.hliu.cc",
    contextWindow: 8_000,
    capabilities: ["vision", "multimodal", "open-source"],
    tagline: "Açık kaynak görsel-soru-cevap modeli.",
    recommendedFor: ["product-image-qa", "visual-moderation"],
    status: "ga",
    parameters: 34,
    license: "apache-2.0",
    libraries: ["pytorch", "transformers"],
    taskTypes: ["visual-qa", "image-to-text"],
    precision: ["fp16", "int8"],
    architecture: "dense",
    carbonGCO2PerMTok: 1.2,
    hostedOn: ["c-huggingface", "c-replicate"],
  },
  {
    id: "m-gemma3-27b",
    name: "Gemma 3 27B",
    connectorId: "c-huggingface",
    vendor: "google.com",
    contextWindow: 128_000,
    inputCostPerMTok: 0.2,
    outputCostPerMTok: 0.6,
    capabilities: [
      "reasoning", "multimodal", "vision", "open-source", "low-cost", "long-context",
    ],
    tagline: "Google'ın open-weight ailesi; on-device'a yakın hız.",
    recommendedFor: ["embedded-agent", "low-latency-default"],
    status: "ga",
    parameters: 27,
    license: "gemma",
    libraries: ["pytorch", "transformers", "gguf", "mlx", "vllm"],
    taskTypes: ["text-generation", "visual-qa", "summarization"],
    precision: ["fp16", "bf16", "int8", "int4"],
    architecture: "dense",
    carbonGCO2PerMTok: 0.9,
    hostedOn: [
      "c-huggingface", "c-together-ai", "c-fireworks", "c-groq",
    ],
  },
  {
    id: "m-bge-m3",
    name: "BGE-M3 Embeddings",
    connectorId: "c-huggingface",
    vendor: "bge",
    contextWindow: 8_000,
    capabilities: ["extraction", "synthesis", "open-source", "fast-inference"],
    tagline: "Multi-lingual embedding modeli — RAG için standard.",
    recommendedFor: ["rag-embeddings", "semantic-search"],
    status: "ga",
    parameters: 0.56,
    license: "mit",
    libraries: ["pytorch", "transformers", "sentence-transformers", "onnx"],
    taskTypes: ["feature-extraction", "sentence-similarity", "text-ranking"],
    precision: ["fp16", "int8"],
    architecture: "dense",
    carbonGCO2PerMTok: 0.1,
    hostedOn: ["c-huggingface"],
  },
  {
    id: "m-kokoro",
    name: "Kokoro TTS",
    connectorId: "c-huggingface",
    vendor: "kokoro",
    contextWindow: 0,
    capabilities: ["audio", "open-source", "fast-inference", "low-cost"],
    tagline: "Doğal İngilizce TTS, apache 2.0.",
    recommendedFor: ["podcast-narration", "notification-audio"],
    status: "ga",
    parameters: 0.08,
    license: "apache-2.0",
    libraries: ["pytorch", "transformers", "onnx"],
    taskTypes: ["text-to-speech"],
    precision: ["fp16", "int8"],
    architecture: "dense",
    carbonGCO2PerMTok: 0.08,
    hostedOn: ["c-huggingface"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function modelsForConnector(connectorId: string): LLMModel[] {
  // A model belongs to a connector either by direct ownership or by being hostedOn
  return llmModels.filter(
    (m) => m.connectorId === connectorId || (m.hostedOn || []).includes(connectorId)
  );
}

export function modelsByCapability(cap: Capability): LLMModel[] {
  return llmModels.filter((m) => m.capabilities.includes(cap));
}

export function modelsByTask(task: TaskType): LLMModel[] {
  return llmModels.filter((m) => (m.taskTypes || []).includes(task));
}

/** User query → capability weights */
const queryToCapabilities: Array<{ words: string[]; cap: Capability; weight: number }> = [
  { words: ["görsel oluştur", "image gen", "resim üret"], cap: "image-gen", weight: 4 },
  { words: ["ses", "transkript", "whisper", "podcast"], cap: "audio", weight: 4 },
  { words: ["video"], cap: "video", weight: 4 },
  { words: ["kod", "refactor", "code"], cap: "code", weight: 3 },
  { words: ["muhakeme", "akıl", "plan", "strateji", "reason"], cap: "reasoning", weight: 3 },
  { words: ["özet", "summarize", "çeviri", "translate"], cap: "synthesis", weight: 3 },
  { words: ["sınıflandır", "classifier", "parse", "extract"], cap: "extraction", weight: 3 },
  { words: ["görsel oku", "image understand", "ocr"], cap: "vision", weight: 3 },
  { words: ["ucuz", "cheap", "düşük maliyet", "low cost"], cap: "low-cost", weight: 2 },
  { words: ["hızlı", "fast", "latency"], cap: "fast-inference", weight: 2 },
  { words: ["uzun bağlam", "long context", "200k"], cap: "long-context", weight: 2 },
  { words: ["açık kaynak", "open source", "self-host"], cap: "open-source", weight: 2 },
  { words: ["fine-tune", "fine tune"], cap: "fine-tuning", weight: 2 },
  { words: ["tool", "function call"], cap: "tool-use", weight: 2 },
];

/** User query → HF-style task weights */
const queryToTasks: Array<{ words: string[]; task: TaskType; weight: number }> = [
  { words: ["tts", "text to speech"], task: "text-to-speech", weight: 3 },
  { words: ["asr", "speech recognition", "transkript"], task: "automatic-speech-recognition", weight: 3 },
  { words: ["embedding", "rag"], task: "feature-extraction", weight: 3 },
  { words: ["semantic search", "benzerlik"], task: "sentence-similarity", weight: 3 },
  { words: ["sınıflandırma", "classification"], task: "text-classification", weight: 2 },
  { words: ["çeviri", "translate"], task: "translation", weight: 2 },
  { words: ["özet", "summary"], task: "summarization", weight: 2 },
  { words: ["visual qa", "görsel soru"], task: "visual-qa", weight: 3 },
  { words: ["3d"], task: "text-to-3d", weight: 3 },
  { words: ["time series", "zaman serisi"], task: "time-series-forecasting", weight: 3 },
  { words: ["döküman qa", "document qa"], task: "document-qa", weight: 3 },
];

export interface ModelRecommendation {
  model: LLMModel;
  score: number;
  matchedCapabilities: Capability[];
  matchedTasks: TaskType[];
}

export function recommendModelsForQuery(query: string, limit = 5): ModelRecommendation[] {
  const q = query.toLowerCase();
  const capWeights = new Map<Capability, number>();
  const taskWeights = new Map<TaskType, number>();

  queryToCapabilities.forEach(({ words, cap, weight }) => {
    if (words.some((w) => q.includes(w))) {
      capWeights.set(cap, (capWeights.get(cap) || 0) + weight);
    }
  });
  queryToTasks.forEach(({ words, task, weight }) => {
    if (words.some((w) => q.includes(w))) {
      taskWeights.set(task, (taskWeights.get(task) || 0) + weight);
    }
  });

  if (capWeights.size === 0 && taskWeights.size === 0) {
    capWeights.set("creation", 1);
    capWeights.set("reasoning", 1);
  }

  const scored: ModelRecommendation[] = llmModels.map((m) => {
    const matchedCaps: Capability[] = [];
    const matchedTasks: TaskType[] = [];
    let score = 0;
    m.capabilities.forEach((c) => {
      const w = capWeights.get(c);
      if (w) {
        matchedCaps.push(c);
        score += w;
      }
    });
    (m.taskTypes || []).forEach((t) => {
      const w = taskWeights.get(t);
      if (w) {
        matchedTasks.push(t);
        score += w;
      }
    });
    if (capWeights.has("low-cost") && (m.outputCostPerMTok ?? 100) < 5) {
      score += 1;
    }
    return { model: m, score, matchedCapabilities: matchedCaps, matchedTasks };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
