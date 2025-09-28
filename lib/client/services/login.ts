import { signInWithEmailAndPassword } from "firebase/auth";
import { fireBaseClientAuth } from "@/lib/client/client-config";

const loginUser = async ({ email, password }: { email: string; password: string }) => {
  try {
    const { user } = await signInWithEmailAndPassword(fireBaseClientAuth, email, password);
    if (user) {
      return user
    }
  } catch (error) {
    return error
  }
};

export default loginUser;
