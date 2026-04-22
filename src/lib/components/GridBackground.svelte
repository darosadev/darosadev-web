<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animationId: number;
		let scrollY = 0;
		let targetScrollY = 0;
		let mouseX = -1000;
		let mouseY = -1000;
		let targetMouseX = -1000;
		let targetMouseY = -1000;

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

		const handleMouseMove = (e: MouseEvent) => {
			targetMouseX = e.clientX;
			targetMouseY = e.clientY;
		};

		const handleMouseLeave = () => {
			targetMouseX = -1000;
			targetMouseY = -1000;
		};

		resize();
		window.addEventListener('resize', resize);
		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('mousemove', handleMouseMove, { passive: true });
		window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const gridSize = 40;
		const influenceRadius = 180;
		const maxSquareSize = 3.5;
		const minSquareSize = 0.6;
		const baseAlpha = 0.03;
		const maxAlpha = 0.22;

		const smoothstep = (edge0: number, edge1: number, x: number) => {
			const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
			return t * t * (3 - 2 * t);
		};

		const draw = () => {
			if (!ctx) return;
			const w = window.innerWidth;
			const h = window.innerHeight;

			ctx.clearRect(0, 0, w, h);

			// Smooth interpolation
			scrollY += (targetScrollY - scrollY) * 0.05;
			if (!prefersReducedMotion) {
				mouseX += (targetMouseX - mouseX) * 0.12;
				mouseY += (targetMouseY - mouseY) * 0.12;
			} else {
				mouseX = targetMouseX;
				mouseY = targetMouseY;
			}

			const offsetY = scrollY * 0.3;
			const cols = Math.ceil(w / gridSize) + 1;
			const rows = Math.ceil(h / gridSize) + 1;

			// Draw faint grid lines
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

			// Interactive vertex squares
			if (mouseX > -500 && mouseY > -500) {
				const cellCol = Math.floor(mouseX / gridSize);
				const cellRow = Math.floor((mouseY + offsetY) / gridSize);

				const cellRadius = Math.ceil(influenceRadius / gridSize) + 1;

				const startCol = Math.max(0, cellCol - cellRadius);
				const endCol = Math.min(cols, cellCol + cellRadius);
				const startRow = Math.max(0, cellRow - cellRadius);
				const endRow = Math.min(rows, cellRow + cellRadius);

				for (let i = startCol; i <= endCol; i++) {
					for (let j = startRow; j <= endRow; j++) {
						const x = i * gridSize;
						const y = j * gridSize - (offsetY % gridSize);

						const dx = x - mouseX;
						const dy = y - mouseY;
						const dist = Math.sqrt(dx * dx + dy * dy);

						if (dist > influenceRadius) continue;

						const t = smoothstep(0, influenceRadius, dist);
						const intensity = 1 - t;

						const size = minSquareSize + intensity * (maxSquareSize - minSquareSize);
						const alpha = baseAlpha + intensity * (maxAlpha - baseAlpha);

						if (alpha < 0.02) continue;

						// Muted teal squares
						const r = 148;
						const g = 226;
						const b = 213;

						ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
						ctx.fillRect(x - size / 2, y - size / 2, size, size);
					}
				}
			}

			animationId = requestAnimationFrame(draw);
		};

		draw();

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener('resize', resize);
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseleave', handleMouseLeave);
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="fixed inset-0 pointer-events-none"
	style="z-index: 0;"
></canvas>
