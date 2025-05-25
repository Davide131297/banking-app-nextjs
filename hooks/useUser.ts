import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

type ApiTransactionReceived = Omit<Transactions, "sender_username"> & {
  user_transactions_sender_idTouser?: { username: string };
};

interface Transactions {
  id: number;
  sender_id: number;
  receiver_username: string;
  amount: number;
  date: string;
  sender_username?: string;
}

interface TransactionsTypes {
  transactions_received: Transactions[];
  transactions_sended: Transactions[];
}

interface User {
  username: string;
  money?: number;
  transactions?: TransactionsTypes;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to refresh user state
  const refreshUser = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Beide Requests parallel ausführen
      const [userRes, transactionsRes] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/money/transactions"),
      ]);

      if (!userRes.ok) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userData = await userRes.json();
      let transactions: TransactionsTypes = {
        transactions_received: [],
        transactions_sended: [],
      };

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        // Mapping für sender_username
        transactions = {
          transactions_received: (
            (transactionsData.transactions
              ?.transactions_received as ApiTransactionReceived[]) || []
          ).map((tx) => {
            const { user_transactions_sender_idTouser, ...rest } = tx;
            return {
              ...rest,
              sender_username: user_transactions_sender_idTouser?.username,
            };
          }),
          transactions_sended:
            transactionsData.transactions?.transactions_sended || [],
        };
      }

      setUser({
        ...userData.user,
        transactions,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Logout function that updates state immediately
  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    router.push("/");
  };

  // Login function that updates state immediately
  const login = (userData: User) => {
    setUser(userData);
  };

  // Initial load
  useEffect(() => {
    refreshUser();
  }, []);

  return { user, loading, refreshUser, login, logout };
}
