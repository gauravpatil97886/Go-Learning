/* ═══════════════════════════════════════════════════════════════
   GoForge — blogs-data.js
   Curated industry engineering blogs about Go in production.
   Every URL verified at curation time (June 2026).
   © 2026 Gaurav Patil — GoForge Platform. All Rights Reserved.
   ═══════════════════════════════════════════════════════════════ */

const BLOGS = [
  {
    "company": "Uber",
    "title": "How We Built Uber Engineering's Highest Query per Second Service Using Go",
    "url": "https://www.uber.com/en-US/blog/go-geofence-highest-query-per-second-service/",
    "year": "2016",
    "category": "Consumer & Delivery",
    "summary": "The classic Go-in-industry post: how Uber built its geofence lookup microservice in Go to serve hundreds of thousands of QPS with sub-100ms p99 latency, using read-write locks and atomic index swaps. A perfect first read on why companies pick Go over Node.js for CPU-bound, high-throughput services.",
    "tags": [
      "performance",
      "concurrency",
      "case-study",
      "scaling"
    ]
  },
  {
    "company": "Uber",
    "title": "Data Race Patterns in Go",
    "url": "https://www.uber.com/en-US/blog/data-race-patterns-in-go/",
    "year": "2022",
    "category": "Consumer & Delivery",
    "summary": "Uber analyzed ~1,100 data race fixes across its 50M-line Go monorepo and distilled the recurring patterns (closures, slices, maps, channel misuse) that cause races. Essential reading for learning what actually goes wrong with goroutines in production code.",
    "tags": [
      "concurrency",
      "case-study"
    ]
  },
  {
    "company": "Uber",
    "title": "How We Saved 70K Cores Across 30 Mission-Critical Services (Large-Scale, Semi-Automated Go GC Tuning @Uber)",
    "url": "https://www.uber.com/en-US/blog/how-we-saved-70k-cores-across-30-mission-critical-services/",
    "year": "2021",
    "category": "Consumer & Delivery",
    "summary": "Uber built GOGCTuner, a library that dynamically tunes GOGC per container, saving 70K CPU cores across mission-critical Go services. The best practical deep dive into how Go's garbage collector trades memory for CPU and how to tune it at scale.",
    "tags": [
      "gc",
      "performance",
      "scaling"
    ]
  },
  {
    "company": "Uber",
    "title": "Building Uber's Go Monorepo with Bazel",
    "url": "https://www.uber.com/en-US/blog/go-monorepo-bazel/",
    "year": "2020",
    "category": "Consumer & Delivery",
    "summary": "How Uber manages one of the world's largest Go repositories (70,000+ files, 1,000+ external modules) with Bazel and Gazelle for hermetic, incremental builds. Shows what Go tooling and dependency management look like at extreme scale.",
    "tags": [
      "tooling",
      "scaling",
      "architecture"
    ]
  },
  {
    "company": "Uber",
    "title": "How We Halved Go Monorepo CI Build Time",
    "url": "https://www.uber.com/en-US/blog/how-we-halved-go-monorepo-ci-build-time/",
    "year": "2022",
    "category": "Consumer & Delivery",
    "summary": "Uber cut CI build time for its giant Go monorepo by ~50% through build sharding, smarter caching, and infrastructure changes. Great for understanding the developer-experience side of running Go at company scale.",
    "tags": [
      "tooling",
      "performance",
      "scaling"
    ]
  },
  {
    "company": "Grab",
    "title": "How We Implemented Domain-Driven Development in Golang",
    "url": "https://engineering.grab.com/domain-driven-development-in-golang",
    "year": "2019",
    "category": "Consumer & Delivery",
    "summary": "Grab's GrabPlatform team restructured an unstructured Go codebase using domain-driven design and idiomatic Go package layout. A practical template for organizing real-world Go services beyond toy project structures.",
    "tags": [
      "architecture",
      "microservices",
      "case-study"
    ]
  },
  {
    "company": "Grab",
    "title": "Go module proxy at Grab",
    "url": "https://engineering.grab.com/go-module-proxy",
    "year": "2023",
    "category": "Consumer & Delivery",
    "summary": "Grab deployed the open-source Athens Go module proxy to dramatically speed up go commands in its large monorepo while cutting infrastructure costs. Teaches how Go module resolution works and why a proxy matters for big teams.",
    "tags": [
      "tooling",
      "performance",
      "scaling"
    ]
  },
  {
    "company": "Grab",
    "title": "Go Modules- A Guide for monorepos (Part 1)",
    "url": "https://engineering.grab.com/go-module-a-guide-for-monorepos-part-1",
    "year": "2020",
    "category": "Consumer & Delivery",
    "summary": "Grab shares the challenges of adopting Go modules in a multi-module monorepo, including dependency conflicts and using go mod graph to debug them. Useful for learners moving past single-module projects into real dependency management.",
    "tags": [
      "tooling",
      "case-study"
    ]
  },
  {
    "company": "Grab",
    "title": "One Small Step Closer to Containerising Service Binaries",
    "url": "https://engineering.grab.com/reducing-your-go-binary-size",
    "year": "2021",
    "category": "Consumer & Delivery",
    "summary": "Grab used go-binsize-viz to analyze and shrink bloated Go binaries, showing how import choices and code architecture inflate container images. A nice hands-on look at Go build internals and binary anatomy.",
    "tags": [
      "tooling",
      "performance"
    ]
  },
  {
    "company": "Lyft",
    "title": "Announcing Ratelimit: Go/gRPC service for generic rate limiting",
    "url": "https://eng.lyft.com/announcing-ratelimit-c2e8f3182555",
    "year": "2017",
    "category": "Consumer & Delivery",
    "summary": "Lyft open-sourced Ratelimit, a Go/gRPC service providing generic rate limiting for the Envoy ecosystem and beyond. A concise example of designing a small, focused Go network service that became widely adopted infrastructure.",
    "tags": [
      "networking",
      "microservices",
      "tooling"
    ]
  },
  {
    "company": "Lyft",
    "title": "Building an Adaptive, Multi-Tenant Stream Bus with Kafka and Golang",
    "url": "https://eng.lyft.com/building-an-adaptive-multi-tenant-stream-bus-with-kafka-and-golang-5f1410bf2b40",
    "year": "2020",
    "category": "Consumer & Delivery",
    "summary": "Lyft built a multi-tenant CDC event bus in Go that routes 4 million Kafka messages per minute on tiny Kubernetes resources, applying config changes on the fly via Merkle trees. Shows Go's concurrency and efficiency applied to real streaming infrastructure.",
    "tags": [
      "concurrency",
      "scaling",
      "architecture",
      "networking"
    ]
  },
  {
    "company": "Gojek",
    "title": "How GO-JEK handles microservices communication at scale",
    "url": "https://medium.com/gojekengineering/how-go-jek-handles-microservices-communication-at-scale-5ad91be98c77",
    "year": "2018",
    "category": "Consumer & Delivery",
    "summary": "Gojek explains Heimdall, its open-source Go HTTP client implementing retries, circuit breakers, and timeouts for service-to-service calls across hundreds of microservices. Great intro to resilience patterns every production Go service needs.",
    "tags": [
      "microservices",
      "networking",
      "case-study"
    ]
  },
  {
    "company": "Cloudflare",
    "title": "Go, don't collect my garbage",
    "url": "https://blog.cloudflare.com/go-dont-collect-my-garbage/",
    "year": "2017",
    "category": "Cloud & Infrastructure",
    "summary": "Cloudflare benchmarks crypto workloads on a 24-core machine and discovers Go's garbage collector throttling multi-goroutine scaling, then shows how tuning GOGC restores near-linear throughput. A classic real-world lesson in how allocation rate and GC frequency interact with concurrency.",
    "tags": [
      "gc",
      "performance",
      "concurrency"
    ]
  },
  {
    "company": "Cloudflare",
    "title": "Graceful upgrades in Go",
    "url": "https://blog.cloudflare.com/graceful-upgrades-in-go/",
    "year": "2018",
    "category": "Cloud & Infrastructure",
    "summary": "Explains how to swap out a running Go server's code and config with zero dropped connections, covering SO_REUSEPORT, file-descriptor passing, and Cloudflare's open-source tableflip library. Great for learning how production Go services achieve NGINX-style restarts.",
    "tags": [
      "networking",
      "architecture",
      "tooling"
    ]
  },
  {
    "company": "Tailscale",
    "title": "Userspace isn't slow, some kernel interfaces are!",
    "url": "https://tailscale.com/blog/throughput-improvements",
    "year": "2022",
    "category": "Cloud & Infrastructure",
    "summary": "Tailscale details how they made wireguard-go (a userspace WireGuard in Go) dramatically faster using TCP segmentation offload, GRO, and sendmmsg/recvmmsg syscalls, achieving up to 2.2x throughput. Shows that well-tuned Go networking code can rival kernel implementations.",
    "tags": [
      "networking",
      "performance",
      "case-study"
    ]
  },
  {
    "company": "Tailscale",
    "title": "Surpassing 10Gb/s over Tailscale",
    "url": "https://tailscale.com/blog/more-throughput",
    "year": "2023",
    "category": "Cloud & Infrastructure",
    "summary": "A follow-up where UDP generic segmentation offload and checksum optimizations push Go-based wireguard-go past in-kernel WireGuard, breaking 10Gb/s on bare-metal Linux. Excellent deep dive into profiling and optimizing hot paths in Go network code.",
    "tags": [
      "networking",
      "performance",
      "case-study"
    ]
  },
  {
    "company": "CockroachDB",
    "title": "Why Go was the right choice for CockroachDB",
    "url": "https://www.cockroachlabs.com/blog/why-go-was-the-right-choice-for-cockroachdb/",
    "year": "2015",
    "category": "Cloud & Infrastructure",
    "summary": "Cockroach Labs explains why they picked Go over C++ and Java to build a distributed SQL database, weighing libraries, interfaces, tooling, and contributor accessibility. A grounded look at language-selection trade-offs for large systems projects.",
    "tags": [
      "architecture",
      "case-study",
      "tooling"
    ]
  },
  {
    "company": "CockroachDB",
    "title": "How to optimize garbage collection in Go",
    "url": "https://www.cockroachlabs.com/blog/how-to-optimize-garbage-collection-in-go/",
    "year": "2023",
    "category": "Cloud & Infrastructure",
    "summary": "Concrete allocation-reduction techniques from the CockroachDB codebase: struct embedding, sync.Pool, and reusing backing arrays to cut GC overhead in a high-performance database. One of the most practical GC-tuning posts for intermediate Go developers.",
    "tags": [
      "gc",
      "performance"
    ]
  },
  {
    "company": "DigitalOcean",
    "title": "Taming Your Go Dependencies",
    "url": "https://www.digitalocean.com/blog/taming-your-go-dependencies",
    "year": "2015",
    "category": "Cloud & Infrastructure",
    "summary": "DigitalOcean describes 'cthulhu', the Go monorepo that holds their internal standard library, services, and tools, and how it solved dependency versioning across teams. Useful for understanding how companies organize Go code at scale (and the pre-modules era that motivated go mod).",
    "tags": [
      "tooling",
      "architecture",
      "scaling"
    ]
  },
  {
    "company": "HashiCorp",
    "title": "Writing custom terraform providers",
    "url": "https://www.hashicorp.com/en/blog/writing-custom-terraform-providers",
    "year": "2014",
    "category": "Cloud & Infrastructure",
    "summary": "HashiCorp walks through building a Terraform provider in Go, covering their RPC-based plugin model, resource schemas, and CRUD lifecycle implementation. A window into go-plugin, one of the most influential plugin architectures in Go infrastructure tooling.",
    "tags": [
      "tooling",
      "architecture"
    ]
  },
  {
    "company": "Docker",
    "title": "Docker + Golang = ❤️",
    "url": "https://www.docker.com/blog/docker-golang/",
    "year": "2016",
    "category": "Cloud & Infrastructure",
    "summary": "Practical tips from Docker on combining Go and containers: compiling without a local toolchain, cross-compiling, and shipping ~2 MB images from scratch with static binaries. Essential workflow knowledge since Go's static binaries make it the natural container language.",
    "tags": [
      "tooling",
      "case-study"
    ]
  },
  {
    "company": "Kubernetes",
    "title": "Contextual Logging in Kubernetes 1.24",
    "url": "https://kubernetes.io/blog/2022/05/25/contextual-logging/",
    "year": "2022",
    "category": "Cloud & Infrastructure",
    "summary": "How the Kubernetes project (one of the largest Go codebases) migrated from global klog calls to structured, contextual logging built on the go-logr interface, passing loggers via context.Context. Teaches logging patterns you'll see across serious Go services.",
    "tags": [
      "observability",
      "architecture",
      "tooling"
    ]
  },
  {
    "company": "Grafana",
    "title": "How to improve Go application performance",
    "url": "https://grafana.com/blog/how-to-improve-go-application-performance/",
    "year": "2022",
    "category": "Cloud & Infrastructure",
    "summary": "A profiling case study from the Pyroscope server (written in Go) showing how flame graphs exposed hot functions in pprof transcoding and how replacing binary search with direct array indexing slashed CPU time. A hands-on introduction to profile-driven optimization.",
    "tags": [
      "performance",
      "observability",
      "case-study"
    ]
  },
  {
    "company": "Grafana",
    "title": "How to use PGO and Grafana Pyroscope to optimize Go applications",
    "url": "https://grafana.com/blog/2024/03/11/how-to-use-pgo-and-grafana-pyroscope-to-optimize-go-applications/",
    "year": "2024",
    "category": "Cloud & Infrastructure",
    "summary": "Explains Profile-Guided Optimization (fully integrated in Go 1.21+) and how to feed continuous profiles from Pyroscope into the Go compiler for automatic inlining and speedups. Covers one of the newest performance features every modern Go developer should know.",
    "tags": [
      "performance",
      "observability",
      "tooling"
    ]
  },
  {
    "company": "Monzo",
    "title": "Building a Modern Bank Backend",
    "url": "https://monzo.com/blog/2016/09/19/building-a-modern-bank-backend",
    "year": "2016",
    "category": "Fintech & Payments",
    "summary": "Monzo explains how it built a bank from day one on distributed Go microservices, covering why Go's low-latency, high-concurrency servers fit banking workloads. A foundational read on why fintechs pick Go for backend services.",
    "tags": [
      "architecture",
      "microservices",
      "case-study"
    ]
  },
  {
    "company": "Monzo",
    "title": "We built network isolation for 1,500 services to make Monzo more secure",
    "url": "https://monzo.com/blog/we-built-network-isolation-for-1-500-services",
    "year": "2019",
    "category": "Fintech & Payments",
    "summary": "Monzo's security team wrote a Go static-analysis tool (rpcmap) that reads all the Go code on their platform to auto-generate network isolation policies for 1,500 microservices. Great example of using Go tooling to analyze Go codebases at scale.",
    "tags": [
      "networking",
      "microservices",
      "tooling"
    ]
  },
  {
    "company": "Monzo",
    "title": "How we run migrations across 2,800 microservices",
    "url": "https://monzo.com/blog/how-we-run-migrations-across-2800-microservices",
    "year": "2024",
    "category": "Fintech & Payments",
    "summary": "How Monzo centrally drives library migrations (OpenTracing to OpenTelemetry) across 2,800 Go services in a monorepo, using gopls/gorename automation and gradual rollouts. Shows what maintaining Go at extreme scale really looks like.",
    "tags": [
      "migration",
      "microservices",
      "tooling",
      "observability"
    ]
  },
  {
    "company": "Monzo",
    "title": "Redefining our microservice development process",
    "url": "https://monzo.com/blog/2022/06/24/redefining-our-microservice-development-process",
    "year": "2022",
    "category": "Fintech & Payments",
    "summary": "Monzo describes evolving its local development tooling (Orchestra, Autopilot, Devproxy) for testing Go microservices against staging, with request contracts defined as Go structs. Useful for learners thinking about developer experience in large Go systems.",
    "tags": [
      "microservices",
      "tooling",
      "architecture"
    ]
  },
  {
    "company": "Razorpay",
    "title": "Go Consuming All Your Resources?",
    "url": "https://engineering.razorpay.com/golang-consuming-all-your-resources-5730cac4b61",
    "year": "2022",
    "category": "Fintech & Payments",
    "summary": "A debugging journey through a Go payment service whose idle heap memory wasn't being returned to the OS, ending in roughly 31% CPU improvement and 76% infra cost savings. One of the best real-world walkthroughs of Go GC and memory behavior in production.",
    "tags": [
      "performance",
      "gc",
      "observability"
    ]
  },
  {
    "company": "Stripe",
    "title": "Introducing Veneur: high performance and global aggregation for Datadog",
    "url": "https://stripe.com/blog/introducing-veneur-high-performance-and-global-aggregation-for-datadog",
    "year": "2016",
    "category": "Fintech & Payments",
    "summary": "Stripe introduces Veneur, its open-source DogStatsD metrics server written in Go that handles all of Stripe's metrics with global percentile aggregation. Shows how Go is used for high-throughput observability infrastructure at a payments company.",
    "tags": [
      "observability",
      "performance",
      "tooling"
    ]
  },
  {
    "company": "Capital One",
    "title": "A Serverless and Go Journey (Credit Offers API)",
    "url": "https://www.capitalone.com/tech/cloud/a-serverless-and-go-journey/",
    "year": "2018",
    "category": "Fintech & Payments",
    "summary": "Capital One's tech lead recounts migrating the Credit Offers API from Java to Go on fully serverless AWS Lambda, with notes on Go's concurrency, GC, and syntax simplicity. A concrete fintech migration story with performance and cost outcomes.",
    "tags": [
      "migration",
      "scaling",
      "case-study"
    ]
  },
  {
    "company": "American Express",
    "title": "Choosing Go at American Express",
    "url": "https://americanexpress.io/choosing-go/",
    "year": "2019",
    "category": "Fintech & Payments",
    "summary": "Amex benchmarked C++, Go, Java, and Node.js by building the same ISO8583-to-JSON payments microservice in each, and chose Go (140k req/s) for transaction routing and rewards. A rare data-driven language-evaluation post from a payments network.",
    "tags": [
      "performance",
      "microservices",
      "case-study"
    ]
  },
  {
    "company": "American Express",
    "title": "Go at American Express Today: Seven Key Learnings",
    "url": "https://americanexpress.io/go-at-american-express-today/",
    "year": "2025",
    "category": "Fintech & Payments",
    "summary": "Distinguished Engineer Benjamin Cane shares seven lessons from nearly a decade of Go at Amex: dependency management, concurrency patterns, internal frameworks, performance tooling, and observability. Excellent view of long-term Go adoption in payments.",
    "tags": [
      "concurrency",
      "tooling",
      "case-study",
      "performance"
    ]
  },
  {
    "company": "PayPal",
    "title": "PayPal Taps Go to Modernize and Scale (go.dev case study)",
    "url": "https://go.dev/solutions/paypal",
    "year": "2020",
    "category": "Fintech & Payments",
    "summary": "Official go.dev case study on PayPal rewriting its C++ NoSQL database layer in Go, using goroutines and channels to tame concurrent code, with Go also powering routers and load balancers. Shows Go replacing C++ for performance-critical payment infrastructure.",
    "tags": [
      "concurrency",
      "migration",
      "case-study",
      "performance"
    ]
  },
  {
    "company": "American Express",
    "title": "American Express Uses Go for Payments & Rewards (go.dev case study)",
    "url": "https://go.dev/solutions/americanexpress",
    "year": "2019",
    "category": "Fintech & Payments",
    "summary": "The official go.dev case study of Amex's payments and rewards platform, detailing why Go beat C++, Java, and Node.js for high-concurrency, low-latency microservices. A concise companion to Amex's own engineering posts.",
    "tags": [
      "case-study",
      "microservices",
      "performance"
    ]
  },
  {
    "company": "Twitch",
    "title": "Go memory ballast: How I learnt to stop worrying and love the heap",
    "url": "https://blog.twitch.tv/en/2019/04/10/go-memory-ballast-how-i-learnt-to-stop-worrying-and-love-the-heap/",
    "year": "2019",
    "category": "Streaming, Media & Gaming",
    "summary": "Twitch's famous trick of allocating a 10GB byte array at startup to tame the Go GC pacer cut GC cycles by ~99% and CPU by ~30% on their Visage API service. The single best deep-dive into how Go's GC pacer, GC assists, and heap sizing actually affect tail latency in production.",
    "tags": [
      "gc",
      "performance",
      "case-study"
    ]
  },
  {
    "company": "Twitch",
    "title": "Go's march to low-latency GC",
    "url": "https://blog.twitch.tv/en/2016/07/05/gos-march-to-low-latency-gc-a6fa96f06eb7/",
    "year": "2016",
    "category": "Streaming, Media & Gaming",
    "summary": "Rhys Hiltner chronicles how Twitch's chat service GC pauses fell from tens of seconds in Go 1.2 to ~1ms in Go 1.7, covering profiling, stack shrinking, and NUMA issues along the way. A great history lesson on Go's concurrent GC and how to profile pause times in real services.",
    "tags": [
      "gc",
      "performance",
      "scaling"
    ]
  },
  {
    "company": "Discord",
    "title": "Why Discord is switching from Go to Rust",
    "url": "https://discord.com/blog/why-discord-is-switching-from-go-to-rust",
    "year": "2020",
    "category": "Streaming, Media & Gaming",
    "summary": "Discord explains how GC-driven latency spikes every ~2 minutes in their Go-based Read States service (hot LRU cache, billions of entries) led them to rewrite it in Rust. Read it for what it teaches about Go's GC internals, heap scanning costs, and when a GC'd language hits its limits.",
    "tags": [
      "gc",
      "performance",
      "migration",
      "case-study"
    ]
  },
  {
    "company": "Riot Games",
    "title": "Leveraging Golang for Game Development and Operations",
    "url": "https://www.riotgames.com/en/news/leveraging-golang-game-development-and-operations",
    "year": "2020",
    "category": "Streaming, Media & Gaming",
    "summary": "The official go.dev case study: Riot runs League of Legends and Valorant backend microservices on Go, leaning on concurrency primitives for back pressure, implicit interfaces, and package modularity at global scale. Shows how Go earned first-class-citizen status alongside Java in a major game studio.",
    "tags": [
      "microservices",
      "concurrency",
      "scaling",
      "case-study"
    ]
  },
  {
    "company": "Netflix",
    "title": "Application data caching using SSDs",
    "url": "https://netflixtechblog.com/application-data-caching-using-ssds-5bf25df851ef",
    "year": "2016",
    "category": "Streaming, Media & Gaming",
    "summary": "Netflix describes Rend, their open-source memcached proxy written in Go that manages L1 RAM / L2 SSD caching for EVCache while handling tens of thousands of concurrent connections. Explains why they chose Go over Java (GC pauses) and C (productivity) for latency-sensitive infrastructure.",
    "tags": [
      "performance",
      "architecture",
      "networking",
      "case-study"
    ]
  },
  {
    "company": "SoundCloud",
    "title": "Go at SoundCloud",
    "url": "https://developers.soundcloud.com/blog/go-at-soundcloud/",
    "year": "2012",
    "category": "Streaming, Media & Gaming",
    "summary": "One of the earliest industry adoption stories (Peter Bourgon), explaining why Go's 'WYSIWYG' readability and fast deploy cycle fit SoundCloud's shared-code-ownership backend culture, with features going whiteboard-to-production in under an hour. Useful historical context for why companies bet on Go pre-1.0-hype.",
    "tags": [
      "case-study",
      "microservices",
      "tooling"
    ]
  },
  {
    "company": "SoundCloud",
    "title": "Prometheus: Monitoring at SoundCloud",
    "url": "https://developers.soundcloud.com/blog/prometheus-monitoring-at-soundcloud/",
    "year": "2015",
    "category": "Streaming, Media & Gaming",
    "summary": "The post that introduced Prometheus — written in Go at SoundCloud to monitor hundreds of microservices with thousands of instances — covering its data model, query language, and pull-based architecture. Essential reading since Prometheus is now the standard Go-native observability stack you'll instrument every Go service with.",
    "tags": [
      "observability",
      "microservices",
      "tooling"
    ]
  },
  {
    "company": "SoundCloud",
    "title": "Roshi: a CRDT system for timestamped events",
    "url": "https://developers.soundcloud.com/blog/roshi-a-crdt-system-for-timestamped-events",
    "year": "2014",
    "category": "Streaming, Media & Gaming",
    "summary": "How SoundCloud built Roshi, a ~5000-line Go service implementing a LWW-element-set CRDT on Redis to serve their stream/timeline feature with no separate persistence layer. A masterclass in distributed-systems design expressed in idiomatic, heavily-tested Go.",
    "tags": [
      "architecture",
      "scaling",
      "concurrency",
      "case-study"
    ]
  },
  {
    "company": "Wildlife Studios",
    "title": "Building Pitaya, Wildlife's own scalable game server framework",
    "url": "https://medium.com/tech-at-wildlife-studios/pitaya-wildlifes-golang-go-af57865f7a11",
    "year": "2020",
    "category": "Streaming, Media & Gaming",
    "summary": "Wildlife explains why they rewrote their Node.js (Pomelo) game servers in Go, building the open-source Pitaya framework that powers Tennis Clash and Zooba for ~40M daily players. Shows goroutine-based concurrency and Go's pprof tooling applied to real-time multiplayer game backends.",
    "tags": [
      "concurrency",
      "scaling",
      "architecture",
      "migration"
    ]
  },
  {
    "company": "Wildlife Studios",
    "title": "Testing Golang code: our approach at Wildlife",
    "url": "https://medium.com/tech-at-wildlife-studios/testing-golang-code-our-approach-at-wildlife-6f41e489ff36",
    "year": "2020",
    "category": "Streaming, Media & Gaming",
    "summary": "A practical tour of how a gaming company tests production Go: table-driven tests, black-box vs white-box packages, and the unit/integration split using go test. Great for learners moving from toy tests to the patterns real teams enforce in CI.",
    "tags": [
      "tooling",
      "case-study"
    ]
  },
  {
    "company": "Wildlife Studios",
    "title": "How I Write Backend Systems at Wildlife Studios",
    "url": "https://medium.com/tech-at-wildlife-studios/write-backend-systems-50aae8db849e",
    "year": "2020",
    "category": "Streaming, Media & Gaming",
    "summary": "A Wildlife engineer walks through their KISS-first Go project layout (api, cmd, models, storage, usecases), arguing for raw SQL over ORMs and flags for config, letting complexity grow only when needed. A concrete, opinionated template for structuring your first production-grade Go service.",
    "tags": [
      "architecture",
      "tooling",
      "case-study"
    ]
  },
  {
    "company": "Dailymotion",
    "title": "How to automate users management in Wireguard",
    "url": "https://medium.com/dailymotion/how-to-automate-users-management-in-wireguard-633ff591866e",
    "year": "2020",
    "category": "Streaming, Media & Gaming",
    "summary": "Dailymotion built Asteroid, an open-source Go tool that automates adding/removing WireGuard VPN peers across their infrastructure, choosing Go for its small footprint and single-binary deploys. A nice example of Go as the default language for internal infrastructure and networking tooling.",
    "tags": [
      "tooling",
      "networking",
      "case-study"
    ]
  },
  {
    "company": "Dropbox",
    "title": "Open Sourcing Our Go Libraries",
    "url": "https://dropbox.tech/infrastructure/open-sourcing-our-go-libraries",
    "year": "2014",
    "category": "E-commerce & Social",
    "summary": "Dropbox describes migrating performance-critical backends from Python to Go (~200K lines of Go) and open-sourcing godropbox, the library set they built for connection management, caching, and large-scale services. A classic early proof that Go works for production infrastructure at scale.",
    "tags": [
      "migration",
      "tooling",
      "architecture",
      "case-study"
    ]
  },
  {
    "company": "Slack",
    "title": "Scaling Slack's Job Queue",
    "url": "https://slack.engineering/scaling-slacks-job-queue/",
    "year": "2017",
    "category": "E-commerce & Social",
    "summary": "How Slack rebuilt its job queue to handle billions of tasks daily by putting Kafka in front of Redis, with two stateless Go services (Kafkagate and JQRelay) doing the heavy lifting. Great real-world example of Go in high-throughput queueing infrastructure.",
    "tags": [
      "scaling",
      "architecture",
      "concurrency"
    ]
  },
  {
    "company": "Slack",
    "title": "Executing Cron Scripts Reliably At Scale",
    "url": "https://slack.engineering/executing-cron-scripts-reliably-at-scale/",
    "year": "2023",
    "category": "E-commerce & Social",
    "summary": "Slack replaced a single overloaded cron box with a Go 'Scheduled Job Conductor' service built on a Golang cron library and Kubernetes. Shows how Go is used to build reliable distributed scheduling systems in production.",
    "tags": [
      "scaling",
      "architecture",
      "tooling"
    ]
  },
  {
    "company": "Allegro",
    "title": "Writing a very fast cache service with millions of entries in Go",
    "url": "https://blog.allegro.tech/2016/03/writing-fast-cache-service-in-go.html",
    "year": "2016",
    "category": "E-commerce & Social",
    "summary": "Allegro's team builds BigCache, an in-memory cache handling 10K req/s, and explains how they fought GC pauses by keeping millions of entries in byte arrays the collector won't scan. Essential reading on Go GC behavior and latency tuning under e-commerce load.",
    "tags": [
      "performance",
      "gc",
      "concurrency",
      "case-study"
    ]
  },
  {
    "company": "Allegro",
    "title": "How the Garbage Collector Works in Go and How It Affects Your Programs",
    "url": "https://blog.allegro.tech/2025/08/how-garbage-collector-works-in-go-and-how-it-affects-your-programs.html",
    "year": "2025",
    "category": "E-commerce & Social",
    "summary": "A deep dive into Go's tricolor mark-and-sweep GC, stack vs heap allocation, and tuning with GOGC/GODEBUG, written from the perspective of a large e-commerce platform. Perfect bridge from Go theory to production memory management.",
    "tags": [
      "gc",
      "performance"
    ]
  },
  {
    "company": "MercadoLibre",
    "title": "MercadoLibre Grows with Go",
    "url": "https://go.dev/solutions/mercadolibre",
    "year": "2019",
    "category": "E-commerce & Social",
    "summary": "Official go.dev case study on how Latin America's largest e-commerce platform serves 10M+ requests/minute with Go, cutting servers from 32 to 4 and making test suites 24x faster. Shows the concrete cost and productivity wins that drive Go adoption at scale.",
    "tags": [
      "scaling",
      "case-study",
      "microservices",
      "performance"
    ]
  },
  {
    "company": "Trivago",
    "title": "Why We Chose Go",
    "url": "https://tech.trivago.com/post/2020-03-02-whywechosego",
    "year": "2020",
    "category": "E-commerce & Social",
    "summary": "Trivago explains picking Go for a new microservice: the race detector for catching concurrency bugs, tiny statically-linked Docker images, go fmt ending style debates, and easy team onboarding. A concise, honest checklist of why product teams adopt Go.",
    "tags": [
      "microservices",
      "concurrency",
      "case-study"
    ]
  },
  {
    "company": "Trivago",
    "title": "Building Our First GraphQL Server with Go: An Implementation Guide",
    "url": "https://tech.trivago.com/post/2023-05-17-building-our-first-graphql-server-with-go-an-implementation-guide",
    "year": "2023",
    "category": "E-commerce & Social",
    "summary": "A walkthrough of building a dedicated GraphQL server in Go with gqlgen behind a federation gateway for trivago's Favorites feature. Practical guide to API architecture decisions plus hands-on Go resolver implementation.",
    "tags": [
      "architecture",
      "microservices",
      "tooling"
    ]
  },
  {
    "company": "Shopify",
    "title": "Leveraging Go Worker Pools to Scale Server-side Data Sharing",
    "url": "https://shopify.engineering/leveraging-go-worker-pools",
    "year": "2022",
    "category": "E-commerce & Social",
    "summary": "Shopify boosts its Server Pixels event service throughput by 170% (to 21K events/sec per pod, 46K at Black Friday peak) by replacing unbounded goroutine spawning with worker pools. One of the best concrete demonstrations of the worker-pool concurrency pattern in production.",
    "tags": [
      "concurrency",
      "performance",
      "scaling"
    ]
  },
  {
    "company": "Salesforce",
    "title": "Einstein Analytics and Go",
    "url": "https://engineering.salesforce.com/einstein-analytics-and-go-24e5aed2981f/",
    "year": "2019",
    "category": "E-commerce & Social",
    "summary": "Salesforce explains rewriting the Einstein Analytics backend from a Python-C hybrid to Go to fix multithreading bottlenecks and gain static typing plus easy cross-compilation. A strong enterprise migration story showing when and why Go beats Python for compute-heavy services.",
    "tags": [
      "migration",
      "performance",
      "case-study"
    ]
  },
  {
    "company": "Curve",
    "title": "Curve (go.dev Case Study)",
    "url": "https://go.dev/solutions/curve",
    "year": "",
    "category": "E-commerce & Social",
    "summary": "Official go.dev case study where fintech Curve shares how Go's efficiency, standard library, and community helped them migrate performance-critical backends from Python and move banking to the cloud. Useful for seeing Go's fit in regulated, latency-sensitive financial products.",
    "tags": [
      "migration",
      "case-study",
      "scaling"
    ]
  },
  {
    "company": "Go Team (go.dev)",
    "title": "Share Memory By Communicating",
    "url": "https://go.dev/blog/codelab-share",
    "year": "2010",
    "category": "Official Go Team & Deep Dives",
    "summary": "Andrew Gerrand's foundational post explaining Go's core concurrency philosophy: pass data ownership through channels instead of guarding shared memory with locks. It is the single most-quoted idea in Go concurrency and shapes how idiomatic Go programs are designed.",
    "tags": [
      "concurrency",
      "architecture"
    ]
  },
  {
    "company": "Go Team (go.dev)",
    "title": "A Guide to the Go Garbage Collector",
    "url": "https://go.dev/doc/gc-guide",
    "year": "2022",
    "category": "Official Go Team & Deep Dives",
    "summary": "The official, definitive guide to how Go's GC works, what it costs, and how to tune it with GOGC and GOMEMLIMIT, complete with interactive visualizations. Essential for anyone debugging memory usage or GC latency in production Go services.",
    "tags": [
      "gc",
      "performance",
      "tooling"
    ]
  },
  {
    "company": "Go Team (go.dev)",
    "title": "An Introduction To Generics",
    "url": "https://go.dev/blog/intro-generics",
    "year": "2022",
    "category": "Official Go Team & Deep Dives",
    "summary": "Robert Griesemer and Ian Lance Taylor introduce type parameters, constraints, and type inference as shipped in Go 1.18 — straight from the designers of the feature. The canonical starting point for learning when (and when not) to use generics.",
    "tags": [
      "tooling",
      "architecture"
    ]
  },
  {
    "company": "Go Team (go.dev)",
    "title": "Container-aware GOMAXPROCS",
    "url": "https://go.dev/blog/container-aware-gomaxprocs",
    "year": "2025",
    "category": "Official Go Team & Deep Dives",
    "summary": "Michael Pratt and Carlos Amedee explain how Go 1.25 makes GOMAXPROCS respect cgroup CPU limits in containers, and why mismatched CPU counts caused throttling and tail-latency problems in Kubernetes. A must-read for running Go in containerized production environments.",
    "tags": [
      "performance",
      "scaling",
      "concurrency"
    ]
  },
  {
    "company": "Go Team (go.dev)",
    "title": "Go Concurrency Patterns: Pipelines and cancellation",
    "url": "https://go.dev/blog/pipelines",
    "year": "2014",
    "category": "Official Go Team & Deep Dives",
    "summary": "Sameer Ajmani walks through building multi-stage channel pipelines, fan-in/fan-out, and clean cancellation with done channels. These patterns appear constantly in real Go codebases and in concurrency interview questions.",
    "tags": [
      "concurrency",
      "architecture"
    ]
  },
  {
    "company": "Go Team (go.dev)",
    "title": "Go Concurrency Patterns: Context",
    "url": "https://go.dev/blog/context",
    "year": "2014",
    "category": "Official Go Team & Deep Dives",
    "summary": "The original post introducing the context package for carrying deadlines, cancellation signals, and request-scoped values across API boundaries at Google. Understanding context is non-negotiable for writing Go servers and microservices.",
    "tags": [
      "concurrency",
      "microservices",
      "networking"
    ]
  },
  {
    "company": "Dave Cheney",
    "title": "Practical Go: Real world advice for writing maintainable Go programs",
    "url": "https://dave.cheney.net/practical-go/presentations/qcon-china.html",
    "year": "2019",
    "category": "Official Go Team & Deep Dives",
    "summary": "Dave Cheney's book-length workshop covering naming, comments, package design, API design, error handling, and concurrency guidelines drawn from real-world Go projects. Widely treated as a de facto style guide for production Go teams.",
    "tags": [
      "architecture",
      "tooling",
      "concurrency"
    ]
  },
  {
    "company": "Dave Cheney",
    "title": "Five things that make Go fast",
    "url": "https://dave.cheney.net/2014/06/07/five-things-that-make-go-fast",
    "year": "2014",
    "category": "Official Go Team & Deep Dives",
    "summary": "A classic Gocon talk transcript explaining why Go performs well: value types and memory layout, inlining, escape analysis, goroutine stacks, and the runtime's integrated scheduler/GC. It teaches the mental model behind Go performance that interviewers love to probe.",
    "tags": [
      "performance",
      "gc",
      "concurrency"
    ]
  },
  {
    "company": "Ardan Labs",
    "title": "Scheduling In Go : Part I - OS Scheduler",
    "url": "https://www.ardanlabs.com/blog/2018/08/scheduling-in-go-part1.html",
    "year": "2018",
    "category": "Official Go Team & Deep Dives",
    "summary": "William Kennedy starts his famous scheduler series with how OS threads, CPU caches, false sharing, and context switches actually work — the mechanical-sympathy foundation needed to understand goroutines. The series is the standard reference for Go scheduler deep dives.",
    "tags": [
      "concurrency",
      "performance"
    ]
  },
  {
    "company": "Ardan Labs",
    "title": "Scheduling In Go : Part II - Go Scheduler",
    "url": "https://www.ardanlabs.com/blog/2018/08/scheduling-in-go-part2.html",
    "year": "2018",
    "category": "Official Go Team & Deep Dives",
    "summary": "The core of the series: the G-M-P model, local and global run queues, work stealing, and how network/syscall blocking is handled so goroutines stay cheap. This is the post to read before any interview question about how goroutines are scheduled.",
    "tags": [
      "concurrency",
      "performance",
      "architecture"
    ]
  },
  {
    "company": "Ardan Labs",
    "title": "Scheduling In Go : Part III - Concurrency",
    "url": "https://www.ardanlabs.com/blog/2018/12/scheduling-in-go-part3.html",
    "year": "2018",
    "category": "Official Go Team & Deep Dives",
    "summary": "Closes the series by distinguishing concurrency from parallelism and benchmarking CPU-bound vs IO-bound workloads to show when adding goroutines actually helps. Teaches the judgment call — not just the mechanics — of using concurrency in real systems.",
    "tags": [
      "concurrency",
      "performance",
      "case-study"
    ]
  },
  {
    "company": "research!rsc (Russ Cox)",
    "title": "Updating the Go Memory Model (Memory Models, Part 3)",
    "url": "https://research.swtch.com/gomm",
    "year": "2021",
    "category": "Official Go Team & Deep Dives",
    "summary": "Russ Cox, then Go's tech lead, explains what the Go memory model guarantees for data races, sync primitives, and atomics, and the reasoning behind the 2022 memory-model revision. The authoritative deep dive on why racy Go programs are undefined and how synchronization really works.",
    "tags": [
      "concurrency",
      "performance",
      "architecture"
    ]
  }
];
