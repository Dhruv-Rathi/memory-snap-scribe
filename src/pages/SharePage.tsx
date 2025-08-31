import { useState, useEffect } from 'react';
import { Instagram, Download, Palette, Type, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Memory {
  id: string;
  photo: string;
  date: string;
  filter: string;
  notes: string;
}

const templates = [
  { id: 'minimal', name: 'Minimal', bgColor: '#FFFFFF', textColor: '#000000' },
  { id: 'vintage', name: 'Vintage', bgColor: '#F4E8D0', textColor: '#5C4033' },
  { id: 'modern', name: 'Modern', bgColor: '#1A1A1A', textColor: '#FFFFFF' },
  { id: 'pastel', name: 'Pastel', bgColor: '#FFE8E8', textColor: '#6B5B95' },
  { id: 'nature', name: 'Nature', bgColor: '#E8F5E9', textColor: '#2E7D32' },
];

export default function SharePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('minimal');
  const [showWatermark, setShowWatermark] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const savedMemories = JSON.parse(localStorage.getItem('memories') || '[]');
    setMemories(savedMemories);
    if (savedMemories.length > 0) {
      setSelectedMemory(savedMemories[0]);
    }
  }, []);

  const generateCaption = () => {
    if (selectedMemory) {
      const date = format(new Date(selectedMemory.date), 'MMMM d, yyyy');
      const defaultCaption = `📸 Memory from ${date}\n\n${selectedMemory.notes || 'A moment worth remembering'}\n\n#ScrapebookOfMemories #CapturedMoments #MemoryLane`;
      setCaption(defaultCaption);
      toast({
        title: "Caption Generated!",
        description: "Feel free to customize it before sharing",
      });
    }
  };

  const downloadAsImage = async () => {
    if (!selectedMemory) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    // Set canvas size for Instagram square post
    canvas.width = 1080;
    canvas.height = 1080;

    // Draw background
    ctx.fillStyle = template.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Calculate image dimensions to fit in square
      const padding = 100;
      const maxSize = canvas.width - (padding * 2);
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2 - 50;
      
      // Draw white polaroid frame
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x - 20, y - 20, width + 40, height + 100);
      
      // Draw image
      ctx.drawImage(img, x, y, width, height);
      
      // Add date text
      ctx.fillStyle = template.textColor;
      ctx.font = '24px cursive';
      ctx.textAlign = 'center';
      const dateText = format(new Date(selectedMemory.date), 'MMMM d, yyyy');
      ctx.fillText(dateText, canvas.width / 2, y + height + 50);
      
      // Add watermark if enabled
      if (showWatermark) {
        ctx.font = '16px sans-serif';
        ctx.fillStyle = template.textColor + '80';
        ctx.fillText('Scrapebook of Memories', canvas.width / 2, canvas.height - 30);
      }
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `memory-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: "Image Downloaded!",
            description: "Your memory is ready to share on Instagram",
          });
        }
      }, 'image/png');
    };
    
    img.src = selectedMemory.photo;
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(caption);
    toast({
      title: "Caption Copied!",
      description: "Paste it in your Instagram post",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-paper">
      <div className="paper-texture min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b border-border">
          <div className="p-4">
            <h1 className="text-3xl font-handwritten text-primary flex items-center gap-2">
              <Instagram className="w-7 h-7" />
              Share Your Story
            </h1>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          {memories.length === 0 ? (
            <div className="text-center py-12">
              <div className="polaroid-frame inline-block p-8">
                <Instagram className="w-16 h-16 text-muted-foreground mb-4 mx-auto" />
                <h2 className="text-xl font-semibold mb-2">No memories to share</h2>
                <p className="text-muted-foreground">Capture some memories first!</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Memory Selection & Preview */}
              <div className="space-y-4">
                <div className="bg-card rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    Select Memory
                  </h3>
                  <Select
                    value={selectedMemory?.id}
                    onValueChange={(value) => {
                      const memory = memories.find(m => m.id === value);
                      setSelectedMemory(memory || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a memory" />
                    </SelectTrigger>
                    <SelectContent>
                      {memories.map((memory) => (
                        <SelectItem key={memory.id} value={memory.id}>
                          {format(new Date(memory.date), 'MMM d, yyyy - h:mm a')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedMemory && (
                  <div className="polaroid-frame animate-scale-in">
                    <div 
                      className="relative"
                      style={{ 
                        backgroundColor: templates.find(t => t.id === selectedTemplate)?.bgColor,
                        padding: '20px'
                      }}
                    >
                      <img
                        src={selectedMemory.photo}
                        alt="Selected memory"
                        className="w-full rounded-sm"
                      />
                      <p 
                        className="mt-3 text-center font-handwritten"
                        style={{ color: templates.find(t => t.id === selectedTemplate)?.textColor }}
                      >
                        {format(new Date(selectedMemory.date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Customization Options */}
              <div className="space-y-4">
                {/* Template Selection */}
                <div className="bg-card rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Choose Template
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedTemplate === template.id
                            ? 'border-primary'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                        style={{ backgroundColor: template.bgColor }}
                      >
                        <span 
                          className="text-xs font-medium"
                          style={{ color: template.textColor }}
                        >
                          {template.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Caption Generator */}
                <div className="bg-card rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Caption
                  </h3>
                  <Textarea
                    placeholder="Write a caption for your post..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="min-h-[120px] mb-3"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={generateCaption}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Generate Caption
                    </Button>
                    <Button
                      onClick={copyCaption}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={!caption}
                    >
                      Copy Caption
                    </Button>
                  </div>
                </div>

                {/* Watermark Toggle */}
                <div className="bg-card rounded-lg p-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-medium">Add Watermark</span>
                    <input
                      type="checkbox"
                      checked={showWatermark}
                      onChange={(e) => setShowWatermark(e.target.checked)}
                      className="w-4 h-4 text-primary"
                    />
                  </label>
                </div>

                {/* Download Button */}
                <Button
                  onClick={downloadAsImage}
                  size="lg"
                  className="w-full gap-2"
                  disabled={!selectedMemory}
                >
                  <Download className="w-5 h-5" />
                  Download for Instagram
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}