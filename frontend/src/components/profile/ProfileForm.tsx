import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

interface ProfileFormProps {
  formData: {
    username: string;
    email: string;
    avatar: string;
    createdAt: string;
    emailVerified: boolean;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  handleInputChange,
  handleAvatarChange,
}) => {
  return (
    <div className="px-8 py-6">
      <div className="space-y-5">
        <div>
          <Label
            htmlFor="username"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
          >
            Username
          </Label>
          <div className="relative">
            <Input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
             focus:ring-blue-500 focus:border-blue-500 
             hover:border-blue-400 dark:hover:border-blue-400
             dark:border-blue-300 
             rounded-md px-4 py-2.5 text-gray-900 dark:text-white w-full transition-all"
              placeholder="Enter username"
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-1 bg-blue-500 rounded-l-lg"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "100%", opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 pl-1">
            Choose a unique username between 3-20 characters
          </p>
        </div>

        <div>
          <Label
            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
            htmlFor="email"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="text-base bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-lg px-4 py-2.5 w-full cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 pl-1">
            Email cannot be changed
          </p>
        </div>

        <div>
          <Label
            htmlFor="avatar"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
          >
            Profile Picture
          </Label>
          <div className="relative">
            <Input
              id="avatar"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <label
              htmlFor="avatar"
              className="flex items-center justify-center px-4 py-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer transition-colors"
            >
              <Camera className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
              <span>Choose an image (JPG/PNG, max 5MB)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
