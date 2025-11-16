import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Brain, Home, Play, Pause, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";

const GRID_SIZE = 8;
const CELL_SIZE = 60;

type CellType = 'empty' | 'goal' | 'obstacle' | 'agent';

interface QValue {
  up: number;
  down: number;
  left: number;
  right: number;
}

export default function QLearning() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [learningRate, setLearningRate] = useState(0.1);
  const [discountFactor, setDiscountFactor] = useState(0.9);
  const [explorationRate, setExplorationRate] = useState(0.2);
  const [episode, setEpisode] = useState(0);
  const [totalReward, setTotalReward] = useState(0);
  
  // Initialize grid
  const [grid, setGrid] = useState<CellType[][]>(() => {
    const newGrid: CellType[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty'));
    // Set goal
    newGrid[1][GRID_SIZE - 2] = 'goal';
    // Set obstacles
    newGrid[3][2] = 'obstacle';
    newGrid[3][3] = 'obstacle';
    newGrid[3][4] = 'obstacle';
    newGrid[5][5] = 'obstacle';
    newGrid[5][6] = 'obstacle';
    return newGrid;
  });
  
  const [agentPos, setAgentPos] = useState({ x: 0, y: GRID_SIZE - 1 });
  const [qTable, setQTable] = useState<QValue[][]>(() => 
    Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => ({ up: 0, down: 0, left: 0, right: 0 }))
    )
  );

  // Draw grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cells
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const cellX = x * CELL_SIZE;
        const cellY = y * CELL_SIZE;
        
        // Draw cell background
        if (grid[y][x] === 'goal') {
          ctx.fillStyle = '#22c55e';
        } else if (grid[y][x] === 'obstacle') {
          ctx.fillStyle = '#ef4444';
        } else {
          // Color based on Q-values
          const maxQ = Math.max(...Object.values(qTable[y][x]));
          const intensity = Math.min(255, Math.max(0, maxQ * 50));
          ctx.fillStyle = `rgba(59, 130, 246, ${intensity / 255 * 0.3})`;
        }
        ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
        
        // Draw grid lines
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
        
        // Draw Q-value arrows
        if (grid[y][x] === 'empty') {
          const q = qTable[y][x];
          const maxQ = Math.max(...Object.values(q));
          
          if (maxQ > 0.1) {
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 2;
            const centerX = cellX + CELL_SIZE / 2;
            const centerY = cellY + CELL_SIZE / 2;
            const arrowSize = 15;
            
            // Draw arrow for best action
            if (q.up === maxQ) {
              ctx.beginPath();
              ctx.moveTo(centerX, centerY);
              ctx.lineTo(centerX, centerY - arrowSize);
              ctx.lineTo(centerX - 5, centerY - arrowSize + 5);
              ctx.moveTo(centerX, centerY - arrowSize);
              ctx.lineTo(centerX + 5, centerY - arrowSize + 5);
              ctx.stroke();
            }
            if (q.down === maxQ) {
              ctx.beginPath();
              ctx.moveTo(centerX, centerY);
              ctx.lineTo(centerX, centerY + arrowSize);
              ctx.lineTo(centerX - 5, centerY + arrowSize - 5);
              ctx.moveTo(centerX, centerY + arrowSize);
              ctx.lineTo(centerX + 5, centerY + arrowSize - 5);
              ctx.stroke();
            }
            if (q.left === maxQ) {
              ctx.beginPath();
              ctx.moveTo(centerX, centerY);
              ctx.lineTo(centerX - arrowSize, centerY);
              ctx.lineTo(centerX - arrowSize + 5, centerY - 5);
              ctx.moveTo(centerX - arrowSize, centerY);
              ctx.lineTo(centerX - arrowSize + 5, centerY + 5);
              ctx.stroke();
            }
            if (q.right === maxQ) {
              ctx.beginPath();
              ctx.moveTo(centerX, centerY);
              ctx.lineTo(centerX + arrowSize, centerY);
              ctx.lineTo(centerX + arrowSize - 5, centerY - 5);
              ctx.moveTo(centerX + arrowSize, centerY);
              ctx.lineTo(centerX + arrowSize - 5, centerY + 5);
              ctx.stroke();
            }
          }
        }
      }
    }
    
    // Draw agent
    const agentX = agentPos.x * CELL_SIZE + CELL_SIZE / 2;
    const agentY = agentPos.y * CELL_SIZE + CELL_SIZE / 2;
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(agentX, agentY, CELL_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [grid, agentPos, qTable]);

  // Q-Learning algorithm
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setAgentPos(prev => {
        const { x, y } = prev;
        
        // Check if reached goal
        if (grid[y][x] === 'goal') {
          setEpisode(e => e + 1);
          setTotalReward(r => r + 10);
          return { x: 0, y: GRID_SIZE - 1 }; // Reset to start
        }
        
        // Choose action (epsilon-greedy)
        let action: 'up' | 'down' | 'left' | 'right';
        if (Math.random() < explorationRate) {
          // Explore
          const actions: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right'];
          action = actions[Math.floor(Math.random() * actions.length)];
        } else {
          // Exploit
          const q = qTable[y][x];
          const maxQ = Math.max(...Object.values(q));
          const bestActions = (Object.keys(q) as Array<'up' | 'down' | 'left' | 'right'>).filter(a => q[a] === maxQ);
          action = bestActions[Math.floor(Math.random() * bestActions.length)];
        }
        
        // Calculate new position
        let newX = x;
        let newY = y;
        if (action === 'up') newY = Math.max(0, y - 1);
        if (action === 'down') newY = Math.min(GRID_SIZE - 1, y + 1);
        if (action === 'left') newX = Math.max(0, x - 1);
        if (action === 'right') newX = Math.min(GRID_SIZE - 1, x + 1);
        
        // Check if hit obstacle
        if (grid[newY][newX] === 'obstacle') {
          newX = x;
          newY = y;
        }
        
        // Calculate reward
        let reward = -0.1; // Step penalty
        if (grid[newY][newX] === 'goal') reward = 10;
        if (grid[newY][newX] === 'obstacle') reward = -5;
        
        // Update Q-value
        setQTable(prevQTable => {
          const newQTable = prevQTable.map(row => row.map(cell => ({ ...cell })));
          const oldQ = newQTable[y][x][action];
          const maxNextQ = Math.max(...Object.values(newQTable[newY][newX]));
          const newQ = oldQ + learningRate * (reward + discountFactor * maxNextQ - oldQ);
          newQTable[y][x][action] = newQ;
          return newQTable;
        });
        
        return { x: newX, y: newY };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, grid, qTable, learningRate, discountFactor, explorationRate]);

  const handleReset = () => {
    setIsRunning(false);
    setAgentPos({ x: 0, y: GRID_SIZE - 1 });
    setEpisode(0);
    setTotalReward(0);
    setQTable(Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => ({ up: 0, down: 0, left: 0, right: 0 }))
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Q-Learning Demo</h1>
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
                <CardTitle className="text-white">Grid World Environment</CardTitle>
                <CardDescription className="text-slate-400">
                  The agent (blue circle) learns to reach the goal (green) while avoiding obstacles (red)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <canvas 
                    ref={canvasRef}
                    width={GRID_SIZE * CELL_SIZE}
                    height={GRID_SIZE * CELL_SIZE}
                    className="border border-slate-700 rounded-lg"
                  />
                </div>
                
                <div className="flex gap-4 mt-6 justify-center">
                  <Button
                    onClick={() => setIsRunning(!isRunning)}
                    className="gap-2"
                    variant={isRunning ? "destructive" : "default"}
                  >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isRunning ? 'Pause' : 'Start Learning'}
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
                  <div className="text-sm text-slate-400 mb-1">Episode</div>
                  <div className="text-3xl font-bold text-blue-400">{episode}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Total Reward</div>
                  <div className="text-3xl font-bold text-green-400">{totalReward.toFixed(1)}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Hyperparameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-300">Learning Rate (α)</span>
                    <span className="text-sm text-blue-400 font-mono">{learningRate.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[learningRate]}
                    onValueChange={([value]) => setLearningRate(value)}
                    min={0.01}
                    max={1}
                    step={0.01}
                    disabled={isRunning}
                  />
                  <p className="text-xs text-slate-500 mt-1">How much new information overrides old</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-300">Discount Factor (γ)</span>
                    <span className="text-sm text-blue-400 font-mono">{discountFactor.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[discountFactor]}
                    onValueChange={([value]) => setDiscountFactor(value)}
                    min={0}
                    max={1}
                    step={0.01}
                    disabled={isRunning}
                  />
                  <p className="text-xs text-slate-500 mt-1">Importance of future rewards</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-300">Exploration Rate (ε)</span>
                    <span className="text-sm text-blue-400 font-mono">{explorationRate.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[explorationRate]}
                    onValueChange={([value]) => setExplorationRate(value)}
                    min={0}
                    max={1}
                    step={0.01}
                    disabled={isRunning}
                  />
                  <p className="text-xs text-slate-500 mt-1">Probability of random exploration</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-sm">How it works</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 space-y-2">
                <p>The agent learns through trial and error using the Q-Learning algorithm.</p>
                <p>Blue arrows show the learned policy (best action for each state).</p>
                <p>Brighter cells indicate higher expected rewards.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
