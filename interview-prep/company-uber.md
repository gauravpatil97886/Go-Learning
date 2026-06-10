> © 2024 Gaurav Patil — GoForge Platform. All rights reserved.

# Uber-Style Go Interview Questions

25 problems focused on: real-time systems, geospatial, rate limiting, surge pricing, reliability.
For each: problem statement → complete Go implementation → production notes → edge cases.

---

## Problem 1: Ride-Matching System

**Problem Statement:**
Match a rider's request to the nearest available driver. Maintain a pool of available drivers. On a ride request, find the closest driver and assign them atomically to prevent double-booking.

**Go Implementation:**

```go
package main

import (
	"fmt"
	"math"
	"sync"
)

type Location struct {
	Lat, Lng float64
}

type Driver struct {
	ID       string
	Location Location
	mu       sync.Mutex
	busy     bool
}

type RideMatchingSystem struct {
	mu      sync.RWMutex
	drivers map[string]*Driver
}

func NewRideMatchingSystem() *RideMatchingSystem {
	return &RideMatchingSystem{drivers: make(map[string]*Driver)}
}

func haversine(a, b Location) float64 {
	const R = 6371.0
	dLat := (b.Lat - a.Lat) * math.Pi / 180
	dLng := (b.Lng - a.Lng) * math.Pi / 180
	lat1 := a.Lat * math.Pi / 180
	lat2 := b.Lat * math.Pi / 180
	x := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1)*math.Cos(lat2)*math.Sin(dLng/2)*math.Sin(dLng/2)
	return 2 * R * math.Atan2(math.Sqrt(x), math.Sqrt(1-x))
}

func (s *RideMatchingSystem) AddDriver(d *Driver) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.drivers[d.ID] = d
}

func (s *RideMatchingSystem) Match(riderLoc Location) *Driver {
	s.mu.RLock()
	drivers := make([]*Driver, 0, len(s.drivers))
	for _, d := range s.drivers {
		drivers = append(drivers, d)
	}
	s.mu.RUnlock()

	var bestDriver *Driver
	bestDist := math.MaxFloat64

	for _, d := range drivers {
		d.mu.Lock()
		if d.busy {
			d.mu.Unlock()
			continue
		}
		dist := haversine(riderLoc, d.Location)
		if dist < bestDist {
			if bestDriver != nil {
				bestDriver.mu.Unlock()
			}
			bestDist = dist
			bestDriver = d
			// Keep lock held on bestDriver
		} else {
			d.mu.Unlock()
		}
	}

	if bestDriver != nil {
		bestDriver.busy = true
		bestDriver.mu.Unlock()
	}
	return bestDriver
}

func (s *RideMatchingSystem) ReleaseDriver(driverID string) {
	s.mu.RLock()
	d, ok := s.drivers[driverID]
	s.mu.RUnlock()
	if ok {
		d.mu.Lock()
		d.busy = false
		d.mu.Unlock()
	}
}

func main() {
	sys := NewRideMatchingSystem()
	sys.AddDriver(&Driver{ID: "D1", Location: Location{37.7749, -122.4194}})
	sys.AddDriver(&Driver{ID: "D2", Location: Location{37.7751, -122.4185}})
	sys.AddDriver(&Driver{ID: "D3", Location: Location{37.7740, -122.4200}})

	rider := Location{37.7750, -122.4190}
	driver := sys.Match(rider)
	if driver != nil {
		fmt.Printf("Matched rider to driver: %s\n", driver.ID)
	}

	// Try matching again — D1 should be busy now
	driver2 := sys.Match(rider)
	if driver2 != nil {
		fmt.Printf("Second match: %s\n", driver2.ID)
	}
}
```

**Production Notes:**
- Use a spatial index (quadtree, geohash grid) to avoid O(N) linear scan per ride request. Uber uses S2 geometry cells internally.
- Driver locations update at ~4 Hz via WebSocket; use a write-optimised spatial store such as Redis GEO commands (`GEOADD`, `GEORADIUS`).
- Atomic assignment across multiple dispatch servers requires a distributed lock or Redis `SETNX` to prevent double-booking.
- At scale: partition geographic regions; each region has its own dispatch service. Cross-region fallback is handled by a coordinator.
- Real Uber uses a combination of H3 hexagonal grid indexing and a custom Go dispatch service.

**Edge Cases:**
- All drivers busy: `Match` returns `nil`; caller must enqueue the request and retry.
- Two concurrent requests for the same driver: the per-driver mutex ensures only one wins.
- Driver goes offline between scan and lock: add an `online` field and check it under the driver mutex.

---

## Problem 2: Geo-Fence Checker

**Problem Statement:**
Given a set of polygonal geo-fences (city boundaries, surge zones), determine which fences a given coordinate falls inside. Support concurrent fence registration and point-in-polygon queries.

**Go Implementation:**

```go
package main

import (
	"fmt"
	"sync"
)

type Point struct{ X, Y float64 }

type GeoFence struct {
	ID      string
	Polygon []Point
}

// Ray-casting algorithm: odd number of crossings means inside.
func (f *GeoFence) Contains(p Point) bool {
	inside := false
	n := len(f.Polygon)
	j := n - 1
	for i := 0; i < n; i++ {
		vi, vj := f.Polygon[i], f.Polygon[j]
		if ((vi.Y > p.Y) != (vj.Y > p.Y)) &&
			(p.X < (vj.X-vi.X)*(p.Y-vi.Y)/(vj.Y-vi.Y)+vi.X) {
			inside = !inside
		}
		j = i
	}
	return inside
}

type GeoFenceRegistry struct {
	mu     sync.RWMutex
	fences map[string]*GeoFence
}

func NewGeoFenceRegistry() *GeoFenceRegistry {
	return &GeoFenceRegistry{fences: make(map[string]*GeoFence)}
}

func (r *GeoFenceRegistry) Register(f *GeoFence) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.fences[f.ID] = f
}

func (r *GeoFenceRegistry) Deregister(id string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.fences, id)
}

func (r *GeoFenceRegistry) Query(p Point) []string {
	r.mu.RLock()
	fences := make([]*GeoFence, 0, len(r.fences))
	for _, f := range r.fences {
		fences = append(fences, f)
	}
	r.mu.RUnlock()

	var wg sync.WaitGroup
	var mu sync.Mutex
	var matches []string

	for _, f := range fences {
		f := f
		wg.Add(1)
		go func() {
			defer wg.Done()
			if f.Contains(p) {
				mu.Lock()
				matches = append(matches, f.ID)
				mu.Unlock()
			}
		}()
	}
	wg.Wait()
	return matches
}

func main() {
	r := NewGeoFenceRegistry()
	r.Register(&GeoFence{
		ID:      "downtown",
		Polygon: []Point{{0, 0}, {10, 0}, {10, 10}, {0, 10}},
	})
	r.Register(&GeoFence{
		ID:      "surge-zone",
		Polygon: []Point{{5, 5}, {15, 5}, {15, 15}, {5, 15}},
	})

	fmt.Println("Fences containing (7,7):", r.Query(Point{7, 7}))
	fmt.Println("Fences containing (2,2):", r.Query(Point{2, 2}))
	fmt.Println("Fences containing (12,12):", r.Query(Point{12, 12}))
}
```

**Production Notes:**
- Pre-filter with a bounding-box check before the expensive ray-casting to skip obviously non-matching fences.
- Use an R-tree or geohash grid for spatial indexing to achieve O(log N) queries instead of O(N).
- Uber's geo-fence checker processes ~1M events per second; implemented in Go with pre-compiled fence geometry.
- For real-time surge zone updates, publish fence changes via Kafka so all query nodes reload atomically.
- Handle anti-meridian crossings (fences spanning ±180° longitude) with coordinate normalisation before indexing.

**Edge Cases:**
- Point exactly on a polygon edge: ray-casting gives an implementation-defined result; add an explicit edge check if needed.
- Degenerate polygon (fewer than 3 vertices): validate at registration time and return an error.
- Very large polygons (continent-scale): split into smaller tiles at registration to keep per-query computation bounded.

---

## Problem 3: Surge Pricing Calculator with Concurrent Price Updates

**Problem Statement:**
Calculate dynamic surge multipliers based on supply (available drivers) and demand (pending requests) in a geographic cell. Support high-frequency concurrent updates from many goroutines.

**Go Implementation:**

