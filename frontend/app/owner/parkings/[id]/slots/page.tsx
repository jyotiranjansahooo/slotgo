"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  type ElementType,
} from "react";
import { useParams, useRouter } from "next/navigation";
import type { Parking } from "@/types/parking";
import {
  ArrowLeft,
  Bike,
  Car,
  CheckCircle2,
  CircleParking,
  Loader2,
  Plus,
  Trash2,
  Truck,
  Warehouse,
} from "lucide-react";
import OwnerNavbar from "@/components/owner/OwnerNavbar";
import { toast } from "react-hot-toast";

import {
  createParkingSlot,
  deleteParkingSlot,
  getParkingSlots,
} from "@/services/parkingSlot.service";
import { getParking } from "@/services/parking.service";
import type { ParkingSlot } from "@/types/parkingSlot";

import { getApiErrorMessage } from "@/lib/api-error";

const VEHICLE_TYPES = [
  {
    value: "twoWheeler",
    label: "Two Wheeler",
    icon: Bike,
  },
  {
    value: "fourWheeler",
    label: "Four Wheeler",
    icon: Car,
  },
  {
    value: "vanMinibus",
    label: "Van / Minibus",
    icon: Truck,
  },
  {
    value: "heavyVehicle",
    label: "Heavy Vehicle",
    icon: Truck,
  },
] as const;

