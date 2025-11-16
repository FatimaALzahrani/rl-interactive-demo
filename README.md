# RL Interactive Demo

**Interactive demonstrations of Reinforcement Learning and Swarm Intelligence algorithms**

A comprehensive web-based platform featuring three interactive simulations that visualize fundamental concepts in Reinforcement Learning (RL) and Swarm Intelligence. Built with React , TypeScript, and HTML5 Canvas for real-time, high-performance visualizations.

![RL Interactive Demo](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 Overview

This project provides hands-on, visual demonstrations of three key areas in artificial intelligence:

1. **Q-Learning Grid World** - Single-agent reinforcement learning using the classic Q-Learning algorithm
2. **Multi-Agent RL** - Multiple agents learning independently while coordinating to avoid collisions
3. **Swarm Intelligence** - Emergent flocking behavior using the Boids algorithm

Each simulation is fully interactive, allowing users to adjust hyperparameters in real-time and observe their effects on learning and behavior.

## ✨ Features

### Q-Learning Grid World

- Visual representation of Q-values as directional arrows
- Real-time policy learning visualization
- Adjustable hyperparameters (learning rate α, discount factor γ, exploration rate ε)
- Episode tracking and reward accumulation
- Obstacle avoidance and goal-seeking behavior

### Multi-Agent Reinforcement Learning

- Three independent agents learning simultaneously
- Collision avoidance through negative rewards
- Individual Q-tables for each agent
- Coordinated learning without central control
- Visual distinction between agents with color coding

### Swarm Intelligence (Boids)

- Implementation of Craig Reynolds' Boids algorithm
- Three fundamental rules: Separation, Alignment, Cohesion
- Adjustable behavior weights for each rule
- Emergent flocking patterns from simple local interactions
- Smooth, organic movement visualization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/FatimaALzahrani/rl-interactive-demo.git
cd rl-interactive-demo

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
# Create optimized production build
pnpm build

# Preview production build
pnpm preview
```

## 🎮 Usage

### Q-Learning Demo

1. Navigate to the Q-Learning page
2. Click "Start Learning" to begin the training process
3. Adjust hyperparameters using the sliders:
   - **Learning Rate (α)**: Controls how much new information overrides old information
   - **Discount Factor (γ)**: Determines the importance of future rewards
   - **Exploration Rate (ε)**: Probability of random exploration vs exploitation
4. Observe the agent learning optimal paths through the grid
5. Watch Q-values visualized as arrows indicating the best action for each state

### Multi-Agent RL Demo

1. Navigate to the Multi-Agent page
2. Three agents start from different corners of the grid
3. Each agent has its own goal (shown in matching colors)
4. Click "Start Learning" to watch agents learn independently
5. Observe how agents coordinate to avoid collisions while reaching their goals
6. Monitor individual agent rewards and goal achievements

### Swarm Intelligence Demo

1. Navigate to the Swarm page
2. 80 boids (bird-like agents) initialize with random positions and velocities
3. Click "Start Simulation" to activate the flocking behavior
4. Adjust behavior weights:
   - **Separation**: Tendency to maintain distance from neighbors
   - **Alignment**: Tendency to match velocity with neighbors
   - **Cohesion**: Tendency to move toward the center of the group
5. Observe emergent patterns like flocking, splitting, and reforming

## 🏗️ Technical Architecture

### Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Canvas Rendering**: HTML5 Canvas API for high-performance 2D graphics
- **Build Tool**: Vite 7
- **State Management**: React Hooks (useState, useEffect, useRef)

### Project Structure

```
rl-interactive-demo/
├── client/
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # Reusable UI components
│       │   └── ui/      # shadcn/ui components
│       ├── contexts/    # React contexts
│       ├── hooks/       # Custom React hooks
│       ├── lib/         # Utility functions
│       ├── pages/       # Page components
│       │   ├── Home.tsx
│       │   ├── QLearning.tsx
│       │   ├── MultiAgent.tsx
│       │   └── SwarmIntelligence.tsx
│       ├── App.tsx      # Main app component
│       └── main.tsx     # Entry point
├── shared/              # Shared constants
└── package.json
```

### Algorithm Implementations

#### Q-Learning

The Q-Learning implementation follows the standard update rule:

```
Q(s,a) ← Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)]
```

Where:

- `s` is the current state
- `a` is the action taken
- `r` is the reward received
- `s'` is the next state
- `α` is the learning rate
- `γ` is the discount factor

The agent uses epsilon-greedy exploration to balance exploration and exploitation.

#### Multi-Agent RL

Each agent maintains its own Q-table and learns independently using the same Q-Learning algorithm. Coordination emerges through:

- Collision penalties (-2 reward)
- Independent learning without communication
- Shared environment observation

#### Boids Algorithm

Each boid follows three simple rules:

1. **Separation**: Steer away from nearby boids
2. **Alignment**: Match velocity with nearby boids
3. **Cohesion**: Move toward the average position of nearby boids

The final velocity is a weighted sum of these three behaviors, limited by a maximum speed constraint.

## 🎓 Academic References

This implementation is based on established research in reinforcement learning and swarm intelligence:

1. Sutton, R. S., & Barto, A. G. (2018). _Reinforcement Learning: An Introduction_ (2nd ed.). MIT Press.
2. Watkins, C. J. C. H., & Dayan, P. (1992). Q-learning. _Machine Learning_, 8(3-4), 279-292.
3. Reynolds, C. W. (1987). Flocks, herds and schools: A distributed behavioral model. _ACM SIGGRAPH Computer Graphics_, 21(4), 25-34.
4. Buşoniu, L., Babuška, R., & De Schutter, B. (2010). Multi-agent reinforcement learning: An overview. _Innovations in Multi-Agent Systems and Applications_, 183-221.
