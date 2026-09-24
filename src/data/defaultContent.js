export const DEFAULT_SITE_INFO = {
  heroSubtitle: '| AI SOLUTIONS DEVELOPER & BUSINESS DRIVER',
  heroTitleLines: ['CREATIVE', 'AGENTIC', 'SOLUTIONS.'],
  heroDescription: 'Specializing in designing AI-driven solutions for real world problems.',
  contactTag: '| INITIATE TRANSMISSION',
  contactHeadingLine1: "LET'S BUILD THE",
  contactHeadingLine2: 'NEXT PARADIGM.',
  socialLinks: [
    { label: 'EMAIL →', url: 'mailto:contact@example.com' },
    { label: 'GITHUB →', url: 'https://github.com' },
    { label: 'X | TWITTER →', url: 'https://x.com' },
    { label: 'LINKEDIN →', url: 'https://linkedin.com' },
  ],
  footerTextLeft: 'ALL PROTOCOLS RESERVED',
  footerTextRight: 'MONOSPACE | NO_OS_UI | SNAP_Y | 0_RADIUS',
};

export const DEFAULT_PROJECTS = [
  {
    id: '01',
    title: 'AUTONOMOUS REASONING SWARM',
    category: 'AGENTIC ARCHITECTURE',
    year: '2026',
    pages: [
      {
        pageTitle: 'ARCHITECTURE & DECOMPOSITION',
        description:
          'A multi-agent cognitive architecture featuring decentralized consensus, dynamic task decomposition, and self-correcting tool-use loops.',
        tags: ['MULTI-AGENT', 'TOOL EXECUTION', 'STATE SYNCHRONIZATION'],
        metrics: '99.4% EXECUTION COMPLETION | ZERO RECURSION TRAPS',
        link: '#',
        demoId: 'spawn-window',
        demoConfig: '{"title": "SWARM_NODE_A", "spawnX": 18, "spawnY": 12, "pingMs": 42}',
      },
      {
        pageTitle: 'CONSENSUS & RECOVERY PROTOCOLS',
        description:
          'Fault-tolerant consensus protocols allowing autonomous subagents to re-route failed executions and synchronize distributed tool states without human intervention.',
        tags: ['FAULT TOLERANCE', 'STATE RECOVERY', 'SUBAGENT MESH'],
        metrics: 'SUB-12MS RECOVERY | ZERO DATA LOSS',
        link: '#',
        demoId: '',
        demoConfig: '',
      },
    ],
  },
  {
    id: '02',
    title: 'AGENT MEMORY GRAPH ENGINE',
    category: 'KNOWLEDGE & RETRIEVAL',
    year: '2025',
    pages: [
      {
        pageTitle: '',
        description:
          'Persistent episodic and semantic memory pipeline for long-horizon agent execution, backed by graph traversal and vector indexing.',
        tags: ['GRAPH RAG', 'EPISODIC MEMORY', 'LATENCY OPTIMIZATION'],
        metrics: '<45MS RETRIEVAL | 10M+ TRACE TRAVERSAL',
        link: '#',
        demoId: '',
        demoConfig: '',
      },
    ],
  },
  {
    id: '03',
    title: 'REAL-TIME MULTIMODAL COPILOT',
    category: 'STREAMING & INFERENCE',
    year: '2025',
    pages: [
      {
        pageTitle: '',
        description:
          'Sub-200ms latency voice and visual reasoning pipeline utilizing bidirectional streaming sockets and speculative action planning.',
        tags: ['STREAMING API', 'VOICE/VISION', 'SPECULATIVE EXECUTION'],
        metrics: '180MS TIME-TO-FIRST-ACTION | DUPLEX AUDIO',
        link: '#',
        demoId: '',
        demoConfig: '',
      },
    ],
  },
  {
    id: '04',
    title: 'AGENT EVALUATION HARNESS',
    category: 'BENCHMARKING & RELIABILITY',
    year: '2024',
    pages: [
      {
        pageTitle: '',
        description:
          'Deterministic sandbox environment for stress-testing agent robustness against prompt injection, loop traps, and tool hallucinations.',
        tags: ['EVALUATION', 'SANDBOXING', 'SAFETY GUARDS'],
        metrics: '5,000+ ADVERSARIAL TRAJECTORIES TESTED',
        link: '#',
        demoId: '',
        demoConfig: '',
      },
    ],
  },
];

export const DEFAULT_EXPERTISE = [
  {
    area: '01 | ARCHITECTURE',
    title: 'AGENTIC WORKFLOWS',
    detail:
      'Autonomous planning, reflection loops, multi-agent orchestration, and deterministic fallback trees.',
  },
  {
    area: '02 | INTERFACES',
    title: 'TOOL SYNTHESIS',
    detail:
      'Dynamic API binding, sandboxed code execution, schema validation, and structured output extraction.',
  },
  {
    area: '03 | FOUNDATIONS',
    title: 'MODEL FINE-TUNING & EVALS',
    detail:
      'Domain adaptation, synthetic trajectory generation, reward modeling, and adversarial robustness tests.',
  },
];
