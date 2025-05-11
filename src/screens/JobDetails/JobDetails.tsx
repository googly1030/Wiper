import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  format,
  parseISO,
  addDays,
  isWithinInterval,
  isSameDay,
  getDaysInMonth,
  startOfMonth,
  getDay,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Car,
  CheckCircle,
  Camera,
  Plus,
  ArrowLeft,
  Calendar as CalendarIconFill,
  Upload,
  User,
  AlertTriangle,
  FileImage,
  Star,
  Info,
  CalendarCheck,
  CalendarOff,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "../../components/CustomToast";
import WiperNavigation from "../../components/WiperNavigation";

// Interface for calendar day status
interface CalendarDay {
  date: string;
  status: "completed" | "pending" | "upcoming" | "leave" | "none";
  notes?: string;
  photoUrl?: string;
}

// Interface for detailed job
interface DetailedJob {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  location: string;
  carDetails: {
    make: string;
    model: string;
    type: string;
    color: string;
    regNumber: string;
  };
  distance: string;
  payment: number;
  planName: string;
  planFrequency: string;
  planFeatures: string[];
  serviceDuration: number; // in days (30 by default)
  calendarDays: CalendarDay[];
  completedDays: number;
  totalEarnings: number;
  customerContact?: string;
  specialInstructions?: string;
}

// Step type for our workflow
type WorkflowStep = "summary" | "upload" | "complete" | "leave";

