import { Link } from 'react-router-dom';
import { Camera, BookOpen, Share2, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [memoryCount, setMemoryCount] = useState(0);

  useEffect(() => {
    const memories = JSON.parse(localStorage.getItem('memories') || '[]');
    setMemoryCount(memories.length);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-paper">
      <div className="paper-texture min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="animate-scale-in">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="w-10 h-10 text-gold-accent animate-float" />
              <h1 className="text-5xl md:text-6xl font-handwritten bg-gradient-warm bg-clip-text text-transparent">
                Scrapebook
              </h1>
              <Heart className="w-10 h-10 text-dusty-rose animate-float" style={{ animationDelay: '1s' }} />
            </div>
            
            <p className="text-xl md:text-2xl font-handwritten text-vintage-brown mb-2">
              of Memories
            </p>
            
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Capture your precious moments with beautiful filters, organize them in your digital diary, and share your story with the world.
            </p>
            
            {memoryCount > 0 && (
              <div className="inline-block bg-accent/30 px-4 py-2 rounded-full mb-8">
                <p className="text-sm font-medium text-accent-foreground">
                  You have {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'} saved
                </p>
              </div>
            )}
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl w-full animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/camera" className="group">
              <div className="polaroid-frame p-6 transition-all duration-300 group-hover:scale-105 group-hover:shadow-float">
                <Camera className="w-12 h-12 text-primary mb-3 mx-auto group-hover:animate-float" />
                <h3 className="font-semibold text-lg mb-2">Capture</h3>
                <p className="text-sm text-muted-foreground">
                  Take photos with creative filters
                </p>
              </div>
            </Link>

            <Link to="/scrapebook" className="group">
              <div className="polaroid-frame p-6 transition-all duration-300 group-hover:scale-105 group-hover:shadow-float">
                <BookOpen className="w-12 h-12 text-accent mb-3 mx-auto group-hover:animate-float" />
                <h3 className="font-semibold text-lg mb-2">Collect</h3>
                <p className="text-sm text-muted-foreground">
                  Organize memories by date
                </p>
              </div>
            </Link>

            <Link to="/share" className="group">
              <div className="polaroid-frame p-6 transition-all duration-300 group-hover:scale-105 group-hover:shadow-float">
                <Share2 className="w-12 h-12 text-secondary-foreground mb-3 mx-auto group-hover:animate-float" />
                <h3 className="font-semibold text-lg mb-2">Share</h3>
                <p className="text-sm text-muted-foreground">
                  Create posts for social media
                </p>
              </div>
            </Link>
          </div>

          {/* CTA Button */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Link to="/camera">
              <Button size="lg" className="bg-gradient-warm hover:opacity-90 text-white border-0">
                Start Creating Memories
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center p-4 text-sm text-muted-foreground">
          <p className="font-handwritten">Made with ♥ for Shipaton Hackathon</p>
        </footer>
      </div>
    </div>
  );
}