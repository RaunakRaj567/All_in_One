import React, { useState } from 'react';
import { Calendar, CheckSquare, Square, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ActionSchedule({ result }) {
  const [completedDays, setCompletedDays] = useState({});

  if (!result || !result.recoverySchedule7Days) return null;

  const schedule = result.recoverySchedule7Days;

  const toggleDay = (dayNum) => {
    const nextState = { ...completedDays, [dayNum]: !completedDays[dayNum] };
    setCompletedDays(nextState);

    // If all 7 days completed, trigger celebration!
    const totalCompleted = Object.values(nextState).filter(Boolean).length;
    if (totalCompleted === schedule.length) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback silently if confetti unsupported
      }
    }
  };

  const completedCount = Object.values(completedDays).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / schedule.length) * 100);

  return (
    <div className="bg-field-surface border-3 border-loam rounded-md p-6 lg:p-8 my-6 shadow-sharp-lg">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-loam pb-4 mb-6">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-sprout block mb-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            7-Day Agronomist Recovery Roadmap
          </span>
          <h3 className="font-serif text-2xl font-bold text-loam">
            Structured Field Treatment Schedule
          </h3>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-3 bg-field-bg border-2 border-loam px-4 py-2 rounded-sm shadow-sharp-sm">
          <div className="font-mono text-xs font-bold text-loam">
            Progress: <span className="text-sprout">{progressPercent}%</span>
          </div>
          <div className="w-24 bg-field-card border border-loam/30 h-2.5 rounded-none overflow-hidden">
            <div className="bg-sprout h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
          {completedCount === schedule.length && (
            <span className="bg-sprout text-field-bg text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase flex items-center gap-1">
              <Award className="w-3 h-3 text-accent-sprout" />
              Complete
            </span>
          )}
        </div>
      </div>

      {/* 7 Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {schedule.map((item) => {
          const isDone = !!completedDays[item.day];

          return (
            <div
              key={item.day}
              onClick={() => toggleDay(item.day)}
              className={`border-2 rounded-sm p-4 cursor-pointer transition-all flex flex-col justify-between shadow-sharp-sm select-none ${
                isDone 
                  ? 'bg-sprout-tint/60 border-sprout ring-1 ring-sprout' 
                  : 'bg-field-bg border-loam hover:border-sprout hover:bg-field-card'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-loam/20 pb-2 mb-2">
                  <span className="font-mono text-xs font-bold text-sprout uppercase">
                    Day 0{item.day}
                  </span>

                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-sprout" />
                  ) : (
                    <Square className="w-4 h-4 text-loam-muted" />
                  )}
                </div>

                <h4 className={`font-serif font-bold text-sm mb-1 ${isDone ? 'line-through text-loam-muted' : 'text-loam'}`}>
                  {item.task}
                </h4>

                <p className="font-mono text-[11px] text-loam-muted leading-relaxed">
                  {item.detail}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-loam/10 text-[10px] font-mono text-right font-semibold">
                {isDone ? (
                  <span className="text-sprout font-bold">✓ Step Executed</span>
                ) : (
                  <span className="text-loam-muted">Click to mark complete</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
