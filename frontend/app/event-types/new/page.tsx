"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function CreateEventType() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "30",
    slug: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.createEventType({
        title: formData.title,
        description: formData.description,
        duration: parseInt(formData.duration),
        slug:
          formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
      });

      if (response.success) {
        toast.success("Event type created!");
        router.push("/event-types");
      } else {
        toast.error(response.error?.message || "Failed to create event type");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-neutral-900">
          Create Event Type
        </h1>
        <p className="text-sm text-neutral-600 mt-1">
          Set up a new type of meeting for people to book
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-neutral-50 px-8 py-6">
        <div className="max-w-2xl">
          <Card className="bg-white border-neutral-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-neutral-900"
                >
                  Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., 30 min meeting"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="mt-2 border-neutral-200"
                />
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-neutral-900"
                >
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="Describe this meeting type"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-2 border-neutral-200"
                />
              </div>

              <div>
                <Label
                  htmlFor="duration"
                  className="text-sm font-medium text-neutral-900"
                >
                  Duration (minutes) *
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  required
                  className="mt-2 border-neutral-200"
                />
              </div>

              <div>
                <Label
                  htmlFor="slug"
                  className="text-sm font-medium text-neutral-900"
                >
                  Slug (URL path)
                </Label>
                <Input
                  id="slug"
                  placeholder="auto-generated from title"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="mt-2 border-neutral-200"
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-neutral-200">
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? "Creating..." : "Create Event Type"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-neutral-200"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
