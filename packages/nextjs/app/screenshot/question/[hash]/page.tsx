"use client";
import React from 'react';
import '~~/styles/globalisasi.css'
import { decodeString } from '~~/action/encode'
import { NeonGradientCard } from "~~/components/magicui/neon-gradient-card";
const ParticlesDemo = ({ params }:any) => {
  const decoded=decodeString(params.hash)

  return (
    <div className="flex items-center align-center justify-center h-screen">
      <div className="flex items-center align-center justify-center">
        <NeonGradientCard className="max-w-sm  items-center justify-center text-center">
          <span className="pointer-events-none z-10 h-full whitespace-pre-wrap bg-gradient-to-br from-[#ff2975] from-35% to-[#00FFF1] bg-clip-text text-center text-6xl font-bold leading-none tracking-tighter text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
            {decoded.substring(0,80)}
          </span>
        </NeonGradientCard>
      </div>
    </div>
  );
};

export default ParticlesDemo;
