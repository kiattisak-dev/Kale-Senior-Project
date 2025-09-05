import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Edit, Save, XCircle, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ProfileForm } from "./ProfileForm";
import { format } from "date-fns";

interface ProfileCardProps {
  isEditing: boolean;
  formData: {
    username: string;
    email: string;
    avatar: string;
    createdAt: string;
    emailVerified: boolean;
  };
  avatarPreview: string | null;
  error: string | null;
  isLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: () => void;
  handleCancelEdit: () => void;
  setIsEditing: (value: boolean) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  isEditing,
  formData,
  avatarPreview,
  error,
  isLoading,
  handleInputChange,
  handleAvatarChange,
  handleSave,
  handleCancelEdit,
  setIsEditing,
}) => {
  const joinDate = formData.createdAt
    ? format(new Date(formData.createdAt), "MMMM d, yyyy")
    : "Unknown";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] rounded-2xl">
        <div className="h-40 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
        </div>

        <div className="flex justify-center">
          <motion.div
            className="relative -mt-20"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="p-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-600 dark:to-purple-700 shadow-lg">
              {avatarPreview || formData.avatar ? (
                <img
                  src={avatarPreview || formData.avatar}
                  alt={formData.username}
                  className="w-36 h-36 rounded-full border-2 border-white dark:border-gray-800 bg-white dark:bg-gray-800 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/default-avatar.png";
                  }}
                />
              ) : (
                <div className="w-36 h-36 rounded-full border-2 border-white dark:border-gray-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                  <User className="h-20 w-20 text-blue-600 dark:text-blue-400 opacity-70" />
                </div>
              )}

              {!isEditing && (
                <motion.div
                  className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileForm
                formData={formData}
                handleInputChange={handleInputChange}
                handleAvatarChange={handleAvatarChange}
              />
            </motion.div>
          ) : (
            <motion.div
              key="profile-info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center px-6 py-4"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {formData.username || "Unknown"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {formData.email || "Unknown"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="pt-2 pb-6">
          <div className="border-t border-gray-200/70 dark:border-gray-700/70 pt-4 space-y-3 mb-4">
            <div className="flex items-center justify-center text-gray-700 dark:text-gray-300">
              <Calendar className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400" />
              <span className="font-medium">Joined {joinDate}</span>
            </div>
            <div className="flex items-center justify-center text-gray-700 dark:text-gray-300">
              {formData.emailVerified ? (
                <CheckCircle className="h-5 w-5 mr-3 text-green-500 dark:text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 mr-3 text-amber-500 dark:text-amber-400" />
              )}
              <span className="font-medium">
                {formData.emailVerified
                  ? "Email Verified"
                  : "Email Not Verified"}
              </span>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-600 dark:text-red-400 text-sm text-center my-4 px-4 py-2 bg-red-50 dark:bg-red-900/30 rounded-lg"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {isEditing && (
            <div className="mt-6 flex space-x-3 px-4">
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="h-4 w-4 mr-2" /> Save
                  </div>
                )}
              </Button>
              <Button
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-md transition-colors"
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-2" /> Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
