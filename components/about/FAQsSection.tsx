import React from "react";
import { ScrollView, StyleSheet, Dimensions, View } from "react-native";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";

const SCREEN_WIDTH = Dimensions.get("window").width;

const faqs = [
	{
		question: "Where did you get your word list? I hate it.",
		answer: "I'll devote some time to this one, because it is far and away the most common question/complaint I get. There are two main reasons. \n\n1. I wanted the game to be playable for people (like me) who don't know all the archaic and uncommon words you might find in Scrabble or WWF. \n\n 2. The letters you're given each turn form a word on the word list. This gives the game a sense of \"fairness\" I think in terms of letter distribution. I didn't want games to be torpedoed by getting a word like ZZZ. I did create a variant that uses the official scrabble word list (unlocks at level 5). If you can honestly tell me it's more fun, then by all means enjoy."
	},
	{
		question: "Yeah what's with this variant unlocking thing?",
		answer: "I don't know, I thought it would be kinda cool. If it makes you feel any better, the variants all kind of suck."
	},
	{
		question: "What's with this 'sign-in' BS?",
		answer: "I gave this a lot of thought. If the leader board showed the top individual game scores, it would almost certainly be like an arcade where the same person has most of the top spots. I thought a ranking of players (not games) would be more fun, but that does involve a little user-management."
	},
	{
		question: "Will signing in reset my high score or achievements?",
		answer: "No, everything will carry over. And in fact it means you won't have to start over if you get a new phone or something."
	},
	{
		question: "Can I play offline?",
		answer: "Yes you can. You may not get leaderboard updates in real time, but that should update (including any high scores you set) when you next reconnect."
	},
	{
		question: "Why do I suck at this?",
		answer: "It's a hard game! My advice is to think in terms of favorable/unfavorable ROWS, not TILES. For example, the J may seem scary, but J_G will clear with almost any vowel."
	},
	{
		question: "How can I reach you with my questions/ideas/feedback?",
		answer: "You can email me (see the support section) with anything. We never talk anymore!"
	},
	{
		question: "Is this game like WORDLE?",
		answer: "Yes, it's the exact same as WORDLE."

	}
]
const faqs1 = [
	{
		question: "How do I move tiles?",
		answer:
			"Drag tiles from the home row and drop them onto the board to create words. You can only move tiles from the home row (bottom row).",
	},
	{
		question: "What makes a valid word?",
		answer:
			"Words must be formed by connecting adjacent tiles horizontally or vertically. Valid words are highlighted in green.",
	},
	{
		question: "How do achievements work?",
		answer:
			"Achievements are earned by reaching score milestones, maintaining play streaks, and discovering special words. View your progress in the Achievements tab.",
	},
	{
		question: "How are points calculated?",
		answer:
			"Each letter has a point value. Longer words and rare letters earn more points. Your total score is the sum of all valid words created.",
	},
	{
		question: "What are secret achievements?",
		answer:
			"Secret achievements are hidden challenges that are revealed when you unlock them. Try different word patterns and strategies to discover them!",
	},
	{
		question: "Can I play offline?",
		answer:
			"Yes! The game works offline. Your progress will sync when you reconnect to the internet.",
	},
	{
		question: "How can I reach you with my questions/ideas/feedback?",
		answer: "You can reach me at jesse.a.nicholas@gmail.com"
	}
];

export const FAQsSection: React.FC = () => {
	return (
		<ThemedView style={styles.pageContainer}>
			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={true}
				nestedScrollEnabled={true}
				contentContainerStyle={styles.scrollContent}
			>
				{faqs.map((faq, index) => (
					<View key={index} style={styles.faqItem}>
						<ThemedText variant="strong" style={styles.question}>
							{faq.question}
						</ThemedText>
						<ThemedText variant="regular" style={styles.answer}>
							{faq.answer}
						</ThemedText>
					</View>
				))}
			</ScrollView>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	pageContainer: {
		width: SCREEN_WIDTH,
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom: 24,
	},
	faqItem: {
		marginBottom: 24,
	},
	question: {
		marginBottom: 8,
	},
	answer: {
		lineHeight: 22,
		opacity: 0.9,
	},
});
