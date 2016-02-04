const tr = n => n < 10 ? '0' + n : '' + n;
const getEpisode = ep => ep.episode || ep.number;

export function formatEpisode() {
  if (arguments.length === 2 && typeof arguments[0] === 'number' && typeof arguments[1] === 'number') {
    return `${tr(arguments[0])}x${tr(arguments[1])}`;
  } else if (arguments.length === 1 && typeof arguments[0] === 'object') {
    return `${tr(arguments[0].season)}x${tr(getEpisode(arguments[0]))}`;
  }
};

export function formatEpisodeRelease() {
  if (arguments.length === 2 && typeof arguments[0] === 'number' && typeof arguments[1] === 'number') {
    return `s${tr(arguments[0])}e${tr(arguments[1])}`;
  } else if (arguments.length === 1 && typeof arguments[0] === 'object') {
    return `s${tr(arguments[0].season)}e${tr(getEpisode(arguments[0]))}`;
  }
};

export function formatSeries(episodes) {
  if (episodes.length === 0) {
    return [];
  }

  return episodes.slice(1).reduce((total, curr) => {
    const prevSeries = total[total.length - 1];
    const prev = prevSeries[prevSeries.length - 1];

    if (prev.season === curr.season && getEpisode(prev) === (getEpisode(curr) - 1)) {
      prevSeries.push(curr);
    } else {
      total.push([curr]);
    }

    return total;
  }, [[ episodes[0] ]]);
};
