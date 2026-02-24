I want you to crate animations for updating a user’s “achievements” after the game. The animation to run is determined by an array of strings, corresponding with the keys of new achievements scored.

The top of the screen should show the User's current rank, and how many stars they've filled within that rank.
The component should look like: https://www.figma.com/design/ghDcRwpf9xwCX01JwIavCj/Untitled?node-id=171-248&m=dev

There are 3 categories of Achievements to possibly update:

- Next Goals https://www.figma.com/design/ghDcRwpf9xwCX01JwIavCj/Untitled?node-id=171-247&m=dev
- Legendary Achievements https://www.figma.com/design/ghDcRwpf9xwCX01JwIavCj/Untitled?node-id=171-246&m=dev
- Secret achievements: https://www.figma.com/design/ghDcRwpf9xwCX01JwIavCj/Untitled?node-id=171-244&m=dev

For each of these categories, run the update animation only if at least one new achievement fall under the category.

### Next Achievements

This is a block of three achievements:

- a scoring achievement
- a streaking achievement
- a novelty achievement

If an achievement has been reached, fill the relevant number of stars to the star count under the user's rank. If all the stars are filled in, create a modal that says "Congratulation! your new rank is `<new rank>`" and has a continue button. When the user hits continue, proceed

After scoring the achievement, the achievement tile should slide out to the left and the new one should slide in from the right. A scoring achievemet should be replaced by the next scoring achievement, streaking with streaking, etc.

### Legendary Achievements

If an achievement is reached, add stars to the star count similar to in the "next achievements" block. No additional animation for the tiles is needed.

### Secret Achievements

If an achievement is reached, add stars to the star count similar to in the other blocks. The tile should then reveal its description.

## Example Animation Process

Here is a possible scenario, and how the animation should be handled.

User's rank/star count (pre-update): Rookie, with 2 stars already filled
Array of achievement keys: `["nifty50", "goodasgold", "trip30", "allmyletters"] `

1. The block of Next Animations rises from the bottom
2. The last star of Rookie fills in, and the user gets a modal saying "Congratulations, your new rank is Not Bad!" The user presses continue
3. The first star of the Not Bad rank fills in.
4. The Nifty Fifty tile animates out to the left, and Good as Gold animates in.
5. Two more stars of Not Bad fill in.
6. The Good as Gold tile animates out to the left, and the ol' Trip-Dig animates in.
7. The last two stars of Not Brad fill in, and the user gets a modal saying "Congratulations, your new rank is Pretty Dece!" The user presses continue
8. Streakin' 30s animates out to the left and Streakin' 40s animates in.
9. The block of Next Animations animates out to the left.
10. No Legendary Achievements were scored, so this section is skipped
11. The block of Secret Achievements animates in from the bottom.
12. The All My Letters tile reveals the explainer (replacing the placeholder)
13. Three stars are filled in to the Pretty Dece Rank
14. The block of Secret Achievements animates out to the left.
