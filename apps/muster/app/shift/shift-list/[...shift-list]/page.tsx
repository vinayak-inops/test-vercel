"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ShiftHeader from "./_component/shift-header";
import ShiftZoneForm from "../../_components/shift-zone-form";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";
import ShiftList from "./_component/shift-list";
import ShiftListBoxFilter from "./_component/shift-list-boxfilter";
import ShiftForm from "./_component/shift-form";
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest";
import { toast } from "react-toastify";
import LoadingOverlay from "../../_components/LoadingOverlay";
import ShiftViewModal from "./_component/ShiftViewModal";


export default function Home() {
    const params = useParams();
    const router = useRouter();
    const [showSuccess, setShowSuccess] = useState(false);
    const [isShiftFormOpen, setIsShiftFormOpen] = useState(false);
    const [editShift, setEditShift] = useState<any>(null);
    const [deleteShift, setDeleteShift] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [viewShift, setViewShift] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    // If the route is [...shift-list], params[0] will be the id
    const shiftId = params["shift-list"][0];

    const {
        post: postShiftZone,
        loading: postLoading,
        error: postError,
        data: postData,
      } = usePostRequest<any>({
        url: "shift",
        onSuccess: async (data) => {
          if (fetchAttendance) {
            await fetchAttendance();
          }
          toast.success("✅ Shift updated successfully!", {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        },
        onError: (error) => {
          toast.error("❌ Failed to update shift. Please try again.", {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          console.error("POST error:", error);
        },
      });

    const {
        data: attendanceResponse,
        loading: isLoading,
        error: attendanceError,
        refetch: fetchAttendance
    } = useRequest<any>({
        url: 'shift/search',
        method: 'POST',
        data: [
            {
                field: "tenantCode",
                operator: "eq",
                value: "Midhani"
            },
            {
                field: "_id",
                operator: "eq",
                value: shiftId
            },
        ],
        dependencies: []
    });

    useEffect(() => {
        fetchAttendance();
    }, []);


    // Find the shift by id
    const shiftData = useMemo(() => {
        if (!attendanceResponse || !Array.isArray(attendanceResponse)) return null;
        return attendanceResponse.find((item: any) => (item._id?.$oid || item._id) === shiftId);
    }, [attendanceResponse, shiftId]);

    // Filter shifts by search term (shiftName)
    const filteredShifts = useMemo(() => {
        if (!shiftData?.shift) return [];
        if (!searchTerm) return shiftData.shift;
        return shiftData.shift.filter(
            (s: any) =>
                s.shiftName &&
                s.shiftName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [shiftData, searchTerm]);


    const existingShiftGroupCodes = attendanceResponse ? attendanceResponse.map((item: any) => item.shiftGroupCode?.toLowerCase()).filter(Boolean) : [];
    const existingShiftGroupNames = attendanceResponse ? attendanceResponse.map((item: any) => item.shiftGroupName?.toLowerCase()).filter(Boolean) : [];

    return (
        <><div className="px-6 py-6 h-full bg-gray-50">
            {/* Loading overlay for post request */}
            {postLoading && (
                <LoadingOverlay message="Updating shift, please wait..." />
            )}
            <div className="px-6 relative z-50">
                <ShiftHeader
                    shiftData={shiftData}
                    existingShiftGroupCodes={existingShiftGroupCodes}
                    existingShiftGroupNames={existingShiftGroupNames}
                    refetchShiftData={fetchAttendance}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filteredShifts={filteredShifts}
                />
                {isLoading && <div className="mt-4 text-lg">Loading...</div>}
                {attendanceError && <div className="mt-4 text-lg text-red-500">Error loading shift data</div>}

                {!isLoading && !attendanceError && !shiftData && (
                    <div className="mt-4 text-lg text-gray-500">Shift not found</div>
                )}
            </div>
            
            <ShiftList
                shiftData={{...shiftData, shift: filteredShifts}}
                onEditShift={(shift) => {
                    setEditShift(shift);
                    setIsShiftFormOpen(true);
                }}
                onDeleteShift={(shift) => {
                    setDeleteShift(shift);
                    setIsDeleteModalOpen(true);
                }}
                onViewShift={(shift) => {
                    setViewShift(shift);
                    setIsViewModalOpen(true);
                }}
            />
            <ShiftForm
                isOpen={isShiftFormOpen}
                onClose={() => setIsShiftFormOpen(false)}
                initialValues={editShift || {}}
                onSubmit={(data) => {
                    // Update the correct shift in shiftData.shift based on shiftCode
                    const newShiftData = {
                        ...shiftData,
                        shift: Array.isArray(shiftData?.shift)
                            ? shiftData.shift.map((s: any) =>
                                s.shiftCode === data.shiftCode ? { ...s, ...data } : s
                              )
                            : [],
                    };

                    const formattedData = {
                        tenant: "Midhani",
                        action: "insert",
                        id: newShiftData._id,
                        collectionName: "shift",
                        data: newShiftData
                      }
                      console.log("formattedData", formattedData);
                      postShiftZone(formattedData);
                    // You can now send newShiftData to your API or update state as needed
                }}
                shiftData={shiftData}
            />
            {/* Delete confirmation modal */}
            {isDeleteModalOpen && deleteShift && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center">
                        <div className="mb-4 text-xl font-semibold text-gray-800">Confirm Delete</div>
                        <div className="mb-6 text-gray-600">Are you sure you want to delete shift <span className="font-bold">{deleteShift.shiftName}</span>?</div>
                        <div className="flex gap-4">
                            <button
                                className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-6 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
                                onClick={() => {
                                    // Remove the shift and update
                                    const newShiftData = {
                                        ...shiftData,
                                        shift: Array.isArray(shiftData?.shift)
                                            ? shiftData.shift.filter((s: any) => s.shiftCode !== deleteShift.shiftCode)
                                            : [],
                                    };
                                    const formattedData = {
                                        tenant: "Midhani",
                                        action: "insert",
                                        id: newShiftData._id,
                                        collectionName: "shift",
                                        data: newShiftData
                                    };
                                    postShiftZone(formattedData);
                                    setIsDeleteModalOpen(false);
                                    setDeleteShift(null);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ShiftViewModal
                shift={viewShift}
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
            />
        </div>
        </>
    );
}
