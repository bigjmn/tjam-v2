import { useContext } from "react";
// import { UserContext } from "../providers/UserProvider";
import { UserContext } from "../providers/UserProviderFixed";
export function useUser() {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error("useUser must be used within UserProvider");
	}

	return context;
}