```go
package main

import (
	"fmt"
	"math"
	"sync"
	"sync/atomic"
	"time"
)

type Cell struct {
	ID      string
	drivers int64 // updated atomically
	riders  int64 // updated atomically
}

type SurgePricingEngine struct {
	mu    sync.RWMutex
	cells map[string]*Cell
}

func NewSurgePricingEngine() *SurgePricingEngine {
	return &SurgePricingEngine{cells: make(map[string]*Cell)}
}

func (e *SurgePricingEngine) getOrCreate(cellID string) *Cell {
	e.mu.RLock()
	c, ok := e.cells[cellID]
	e.mu.RUnlock()
	if ok {
		return c
	}
	e.mu.Lock()
	defer e.mu.Unlock()
	if c, ok = e.cells[cellID]; ok {
		return c
	}
	c = &Cell{ID: cellID}
	e.cells[cellID] = c
	return c
}

func (e *SurgePricingEngine) UpdateDriverCount(cellID string, delta int64) {
	atomic.AddInt64(&e.getOrCreate(cellID).drivers, delta)
}

func (e *SurgePricingEngine) UpdateRiderCount(cellID string, delta int64) {
	atomic.AddInt64(&e.getOrCreate(cellID).riders, delta)
}

// Multiplier: 1.0x base, logarithmic growth with demand/supply ratio, max 5.0x.
func (e *SurgePricingEngine) GetMultiplier(cellID string) float64 {
	c := e.getOrCreate(cellID)
	drivers := float64(atomic.LoadInt64(&c.drivers))
	riders := float64(atomic.LoadInt64(&c.riders))

	if drivers <= 0 {
		return 5.0
	}
	ratio := riders / drivers
	if ratio <= 1.0 {
		return 1.0
	}
	// Logarithmic surge: smoother than linear, avoids 10x spikes.
	multiplier := 1.0 + math.Log(ratio)*0.5
	if multiplier > 5.0 {
		multiplier = 5.0
	}
	return math.Round(multiplier*4) / 4 // round to nearest 0.25x
}

// StartDecay reduces unmatched demand by 10% every interval (models timed-out riders).
func (e *SurgePricingEngine) StartDecay(interval time.Duration, stop <-chan struct{}) {
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				e.mu.RLock()
				for _, c := range e.cells {
					if r := atomic.LoadInt64(&c.riders); r > 0 {
						atomic.AddInt64(&c.riders, -(r / 10))
					}
				}
				e.mu.RUnlock()
			case <-stop:
				return
			}
		}
	}()
}

func main() {
	engine := NewSurgePricingEngine()
	stop := make(chan struct{})
	defer close(stop)
	engine.StartDecay(time.Second, stop)

	// Simulate concurrent updates from multiple goroutines
	var wg sync.WaitGroup
	for i := 0; i < 9; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			engine.UpdateRiderCount("cell-A", 1)
		}()
	}
	wg.Wait()
	engine.UpdateDriverCount("cell-A", 3)

	fmt.Printf("Surge multiplier for cell-A: %.2fx\n", engine.GetMultiplier("cell-A"))

	engine.UpdateDriverCount("cell-B", 10)
	engine.UpdateRiderCount("cell-B", 5)
	fmt.Printf("Surge multiplier for cell-B (normal): %.2fx\n", engine.GetMultiplier("cell-B"))

	engine.UpdateDriverCount("cell-C", 0) // no drivers
	engine.UpdateRiderCount("cell-C", 10)
	fmt.Printf("Surge multiplier for cell-C (no drivers): %.2fx\n", engine.GetMultiplier("cell-C"))
}
```

**Production Notes:**
- Surge is computed per H3 hexagonal cell (resolution 7 ≈ 5 km² cells). Uber uses the H3 open-source library.
- Apply exponential moving average on the multiplier to avoid sudden jumps visible to users.
- Real production model: ML features include time-of-day, local events, weather, and historical patterns — not just the raw ratio.
- Multiplier is cached per cell with a 5-second TTL and recomputed asynchronously in the background.
- A/B test different surge algorithms per market; feature flags control which pricing model is active.

**Edge Cases:**
- Negative driver delta (driver goes offline): guard against `drivers` going below zero with a compare-and-swap floor.
- Cell never seen before: `getOrCreate` uses double-checked locking to avoid redundant allocations.
- Multiplier must never decrease faster than ~0.25x per minute to avoid price whiplash complaints.

---

## Problem 4: Driver Location Tracker — High-Frequency Position Updates

**Problem Statement:**
Track real-time GPS locations of millions of drivers. Support efficient current-location lookups, per-driver location history with a bounded circular buffer, and atomic updates from concurrent goroutines.

**Go Implementation:**

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

type GPSUpdate struct {
	DriverID  string
	Lat, Lng  float64
	Timestamp time.Time
	Speed     float64 // km/h
	Bearing   float64 // degrees
}

type LocationHistory struct {
	updates []GPSUpdate
	mu      sync.RWMutex
	head    int
	size    int
	cap     int
}

func NewLocationHistory(capacity int) *LocationHistory {
	return &LocationHistory{
		updates: make([]GPSUpdate, capacity),
		cap:     capacity,
	}
}

func (h *LocationHistory) Add(u GPSUpdate) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.updates[h.head] = u
	h.head = (h.head + 1) % h.cap
	if h.size < h.cap {
		h.size++
	}
}

// Recent returns up to n most recent updates in chronological order.
func (h *LocationHistory) Recent(n int) []GPSUpdate {
	h.mu.RLock()
	defer h.mu.RUnlock()
	if n > h.size {
		n = h.size
	}
	result := make([]GPSUpdate, n)
	// head points to the next write position, so oldest data is at head (if full).
	start := (h.head - n + h.cap) % h.cap
	for i := 0; i < n; i++ {
		result[i] = h.updates[(start+i)%h.cap]
	}
	return result
}

type LocationTracker struct {
	mu       sync.RWMutex
	current  map[string]*GPSUpdate
	history  map[string]*LocationHistory
	histSize int
}

func NewLocationTracker(histSize int) *LocationTracker {
	return &LocationTracker{
		current:  make(map[string]*GPSUpdate),
		history:  make(map[string]*LocationHistory),
		histSize: histSize,
	}
}

func (t *LocationTracker) Update(u GPSUpdate) {
	t.mu.Lock()
	cp := u
	t.current[u.DriverID] = &cp
	hist, ok := t.history[u.DriverID]
	if !ok {
		hist = NewLocationHistory(t.histSize)
		t.history[u.DriverID] = hist
	}
	t.mu.Unlock()
	hist.Add(u)
}

func (t *LocationTracker) GetCurrent(driverID string) (*GPSUpdate, bool) {
	t.mu.RLock()
	defer t.mu.RUnlock()
	u, ok := t.current[driverID]
	return u, ok
}

func (t *LocationTracker) GetHistory(driverID string, n int) []GPSUpdate {
	t.mu.RLock()
	hist := t.history[driverID]
	t.mu.RUnlock()
	if hist == nil {
		return nil
	}
	return hist.Recent(n)
}

func main() {
	tracker := NewLocationTracker(100)

	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			for tick := 0; tick < 3; tick++ {
				tracker.Update(GPSUpdate{
					DriverID:  fmt.Sprintf("driver-%d", id),
					Lat:       37.77 + float64(id)*0.001 + float64(tick)*0.0001,
					Lng:       -122.42 + float64(id)*0.001,
					Timestamp: time.Now(),
					Speed:     30.0 + float64(tick),
				})
			}
		}(i)
	}
	wg.Wait()

	u, ok := tracker.GetCurrent("driver-0")
	if ok {
		fmt.Printf("Driver-0 current: (%.5f, %.5f) speed=%.1f km/h\n", u.Lat, u.Lng, u.Speed)
	}
	history := tracker.GetHistory("driver-0", 3)
	fmt.Printf("Driver-0 history: %d entries\n", len(history))
}
```

**Production Notes:**
- Uber processes ~1M GPS updates per second. Each driver app sends a ping every 4 seconds.
- Location data flows through Kafka; a Go consumer writes current positions to Redis GEO sorted sets.
- For trip replay and fraud detection, store compressed history in S3 using protobuf-encoded polylines.
- Dead reckoning: interpolate position between updates using last known speed and bearing to fill gaps between pings.
- Privacy: location history is auto-deleted after 30 days per GDPR/CCPA requirements.

**Edge Cases:**
- Out-of-order updates (network jitter): compare timestamps before overwriting `current` to keep the latest coordinate.
- Driver with zero speed for >15 minutes: trigger an idle detection rule to prompt the driver.
- History capacity overflow: circular buffer naturally overwrites oldest entries without unbounded memory growth.

---

## Problem 5: Trip Dispatch Queue with Priority (VIP Rides First)

**Problem Statement:**
Implement a thread-safe priority queue for trip dispatch where VIP riders, long-distance trips, and surge zone requests are served before standard requests. Within the same priority level, maintain FIFO order.

**Go Implementation:**

```go
package main

import (
	"container/heap"
	"fmt"
	"sync"
	"time"
)

type Priority int

const (
	PriorityLow    Priority = 0
	PriorityNormal Priority = 1
	PriorityHigh   Priority = 2
	PriorityVIP    Priority = 3
)

type TripRequest struct {
	ID        string
	RiderID   string
	Priority  Priority
	CreatedAt time.Time
	Location  struct{ Lat, Lng float64 }
	index     int
}

type tripHeap []*TripRequest

func (h tripHeap) Len() int { return len(h) }
func (h tripHeap) Less(i, j int) bool {
	if h[i].Priority != h[j].Priority {
		return h[i].Priority > h[j].Priority // max-heap on priority
	}
	return h[i].CreatedAt.Before(h[j].CreatedAt) // FIFO within same priority
}
func (h tripHeap) Swap(i, j int) {
	h[i], h[j] = h[j], h[i]
	h[i].index = i
	h[j].index = j
}
func (h *tripHeap) Push(x interface{}) {
	req := x.(*TripRequest)
	req.index = len(*h)
	*h = append(*h, req)
}
func (h *tripHeap) Pop() interface{} {
	old := *h
	req := old[len(old)-1]
	req.index = -1
	*h = old[:len(old)-1]
	return req
}

