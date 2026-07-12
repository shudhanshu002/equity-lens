"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import * as THREE from "three";
import {
    ArrowRight,
    Bot,
    FileBarChart2,
    LineChart,
    Newspaper,
} from "lucide-react";
import type { AppTab } from "@/lib/frontend/app-tabs";

const HERO_FEATURES = [
    "Financial health scoring",
    "News and sentiment context",
    "Risk and confidence summary",
    "Export-ready investment memo",
];

export function HomeHeroSection({
    onTabChange,
    onPickResearch,
}: {
    onTabChange: (tab: AppTab) => void;
    onPickResearch?: (company: string) => void;
}) {
    const { status } = useSession();

    const isLoggedIn = status === "authenticated";

    function handlePrimaryClick() {
        if (isLoggedIn) {
            onTabChange("research");
            return;
        }

        onTabChange("research");
    }

    function handleDemoClick() {
        if (onPickResearch) {
            onPickResearch("NVIDIA");
            return;
        }

        onTabChange("research");
    }

    return (
        <section className="relative pt-8 md:pt-12">
            <div className="relative min-h-[620px] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:shadow-black/30">
                <HeroAgentScene />

                <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(2,6,23,0.94)_0%,_rgba(2,6,23,0.82)_36%,_rgba(2,6,23,0.34)_68%,_rgba(2,6,23,0.1)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/80 to-transparent" />

                <div className="relative z-10 flex min-h-[620px] max-w-3xl flex-col justify-between px-6 py-8 text-white md:px-10 md:py-12">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200/85">
                            Equity1Lens research workspace
                        </p>

                        <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                            Investment research, scored and explained.
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200/90">
                            Evaluate public companies with fundamentals, news context,
                            risk signals, and a clear investment memo in one focused
                            workspace.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                onClick={handlePrimaryClick}
                                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5"
                            >
                                {isLoggedIn ? "Start Research" : "Open Workspace"}
                                <ArrowRight className="h-4 w-4" />
                            </button>

                            <button
                                onClick={handleDemoClick}
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-black text-white shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/15"
                            >
                                View NVIDIA example
                            </button>
                        </div>
                    </div>

                    <div className="mt-10 grid gap-2.5 sm:grid-cols-2">
                        {HERO_FEATURES.map((item) => (
                            <div
                                key={item}
                                className="rounded-xl border border-white/10 bg-white/10 px-3.5 py-3 text-sm font-bold text-white/90 backdrop-blur-md"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-5 right-5 z-10 hidden w-full max-w-md grid-cols-3 gap-3 lg:grid">
                    <HeroMetric label="Score" value="92" />
                    <HeroMetric label="Risk" value="Medium" />
                    <HeroMetric label="Signal" value="Buy" />
                </div>
            </div>
        </section>
    );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white shadow-xl backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/55">
                {label}
            </p>
            <p className="mt-1 text-lg font-black">{value}</p>
        </div>
    );
}

function HeroAgentScene() {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const mount = mountRef.current;
        const canvas = canvasRef.current;

        if (!mount || !canvas) return;

        const container = mount;
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0f172a, 9, 20);

        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
        camera.position.set(0, 5.2, 10.5);
        camera.lookAt(0, 0.2, 0);

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            canvas,
            preserveDrawingBuffer: true,
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
        keyLight.position.set(2, 6, 5);
        scene.add(keyLight);

        const accentLight = new THREE.PointLight(0x22d3ee, 8, 18);
        accentLight.position.set(-4, 2.2, 4);
        scene.add(accentLight);

        const group = new THREE.Group();
        scene.add(group);

        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(4.7, 5.4, 0.18, 96),
            new THREE.MeshStandardMaterial({
                color: 0x0f766e,
                metalness: 0.2,
                roughness: 0.42,
            })
        );
        base.position.y = -1.28;
        group.add(base);

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(3.9, 0.025, 12, 160),
            new THREE.MeshStandardMaterial({
                color: 0x67e8f9,
                emissive: 0x155e75,
                emissiveIntensity: 0.9,
            })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -1.08;
        group.add(ring);

        const centerNode = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.72, 2),
            new THREE.MeshStandardMaterial({
                color: 0x111827,
                emissive: 0x0e7490,
                emissiveIntensity: 0.35,
                metalness: 0.55,
                roughness: 0.25,
            })
        );
        centerNode.position.y = 0.45;
        group.add(centerNode);

        const agentPositions = [
            new THREE.Vector3(-3.1, 0.2, -0.8),
            new THREE.Vector3(-1.15, 1.08, -1.8),
            new THREE.Vector3(1.25, 1.05, -1.75),
            new THREE.Vector3(3.15, 0.18, -0.7),
            new THREE.Vector3(0, -0.15, 2.35),
        ];

        const agentColors = [0x22d3ee, 0xa78bfa, 0x34d399, 0xfbbf24, 0x60a5fa];
        const agents = agentPositions.map((position, index) => {
            const node = new THREE.Mesh(
                new THREE.SphereGeometry(0.34, 32, 32),
                new THREE.MeshStandardMaterial({
                    color: agentColors[index],
                    emissive: agentColors[index],
                    emissiveIntensity: 0.24,
                    metalness: 0.15,
                    roughness: 0.28,
                })
            );
            node.position.copy(position);
            group.add(node);

            const connector = makeConnector(centerNode.position, position);
            group.add(connector);

            return node;
        });

        const bars = [0.9, 1.4, 2.1, 1.65, 2.65].map((height, index) => {
            const bar = new THREE.Mesh(
                new THREE.BoxGeometry(0.38, height, 0.38),
                new THREE.MeshStandardMaterial({
                    color: index % 2 === 0 ? 0x22d3ee : 0x34d399,
                    emissive: index % 2 === 0 ? 0x164e63 : 0x065f46,
                    emissiveIntensity: 0.3,
                    metalness: 0.2,
                    roughness: 0.36,
                })
            );
            bar.position.set(1.7 + index * 0.48, -1.05 + height / 2, 1.35);
            group.add(bar);
            return bar;
        });

        const memoPanel = new THREE.Mesh(
            new THREE.BoxGeometry(1.95, 1.25, 0.08),
            new THREE.MeshStandardMaterial({
                color: 0xf8fafc,
                metalness: 0.05,
                roughness: 0.45,
            })
        );
        memoPanel.position.set(-2.55, 0.52, 1.45);
        memoPanel.rotation.y = 0.28;
        group.add(memoPanel);

        const memoLines = [0.42, 0.78, 1.12].map((width, index) => {
            const line = new THREE.Mesh(
                new THREE.BoxGeometry(width, 0.055, 0.045),
                new THREE.MeshStandardMaterial({
                    color: index === 0 ? 0x0f172a : 0x94a3b8,
                    roughness: 0.5,
                })
            );
            line.position.set(-2.95 + width / 2, 0.83 - index * 0.28, 1.52);
            line.rotation.y = 0.28;
            group.add(line);
            return line;
        });

        const particles = new THREE.Points(
            new THREE.BufferGeometry().setAttribute(
                "position",
                new THREE.Float32BufferAttribute(createParticlePositions(140), 3)
            ),
            new THREE.PointsMaterial({
                color: 0xbae6fd,
                size: 0.035,
                transparent: true,
                opacity: 0.8,
            })
        );
        scene.add(particles);

        const clock = new THREE.Clock();
        let animationFrame = 0;

        function resize() {
            const { width, height } = container.getBoundingClientRect();
            const narrow = width < 640;

            renderer.setSize(width, height, false);
            group.scale.setScalar(narrow ? 0.78 : 1);
            camera.position.set(0, narrow ? 5.6 : 5.2, narrow ? 13 : 10.5);
            camera.lookAt(0, 0.2, 0);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }

        function animate() {
            const elapsed = clock.getElapsedTime();

            centerNode.rotation.x = elapsed * 0.32;
            centerNode.rotation.y = elapsed * 0.42;
            ring.rotation.z = elapsed * 0.18;
            group.rotation.y = Math.sin(elapsed * 0.35) * 0.13;
            particles.rotation.y = elapsed * 0.025;

            agents.forEach((agent, index) => {
                agent.position.y =
                    agentPositions[index].y + Math.sin(elapsed * 1.5 + index) * 0.08;
            });

            bars.forEach((bar, index) => {
                const scale = 0.86 + Math.sin(elapsed * 1.8 + index * 0.6) * 0.08;
                bar.scale.y = scale;
            });

            memoLines.forEach((line, index) => {
                line.scale.x = 0.9 + Math.sin(elapsed * 1.4 + index) * 0.05;
            });

            renderer.render(scene, camera);
            animationFrame = window.requestAnimationFrame(animate);
        }

        resize();
        animate();
        window.addEventListener("resize", resize);

        return () => {
            window.removeEventListener("resize", resize);
            window.cancelAnimationFrame(animationFrame);
            renderer.dispose();
            disposeObject(scene);
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,_rgba(186,230,253,0.95),_rgba(34,197,94,0.22)_38%,_rgba(15,23,42,0.94)_82%)]"
        >
            <canvas
                ref={canvasRef}
                aria-label="Animated 3D EquityLens research agent workflow"
                className="h-full w-full"
            />
        </div>
    );
}

