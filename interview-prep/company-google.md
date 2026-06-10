> © 2024 Gaurav Patil — GoForge Platform. All rights reserved.

# Google-Style Go Interview Questions

30 problems. For each: problem statement → complete Go solution → O(n) complexity analysis → "how would you scale this?" → follow-up generalization.

Google focuses on: clean algorithms, optimal complexity, code clarity, generalization.

---

## Problem 1: Concurrent Merge Sort Using Goroutines

**Problem Statement:**
Implement merge sort that parallelizes the divide step using goroutines. Use a threshold below which you fall back to sequential sort to avoid goroutine explosion.

```go
package main

import (
	"fmt"
	"sync"
)

const threshold = 2048

func mergeSort(arr []int) []int {
	if len(arr) <= 1 {
		return arr
	}
	if len(arr) < threshold {
		return sequentialMergeSort(arr)
	}

	mid := len(arr) / 2
	var left, right []int
	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		left = mergeSort(arr[:mid])
	}()
	go func() {
		defer wg.Done()
		right = mergeSort(arr[mid:])
	}()

	wg.Wait()
	return merge(left, right)
}

func sequentialMergeSort(arr []int) []int {
	if len(arr) <= 1 {
		return arr
	}
	mid := len(arr) / 2
	left := sequentialMergeSort(arr[:mid])
	right := sequentialMergeSort(arr[mid:])
	return merge(left, right)
}

func merge(left, right []int) []int {
	result := make([]int, 0, len(left)+len(right))
	i, j := 0, 0
	for i < len(left) && j < len(right) {
		if left[i] <= right[j] {
			result = append(result, left[i])
			i++
		} else {
			result = append(result, right[j])
			j++
		}
	}
	result = append(result, left[i:]...)
	result = append(result, right[j:]...)
	return result
}

func main() {
	arr := []int{38, 27, 43, 3, 9, 82, 10}
	sorted := mergeSort(arr)
	fmt.Println("Sorted:", sorted)
}
```

**Complexity:**
- Time: O(n log n) — same as sequential but wall-clock time reduced by parallelism
- Space: O(n log n) due to recursive slice allocations; goroutine stack adds O(log n) overhead

**How would you scale this?**
For truly large datasets (e.g., sorting 100 GB), distribute chunks across machines using a MapReduce pattern. Each worker node sorts a shard; a coordinator does a k-way merge. Use `io.Pipe` or gRPC streams to avoid loading everything in memory. Cap goroutine depth with a semaphore or worker pool to avoid GOMAXPROCS contention.

**Follow-up:**
How would you make this generic for any ordered type? Use Go 1.21 `cmp.Ordered` constraint and write `func mergeSort[T cmp.Ordered](arr []T) []T`. How would you sort objects by multiple keys? Accept a `less func(a, b T) bool` comparator instead.

---

## Problem 2: Goroutine-Safe LRU Cache (Doubly Linked List + Map)

**Problem Statement:**
Implement an LRU cache with O(1) Get and Put, safe for concurrent access from multiple goroutines.

```go
package main

import (
	"container/list"
	"fmt"
	"sync"
)

type entry struct {
	key   int
	value int
}

type LRUCache struct {
	cap   int
	mu    sync.RWMutex
	list  *list.List
	items map[int]*list.Element
}

func NewLRUCache(capacity int) *LRUCache {
	return &LRUCache{
		cap:   capacity,
		list:  list.New(),
		items: make(map[int]*list.Element),
	}
}

func (c *LRUCache) Get(key int) (int, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if el, ok := c.items[key]; ok {
		c.list.MoveToFront(el)
		return el.Value.(*entry).value, true
	}
	return 0, false
}

func (c *LRUCache) Put(key, value int) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if el, ok := c.items[key]; ok {
		c.list.MoveToFront(el)
		el.Value.(*entry).value = value
		return
	}
	if c.list.Len() == c.cap {
		back := c.list.Back()
		if back != nil {
			c.list.Remove(back)
			delete(c.items, back.Value.(*entry).key)
		}
	}
	el := c.list.PushFront(&entry{key, value})
	c.items[key] = el
}

func main() {
	cache := NewLRUCache(3)
	cache.Put(1, 10)
	cache.Put(2, 20)
	cache.Put(3, 30)
	v, ok := cache.Get(1)
	fmt.Println(v, ok) // 10 true
	cache.Put(4, 40)   // evicts key 2
	_, ok = cache.Get(2)
	fmt.Println(ok) // false
}
```

**Complexity:**
- Time: O(1) amortized for Get and Put
- Space: O(capacity)

**How would you scale this?**
For a distributed LRU (e.g., caching at Google scale): shard the cache across N nodes using consistent hashing on the key. Each shard is an independent LRU. Use a write-through or write-around strategy to back the cache with a persistent store (Bigtable/Spanner). For read-heavy workloads, replicate hot shards. Add TTL fields to each entry and run a background goroutine to expire stale entries.

**Follow-up:**
Implement LFU (Least Frequently Used) instead. LFU requires tracking frequency counts; use two maps — one from key to frequency, one from frequency to a doubly-linked list of keys at that frequency. O(1) Get/Put is still achievable.

---

## Problem 3: Distributed Rate Limiter Design

**Problem Statement:**
Implement a token bucket rate limiter that is safe for concurrent use. Then discuss how to extend it to a distributed system.

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

type TokenBucket struct {
	mu         sync.Mutex
	tokens     float64
	capacity   float64
	refillRate float64 // tokens per second
	lastRefill time.Time
}

func NewTokenBucket(capacity, refillRate float64) *TokenBucket {
	return &TokenBucket{
		tokens:     capacity,
		capacity:   capacity,
		refillRate: refillRate,
		lastRefill: time.Now(),
	}
}

func (tb *TokenBucket) Allow() bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(tb.lastRefill).Seconds()
	tb.tokens = min(tb.capacity, tb.tokens+elapsed*tb.refillRate)
	tb.lastRefill = now

	if tb.tokens >= 1.0 {
		tb.tokens--
		return true
	}
	return false
}

func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}

func main() {
	limiter := NewTokenBucket(5, 2) // 5 capacity, refill 2/sec
	allowed, denied := 0, 0
	for i := 0; i < 10; i++ {
		if limiter.Allow() {
			allowed++
		} else {
			denied++
		}
	}
	fmt.Printf("Allowed: %d, Denied: %d\n", allowed, denied)
	time.Sleep(2 * time.Second)
	fmt.Println("After 2s wait:", limiter.Allow()) // true
}
```

**Complexity:**
- Time: O(1) per Allow() call
- Space: O(1) per rate limiter instance

**How would you scale this?**
In a distributed system (e.g., limiting a user across 10 API servers), a local token bucket per server under-counts requests. Use Redis with a Lua script to atomically read-increment-expire a counter per (user, window). Use sliding window log or sliding window counter for accuracy. For extreme scale, use a gossip protocol to propagate usage estimates across nodes, accepting slight over-admission in exchange for no central bottleneck.

**Follow-up:**
Implement a sliding window rate limiter. Store timestamps of recent requests in a deque; on each request, evict timestamps older than the window, then check if the count is below the limit. Time: O(requests in window); Space: O(limit).

---

## Problem 4: Word Frequency Counter for 1TB File Using Goroutines

**Problem Statement:**
Count word frequencies in a very large file. Read in parallel chunks; merge results with a final reduce step.

```go
package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"sync"
)

type FreqMap map[string]int

