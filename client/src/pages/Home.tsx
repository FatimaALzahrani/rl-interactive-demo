import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, Bird, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">RL Interactive Demo</h1>
                <p className="text-sm text-slate-400">Reinforcement Learning & Swarm Intelligence</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            Explore Reinforcement Learning
            <span className="block text-blue-400 mt-2">Through Interactive Simulations</span>
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed">
            Discover how intelligent agents learn through interaction, how multiple agents coordinate,
            and how swarms exhibit emergent behavior all through hands-on, visual demonstrations.
          </p>
        </div>

        {/* Demo Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Q-Learning Card */}
          <Link href="/q-learning">
            <Card className="group cursor-pointer border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900 hover:border-blue-500 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white text-2xl">Q-Learning</CardTitle>
                <CardDescription className="text-slate-400 text-base">
                  Watch an agent learn optimal paths in a grid world using the classic Q-Learning algorithm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-blue-400 font-medium group-hover:gap-3 transition-all">
                  Try Demo <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Multi-Agent Card */}
          <Link href="/multi-agent">
            <Card className="group cursor-pointer border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900 hover:border-green-500 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-white text-2xl">Multi-Agent RL</CardTitle>
                <CardDescription className="text-slate-400 text-base">
                  Watch multiple agents learn independently while coordinating to avoid collisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-green-400 font-medium group-hover:gap-3 transition-all">
                  Try Demo <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Swarm Intelligence Card */}
          <Link href="/swarm">
            <Card className="group cursor-pointer border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900 hover:border-purple-500 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <Bird className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white text-2xl">Swarm Intelligence</CardTitle>
                <CardDescription className="text-slate-400 text-base">
                  Observe emergent flocking behavior in bird-like agents using simple local rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-purple-400 font-medium group-hover:gap-3 transition-all">
                  Try Demo <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-slate-500 text-sm">
            Created for ML Project Presentation • Reinforcement Learning & Swarm Intelligence <br /> By Fatimah & Bushra
          </p>
        </div>
      </footer>
    </div>
  );
}
