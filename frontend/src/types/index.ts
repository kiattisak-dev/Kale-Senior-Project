export interface AnalysisResult {
  features(features: any): unknown;
  percentage_weight_lose: string;
  prediction: string;
  confidence: number;
  segmentation: {
    url: string;
    width: number;
    height: number;
  };
  recommendations: string[];
}

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  selectedFiles: File[];
  previews: string[];
  isAnalyzing: boolean;
  progress: number;
}

export interface LoadingProps {
  progress: number;
  message?: string;
}

export interface Step {
  id: number;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}