export const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<DetailedJob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [photoUploadDay, setPhotoUploadDay] = useState<string | null>(null);
  const [leaveApplicationDay, setLeaveApplicationDay] = useState<string | null>(
    null
  );
  const [leaveReason, setLeaveReason] = useState("");
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");

  // New state for step-based workflow
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("summary");
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get booked jobs from localStorage
        const storedBookings = localStorage.getItem("wiperBookedJobs");
        const parsedBookings = storedBookings ? JSON.parse(storedBookings) : [];

        // Find the specific job
        const foundJob = parsedBookings.find((job: any) => job.id === jobId);

        if (!foundJob) {
          toast("Job not found");
          navigate("/");
          return;
        }

        // Generate calendar days for 30 days starting from job date
        const startDate = parseISO(foundJob.date);
        const calendarDays: CalendarDay[] = [];

        // Check if there are any saved completed jobs for this job
        const completedJobs = localStorage.getItem("wiperCompletedJobs");
        const parsedCompletedJobs = completedJobs ? JSON.parse(completedJobs) : {};
        const thisJobCompletions = parsedCompletedJobs[jobId] || {};

        // NEW: Check if there are any leave requests for this job
        const leaveRequests = localStorage.getItem("wiperLeaveRequests");
        const parsedLeaveRequests = leaveRequests ? JSON.parse(leaveRequests) : {};
        const thisJobLeaves = parsedLeaveRequests[jobId] || {};

        for (let i = 0; i < 30; i++) {
          const currentDate = addDays(startDate, i);
          const dateStr = format(currentDate, "yyyy-MM-dd");
          const today = new Date();

          // Determine status based on date
          let status: CalendarDay["status"] = "none";
          let photoUrl: string | undefined;
          let notes: string | undefined;

          // First check if this day has a leave request
          if (thisJobLeaves[dateStr]) {
            status = "leave";
            notes = thisJobLeaves[dateStr].reason || "Leave requested";
          }
          // Then check if this day is marked as completed
          else if (thisJobCompletions[dateStr]) {
            status = "completed";
            photoUrl = thisJobCompletions[dateStr].photoUrl;
            notes = "Car cleaned as scheduled";
          } 
          // Otherwise determine based on date
          else if (isSameDay(currentDate, today)) {
            status = "pending"; // Today is pending by default
          } else if (currentDate < today) {
            // Mock data: 80% chance of completion for past days
            status = Math.random() < 0.8 ? "completed" : "leave";
          } else {
            status = "upcoming";
          }

          calendarDays.push({
            date: dateStr,
            status,
            notes: notes || (status === "completed" ? "Car cleaned as scheduled" : 
                            status === "leave" ? "Leave day" : ""),
            photoUrl:
              photoUrl ||
              (status === "completed"
                ? `/mock-photos/car-${Math.floor(Math.random() * 5) + 1}.jpg`
                : undefined),
          });
        }

        // Calculate completed days and total earnings
        const completedDays = calendarDays.filter(
          (day) => day.status === "completed"
        ).length;
        const totalEarnings = (foundJob.payment / 30) * completedDays;

        // Create detailed job with calendar info
        const detailedJob: DetailedJob = {
          ...foundJob,
          serviceDuration: 30,
          calendarDays,
          completedDays,
          totalEarnings,
          customerContact: "+91 98765 43210",
          specialInstructions:
            "Please make sure to clean the dashboard properly and apply protectant. Car is parked in basement parking slot B12.",
        };

        setJob(detailedJob);

        // Check if today's job is already completed
        const today = format(new Date(), "yyyy-MM-dd");
        const todayStatus = calendarDays.find(
          (day) => day.date === today
        )?.status;
        setTodayCompleted(todayStatus === "completed");
      } catch (error) {
        console.error("Error fetching job details:", error);
        toast("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, navigate]);

  // Handle marking today's job as complete
  const handleMarkComplete = async () => {
    if (!job) return;

    const today = format(new Date(), "yyyy-MM-dd");
    const todayData = job.calendarDays.find((day) => day.date === today);

    // If we have an uploaded photo but not saved to the job yet, save it now
    if (
      uploadedPhoto &&
      (!todayData?.photoUrl || todayData.photoUrl !== uploadedPhoto)
    ) {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Update the calendar day with the uploaded photo
        const updatedCalendarDays = job.calendarDays.map((day) => {
          if (day.date === today) {
            return {
              ...day,
              photoUrl: uploadedPhoto,
            };
          }
          return day;
        });

        const updatedJob = {
          ...job,
          calendarDays: updatedCalendarDays,
        };

        setJob(updatedJob);
      } catch (error) {
        console.error("Error saving photo:", error);
        toast("Failed to save photo");
        setLoading(false);
        return;
      }
    }

    // Now proceed with marking as complete
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update the calendar day for today
      const updatedCalendarDays = job.calendarDays.map((day) => {
        if (day.date === today) {
          return {
            ...day,
            status: "completed",
            notes: "Car cleaned as scheduled",
            photoUrl: uploadedPhoto || day.photoUrl,
          };
        }
        return day;
      });

      // Update job with new calendar data
      const updatedJob = {
        ...job,
        calendarDays: updatedCalendarDays,
        completedDays: job.completedDays + 1,
        totalEarnings: (job.payment / 30) * (job.completedDays + 1),
      };

      setJob(updatedJob);
      setTodayCompleted(true);

      // NEW CODE: Save the updated job to localStorage
      // First get all booked jobs
      const storedBookings = localStorage.getItem("wiperBookedJobs");
      const parsedBookings = storedBookings ? JSON.parse(storedBookings) : [];

      // Update the specific job in the array
      const updatedBookings = parsedBookings.map((bookedJob: any) =>
        bookedJob.id === job.id
          ? { ...bookedJob, calendarDays: updatedJob.calendarDays }
          : bookedJob
      );

      // Save back to localStorage
      localStorage.setItem("wiperBookedJobs", JSON.stringify(updatedBookings));

      // Also store completed jobs in a separate key for easier tracking
      const completedJobs = localStorage.getItem("wiperCompletedJobs");
      const parsedCompletedJobs = completedJobs
        ? JSON.parse(completedJobs)
        : {};

      // Update completed jobs with today's date for this job
      parsedCompletedJobs[job.id] = {
        ...(parsedCompletedJobs[job.id] || {}),
        [today]: {
          status: "completed",
          photoUrl: uploadedPhoto || todayData?.photoUrl,
          date: today,
          timestamp: new Date().toISOString(),
        },
      };

      localStorage.setItem(
        "wiperCompletedJobs",
        JSON.stringify(parsedCompletedJobs)
      );

      // Show success message
      toast("Marked today's job as complete!");
      setCurrentStep("summary");
    } catch (error) {
      console.error("Error marking job as complete:", error);
      toast("Failed to update job status");
    } finally {
      setLoading(false);
    }
  };

  // Handle photo upload for a specific day
  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!job) return;

    // Always ensure we're only uploading for today
    const today = format(new Date(), "yyyy-MM-dd");

    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setLoading(true);

      // Simulate API call for uploading
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Create a mock URL for the uploaded photo
      const mockPhotoUrl = URL.createObjectURL(files[0]);

      // Store the photo URL in state
      setUploadedPhoto(mockPhotoUrl);

      // Show success message
      toast("Photo uploaded successfully!");

      // Proceed to completion step
      setCurrentStep("complete");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast("Failed to upload photo");
    } finally {
      setLoading(false);
      // Reset the file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle leave application
  const handleApplyLeave = async () => {
    if (!leaveApplicationDay || !job || !leaveReason.trim()) {
      toast("Please provide a reason for leave");
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update calendar days with leave status
      const updatedCalendarDays = job.calendarDays.map((day) => {
        if (day.date === leaveApplicationDay) {
          return {
            ...day,
            status: "leave",
            notes: leaveReason,
          };
        }
        return day;
      });

      // Update job with new calendar data
      const updatedJob = {
        ...job,
        calendarDays: updatedCalendarDays,
      };

      setJob(updatedJob);

      // Save to localStorage - both the job and separate leave tracking
      const storedBookings = localStorage.getItem("wiperBookedJobs");
      const parsedBookings = storedBookings ? JSON.parse(storedBookings) : [];

      // Update the specific job in the array
      const updatedBookings = parsedBookings.map((bookedJob: any) =>
        bookedJob.id === job.id
          ? { ...bookedJob, calendarDays: updatedJob.calendarDays }
          : bookedJob
      );

      // Save back to localStorage
      localStorage.setItem("wiperBookedJobs", JSON.stringify(updatedBookings));

      // Also store leave days in a separate key
      const leaveRequests = localStorage.getItem("wiperLeaveRequests");
      const parsedLeaveRequests = leaveRequests
        ? JSON.parse(leaveRequests)
        : {};

      // Update leave requests for this job
      if (!parsedLeaveRequests[job.id]) {
        parsedLeaveRequests[job.id] = {};
      }
      
      parsedLeaveRequests[job.id][leaveApplicationDay] = {
        status: "leave",
        reason: leaveReason,
        date: leaveApplicationDay,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(
        "wiperLeaveRequests",
        JSON.stringify(parsedLeaveRequests)
      );

      // Trigger storage event to update other tabs
      window.dispatchEvent(new Event('storage'));

      // Show success message
      toast("Leave application submitted");

      // Reset leave application
      setLeaveReason("");
      setLeaveApplicationDay(null);
      setCurrentStep("summary");
    } catch (error) {
      console.error("Error applying for leave:", error);
      toast("Failed to submit leave application");
    } finally {
      setLoading(false);
    }
  };

  // Handle the selection of a day on the calendar
  const handleDaySelect = (day: CalendarDay) => {
    setSelectedDay(day);
  };

  // Generate the calendar view for the selected month
  const renderCalendar = () => {
    if (!job) return null;

    const daysInMonth = getDaysInMonth(selectedMonth);
    const firstDayOfMonth = startOfMonth(selectedMonth);
    const startingDayIndex = getDay(firstDayOfMonth); // 0 for Sunday, 1 for Monday, etc.

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Create array of days for the calendar
    const calendarDays = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayIndex; i++) {
      calendarDays.push(
        <div
          key={`empty-${i}`}
          className="h-10 border border-transparent"
        ></div>
      );
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth(),
        i
      );
      const dayDateStr = format(dayDate, "yyyy-MM-dd");

      // Find the calendar day data for this date
      const calendarDay = job.calendarDays.find(
        (day) => day.date === dayDateStr
      );

      // Determine the CSS class based on the status
      let statusClass = "";
      let statusIcon = null;

      if (calendarDay) {
        switch (calendarDay.status) {
          case "completed":
            statusClass =
              "bg-green-100 border-green-200 text-green-800 hover:bg-green-200";
            statusIcon = (
              <CheckCircle className="w-3 h-3 absolute top-1 right-1 text-green-600" />
            );
            break;
          case "leave":
            statusClass =
              "bg-orange-100 border-orange-200 text-orange-800 hover:bg-orange-200";
            statusIcon = (
              <CalendarOff className="w-3 h-3 absolute top-1 right-1 text-orange-600" />
            );
            break;
          case "pending":
            statusClass =
              "bg-yellow-100 border-yellow-200 text-yellow-800 hover:bg-yellow-200";
            statusIcon = (
              <Clock className="w-3 h-3 absolute top-1 right-1 text-yellow-600" />
            );
            break;
          case "upcoming":
            statusClass =
              "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100";
            break;
          default:
            statusClass = "bg-white border-gray-200 text-gray-400";
        }
      }

      const isSelected = selectedDay && selectedDay.date === dayDateStr;
      const selectionClass = isSelected
        ? "ring-2 ring-[#c5e82e] ring-offset-1"
        : "";

      calendarDays.push(
        <div
          key={`day-${i}`}
          className={`h-10 border rounded-md flex items-center justify-center text-xs font-medium relative cursor-pointer ${statusClass} ${selectionClass}`}
          onClick={() => calendarDay && handleDaySelect(calendarDay)}
        >
          {i}
          {statusIcon}
        </div>
      );
    }

    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setSelectedMonth(
                new Date(
                  selectedMonth.getFullYear(),
                  selectedMonth.getMonth() - 1
                )
              )
            }
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-base font-medium">
            {format(selectedMonth, "MMMM yyyy")}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setSelectedMonth(
                new Date(
                  selectedMonth.getFullYear(),
                  selectedMonth.getMonth() + 1
                )
              )
            }
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">{calendarDays}</div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-sm mr-1"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded-sm mr-1"></div>
            <span>Leave</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded-sm mr-1"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded-sm mr-1"></div>
            <span>Upcoming</span>
          </div>
        </div>
      </div>
    );
  };

  // Render selected day details
  const renderSelectedDayDetails = () => {
    if (!selectedDay) return null;

    return (
      <div className="mt-5 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm sm:text-base font-medium mb-3">
          {format(parseISO(selectedDay.date), "EEEE, MMMM d, yyyy")}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <Badge
            className={`px-2.5 py-1 ${
              selectedDay.status === "completed"
                ? "bg-green-100 text-green-800"
                : selectedDay.status === "leave"
                ? "bg-orange-100 text-orange-800"
                : selectedDay.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {selectedDay.status.charAt(0).toUpperCase() +
              selectedDay.status.slice(1)}
          </Badge>
        </div>

        {selectedDay.notes && (
          <div className="mb-4 bg-white p-3 rounded-md border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">Notes:</p>
            <p className="text-sm">{selectedDay.notes}</p>
          </div>
        )}

        {selectedDay.photoUrl && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Photo:</p>
            <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={selectedDay.photoUrl}
                alt="Cleaned car"
                className="w-full h-40 sm:h-48 object-cover"
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {isSameDay(parseISO(selectedDay.date), new Date()) &&
            selectedDay.status === "pending" && (
              <Button
                className="bg-[#c5e82e] hover:bg-[#b3d429] text-black shadow-sm w-full"
                onClick={() => setCurrentStep("upload")}
              >
                <Camera className="w-4 h-4 mr-1.5" />
                Upload Photo & Complete
              </Button>
            )}

          {parseISO(selectedDay.date) > new Date() &&
            selectedDay.status !== "completed" &&
            selectedDay.status !== "leave" && (
              <Button
                variant="outline"
                className="text-xs w-full flex items-center justify-center"
                onClick={() => {
                  setLeaveApplicationDay(selectedDay.date);
                  setCurrentStep("leave");
                }}
              >
                <CalendarOff className="w-3.5 h-3.5 mr-1.5" />
                Apply Leave
              </Button>
            )}
        </div>
      </div>
    );
  };

  // Render content based on current step
  const renderStepContent = () => {
    if (!job) return null;

    switch (currentStep) {
      case "summary":
        return (
          <div className="flex flex-col gap-6">
            {/* Job summary card */}
            <Card className="bg-white shadow-sm border-none overflow-hidden rounded-xl">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-5">
                  {/* Car and Plan Details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className="bg-[#c5e82e] text-black px-2.5 py-1.5 text-xs font-medium rounded-md">
                        {job.planName}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-gray-200 text-gray-600 px-2 py-1 text-xs rounded-md"
                      >
                        {job.planFrequency}
                      </Badge>
                    </div>

                    <h2 className="text-xl font-bold mb-3">
                      {job.carDetails.make} {job.carDetails.model}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge
                        variant="outline"
                        className="border-gray-200 bg-gray-50 text-gray-600 rounded-md"
                      >
                        {job.carDetails.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-gray-200 bg-gray-50 text-gray-600 font-mono rounded-md"
                      >
                        {job.carDetails.regNumber}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-gray-200 bg-gray-50 text-gray-600 rounded-md"
                      >
                        {job.carDetails.color}
                      </Badge>
                    </div>

                    <div className="flex items-start">
                      <User className="w-4 h-4 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {job.customerName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {job.customerContact}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress and Earnings */}
                  <div className="bg-gray-50 p-4 rounded-xl md:w-72 mt-3 md:mt-0">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-700">
                        Service Progress
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {job.completedDays} of {job.serviceDuration} days
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2.5 bg-gray-200 rounded-full mb-3 overflow-hidden">
                      <div
                        className="h-full bg-[#c5e82e] rounded-full"
                        style={{
                          width: `${
                            (job.completedDays / job.serviceDuration) * 100
                          }%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div className="text-xs text-gray-500">
                        Start: {format(parseISO(job.date), "MMM d")}
                      </div>
                      <div className="text-xs text-gray-500">
                        End:{" "}
                        {format(
                          addDays(parseISO(job.date), job.serviceDuration - 1),
                          "MMM d"
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm text-gray-700">
                          Daily Rate:
                        </span>
                        <span className="text-sm font-medium">
                          ₹{(job.payment / job.serviceDuration).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm text-gray-700">
                          Total Earnings:
                        </span>
                        <span className="text-sm font-medium">
                          ₹{job.totalEarnings.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">
                          Total Contract:
                        </span>
                        <span className="text-sm font-bold">
                          ₹{job.payment}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's status */}
            {isSameDay(new Date(), parseISO(job.date)) ||
            new Date() > parseISO(job.date) ? (
              <Card
                className={`${
                  todayCompleted
                    ? "bg-green-50 border-green-100"
                    : "bg-yellow-50 border-yellow-100"
                } shadow-sm rounded-xl overflow-hidden`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium mb-2">
                        {todayCompleted ? (
                          <span className="text-green-800">
                            Today's cleaning completed
                          </span>
                        ) : (
                          <span className="text-yellow-800">
                            Today's cleaning pending
                          </span>
                        )}
                      </h3>

                      {!todayCompleted && (
                        <>
                          <div className="flex items-start mb-3 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                            <Info className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-xs text-amber-800">
                              Complete today's job in 2 simple steps: 1. Upload
                              a photo of the cleaned car <br />
                              2. Mark the job as complete
                            </p>
                          </div>

                          <Button
                            className="bg-[#c5e82e] hover:bg-[#b3d429] text-black shadow-sm text-xs py-2 w-full mt-3"
                            onClick={() => setCurrentStep("upload")}
                          >
                            <Camera className="w-3.5 h-3.5 mr-1.5" />
                            Start Completion Process
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Calendar */}
            <Card className="border-none shadow-sm rounded-xl">
              <CardHeader className="p-4 sm:p-5 border-b border-gray-100">
                <CardTitle className="text-lg flex items-center">
                  <CalendarIconFill className="w-5 h-5 mr-2 text-[#a8c625]" />
                  Service Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5">
                {renderCalendar()}
                {renderSelectedDayDetails()}
              </CardContent>
            </Card>
          </div>
        );

      case "upload":
        const today = format(new Date(), "yyyy-MM-dd");
        const todayData = job.calendarDays.find((day) => day.date === today);

        return (
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#f5f9e6] to-[#edf8c8] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-[#a8c625]" />
                  <CardTitle className="text-lg">
                    Step 1: Upload Photo
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => setCurrentStep("summary")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="mb-4">
                <Badge
                  variant="outline"
                  className="mb-4 px-3 py-1.5 border-[#c5e82e] bg-[#f5f9e6] text-black"
                >
                  For: {format(new Date(), "EEEE, MMMM d, yyyy")} (Today)
                </Badge>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center mb-5 bg-gray-50">
                <div className="max-w-xs mx-auto">
                  {uploadedPhoto || todayData?.photoUrl ? (
                    <div className="mb-4">
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 mb-3 shadow-sm">
                        <img
                          src={uploadedPhoto || todayData?.photoUrl}
                          alt="Cleaned car"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                      <p className="text-sm text-green-600 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Photo uploaded successfully
                      </p>
                    </div>
                  ) : (
                    <>
                      <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-base font-medium text-gray-700 mb-2">
                        Upload Car Photo
                      </h3>
                      <p className="text-sm text-gray-500 mb-5">
                        Take a clear photo of the car after cleaning
                      </p>
                      <div className="w-full h-36 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center mb-3">
                        <Camera className="w-8 h-8 text-gray-300" />
                      </div>
                    </>
                  )}

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={loading}
                    capture="environment"
                  />

                  {/* Button to trigger file selection */}
                  <Button
                    type="button"
                    className="w-full bg-[#c5e82e] hover:bg-[#b3d429] text-black shadow-sm"
                    disabled={loading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                        Uploading...
                      </>
                    ) : uploadedPhoto || todayData?.photoUrl ? (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Replace Photo
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 bg-gray-50 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("summary")}
              >
                Back
              </Button>
              <Button
                className="bg-[#c5e82e] hover:bg-[#b3d429] text-black shadow-sm"
                onClick={() => setCurrentStep("complete")}
                disabled={!uploadedPhoto && !todayData?.photoUrl}
              >
                Continue to Next Step
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        );

      case "complete":
        return (
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#f5f9e6] to-[#edf8c8] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-[#a8c625]" />
                  <CardTitle className="text-lg">
                    Step 2: Complete Job
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => setCurrentStep("summary")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="mb-5">
                <Badge
                  variant="outline"
                  className="mb-4 px-3 py-1.5 border-[#c5e82e] bg-[#f5f9e6] text-black"
                >
                  For: {format(new Date(), "EEEE, MMMM d, yyyy")} (Today)
                </Badge>

                <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-5">
                  <h3 className="text-green-800 font-medium flex items-center mb-2">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Photo uploaded successfully
                  </h3>
                  <p className="text-sm text-green-700">
                    You can now mark this job as complete to receive your
                    payment.
                  </p>
                </div>

                {uploadedPhoto && (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 mb-5 shadow-sm">
                    <img
                      src={uploadedPhoto}
                      alt="Cleaned car"
                      className="w-full object-cover"
                    />
                  </div>
                )}

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-5">
                  <h3 className="text-amber-800 font-medium flex items-center mb-2">
                    <Info className="w-4 h-4 mr-2 text-amber-600" />
                    Important
                  </h3>
                  <p className="text-sm text-amber-700">
                    By marking this job as complete, you confirm that you've
                    thoroughly cleaned the vehicle according to the service
                    requirements.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 bg-gray-50 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("upload")}
              >
                Back
              </Button>
              <Button
                className="bg-[#c5e82e] hover:bg-[#b3d429] text-black shadow-sm flex items-center"
                onClick={handleMarkComplete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Mark Job as Complete
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );

      case "leave":
        return (
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-gray-100">
              <div className="flex items-center">
                <CalendarOff className="w-5 h-5 mr-2 text-[#a8c625]" />
                <CardTitle className="text-lg">Apply for Leave</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setCurrentStep("summary")}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-5">
              {leaveApplicationDay && (
                <Badge
                  variant="outline"
                  className="mb-4 px-3 py-1.5 border-orange-200 bg-orange-50 text-orange-800"
                >
                  For:{" "}
                  {format(parseISO(leaveApplicationDay), "EEEE, MMMM d, yyyy")}
                </Badge>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Leave
                </label>
                <textarea
                  placeholder="Please explain why you need to take leave on this day..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full min-h-[120px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5e82e] focus:ring-offset-2 placeholder:text-gray-500"
                />
              </div>

              <div className="flex items-start mb-5 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-amber-600">
                  Note: Taking too many leaves may affect your earnings and
                  performance rating.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 bg-gray-50 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setLeaveApplicationDay(null);
                  setLeaveReason("");
                  setCurrentStep("summary");
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#c5e82e] hover:bg-[#b3d429] text-black shadow-sm"
                onClick={handleApplyLeave}
                disabled={loading || !leaveReason.trim()}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  "Submit Leave Application"
                )}
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            {currentStep !== "summary" && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 h-8 w-8 p-0"
                onClick={() => setCurrentStep("summary")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-xl font-bold">
              {currentStep === "summary"
                ? "Job Details"
                : currentStep === "upload"
                ? "Upload Photo"
                : currentStep === "complete"
                ? "Complete Job"
                : "Apply Leave"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[#c5e82e] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-7xl flex flex-col item-center justify-center mx-auto w-full px-4 py-5 ">
        <AnimatePresence mode="wait">
          {loading && !job ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 border-2 border-[#c5e82e] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-600">Loading job details...</p>
            </div>
          ) : job ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={currentStep}
            >
              {renderStepContent()}
            </motion.div>
          ) : (
            <div className="text-center py-10">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Job Not Found</h2>
              <p className="text-gray-600 mb-6">
                The job you're looking for doesn't exist or has been removed.
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-[#c5e82e] hover:bg-[#b3d429] text-black"
              >
                Back to Dashboard
              </Button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button for today's actions (when on summary screen) */}
      {currentStep === "summary" && !todayCompleted && job && (
        <div className="fixed bottom-20 right-4 z-20">
          <Button
            className="h-14 w-14 rounded-full bg-[#c5e82e] hover:bg-[#b3d429] text-black shadow-lg"
            onClick={() => setCurrentStep("upload")}
          >
            <Camera className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* WiperNavigation component */}
      <WiperNavigation />
    </div>
  );
};

export default JobDetails;
