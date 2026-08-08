import { createContext, use, useContext, useEffect, useState } from "react";
import type { User } from "@/types";
import { set } from "zod";
import { queryClient } from "./react-query-provider";
import { useLocation, useNavigate } from "react-router";
import { publicRoutes } from "@/lib";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    //error: string | null;
    login: (data: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: React.ReactNode }) => {
    const [user , setUser] = useState<User | null>(null);
    const [isAuthenticated , setIsAuthenticated] = useState(false);
    const [isLoading , setIsLoading] = useState(true);
    //const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const currentPath = useLocation().pathname;
    const isPublicRoute = publicRoutes.includes(currentPath);

    // check if user is authenticated
    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            const userInfo = localStorage.getItem("user");
            if(userInfo) {
                setUser(JSON.parse(userInfo));
                setIsAuthenticated(true);
            }else {
                setIsAuthenticated(false);
                if(!isPublicRoute) {
                    navigate("/sign-in");
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    // Listen for the "force-logout" event and call the logout function when it occurs
    useEffect(() => {
        const handleLogout = () => {
            logout();
            navigate("/sign-in");
        };
        window.addEventListener("force-logout", handleLogout);
        return () => window.removeEventListener("force-logout", handleLogout);
    }, []);


    // login function
    const login = async (data: any) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setUser(data.user);
        setIsAuthenticated(true);
    };

    // logout function
    const logout = async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setIsAuthenticated(false);

        queryClient.clear();
    };

    const values = {
        user,
        isAuthenticated,
        isLoading,
        //error,
        login,
        logout,
    };

    return(
        <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if(!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

