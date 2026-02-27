const fs = require('fs');

async function enrichData() {
    console.log('Fetching global problemset from Codeforces...');
    const cfResponse = await fetch('https://codeforces.com/api/problemset.problems');
    const cfData = await cfResponse.json();

    if (cfData.status !== 'OK') {
        console.error('Failed to fetch CF problemset');
        return;
    }

    const globalProblems = cfData.result.problems;
    const problemMap = new Map();

    globalProblems.forEach(p => {
        problemMap.set(`${p.contestId}${p.index}`, p.rating);
    });

    console.log('Reading local problems.json...');
    const localProblemsPath = './frontend/src/data/problems.json';
    const localProblems = JSON.parse(fs.readFileSync(localProblemsPath, 'utf8'));

    const extractCFIds = (url) => {
        const groupContestMatch = url.match(/contest\/(\d+)\/problem\/(\w+)/);
        const problemsetMatch = url.match(/problemset\/problem\/(\d+)\/(\w+)/);

        if (groupContestMatch) return { contestId: groupContestMatch[1], index: groupContestMatch[2] };
        if (problemsetMatch) return { contestId: problemsetMatch[1], index: problemsetMatch[2] };
        return null;
    };

    const detectPlatform = (url) => {
        if (url.includes('codeforces.com')) return 'Codeforces';
        if (url.includes('atcoder.jp')) return 'AtCoder';
        if (url.includes('cses.fi')) return 'CSES';
        if (url.includes('leetcode.com')) return 'LeetCode';
        if (url.includes('codechef.com')) return 'CodeChef';
        if (url.includes('codingninjas.com')) return 'CodingNinjas';
        if (url.includes('hackerrank.com')) return 'HackerRank';
        return 'Other';
    };

    let enrichedCount = 0;
    const enrichedProblems = localProblems.map(p => {
        const platform = detectPlatform(p.link);
        let rating = null;
        let contestId = null;
        let index = null;

        if (platform === 'Codeforces') {
            const ids = extractCFIds(p.link);
            if (ids) {
                rating = problemMap.get(`${ids.contestId}${ids.index}`) || null;
                contestId = parseInt(ids.contestId);
                index = ids.index;
                if (rating) enrichedCount++;
            }
        }

        return {
            ...p,
            platform,
            rating,
            contestId,
            index
        };
    });

    console.log(`Enriched ${enrichedCount} out of ${localProblems.length} problems with ratings.`);
    console.log(`Platforms detected: ${[...new Set(enrichedProblems.map(p => p.platform))].join(', ')}`);

    fs.writeFileSync(localProblemsPath, JSON.stringify(enrichedProblems, null, 2));
    console.log('Saved enriched data to problems.json');
}

enrichData();
