<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animationId: number;
		let scrollY = 0;
		let targetScrollY = 0;

		const dpr = window.devicePixelRatio || 1;

		const resize = () => {
			const w = window.innerWidth;
			const h = window.innerHeight;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			canvas.style.width = w + 'px';
			canvas.style.height = h + 'px';
			ctx!.setTransform(1, 0, 0, 1, 0, 0);
			ctx!.scale(dpr, dpr);
		};

		const handleScroll = () => {
			targetScrollY = window.scrollY;
		};

		resize();
		window.addEventListener('resize', resize);
		window.addEventListener('scroll', handleScroll, { passive: true });

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const gridSize = 40;
		const baseDotSize = 1.2;
		const baseAlpha = 0.04;
		const activeDotSize = 2.5;
		const activeAlpha = 0.28;
		const spotRadius = 180;
		const numSpots = 3;
		const relocateInterval = 5000; // ms between relocations
		const travelDuration = 4000; // ms to glide to new position

		interface Spot {
			x: number;
			y: number;
			fromX: number;
			fromY: number;
			toX: number;
			toY: number;
			travelStart: number;
			isTraveling: boolean;
		}

		let spots: Spot[] = [];
		let lastRelocation = 0;

		function randomPos(w: number, h: number) {
			return {
				x: Math.random() * w,
				y: Math.random() * h
			};
		}

		function createSpot(w: number, h: number): Spot {
			const pos = randomPos(w, h);
			return {
				x: pos.x,
				y: pos.y,
				fromX: pos.x,
				fromY: pos.y,
				toX: pos.x,
				toY: pos.y,
				travelStart: 0,
				isTraveling: false
			};
		}

		const smoothstep = (edge0: number, edge1: number, x: number) => {
			const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
			return t * t * (3 - 2 * t);
		};

		// Init
		const w = window.innerWidth;
		const h = window.innerHeight;
		for (let i = 0; i < numSpots; i++) {
			spots.push(createSpot(w, h));
		}
		lastRelocation = performance.now();

		const draw = () => {
			if (!ctx) return;
			const w = window.innerWidth;
			const h = window.innerHeight;

			ctx.clearRect(0, 0, w, h);

			scrollY += (targetScrollY - scrollY) * 0.05;
			const offsetY = scrollY * 0.3;
			const cols = Math.ceil(w / gridSize) + 1;
			const rows = Math.ceil(h / gridSize) + 1;
			const now = performance.now();

			// Every interval, pick a random spot and give it a new target
			if (!prefersReducedMotion && now - lastRelocation > relocateInterval) {
				const idx = Math.floor(Math.random() * spots.length);
				const spot = spots[idx];
				const next = randomPos(w, h);
				spot.fromX = spot.x;
				spot.fromY = spot.y;
				spot.toX = next.x;
				spot.toY = next.y;
				spot.travelStart = now;
				spot.isTraveling = true;
				lastRelocation = now;
			}

			// Update spot positions
			for (const spot of spots) {
				if (spot.isTraveling) {
					const t = Math.min(1, (now - spot.travelStart) / travelDuration);
					const ease = smoothstep(0, 1, t);
					spot.x = spot.fromX + (spot.toX - spot.fromX) * ease;
					spot.y = spot.fromY + (spot.toY - spot.fromY) * ease;
					if (t >= 1) spot.isTraveling = false;
				}
			}

			// Draw grid lines
			ctx.strokeStyle = 'rgba(180, 190, 254, 0.035)';
			ctx.lineWidth = 1;

			for (let i = 0; i <= cols; i++) {
				const x = i * gridSize;
				ctx.beginPath();
				ctx.moveTo(x, -offsetY % gridSize);
				ctx.lineTo(x, h);
				ctx.stroke();
			}

			for (let j = 0; j <= rows; j++) {
				const y = j * gridSize - (offsetY % gridSize);
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(w, y);
				ctx.stroke();
			}

			// Draw all vertices with spot influence
			for (let i = 0; i <= cols; i++) {
				for (let j = 0; j <= rows; j++) {
					const x = i * gridSize;
					const y = j * gridSize - (offsetY % gridSize);

					let spotIntensity = 0;

					for (const spot of spots) {
						const dx = x - spot.x;
						const dy = y - spot.y;
						const dist = Math.sqrt(dx * dx + dy * dy);

						if (dist < spotRadius) {
							spotIntensity += 1 - smoothstep(0, spotRadius, dist);
						}
					}

					// Cap intensity so overlapping spots don't blow out
					spotIntensity = Math.min(spotIntensity, 1);

					const size = baseDotSize + spotIntensity * (activeDotSize - baseDotSize);
					const alpha = baseAlpha + spotIntensity * (activeAlpha - baseAlpha);

					if (alpha < 0.005) continue;

					ctx.fillStyle = `rgba(148, 226, 213, ${alpha})`;
					ctx.beginPath();
					ctx.arc(x, y, size, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			animationId = requestAnimationFrame(draw);
		};

		draw();

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener('resize', resize);
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="fixed inset-0 pointer-events-none"
	style="z-index: 0;"
></canvas>