func countChunk(lines []string) FreqMap {
	freq := make(FreqMap)
	for _, line := range lines {
		for _, word := range strings.Fields(line) {
			word = strings.ToLower(strings.Trim(word, ".,!?\"';:"))
			if word != "" {
				freq[word]++
			}
		}
	}
	return freq
}

func mergeFreqs(maps []FreqMap) FreqMap {
	result := make(FreqMap)
	for _, m := range maps {
		for k, v := range m {
			result[k] += v
		}
	}
	return result
}

func wordFrequency(filename string, workers int) (FreqMap, error) {
	f, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	lineCh := make(chan []string, workers)
	resultCh := make(chan FreqMap, workers)
	var wg sync.WaitGroup

	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for chunk := range lineCh {
				resultCh <- countChunk(chunk)
			}
		}()
	}

	go func() {
		wg.Wait()
		close(resultCh)
	}()

	const chunkSize = 10000
	scanner := bufio.NewScanner(f)
	chunk := make([]string, 0, chunkSize)
	for scanner.Scan() {
		chunk = append(chunk, scanner.Text())
		if len(chunk) == chunkSize {
			lineCh <- chunk
			chunk = make([]string, 0, chunkSize)
		}
	}
	if len(chunk) > 0 {
		lineCh <- chunk
	}
	close(lineCh)

	var partials []FreqMap
	for m := range resultCh {
		partials = append(partials, m)
	}
	return mergeFreqs(partials), scanner.Err()
}

func main() {
	// For demo, write a small temp file
	f, _ := os.CreateTemp("", "words*.txt")
	f.WriteString("go is great\ngo is fast\nfast code in go\n")
	f.Close()
	freq, err := wordFrequency(f.Name(), 4)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	for w, c := range freq {
		fmt.Printf("%s: %d\n", w, c)
	}
	os.Remove(f.Name())
}
```

**Complexity:**
- Time: O(N/W) wall-clock where N = total words, W = worker count
- Space: O(U) where U = unique word count per chunk * workers

**How would you scale this?**
For a true 1 TB file: use MapReduce (or Beam/Dataflow). Split the file into 128 MB HDFS/GCS blocks. Each mapper emits (word, 1) pairs; a combiner locally aggregates; reducers merge by hash-partitioning on word. For streaming ingestion (log files), use Kafka + Flink with tumbling windows. The Go solution maps to the mapper phase exactly.

**Follow-up:**
Find the top-K most frequent words efficiently. Use a min-heap of size K across all partial results. After merging, heap operations are O(U log K). How would you handle Unicode words? Use `unicode.IsLetter` for tokenization and `golang.org/x/text/unicode/norm` for normalization.

---

## Problem 5: Pub-Sub with Backpressure Using Buffered Channels

**Problem Statement:**
Build a publish-subscribe system where slow subscribers do not block the publisher. Implement backpressure by dropping or queuing messages.

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

type Message struct {
	Topic   string
	Payload interface{}
}

type Subscriber struct {
	id   int
	ch   chan Message
	done chan struct{}
}

type PubSub struct {
	mu          sync.RWMutex
	subscribers map[string][]*Subscriber
}

func NewPubSub() *PubSub {
	return &PubSub{
		subscribers: make(map[string][]*Subscriber),
	}
}

func (ps *PubSub) Subscribe(topic string, bufSize int) *Subscriber {
	ps.mu.Lock()
	defer ps.mu.Unlock()
	sub := &Subscriber{
		id:   len(ps.subscribers[topic]),
		ch:   make(chan Message, bufSize),
		done: make(chan struct{}),
	}
	ps.subscribers[topic] = append(ps.subscribers[topic], sub)
	return sub
}

func (ps *PubSub) Publish(msg Message) (delivered, dropped int) {
	ps.mu.RLock()
	subs := ps.subscribers[msg.Topic]
	ps.mu.RUnlock()

	for _, sub := range subs {
		select {
		case sub.ch <- msg:
			delivered++
		default:
			// backpressure: drop message for slow subscriber
			dropped++
		}
	}
	return
}

func (ps *PubSub) Unsubscribe(topic string, sub *Subscriber) {
	ps.mu.Lock()
	defer ps.mu.Unlock()
	close(sub.done)
	subs := ps.subscribers[topic]
	for i, s := range subs {
		if s == sub {
			ps.subscribers[topic] = append(subs[:i], subs[i+1:]...)
			break
		}
	}
}

func main() {
	ps := NewPubSub()
	sub1 := ps.Subscribe("events", 5)
	sub2 := ps.Subscribe("events", 2) // smaller buffer, will drop under load

	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		for i := 0; i < 10; i++ {
			d, dr := ps.Publish(Message{Topic: "events", Payload: i})
			fmt.Printf("Message %d: delivered=%d dropped=%d\n", i, d, dr)
		}
	}()
	wg.Wait()

	// Drain sub1
	close(sub1.ch)
	for msg := range sub1.ch {
		fmt.Println("sub1 received:", msg.Payload)
	}
	time.Sleep(10 * time.Millisecond)
	_ = sub2
}
```

**Complexity:**
- Publish: O(S) where S = subscriber count per topic
- Subscribe/Unsubscribe: O(S)
- Space: O(S * bufSize)

**How would you scale this?**
Replace in-process channels with a distributed message broker (Kafka, Pub/Sub, NATS). For backpressure at scale: Kafka uses consumer group lag monitoring; if a consumer falls behind, auto-scale its replicas or shed load via rate limiting at the producer. Use exponential backoff and dead-letter queues for messages that consistently fail delivery.

**Follow-up:**
Implement topic wildcards (e.g., `events.*` matches `events.click` and `events.hover`). Use a trie to match subscriptions. How would you guarantee at-least-once delivery? Persist messages to WAL before broadcasting; subscribers ACK; re-send unACKed messages on reconnect.

---

## Problem 6: Trie Implementation in Go

**Problem Statement:**
Implement a Trie supporting Insert, Search, and StartsWith. Used for autocomplete, spell check, and IP routing.

```go
package main

import "fmt"

type TrieNode struct {
	children [26]*TrieNode
	isEnd    bool
}

type Trie struct {
	root *TrieNode
}

func NewTrie() *Trie {
	return &Trie{root: &TrieNode{}}
}

func (t *Trie) Insert(word string) {
	node := t.root
	for _, ch := range word {
		idx := ch - 'a'
		if node.children[idx] == nil {
			node.children[idx] = &TrieNode{}
		}
		node = node.children[idx]
	}
	node.isEnd = true
}

func (t *Trie) Search(word string) bool {
	node := t.root
	for _, ch := range word {
		idx := ch - 'a'
		if node.children[idx] == nil {
			return false
		}
		node = node.children[idx]
	}
	return node.isEnd
}

func (t *Trie) StartsWith(prefix string) bool {
	node := t.root
	for _, ch := range prefix {
		idx := ch - 'a'
		if node.children[idx] == nil {
			return false
		}
		node = node.children[idx]
	}
	return true
}

func (t *Trie) AutoComplete(prefix string) []string {
	node := t.root
	for _, ch := range prefix {
		idx := ch - 'a'
		if node.children[idx] == nil {
			return nil
		}
		node = node.children[idx]
	}
	var results []string
	var dfs func(n *TrieNode, current string)
	dfs = func(n *TrieNode, current string) {
		if n.isEnd {
			results = append(results, current)
		}
		for i, child := range n.children {
			if child != nil {
				dfs(child, current+string(rune('a'+i)))
			}
		}
	}
	dfs(node, prefix)
	return results
}

func main() {
	t := NewTrie()
	words := []string{"apple", "app", "application", "apply", "banana"}
	for _, w := range words {
		t.Insert(w)
	}
	fmt.Println(t.Search("app"))         // true
	fmt.Println(t.Search("ap"))          // false
	fmt.Println(t.StartsWith("app"))     // true
	fmt.Println(t.AutoComplete("app"))   // [app apple application apply]
}
```