type DispatchQueue struct {
	mu   sync.Mutex
	heap *tripHeap
	cond *sync.Cond
}

func NewDispatchQueue() *DispatchQueue {
	h := &tripHeap{}
	heap.Init(h)
	dq := &DispatchQueue{heap: h}
	dq.cond = sync.NewCond(&dq.mu)
	return dq
}

func (dq *DispatchQueue) Enqueue(req *TripRequest) {
	dq.mu.Lock()
	defer dq.mu.Unlock()
	heap.Push(dq.heap, req)
	dq.cond.Signal()
}

// Dequeue blocks until a request is available.
func (dq *DispatchQueue) Dequeue() *TripRequest {
	dq.mu.Lock()
	defer dq.mu.Unlock()
	for dq.heap.Len() == 0 {
		dq.cond.Wait()
	}
	return heap.Pop(dq.heap).(*TripRequest)
}

// BumpPriority raises a waiting request's priority to prevent starvation.
func (dq *DispatchQueue) BumpPriority(id string, newPriority Priority) {
	dq.mu.Lock()
	defer dq.mu.Unlock()
	for _, req := range *dq.heap {
		if req.ID == id {
			req.Priority = newPriority
			heap.Fix(dq.heap, req.index)
			return
		}
	}
}

func (dq *DispatchQueue) Len() int {
	dq.mu.Lock()
	defer dq.mu.Unlock()
	return dq.heap.Len()
}

func main() {
	dq := NewDispatchQueue()

	now := time.Now()
	requests := []*TripRequest{
		{ID: "R1", RiderID: "rider-1", Priority: PriorityNormal, CreatedAt: now},
		{ID: "R2", RiderID: "vip-1", Priority: PriorityVIP, CreatedAt: now.Add(time.Millisecond)},
		{ID: "R3", RiderID: "rider-2", Priority: PriorityHigh, CreatedAt: now.Add(2 * time.Millisecond)},
		{ID: "R4", RiderID: "rider-3", Priority: PriorityLow, CreatedAt: now.Add(3 * time.Millisecond)},
		{ID: "R5", RiderID: "rider-4", Priority: PriorityNormal, CreatedAt: now.Add(4 * time.Millisecond)},
	}
	for _, r := range requests {
		dq.Enqueue(r)
	}

	// Simulate starvation prevention: bump R4 after waiting
	dq.BumpPriority("R4", PriorityHigh)

	priorityLabel := map[Priority]string{0: "LOW", 1: "NORMAL", 2: "HIGH", 3: "VIP"}
	for dq.Len() > 0 {
		req := dq.Dequeue()
		fmt.Printf("Dispatching: %s (priority: %s, rider: %s)\n",
			req.ID, priorityLabel[req.Priority], req.RiderID)
	}
}
```

**Production Notes:**
- Dispatch queues are per-region; Uber runs hundreds of regional dispatch services globally.
- Starvation prevention: low-priority requests get their priority bumped after waiting more than 60 seconds.
- Queue depth monitoring: if depth exceeds a threshold, trigger surge pricing to reduce demand or recruit more drivers via incentive push.
- Persist queue state in Redis sorted sets (score = priority combined with timestamp); survives pod restarts.
- Dequeue is pull-based: driver-acceptance workers consume from the queue rather than the system pushing to drivers.

**Edge Cases:**
- Concurrent enqueue and dequeue: the single mutex on the heap ensures heap invariants are never violated.
- Duplicate request IDs: deduplicate at ingestion time using a Redis SET before the request reaches the queue.
- Empty queue blocking: `Dequeue` uses `sync.Cond.Wait`, which parks the goroutine without spinning.

---

## Problem 6: Per-Driver/Rider Rate Limiter with Sliding Window

**Problem Statement:**
Implement a sliding window rate limiter that enforces per-user request limits. A user can make at most N requests in any rolling window of T seconds. Apply independent limits for drivers and riders.

**Go Implementation:**

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

type SlidingWindowLimiter struct {
	mu      sync.Mutex
	windows map[string][]time.Time
	maxReqs int
	window  time.Duration
}

func NewSlidingWindowLimiter(maxReqs int, window time.Duration) *SlidingWindowLimiter {
	return &SlidingWindowLimiter{
		windows: make(map[string][]time.Time),
		maxReqs: maxReqs,
		window:  window,
	}
}

func (l *SlidingWindowLimiter) Allow(userID string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-l.window)

	// Evict timestamps outside the window.
	times := l.windows[userID]
	valid := times[:0]
	for _, t := range times {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}

	if len(valid) >= l.maxReqs {
		l.windows[userID] = valid
		return false
	}
	l.windows[userID] = append(valid, now)
	return true
}

func (l *SlidingWindowLimiter) RemainingQuota(userID string) int {
	l.mu.Lock()
	defer l.mu.Unlock()
	cutoff := time.Now().Add(-l.window)
	count := 0
	for _, t := range l.windows[userID] {
		if t.After(cutoff) {
			count++
		}
	}
	return l.maxReqs - count
}

func (l *SlidingWindowLimiter) RetryAfter(userID string) time.Duration {
	l.mu.Lock()
	defer l.mu.Unlock()
	cutoff := time.Now().Add(-l.window)
	var oldest time.Time
	for _, t := range l.windows[userID] {
		if t.After(cutoff) {
			if oldest.IsZero() || t.Before(oldest) {
				oldest = t
			}
		}
	}
	if oldest.IsZero() {
		return 0
	}
	return time.Until(oldest.Add(l.window))
}

// Compact removes idle user entries to reclaim memory.
func (l *SlidingWindowLimiter) Compact() {
	l.mu.Lock()
	defer l.mu.Unlock()
	cutoff := time.Now().Add(-l.window)
	for id, times := range l.windows {
		valid := times[:0]
		for _, t := range times {
			if t.After(cutoff) {
				valid = append(valid, t)
			}
		}
		if len(valid) == 0 {
			delete(l.windows, id)
		} else {
			l.windows[id] = valid
		}
	}
}

func main() {
	riderLimiter := NewSlidingWindowLimiter(3, time.Second)
	driverLimiter := NewSlidingWindowLimiter(10, time.Second) // drivers get more quota

	riderID := "rider-42"
	for i := 1; i <= 5; i++ {
		allowed := riderLimiter.Allow(riderID)
		fmt.Printf("Rider request %d: allowed=%v remaining=%d\n",
			i, allowed, riderLimiter.RemainingQuota(riderID))
	}

	retryIn := riderLimiter.RetryAfter(riderID)
	fmt.Printf("Retry after: %v\n", retryIn.Round(time.Millisecond))

	_ = driverLimiter.Allow("driver-1")
	fmt.Printf("Driver quota remaining: %d\n", driverLimiter.RemainingQuota("driver-1"))
}
```

**Production Notes:**
- In-process limiting is for single-node use. For distributed limiting across pods, use Redis ZSET in a Lua script:
  - `ZADD key score(now) now` → add the current request timestamp.
  - `ZREMRANGEBYSCORE key 0 (now-window)` → evict old entries.
  - `ZCARD key` → count; reject if over limit. Wrap all three in a single Lua script for atomicity.
- Separate rate limits for riders (ride request: 1/min) vs. drivers (location update: 1/4 s).
- Return `Retry-After` and `X-RateLimit-Remaining` headers so clients back off gracefully.
- Graduated enforcement: first breach returns HTTP 429; repeated abuse flags the account for review.

**Edge Cases:**
- Clock skew between nodes: use a monotonic clock for window calculations; Redis timestamps are server-local.
- Memory leak for abandoned users: run `Compact` on a 60-second ticker.
- Burst at window boundary (two adjacent windows giving 2x quota): sliding window prevents this, unlike fixed-window counters.

---

## Problem 7: Circuit Breaker for Payment Service Calls

**Problem Statement:**
Implement a circuit breaker that wraps payment service calls. It opens when the error count exceeds a threshold, then half-opens after a timeout to probe recovery before closing again.

**Go Implementation:**

