import React, { useState } from 'react';
import { PartyPlan, PrepTask } from '../types';
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  Clock,
  ListTodo,
  Smile,
} from 'lucide-react';

interface PrepTimelineSectionProps {
  plan: PartyPlan;
  onOpenAiChat: (prompt?: string) => void;
}

export const PrepTimelineSection: React.FC<PrepTimelineSectionProps> = ({
  plan,
  onOpenAiChat,
}) => {
  const [completedTasks, setCompletedTasks] = useState<{ [key: string]: boolean }>({});
  const [customTasks, setCustomTasks] = useState<{ [timeframe: string]: string[] }>({});
  const [newTaskInput, setNewTaskInput] = useState<{ [timeframe: string]: string }>({});

  const toggleTask = (key: string) => {
    setCompletedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddCustomTask = (timeframe: string) => {
    const text = newTaskInput[timeframe]?.trim();
    if (!text) return;
    setCustomTasks((prev) => ({
      ...prev,
      [timeframe]: [...(prev[timeframe] || []), text],
    }));
    setNewTaskInput((prev) => ({ ...prev, [timeframe]: '' }));
  };

  const timeline = plan.prepTimeline || [];

  // Calculate total and done
  let totalTasks = 0;
  let doneTasks = 0;
  timeline.forEach((milestone, mIdx) => {
    const allForMilestone = [...milestone.tasks, ...(customTasks[milestone.timeframe] || [])];
    allForMilestone.forEach((_, tIdx) => {
      totalTasks++;
      if (completedTasks[`${mIdx}_${tIdx}`]) doneTasks++;
    });
  });

  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111111] rounded-lg p-6 border border-white/10 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-white/10 text-white border border-white/20">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif text-white tracking-wide">Host Prep Countdown & Operations Schedule</h3>
              <p className="text-xs text-white/40">
                {doneTasks} of {totalTasks} preparation milestones completed ({completionPct}%)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenAiChat('Generate a detailed morning-of kitchen prep schedule with 15-minute intervals')}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-white hover:bg-white/90 text-black text-xs font-bold uppercase tracking-widest shrink-0 transition shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Countdown Protocol</span>
        </button>
      </div>

      {/* Timeline Milestones */}
      <div className="space-y-6">
        {timeline.map((milestone, mIdx) => {
          const allTasks = [...milestone.tasks, ...(customTasks[milestone.timeframe] || [])];

          return (
            <div key={mIdx} className="bg-[#111111] rounded-lg border border-white/10 shadow-md overflow-hidden">
              <div className="bg-[#161616] px-5 py-3 border-b border-white/10 flex items-center justify-between font-sans">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-white/70" />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white">{milestone.timeframe}</h4>
                  <span className="text-[11px] text-white/40">({allTasks.length} tasks)</span>
                </div>
              </div>

              <div className="p-5 space-y-3 font-sans">
                <div className="space-y-1.5">
                  {allTasks.map((task, tIdx) => {
                    const taskKey = `${mIdx}_${tIdx}`;
                    const isDone = !!completedTasks[taskKey];

                    return (
                      <div
                        key={tIdx}
                        onClick={() => toggleTask(taskKey)}
                        className={`flex items-start gap-3 p-2.5 rounded cursor-pointer transition select-none ${
                          isDone ? 'bg-white/[0.02] text-white/30' : 'hover:bg-white/5 text-white/90'
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 shrink-0 text-white/40 hover:text-white transition"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : (
                            <Circle className="w-4 h-4 text-white/30 hover:text-white/60" />
                          )}
                        </button>
                        <span className={`text-xs sm:text-sm ${isDone ? 'line-through text-white/30 italic font-serif' : 'text-white'}`}>
                          {task}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Add Custom Task Input */}
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder={`+ Append preparation task for ${milestone.timeframe}...`}
                    value={newTaskInput[milestone.timeframe] || ''}
                    onChange={(e) =>
                      setNewTaskInput((prev) => ({ ...prev, [milestone.timeframe]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCustomTask(milestone.timeframe);
                    }}
                    className="flex-1 px-3 py-1.5 text-xs bg-[#181818] border border-white/15 text-white placeholder:text-white/30 rounded focus:bg-[#202020] focus:outline-none focus:border-white"
                  />
                  <button
                    onClick={() => handleAddCustomTask(milestone.timeframe)}
                    className="px-3.5 py-1.5 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
