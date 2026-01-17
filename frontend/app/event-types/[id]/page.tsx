"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import { eventTypeFormSchema } from "@/lib/validations";
import { ArrowLeft, Trash2 } from "lucide-react";

interface EventType {
  id: string;
  title: string;
  description?: string;
  duration: number;
  slug: string;
  scheduleId?: string;
}

interface Schedule {
  id: string;
  name: string;
}

export default function EventTypeForm() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string | undefined;

  const [isLoading, setIsLoading] = useState(!!eventId);
  const [isSaving, setIsSaving] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "30",
    slug: "",
    scheduleId: "",
  });

  // Load available schedules
  useEffect(() => {
    const loadSchedules = async () => {
      const response = await apiClient.get<Schedule[]>("/schedules");
      if (response.success && response.data) {
        setSchedules(response.data);
      }
    };
    loadSchedules();
  }, []);

  useEffect(() => {
    if (eventId && eventId !== "new") {
      const loadEventType = async () => {
        // Correct endpoint for fetching by ID is /event-types/id/:id
        const response = await apiClient.get<EventType>(
          `/event-types/id/${eventId}`
        );
        if (response.success && response.data) {
          setFormData({
            title: response.data.title,
            description: response.data.description || "",
            duration: response.data.duration.toString(),
            slug: response.data.slug,
            scheduleId: response.data.scheduleId || "",
          });
        } else {
          toast.error("Failed to load event type");
          router.push("/dashboard");
        }
        setIsLoading(false);
      };
      loadEventType();
    }
  }, [eventId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      eventTypeFormSchema.parse({
        ...formData,
        duration: parseInt(formData.duration),
      });
    } catch (error: any) {
      toast.error(error.errors?.[0]?.message || "Validation error");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        duration: parseInt(formData.duration),
        scheduleId: formData.scheduleId || undefined,
      };

      if (eventId && eventId !== "new") {
        const response = await apiClient.put(
          `/event-types/${eventId}`,
          payload
        );
        if (response.success) {
          toast.success("Event type updated!");
          router.push("/dashboard");
        } else {
          toast.error(response.error?.message || "Failed to update");
        }
      } else {
        const response = await apiClient.post("/event-types", payload);
        if (response.success) {
          toast.success("Event type created!");
          router.push("/dashboard");
        } else {
          toast.error(response.error?.message || "Failed to create");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!eventId || eventId === "new") return;

    if (!window.confirm("Are you sure? This cannot be undone.")) {
      return;
    }

    try {
      const response = await apiClient.delete(`/event-types/${eventId}`);
      if (response.success) {
        toast.success("Event type deleted!");
        router.push("/dashboard");
      } else {
        toast.error(response.error?.message || "Failed to delete");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-6 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-neutral-900">
            {eventId && eventId !== "new" ? "Edit Event" : "Create Event"}
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Configure your booking event type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., 30-minute consultation"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what happens on this meeting"
                    className="w-full h-24 px-3 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="15"
                    max="480"
                    step="5"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    Between 15 and 480 minutes
                  </p>
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <div className="flex items-center">
                    <span className="text-sm text-neutral-600 mr-2">
                      admin/
                    </span>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="my-event"
                      pattern="^[a-z0-9-]+$"
                      required
                      disabled={!!(eventId && eventId !== "new")}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    Lowercase letters, numbers, and hyphens only
                  </p>
                </div>

                <div>
                  <Label htmlFor="scheduleId">Availability Schedule *</Label>
                  <select
                    id="scheduleId"
                    name="scheduleId"
                    value={formData.scheduleId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        scheduleId: e.target.value,
                      }))
                    }
                    className="w-full h-10 px-3 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    required
                  >
                    <option value="">Select a schedule...</option>
                    {schedules.map((schedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        {schedule.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-neutral-500 mt-2">
                    Choose when this event can be booked.{" "}
                    {schedules.length === 0 && (
                      <span className="text-amber-600">
                        No schedules available. Create one in{" "}
                        <button
                          type="button"
                          onClick={() => router.push("/availability")}
                          className="underline hover:text-amber-700"
                        >
                          Availability
                        </button>
                        .
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isSaving} className="flex-1">
                    {isSaving
                      ? "Saving..."
                      : eventId && eventId !== "new"
                      ? "Update Event"
                      : "Create Event"}
                  </Button>
                  {eventId && eventId !== "new" && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