```go
package main

import (
	"errors"
	"fmt"
	"sync"
	"time"
)

type CBState int

const (
	StateClosed   CBState = iota // normal: all calls allowed
	StateOpen                    // tripped: all calls rejected
	StateHalfOpen                // probing: limited calls allowed
)

var ErrCircuitOpen = errors.New("circuit breaker open")

type CircuitBreaker struct {
	mu              sync.Mutex
	state           CBState
	failures        int
	successesNeeded int
	successCount    int
	threshold       int
	timeout         time.Duration
	lastFailureAt   time.Time
}

func NewCircuitBreaker(threshold, successesNeeded int, timeout time.Duration) *CircuitBreaker {
	return &CircuitBreaker{
		threshold:       threshold,
		successesNeeded: successesNeeded,
		timeout:         timeout,
	}
}

func (cb *CircuitBreaker) Call(fn func() error) error {
	cb.mu.Lock()

	switch cb.state {
	case StateOpen:
		if time.Since(cb.lastFailureAt) < cb.timeout {
			cb.mu.Unlock()
			return ErrCircuitOpen
		}
		// Transition to half-open to probe
		cb.state = StateHalfOpen
		cb.successCount = 0
		fmt.Println("[CB] -> HALF-OPEN")
	}
	cb.mu.Unlock()

	err := fn()

	cb.mu.Lock()
	defer cb.mu.Unlock()

	if err != nil {
		cb.failures++
		cb.lastFailureAt = time.Now()
		if cb.failures >= cb.threshold || cb.state == StateHalfOpen {
			cb.state = StateOpen
			fmt.Printf("[CB] -> OPEN (failures=%d)\n", cb.failures)
		}
		return err
	}

	// Successful call
	switch cb.state {
	case StateHalfOpen:
		cb.successCount++
		if cb.successCount >= cb.successesNeeded {
			cb.state = StateClosed
			cb.failures = 0
			fmt.Println("[CB] -> CLOSED (recovered)")
		}
	case StateClosed:
		cb.failures = 0 // reset on success
	}
	return nil
}

func (cb *CircuitBreaker) StateLabel() string {
	cb.mu.Lock()
	defer cb.mu.Unlock()
	return []string{"CLOSED", "OPEN", "HALF-OPEN"}[cb.state]
}

func main() {
	cb := NewCircuitBreaker(3, 2, 300*time.Millisecond)

	callCount := 0
	paymentService := func() error {
		callCount++
		if callCount <= 4 {
			return errors.New("upstream timeout")
		}
		return nil
	}

	for i := 1; i <= 9; i++ {
		err := cb.Call(paymentService)
		fmt.Printf("Call %d: err=%v state=%s\n", i, err, cb.StateLabel())
		if errors.Is(err, ErrCircuitOpen) {
			time.Sleep(350 * time.Millisecond) // wait for timeout
		}
	}
}
```

**Production Notes:**
- Uber uses circuit breakers extensively via their open-source `yarpc` RPC framework.
- Track error rate (errors/total), not just absolute count; a spike in traffic inflates error counts artificially.
- Sliding window circuit breaker: count errors only in the last N seconds, not cumulatively.
- In half-open state, allow only one request through using a semaphore to avoid hammering a recovering service.
- Fallback when open: return a cached result, serve a degraded response, or enqueue for async retry.
- Alert on state transitions; a circuit opening mid-day is a production incident signal.

**Edge Cases:**
- Concurrent calls in half-open: add a semaphore so only one probe call runs at a time.
- Non-retriable errors (e.g., HTTP 400 Bad Request): classify errors; do not count client errors toward the failure threshold.
- Metrics: expose `circuit_breaker_state` as a Prometheus gauge for dashboards.

---

## Problem 8: Real-Time ETA Calculator Using Goroutine Pool

**Problem Statement:**
Estimate time of arrival for a trip given driver location, rider location, traffic data, and historical speed profiles. Use a goroutine pool to compute ETAs for thousands of concurrent trips.

**Go Implementation:**

```go
package main

import (
	"context"
	"fmt"
	"math"
	"sync"
	"time"
)

type Segment struct {
	ID        string
	Distance  float64 // km
	BaseSpeed float64 // km/h
}

type TrafficLayer struct {
	mu          sync.RWMutex
	multipliers map[string]float64 // segmentID → speed multiplier (1.0 = free flow)
}

func NewTrafficLayer() *TrafficLayer {
	return &TrafficLayer{multipliers: make(map[string]float64)}
}

func (t *TrafficLayer) Update(segmentID string, mult float64) {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.multipliers[segmentID] = mult
}

func (t *TrafficLayer) Get(segmentID string) float64 {
	t.mu.RLock()
	defer t.mu.RUnlock()
	if m, ok := t.multipliers[segmentID]; ok {
		return m
	}
	return 1.0
}

type ETARequest struct {
	TripID   string
	Segments []Segment
	ResultCh chan<- ETAResult
}

type ETAResult struct {
	TripID string
	ETA    time.Duration
	Err    error
}

type ETAPool struct {
	traffic *TrafficLayer
	jobs    chan ETARequest
	wg      sync.WaitGroup
}

func NewETAPool(workers int, traffic *TrafficLayer) *ETAPool {
	p := &ETAPool{
		traffic: traffic,
		jobs:    make(chan ETARequest, workers*4),
	}
	for i := 0; i < workers; i++ {
		p.wg.Add(1)
		go p.worker()
	}
	return p
}

func (p *ETAPool) worker() {
	defer p.wg.Done()
	for req := range p.jobs {
		req.ResultCh <- p.compute(req)
	}
}

func (p *ETAPool) compute(req ETARequest) ETAResult {
	totalSec := 0.0
	for _, seg := range req.Segments {
		speed := seg.BaseSpeed * p.traffic.Get(seg.ID)
		if speed < 5.0 {
			speed = 5.0 // floor: 5 km/h in worst congestion
		}
		totalSec += (seg.Distance / speed) * 3600
	}
	return ETAResult{
		TripID: req.TripID,
		ETA:    time.Duration(math.Round(totalSec)) * time.Second,
	}
}

func (p *ETAPool) Submit(ctx context.Context, req ETARequest) (ETAResult, error) {
	select {
	case p.jobs <- req:
	case <-ctx.Done():
		return ETAResult{}, ctx.Err()
	}
	select {
	case r := <-req.ResultCh:
		return r, r.Err
	case <-ctx.Done():
		return ETAResult{}, ctx.Err()
	}
}

func (p *ETAPool) Stop() {
	close(p.jobs)
	p.wg.Wait()
}

func main() {
	traffic := NewTrafficLayer()
	traffic.Update("seg-1", 0.5) // 50% speed
	traffic.Update("seg-2", 0.8)

	pool := NewETAPool(8, traffic)
	defer pool.Stop()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	tripIDs := []string{"T1", "T2", "T3"}
	var wg sync.WaitGroup
	for _, id := range tripIDs {
		wg.Add(1)
		id := id
		go func() {
			defer wg.Done()
			resCh := make(chan ETAResult, 1)
			result, err := pool.Submit(ctx, ETARequest{
				TripID: id,
				Segments: []Segment{
					{ID: "seg-1", Distance: 2.5, BaseSpeed: 50.0},
					{ID: "seg-2", Distance: 1.8, BaseSpeed: 60.0},
				},
				ResultCh: resCh,
			})
			if err != nil {
				fmt.Printf("%s: error %v\n", id, err)
				return
			}
			fmt.Printf("%s: ETA = %v\n", result.TripID, result.ETA)
		}()
	}
	wg.Wait()
}
```

**Production Notes:**
- Uber's ETA model combines real-time traffic (HERE, Google Maps, proprietary GPS probes), historical speed profiles per road segment per hour-of-day, and ML-based correction terms.
- ETA is recomputed every 30 seconds during a live trip and pushed to both rider and driver apps.
- Return an uncertainty range (e.g., "8–12 min") based on traffic variance for better UX.
- For global coverage, run on a road network graph with 100M+ edges; use Dijkstra or A* for shortest-path.
- Pool size: tune based on CPU cores × 2; profile under load to find saturation point.

**Edge Cases:**
- Zero-length segment list: return 0 ETA immediately without entering the pool.
- Traffic layer returns 0 multiplier: clamp to the minimum speed floor (5 km/h) to avoid divide-by-zero.
- Pool drains on shutdown: `Stop` closes the jobs channel and waits for all workers to finish in-flight computations.

---

## Problem 9: Exponential Backoff Retry for GPS Coordinate Updates

**Problem Statement:**
Implement a retry mechanism for GPS API calls with exponential backoff, full jitter, and context-based cancellation. Distinguish retriable errors from non-retriable ones.

**Go Implementation:**

