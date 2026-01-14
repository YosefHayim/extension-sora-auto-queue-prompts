import {
  FaCheckCircle,
  FaClock,
  FaImage,
  FaList,
  FaSpinner,
  FaTh,
  FaTimesCircle,
  FaVideo,
} from "react-icons/fa";

export type StatusFilter =
  | "all"
  | "pending"
  | "processing"
  | "completed"
  | "failed";
export type MediaTypeFilter = "all" | "video" | "image";

export const STATUS_CONFIG = {
  all: {
    icon: FaList,
    label: "All",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  pending: {
    icon: FaClock,
    label: "Pending",
    textColor: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  processing: {
    icon: FaSpinner,
    label: "Processing",
    textColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  completed: {
    icon: FaCheckCircle,
    label: "Completed",
    textColor: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  failed: {
    icon: FaTimesCircle,
    label: "Failed",
    textColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
} as const;

export const MEDIA_TYPE_CONFIG = {
  all: {
    icon: FaTh,
    label: "All Types",
    textColor: "text-slate-600 dark:text-slate-400",
  },
  video: {
    icon: FaVideo,
    label: "Video",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  image: {
    icon: FaImage,
    label: "Image",
    textColor: "text-purple-600 dark:text-purple-400",
  },
} as const;
