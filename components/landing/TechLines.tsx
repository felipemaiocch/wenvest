'use client';

import { useEffect, useRef } from 'react';

type TechLinesProps = {
    className?: string;
};

export function TechLines({ className }: TechLinesProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();
        window.addEventListener('resize', resize);

        // Pontos que se conectam em rede
        const nodes = Array.from({ length: 68 }).map(() => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
        }));

        let frame: number;
        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            ctx.clearRect(0, 0, width, height);

            nodes.forEach((n, i) => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < -20) n.x = width + 20;
                if (n.x > width + 20) n.x = -20;
                if (n.y < -20) n.y = height + 20;
                if (n.y > height + 20) n.y = -20;

                // conexões próximas
                for (let j = i + 1; j < nodes.length; j++) {
                    const m = nodes[j];
                    const dx = n.x - m.x;
                    const dy = n.y - m.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 220) {
                        const opacity = Math.max(0, 1 - dist / 220) * 0.14;
                        ctx.strokeStyle = `rgba(252,191,24,${opacity})`;
                        ctx.lineWidth = 0.45;
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        ctx.lineTo(m.x, m.y);
                        ctx.stroke();
                    }
                }

                // pontos
                ctx.fillStyle = 'rgba(252,191,24,0.7)';
                ctx.beginPath();
                ctx.arc(n.x, n.y, 1.1, 0, Math.PI * 2);
                ctx.fill();
            });

            frame = requestAnimationFrame(draw);
        };

        frame = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-none ${className ?? ''}`}
        />
    );
}
