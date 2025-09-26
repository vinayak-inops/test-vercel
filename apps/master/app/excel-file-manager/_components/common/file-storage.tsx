"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  MoreVertical,
  Download,
  Trash2,
  Share2,
  Star,
  Grid,
  List,
  Search,
  ChevronDown,
  Filter,
  Clock,
  Calendar,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { Badge } from "@repo/ui/components/ui/badge";
import { Input } from "@repo/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { cn } from "@repo/ui/lib/utils";
import { FileCard } from "./file-card";
import HFiveTag from "@repo/ui/components/text/h-five-tag";

// Sample data based on the screenshot
const files = [
  {
    id: 1,
    name: "adhventha.zip",
    type: "zip",
    status: "created",
    date: "Jan 24, 2025",
    user: {
      initial: "A",
      color: "bg-orange-500",
    },
  },
  {
    id: 2,
    name: "viksha-main.zip",
    type: "zip",
    status: "opened",
    date: "Feb 19, 2025",
    user: {
      initial: "A",
      color: "bg-orange-500",
    },
  },
  {
    id: 3,
    name: "Dr. Sanjeev Kumar.zip",
    type: "zip",
    status: "modified",
    date: "Jan 24, 2025",
    user: {
      initial: "A",
      color: "bg-orange-500",
    },
  },
  {
    id: 4,
    name: "bangalorestrokesupport.zip",
    type: "zip",
    status: "created",
    date: "Mar 10, 2025",
    user: {
      initial: "A",
      color: "bg-orange-500",
    },
  },
  {
    id: 5,
    name: "digital-Edu.zip",
    type: "zip",
    status: "opened",
    date: "Mar 15, 2025",
    user: {
      initial: "A",
      color: "bg-orange-500",
    },
  },
  {
    id: 6,
    name: "bloomwomenscentre.zip",
    type: "zip",
    status: "modified",
    date: "Mar 18, 2025",
    user: {
      initial: "A",
      color: "bg-orange-500",
    },
  },
  {
    id: 7,
    name: "quarterly-report.xlsx",
    type: "excel",
    status: "created",
    date: "Mar 19, 2025",
    user: {
      initial: "A",
      color: "bg-orange-500",
    },
  },
  {
    id: 8,
    name: "financial-data.xlsx",
    type: "excel",
    status: "modified",
    date: "Mar 20, 2025",
    user: {
      initial: "A",
      color: "bg-orange-500",
    },
  },
];

export function FileStorage({ excelData, deleteNote }: any) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    if (sortBy === "recent") {
      // This is a simplified sort - in a real app, you'd parse the dates properly
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return 0;
  });

  return (
    <div className="rounded-lg bg-white ">
      <div className="border-b p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <HFiveTag textvalue="Suggested files" />
            <Badge variant="outline" className="ml-2">
              {files.length}
            </Badge>
          </div>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {/* <div className="relative max-w-xs flex-1 sm:max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search files..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div> */}

            <div className="flex items-center gap-2">
              {/* <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Most recent</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Oldest first</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="name-asc">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4 rotate-180" />
                      <span>Name (A-Z)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="name-desc">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4" />
                      <span>Name (Z-A)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select> */}

              <TooltipProvider>
                <div className="flex items-center rounded-md border p-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid className="h-4 w-4" />
                        <span className="sr-only">Grid view</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Grid view</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="h-4 w-4" />
                        <span className="sr-only">List view</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>List view</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 p-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 mt-6">
          {excelData?.map((file: any, i: number) => (
            <FileCard key={i} file={file} deleteNote={deleteNote} />
          ))}
        </div>
      ) : (
        <div className="divide-y">
          {excelData.map((file: any) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                {file.type === "excel" ? (
                  <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                ) : (
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                )}
                <div>
                  <p className="font-medium">financial-data.xlsx</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-xs text-white bg-orange-500"
                      )}
                    >
                      A
                    </div>
                    <span className="text-xs text-slate-500">
                      x You modified • Mar 20, 2025
                    </span>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[200px]" align="end">
                  <DropdownMenuItem>
                    <Star className="mr-2 h-4 w-4" />
                    <span>Statues</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {sortedFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="rounded-full bg-slate-100 p-3">
            <Search className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No files found</h3>
          <p className="mt-2 text-center text-sm text-slate-500">
            We couldn't find any files matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
