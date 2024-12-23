"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ResumeManager() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold">Current Resume</h4>
              <p className="text-sm text-muted-foreground">
                Last updated: 3 days ago
              </p>
            </div>
            <Button variant="outline">View</Button>
          </div>
          
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              id="resume-upload"
            />
            <label
              htmlFor="resume-upload"
              className="cursor-pointer rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm hover:border-gray-400"
            >
              Upload New Resume
            </label>
            {selectedFile && (
              <Button variant="default">Save Changes</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 