**Complexity:**
- Insert/Search/StartsWith: O(L) where L = word length
- Space: O(ALPHABET * N * L) worst case; in practice much less with shared prefixes

**How would you scale this?**
For a search engine autocomplete serving millions of queries/sec: serialize the trie to a compact byte array (DAWG/DAFSA). Store in Redis as a hash of prefix → top-K completions. Pre-compute top-K completions per node offline and cache them. For Unicode support, replace `[26]` with a `map[rune]*TrieNode`. For multi-language, add a language discriminator in the key.

**Follow-up:**
Add Delete operation: traverse the word, unmark `isEnd`, then walk back and prune nodes with no children and `isEnd == false`. How would you add ranked autocomplete? Store a weight/frequency at each end node; during DFS, collect (word, weight) pairs and return top-K by weight using a min-heap.

---

## Problem 7: Graph BFS with Concurrent Level Processing

**Problem Statement:**
Perform BFS on a graph where all nodes at the same level are processed concurrently using goroutines.

```go
package main

import (
	"fmt"
	"sync"
)

type Graph struct {
	adj map[int][]int
}

func NewGraph() *Graph {
	return &Graph{adj: make(map[int][]int)}
}

func (g *Graph) AddEdge(u, v int) {
	g.adj[u] = append(g.adj[u], v)
	g.adj[v] = append(g.adj[v], u)
}

func (g *Graph) ConcurrentBFS(start int) [][]int {
	visited := sync.Map{}
	visited.Store(start, true)

	currentLevel := []int{start}
	var levels [][]int

	for len(currentLevel) > 0 {
		levels = append(levels, append([]int{}, currentLevel...))

		var mu sync.Mutex
		var nextLevel []int
		var wg sync.WaitGroup

		for _, node := range currentLevel {
			wg.Add(1)
			go func(n int) {
				defer wg.Done()
				var localNext []int
				for _, neighbor := range g.adj[n] {
					if _, loaded := visited.LoadOrStore(neighbor, true); !loaded {
						localNext = append(localNext, neighbor)
					}
				}
				mu.Lock()
				nextLevel = append(nextLevel, localNext...)
				mu.Unlock()
			}(node)
		}
		wg.Wait()
		currentLevel = nextLevel
	}
	return levels
}

func main() {
	g := NewGraph()
	edges := [][2]int{{0, 1}, {0, 2}, {1, 3}, {1, 4}, {2, 5}, {2, 6}}
	for _, e := range edges {
		g.AddEdge(e[0], e[1])
	}
	levels := g.ConcurrentBFS(0)
	for i, level := range levels {
		fmt.Printf("Level %d: %v\n", i, level)
	}
}
```

**Complexity:**
- Time: O(V + E) total; each level's wall-clock time is O(max_degree) with enough goroutines
- Space: O(V) for visited map and level slices

