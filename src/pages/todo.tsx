import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ListTodo, Sparkles, CheckCircle2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { createWellnessRecord, deleteWellnessRecord, fetchWellnessRecords, updateWellnessRecord } from "@/lib/wellness-api";

type TodoRecord = { id: string; title?: string; text?: string; completed: boolean; priority: string; createdAt: string };

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export default function TodoPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchWellnessRecords<TodoRecord>("tasks", user.id)
      .then(records => {
        const loaded: Todo[] = records.map(r => ({
          id: String(r.id),
          text: r.title ?? r.text ?? "",
          completed: r.completed ?? false,
          priority: (r.priority as Todo["priority"]) ?? "medium",
        }));
        setTodos(loaded);
      })
      .catch((error: unknown) => {
        console.error("[LifeSync] Failed to load tasks:", error);
        toast({
          title: "Could not load tasks",
          description: "Please refresh or sign in again.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [user?.id, toast]);

  const addTodo = () => {
    if (!newTodo.trim()) {
       toast({ title: "Empty Task", description: "Please enter some text.", variant: "destructive" });
       return;
    }
    
    setIsAdding(true);
    if (user?.id) {
      void createWellnessRecord("tasks", {
        userId: user.id,
        title: newTodo.trim(),
        completed: false,
        priority: "medium",
      })
        .then((saved) => {
          setTodos((current) => [{
            id: String(saved.id),
            text: String((saved as Record<string, unknown>).title ?? ""),
            completed: Boolean((saved as Record<string, unknown>).completed),
            priority: ((saved as Record<string, unknown>).priority as Todo["priority"]) ?? "medium",
          }, ...current]);
          window.dispatchEvent(new CustomEvent("wellness:data-updated", { detail: { table: "tasks" } }));
        })
        .catch(() => {
          toast({ title: "Could not save task", description: "Please try again.", variant: "destructive" });
        })
        .finally(() => setIsAdding(false));
    } else {
      setIsAdding(false);
    }

    setNewTodo("");
    toast({
      title: "Task Added ✅",
      description: `"${newTodo.trim()}" is now in your sync list.`,
    });
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const nextTodo = { ...todo, completed: !todo.completed };

        if (user?.id) {
          void updateWellnessRecord("tasks", id, {
            completed: nextTodo.completed,
          }).then(() => {
            window.dispatchEvent(new CustomEvent("wellness:data-updated", { detail: { table: "tasks" } }));
          }).catch((error: unknown) => {
            const message = error instanceof Error ? error.message : "Please try again.";
            console.error("[LifeSync] Could not update task:", error);
            toast({ title: "Could not update task", description: message, variant: "destructive" });
          });
        }

        if (!todo.completed) {
          toast({ title: "Task Done! 🌟", description: `Way to go! One more step towards sync.` });
        }
        return nextTodo;
      }
      return todo;
    }));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));

    if (user?.id) {
      void deleteWellnessRecord("tasks", id)
        .then(() => {
          window.dispatchEvent(new CustomEvent("wellness:data-updated", { detail: { table: "tasks" } }));
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Please try again.";
          console.error("[LifeSync] Could not delete task:", error);
          toast({ title: "Could not delete task", description: message, variant: "destructive" });
        });
    }

    toast({ title: "Task Deleted", description: "List updated successfully." });
  };

  const completedCount = todos.filter(t => t.completed).length;
  const productivity = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <Card className="p-8"><Skeleton className="h-48 w-full" /></Card>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 max-w-4xl mx-auto pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
            <ListTodo className="h-8 w-8 text-indigo-500" />
            Sync To-Do
          </h1>
          <p className="text-muted-foreground">Focus on what matters. Track your daily life execution.</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-950/30 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-900 flex items-center gap-4">
           <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Yield: {productivity}%</span>
           </div>
           <div className="h-4 w-[1px] bg-indigo-200 dark:bg-indigo-800" />
           <span className="text-sm font-medium text-indigo-600">{completedCount}/{todos.length} Done</span>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white/40 dark:bg-gray-950/40 backdrop-blur-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <CardHeader>
           <CardTitle className="text-xl">Daily Focus</CardTitle>
           <CardDescription>Small steps lead to massive life synchronization.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-3 mb-8">
            <div className="flex-1 relative">
              <Input
                placeholder="What single thing will you accomplish next?"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                data-testid="input-todo-new"
                className="h-14 pl-12 pr-4 border-indigo-100 focus:border-indigo-500 rounded-2xl shadow-inner bg-muted/20"
              />
              <Plus className="absolute left-4 top-4.5 h-5 w-5 text-indigo-400" />
            </div>
            <Button 
               onClick={addTodo} 
               disabled={isAdding} 
              data-testid="button-todo-add"
               className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg active:scale-95 transition-all"
            >
              {isAdding ? "Adding..." : "Add Task"}
            </Button>
          </div>

          <AnimatePresence mode="popLayout">
            {todos.length === 0 ? (
              <EmptyState 
                icon={CheckCircle2}
                title="All Clear!"
                description="Your focus list is empty. Take a moment to breathe, or add a new task to keep moving forward."
                actionText="Create New Task"
                onAction={() => document.querySelector('input')?.focus()}
              />
            ) : (
              <div className="space-y-3">
                {todos.map((todo) => (
                  <motion.div
                    key={todo.id}
                    data-testid="todo-item"
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all group ${
                      todo.completed 
                        ? 'bg-indigo-50/20 border-indigo-100/50 opacity-60' 
                        : 'bg-card border-border hover:border-indigo-200 hover:shadow-md'
                    }`}
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      data-testid="checkbox-todo-toggle"
                      className="h-6 w-6 rounded-lg data-[state=checked]:bg-indigo-600 border-2"
                    />
                    <span className={`flex-1 font-semibold text-lg transition-all ${
                      todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}>
                      {todo.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                      data-testid="button-todo-delete"
                      className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all rounded-full"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      
      {productivity === 100 && todos.length > 0 && (
         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-center shadow-xl"
         >
            <div className="flex items-center justify-center gap-3 mb-2">
               <Sparkles className="h-6 w-6 text-cyan-300" />
               <h3 className="text-xl font-bold">100% Productivity Achieved!</h3>
            </div>
            <p className="opacity-80">You've cleared your focus list for today. Time for a well-deserved break! 🌱</p>
         </motion.div>
      )}
    </motion.div>
  );
}
