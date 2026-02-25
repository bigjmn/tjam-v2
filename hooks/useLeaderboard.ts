import { useEffect, useState } from "react";
import { firestore } from "../lib/firebase";
import {
	query,
	limit,
	orderBy,
	getDocs,
	doc,
	getDoc,
	collection,
} from "firebase/firestore";
import { playerStatConverter, playerToLeader } from "../utils/helpers";
type BoardScope = "global" | "weekly";
export const useLeaderboard = () => {
	const [globalLeaders, setGlobalLeaders] = useState<GlobalLeader[]>([]);
	const [weeklyLeaders, setWeeklyLeaders] = useState<WeeklyLeader[]>([]);

	const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [boardErr, setBoardErr] = useState<Error | null>(null);

	const [boardScope, setBoardScope] = useState<BoardScope>("global");
    useEffect(() => {
        console.log('globalLeaders', globalLeaders)
    }, [globalLeaders])

	const getLeaders = async () => {
		const leadersRef = collection(firestore, "users").withConverter(
			playerStatConverter,
		);
		setIsLoading(true);
		setBoardErr(null);

		try {
			const playerRanks = await getDocs(leadersRef).then((ld) => {
				return ld.docs
					.map((d) => d.data())
					.filter((d) => d.username !== null)
					.map((d) => playerToLeader(d));
			});
            console.log('PLAYER RANKS', playerRanks)
			const globalList: GlobalLeader[] = [...playerRanks]
				.sort((a, b) => b.bestAllTime - a.bestAllTime)
				.map((pRank, i) => ({
					...pRank,
					type: "global",
					globalRank: i + 1,
				}));
			const weeklyList: WeeklyLeader[] = [...playerRanks]
				.sort((a, b) => b.bestWeek - a.bestWeek)
				.map((pRank, i) => ({
					...pRank,
					type: "weekly",
					weeklyRank: i + 1,
				}));

			setGlobalLeaders(globalList);
			setWeeklyLeaders(weeklyList);
		} catch (err) {
			console.log(err);
			if (err instanceof Error) {
                
				setBoardErr(err);
			} else {
				setBoardErr(new Error("something went wrong!"));
			}
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getLeaders();
	}, [lastRefresh]);

	const refreshLeaders = () => {
		setLastRefresh(new Date());
	};
	const changeScope = (bScope: BoardScope) => {
		setBoardScope(bScope);
	};

	return {
		globalLeaders,
		weeklyLeaders,
		isLoading,
		boardErr,
		refreshLeaders,
		changeScope,
		boardScope,
		lastRefresh,
	};
};
