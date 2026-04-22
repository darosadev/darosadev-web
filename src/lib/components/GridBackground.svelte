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
		let time = 0;

		const draw = () => {
			if (!ctx) return;
			const w = window.innerWidth;
			const h = window.innerHeight;

			ctx.clearRect(0, 0, w, h);

			// Smooth scroll interpolation
			scrollY += (targetScrollY - scrollY) * 0.05;

			const offsetY = scrollY * 0.3;
			const cols = Math.ceil(w / gridSize) + 1;
			const rows = Math.ceil(h / gridSize) + 1;

			ctx.strokeStyle = 'rgba(180, 190, 254, 0.06)';
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

			// Subtle intersection dots
			if (!prefersReducedMotion) {
				time += 0.005;
				for (let i = 0; i <= cols; i++) {
					for (let j = 0; j <= rows; j++) {
						const x = i * gridSize;
						const y = j * gridSize - (offsetY % gridSize);
						const dist = Math.sqrt(
							Math.pow(x - w / 2, 2) + Math.pow(y - h / 2, 2)
						);
						const maxDist = Math.sqrt(Math.pow(w / 2, 2) + Math.pow(h / 2, 2));
						const normalizedDist = dist / maxDist;
						const pulse = Math.sin(time + normalizedDist * Math.PI * 2) * 0.5 + 0.5;
						const alpha = (1 - normalizedDist) * pulse * 0.15;

						if (alpha > 0.02) {
							ctx.fillStyle = `rgba(180, 190, 254, ${alpha})`;
							ctx.beginPath();
							ctx.arc(x, y, 1.2, 0, Math.PI * 2);
							ctx.fill();
						}
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
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="fixed inset-0 pointer-events-none"
	style="z-index: 0;"
></canvas>
