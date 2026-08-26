import api from "@/lib/api";

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface CreateParkingPayload {
  parkingName: string;
  description?: string;
  parkingType: string;

  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;

  location: {
    latitude: number;
    longitude: number;
  };

  ownerName: string;
  contactNumber: string;

  parkingArea: number;

  facilities: string[];
  rules: string[];
  entryInstructions?: string;

  bookingModes: {
    hourly: boolean;
    daily: boolean;
    monthly: boolean;
  };

  pricing: {
    currency: string;

    twoWheeler: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };

    fourWheeler: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };

    vanMinibus: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };

    heavyVehicle: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };
  };

  operatingHours: {
    open: string;
    close: string;
  };
}

export interface Parking {
  _id: string;

  parkingName: string;
  description?: string;

  parkingType: string;

  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;

  location: {
    latitude: number;
    longitude: number;
  };

  ownerName: string;
  contactNumber: string;

  parkingArea: number;

  facilities: string[];
  rules: string[];
  entryInstructions?: string;

  bookingModes: {
    hourly: boolean;
    daily: boolean;
    monthly: boolean;
  };

  pricing: {
    currency: string;

    twoWheeler?: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };

    fourWheeler?: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };

    vanMinibus?: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };

    heavyVehicle?: {
      hourly?: number;
      daily?: number;
      monthly?: number;
    };
  };

  operatingHours: {
    open: string;
    close: string;
  };

  images?: string[];

  status?: string;

  createdAt?: string;
  updatedAt?: string;
}

export async function createParking(
  payload: CreateParkingPayload,
  images: File[],
) {
  const formData = new FormData();

  formData.append("parkingName", payload.parkingName);

  if (payload.description) {
    formData.append("description", payload.description);
  }

  formData.append("parkingType", payload.parkingType);

  formData.append("address", payload.address);

  if (payload.landmark) {
    formData.append("landmark", payload.landmark);
  }

  formData.append("city", payload.city);
  formData.append("state", payload.state);
  formData.append("pincode", payload.pincode);

  formData.append("location", JSON.stringify(payload.location));

  formData.append("ownerName", payload.ownerName);
  formData.append("contactNumber", payload.contactNumber);

  formData.append("parkingArea", String(payload.parkingArea));

  formData.append("facilities", JSON.stringify(payload.facilities));

  formData.append("rules", JSON.stringify(payload.rules));

  if (payload.entryInstructions) {
    formData.append("entryInstructions", payload.entryInstructions);
  }

  formData.append("bookingModes", JSON.stringify(payload.bookingModes));

  formData.append("pricing", JSON.stringify(payload.pricing));

  formData.append("operatingHours", JSON.stringify(payload.operatingHours));

  /*
   * IMPORTANT
   *
   * Do NOT JSON.stringify the File objects.
   *
   * append each File directly.
   */

  images.forEach((file) => {
    formData.append("images", file, file.name);
  });

  console.log("========== PARKING FORM DATA ==========");

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(key, "FILE:", value.name, value.type, value.size);
    } else {
      console.log(key, value);
    }
  }

  console.log("=======================================");

  const response = await api.post("/parkings", formData);

  return response.data;
}

/* ============================================================
   GET ALL PARKINGS
   ============================================================ */

export async function getParkings() {
  const response = await api.get<ApiResponse<Parking[]>>("/parkings");

  return response.data;
}

/* ============================================================
   GET PARKING BY ID
   ============================================================ */

export async function getParkingById(id: string) {
  const response = await api.get<ApiResponse<Parking>>(`/parkings/${id}`);

  return response.data;
}
