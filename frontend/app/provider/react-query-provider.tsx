import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "./auth-context";
import { ThemeProvider } from "./theme-provider";

export const queryClient = new QueryClient();

const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
    return(
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthProvider>
                    {children}
                    <Toaster position="top-center" richColors/>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default ReactQueryProvider;