```go
package main

import (
	"context"
	"errors"
	"fmt"
	"math"
	"math/rand"
	"time"
)

type RetryConfig struct {
	MaxAttempts    int
	InitialBackoff time.Duration
	MaxBackoff     time.Duration
	Multiplier     float64
	JitterFactor   float64
}

func DefaultGPSRetryConfig() RetryConfig {
	return RetryConfig{
		MaxAttempts:    5,
		InitialBackoff: 100 * time.Millisecond,
		MaxBackoff:     30 * time.Second,
		Multiplier:     2.0,
		JitterFactor:   0.3,
	}
}

// ErrNonRetryable wraps errors that should not be retried (e.g., auth failures).
var ErrNonRetryable = errors.New("non-retryable error")

func WithRetry(ctx context.Context, cfg RetryConfig, fn func(ctx context.Context) error) error {
	backoff := cfg.InitialBackoff
	var lastErr error

	for attempt := 0; attempt < cfg.MaxAttempts; attempt++ {
		if ctx.Err() != nil {
			return ctx.Err()
		}

		lastErr = fn(ctx)
		if lastErr == nil {
			return nil
		}
		if errors.Is(lastErr, ErrNonRetryable) {
			return lastErr
		}

		if attempt == cfg.MaxAttempts-1 {
			break
		}

		// Full jitter: sleep = rand(0, backoff)
		jittered := time.Duration(float64(backoff) * rand.Float64())
		_ = math.Log(1) // ensure math is used

		fmt.Printf("[attempt %d] failed: %v — retrying in %v\n", attempt+1, lastErr, jittered)

		select {
		case <-time.After(jittered):
		case <-ctx.Done():
			return ctx.Err()
		}

		backoff = time.Duration(float64(backoff) * cfg.Multiplier)
		if backoff > cfg.MaxBackoff {
			backoff = cfg.MaxBackoff
		}
	}
	return fmt.Errorf("all %d attempts failed, last error: %w", cfg.MaxAttempts, lastErr)
}

func main() {
	cfg := RetryConfig{
		MaxAttempts:    5,
		InitialBackoff: 50 * time.Millisecond,
		MaxBackoff:     2 * time.Second,
		Multiplier:     2.0,
		JitterFactor:   0.3,
	}

	attempt := 0
	gpsUpload := func(ctx context.Context) error {
		attempt++
		if attempt < 3 {
			return errors.New("GPS service timeout")
		}
		fmt.Printf("[attempt %d] GPS upload succeeded\n", attempt)
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err := WithRetry(ctx, cfg, gpsUpload)
	fmt.Printf("Result: %v (total attempts: %d)\n", err, attempt)

	// Non-retryable scenario
	attempt = 0
	authFail := func(_ context.Context) error {
		attempt++
		return fmt.Errorf("401 unauthorized: %w", ErrNonRetryable)
	}
	err = WithRetry(ctx, cfg, authFail)
	fmt.Printf("Auth result: %v (attempts: %d — should be 1)\n", err, attempt)
}
```

**Production Notes:**
- Full jitter (`rand(0, backoff)`) is preferred over equal jitter for distributed systems; it spreads retry storms across the backoff window.
- Uber's driver app buffers GPS updates locally when offline and retries with backoff when connectivity resumes.
- Propagate overall request deadlines via context; the retry loop respects cancellation and never outlives its parent context.
- Circuit breaker + retry complement each other: retry handles transient errors; circuit breaker handles systemic failures.
- Non-idempotent operations (e.g., POST payment) require idempotency keys before retrying to avoid double charges.

**Edge Cases:**
- Context cancelled mid-sleep: the `select` on `ctx.Done()` exits immediately without sleeping the full backoff period.
- Maximum backoff cap: prevents backoff growing beyond a practical limit (30 s) that would make retries useless.
- Jitter producing a negative duration: `rand.Float64()` is [0,1) so jittered is always ≥ 0.

---

## Problem 10: Concurrent Push Notification Dispatcher

**Problem Statement:**
Dispatch notifications (push, SMS, email) to millions of riders and drivers concurrently. Support multiple channels, per-user preferences, worker pool backpressure, and graceful shutdown.

**Go Implementation:**

```go
package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

type Channel string

const (
	ChannelPush  Channel = "push"
	ChannelSMS   Channel = "sms"
	ChannelEmail Channel = "email"
)

type Notification struct {
	UserID   string
	Message  string
	Channels []Channel
}

type Sender interface {
	Send(ctx context.Context, userID, message string) error
	Channel() Channel
}

type MockSender struct {
	ch    Channel
	delay time.Duration
}

func (s *MockSender) Channel() Channel { return s.ch }
func (s *MockSender) Send(ctx context.Context, userID, message string) error {
	select {
	case <-time.After(s.delay):
		fmt.Printf("[%s] -> %s: %q\n", s.ch, userID, message)
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

type Dispatcher struct {
	senders map[Channel]Sender
	queue   chan Notification
	wg      sync.WaitGroup
}

func NewDispatcher(queueSize, workers int, senders ...Sender) *Dispatcher {
	d := &Dispatcher{
		senders: make(map[Channel]Sender),
		queue:   make(chan Notification, queueSize),
	}
	for _, s := range senders {
		d.senders[s.Channel()] = s
	}
	d.wg.Add(workers)
	return d
}

func (d *Dispatcher) Start(ctx context.Context, workers int) {
	for i := 0; i < workers; i++ {
		go func() {
			defer d.wg.Done()
			for {
				select {
				case notif, ok := <-d.queue:
					if !ok {
						return
					}
					d.dispatch(ctx, notif)
				case <-ctx.Done():
					return
				}
			}
		}()
	}
}

func (d *Dispatcher) dispatch(ctx context.Context, notif Notification) {
	var wg sync.WaitGroup
	for _, ch := range notif.Channels {
		sender, ok := d.senders[ch]
		if !ok {
			continue
		}
		ch, sender := ch, sender
		wg.Add(1)
		go func() {
			defer wg.Done()
			chCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
			defer cancel()
			if err := sender.Send(chCtx, notif.UserID, notif.Message); err != nil {
				fmt.Printf("[%s] failed for %s: %v\n", ch, notif.UserID, err)
			}
		}()
	}
	wg.Wait()
}

// Enqueue returns false if the queue is full (backpressure).
func (d *Dispatcher) Enqueue(n Notification) bool {
	select {
	case d.queue <- n:
		return true
	default:
		return false
	}
}

func (d *Dispatcher) Stop() {
	close(d.queue)
	d.wg.Wait()
}

func main() {
	workers := 4
	d := NewDispatcher(1000, workers,
		&MockSender{ch: ChannelPush, delay: 10 * time.Millisecond},
		&MockSender{ch: ChannelSMS, delay: 50 * time.Millisecond},
	)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	d.Start(ctx, workers)

	for i := 0; i < 5; i++ {
		ok := d.Enqueue(Notification{
			UserID:   fmt.Sprintf("user-%d", i),
			Message:  "Your driver is arriving!",
			Channels: []Channel{ChannelPush, ChannelSMS},
		})
		if !ok {
			fmt.Printf("Queue full, dropped notification for user-%d\n", i)
		}
	}

	time.Sleep(200 * time.Millisecond)
	d.Stop()
}
```

**Production Notes:**
- Uber sends 10M+ notifications per day. The core platform is a Go service that reads from Kafka and writes to APNs, GCM, and Twilio.
- Fan-out escalation: try push first; if undelivered after 30 seconds, escalate to SMS.
- Deduplication: use a Redis SET keyed on `hash(userID + message)` with a 24-hour TTL to prevent duplicate sends.
- Per-user preference store: riders opt in/out per channel; fetch preferences from a low-latency config service.
- Rate limit per user: at most 5 push notifications per hour to avoid spamming.

**Edge Cases:**
- Queue full: `Enqueue` returns false; caller increments a dropped-notification counter in Prometheus.
- Context cancelled: `Send` returns immediately via `ctx.Done()`; partial sends are logged but not retried here.
- Unknown channel in preferences: `d.senders[ch]` lookup misses silently; validate channel list at enqueue time.

---

## Problem 11: Trip State Machine (requested → matched → in-progress → completed)

**Problem Statement:**
Implement a trip lifecycle state machine. Trips transition between states atomically and each transition is logged to an immutable audit history. Enforce valid state transitions and reject illegal ones.

**Go Implementation:**

```go
package main

import (
	"errors"
	"fmt"
	"sync"
	"time"
)

type TripState string

const (
	StateRequested  TripState = "requested"
	StateAccepted   TripState = "accepted"
	StateEnRoute    TripState = "en_route"
	StateArrived    TripState = "arrived"
	StateInProgress TripState = "in_progress"
	StateCompleted  TripState = "completed"
	StateCancelled  TripState = "cancelled"
)

var validTransitions = map[TripState][]TripState{
	StateRequested:  {StateAccepted, StateCancelled},
	StateAccepted:   {StateEnRoute, StateCancelled},
	StateEnRoute:    {StateArrived, StateCancelled},
	StateArrived:    {StateInProgress, StateCancelled},
	StateInProgress: {StateCompleted, StateCancelled},
}

var ErrInvalidTransition = errors.New("invalid state transition")

type StateEvent struct {
	From      TripState
	To        TripState
	ActorID   string
	Timestamp time.Time
}

type Trip struct {
	ID       string
	RiderID  string
	DriverID string
	mu       sync.Mutex
	state    TripState
	history  []StateEvent
}

func NewTrip(id, riderID string) *Trip {
	return &Trip{
		ID:      id,
		RiderID: riderID,
		state:   StateRequested,
	}
}

func (t *Trip) Transition(to TripState, actorID string) error {
	t.mu.Lock()
	defer t.mu.Unlock()

	allowed, ok := validTransitions[t.state]
	if !ok {
		return fmt.Errorf("terminal state %s: %w", t.state, ErrInvalidTransition)
	}
	for _, s := range allowed {
		if s == to {
			event := StateEvent{From: t.state, To: to, ActorID: actorID, Timestamp: time.Now()}
			t.history = append(t.history, event)
			fmt.Printf("[trip %s] %s → %s (actor: %s)\n", t.ID, t.state, to, actorID)
			t.state = to
			return nil
		}
	}
	return fmt.Errorf("%s → %s not allowed: %w", t.state, to, ErrInvalidTransition)
}

func (t *Trip) State() TripState {
	t.mu.Lock()
	defer t.mu.Unlock()
	return t.state
}

func (t *Trip) History() []StateEvent {
	t.mu.Lock()
	defer t.mu.Unlock()
	cp := make([]StateEvent, len(t.history))
	copy(cp, t.history)
	return cp
}

func main() {
	trip := NewTrip("trip-001", "rider-1")

	steps := []struct {
		to     TripState
		actor  string
	}{
		{StateAccepted, "driver-42"},
		{StateEnRoute, "driver-42"},
		{StateArrived, "driver-42"},
		{StateInProgress, "system"},
		{StateCompleted, "system"},
	}

	for _, s := range steps {
		if err := trip.Transition(s.to, s.actor); err != nil {
			fmt.Printf("Error: %v\n", err)
		}
	}

	// Illegal: already completed
	if err := trip.Transition(StateAccepted, "driver-42"); err != nil {
		fmt.Printf("Expected error: %v\n", err)
	}

	fmt.Printf("History length: %d events\n", len(trip.History()))
}
```

