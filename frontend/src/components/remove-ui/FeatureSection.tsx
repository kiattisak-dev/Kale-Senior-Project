import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Upload, Sparkles, ImageIcon, Download, Info } from "lucide-react";

export default function FeaturesSection() {
  return (
    <Card className="shadow-md border-green-100 dark:border-gray-700 blackdrop-blur-sm bg-white/80 dark:bg-gray-900/80 overflow-hidden">
      <CardHeader className="bg-green-100 dark:bg-gray-800 ">
        <CardTitle className="text-green-800 dark:text-green-300 flex items-center">
          <Info className="mr-2 h-5 w-5" />
          How It Works
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Upload",
              description: "Upload any image from your device",
              icon: <Upload className="h-8 w-8 text-green-600" />,
              delay: 0.1,
            },
            {
              title: "Process",
              description: "Our AI identifies and removes the background",
              icon: <Sparkles className="h-8 w-8 text-green-600" />,
              delay: 0.2,
            },
            {
              title: "Preview",
              description: "See your image with transparent background",
              icon: <ImageIcon className="h-8 w-8 text-green-600" />,
              delay: 0.3,
            },
            {
              title: "Download",
              description: "Download your image and use it anywhere",
              icon: <Download className="h-8 w-8 text-green-600" />,
              delay: 0.4,
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: item.delay }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-4 bg-white/90 dark:bg-gray-800/80 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-green-50 dark:border-green-900 hover:border-green-200 dark:hover:border-green-700 group"
            >
              <div className="flex flex-col items-center text-center p-4 rounded-lg">
                <div className="mb-4 p-3 bg-green-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">
                  {item.title}
                </h3>
                <p className="text-green-600 dark:text-green-300">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
