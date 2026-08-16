"use client";

import { useEffect } from "react";

import { useForm, type SubmitHandler } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { VEHICLE_TYPES, type Vehicle } from "@/types/vehicle";

const vehicleFormSchema = z.object({
  vehicleType: z.enum([
    VEHICLE_TYPES.TWO_WHEELER,
    VEHICLE_TYPES.FOUR_WHEELER,
    VEHICLE_TYPES.VAN_MINIBUS,
    VEHICLE_TYPES.HEAVY_VEHICLE,
  ]),

  registrationNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/,
      "Invalid registration number",
    ),

  brand: z
    .string()
    .trim()
    .min(2, "Brand is required")
    .max(40, "Brand cannot exceed 40 characters"),

  vehicleModel: z
    .string()
    .trim()
    .min(1, "Vehicle model is required")
    .max(40, "Vehicle model cannot exceed 40 characters"),

  color: z
    .string()
    .trim()
    .min(2, "Color is required")
    .max(20, "Color cannot exceed 20 characters"),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  vehicle?: Vehicle;
  isSubmitting: boolean;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  onCancel?: () => void;
}

export default function VehicleForm({
  vehicle,
  isSubmitting,
  onSubmit,
  onCancel,
}: VehicleFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),

    defaultValues: {
      vehicleType: VEHICLE_TYPES.FOUR_WHEELER,

      registrationNumber: "",

      brand: "",

      vehicleModel: "",

      color: "",
    },
  });

  useEffect(() => {
    if (!vehicle) {
      return;
    }

    reset({
      vehicleType: vehicle.vehicleType,

      registrationNumber: vehicle.registrationNumber,

      brand: vehicle.brand,

      vehicleModel: vehicle.vehicleModel,

      color: vehicle.color,
    });
  }, [vehicle, reset]);

  const submitHandler: SubmitHandler<VehicleFormData> = async (data) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      {/* VEHICLE TYPE */}

      <div>
        <label htmlFor="vehicleType" className="mb-2 block text-sm font-medium">
          Vehicle type
        </label>

        <select
          id="vehicleType"
          {...register("vehicleType")}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-white"
        >
          <option value={VEHICLE_TYPES.TWO_WHEELER}>Two Wheeler</option>

          <option value={VEHICLE_TYPES.FOUR_WHEELER}>Four Wheeler</option>

          <option value={VEHICLE_TYPES.VAN_MINIBUS}>Van / Minibus</option>

          <option value={VEHICLE_TYPES.HEAVY_VEHICLE}>Heavy Vehicle</option>
        </select>

        {errors.vehicleType && (
          <p className="mt-1 text-sm text-red-400">
            {errors.vehicleType.message}
          </p>
        )}
      </div>

      {/* REGISTRATION */}

      <div>
        <label
          htmlFor="registrationNumber"
          className="mb-2 block text-sm font-medium"
        >
          Registration number
        </label>

        <input
          id="registrationNumber"
          {...register("registrationNumber")}
          type="text"
          placeholder="OD02AB1234"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 uppercase text-white outline-none focus:border-white"
        />

        {errors.registrationNumber && (
          <p className="mt-1 text-sm text-red-400">
            {errors.registrationNumber.message}
          </p>
        )}
      </div>

      {/* BRAND */}

      <div>
        <label htmlFor="brand" className="mb-2 block text-sm font-medium">
          Brand
        </label>

        <input
          id="brand"
          {...register("brand")}
          type="text"
          placeholder="Toyota"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-white"
        />

        {errors.brand && (
          <p className="mt-1 text-sm text-red-400">{errors.brand.message}</p>
        )}
      </div>

      {/* MODEL */}

      <div>
        <label
          htmlFor="vehicleModel"
          className="mb-2 block text-sm font-medium"
        >
          Vehicle model
        </label>

        <input
          id="vehicleModel"
          {...register("vehicleModel")}
          type="text"
          placeholder="Innova"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-white"
        />

        {errors.vehicleModel && (
          <p className="mt-1 text-sm text-red-400">
            {errors.vehicleModel.message}
          </p>
        )}
      </div>

      {/* COLOR */}

      <div>
        <label htmlFor="color" className="mb-2 block text-sm font-medium">
          Color
        </label>

        <input
          id="color"
          {...register("color")}
          type="text"
          placeholder="White"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-white"
        />

        {errors.color && (
          <p className="mt-1 text-sm text-red-400">{errors.color.message}</p>
        )}
      </div>

      {/* BUTTONS */}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-zinc-700 px-5 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : vehicle
              ? "Update vehicle"
              : "Add vehicle"}
        </button>
      </div>
    </form>
  );
}