**Production Notes:**
- Trip state is stored in a distributed DB; Uber uses Schemaless, their MySQL-backed document store.
- Every transition emits a Kafka event; downstream services (billing, analytics, driver score) react to events.
- Use optimistic locking with a `version` field; CAS on the DB write prevents concurrent invalid transitions.
- Cancellation from multiple states triggers different compensation logic (no-show fee vs. free cancellation window).
- Saga pattern: a trip transition may require coordinating driver state, payment authorisation, and mapping service updates atomically.

**Edge Cases:**
- Concurrent Transition calls from driver app and system: the per-trip mutex ensures only one transition wins.
- Re-delivery of the same event (Kafka at-least-once): check `history` for the event before applying; make transition idempotent.
- Network partition during transition: the DB write may fail after emitting the Kafka event; use the outbox pattern to guarantee consistency.

---

## Problem 12: Dynamic Driver Supply/Demand Balancer

**Problem Statement:**
Monitor supply (available drivers) and demand (pending ride requests) per geographic zone. Evaluate balance continuously and emit incentive actions (boost driver pay, trigger surge pricing, relax incentives) to rebalance the marketplace.

**Go Implementation:**

```go
package main

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"
	"time"
)

type Zone struct {
	ID      string
	drivers int64 // atomic
	demand  int64 // atomic
}

func (z *Zone) SupplyRatio() float64 {
	d := atomic.LoadInt64(&z.drivers)
	r := atomic.LoadInt64(&z.demand)
	if r == 0 {
		return float64(d) // abundant supply
	}
	return float64(d) / float64(r)
}

type BalancerAction string

const (
	ActionBoostIncentive BalancerAction = "BOOST_INCENTIVE" // low supply
	ActionSurgePricing   BalancerAction = "SURGE_PRICING"   // demand slightly > supply
	ActionNoAction       BalancerAction = "NO_ACTION"       // balanced
	ActionRelaxIncentive BalancerAction = "RELAX_INCENTIVE" // oversupply
)

type BalancerEvent struct {
	ZoneID string
	Action BalancerAction
	Ratio  float64
	At     time.Time
}

type SupplyDemandBalancer struct {
	mu       sync.RWMutex
	zones    map[string]*Zone
	events   chan BalancerEvent
	lowRatio  float64 // below → boost incentives
	highRatio float64 // above → relax incentives
}

func NewBalancer(low, high float64) *SupplyDemandBalancer {
	return &SupplyDemandBalancer{
		zones:     make(map[string]*Zone),
		events:    make(chan BalancerEvent, 256),
		lowRatio:  low,
		highRatio: high,
	}
}

func (b *SupplyDemandBalancer) Upsert(zoneID string, drivers, demand int64) {
	b.mu.Lock()
	z, ok := b.zones[zoneID]
	if !ok {
		z = &Zone{ID: zoneID}
		b.zones[zoneID] = z
	}
	b.mu.Unlock()
	atomic.StoreInt64(&z.drivers, drivers)
	atomic.StoreInt64(&z.demand, demand)
}

func (b *SupplyDemandBalancer) Evaluate() {
	b.mu.RLock()
	zones := make([]*Zone, 0, len(b.zones))
	for _, z := range b.zones {
		zones = append(zones, z)
	}
	b.mu.RUnlock()

	var wg sync.WaitGroup
	for _, z := range zones {
		z := z
		wg.Add(1)
		go func() {
			defer wg.Done()
			ratio := z.SupplyRatio()
			var action BalancerAction
			switch {
			case ratio < b.lowRatio:
				action = ActionBoostIncentive
			case ratio < 1.0:
				action = ActionSurgePricing
			case ratio > b.highRatio:
				action = ActionRelaxIncentive
			default:
				action = ActionNoAction
			}
			if action != ActionNoAction {
				select {
				case b.events <- BalancerEvent{ZoneID: z.ID, Action: action, Ratio: ratio, At: time.Now()}:
				default:
					// Event channel full; drop; the next evaluation cycle will catch it.
				}
			}
		}()
	}
	wg.Wait()
}

func (b *SupplyDemandBalancer) Events() <-chan BalancerEvent { return b.events }

func (b *SupplyDemandBalancer) Run(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			b.Evaluate()
		case <-ctx.Done():
			return
		}
	}
}

func main() {
	b := NewBalancer(0.5, 2.0)
	b.Upsert("downtown", 5, 20)   // severely under-supplied
	b.Upsert("airport", 15, 3)    // over-supplied
	b.Upsert("midtown", 8, 10)    // slight under-supply

	b.Evaluate()

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()

	go b.Run(ctx, 50*time.Millisecond)

	timer := time.After(120 * time.Millisecond)
	seen := map[string]bool{}
	for {
		select {
		case event := <-b.Events():
			if !seen[event.ZoneID] {
				seen[event.ZoneID] = true
				fmt.Printf("Zone %-10s action=%-18s ratio=%.2f\n",
					event.ZoneID, event.Action, event.Ratio)
			}
		case <-timer:
			fmt.Printf("Evaluated %d zones\n", len(seen))
			return
		}
	}
}
```

**Production Notes:**
- Uber calls this the "marketplace balancing" system; it runs as a continuous control loop every 30 seconds.
- Incentive boosts are push notifications to off-duty drivers: "Earn an extra $10 in the next hour in downtown."
- Hysteresis: require the ratio to exceed the threshold for at least two consecutive evaluations before acting, to avoid oscillation.
- ML model predicts demand 15–30 minutes ahead; drivers are pre-positioned near anticipated hotspots.
- Publish `supply_ratio` per zone per minute to Prometheus; alert when any zone drops below 0.3 for more than 5 minutes.

**Edge Cases:**
- Zone with zero demand: `SupplyRatio` returns driver count, which correctly classifies as oversupplied.
- New zone first seen: atomic `StoreInt64` into a fresh `Zone` is safe; no partially initialised reads.
- Event channel full: silently drop the event; the next evaluation cycle at `interval` will re-emit if the imbalance persists.

---

## Problem 13: Heat Map Generator from Ride Density Data

**Problem Statement:**
Aggregate completed ride pickup coordinates into a grid-based heat map. Support concurrent ingestion of ride events and snapshot queries that return a 2D density grid for visualisation.

**Go Implementation:**

