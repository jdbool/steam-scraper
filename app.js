const fetch = require('node-fetch');
const chalk = require('chalk');
const fs = require('fs').promises;

const maxConcurrent = 3;

const threeLetters = [];
for (let a = 0; a < 26; a++)
	for (let b = 0; b < 26; b++)
		for (let c = 0; c < 26; c++)
			threeLetters.push(
				String.fromCharCode(a + 97) +
				String.fromCharCode(b + 97) +
				String.fromCharCode(c + 97)
			);

async function isSteamLinkTaken(id) {
	const res = await fetch(`https://steamcommunity.com/id/${id}`);
	if (!res.ok) throw res.status;
	const body = await res.text();
	return body.includes('playerAvatarAutoSizeInner');
}

(async () => {
	let concurrent = [];

	let numDone = 0;
	for (const id of threeLetters) {
		if (concurrent.length >= maxConcurrent) {
			await Promise.all(concurrent);
			concurrent = [];
		}
		concurrent.push((async () => {
			const isTaken = await isSteamLinkTaken(id);
			numDone++;
			const percent = Math.floor(numDone / threeLetters.length * 10000) / 100;
			if (isTaken) {
				console.log(chalk.red(id) + ` (${percent}%)`);
			} else {
				console.log(chalk.green(id) + ` (${percent}%)`);
				await fs.appendFile('available.txt', `${new Date().toLocaleString()} => ${id}\n`);
			}
		})());
	}

	await Promise.all(concurrent);
})();