const API_URL = 'https://codeforces.com/api';

export const fetchUserStatus = async (handle) => {
  try {
    const response = await fetch(`${API_URL}/user.status?handle=${handle}`);
    const data = await response.json();
    if (data.status === 'OK') {
      return data.result
        .filter(sub => sub.verdict === 'OK')
        .map(sub => ({
          contestId: sub.problem.contestId,
          index: sub.problem.index,
          id: `${sub.problem.contestId}${sub.problem.index}`
        }));
    }
    throw new Error(data.comment || 'Failed to fetch user status');
  } catch (error) {
    console.error('Error fetching user status:', error);
    throw error;
  }
};

export const fetchProblemsByRating = async (rating) => {
  try {
    const response = await fetch(`${API_URL}/problemset.problems`);
    const data = await response.json();
    if (data.status === 'OK') {
      return data.result.problems
        .filter(p => p.rating === parseInt(rating))
        .map(p => ({
          ...p,
          id: `${p.contestId}${p.index}`,
          link: `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`
        }));
    }
    throw new Error(data.comment || 'Failed to fetch problems');
  } catch (error) {
    console.error('Error fetching problems by rating:', error);
    throw error;
  }
};