```go
package main

import (
	"fmt"
	"math"
	"sync"
	"sync/atomic"
)

// HeatMapGrid partitions a lat/lng bounding box into rows × cols cells.
// Each cell stores the ride count as an atomic int64.
type HeatMapGrid struct {
	minLat, maxLat float64
	minLng, maxLng float64
	rows, cols     int
	cells          []int64 // row-major; accessed atomically
}

func NewHeatMapGrid(minLat, maxLat, minLng, maxLng float64, rows, cols int) *HeatMapGrid {
	return &HeatMapGrid{
		minLat: minLat, maxLat: maxLat,
		minLng: minLng, maxLng: maxLng,
		rows:  rows,
		cols:  cols,
		cells: make([]int64, rows*cols),
	}
}

func (h *HeatMapGrid) cellIndex(lat, lng float64) (int, bool) {
	if lat < h.minLat || lat > h.maxLat || lng < h.minLng || lng > h.maxLng {
		return 0, false
	}
	row := int(math.Floor((lat - h.minLat) / (h.maxLat - h.minLat) * float64(h.rows)))
	col := int(math.Floor((lng - h.minLng) / (h.maxLng - h.minLng) * float64(h.cols)))
	// Clamp to valid range
	if row >= h.rows {
		row = h.rows - 1
	}
	if col >= h.cols {
		col = h.cols - 1
	}
	return row*h.cols + col, true
}

// Record increments the density of the cell containing (lat, lng).
func (h *HeatMapGrid) Record(lat, lng float64) bool {
	idx, ok := h.cellIndex(lat, lng)
	if !ok {
		return false
	}
	atomic.AddInt64(&h.cells[idx], 1)
	return true
}

// Snapshot returns a copy of the grid at the current moment.
func (h *HeatMapGrid) Snapshot() [][]int64 {
	grid := make([][]int64, h.rows)
	for r := 0; r < h.rows; r++ {
		row := make([]int64, h.cols)
		for c := 0; c < h.cols; c++ {
			row[c] = atomic.LoadInt64(&h.cells[r*h.cols+c])
		}
		grid[r] = row
	}
	return grid
}

// TopCells returns the N hottest (row, col, count) triples.
func (h *HeatMapGrid) TopCells(n int) []struct{ Row, Col int; Count int64 } {
	type cell struct{ Row, Col int; Count int64 }
	var all []cell
	for r := 0; r < h.rows; r++ {
		for c := 0; c < h.cols; c++ {
			cnt := atomic.LoadInt64(&h.cells[r*h.cols+c])
			if cnt > 0 {
				all = append(all, cell{r, c, cnt})
			}
		}
	}
	// Simple selection sort for top-n (n is small in practice)
	for i := 0; i < len(all) && i < n; i++ {
		max := i
		for j := i + 1; j < len(all); j++ {
			if all[j].Count > all[max].Count {
				max = j
			}
		}
		all[i], all[max] = all[max], all[i]
	}
	if n > len(all) {
		n = len(all)
	}
	result := make([]struct{ Row, Col int; Count int64 }, n)
	for i := range result {
		result[i] = struct{ Row, Col int; Count int64 }{all[i].Row, all[i].Col, all[i].Count}
	}
	return result
}

// Reset zeroes all cells (e.g., at the start of a new time window).
func (h *HeatMapGrid) Reset() {
	for i := range h.cells {
		atomic.StoreInt64(&h.cells[i], 0)
	}
}

func main() {
	// 10×10 grid covering San Francisco area
	grid := NewHeatMapGrid(37.70, 37.82, -122.52, -122.35, 10, 10)

	// Simulate concurrent ride completions
	rides := [][2]float64{
		{37.7749, -122.4194}, {37.7749, -122.4194}, {37.7749, -122.4194}, // downtown cluster
		{37.7751, -122.4180}, {37.7752, -122.4175},
		{37.8000, -122.4000}, // north
		{37.7100, -122.4400}, // south
		{37.7749, -122.4200}, {37.7748, -122.4195}, // more downtown
	}

	var wg sync.WaitGroup
	for _, r := range rides {
		r := r
		wg.Add(1)
		go func() {
			defer wg.Done()
			grid.Record(r[0], r[1])
		}()
	}
	wg.Wait()

	top := grid.TopCells(3)
	fmt.Println("Top 3 hottest cells:")
	for i, c := range top {
		fmt.Printf("  #%d: row=%d col=%d count=%d\n", i+1, c.Row, c.Col, c.Count)
	}

	snapshot := grid.Snapshot()
	total := int64(0)
	for _, row := range snapshot {
		for _, v := range row {
			total += v
		}
	}
	fmt.Printf("Total rides recorded: %d\n", total)
}
```

**Production Notes:**
- Uber generates heat maps at multiple resolutions; fine-grained (H3 resolution 9, ~0.1 km²) for dispatch, coarse (resolution 6, ~36 km²) for driver incentive programs.
- Sliding time window: maintain a ring buffer of grids (one per minute); expose the last 30-minute aggregate.
- Smooth heat maps with a Gaussian blur kernel before display to reduce single-cell noise.
- Export heat map data to S3 every 5 minutes as a compressed JSON/Parquet file for data warehouse ingestion.
- High-density cells (airport pickup lanes, stadiums) require sub-cell resolution; recursively zoom into H3 child cells.

**Edge Cases:**
- Point outside bounding box: `Record` returns `false`; caller can log it as an out-of-region event.
- Concurrent `Reset` during `Record`: atomic operations ensure no count is permanently lost; at worst, a reset clears a count that was being incremented.
- Integer overflow in a single cell: at 4 Hz per driver × millions of drivers, use int64 (max ~9.2×10¹⁸ — practically impossible to overflow).

---

## Problem 14: Fraud Detection — Flag Suspicious Trip Patterns

**Problem Statement:**
Detect fraudulent trip patterns in real time: multiple simultaneous trips from the same account, physically impossible speed between two location updates, and payment method velocity abuse.

**Go Implementation:**

```go
package main

import (
	"fmt"
	"math"
	"sync"
	"time"
)

type TripEvent struct {
	TripID    string
	RiderID   string
	Lat, Lng  float64
	Timestamp time.Time
	PaymentID string
}

type FraudSignal struct {
	RiderID    string
	TripID     string
	SignalType string
	Detail     string
	Score      int // severity 1–10
}

type FraudDetector struct {
	mu              sync.Mutex
	activeTrips     map[string][]string    // riderID → active tripIDs
	lastLocation    map[string]*TripEvent  // riderID → most recent event
	paymentHistory  map[string][]time.Time // paymentID → use timestamps
	maxSpeedKph     float64
	maxPaymentUses  int
	paymentWindow   time.Duration
	signals         chan FraudSignal
}

func NewFraudDetector() *FraudDetector {
	return &FraudDetector{
		activeTrips:    make(map[string][]string),
		lastLocation:   make(map[string]*TripEvent),
		paymentHistory: make(map[string][]time.Time),
		maxSpeedKph:    300.0,
		maxPaymentUses: 5,
		paymentWindow:  10 * time.Minute,
		signals:        make(chan FraudSignal, 1000),
	}
}

func haversineKm(lat1, lng1, lat2, lng2 float64) float64 {
	const R = 6371.0
	dLat := (lat2 - lat1) * math.Pi / 180
	dLng := (lng2 - lng1) * math.Pi / 180
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*math.Pi/180)*math.Cos(lat2*math.Pi/180)*
			math.Sin(dLng/2)*math.Sin(dLng/2)
	return 2 * R * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
}

func (fd *FraudDetector) Process(e TripEvent) {
	fd.mu.Lock()
	defer fd.mu.Unlock()

	// Rule 1: Simultaneous trips from the same rider.
	if trips := fd.activeTrips[e.RiderID]; len(trips) > 0 {
		fd.emit(FraudSignal{
			RiderID:    e.RiderID,
			TripID:     e.TripID,
			SignalType: "SIMULTANEOUS_TRIPS",
			Detail:     fmt.Sprintf("%d existing active trips", len(trips)),
			Score:      8,
		})
	}
	fd.activeTrips[e.RiderID] = append(fd.activeTrips[e.RiderID], e.TripID)

	// Rule 2: Physically impossible speed.
	if last, ok := fd.lastLocation[e.RiderID]; ok && last.TripID != e.TripID {
		dist := haversineKm(last.Lat, last.Lng, e.Lat, e.Lng)
		elapsed := e.Timestamp.Sub(last.Timestamp).Hours()
		if elapsed > 0 {
			speedKph := dist / elapsed
			if speedKph > fd.maxSpeedKph {
				fd.emit(FraudSignal{
					RiderID:    e.RiderID,
					TripID:     e.TripID,
					SignalType: "IMPOSSIBLE_SPEED",
					Detail:     fmt.Sprintf("%.0f km/h between trips", speedKph),
					Score:      9,
				})
			}
		}
	}
	fd.lastLocation[e.RiderID] = &e

	// Rule 3: Payment method velocity.
	cutoff := e.Timestamp.Add(-fd.paymentWindow)
	hist := fd.paymentHistory[e.PaymentID]
	valid := hist[:0]
	for _, t := range hist {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}
	valid = append(valid, e.Timestamp)
	fd.paymentHistory[e.PaymentID] = valid
	if len(valid) > fd.maxPaymentUses {
		fd.emit(FraudSignal{
			RiderID:    e.RiderID,
			TripID:     e.TripID,
			SignalType: "PAYMENT_VELOCITY",
			Detail:     fmt.Sprintf("%d uses in %v", len(valid), fd.paymentWindow),
			Score:      7,
		})
	}
}

func (fd *FraudDetector) emit(sig FraudSignal) {
	select {
	case fd.signals <- sig:
	default:
		// Channel full; in production, write directly to an alert queue.
	}
}

// CompleteTrip removes a trip from the active set.
func (fd *FraudDetector) CompleteTrip(riderID, tripID string) {
	fd.mu.Lock()
	defer fd.mu.Unlock()
	trips := fd.activeTrips[riderID]
	for i, t := range trips {
		if t == tripID {
			fd.activeTrips[riderID] = append(trips[:i], trips[i+1:]...)
			return
		}
	}
}

func (fd *FraudDetector) Signals() <-chan FraudSignal { return fd.signals }

func main() {
	fd := NewFraudDetector()

	go func() {
		for sig := range fd.Signals() {
			fmt.Printf("FRAUD [score=%d] type=%-20s rider=%-6s trip=%-4s %s\n",
				sig.Score, sig.SignalType, sig.RiderID, sig.TripID, sig.Detail)
		}
	}()

	base := time.Now()
	events := []TripEvent{
		{TripID: "T1", RiderID: "R1", Lat: 37.77, Lng: -122.41, Timestamp: base, PaymentID: "PM1"},
		// Second simultaneous trip
		{TripID: "T2", RiderID: "R1", Lat: 37.78, Lng: -122.40, Timestamp: base.Add(time.Second), PaymentID: "PM1"},
		// Impossible speed: teleported 1 100 km in 2 seconds
		{TripID: "T3", RiderID: "R1", Lat: 47.77, Lng: -122.41, Timestamp: base.Add(2 * time.Second), PaymentID: "PM1"},
		// Payment velocity: 6 uses in <10 min
		{TripID: "T4", RiderID: "R2", Lat: 37.77, Lng: -122.41, Timestamp: base.Add(time.Minute), PaymentID: "PM2"},
		{TripID: "T5", RiderID: "R3", Lat: 37.77, Lng: -122.42, Timestamp: base.Add(2 * time.Minute), PaymentID: "PM2"},
		{TripID: "T6", RiderID: "R4", Lat: 37.77, Lng: -122.43, Timestamp: base.Add(3 * time.Minute), PaymentID: "PM2"},
		{TripID: "T7", RiderID: "R5", Lat: 37.77, Lng: -122.44, Timestamp: base.Add(4 * time.Minute), PaymentID: "PM2"},
		{TripID: "T8", RiderID: "R6", Lat: 37.77, Lng: -122.45, Timestamp: base.Add(5 * time.Minute), PaymentID: "PM2"},
		{TripID: "T9", RiderID: "R7", Lat: 37.77, Lng: -122.46, Timestamp: base.Add(6 * time.Minute), PaymentID: "PM2"},
	}

	for _, e := range events {
		fd.Process(e)
	}
	time.Sleep(100 * time.Millisecond)
}
```

