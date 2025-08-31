import { useState, useEffect } from 'react';
import { Calendar, Heart, Edit2, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';

interface Memory {
  id: string;
  photo: string;
  date: string;
  filter: string;
  notes: string;
}

export default function ScrapebookPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = () => {
    const savedMemories = JSON.parse(localStorage.getItem('memories') || '[]');
    setMemories(savedMemories);
  };

  const deleteMemory = (id: string) => {
    const updatedMemories = memories.filter(m => m.id !== id);
    localStorage.setItem('memories', JSON.stringify(updatedMemories));
    setMemories(updatedMemories);
    toast({
      title: "Memory Deleted",
      description: "The memory has been removed from your scrapebook",
    });
  };

  const updateMemoryNotes = () => {
    if (editingMemory) {
      const updatedMemories = memories.map(m => 
        m.id === editingMemory.id ? { ...m, notes } : m
      );
      localStorage.setItem('memories', JSON.stringify(updatedMemories));
      setMemories(updatedMemories);
      setEditingMemory(null);
      setNotes('');
      toast({
        title: "Notes Updated",
        description: "Your memory notes have been saved",
      });
    }
  };

  const filteredMemories = memories.filter(memory => {
    const searchLower = searchTerm.toLowerCase();
    const dateStr = format(new Date(memory.date), 'MMMM d, yyyy').toLowerCase();
    return dateStr.includes(searchLower) || memory.notes.toLowerCase().includes(searchLower);
  });

  // Group memories by date
  const groupedMemories = filteredMemories.reduce((acc, memory) => {
    const dateKey = format(new Date(memory.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(memory);
    return acc;
  }, {} as Record<string, Memory[]>);

  return (
    <div className="min-h-screen bg-gradient-paper">
      <div className="paper-texture min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b border-border">
          <div className="p-4">
            <h1 className="text-3xl font-handwritten text-primary flex items-center gap-2 mb-4">
              <Heart className="w-7 h-7 text-dusty-rose" />
              My Scrapebook
            </h1>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search memories by date or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>
          </div>
        </div>

        <div className="p-4 max-w-6xl mx-auto">
          {Object.keys(groupedMemories).length === 0 ? (
            <div className="text-center py-12">
              <div className="polaroid-frame inline-block p-8 animate-scale-in">
                <Calendar className="w-16 h-16 text-muted-foreground mb-4 mx-auto" />
                <h2 className="text-xl font-semibold mb-2">No memories yet</h2>
                <p className="text-muted-foreground">Start capturing moments to fill your scrapebook!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedMemories)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([date, dayMemories]) => (
                  <div key={date} className="animate-fade-in">
                    {/* Date Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px bg-border flex-1" />
                      <div className="bg-accent px-4 py-2 rounded-full">
                        <h2 className="text-lg font-handwritten text-accent-foreground">
                          {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                        </h2>
                      </div>
                      <div className="h-px bg-border flex-1" />
                    </div>

                    {/* Memory Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dayMemories.map((memory) => (
                        <div
                          key={memory.id}
                          className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                          onClick={() => setSelectedMemory(memory)}
                        >
                          <div className="polaroid-frame">
                            <div className="relative overflow-hidden rounded-sm">
                              <img
                                src={memory.photo}
                                alt="Memory"
                                className="w-full h-64 object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-white hover:text-white/80"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingMemory(memory);
                                      setNotes(memory.notes);
                                    }}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-white hover:text-white/80"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteMemory(memory.id);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(memory.date), 'h:mm a')}
                              </p>
                              {memory.notes && (
                                <p className="mt-1 text-sm font-handwritten text-vintage-brown line-clamp-2">
                                  {memory.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Memory Detail Dialog */}
        <Dialog open={!!selectedMemory} onOpenChange={() => setSelectedMemory(null)}>
          <DialogContent className="max-w-2xl">
            {selectedMemory && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-handwritten text-2xl">
                    {format(new Date(selectedMemory.date), 'MMMM d, yyyy - h:mm a')}
                  </DialogTitle>
                </DialogHeader>
                <div className="polaroid-frame">
                  <img
                    src={selectedMemory.photo}
                    alt="Memory"
                    className="w-full rounded-sm"
                  />
                  {selectedMemory.notes && (
                    <p className="mt-3 font-handwritten text-vintage-brown">
                      {selectedMemory.notes}
                    </p>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Notes Dialog */}
        <Dialog open={!!editingMemory} onOpenChange={() => setEditingMemory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Notes to Memory</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {editingMemory && (
                <img
                  src={editingMemory.photo}
                  alt="Memory"
                  className="w-full rounded-lg"
                />
              )}
              <Textarea
                placeholder="Write your thoughts about this memory..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] font-handwritten"
              />
              <Button onClick={updateMemoryNotes} className="w-full">
                Save Notes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}