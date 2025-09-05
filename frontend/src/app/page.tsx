"use client";
import { motion } from "framer-motion";
import { Hero } from "@/components/layout/Hero";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Leaf, Zap, ChartBar, Shield } from "lucide-react";
import { StepSection } from "@/components/layout/StepSection";
import { Step } from "@/types";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  const features = [
    {
      icon: Leaf,
      title: "Advanced Analysis",
      description:
        "State-of-the-art AI models for precise kale quality assessment",
    },
    {
      icon: Zap,
      title: "Real-time Results",
      description: "Get instant analysis with detailed quality metrics",
    },
    {
      icon: ChartBar,
      title: "Detailed Insights",
      description: "Comprehensive reports with actionable recommendations",
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description:
        "Ensure consistent produce quality with AI-powered verification",
    },
  ];
  const workflowSteps: Step[] = [
    {
      id: 1,
      title: "Remove Background",
      description:
        "Start by uploading your kale images for remove background. Our AI will automatically separate the kale from its background for precise analysis.",
      imageSrc: "/remove-bg-img.webp",
      imageAlt:
        "Remove background process for kale leaves showing the separation from background",
    },
    {
      id: 2,
      title: "Linear Regression Analysis",
      description:
        "Next, we apply linear regression to analyze key quality metrics of your kale, predicting quality factors and shelf life with high accuracy.",
      imageSrc: "/Linear-img.webp",
      imageAlt:
        "Linear regression analysis showing quality prediction graphs for kale",
    },
    {
      id: 3,
      title: "Get Results",
      description:
        "Finally, review comprehensive analysis results including quality prediction, confidence scores, and recommended storage conditions.",
      imageSrc: "/GetResult.webp",
      imageAlt:
        "Detailed results dashboard showing kale quality metrics and recommendations",
    },
  ];

  return (
    <div className="min-h-screen">
      <Hero />

      <StepSection workflowSteps={workflowSteps} />

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl text-center md:text-4xl font-bold bg-gradient-to-r from-green-700 to-green-500 dark:from-green-400 dark:to-green-200 bg-clip-text text-transparent mb-8 mt-6">
          Why choose kale AI?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:gap-8 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="w-full"
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