function makeConnector(start: THREE.Vector3, end: THREE.Vector3) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const geometry = new THREE.CylinderGeometry(0.015, 0.015, length, 12);
    const material = new THREE.MeshStandardMaterial({
        color: 0x67e8f9,
        emissive: 0x155e75,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.78,
    });
    const cylinder = new THREE.Mesh(geometry, material);
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    cylinder.position.copy(midpoint);
    cylinder.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize()
    );

    return cylinder;
}

function createParticlePositions(count: number) {
    const positions: number[] = [];

    for (let index = 0; index < count; index += 1) {
        positions.push(
            (Math.random() - 0.5) * 12,
            Math.random() * 5 - 1,
            (Math.random() - 0.5) * 8
        );
    }

    return positions;
}

function disposeObject(object: THREE.Object3D) {
    object.traverse((child) => {
        const mesh = child as THREE.Mesh;

        if (mesh.geometry) {
            mesh.geometry.dispose();
        }

        const material = mesh.material;

        if (Array.isArray(material)) {
            material.forEach((item) => item.dispose());
        } else if (material) {
            material.dispose();
        }
    });
}

function HeroMacWindow() {
    return (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 dark:border-white/10 dark:bg-slate-950 dark:shadow-black/40">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span className="h-3 w-3 rounded-full bg-green-400" />
                </div>

                <div className="rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-black text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    EquityLens Research Workspace
                </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[0.78fr_1.22fr]">
                <div className="border-b border-slate-200 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.03] lg:border-b-0 lg:border-r">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-700 dark:text-cyan-300">
                                <Bot className="h-5 w-5" />
                            </div>

                            <div>
                                <p className="text-sm font-black text-slate-950 dark:text-white">
                                    Ask EquityLens
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Analyze NVIDIA and explain the risks.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        <ProgressRow label="Resolving Company" done />
                        <ProgressRow label="Fetching Financial Statements" done />
                        <ProgressRow label="Gathering News" done />
                        <ProgressRow label="Running Sentiment Model" done />
                        <ProgressRow label="Calculating Financial Scores" done />
                        <ProgressRow label="Generating Investment Thesis" />
                    </div>
                </div>

                <div className="p-5">
                    <div className="grid gap-4 md:grid-cols-3">
                        <MetricCard
                            icon={<LineChart className="h-4 w-4" />}
                            label="Revenue Growth"
                            value="+21.4%"
                            tone="cyan"
                        />
                        <MetricCard
                            icon={<FileBarChart2 className="h-4 w-4" />}
                            label="Financial Score"
                            value="89 / 100"
                            tone="emerald"
                        />
                        <MetricCard
                            icon={<Newspaper className="h-4 w-4" />}
                            label="Sentiment"
                            value="Positive"
                            tone="violet"
                        />
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                                    Investment Memo
                                </h3>

                                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
                                    BUY
                                </span>
                            </div>

                            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                                Strong earnings momentum, resilient margins, and durable demand
                                support a favorable investment case. Valuation remains elevated,
                                but fundamentals justify a constructive outlook.
                            </p>

                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                <SmallInfo label="Confidence" value="91%" />
                                <SmallInfo label="Risk" value="Medium" />
                                <SmallInfo label="Export" value="Ready" />
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                            <h3 className="text-lg font-black text-slate-950 dark:text-white">
                                Decision Breakdown
                            </h3>

                            <div className="mt-4 space-y-3">
                                <ScoreBar label="Financial Health" value={94} />
                                <ScoreBar label="Growth" value={89} />
                                <ScoreBar label="Valuation" value={63} />
                                <ScoreBar label="Sentiment" value={78} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProgressRow({
    label,
    done = false,
}: {
    label: string;
    done?: boolean;
}) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <span
                className={`h-2.5 w-2.5 rounded-full ${done ? "bg-emerald-500" : "bg-cyan-500"
                    }`}
            />

            <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                {label}
            </span>
        </div>
    );
}

function MetricCard({
    icon,
    label,
    value,
    tone,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    tone: "cyan" | "emerald" | "violet";
}) {
    const toneClass =
        tone === "cyan"
            ? "bg-cyan-400/10 text-cyan-700 dark:text-cyan-300"
            : tone === "emerald"
                ? "bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
                : "bg-violet-400/10 text-violet-700 dark:text-violet-300";

    return (
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}
            >
                {icon}
            </div>

            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}

function SmallInfo({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-sm font-black text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}

function ScoreBar({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                    {label}
                </span>
                <span className="text-sm font-black text-slate-950 dark:text-white">
                    {value}%
                </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                    className="h-full rounded-full bg-slate-950 dark:bg-white"
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
