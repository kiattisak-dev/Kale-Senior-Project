"use client";

import { Card } from "@/components/ui/card";
import { Image as ImageIcon, Sparkles } from "lucide-react";

interface ResultBoxProps {
  result: string | null;
  showSuccess: boolean;
}

export default function ResultBox({ result, showSuccess }: ResultBoxProps) {
  

  return (
    <div className="flex flex-col gap-4">

      <Card
        className={`relative border-2 border-dashed border-green-300 rounded-lg p-4 h-64 flex items-center justify-center
        ${showSuccess ? "ring-4 ring-green-400 scale-[1.02]" : ""}
        ${result ? "bg-[url(/transparent-bg.png)]" : "bg-green-50"}
        bg-opacity-50 bg-[length:20px_20px]
      `}
      >
        {result ? (
          <img
            src={result}
            alt="Result"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-center text-green-600">
            <ImageIcon className="h-12 w-12 mx-auto mb-4" />
            <p>Your image with removed background will appear here</p>
          </div>
        )}

        {showSuccess && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-200 bg-opacity-40 rounded-lg">
            <div className="bg-white p-3 rounded-full shadow-lg">
              <Sparkles className="h-8 w-8 text-green-500 animate-spin" />
            </div>
          </div>
        )}
      </Card>

    </div>
  );
}