**Production Notes:**
- Uber's fraud pipeline is: Kafka event stream → Go fraud service (rules) → ML scoring service → action service (block/flag/allow).
- Rule-based detection catches known patterns; gradient-boosted ML models trained on trip feature vectors catch novel patterns.
- False-positive tolerance is very low: most signals create a "soft flag" for manual review, not an immediate block.
- Feature store: pre-computed features (account age, device fingerprint, historical velocity) are fetched in <10 ms from a Redis cluster.
- Real-time scoring must complete within 50 ms P99 to avoid delaying trip start; run the fraud check asynchronously and cancel if detected.

**Edge Cases:**
- GPS spoofing: impossible-speed check catches teleportation but not subtle spoofing; supplement with device attestation (iOS SafetyNet / Android Play Integrity).
- Shared payment method (family accounts): whitelist known shared cards in the velocity check.
- `CompleteTrip` never called (crash): add a TTL-based expiry to active trips so stale entries are evicted.

---

## Problem 15: Trip Cost Calculator with Concurrent Rule Engine

**Problem Statement:**
Calculate final trip cost by evaluating a pipeline of pricing rules concurrently (base fare, per-km rate, per-minute rate, surge multiplier, promotional discounts, minimum fare). Rules are composable and independently runnable.

**Go Implementation:**

```go
package main

import (
	"context"
	"fmt"
	"math"
	"sync"
	"time"
)

type TripInput struct {
	TripID       string
	DistanceKm   float64
	DurationSec  float64
	SurgeZone    string
	RiderID      string
	PaymentType  string
}

type PriceAdjustment struct {
	RuleName string
	Delta    float64 // positive = add; negative = discount
}

type RuleResult struct {
	Adjustment PriceAdjustment
	Err        error
}

// PricingRule evaluates one pricing component and sends its adjustment to resultCh.
type PricingRule func(ctx context.Context, input TripInput, resultCh chan<- RuleResult)

// --- Individual rules ---

func baseFareRule(ctx context.Context, input TripInput, ch chan<- RuleResult) {
	select {
	case ch <- RuleResult{Adjustment: PriceAdjustment{RuleName: "base_fare", Delta: 2.50}}:
	case <-ctx.Done():
	}
}

func distanceRule(ctx context.Context, input TripInput, ch chan<- RuleResult) {
	select {
	case ch <- RuleResult{Adjustment: PriceAdjustment{RuleName: "distance", Delta: input.DistanceKm * 1.50}}:
	case <-ctx.Done():
	}
}

func timeRule(ctx context.Context, input TripInput, ch chan<- RuleResult) {
	minuteRate := 0.25
	select {
	case ch <- RuleResult{Adjustment: PriceAdjustment{RuleName: "time", Delta: (input.DurationSec / 60) * minuteRate}}:
	case <-ctx.Done():
	}
}

func surgeRule(surgeMultipliers map[string]float64) PricingRule {
	return func(ctx context.Context, input TripInput, ch chan<- RuleResult) {
		mult, ok := surgeMultipliers[input.SurgeZone]
		if !ok {
			mult = 1.0
		}
		// Surge delta = (mult - 1.0) × subtotal; we encode it as a multiplier signal.
		// For simplicity here, we pass mult as the delta and apply it in the engine.
		select {
		case ch <- RuleResult{Adjustment: PriceAdjustment{RuleName: "surge_multiplier", Delta: mult}}:
		case <-ctx.Done():
		}
	}
}

func promoRule(promos map[string]float64) PricingRule {
	return func(ctx context.Context, input TripInput, ch chan<- RuleResult) {
		discount := promos[input.RiderID] // e.g., 0.0 means no promo
		select {
		case ch <- RuleResult{Adjustment: PriceAdjustment{RuleName: "promo_discount", Delta: -discount}}:
		case <-ctx.Done():
		}
	}
}

// --- Engine ---

type CostEngine struct {
	rules []PricingRule
	minFare float64
}

func NewCostEngine(minFare float64, rules ...PricingRule) *CostEngine {
	return &CostEngine{rules: rules, minFare: minFare}
}

type CostResult struct {
	TripID      string
	Subtotal    float64
	SurgeMult   float64
	Discounts   float64
	Total       float64
	Breakdown   []PriceAdjustment
	ComputedAt  time.Time
}

func (e *CostEngine) Calculate(ctx context.Context, input TripInput) (*CostResult, error) {
	ch := make(chan RuleResult, len(e.rules))
	var wg sync.WaitGroup

	for _, rule := range e.rules {
		rule := rule
		wg.Add(1)
		go func() {
			defer wg.Done()
			rule(ctx, input, ch)
		}()
	}

	go func() {
		wg.Wait()
		close(ch)
	}()

	result := &CostResult{TripID: input.TripID, SurgeMult: 1.0, ComputedAt: time.Now()}

	for r := range ch {
		if r.Err != nil {
			return nil, r.Err
		}
		result.Breakdown = append(result.Breakdown, r.Adjustment)

		switch r.Adjustment.RuleName {
		case "surge_multiplier":
			result.SurgeMult = r.Adjustment.Delta // stored separately
		case "promo_discount":
			result.Discounts += -r.Adjustment.Delta // discounts are negative deltas
		default:
			result.Subtotal += r.Adjustment.Delta
		}
	}

	// Apply surge to the subtotal, then subtract discounts.
	total := result.Subtotal*result.SurgeMult - result.Discounts
	if total < e.minFare {
		total = e.minFare
	}
	result.Total = math.Round(total*100) / 100
	return result, nil
}

func main() {
	surgeMultipliers := map[string]float64{
		"downtown": 1.8,
		"airport":  1.2,
	}
	promos := map[string]float64{
		"rider-vip": 3.00, // $3 discount
	}

	engine := NewCostEngine(5.00,
		baseFareRule,
		distanceRule,
		timeRule,
		surgeRule(surgeMultipliers),
		promoRule(promos),
	)

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	trips := []TripInput{
		{TripID: "T1", DistanceKm: 6.5, DurationSec: 900, SurgeZone: "downtown", RiderID: "rider-1"},
		{TripID: "T2", DistanceKm: 2.0, DurationSec: 300, SurgeZone: "airport", RiderID: "rider-vip"},
		{TripID: "T3", DistanceKm: 0.3, DurationSec: 120, SurgeZone: "suburb", RiderID: "rider-2"}, // hits min fare
	}

	for _, trip := range trips {
		r, err := engine.Calculate(ctx, trip)
		if err != nil {
			fmt.Printf("%s: error %v\n", trip.TripID, err)
			continue
		}
		fmt.Printf("Trip %-4s subtotal=$%.2f surge=×%.1f discounts=$%.2f total=$%.2f\n",
			r.TripID, r.Subtotal, r.SurgeMult, r.Discounts, r.Total)
	}
}
```

**Production Notes:**
- Uber's fare engine evaluates dozens of rules; concurrent execution ensures total latency equals the slowest rule (typically the surge lookup), not the sum of all rules.
- Each rule is independently testable and deployable; new pricing experiments (dynamic per-km rates, time-of-day discounts) are added without touching other rules.
- `singleflight` deduplicate concurrent fare requests for the same trip ID to avoid redundant rule executions.
- Price audit log: every computed fare is stored immutably for regulatory compliance and dispute resolution.
- Minimum fare enforcement is the last step, after all adjustments, to avoid discounts reducing a fare below the floor.

**Edge Cases:**
- Rule panic: wrap each goroutine in a recover; send an error result to `ch` instead of panicking the engine.
- Context cancellation: the rule goroutines exit via `ctx.Done()`; the channel close ensures the result collector loop terminates.
- Floating-point precision: always round to 2 decimal places as the final step; never round intermediate values.

---

*© 2024 Gaurav Patil — GoForge Platform. All rights reserved.*
