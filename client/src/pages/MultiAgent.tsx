import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Users, Home, Play, Pause, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";

const GRID_SIZE = 8;
const CELL_SIZE = 60;
const NUM_AGENTS = 3;

type CellType = 'empty' | 'goal1' | 'goal2' | 'goal3' | 'obstacle';

interface QValue {
  up: number;
  down: number;
  left: number;
  right: number;
}

interface Agent {
  id: number;
  x: number;
  y: number;
  goalX: number;
  goalY: number;
  color: string;
  goalColor: string;
  qTable: QValue[][];
  totalReward: number;
  reachedGoal: number;
}

export default function MultiAgent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [learningRate, setLearningRate] = useState(0.1);
  const [discountFactor, setDiscountFactor] = useState(0.9);
  const [explorationRate, setExplorationRate] = useState(0.2);
  const [episode, setEpisode] = useState(0);
  
  // Initialize grid
  const [grid] = useState<CellType[][]>(() => {
    const newGrid: CellType[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty'));
    // Set goals
    newGrid[1][GRID_SIZE - 2] = 'goal1';
    newGrid[GRID_SIZE - 2][GRID_SIZE - 2] = 'goal2';
    newGrid[GRID_SIZE - 2][1] = 'goal3';
    // Set obstacles
    newGrid[3][3] = 'obstacle';
    newGrid[3][4] = 'obstacle';
    newGrid[4][3] = 'obstacle';
    newGrid[5][5] = 'obstacle';
    newGrid[5][6] = 'obstacle';
    return newGrid;
  });
  
  const [agents, setAgents] = useState<Agent[]>(() => [
    {
      id: 1,
      x: 0,
      y: 0,
      goalX: GRID_SIZE - 2,
      goalY: 1,
      color: '#3b82f6',
      goalColor: '#3b82f6',
      qTable: Array(GRID_SIZE).fill(null).map(() => 
        Array(GRID_SIZE).fill(null).map(() => ({ up: 0, down: 0, left: 0, right: 0 }))
      ),
      totalReward: 0,
      reachedGoal: 0
    },
    {
      id: 2,
      x: GRID_SIZE - 1,
      y: 0,
      goalX: GRID_SIZE - 2,
      goalY: GRID_SIZE - 2,
      color: '#22c55e',
      goalColor: '#22c55e',
      qTable: Array(GRID_SIZE).fill(null).map(() => 
        Array(GRID_SIZE).fill(null).map(() => ({ up: 0, down: 0, left: 0, right: 0 }))
      ),
      totalReward: 0,
      reachedGoal: 0
    },
    {
      id: 3,
      x: 0,
      y: GRID_SIZE - 1,
      goalX: 1,
      goalY: GRID_SIZE - 2,
      color: '#f59e0b',
      goalColor: '#f59e0b',
      qTable: Array(GRID_SIZE).fill(null).map(() => 
        Array(GRID_SIZE).fill(null).map(() => ({ up: 0, down: 0, left: 0, right: 0 }))
      ),
      totalReward: 0,
      reachedGoal: 0
    }
  ]);

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
        if (grid[y][x] === 'goal1') {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        } else if (grid[y][x] === 'goal2') {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
        } else if (grid[y][x] === 'goal3') {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
        } else if (grid[y][x] === 'obstacle') {
          ctx.fillStyle = '#ef4444';
        } else {
          ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
        }
        ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
        
        // Draw grid lines
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
      }
    }
    
    // Draw agents
    agents.forEach(agent => {
      const agentX = agent.x * CELL_SIZE + CELL_SIZE / 2;
      const agentY = agent.y * CELL_SIZE + CELL_SIZE / 2;
      
      // Draw agent
      ctx.fillStyle = agent.color;
      ctx.beginPath();
      ctx.arc(agentX, agentY, CELL_SIZE / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw agent number
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(agent.id.toString(), agentX, agentY);
    });
  }, [grid, agents]);

  // Multi-Agent Q-Learning algorithm
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setAgents(prevAgents => {
        const newAgents = prevAgents.map(agent => ({ ...agent, qTable: agent.qTable.map(row => row.map(cell => ({ ...cell }))) }));
        let allReachedGoal = true;
        
        newAgents.forEach(agent => {
          const { x, y } = agent;
          
          // Check if reached goal
          if (x === agent.goalX && y === agent.goalY) {
            return; // Agent stays at goal
          }
          
          allReachedGoal = false;
          
          // Choose action (epsilon-greedy)
          let action: 'up' | 'down' | 'left' | 'right';
          if (Math.random() < explorationRate) {
            // Explore
            const actions: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right'];
            action = actions[Math.floor(Math.random() * actions.length)];
          } else {
            // Exploit
            const q = agent.qTable[y][x];
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
          
          // Check collision with other agents (Multi-Agent coordination)
          const collision = newAgents.some(other => 
            other.id !== agent.id && other.x === newX && other.y === newY
          );
          
          if (collision) {
            newX = x;
            newY = y;
          }
          
          // Calculate reward
          let reward = -0.1; // Step penalty
          if (newX === agent.goalX && newY === agent.goalY) {
            reward = 10; // Goal reward
            agent.reachedGoal += 1;
          }
          if (grid[newY][newX] === 'obstacle') reward = -5;
          if (collision) reward = -2; // Collision penalty (Multi-Agent)
          
          // Update Q-value
          const oldQ = agent.qTable[y][x][action];
          const maxNextQ = Math.max(...Object.values(agent.qTable[newY][newX]));
          const newQ = oldQ + learningRate * (reward + discountFactor * maxNextQ - oldQ);
          agent.qTable[y][x][action] = newQ;
          
          agent.totalReward += reward;
          agent.x = newX;
          agent.y = newY;
        });
        
        // If all agents reached their goals, reset episode
        if (allReachedGoal) {
          setEpisode(e => e + 1);
          return prevAgents.map(agent => ({
            ...agent,
            x: agent.id === 1 ? 0 : agent.id === 2 ? GRID_SIZE - 1 : 0,
            y: agent.id === 1 ? 0 : agent.id === 2 ? 0 : GRID_SIZE - 1
          }));
        }
        
        return newAgents;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isRunning, grid, learningRate, discountFactor, explorationRate]);

  const handleReset = () => {
    setIsRunning(false);
    setEpisode(0);
    setAgents([
      {
        id: 1,
        x: 0,
        y: 0,
        goalX: GRID_SIZE - 2,
        goalY: 1,
        color: '#3b82f6',
        goalColor: '#3b82f6',
        qTable: Array(GRID_SIZE).fill(null).map(() => 
          Array(GRID_SIZE).fill(null).map(() => ({ up: 0, down: 0, left: 0, right: 0 }))
        ),
        totalReward: 0,
        reachedGoal: 0
      },
      {
        id: 2,
        x: GRID_SIZE - 1,
        y: 0,
        goalX: GRID_SIZE - 2,
        goalY: GRID_SIZE - 2,
        color: '#22c55e',
        goalColor: '#22c55e',
        qTable: Array(GRID_SIZE).fill(null).map(() => 
          Array(GRID_SIZE).fill(null).map(() => ({ up: 0, down: 0, left: 0, right: 0 }))
        ),
        totalReward: 0,
        reachedGoal: 0
      },
      {
        id: 3,
        x: 0,
        y: GRID_SIZE - 1,
        goalX: 1,
        goalY: GRID_SIZE - 2,
        color: '#f59e0b',
        goalColor: '#f59e0b',
        qTable: Array(GRID_SIZE).fill(null).map(() => 
          Array(GRID_SIZE).fill(null).map(() => ({ up: 0, down: 0, left: 0, right: 0 }))
        ),
        totalReward: 0,
        reachedGoal: 0
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-green-400" />
              <h1 className="text-xl font-bold text-white">Multi-Agent RL Demo</h1>
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
                <CardTitle className="text-white">Multi-Agent Grid World</CardTitle>
                <CardDescription className="text-slate-400">
                  Three agents learn independently to reach their goals while avoiding collisions with each other
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

                {/* Legend */}
                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-sm font-semibold text-white mb-3">Agents:</div>
                  <div className="grid grid-cols-3 gap-4">
                    {agents.map(agent => (
                      <div key={agent.id} className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: agent.color }}
                        >
                          {agent.id}
                        </div>
                        <div className="text-xs text-slate-300">
                          Goal: {agent.reachedGoal}x
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="text-3xl font-bold text-green-400">{episode}</div>
                </div>
                <div className="space-y-2">
                  {agents.map(agent => (
                    <div key={agent.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: agent.color }}
                        />
                        <span className="text-sm text-slate-300">Agent {agent.id}</span>
                      </div>
                      <span className="text-sm font-mono" style={{ color: agent.color }}>
                        {agent.totalReward.toFixed(1)}
                      </span>
                    </div>
                  ))}
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
                    <span className="text-sm text-green-400 font-mono">{learningRate.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[learningRate]}
                    onValueChange={([value]) => setLearningRate(value)}
                    min={0.01}
                    max={1}
                    step={0.01}
                    disabled={isRunning}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-300">Discount Factor (γ)</span>
                    <span className="text-sm text-green-400 font-mono">{discountFactor.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[discountFactor]}
                    onValueChange={([value]) => setDiscountFactor(value)}
                    min={0}
                    max={1}
                    step={0.01}
                    disabled={isRunning}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-300">Exploration Rate (ε)</span>
                    <span className="text-sm text-green-400 font-mono">{explorationRate.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[explorationRate]}
                    onValueChange={([value]) => setExplorationRate(value)}
                    min={0}
                    max={1}
                    step={0.01}
                    disabled={isRunning}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-sm">How it works</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 space-y-2">
                <p>Each agent learns independently using Q-Learning.</p>
                <p><strong className="text-green-400">Key difference:</strong> Agents must coordinate to avoid collisions.</p>
                <p>Collision penalty (-2) encourages agents to learn cooperative paths.</p>
                <p>This demonstrates multi-agent coordination through independent learning!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
