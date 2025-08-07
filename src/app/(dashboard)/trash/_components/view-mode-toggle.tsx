"use client";

import { Button } from "@/components/ui/button";
import { ViewMode } from "@/types/document.types";

import { LayoutGrid, List } from "lucide-react";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: ViewModeToggleProps) {
  return (
    <div className="flex items-center rounded-lg border border-gray-400">
      <Button
        onClick={() => onViewModeChange("list")}
        className={`h-11 px-3 ${
          viewMode === "list"
            ? "text-primary bg-white"
            : "text-secondary bg-transparent"
        } hover:bg-secondary hover:text-white`}
      >
        <List className="h-5 w-5 font-semibold" />
      </Button>
      <Button
        onClick={() => onViewModeChange("grid")}
        className={`h-11 px-3 ${
          viewMode === "grid"
            ? "text-primary bg-white"
            : "text-secondary bg-transparent"
        } hover:bg-secondary hover:text-white`}
      >
        <LayoutGrid className="h-5 w-5 font-semibold" />
      </Button>
    </div>
  );
}