export default function ParkingSlotsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const parkingId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [parking, setParking] = useState<Parking | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);

  const [slotNumber, setSlotNumber] = useState("");
  const [floor, setFloor] = useState("Ground");
  type VehicleType =
    | "twoWheeler"
    | "fourWheeler"
    | "vanMinibus"
    | "heavyVehicle";

  const [supportedVehicleTypes, setSupportedVehicleTypes] = useState<
    VehicleType[]
  >([]);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!parkingId) return;

    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);

        const [parkingData, slotsData] = await Promise.all([
          getParking(parkingId),
          getParkingSlots(parkingId),
        ]);

        if (cancelled) return;

        setParking(parkingData);
        setSlots(slotsData);
      } catch (err) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [parkingId]);
  const allowedVehicleTypes = parking?.supportedVehicleTypes ?? [];
  const statistics = useMemo(() => {
    return {
      total: slots.length,
      available: slots.filter((slot) => slot.status === "available").length,
      occupied: slots.filter((slot) => slot.status === "occupied").length,
      reserved: slots.filter((slot) => slot.status === "reserved").length,
    };
  }, [slots]);

  function toggleVehicleType(value: VehicleType) {
    setSupportedVehicleTypes((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }

      return [...current, value];
    });
  }

  async function handleCreateSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!parkingId) {
      toast.error("Invalid parking ID.");
      return;
    }

    if (!slotNumber.trim()) {
      toast.error("Slot number is required.");
      return;
    }

    if (supportedVehicleTypes.length === 0) {
      toast.error("Select at least one vehicle type.");
      return;
    }

    try {
      setCreating(true);

      const newSlot = await createParkingSlot(parkingId, {
        slotNumber: slotNumber.trim().toUpperCase(),

        floor: floor.trim() || "Ground",

        supportedVehicleTypes,

        displayOrder,

        notes: notes.trim() || undefined,
      });

      setSlots((current) => {
        const updated = [...current, newSlot];

        return updated.sort((a, b) => {
          return a.displayOrder - b.displayOrder;
        });
      });

      setSlotNumber("");
      setFloor("Ground");
      setSupportedVehicleTypes([]);
      setDisplayOrder((current) => current + 1);
      setNotes("");

      toast.success(`Slot ${newSlot.slotNumber} created successfully.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteSlot(slotId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this parking slot?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingSlotId(slotId);

      await deleteParkingSlot(parkingId, slotId);
      setSlots((current) => current.filter((slot) => slot._id !== slotId));

      toast.success("Parking slot deleted successfully.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeletingSlotId(null);
    }
  }

  return (
    <div className="">
      <OwnerNavbar />
      <main
        className="
        min-h-screen
        bg-[#075e59]
        px-4 py-6
        text-white
        md:px-6 md:py-8
        lg:px-8
      "
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 2px, transparent 2px, transparent 28px)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <header className="mb-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="
                  flex h-13 w-13 shrink-0 items-center justify-center
                  rounded-2xl
                  border border-white/15
                  bg-white/10
                  shadow-lg
                  backdrop-blur-xl
                "
                >
                  <CircleParking className="h-7 w-7 text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Manage Parking Slots
                  </h1>

                  <p className="mt-1 text-sm text-white/60">
                    Create and manage individual parking spaces.
                  </p>
                </div>
              </div>

              <a
                href="#add-slot"
                className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-white
                px-5
                py-3
                text-sm
                font-bold
                text-[#075e59]
                shadow-lg
                transition
                hover:bg-white/90
                sm:w-auto
              "
              >
                <Plus className="h-4 w-4" />
                Add Slot
              </a>
            </div>
          </header>

          {/* ======================================================
            STATISTICS
        ====================================================== */}

          <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Total Slots"
              value={statistics.total}
              icon={CircleParking}
            />

            <StatCard
              label="Available"
              value={statistics.available}
              icon={CheckCircle2}
            />

            <StatCard label="Occupied" value={statistics.occupied} icon={Car} />

            <StatCard
              label="Reserved"
              value={statistics.reserved}
              icon={Warehouse}
            />
          </div>

          {/* ======================================================
            ADD SLOT
        ====================================================== */}

          <section
            id="add-slot"
            className="
            mb-8
            overflow-hidden
            rounded-2xl
            border border-white/15
            bg-white/[0.08]
            shadow-xl
            backdrop-blur-xl
          "
          >
            {/* Form header */}

            <div
              className="
              border-b border-white/10
              bg-black/20
              px-5 py-4
              sm:px-6
            "
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <Plus className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold">Add Parking Slot</h2>

                  <p className="text-xs text-white/55">
                    Create a new parking space.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateSlot} className="p-5 sm:p-6">
              <div className="grid gap-5 lg:grid-cols-12">
                {/* Slot Number */}

                <div className="lg:col-span-3">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/60">
                    Slot Number
                  </label>

                  <input
                    type="text"
                    value={slotNumber}
                    onChange={(event) => setSlotNumber(event.target.value)}
                    placeholder="A-01"
                    maxLength={20}
                    className="
                    h-11
                    w-full
                    rounded-xl
                    border border-white/10
                    bg-black/15
                    px-4
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-white/30
                    transition
                    focus:border-white/30
                    focus:bg-black/20
                    focus:ring-2
                    focus:ring-white/10
                  "
                  />
                </div>

                {/* Floor */}

                <div className="lg:col-span-3">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/60">
                    Floor
                  </label>

                  <input
                    type="text"
                    value={floor}
                    onChange={(event) => setFloor(event.target.value)}
                    placeholder="Ground"
                    maxLength={30}
                    className="
                    h-11
                    w-full
                    rounded-xl
                    border border-white/10
                    bg-black/15
                    px-4
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-white/30
                    transition
                    focus:border-white/30
                    focus:bg-black/20
                    focus:ring-2
                    focus:ring-white/10
                  "
                  />
                </div>

                {/* Display Order */}

                <div className="lg:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/60">
                    Order
                  </label>

                  <input
                    type="number"
                    min={0}
                    value={displayOrder}
                    onChange={(event) =>
                      setDisplayOrder(Number(event.target.value))
                    }
                    className="
                    h-11
                    w-full
                    rounded-xl
                    border border-white/10
                    bg-black/15
                    px-4
                    text-sm
                    text-white
                    outline-none
                    transition
                    focus:border-white/30
                    focus:bg-black/20
                    focus:ring-2
                    focus:ring-white/10
                  "
                  />
                </div>

                {/* Notes */}

                <div className="lg:col-span-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/60">
                    Notes
                  </label>

                  <input
                    type="text"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Optional notes..."
                    maxLength={200}
                    className="
                    h-11
                    w-full
                    rounded-xl
                    border border-white/10
                    bg-black/15
                    px-4
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-white/30
                    transition
                    focus:border-white/30
                    focus:bg-black/20
                    focus:ring-2
                    focus:ring-white/10
                  "
                  />
                </div>

                {/* Vehicle Types */}

                <div className="lg:col-span-9">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/60">
                    Supported Vehicles
                  </label>

                  {!parking ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-11 animate-pulse rounded-xl border border-white/10 bg-white/5"
                        />
                      ))}
                    </div>
                  ) : allowedVehicleTypes.length === 0 ? (
                    <div className="rounded-xl border border-amber-300/20 bg-amber-400/10 px-4 py-3">
                      <p className="text-sm font-medium text-amber-100">
                        No vehicle types configured
                      </p>

                      <p className="mt-1 text-xs text-amber-100/60">
                        Edit this parking and select at least one supported
                        vehicle type.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/owner/parkings/${parkingId}/edit`)
                        }
                        className="mt-3 inline-flex items-center rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#075e59] transition hover:bg-white/90"
                      >
                        Edit Parking
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {VEHICLE_TYPES.filter((vehicle) =>
                        allowedVehicleTypes.includes(vehicle.value),
                      ).map((vehicle) => {
                        const Icon = vehicle.icon;

                        const selected = supportedVehicleTypes.includes(
                          vehicle.value,
                        );

                        return (
                          <button
                            key={vehicle.value}
                            type="button"
                            onClick={() => toggleVehicleType(vehicle.value)}
                            className={`
              flex
              h-11
              items-center
              gap-2
              rounded-xl
              border
              px-3
              text-left
              text-sm
              font-medium
              transition
              ${
                selected
                  ? "border-white bg-white text-[#075e59] shadow-md"
                  : "border-white/10 bg-black/10 text-white/75 hover:border-white/25 hover:bg-white/10"
              }
            `}
                          >
                            <Icon className="h-4 w-4 shrink-0" />

                            <span className="truncate">{vehicle.label}</span>

                            {selected && (
                              <CheckCircle2 className="ml-auto h-4 w-4 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Submit */}

                <div className="lg:col-span-3 lg:self-end">
                  <button
                    type="submit"
                    disabled={creating}
                    className="
                    flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-white
                    px-5
                    text-sm
                    font-bold
                    text-[#075e59]
                    shadow-md
                    transition
                    hover:bg-white/90
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Create Slot
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </section>

          {/* ======================================================
            SLOTS
        ====================================================== */}

          <section>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold">Your Slots</h2>

                <p className="mt-1 text-sm text-white/55">
                  {slots.length === 0
                    ? "No slots created yet."
                    : `${slots.length} parking ${
                        slots.length === 1 ? "slot" : "slots"
                      } configured.`}
                </p>
              </div>

              {slots.length > 0 && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                  {slots.length} total
                </span>
              )}
            </div>

            {/* Loading */}

            {loading ? (
              <SlotsSkeleton />
            ) : slots.length === 0 ? (
              <EmptySlots />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {slots.map((slot) => (
                  <SlotCard
                    key={slot._id}
                    slot={slot}
                    deleting={deletingSlotId === slot._id}
                    onDelete={() => handleDeleteSlot(slot._id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ElementType;
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-white/10
        bg-white/[0.08]
        p-4
        shadow-lg
        backdrop-blur-xl
        sm:p-5
      "
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <Icon className="h-4 w-4 text-white/80" />
        </div>

        <span className="text-xs font-medium text-white/40">Slots</span>
      </div>

      <p className="text-xs font-medium text-white/55">{label}</p>

      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

/* ============================================================
   SLOT CARD
============================================================ */

function SlotCard({
  slot,
  deleting,
  onDelete,
}: {
  slot: ParkingSlot;
  deleting: boolean;
  onDelete: () => void;
}) {
  const statusConfig = {
    available: {
      label: "Available",
      className: "border-emerald-300/20 bg-emerald-400/10 text-emerald-200",
    },

    occupied: {
      label: "Occupied",
      className: "border-red-300/20 bg-red-400/10 text-red-200",
    },

    reserved: {
      label: "Reserved",
      className: "border-amber-300/20 bg-amber-400/10 text-amber-200",
    },

    maintenance: {
      label: "Maintenance",
      className: "border-orange-300/20 bg-orange-400/10 text-orange-200",
    },
  };

  const status =
    statusConfig[slot.status as keyof typeof statusConfig] ??
    statusConfig.available;

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        border border-white/10
        bg-white/[0.08]
        shadow-lg
        backdrop-blur-xl
        transition
        hover:-translate-y-0.5
        hover:border-white/20
        hover:bg-white/[0.11]
      "
    >
      {/* Top */}

      <div className="border-b border-white/10 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <CircleParking className="h-5 w-5 text-white/80" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold">{slot.slotNumber}</h3>

              <p className="text-xs text-white/50">{slot.floor}</p>
            </div>
          </div>

          <span
            className={`
              shrink-0
              rounded-full
              border
              px-2.5
              py-1
              text-[11px]
              font-semibold
              ${status.className}
            `}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Content */}

      <div className="p-5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
          Supported Vehicles
        </p>

        <div className="flex flex-wrap gap-1.5">
          {slot.supportedVehicleTypes.map((type) => (
            <span
              key={type}
              className="
                rounded-lg
                border border-white/10
                bg-black/10
                px-2.5
                py-1.5
                text-[11px]
                font-medium
                text-white/70
              "
            >
              {formatVehicleType(type)}
            </span>
          ))}
        </div>

        {slot.notes && (
          <div className="mt-4 rounded-xl bg-black/10 px-3 py-2.5">
            <p className="text-xs leading-relaxed text-white/55">
              {slot.notes}
            </p>
          </div>
        )}

        {/* Delete */}

        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="
            mt-5
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border border-red-300/15
            bg-red-400/5
            px-4
            py-2.5
            text-xs
            font-semibold
            text-red-200
            transition
            hover:bg-red-400/10
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {deleting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete Slot
            </>
          )}
        </button>
      </div>
    </article>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptySlots() {
  return (
    <div
      className="
        rounded-2xl
        border
        border-dashed
        border-white/15
        bg-white/[0.05]
        px-6
        py-14
        text-center
        backdrop-blur-xl
      "
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
        <CircleParking className="h-7 w-7 text-white/50" />
      </div>

      <h3 className="mt-4 text-base font-bold">No parking slots yet</h3>

      <p className="mx-auto mt-1 max-w-md text-sm text-white/50">
        Add your first parking slot above to start managing availability.
      </p>
    </div>
  );
}

/* ============================================================
   SKELETON
============================================================ */

function SlotsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="
            animate-pulse
            overflow-hidden
            rounded-2xl
            border border-white/10
            bg-white/[0.07]
          "
        >
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10" />

              <div className="flex-1">
                <div className="h-4 w-20 rounded bg-white/10" />

                <div className="mt-2 h-3 w-14 rounded bg-white/10" />
              </div>

              <div className="h-6 w-20 rounded-full bg-white/10" />
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="h-3 w-28 rounded bg-white/10" />

            <div className="flex gap-2">
              <div className="h-7 w-16 rounded-lg bg-white/10" />
              <div className="h-7 w-16 rounded-lg bg-white/10" />
            </div>

            <div className="h-10 rounded-xl bg-white/10" />

            <div className="h-10 rounded-xl bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatVehicleType(value: string) {
  const labels: Record<string, string> = {
    twoWheeler: "Two Wheeler",
    fourWheeler: "Four Wheeler",
    vanMinibus: "Van / Minibus",
    heavyVehicle: "Heavy Vehicle",
  };

  return labels[value] ?? value;
}
