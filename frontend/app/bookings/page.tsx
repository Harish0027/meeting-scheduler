"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import {
  Video,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  XCircle,
  Clock,
  MapPin,
  UserPlus,
  Flag,
  X,
  Users,
  Phone,
  User,
  Mail,
  Search,
  Check,
  Bookmark,
  Edit2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  bookerName: string;
  bookerEmail: string;
  location?: string;
  locationValue?: string;
  guests?: string[];
  eventType: {
    id: string;
    title: string;
    duration: number;
    slug: string;
  };
  user?: {
    username: string;
    email: string;
  };
}

interface EventType {
  id: string;
  title: string;
  slug: string;
}

type LocationType = "meet" | "in-person" | "phone";

interface LocationOption {
  value: LocationType;
  label: string;
  icon: React.ReactNode;
  requiresInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
}

const LOCATION_OPTIONS: LocationOption[] = [
  {
    value: "meet",
    label: "Cal Video",
    icon: <Video className="w-5 h-5" />,
  },
  {
    value: "in-person",
    label: "In Person",
    icon: <MapPin className="w-5 h-5" />,
    requiresInput: true,
    inputLabel: "Location address",
    inputPlaceholder: "Enter the meeting address",
  },
  {
    value: "phone",
    label: "Phone Call",
    icon: <Phone className="w-5 h-5" />,
    requiresInput: true,
    inputLabel: "Phone number",
    inputPlaceholder: "Enter your phone number",
  },
];

type TabType = "upcoming" | "unconfirmed" | "recurring" | "past" | "canceled";

const TABS: { key: TabType; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "unconfirmed", label: "Unconfirmed" },
  { key: "recurring", label: "Recurring" },
  { key: "past", label: "Past" },
  { key: "canceled", label: "Canceled" },
];

// Filter type definitions - Cal.com style
type FilterKey =
  | "eventType"
  | "attendeeName"
  | "attendeeEmail"
  | "dateRange"
  | "bookingUid";

interface FilterDefinition {
  key: FilterKey;
  label: string;
  icon: React.ReactNode;
}

const ALL_FILTERS: FilterDefinition[] = [
  {
    key: "eventType",
    label: "Event Type",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    key: "attendeeName",
    label: "Attendees Name",
    icon: <User className="w-4 h-4" />,
  },
  {
    key: "attendeeEmail",
    label: "Attendee Email",
    icon: <Mail className="w-4 h-4" />,
  },
  {
    key: "dateRange",
    label: "Date Range",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    key: "bookingUid",
    label: "Booking UID",
    icon: <Search className="w-4 h-4" />,
  },
];

interface FilterState {
  attendeeName: string;
  attendeeEmail: string;
  eventTypeId: string;
  dateFrom: string;
  dateTo: string;
  bookingUid: string;
}

// Saved Filter interface for localStorage
interface SavedFilter {
  id: string;
  name: string;
  filters: FilterState;
  activeFilterKeys: FilterKey[];
  createdAt: number;
}

const SAVED_FILTERS_KEY = "meeting-scheduler-saved-filters";

