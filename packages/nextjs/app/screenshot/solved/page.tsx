"use client";

import React from 'react';
import '~~/styles/globalisasi.css'
import { cn } from "~~/lib/utils";
import AnimatedGradientText from "~~/components/magicui/animated-gradient-text";
import { useSearchParams } from 'next/navigation'

export function ConfettiDemo() {
  const searchParams = useSearchParams()
  const quiz = decodeURIComponent(searchParams.get('quiz') as any);
  const question = decodeURIComponent(searchParams.get('question') as any);
  return (
    <div className="flex items-center align-center justify-center h-screen">
      <div className="flex flex-col items-center align-center justify-center">
        <div className="z-10 flex  items-center justify-center m-0">
          
          <AnimatedGradientText className="group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-2xl bg-white/40 px-8 py-4 text-2xl font-medium shadow-[inset_0_-8px_10px_#8fdfff1f] backdrop-blur-sm transition-shadow duration-500 ease-out [--bg-size:300%] hover:shadow-[inset_0_-5px_10px_#8fdfff3f] dark:bg-black/40">
            🎉
            <span
              className={cn(
                `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
              )}
            >
              Congrats, You have solved the quiz
            </span>
          </AnimatedGradientText>
        </div>
        <div className="z-10 flex  items-center justify-center my-2">
          <AnimatedGradientText className="group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-2xl bg-white/40 px-8 py-4 text-2xl font-medium shadow-[inset_0_-8px_10px_#8fdfff1f] backdrop-blur-sm transition-shadow duration-500 ease-out [--bg-size:300%] hover:shadow-[inset_0_-5px_10px_#8fdfff3f] dark:bg-black/40">
            Quiz:
          </AnimatedGradientText>
        </div>
        <div className="z-10 flex  items-center justify-center my-2">
          <AnimatedGradientText className="group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-2xl bg-white/40 px-8 py-4 text-2xl font-medium shadow-[inset_0_-8px_10px_#8fdfff1f] backdrop-blur-sm transition-shadow duration-500 ease-out [--bg-size:300%] hover:shadow-[inset_0_-5px_10px_#8fdfff3f] dark:bg-black/40">
            {quiz.substring(0,100)}
          </AnimatedGradientText>
        </div>
        <div className="z-10 flex  items-center justify-center my-2">
          <AnimatedGradientText className="group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-2xl bg-white/40 px-8 py-4 text-2xl font-medium shadow-[inset_0_-8px_10px_#8fdfff1f] backdrop-blur-sm transition-shadow duration-500 ease-out [--bg-size:300%] hover:shadow-[inset_0_-5px_10px_#8fdfff3f] dark:bg-black/40">
            Your Question:
          </AnimatedGradientText>
        </div>
        <div className="z-10 flex  items-center justify-center my-2">
          <AnimatedGradientText className="group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-2xl bg-white/40 px-8 py-4 text-2xl font-medium shadow-[inset_0_-8px_10px_#8fdfff1f] backdrop-blur-sm transition-shadow duration-500 ease-out [--bg-size:300%] hover:shadow-[inset_0_-5px_10px_#8fdfff3f] dark:bg-black/40">
            {question.substring(0,100)}
          </AnimatedGradientText>
        </div>
        
      </div>
    </div>

  );
}

export default ConfettiDemo;
