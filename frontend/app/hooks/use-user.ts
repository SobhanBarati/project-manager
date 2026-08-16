import { fetchData, updateData } from "@/lib/fetch-util";
import type {
  ChangePasswordFormData,
  ProfileFormData,
} from "@/routes/user/profile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types"; // ✅ اضافه کنید

const queryKey: string[] = ["user"];

export const useUserProfileQuery = () => {
  return useQuery({
    queryKey,
    queryFn: () => fetchData<User>("/users/profile"), // ✅ تایپ User
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      updateData("/users/change-password", data),
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileFormData) => 
      updateData<User>("/users/profile", data), // ✅ تایپ User
    onSuccess: (data: User) => { // ✅ تایپ User
      queryClient.invalidateQueries({ queryKey });
      return data;
    },
  });
};