// LocalStorage helpers
const getSavedFiltersFromStorage = (): SavedFilter[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(SAVED_FILTERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveSavedFiltersToStorage = (filters: SavedFilter[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
};

// Track which filters are actively shown in the UI
type ActiveFilterKeys = Set<FilterKey>;

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, initFromCookie } = useAuthStore();

  // Initialize user from cookie on mount
  useEffect(() => {
    initFromCookie();
  }, [initFromCookie]);

  // Parse initial state from URL
  const initialTab = (searchParams.get("status") as TabType) || "upcoming";
  const initialFilters: FilterState = {
    attendeeName: searchParams.get("attendeeName") || "",
    attendeeEmail: searchParams.get("attendeeEmail") || "",
    eventTypeId: searchParams.get("eventTypeId") || "",
    dateFrom: searchParams.get("dateFrom") || "",
    dateTo: searchParams.get("dateTo") || "",
    bookingUid: searchParams.get("bookingUid") || "",
  };

  // Determine which filters are initially active based on URL params
  const getInitialActiveFilters = (): Set<FilterKey> => {
    const active = new Set<FilterKey>();
    if (initialFilters.eventTypeId) active.add("eventType");
    if (initialFilters.attendeeName) active.add("attendeeName");
    if (initialFilters.attendeeEmail) active.add("attendeeEmail");
    if (initialFilters.dateFrom || initialFilters.dateTo)
      active.add("dateRange");
    if (initialFilters.bookingUid) active.add("bookingUid");
    return active;
  };

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [activeFiltersSet, setActiveFiltersSet] = useState<Set<FilterKey>>(
    getInitialActiveFilters
  );
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter dropdown states
  const [showAddFilterDropdown, setShowAddFilterDropdown] = useState(false);
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<
    string | null
  >(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const addFilterRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [editLocationModal, setEditLocationModal] = useState<{
    open: boolean;
    booking: Booking | null;
  }>({
    open: false,
    booking: null,
  });
  const [addGuestsModal, setAddGuestsModal] = useState<{
    open: boolean;
    booking: Booking | null;
  }>({
    open: false,
    booking: null,
  });
  const [selectedLocation, setSelectedLocation] =
    useState<LocationType>("meet");
  const [locationInputValue, setLocationInputValue] = useState("");
  const [guestEmails, setGuestEmails] = useState<string[]>([""]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Saved Filters state
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSavedFiltersDropdown, setShowSavedFiltersDropdown] =
    useState(false);
  const [saveFilterDialogOpen, setSaveFilterDialogOpen] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState("");
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const savedFiltersRef = useRef<HTMLDivElement>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  // Load saved filters from localStorage on mount
  useEffect(() => {
    setSavedFilters(getSavedFiltersFromStorage());
  }, []);

  // Available filters (those NOT currently in activeFiltersSet)
  const availableFilters = useMemo(() => {
    return ALL_FILTERS.filter((f) => !activeFiltersSet.has(f.key));
  }, [activeFiltersSet]);

  // Check if any filters have values
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.attendeeName ||
      filters.attendeeEmail ||
      filters.eventTypeId ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.bookingUid
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.attendeeName) count++;
    if (filters.attendeeEmail) count++;
    if (filters.eventTypeId) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.bookingUid) count++;
    return count;
  }, [filters]);

  // Build URL with current filters
  const buildUrl = useCallback((tab: TabType, newFilters: FilterState) => {
    const params = new URLSearchParams();
    params.set("status", tab);
    if (newFilters.attendeeName)
      params.set("attendeeName", newFilters.attendeeName);
    if (newFilters.attendeeEmail)
      params.set("attendeeEmail", newFilters.attendeeEmail);
    if (newFilters.eventTypeId)
      params.set("eventTypeId", newFilters.eventTypeId);
    if (newFilters.dateFrom) params.set("dateFrom", newFilters.dateFrom);
    if (newFilters.dateTo) params.set("dateTo", newFilters.dateTo);
    if (newFilters.bookingUid) params.set("bookingUid", newFilters.bookingUid);
    return `/bookings?${params.toString()}`;
  }, []);

  // Fetch bookings from backend
  const fetchBookings = useCallback(
    async (tab: TabType, filterState: FilterState, userId?: string) => {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set("status", tab);
      if (userId) params.set("userId", userId);
      if (filterState.attendeeName)
        params.set("attendeeName", filterState.attendeeName);
      if (filterState.attendeeEmail)
        params.set("attendeeEmail", filterState.attendeeEmail);
      if (filterState.eventTypeId)
        params.set("eventTypeId", filterState.eventTypeId);
      if (filterState.dateFrom) params.set("dateFrom", filterState.dateFrom);
      if (filterState.dateTo) params.set("dateTo", filterState.dateTo);
      if (filterState.bookingUid)
        params.set("bookingUid", filterState.bookingUid);

      const response = await apiClient.get<Booking[]>(
        `/bookings?${params.toString()}`
      );
      if (response.success && response.data) {
        setBookings(response.data);
      }
      setIsLoading(false);
    },
    []
  );

  // Fetch event types for filter
  useEffect(() => {
    const loadEventTypes = async () => {
      const response = await apiClient.get<EventType[]>("/event-types");
      if (response.success && response.data) {
        setEventTypes(response.data);
      }
    };
    loadEventTypes();
  }, []);

  // Fetch bookings on mount and when filters change
  useEffect(() => {
    if (user?.id) {
      fetchBookings(activeTab, filters, user.id);
    }
  }, [activeTab, filters, fetchBookings, user?.id]);

  // Update URL when filters change
  useEffect(() => {
    const url = buildUrl(activeTab, filters);
    window.history.replaceState({}, "", url);
  }, [activeTab, filters, buildUrl]);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setActiveFilterDropdown(null);
      }
      if (
        addFilterRef.current &&
        !addFilterRef.current.contains(event.target as Node)
      ) {
        setShowAddFilterDropdown(false);
      }
      if (
        savedFiltersRef.current &&
        !savedFiltersRef.current.contains(event.target as Node)
      ) {
        setShowSavedFiltersDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tab change handler
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Filter handlers
  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Add a filter to the active filters bar
  const addFilter = (filterKey: FilterKey) => {
    setActiveFiltersSet((prev) => new Set([...prev, filterKey]));
    setShowAddFilterDropdown(false);
    // Immediately open the filter dropdown for the newly added filter
    setActiveFilterDropdown(filterKey);
  };

  // Remove a filter from the active filters bar and clear its value
  const removeFilter = (filterKey: FilterKey) => {
    setActiveFiltersSet((prev) => {
      const next = new Set(prev);
      next.delete(filterKey);
      return next;
    });
    setActiveFilterDropdown(null);

    // Clear the filter values
    switch (filterKey) {
      case "eventType":
        setFilters((prev) => ({ ...prev, eventTypeId: "" }));
        break;
      case "attendeeName":
        setFilters((prev) => ({ ...prev, attendeeName: "" }));
        break;
      case "attendeeEmail":
        setFilters((prev) => ({ ...prev, attendeeEmail: "" }));
        break;
      case "dateRange":
        setFilters((prev) => ({ ...prev, dateFrom: "", dateTo: "" }));
        break;
      case "bookingUid":
        setFilters((prev) => ({ ...prev, bookingUid: "" }));
        break;
    }
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      attendeeName: "",
      attendeeEmail: "",
      eventTypeId: "",
      dateFrom: "",
      dateTo: "",
      bookingUid: "",
    });
    setActiveFiltersSet(new Set());
    setActiveFilterDropdown(null);
  };

  // === SAVED FILTERS FUNCTIONS ===

  // Open save filter dialog
  const openSaveFilterDialog = () => {
    setSaveFilterName("");
    setEditingFilter(null);
    setSaveFilterDialogOpen(true);
  };

  // Save current filters as a new saved filter
  const handleSaveFilter = () => {
    const name = saveFilterName.trim();
    if (!name) {
      toast.error("Please enter a filter name");
      return;
    }

    if (editingFilter) {
      // Rename existing filter
      const updated = savedFilters.map((f) =>
        f.id === editingFilter.id ? { ...f, name } : f
      );
      setSavedFilters(updated);
      saveSavedFiltersToStorage(updated);
      toast.success("Filter renamed");
    } else {
      // Create new saved filter
      const newFilter: SavedFilter = {
        id: crypto.randomUUID(),
        name,
        filters: { ...filters },
        activeFilterKeys: Array.from(activeFiltersSet),
        createdAt: Date.now(),
      };
      const updated = [...savedFilters, newFilter];
      setSavedFilters(updated);
      saveSavedFiltersToStorage(updated);
      toast.success("Filter saved");
    }

    setSaveFilterDialogOpen(false);
    setSaveFilterName("");
    setEditingFilter(null);
  };

  // Load a saved filter (apply its filters)
  const loadSavedFilter = (savedFilter: SavedFilter) => {
    // Clear current filters first
    clearAllFilters();

    // Apply saved filter values
    setFilters(savedFilter.filters);
    setActiveFiltersSet(new Set(savedFilter.activeFilterKeys));
    setShowSavedFiltersDropdown(false);
    setCurrentPage(1);
    toast.success(`Applied filter: ${savedFilter.name}`);
  };

  // Open rename dialog for a saved filter
  const openRenameFilterDialog = (savedFilter: SavedFilter) => {
    setEditingFilter(savedFilter);
    setSaveFilterName(savedFilter.name);
    setSaveFilterDialogOpen(true);
    setShowSavedFiltersDropdown(false);
  };

  // Delete a saved filter
  const deleteSavedFilter = (filterId: string) => {
    const updated = savedFilters.filter((f) => f.id !== filterId);
    setSavedFilters(updated);
    saveSavedFiltersToStorage(updated);
    toast.success("Filter deleted");
  };

  const handleCancel = (booking: Booking) => {
    setActiveMenu(null);
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;

    const response = await apiClient.put(
      `/bookings/${bookingToCancel.id}/cancel`,
      {
        bookerEmail: bookingToCancel.bookerEmail,
      }
    );
    if (response.success) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingToCancel.id ? { ...b, status: "cancelled" } : b
        )
      );
      toast.success("Booking cancelled");
    } else {
      toast.error("Failed to cancel booking");
    }

    setCancelDialogOpen(false);
    setBookingToCancel(null);
  };

  const handleReschedule = (booking: Booking) => {
    setActiveMenu(null);
    const username = booking.user?.username || "admin";
    const eventSlug =
      booking.eventType.slug ||
      booking.eventType.title.toLowerCase().replace(/\s+/g, "-");
    const params = new URLSearchParams({
      rescheduleUid: booking.id,
      rescheduledBy: booking.bookerEmail,
      overlayCalendar: "true",
    });
    router.push(`/${username}/${eventSlug}?${params.toString()}`);
  };

  const openEditLocationModal = (booking: Booking) => {
    setActiveMenu(null);
    const currentLocation = booking.location || "meet";
    let locationType: LocationType = "meet";
    if (currentLocation === "in-person") locationType = "in-person";
    else if (currentLocation === "phone") locationType = "phone";
    setSelectedLocation(locationType);
    setLocationInputValue(booking.locationValue || "");
    setEditLocationModal({ open: true, booking });
  };

  const closeEditLocationModal = () => {
    setEditLocationModal({ open: false, booking: null });
    setSelectedLocation("meet");
    setLocationInputValue("");
  };

  const handleUpdateLocation = async () => {
    if (!editLocationModal.booking) return;

    const selectedOption = LOCATION_OPTIONS.find(
      (o) => o.value === selectedLocation
    );
    if (selectedOption?.requiresInput && !locationInputValue.trim()) {
      toast.error(`Please enter ${selectedOption.inputLabel?.toLowerCase()}`);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await apiClient.put(
        `/bookings/${editLocationModal.booking.id}/location`,
        {
          location: selectedLocation,
          locationValue: locationInputValue || undefined,
        }
      );

      if (response.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === editLocationModal.booking!.id
              ? {
                  ...b,
                  location: selectedLocation,
                  locationValue: locationInputValue,
                }
              : b
          )
        );
        toast.success("Location updated successfully");
        closeEditLocationModal();
      } else {
        toast.error(response.error?.message || "Failed to update location");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const openAddGuestsModal = (booking: Booking) => {
    setActiveMenu(null);
    setGuestEmails([""]);
    setAddGuestsModal({ open: true, booking });
  };

  const closeAddGuestsModal = () => {
    setAddGuestsModal({ open: false, booking: null });
    setGuestEmails([""]);
  };

  const handleAddGuests = async () => {
    if (!addGuestsModal.booking) return;

    const validEmails = guestEmails.filter((email) => email.trim() !== "");
    if (validEmails.length === 0) {
      toast.error("Please enter at least one email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = validEmails.filter(
      (email) => !emailRegex.test(email)
    );
    if (invalidEmails.length > 0) {
      toast.error("Please enter valid email addresses");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await apiClient.put(
        `/bookings/${addGuestsModal.booking.id}/guests`,
        {
          guests: validEmails,
        }
      );

      if (response.success && response.data) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === addGuestsModal.booking!.id
              ? { ...b, guests: (response.data as Booking).guests }
              : b
          )
        );
        toast.success("Guests added successfully");
        closeAddGuestsModal();
      } else {
        toast.error(response.error?.message || "Failed to add guests");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  // Group bookings by date
  const groupedBookings = useMemo(() => {
    const groups: { [key: string]: { date: Date; bookings: Booking[] } } = {};

    bookings.forEach((booking) => {
      const date = new Date(booking.startTime);
      const dateKey = date.toISOString().split("T")[0];

      if (!groups[dateKey]) {
        groups[dateKey] = { date, bookings: [] };
      }
      groups[dateKey].bookings.push(booking);
    });

    return Object.entries(groups)
      .sort(([a], [b]) =>
        activeTab === "upcoming" ? a.localeCompare(b) : b.localeCompare(a)
      )
      .map(([, group]) => group);
  }, [bookings, activeTab]);

  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    let count = 0;
    const result: typeof groupedBookings = [];

    for (const group of groupedBookings) {
      if (count >= end) break;
      if (count + group.bookings.length > start) {
        result.push(group);
      }
      count += group.bookings.length;
    }

    return result;
  }, [groupedBookings, currentPage, rowsPerPage]);

  const totalBookings = bookings.length;
  const totalPages = Math.ceil(totalBookings / rowsPerPage);

  const getGroupTitle = (groupDate: Date, index: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(groupDate);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "TODAY";
    }

    if (activeTab === "upcoming" && index === 0 && date > today) {
      return "NEXT";
    }

    return date
      .toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
      .toUpperCase()
      .replace(",", "");
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr)
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-neutral-200">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
          Bookings
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1 hidden sm:block">
          See upcoming and past events booked through your event type links.
        </p>
      </div>

      {/* Tabs & Filters */}
      <div className="px-4 sm:px-6 lg:px-8 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
          {/* Tabs - Scrollable on mobile */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                  activeTab === tab.key
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter & Saved Filters Row */}
          <div className="flex items-center gap-2">
            {/* Filter Button */}
            <button
              onClick={() =>
                activeFiltersSet.size === 0
                  ? setShowAddFilterDropdown(!showAddFilterDropdown)
                  : null
              }
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border rounded-md text-xs sm:text-sm transition-colors ${
                activeFilterCount > 0
                  ? "border-neutral-400 bg-neutral-100 text-neutral-900"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-neutral-900 text-white text-xs font-medium rounded">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Saved Filters Dropdown */}
            <div className="relative" ref={savedFiltersRef}>
              <button
                onClick={() =>
                  setShowSavedFiltersDropdown(!showSavedFiltersDropdown)
                }
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border border-neutral-200 rounded-md text-xs sm:text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Saved filters</span>
                {savedFilters.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 text-xs font-medium rounded">
                    {savedFilters.length}
                  </span>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>

              {showSavedFiltersDropdown && (
                <div className="absolute top-full right-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-neutral-200 z-30">
                  <div className="p-2 border-b border-neutral-100">
                    <div className="text-xs font-medium text-neutral-500 px-2 py-1">
                      SAVED FILTERS
                    </div>
                  </div>
                  {savedFilters.length === 0 ? (
                    <div className="p-4 text-center text-sm text-neutral-500">
                      No saved filters yet.
                      <br />
                      Apply filters and click "Save" to create one.
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto py-1">
                      {savedFilters.map((sf) => (
                        <div
                          key={sf.id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-neutral-50 group"
                        >
                          <button
                            onClick={() => loadSavedFilter(sf)}
                            className="flex-1 text-left text-sm text-neutral-700 hover:text-neutral-900"
                          >
                            {sf.name}
                          </button>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openRenameFilterDialog(sf);
                              }}
                              className="p-1 hover:bg-neutral-200 rounded"
                              title="Rename"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSavedFilter(sf.id);
                              }}
                              className="p-1 hover:bg-red-100 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Bar - Only show when filters are active or being added */}
      {(activeFiltersSet.size > 0 || showAddFilterDropdown) && (
        <div
          className="px-4 sm:px-6 lg:px-8 py-3 border-b border-neutral-200 bg-white overflow-x-auto"
          ref={filterRef}
        >
          <div className="flex flex-wrap items-center gap-2 min-w-max sm:min-w-0">
            {/* Render only the active filters */}
            {activeFiltersSet.has("eventType") && (
              <div className="relative">
                <button
                  onClick={() =>
                    setActiveFilterDropdown(
                      activeFilterDropdown === "eventType" ? null : "eventType"
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 bg-white rounded-md text-sm transition-colors hover:bg-neutral-50"
                >
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <span className="text-neutral-700">Event Type</span>
                  {filters.eventTypeId && (
                    <span className="font-medium text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded text-xs">
                      {eventTypes.find((e) => e.id === filters.eventTypeId)
                        ?.title || "Selected"}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {activeFilterDropdown === "eventType" && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 z-20 p-2">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                    <div className="max-h-48 overflow-y-auto">
                      <div className="text-xs font-medium text-neutral-500 px-2 py-1">
                        INDIVIDUAL
                      </div>
                      {eventTypes.map((et) => (
                        <button
                          key={et.id}
                          onClick={() => {
                            updateFilter(
                              "eventTypeId",
                              filters.eventTypeId === et.id ? "" : et.id
                            );
                            setActiveFilterDropdown(null);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-neutral-100 rounded-md text-sm text-left"
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              filters.eventTypeId === et.id
                                ? "bg-neutral-900 border-neutral-900"
                                : "border-neutral-300"
                            }`}
                          >
                            {filters.eventTypeId === et.id && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          {et.title}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-neutral-200 mt-2 pt-2 flex justify-between">
                      <button
                        onClick={() => removeFilter("eventType")}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => setActiveFilterDropdown(null)}
                        className="px-3 py-1.5 text-sm text-white bg-neutral-900 hover:bg-neutral-800 rounded-md"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeFiltersSet.has("attendeeName") && (
              <div className="relative">
                <button
                  onClick={() =>
                    setActiveFilterDropdown(
                      activeFilterDropdown === "attendeeName"
                        ? null
                        : "attendeeName"
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 bg-white rounded-md text-sm transition-colors hover:bg-neutral-50"
                >
                  <User className="w-4 h-4 text-neutral-500" />
                  <span className="text-neutral-700">Attendees Name</span>
                  {filters.attendeeName && (
                    <span className="font-medium text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded text-xs">
                      {filters.attendeeName}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {activeFilterDropdown === "attendeeName" && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 z-20 p-3">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={filters.attendeeName}
                        onChange={(e) =>
                          updateFilter("attendeeName", e.target.value)
                        }
                        placeholder="Enter name..."
                        className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        autoFocus
                      />
                      <div className="flex justify-between">
                        <button
                          onClick={() => removeFilter("attendeeName")}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => setActiveFilterDropdown(null)}
                          className="px-3 py-1.5 text-sm text-white bg-neutral-900 hover:bg-neutral-800 rounded-md"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeFiltersSet.has("attendeeEmail") && (
              <div className="relative">
                <button
                  onClick={() =>
                    setActiveFilterDropdown(
                      activeFilterDropdown === "attendeeEmail"
                        ? null
                        : "attendeeEmail"
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 bg-white rounded-md text-sm transition-colors hover:bg-neutral-50"
                >
                  <Mail className="w-4 h-4 text-neutral-500" />
                  <span className="text-neutral-700">Attendee Email</span>
                  {filters.attendeeEmail && (
                    <span className="font-medium text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded text-xs">
                      {filters.attendeeEmail}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {activeFilterDropdown === "attendeeEmail" && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 z-20 p-3">
                    <div className="space-y-3">
                      <input
                        type="email"
                        value={filters.attendeeEmail}
                        onChange={(e) =>
                          updateFilter("attendeeEmail", e.target.value)
                        }
                        placeholder="Enter email..."
                        className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        autoFocus
                      />
                      <div className="flex justify-between">
                        <button
                          onClick={() => removeFilter("attendeeEmail")}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => setActiveFilterDropdown(null)}
                          className="px-3 py-1.5 text-sm text-white bg-neutral-900 hover:bg-neutral-800 rounded-md"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeFiltersSet.has("dateRange") && (
              <div className="relative">
                <button
                  onClick={() =>
                    setActiveFilterDropdown(
                      activeFilterDropdown === "dateRange" ? null : "dateRange"
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 bg-white rounded-md text-sm transition-colors hover:bg-neutral-50"
                >
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <span className="text-neutral-700">Date Range</span>
                  {(filters.dateFrom || filters.dateTo) && (
                    <span className="font-medium text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded text-xs">
                      {filters.dateFrom && filters.dateTo
                        ? `${new Date(
                            filters.dateFrom
                          ).toLocaleDateString()} - ${new Date(
                            filters.dateTo
                          ).toLocaleDateString()}`
                        : filters.dateFrom
                        ? `From ${new Date(
                            filters.dateFrom
                          ).toLocaleDateString()}`
                        : `Until ${new Date(
                            filters.dateTo
                          ).toLocaleDateString()}`}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {activeFilterDropdown === "dateRange" && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-neutral-200 z-20 p-3">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">
                          From
                        </label>
                        <input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) =>
                            updateFilter("dateFrom", e.target.value)
                          }
                          className="w-full px-2 py-1.5 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">
                          To
                        </label>
                        <input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) =>
                            updateFilter("dateTo", e.target.value)
                          }
                          className="w-full px-2 py-1.5 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <button
                        onClick={() => removeFilter("dateRange")}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => setActiveFilterDropdown(null)}
                        className="px-3 py-1.5 text-sm text-white bg-neutral-900 hover:bg-neutral-800 rounded-md"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeFiltersSet.has("bookingUid") && (
              <div className="relative">
                <button
                  onClick={() =>
                    setActiveFilterDropdown(
                      activeFilterDropdown === "bookingUid"
                        ? null
                        : "bookingUid"
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 bg-white rounded-md text-sm transition-colors hover:bg-neutral-50"
                >
                  <Search className="w-4 h-4 text-neutral-500" />
                  <span className="text-neutral-700">Booking UID</span>
                  {filters.bookingUid && (
                    <span className="font-medium text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded text-xs">
                      {filters.bookingUid}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {activeFilterDropdown === "bookingUid" && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 z-20 p-3">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={filters.bookingUid}
                        onChange={(e) =>
                          updateFilter("bookingUid", e.target.value)
                        }
                        placeholder="Enter booking UID..."
                        className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        autoFocus
                      />
                      <div className="flex justify-between">
                        <button
                          onClick={() => removeFilter("bookingUid")}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => setActiveFilterDropdown(null)}
                          className="px-3 py-1.5 text-sm text-white bg-neutral-900 hover:bg-neutral-800 rounded-md"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add Filter Button - Shows dropdown with available filters */}
            {availableFilters.length > 0 && (
              <div className="relative" ref={addFilterRef}>
                <button
                  onClick={() =>
                    setShowAddFilterDropdown(!showAddFilterDropdown)
                  }
                  className="flex items-center justify-center w-8 h-8 border border-neutral-200 rounded-md hover:bg-neutral-100 transition-colors"
                  title="Add filter"
                >
                  <span className="text-neutral-500 text-lg leading-none">
                    +
                  </span>
                </button>

                {showAddFilterDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-20 py-1">
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full px-3 py-1.5 border-b border-neutral-200 text-sm focus:outline-none"
                    />
                    {availableFilters.map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => addFilter(filter.key)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 text-left"
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Clear All & Save - Only show when filters have values */}
            {hasActiveFilters && (
              <>
                <div className="h-6 w-px bg-neutral-200 mx-1" />
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-neutral-600 hover:text-neutral-900"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
                <button
                  onClick={openSaveFilterDialog}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-neutral-600 hover:text-neutral-900"
                >
                  <Bookmark className="w-4 h-4" />
                  Save
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="border-2 border-dashed border-neutral-200 rounded-lg py-12 sm:py-20 px-4 sm:px-6">
            <div className="text-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-3 sm:mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 sm:w-7 h-5 sm:h-7 text-neutral-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">
                No {activeTab} bookings
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                {activeTab === "upcoming"
                  ? "You have no upcoming bookings. As soon as someone books a time with you it will show up here."
                  : activeTab === "recurring"
                  ? "You have no recurring bookings. As soon as someone books a recurring meeting with you it will show up here."
                  : activeTab === "unconfirmed"
                  ? "You have no unconfirmed bookings. As soon as someone books a meeting that requires confirmation it will show up here."
                  : activeTab === "past"
                  ? "You have no past bookings."
                  : activeTab === "canceled"
                  ? "You have no canceled bookings."
                  : `No ${activeTab} bookings to show.`}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Bookings Table */}
            <div className="border border-neutral-200 rounded-lg">
              {paginatedGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {/* Date Header */}
                  <div
                    className={`bg-neutral-50 px-4 py-2 border-b border-neutral-200 ${
                      groupIndex === 0 ? "rounded-t-lg" : ""
                    }`}
                  >
                    <span className="text-xs font-bold text-neutral-600 tracking-wide">
                      {getGroupTitle(group.date, groupIndex)}
                    </span>
                  </div>

                  {/* Bookings for this date */}
                  {group.bookings.map((booking, bookingIndex) => (
                    <div
                      key={booking.id}
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                      className={`p-4 hover:bg-neutral-50 transition-colors cursor-pointer ${
                        bookingIndex < group.bookings.length - 1
                          ? "border-b border-neutral-100"
                          : ""
                      }`}
                    >
                      {/* Mobile Layout */}
                      <div className="block sm:hidden">
                        {/* Top Row: Date & Time + Actions */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-neutral-900">
                              {formatDateShort(booking.startTime)}
                            </span>
                            <span className="text-sm text-neutral-500 ml-4">
                              {formatTime(booking.startTime)} -{" "}
                              {formatTime(booking.endTime)}
                            </span>
                            {/* Rescheduled Badge */}
                            {booking.status === "rescheduled" && (
                              <span className="ml-2 inline-block px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-50 rounded">
                                Rescheduled
                              </span>
                            )}
                          </div>
                          <div
                            className="relative"
                            ref={activeMenu === booking.id ? menuRef : null}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(
                                  activeMenu === booking.id ? null : booking.id
                                );
                              }}
                              className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors text-neutral-400"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            {/* Mobile Actions Menu */}
                            {activeMenu === booking.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50"
                              >
                                <div className="px-3 py-2 text-xs font-semibold text-neutral-500">
                                  Edit event
                                </div>
                                <button
                                  onClick={() => handleReschedule(booking)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left"
                                >
                                  <Clock className="w-4 h-4 text-neutral-500" />
                                  Reschedule booking
                                </button>
                                <button
                                  onClick={() => openEditLocationModal(booking)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left"
                                >
                                  <MapPin className="w-4 h-4 text-neutral-500" />
                                  Edit location
                                </button>
                                <button
                                  onClick={() => openAddGuestsModal(booking)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left"
                                >
                                  <UserPlus className="w-4 h-4 text-neutral-500" />
                                  Add guests
                                </button>

                                <div className="my-1 border-t border-neutral-100" />

                                <button className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                                  <Flag className="w-4 h-4" />
                                  Report booking
                                </button>
                                <button
                                  onClick={() => handleCancel(booking)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Cancel event
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Event Title */}
                        <p className="text-sm font-medium text-blue-600 mb-1">
                          {booking.eventType.title} between{" "}
                          {booking.user?.username || "You"} and{" "}
                          {booking.bookerName}
                        </p>

                        {/* Notes */}
                        {booking.notes && (
                          <p className="text-sm text-neutral-600 mb-1">
                            &quot;{booking.notes}&quot;
                          </p>
                        )}

                        {/* Attendees */}
                        <p className="text-sm text-neutral-500">
                          You and {booking.bookerName}
                          {(booking.guests?.length || 0) > 0 && (
                            <span> +{booking.guests?.length}</span>
                          )}
                        </p>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex sm:items-center gap-4">
                        {/* Date & Time */}
                        <div className="flex flex-col sm:w-32 shrink-0">
                          <span className="text-sm font-medium text-neutral-900">
                            {formatDateShort(booking.startTime)}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {formatTime(booking.startTime)} -{" "}
                            {formatTime(booking.endTime)}
                          </span>
                        </div>

                        {/* Video Link */}
                        <div className="flex items-center gap-2 w-28 shrink-0">
                          <Video className="w-4 h-4 text-neutral-400" />
                          <a
                            href="#"
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Join Cal Video
                          </a>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {booking.eventType.title} between{" "}
                            <span className="text-neutral-700">
                              {booking.user?.username || "You"}
                            </span>
                            {" and "}
                            <span className="text-neutral-700">
                              {booking.bookerName}
                            </span>
                          </p>
                          {booking.notes && (
                            <p className="text-xs text-neutral-500 truncate mt-0.5 italic">
                              &quot;{booking.notes}&quot;
                            </p>
                          )}
                          <p className="text-xs text-neutral-500 mt-0.5">
                            You and {booking.bookerName}
                          </p>
                          {/* Rescheduled Badge */}
                          {booking.status === "rescheduled" && (
                            <div className="mt-2">
                              <span className="inline-block px-2 py-0.5 text-xs font-medium text-amber-800 bg-amber-100 rounded">
                                Rescheduled
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Attendees */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex -space-x-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-white flex items-center justify-center">
                              <span className="text-xs text-white font-medium">
                                Y
                              </span>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-teal-500 border-2 border-white flex items-center justify-center">
                              <span className="text-xs text-white font-medium">
                                {booking.bookerName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {(booking.guests?.length || 0) > 0 && (
                            <span className="text-xs text-neutral-500">
                              +{booking.guests?.length}
                            </span>
                          )}
                        </div>

                        {/* More Actions */}
                        <div
                          className="relative"
                          ref={activeMenu === booking.id ? menuRef : null}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(
                                activeMenu === booking.id ? null : booking.id
                              );
                            }}
                            className="p-2 hover:bg-neutral-100 rounded-md transition-colors text-neutral-500"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {/* Desktop Actions Menu */}
                          {activeMenu === booking.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50"
                            >
                              <div className="px-3 py-2 text-xs font-semibold text-neutral-500">
                                Edit event
                              </div>
                              <button
                                onClick={() => handleReschedule(booking)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left"
                              >
                                <Clock className="w-4 h-4 text-neutral-500" />
                                Reschedule booking
                              </button>
                              <button
                                onClick={() => openEditLocationModal(booking)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left"
                              >
                                <MapPin className="w-4 h-4 text-neutral-500" />
                                Edit location
                              </button>
                              <button
                                onClick={() => openAddGuestsModal(booking)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left"
                              >
                                <UserPlus className="w-4 h-4 text-neutral-500" />
                                Add guests
                              </button>

                              <div className="my-1 border-t border-neutral-100" />

                              <button className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                                <Flag className="w-4 h-4" />
                                Report booking
                              </button>
                              <button
                                onClick={() => handleCancel(booking)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel event
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 mt-4 text-xs sm:text-sm">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-neutral-600">Rows per page</span>
                <div className="relative">
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none border border-neutral-200 rounded-md px-2 py-1 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-neutral-600">
                  {Math.min((currentPage - 1) * rowsPerPage + 1, totalBookings)}
                  -{Math.min(currentPage * rowsPerPage, totalBookings)} of{" "}
                  {totalBookings}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Location Modal - Cal.com Style */}
      {editLocationModal.open && editLocationModal.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeEditLocationModal}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-neutral-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Edit location
                </h2>
              </div>

              {/* Current Location */}
              <div className="mb-6">
                <p className="text-sm text-neutral-500 mb-1">
                  Current location:
                </p>
                <p className="text-sm font-medium text-neutral-900">
                  {LOCATION_OPTIONS.find(
                    (l) =>
                      l.value ===
                      (editLocationModal.booking?.location || "meet")
                  )?.label || "Cal Video"}
                </p>
              </div>

              {/* Location Options - Card Style */}
              <div className="space-y-3 mb-6">
                {LOCATION_OPTIONS.map((option) => (
                  <div key={option.value}>
                    <button
                      onClick={() => {
                        setSelectedLocation(option.value);
                        if (!option.requiresInput) setLocationInputValue("");
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                        selectedLocation === option.value
                          ? "border-neutral-900 bg-neutral-50"
                          : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedLocation === option.value
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {option.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <p
                          className={`font-medium ${
                            selectedLocation === option.value
                              ? "text-neutral-900"
                              : "text-neutral-700"
                          }`}
                        >
                          {option.label}
                        </p>
                        {option.value === "meet" && (
                          <p className="text-xs text-neutral-500">
                            Default video conferencing
                          </p>
                        )}
                        {option.value === "in-person" && (
                          <p className="text-xs text-neutral-500">
                            Meet at a physical location
                          </p>
                        )}
                        {option.value === "phone" && (
                          <p className="text-xs text-neutral-500">
                            Phone call meeting
                          </p>
                        )}
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedLocation === option.value
                            ? "border-neutral-900 bg-neutral-900"
                            : "border-neutral-300"
                        }`}
                      >
                        {selectedLocation === option.value && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </button>

                    {/* Conditional Input Field */}
                    {option.requiresInput &&
                      selectedLocation === option.value && (
                        <div className="mt-3 ml-14 mr-4">
                          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            {option.inputLabel}
                          </label>
                          <input
                            type={option.value === "phone" ? "tel" : "text"}
                            value={locationInputValue}
                            onChange={(e) =>
                              setLocationInputValue(e.target.value)
                            }
                            placeholder={option.inputPlaceholder}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                          />
                        </div>
                      )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeEditLocationModal}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateLocation}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {isUpdating ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Guests Modal */}
      {addGuestsModal.open && addGuestsModal.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeAddGuestsModal}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-neutral-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Add guests
                </h2>
              </div>

              {/* Email Inputs */}
              <div className="mb-4">
                <p className="text-sm font-medium text-neutral-700 mb-3">
                  Add emails
                </p>
                <div className="space-y-2">
                  {guestEmails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...guestEmails];
                          newEmails[index] = e.target.value;
                          setGuestEmails(newEmails);
                        }}
                        placeholder="guest@example.com"
                        className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                      {guestEmails.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setGuestEmails(
                              guestEmails.filter((_, i) => i !== index)
                            )
                          }
                          className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setGuestEmails([...guestEmails, ""])}
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-6"
              >
                <Users className="w-4 h-4" />
                Add another
              </button>

              {/* Current guests */}
              {addGuestsModal.booking.guests &&
                addGuestsModal.booking.guests.length > 0 && (
                  <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
                    <p className="text-xs font-medium text-neutral-500 mb-2">
                      Current guests:
                    </p>
                    <div className="space-y-1">
                      {addGuestsModal.booking.guests.map((guest, index) => (
                        <p key={index} className="text-sm text-neutral-700">
                          {guest}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeAddGuestsModal}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGuests}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {isUpdating ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setCancelDialogOpen(false);
                setBookingToCancel(null);
              }}
            >
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save/Rename Filter Dialog */}
      <Dialog
        open={saveFilterDialogOpen}
        onOpenChange={setSaveFilterDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFilter ? "Rename Filter" : "Save Filter"}
            </DialogTitle>
            <DialogDescription>
              {editingFilter
                ? "Enter a new name for this saved filter."
                : "Give this filter set a name to quickly apply it later."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Filter name
            </label>
            <input
              type="text"
              value={saveFilterName}
              onChange={(e) => setSaveFilterName(e.target.value)}
              placeholder="e.g., High priority bookings"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveFilter();
                }
              }}
            />
          </div>
          <DialogFooter className="flex gap-2">
            <button
              onClick={() => {
                setSaveFilterDialogOpen(false);
                setSaveFilterName("");
                setEditingFilter(null);
              }}
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveFilter}
              disabled={!saveFilterName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {editingFilter ? "Rename" : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
