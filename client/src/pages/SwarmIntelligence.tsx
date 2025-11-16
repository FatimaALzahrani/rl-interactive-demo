import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Bird, Home, Play, Pause, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BOID_COUNT = 80;

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export default function SwarmIntelligence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [boids, setBoids] = useState<Boid[]>([]);
  const [separationWeight, setSeparationWeight] = useState(1.5);
  const [alignmentWeight, setAlignmentWeight] = useState(1.0);
  const [cohesionWeight, setCohesionWeight] = useState(1.0);
  const frameRef = useRef(0);

  // Initialize boids
  useEffect(() => {
    const initialBoids: Boid[] = [];
    for (let i = 0; i < BOID_COUNT; i++) {
      initialBoids.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: `hsl(${Math.random() * 60 + 240}, 70%, 60%)`
      });
    }
    setBoids(initialBoids);
  }, []);

  // Update boids
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setBoids(prevBoids => {
        const newBoids = prevBoids.map(boid => {
          const neighbors: Boid[] = [];
          const separationRadius = 25;
          const neighborRadius = 50;
          
          // Find neighbors
          prevBoids.forEach(other => {
            if (other === boid) return;
            const dx = other.x - boid.x;
            const dy = other.y - boid.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < neighborRadius) {
              neighbors.push(other);
            }
          });

          let separationX = 0;
          let separationY = 0;
          let alignmentX = 0;
          let alignmentY = 0;
          let cohesionX = 0;
          let cohesionY = 0;

          // Separation: avoid crowding neighbors
          prevBoids.forEach(other => {
            if (other === boid) return;
            const dx = boid.x - other.x;
            const dy = boid.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < separationRadius && dist > 0) {
              separationX += dx / dist;
              separationY += dy / dist;
            }
          });

          if (neighbors.length > 0) {
            // Alignment: steer towards average heading of neighbors
            neighbors.forEach(neighbor => {
              alignmentX += neighbor.vx;
              alignmentY += neighbor.vy;
            });
            alignmentX /= neighbors.length;
            alignmentY /= neighbors.length;

            // Cohesion: steer towards average position of neighbors
            neighbors.forEach(neighbor => {
              cohesionX += neighbor.x;
              cohesionY += neighbor.y;
            });
            cohesionX /= neighbors.length;
            cohesionY /= neighbors.length;
            cohesionX = (cohesionX - boid.x) * 0.01;
            cohesionY = (cohesionY - boid.y) * 0.01;
          }

          // Apply forces
          let newVx = boid.vx;
          let newVy = boid.vy;

          newVx += separationX * separationWeight * 0.05;
          newVy += separationY * separationWeight * 0.05;
          newVx += alignmentX * alignmentWeight * 0.05;
          newVy += alignmentY * alignmentWeight * 0.05;
          newVx += cohesionX * cohesionWeight;
          newVy += cohesionY * cohesionWeight;

          // Limit speed
          const speed = Math.sqrt(newVx * newVx + newVy * newVy);
          const maxSpeed = 3;
          if (speed > maxSpeed) {
            newVx = (newVx / speed) * maxSpeed;
            newVy = (newVy / speed) * maxSpeed;
          }

          // Update position
          let newX = boid.x + newVx;
          let newY = boid.y + newVy;

          // Wrap around edges
          if (newX < 0) newX = CANVAS_WIDTH;
          if (newX > CANVAS_WIDTH) newX = 0;
          if (newY < 0) newY = CANVAS_HEIGHT;
          if (newY > CANVAS_HEIGHT) newY = 0;

          return {
            ...boid,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy
          };
        });

        return newBoids;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isRunning, separationWeight, alignmentWeight, cohesionWeight]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // Clear with fade effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw boids
      boids.forEach(boid => {
        ctx.save();
        ctx.translate(boid.x, boid.y);
        
        // Calculate angle from velocity
        const angle = Math.atan2(boid.vy, boid.vx);
        ctx.rotate(angle);
        
        // Draw boid as triangle
        ctx.fillStyle = boid.color;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-4, 4);
        ctx.lineTo(-4, -4);
        ctx.closePath();
        ctx.fill();
        
        // Draw glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = boid.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.restore();
      });
      
      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [boids]);

  const handleReset = () => {
    setIsRunning(false);
    const newBoids: Boid[] = [];
    for (let i = 0; i < BOID_COUNT; i++) {
      newBoids.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: `hsl(${Math.random() * 60 + 240}, 70%, 60%)`
      });
    }
    setBoids(newBoids);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bird className="w-6 h-6 text-purple-400" />
              <h1 className="text-xl font-bold text-white">Swarm Intelligence Demo</h1>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Canvas Area */}
          <div>
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Boids Flocking Simulation</CardTitle>
                <CardDescription className="text-slate-400">
                  Watch emergent flocking behavior from simple local rules (separation, alignment, cohesion)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <canvas 
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="border border-slate-700 rounded-lg bg-slate-950"
                  />
                </div>
                
                <div className="flex gap-4 mt-6 justify-center">
                  <Button
                    onClick={() => setIsRunning(!isRunning)}
                    className="gap-2"
                    variant={isRunning ? "destructive" : "default"}
                  >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isRunning ? 'Pause' : 'Start Simulation'}
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Active Boids</div>
                  <div className="text-3xl font-bold text-purple-400">{boids.length}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Average Speed</div>
                  <div className="text-3xl font-bold text-blue-400">
                    {boids.length > 0 
                      ? (boids.reduce((sum, b) => sum + Math.sqrt(b.vx * b.vx + b.vy * b.vy), 0) / boids.length).toFixed(1)
                      : '0.0'
                    }
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Behavior Weights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-300">Separation</span>
                    <span className="text-sm text-purple-400 font-mono">{separationWeight.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[separationWeight]}
                    onValueChange={([value]) => setSeparationWeight(value)}
                    min={0}
                    max={3}
                    step={0.1}
                  />
                  <p className="text-xs text-slate-500 mt-1">Avoid crowding neighbors</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-300">Alignment</span>
                    <span className="text-sm text-purple-400 font-mono">{alignmentWeight.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[alignmentWeight]}
                    onValueChange={([value]) => setAlignmentWeight(value)}
                    min={0}
                    max={3}
                    step={0.1}
                  />
                  <p className="text-xs text-slate-500 mt-1">Steer towards average heading</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-300">Cohesion</span>
                    <span className="text-sm text-purple-400 font-mono">{cohesionWeight.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[cohesionWeight]}
                    onValueChange={([value]) => setCohesionWeight(value)}
                    min={0}
                    max={3}
                    step={0.1}
                  />
                  <p className="text-xs text-slate-500 mt-1">Move towards center of mass</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-sm">How it works</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 space-y-2">
                <p>Each boid follows three simple rules:</p>
                <p><strong className="text-purple-400">Separation:</strong> Maintain distance from neighbors</p>
                <p><strong className="text-purple-400">Alignment:</strong> Match velocity with neighbors</p>
                <p><strong className="text-purple-400">Cohesion:</strong> Move towards group center</p>
                <p className="pt-2">Complex flocking emerges from these local interactions!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
