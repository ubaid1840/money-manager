import { app, auth, db } from "@/config/firebase";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function useCheckSession() {
    const router = useRouter();
    const pathname = usePathname()

    const checkSession = async () => {
        return new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(auth, async user => {
                if (user) {
                    if (pathname.includes('login') || pathname.includes('signup') || pathname.includes('forgetpassword')) {
                        router.push('/dashboard')
                    }

                } else {
                    if (pathname.includes('superadmin') || pathname.includes('dashboard')) {
                        router.push('/login')
                    }
                    resolve({})
                }
            })
            return () => {
                unsubscribe()
            }
        })
    };

    return checkSession;
}