**How would you scale this?**
For graphs with billions of nodes (e.g., Google's web graph): use Pregel-style bulk synchronous parallel (BSP) computation. Each vertex maintains state; in each superstep, all vertices process received messages and send new ones. Frameworks: Apache Giraph, Google's Pregel. In Go, model each vertex as a goroutine communicating over channels, with a global barrier between levels using `sync.WaitGroup`.

**Follow-up:**
Implement bidirectional BFS to find shortest path. Expand from both source and target simultaneously; stop when the frontiers intersect. This reduces search space from O(b^d) to O(b^(d/2)). How would you handle weighted graphs? Replace BFS with Dijkstra's algorithm using a priority queue (`container/heap`).

---

## Problem 8: Top-K Elements with Concurrent Worker Pipeline

**Problem Statement:**
Find top-K largest elements from a large stream using a pipeline of concurrent workers and a min-heap.

```go
package main

import (
	"container/heap"
	"fmt"
	"math/rand"
	"sync"
)

// MinHeap of size K
type MinHeap []int

func (h MinHeap) Len() int           { return len(h) }
func (h MinHeap) Less(i, j int) bool { return h[i] < h[j] }
func (h MinHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *MinHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *MinHeap) Pop() interface{} {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[:n-1]
	return x
}

func topKWorker(in <-chan []int, k int) <-chan []int {
	out := make(chan []int)
	go func() {
		defer close(out)
		h := &MinHeap{}
		heap.Init(h)
		for chunk := range in {
			for _, v := range chunk {
				if h.Len() < k {
					heap.Push(h, v)
				} else if v > (*h)[0] {
					heap.Pop(h)
					heap.Push(h, v)
				}
			}
		}
		out <- []int(*h)
	}()
	return out
}

func mergeTopK(results [][]int, k int) []int {
	h := &MinHeap{}
	heap.Init(h)
	for _, partial := range results {
		for _, v := range partial {
			if h.Len() < k {
				heap.Push(h, v)
			} else if v > (*h)[0] {
				heap.Pop(h)
				heap.Push(h, v)
			}
		}
	}
	return []int(*h)
}

func topKConcurrent(data []int, k, workers int) []int {
	chunkSize := (len(data) + workers - 1) / workers
	inCh := make(chan []int, workers)

	var outChs []<-chan []int
	for i := 0; i < workers; i++ {
		outChs = append(outChs, topKWorker(inCh, k))
	}

	for i := 0; i < len(data); i += chunkSize {
		end := i + chunkSize
		if end > len(data) {
			end = len(data)
		}
		inCh <- data[i:end]
	}
	close(inCh)

	var wg sync.WaitGroup
	partials := make([][]int, workers)
	for i, ch := range outChs {
		wg.Add(1)
		go func(idx int, c <-chan []int) {
			defer wg.Done()
			partials[idx] = <-c
		}(i, ch)
	}
	wg.Wait()
	return mergeTopK(partials, k)
}

func main() {
	data := make([]int, 1000)
	for i := range data {
		data[i] = rand.Intn(10000)
	}
	top5 := topKConcurrent(data, 5, 4)
	fmt.Println("Top-5 elements:", top5)
}
```

**Complexity:**
- Time: O((N/W) log K) per worker, O(W*K log K) merge — overall O(N log K / W)
- Space: O(K * W) for partial heaps

**How would you scale this?**
For a streaming pipeline (e.g., finding top-K trending searches): use a sliding window heap updated via Kafka consumers. Each partition maintains its own min-heap; a coordinator merges every T seconds. For exact top-K with guaranteed accuracy, use the Count-Min Sketch + heap combination. Space-efficient approximation is O(K log(1/delta) / epsilon^2).

**Follow-up:**
Find the K-th largest element in O(N) average time using Quickselect (partition-based). Quickselect avoids sorting the entire array — partition around a pivot, recurse only into the relevant half.

---

## Problem 9: Sliding Window Maximum

**Problem Statement:**
Given an array and window size K, return the maximum of each sliding window in O(n) time using a monotonic deque.

```go
package main

import "fmt"

func slidingWindowMax(nums []int, k int) []int {
	if len(nums) == 0 || k == 0 {
		return nil
	}

	// deque stores indices; front always has the index of the max for current window
	deque := make([]int, 0, k)
	result := make([]int, 0, len(nums)-k+1)

	for i, v := range nums {
		// Remove indices outside current window
		for len(deque) > 0 && deque[0] < i-k+1 {
			deque = deque[1:]
		}
		// Remove indices whose values are less than current (monotonic decreasing)
		for len(deque) > 0 && nums[deque[len(deque)-1]] < v {
			deque = deque[:len(deque)-1]
		}
		deque = append(deque, i)

		// Window is fully formed
		if i >= k-1 {
			result = append(result, nums[deque[0]])
		}
	}
	return result
}

func main() {
	nums := []int{1, 3, -1, -3, 5, 3, 6, 7}
	k := 3
	fmt.Println(slidingWindowMax(nums, k)) // [3 3 5 5 6 7]
}
```

**Complexity:**
- Time: O(n) — each element is added and removed from the deque at most once
- Space: O(K) for the deque

**How would you scale this?**
For real-time sliding window max over an event stream (e.g., monitoring CPU spikes): use a segment tree or sparse table for static arrays (O(1) query, O(n log n) build). For dynamic streams, maintain the deque in a ring buffer. In distributed systems, each node maintains a local window; a coordinator aggregates with a hierarchical max over node-level results.

**Follow-up:**
Implement sliding window minimum (identical, just reverse the comparison). How would you solve sliding window median? Use two heaps (max-heap for lower half, min-heap for upper half) with balanced sizes. Sliding window median is O(n log k).

---

## Problem 10: Two-Sum with Concurrent Sharding

**Problem Statement:**
Find all pairs in an array that sum to a target. Parallelize by sharding the array across workers; each worker searches its shard against a shared lookup map.

```go
package main

import (
	"fmt"
	"sync"
)

type Pair struct{ A, B int }

func twoSumConcurrent(nums []int, target int, workers int) []Pair {
	// Build lookup: value -> list of indices
	lookup := make(map[int][]int)
	for i, v := range nums {
		lookup[v] = append(lookup[v], i)
	}

	chunkSize := (len(nums) + workers - 1) / workers
	var mu sync.Mutex
	var pairs []Pair
	seen := make(map[Pair]bool)
	var wg sync.WaitGroup

	for w := 0; w < workers; w++ {
		start := w * chunkSize
		end := start + chunkSize
		if end > len(nums) {
			end = len(nums)
		}
		wg.Add(1)
		go func(s, e int) {
			defer wg.Done()
			local := []Pair{}
			for i := s; i < e; i++ {
				complement := target - nums[i]
				if indices, ok := lookup[complement]; ok {
					for _, j := range indices {
						if j <= i {
							continue
						}
						p := Pair{nums[i], nums[j]}
						local = append(local, p)
					}
				}
			}
			mu.Lock()
			for _, p := range local {
				if !seen[p] {
					seen[p] = true
					pairs = append(pairs, p)
				}
			}
			mu.Unlock()
		}(start, end)
	}
	wg.Wait()
	return pairs
}

func main() {
	nums := []int{2, 7, 11, 15, -2, 9, 4, 3}
	target := 9
	pairs := twoSumConcurrent(nums, target, 4)
	fmt.Println("Pairs summing to", target, ":", pairs)
}
```

**Complexity:**
- Time: O(N/W + output) per worker; O(N) total with W workers
- Space: O(N) for the lookup map

**How would you scale this?**
For a stream of numbers arriving in real time, maintain a concurrent hash map with fine-grained sharding (e.g., N shards, each with its own RWMutex). On each new element, look up the complement in the map. This achieves O(1) per insertion and O(1) per query. For distributed two-sum (numbers spread across machines), broadcast each number to a coordinator that holds the complementary half, or use a distributed hash join.

**Follow-up:**
Generalize to 3-Sum: fix one element, run two-sum on the rest. O(N^2) time. Can you parallelize the outer loop? Yes — each goroutine handles a different fixed element. Reduce false sharing by ensuring goroutines write to separate result slices.

---

## Problem 11: Job Scheduler with DAG Dependencies

**Problem Statement:**
Given jobs with dependencies (DAG), schedule and execute them respecting order. Use goroutines for parallelism; topological sort to determine execution order.

```go
package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

type Job struct {
	ID   int
	Name string
	Run  func()
}

type Scheduler struct {
	jobs    map[int]*Job
	deps    map[int][]int // job -> its dependencies
	rdeps   map[int][]int // job -> jobs that depend on it
	inDeg   map[int]int32
}

func NewScheduler() *Scheduler {
	return &Scheduler{
		jobs:  make(map[int]*Job),
		deps:  make(map[int][]int),
		rdeps: make(map[int][]int),
		inDeg: make(map[int]int32),
	}
}

func (s *Scheduler) AddJob(job *Job) {
	s.jobs[job.ID] = job
	if _, ok := s.inDeg[job.ID]; !ok {
		s.inDeg[job.ID] = 0
	}
}

func (s *Scheduler) AddDep(jobID, depID int) {
	s.deps[jobID] = append(s.deps[jobID], depID)
	s.rdeps[depID] = append(s.rdeps[depID], jobID)
	s.inDeg[jobID]++
}

func (s *Scheduler) Run() {
	var wg sync.WaitGroup
	ready := make(chan int, len(s.jobs))
	inDeg := make(map[int]*int32)
	for id, deg := range s.inDeg {
		v := deg
		inDeg[id] = &v
		if deg == 0 {
			ready <- id
		}
	}

	var mu sync.Mutex
	remaining := int32(len(s.jobs))

	var process func(id int)
	process = func(id int) {
		defer wg.Done()
		s.jobs[id].Run()
		mu.Lock()
		dependents := s.rdeps[id]
		mu.Unlock()
		for _, dep := range dependents {
			if atomic.AddInt32(inDeg[dep], -1) == 0 {
				wg.Add(1)
				ready <- dep
			}
		}
		if atomic.AddInt32(&remaining, -1) == 0 {
			close(ready)
		}
	}

	for id := range ready {
		wg.Add(1)
		go process(id)
	}
	wg.Wait()
}

func main() {
	s := NewScheduler()
	jobs := []*Job{
		{1, "A", func() { fmt.Println("Job A done") }},
		{2, "B", func() { fmt.Println("Job B done") }},
		{3, "C", func() { fmt.Println("Job C done") }},
		{4, "D", func() { fmt.Println("Job D done") }},
	}
	for _, j := range jobs {
		s.AddJob(j)
	}
	s.AddDep(2, 1) // B depends on A
	s.AddDep(3, 1) // C depends on A
	s.AddDep(4, 2) // D depends on B
	s.AddDep(4, 3) // D depends on C
	s.Run()
}
```

**Complexity:**
- Time: O(V + E) where V = jobs, E = dependencies (parallel critical path)
- Space: O(V + E) for adjacency lists and in-degree counters

**How would you scale this?**
For distributed job schedulers (Google Borg/Kubernetes): represent the DAG in a persistent store (etcd/Spanner). A central scheduler assigns jobs to worker nodes based on resource availability. Use the actor model (each job is an actor) for distributed execution. Handle failures with job retries and dead-letter queues. For DAGs with millions of nodes, use a streaming topological sort that processes ready jobs as they complete.

**Follow-up:**
Detect cycles in the dependency graph before execution. Perform DFS; if you encounter a GRAY (in-progress) node, a cycle exists. Return the cycle path. How would you handle job priorities? Use a priority queue for the ready channel, ordered by priority.

---

## Problem 12: Consistent Hashing Ring Implementation

**Problem Statement:**
Implement a consistent hashing ring so that adding/removing nodes minimizes key remapping.

```go
package main

import (
	"crypto/sha256"
	"encoding/binary"
	"fmt"
	"sort"
	"sync"
)

type Ring struct {
	mu       sync.RWMutex
	replicas int
	keys     []uint32           // sorted virtual node positions
	ring     map[uint32]string  // position -> node name
}

func NewRing(replicas int) *Ring {
	return &Ring{
		replicas: replicas,
		ring:     make(map[uint32]string),
	}
}

func hashKey(key string) uint32 {
	h := sha256.Sum256([]byte(key))
	return binary.BigEndian.Uint32(h[:4])
}

func (r *Ring) AddNode(node string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	for i := 0; i < r.replicas; i++ {
		h := hashKey(fmt.Sprintf("%s#%d", node, i))
		r.keys = append(r.keys, h)
		r.ring[h] = node
	}
	sort.Slice(r.keys, func(i, j int) bool { return r.keys[i] < r.keys[j] })
}

func (r *Ring) RemoveNode(node string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	for i := 0; i < r.replicas; i++ {
		h := hashKey(fmt.Sprintf("%s#%d", node, i))
		delete(r.ring, h)
		for idx, k := range r.keys {
			if k == h {
				r.keys = append(r.keys[:idx], r.keys[idx+1:]...)
				break
			}
		}
	}
}

func (r *Ring) GetNode(key string) string {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if len(r.keys) == 0 {
		return ""
	}
	h := hashKey(key)
	idx := sort.Search(len(r.keys), func(i int) bool { return r.keys[i] >= h })
	if idx == len(r.keys) {
		idx = 0
	}
	return r.ring[r.keys[idx]]
}

func main() {
	ring := NewRing(150)
	ring.AddNode("server1")
	ring.AddNode("server2")
	ring.AddNode("server3")

	keys := []string{"user:1001", "user:2002", "order:555", "product:99"}
	for _, k := range keys {
		fmt.Printf("%s -> %s\n", k, ring.GetNode(k))
	}

	ring.RemoveNode("server2")
	fmt.Println("\nAfter removing server2:")
	for _, k := range keys {
		fmt.Printf("%s -> %s\n", k, ring.GetNode(k))
	}
}
```

**Complexity:**
- AddNode/RemoveNode: O(R log R) where R = total virtual nodes
- GetNode: O(log R) binary search
- Space: O(N * replicas)

**How would you scale this?**
Consistent hashing is foundational to Amazon Dynamo, Cassandra, and Memcached. For production: use 150-200 virtual nodes per physical node to achieve uniform distribution. Integrate with service discovery (etcd/Consul) so the ring updates when nodes join/leave. For replication, GetNode returns the next N nodes clockwise — the replication factor. Handle node failure by redirecting to the next node in the ring (hinted handoff).

**Follow-up:**
Implement bounded-load consistent hashing (Google's approach) to prevent hot spots. Each node tracks its load; if the target node exceeds 1+epsilon times the average load, route to the next node in the ring. This bounds the maximum load to O(log N / N) imbalance.

---

## Problem 13: K-Way Merge Using Min-Heap + Channels

**Problem Statement:**
Merge K sorted lists (or streams) into one sorted stream using a min-heap with channels for the goroutine pipeline pattern.

```go
package main

import (
	"container/heap"
	"fmt"
)

type Item struct {
	val      int
	listIdx  int
	elemIdx  int
}

type ItemHeap []Item

func (h ItemHeap) Len() int            { return len(h) }
func (h ItemHeap) Less(i, j int) bool  { return h[i].val < h[j].val }
func (h ItemHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *ItemHeap) Push(x interface{}) { *h = append(*h, x.(Item)) }
func (h *ItemHeap) Pop() interface{} {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[:n-1]
	return x
}

func kWayMerge(lists [][]int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		h := &ItemHeap{}
		heap.Init(h)
		for i, list := range lists {
			if len(list) > 0 {
				heap.Push(h, Item{list[0], i, 0})
			}
		}
		for h.Len() > 0 {
			item := heap.Pop(h).(Item)
			out <- item.val
			next := item.elemIdx + 1
			if next < len(lists[item.listIdx]) {
				heap.Push(h, Item{lists[item.listIdx][next], item.listIdx, next})
			}
		}
	}()
	return out
}

func main() {
	lists := [][]int{
		{1, 4, 7, 10},
		{2, 5, 8, 11},
		{3, 6, 9, 12},
	}
	ch := kWayMerge(lists)
	for v := range ch {
		fmt.Printf("%d ", v)
	}
	fmt.Println()
}
```

**Complexity:**
- Time: O(N log K) where N = total elements, K = number of lists
- Space: O(K) for the heap

**How would you scale this?**
K-way merge is the core of external sort. For a 1 TB file: split into chunks that fit in RAM, sort each chunk, write to disk. Then K-way merge across K sorted file handles using a min-heap. This is O(N log K) with K = number of sorted runs. In distributed systems (Hadoop MergeSort), each reducer receives sorted partitions from multiple mappers; it K-way merges them. Parallelize the merge by splitting by value range — shard into buckets, sort each bucket independently.

**Follow-up:**
How would you merge K sorted linked lists? Same approach, but instead of (listIdx, elemIdx), store the current linked list node pointer. Replace array access with node pointer advancement. What if the lists are infinite (from network streams)? Use `chan int` per stream and a heap keyed on the latest value from each stream. Block on the next value only when that stream's current value is popped.

---

## Problem 14: Concurrent Fibonacci with Memoization

**Problem Statement:**
Compute Fibonacci numbers concurrently with memoization, ensuring each value is computed exactly once even under concurrent requests (using singleflight pattern).

```go
package main

import (
	"fmt"
	"sync"
)

type call struct {
	wg  sync.WaitGroup
	val int
}

type FibCache struct {
	mu    sync.Mutex
	calls map[int]*call
}

func NewFibCache() *FibCache {
	return &FibCache{calls: make(map[int]*call)}
}

func (fc *FibCache) Fib(n int) int {
	fc.mu.Lock()
	if c, ok := fc.calls[n]; ok {
		fc.mu.Unlock()
		c.wg.Wait()
		return c.val
	}
	c := &call{}
	c.wg.Add(1)
	fc.calls[n] = c
	fc.mu.Unlock()

	if n <= 1 {
		c.val = n
	} else {
		// Compute both halves; can be parallelized for large n
		var wg sync.WaitGroup
		var a, b int
		wg.Add(2)
		go func() { defer wg.Done(); a = fc.Fib(n - 1) }()
		go func() { defer wg.Done(); b = fc.Fib(n - 2) }()
		wg.Wait()
		c.val = a + b
	}
	c.wg.Done()
	return c.val
}

func main() {
	fc := NewFibCache()
	var wg sync.WaitGroup
	for _, n := range []int{10, 10, 15, 20, 10, 15} {
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			fmt.Printf("Fib(%d) = %d\n", n, fc.Fib(n))
		}(n)
	}
	wg.Wait()
}
```

**Complexity:**
- Time: O(N) unique computations; O(1) for cached lookups
- Space: O(N) memoization table + O(N) goroutine stack depth (risk of goroutine explosion for large N)

**How would you scale this?**
For large N (e.g., N=1,000,000), goroutine-per-subtree causes stack overflow. Use iterative DP instead. For distributed memoization (shared across services): store Fib(n) in Redis. Use the singleflight package (`golang.org/x/sync/singleflight`) to suppress duplicate in-flight requests. The singleflight pattern is used in production for cache stampede prevention.

**Follow-up:**
Compute Fib(N) in O(log N) time using matrix exponentiation. The key identity: `[[1,1],[1,0]]^n = [[Fib(n+1), Fib(n)], [Fib(n), Fib(n-1)]]`. Fast matrix exponentiation via repeated squaring gives O(log N) multiplications, each O(1) for 2x2 matrices.

---

## Problem 15: Real-Time Leaderboard with Sorted Set

**Problem Statement:**
Implement a leaderboard that supports: UpdateScore, GetRank, GetTopK — all with low latency under concurrent updates.

```go
package main

import (
	"fmt"
	"sort"
	"sync"
)

type Player struct {
	Name  string
	Score int
}

type Leaderboard struct {
	mu      sync.RWMutex
	scores  map[string]int
	sorted  []Player
	dirty   bool
}

func NewLeaderboard() *Leaderboard {
	return &Leaderboard{scores: make(map[string]int)}
}

func (lb *Leaderboard) UpdateScore(name string, delta int) {
	lb.mu.Lock()
	defer lb.mu.Unlock()
	lb.scores[name] += delta
	lb.dirty = true
}

func (lb *Leaderboard) rebuild() {
	if !lb.dirty {
		return
	}
	lb.sorted = lb.sorted[:0]
	for name, score := range lb.scores {
		lb.sorted = append(lb.sorted, Player{name, score})
	}
	sort.Slice(lb.sorted, func(i, j int) bool {
		return lb.sorted[i].Score > lb.sorted[j].Score
	})
	lb.dirty = false
}

func (lb *Leaderboard) GetRank(name string) int {
	lb.mu.Lock()
	defer lb.mu.Unlock()
	lb.rebuild()
	for i, p := range lb.sorted {
		if p.Name == name {
			return i + 1
		}
	}
	return -1
}

func (lb *Leaderboard) GetTopK(k int) []Player {
	lb.mu.Lock()
	defer lb.mu.Unlock()
	lb.rebuild()
	if k > len(lb.sorted) {
		k = len(lb.sorted)
	}
	result := make([]Player, k)
	copy(result, lb.sorted[:k])
	return result
}

func main() {
	lb := NewLeaderboard()
	players := []struct{ name string; score int }{
		{"Alice", 100}, {"Bob", 200}, {"Charlie", 150}, {"Dave", 80}, {"Eve", 175},
	}
	var wg sync.WaitGroup
	for _, p := range players {
		wg.Add(1)
		go func(name string, score int) {
			defer wg.Done()
			lb.UpdateScore(name, score)
		}(p.name, p.score)
	}
	wg.Wait()

	fmt.Println("Top 3:", lb.GetTopK(3))
	fmt.Println("Alice's rank:", lb.GetRank("Alice"))
	lb.UpdateScore("Alice", 150)
	fmt.Println("After update, Top 3:", lb.GetTopK(3))
}
```

**Complexity:**
- UpdateScore: O(1) amortized (lazy rebuild)
- GetTopK / GetRank: O(N log N) on first call after update; O(K) / O(N) if sorted is clean
- Space: O(N)

**How would you scale this?**
Redis Sorted Sets (`ZADD`, `ZRANK`, `ZRANGE`) are the standard solution for production leaderboards. They support O(log N) updates and rank queries. For global leaderboards at Google scale: shard by score range across Redis instances. Use approximate ranking with Count-Min Sketch for near-real-time global ranks without full sort. Periodically reconstruct the full leaderboard in a background job.

**Follow-up:**
Implement a time-windowed leaderboard (e.g., "top players this week"). Maintain separate score maps per time bucket; on GetTopK, aggregate across active buckets. How would you handle score ties with secondary sort (e.g., time of achieving score)? Store (score, -timestamp) as the sort key.

---

## Problem 16: Interval Merging at Scale

**Problem Statement:**
Merge overlapping intervals from a large input. Support concurrent insertion of new intervals and on-demand merge queries.

```go
package main

import (
	"fmt"
	"sort"
	"sync"
)

type Interval struct{ Start, End int }

type IntervalSet struct {
	mu        sync.RWMutex
	intervals []Interval
}

func (s *IntervalSet) Add(iv Interval) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.intervals = append(s.intervals, iv)
}

func (s *IntervalSet) Merge() []Interval {
	s.mu.RLock()
	cp := make([]Interval, len(s.intervals))
	copy(cp, s.intervals)
	s.mu.RUnlock()

	if len(cp) == 0 {
		return nil
	}
	sort.Slice(cp, func(i, j int) bool {
		return cp[i].Start < cp[j].Start
	})

	merged := []Interval{cp[0]}
	for _, iv := range cp[1:] {
		last := &merged[len(merged)-1]
		if iv.Start <= last.End {
			if iv.End > last.End {
				last.End = iv.End
			}
		} else {
			merged = append(merged, iv)
		}
	}
	return merged
}

func (s *IntervalSet) InsertAndMerge(newIV Interval) []Interval {
	s.Add(newIV)
	return s.Merge()
}

func main() {
	s := &IntervalSet{}
	initial := []Interval{{1, 3}, {2, 6}, {8, 10}, {15, 18}}
	var wg sync.WaitGroup
	for _, iv := range initial {
		wg.Add(1)
		go func(i Interval) {
			defer wg.Done()
			s.Add(i)
		}(iv)
	}
	wg.Wait()

	fmt.Println("Merged:", s.Merge()) // [{1 6} {8 10} {15 18}]

	result := s.InsertAndMerge(Interval{9, 16})
	fmt.Println("After inserting [9,16]:", result) // [{1 6} {8 18}]
}
```

**Complexity:**
- Add: O(1) amortized
- Merge: O(N log N) for sort + O(N) scan
- Space: O(N)

**How would you scale this?**
For a calendar scheduling system serving millions of events: index intervals in a segment tree or interval tree for O(log N) overlap queries. For batch merging, use an external sort on start times followed by a single-pass merge — handles datasets larger than RAM. In distributed systems, partition by time range across nodes; merge within partitions is independent; a coordinator merges the boundary intervals across partitions.

**Follow-up:**
Find all intervals that overlap with a query interval [L, R]. Use an interval tree (augmented BST where each node stores the max endpoint in its subtree) for O(log N + K) query time, K = number of overlapping results. How would you track coverage (total length covered by merged intervals)? Sum (End - Start) for each merged interval.

---

## Problem 17: Copy-on-Write Data Structure

**Problem Statement:**
Implement a copy-on-write (COW) slice that allows multiple readers to see a consistent snapshot while a writer atomically replaces the underlying slice.

```go
package main

import (
	"fmt"
	"sync"
	"sync/atomic"
	"unsafe"
)

type COWSlice struct {
	ptr atomic.Pointer[[]int]
	mu  sync.Mutex // serializes writers
}

func NewCOWSlice(initial []int) *COWSlice {
	c := &COWSlice{}
	cp := make([]int, len(initial))
	copy(cp, initial)
	c.ptr.Store(&cp)
	return c
}

// Read — zero-lock fast path via atomic pointer load
func (c *COWSlice) Read() []int {
	return *c.ptr.Load()
}

// Append — copy current slice, append, atomically swap
func (c *COWSlice) Append(vals ...int) {
	c.mu.Lock()
	defer c.mu.Unlock()
	old := *c.ptr.Load()
	newSlice := make([]int, len(old)+len(vals))
	copy(newSlice, old)
	copy(newSlice[len(old):], vals)
	c.ptr.Store(&newSlice)
}

// Update — copy-on-write modification at index
func (c *COWSlice) Update(idx, val int) {
	c.mu.Lock()
	defer c.mu.Unlock()
	old := *c.ptr.Load()
	newSlice := make([]int, len(old))
	copy(newSlice, old)
	newSlice[idx] = val
	c.ptr.Store(&newSlice)
}

// Demonstrate that _ avoids "imported and not used" for unsafe in demo only
var _ = unsafe.Sizeof(0)

func main() {
	cow := NewCOWSlice([]int{1, 2, 3})

	var wg sync.WaitGroup
	// Multiple concurrent readers
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			snapshot := cow.Read()
			fmt.Println("Read snapshot:", snapshot)
		}()
	}
	// Concurrent writer
	wg.Add(1)
	go func() {
		defer wg.Done()
		cow.Append(4, 5)
		fmt.Println("After append:", cow.Read())
	}()
	wg.Wait()
}
```

**Complexity:**
- Read: O(1) — single atomic pointer load, no locks
- Append/Update: O(N) — full slice copy per write
- Space: O(N) per snapshot (old and new coexist briefly during swap)

**How would you scale this?**
COW is used in Linux kernel (fork uses COW pages), Go's sync/Map internally, and ZFS (COW filesystem). For large structures where full copy is expensive: use persistent/functional data structures (e.g., persistent tries, HAMT) where sharing of unmodified subtrees gives O(log N) write with O(1) read. Docker layers use COW filesystem overlays for container images.

**Follow-up:**
Implement a COW map using `sync/atomic` and `unsafe.Pointer` (or `atomic.Pointer[map[K]V]`). On write, lock, copy the map, mutate the copy, swap the pointer. How does this compare to `sync.RWMutex`? COW is better when reads vastly outnumber writes (e.g., config hot-reload); RWMutex is better for balanced read/write ratios since it avoids full copy overhead.

---

## Problem 18: Lock-Free Queue Implementation

**Problem Statement:**
Implement a lock-free MPMC (multi-producer, multi-consumer) queue using `sync/atomic` and compare-and-swap (CAS).

```go
package main

import (
	"fmt"
	"sync"
	"sync/atomic"
	"unsafe"
)

type node struct {
	val  interface{}
	next unsafe.Pointer
}

type LockFreeQueue struct {
	head unsafe.Pointer
	tail unsafe.Pointer
}

func NewLockFreeQueue() *LockFreeQueue {
	sentinel := &node{}
	p := unsafe.Pointer(sentinel)
	return &LockFreeQueue{head: p, tail: p}
}

func (q *LockFreeQueue) Enqueue(val interface{}) {
	n := &node{val: val}
	np := unsafe.Pointer(n)
	for {
		tail := atomic.LoadPointer(&q.tail)
		tailNode := (*node)(tail)
		next := atomic.LoadPointer(&tailNode.next)
		if tail == atomic.LoadPointer(&q.tail) {
			if next == nil {
				if atomic.CompareAndSwapPointer(&tailNode.next, nil, np) {
					atomic.CompareAndSwapPointer(&q.tail, tail, np)
					return
				}
			} else {
				// Tail is behind; advance it
				atomic.CompareAndSwapPointer(&q.tail, tail, next)
			}
		}
	}
}

func (q *LockFreeQueue) Dequeue() (interface{}, bool) {
	for {
		head := atomic.LoadPointer(&q.head)
		tail := atomic.LoadPointer(&q.tail)
		headNode := (*node)(head)
		next := atomic.LoadPointer(&headNode.next)
		if head == atomic.LoadPointer(&q.head) {
			if head == tail {
				if next == nil {
					return nil, false // empty
				}
				atomic.CompareAndSwapPointer(&q.tail, tail, next)
			} else {
				val := (*node)(next).val
				if atomic.CompareAndSwapPointer(&q.head, head, next) {
					return val, true
				}
			}
		}
	}
}

func main() {
	q := NewLockFreeQueue()
	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func(v int) {
			defer wg.Done()
			q.Enqueue(v)
		}(i)
	}
	wg.Wait()

	for {
		v, ok := q.Dequeue()
		if !ok {
			break
		}
		fmt.Println("Dequeued:", v)
	}
}
```

**Complexity:**
- Enqueue/Dequeue: O(1) amortized (bounded CAS retries under contention)
- Space: O(N) for N enqueued items

**How would you scale this?**
This is the Michael-Scott queue algorithm. Lock-free queues eliminate mutex contention in high-throughput pipelines. In Go, `chan` is implemented with a hybrid lock-free ring buffer + mutex fallback. For extreme throughput (LMAX Disruptor-style), use a lock-free ring buffer with power-of-2 size, cache-line-padded slots, and sequence numbers — avoids CAS retries entirely with a single writer.

**Follow-up:**
What is the ABA problem in CAS-based structures? Thread 1 reads pointer P with value A; thread 2 changes A→B→A; thread 1's CAS succeeds even though the node changed. Solution: tagged pointers (embed a version counter in the pointer's unused bits) or hazard pointers to safely reclaim memory. In Go, GC eliminates the ABA memory reclamation problem but not the logical ABA issue.

---

## Problem 19: Bloom Filter in Go

**Problem Statement:**
Implement a Bloom filter for approximate set membership queries with configurable false-positive rate.

```go
package main

import (
	"fmt"
	"hash/fnv"
	"math"
)

type BloomFilter struct {
	bits    []bool
	numHash int
	m       uint // bit array size
}

// NewBloomFilter creates a filter for n expected items with false positive rate p
func NewBloomFilter(n int, p float64) *BloomFilter {
	m := uint(math.Ceil(-float64(n) * math.Log(p) / (math.Log(2) * math.Log(2))))
	k := int(math.Round(float64(m) / float64(n) * math.Log(2)))
	return &BloomFilter{
		bits:    make([]bool, m),
		numHash: k,
		m:       m,
	}
}

func (bf *BloomFilter) hashes(item string) []uint {
	result := make([]uint, bf.numHash)
	h1 := fnv.New64()
	h1.Write([]byte(item))
	v1 := h1.Sum64()

	h2 := fnv.New64a()
	h2.Write([]byte(item))
	v2 := h2.Sum64()

	for i := range result {
		// Kirsch-Mitzenmacher optimization: h_i = h1 + i*h2
		result[i] = uint(v1+uint64(i)*v2) % bf.m
	}
	return result
}

func (bf *BloomFilter) Add(item string) {
	for _, h := range bf.hashes(item) {
		bf.bits[h] = true
	}
}

func (bf *BloomFilter) MayContain(item string) bool {
	for _, h := range bf.hashes(item) {
		if !bf.bits[h] {
			return false // definitely not in set
		}
	}
	return true // probably in set
}

func (bf *BloomFilter) FalsePositiveRate(n int) float64 {
	// Estimated FP rate after n insertions
	k := float64(bf.numHash)
	m := float64(bf.m)
	return math.Pow(1-math.Exp(-k*float64(n)/m), k)
}

func main() {
	bf := NewBloomFilter(1000, 0.01) // 1000 items, 1% false positive rate
	words := []string{"apple", "banana", "cherry", "date", "elderberry"}
	for _, w := range words {
		bf.Add(w)
	}

	tests := []string{"apple", "banana", "fig", "grape", "cherry"}
	for _, t := range tests {
		fmt.Printf("MayContain(%q): %v\n", t, bf.MayContain(t))
	}
	fmt.Printf("Estimated FP rate at 5 insertions: %.4f\n", bf.FalsePositiveRate(5))
	fmt.Printf("Bit array size: %d bits (%.1f KB)\n", bf.m, float64(bf.m)/8/1024)
}
```

**Complexity:**
- Add/MayContain: O(k) where k = number of hash functions (typically 7-10)
- Space: O(m) bits — m ≈ -n*ln(p) / ln(2)^2; for 1M items at 1% FP rate: ~1.14 MB

**How would you scale this?**
Google uses Bloom filters in BigTable to avoid disk lookups for non-existent keys. Cassandra uses them per SSTable. For distributed Bloom filters: each node maintains its own filter; queries are sent to all nodes; union of results. For streaming data with changing membership, use a Counting Bloom Filter (replace bits with counters) to support deletion. For time-windowed filters, use Rotating Bloom Filters (two filters, periodically clear and swap).

**Follow-up:**
What is the optimal number of hash functions k = (m/n) * ln(2)? How do you size m given n and desired FP rate p? m = -n * ln(p) / (ln(2))^2. How would you implement a thread-safe Bloom filter? Use `sync/atomic` with a uint64 bit array and atomic OR operations, or use a mutex around Add operations (MayContain is read-only so RLock suffices).

---

## Problem 20: Skip List Implementation

**Problem Statement:**
Implement a skip list — a probabilistic data structure supporting O(log N) search, insert, and delete with concurrent reads.

```go
package main

import (
	"fmt"
	"math"
	"math/rand"
)

const maxLevel = 16
const probability = 0.5

type SkipNode struct {
	key     int
	val     interface{}
	forward []*SkipNode
}

type SkipList struct {
	head    *SkipNode
	level   int
	length  int
}

func newNode(key int, val interface{}, level int) *SkipNode {
	return &SkipNode{
		key:     key,
		val:     val,
		forward: make([]*SkipNode, level),
	}
}

func NewSkipList() *SkipList {
	head := newNode(math.MinInt32, nil, maxLevel)
	return &SkipList{head: head, level: 1}
}

func (sl *SkipList) randomLevel() int {
	level := 1
	for rand.Float64() < probability && level < maxLevel {
		level++
	}
	return level
}

func (sl *SkipList) Search(key int) (interface{}, bool) {
	cur := sl.head
	for i := sl.level - 1; i >= 0; i-- {
		for cur.forward[i] != nil && cur.forward[i].key < key {
			cur = cur.forward[i]
		}
	}
	cur = cur.forward[0]
	if cur != nil && cur.key == key {
		return cur.val, true
	}
	return nil, false
}

func (sl *SkipList) Insert(key int, val interface{}) {
	update := make([]*SkipNode, maxLevel)
	cur := sl.head
	for i := sl.level - 1; i >= 0; i-- {
		for cur.forward[i] != nil && cur.forward[i].key < key {
			cur = cur.forward[i]
		}
		update[i] = cur
	}
	cur = cur.forward[0]
	if cur != nil && cur.key == key {
		cur.val = val
		return
	}
	newLevel := sl.randomLevel()
	if newLevel > sl.level {
		for i := sl.level; i < newLevel; i++ {
			update[i] = sl.head
		}
		sl.level = newLevel
	}
	n := newNode(key, val, newLevel)
	for i := 0; i < newLevel; i++ {
		n.forward[i] = update[i].forward[i]
		update[i].forward[i] = n
	}
	sl.length++
}

func (sl *SkipList) Delete(key int) bool {
	update := make([]*SkipNode, maxLevel)
	cur := sl.head
	for i := sl.level - 1; i >= 0; i-- {
		for cur.forward[i] != nil && cur.forward[i].key < key {
			cur = cur.forward[i]
		}
		update[i] = cur
	}
	cur = cur.forward[0]
	if cur == nil || cur.key != key {
		return false
	}
	for i := 0; i < sl.level; i++ {
		if update[i].forward[i] != cur {
			break
		}
		update[i].forward[i] = cur.forward[i]
	}
	for sl.level > 1 && sl.head.forward[sl.level-1] == nil {
		sl.level--
	}
	sl.length--
	return true
}

func (sl *SkipList) Range(lo, hi int) []int {
	var result []int
	cur := sl.head.forward[0]
	for cur != nil && cur.key <= hi {
		if cur.key >= lo {
			result = append(result, cur.key)
		}
		cur = cur.forward[0]
	}
	return result
}

func main() {
	sl := NewSkipList()
	keys := []int{3, 6, 7, 9, 12, 19, 17, 26, 21, 25}
	for _, k := range keys {
		sl.Insert(k, k*10)
	}

	v, ok := sl.Search(19)
	fmt.Printf("Search(19): val=%v, found=%v\n", v, ok)

	fmt.Println("Range [7, 21]:", sl.Range(7, 21))

	sl.Delete(19)
	_, ok = sl.Search(19)
	fmt.Println("After delete, Search(19):", ok)

	fmt.Printf("Length: %d, Levels: %d\n", sl.length, sl.level)
}
```

**Complexity:**
- Search/Insert/Delete: O(log N) expected
- Space: O(N log N) expected (due to multiple forward pointers)

**How would you scale this?**
Redis Sorted Sets are implemented as skip lists. For concurrent skip lists: use lock-free techniques with CAS per level pointer (the Java ConcurrentSkipListMap does this). For distributed sorted sets: partition by key range; each node owns a contiguous range and is itself a skip list. Range queries that span partitions are assembled by a coordinator. For persistent skip lists, write-ahead log (WAL) each Insert/Delete before modifying memory.

**Follow-up:**
How does a skip list compare to a balanced BST (red-black tree, AVL tree)? Skip list has simpler implementation, easier concurrent access (lock per level vs rebalancing locks), and comparable O(log N) performance. Red-black trees have better worst-case guarantees (skip lists are probabilistic). How would you make the skip list concurrent? Use read locks for Search, write locks per update level, or use a fully lock-free approach with CAS pointers at each level.

---

## Summary Table

| # | Problem | Core Data Structure | Time Complexity | Key Go Feature |
|---|---------|--------------------|-----------------|-|
| 1 | Concurrent Merge Sort | Divide & Conquer | O(n log n) | goroutines + WaitGroup |
| 2 | LRU Cache | DLL + HashMap | O(1) | sync.RWMutex |
| 3 | Rate Limiter | Token Bucket | O(1) | sync.Mutex + time |
| 4 | Word Frequency | HashMap + Pipeline | O(N/W) | channels + WaitGroup |
| 5 | Pub-Sub | Buffered Channels | O(S) | select + channels |
| 6 | Trie | 26-ary Tree | O(L) | structs + recursion |
| 7 | Concurrent BFS | Queue + sync.Map | O(V+E) | sync.Map + WaitGroup |
| 8 | Top-K Pipeline | Min-Heap + Pipeline | O(N log K / W) | container/heap + channels |
| 9 | Sliding Window Max | Monotonic Deque | O(n) | slice as deque |
| 10 | Two-Sum Sharded | HashMap | O(N/W) | goroutines + sync.Mutex |
| 11 | Job Scheduler DAG | Topological Sort | O(V+E) | atomic + channels |
| 12 | Consistent Hashing | Sorted Ring | O(log R) | crypto/sha256 + sort |
| 13 | K-Way Merge | Min-Heap + Channels | O(N log K) | container/heap + chan |
| 14 | Fibonacci Memoization | Singleflight | O(N) | sync.WaitGroup + map |
| 15 | Leaderboard | Sorted Slice | O(N log N) | sync.RWMutex + sort |
| 16 | Interval Merging | Sorted Intervals | O(N log N) | sync.RWMutex |
| 17 | Copy-on-Write Slice | Atomic Pointer | O(N) write, O(1) read | atomic.Pointer |
| 18 | Lock-Free Queue | Michael-Scott Queue | O(1) amortized | sync/atomic + unsafe |
| 19 | Bloom Filter | Bit Array | O(k) | hash/fnv |
| 20 | Skip List | Probabilistic BST | O(log N) expected | structs + random |

---

> © 2024 Gaurav Patil — GoForge Platform. All rights reserved.
