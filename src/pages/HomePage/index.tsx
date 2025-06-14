import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Cloud, ArrowRight, Sparkles } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              AI-Powered Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent">
        
              <div className="flex flex-row gap-2 items-center justify-center mb-4">
                <img src="/logo.svg" alt="Florax AI Logo" className="h-24" />
                {/* <h1 className="text-4xl font-bold text-white-900 mb-4">Florax AI</h1> */}
              </div>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Your main entry point to powerful AI capabilities. Explore local
              model loading and advanced cloud detection features.
            </p>
          </div>

          {/* Navigation Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-16">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Load Model Local
                </CardTitle>
                <CardDescription className="text-slate-600">
                  run AI models locally on your machine for maximum
                  privacy and control.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  asChild
                  className="w-full group-hover:bg-indigo-600 transition-colors duration-300"
                >
                  <Link
                    to="/load-model-local"
                    className="flex items-center justify-center gap-2"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Cloud className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Cloud Detection
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Leverage cloud-based AI services for scalable detection and
                  analysis capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  asChild
                  variant="outline"
                  className="w-full group-hover:bg-slate-50 transition-colors duration-300"
                >
                  <Link
                    to="/cloud-detection"
                    className="flex items-center justify-center gap-2"
                  >
                    Explore
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto">
                <Brain className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Local Processing</h3>
              <p className="text-sm text-slate-600">
                Run models directly on your hardware
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                <Cloud className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Cloud Scale</h3>
              <p className="text-sm text-slate-600">
                Leverage cloud infrastructure
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900">AI-Powered</h3>
              <p className="text-sm text-slate-600">
                Advanced machine learning
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
