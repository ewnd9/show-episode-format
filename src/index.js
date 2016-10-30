import groupBy from 'lodash.groupby';
import pluralize from 'pluralize';

export function formatEpisode(ep) {
  if (arguments.length === 2) {
    ep = Array.prototype.slice.apply(arguments);
  }

  return `${tr(getSeason(ep))}x${tr(getEpisode(ep))}`;
}

export function formatEpisodeRelease(ep) {
  if (arguments.length === 2) {
    ep = Array.prototype.slice.apply(arguments);
  }

  return `s${tr(getSeason(ep))}e${tr(getEpisode(ep))}`;
}

export function formatSeries(episodes) {
  return foldConsecutive(episodes, (prev, ep, i) => i === 0 || (prev.season === ep.season && getEpisode(prev) === (getEpisode(ep) - 1)));
}

export function formatSeriesByAirInterval(episodes) {
  let prevDate;
  let prevDiff;

  const dict = {};

  const result = foldConsecutive(episodes, (prev, ep, i) => {
    if (i === 0) {
      prevDate = new Date(getDate(ep)).getTime();
      return true;
    } else {
      const date = new Date(getDate(ep)).getTime();
      const diff = dateDiff(prevDate, date);

      prevDate = date;

      if (typeof prevDiff === 'undefined') {
        prevDiff = diff;
        dict[i - 1] = diff;

        return true;
      } else if (diff === prevDiff) {
        dict[i - 1] = diff;

        return true;
      } else {
        prevDiff = undefined;
        return false;
      }
    }
  });

  let i = 0;

  return result.map(episodes => {
    const r = {
      episodes,
      interval: episodes.length > 1 ? dict[i] : 0
    };

    i += episodes.length;

    return r;
  });
}

export function groupByEpisodeStreak(episodes) {
  return formatSeries(episodes)
    .map(episodes => {
      let title = formatConsecutiveGroup(episodes, formatEpisode);

      if (episodes.length > 1) {
        title += ` (${episodes.length})`;
      }

      return { title, episodes };
    });
}

export function groupByAirInterval(episodes) {
  const now = Date.now();

  return formatSeriesByAirInterval(episodes)
    .map(group => {
      let title = formatConsecutiveGroup(group.episodes, formatEpisode);

      const dateStr = getDate(group.episodes[0]);
      const date = new Date(dateStr).getTime();

      if (episodes.length > 1) {
        title += ` (${episodes.length})`;
        title += ` every ${group.interval === 7 ? 'week' : group.interval + ' days'}`;
      }

      title += ` in ${dateDiff(now, date)} ${pluralize('day', dateDiff(now, date))} (${dateStr})`;

      group.title = title;
      return group;
    });
}

export function groupEpisodesByAirDates(episodes, watchedFn = () => false) {
  const now = new Date().getTime();

  const result = {
    aired: [],
    unaired: [],
    watched: []
  };

  episodes
    .filter(ep => getSeason(ep) > 0 && getEpisode(ep) > 0)
    .forEach(ep => {
      const date = new Date(getDate(ep)).getTime();

      if (watchedFn(ep, getSeason(ep), getEpisode(ep))) {
        result.watched.push(ep);
      } else if (date < now) {
        result.aired.push(ep);
      } else {
        result.unaired.push(ep);
      }
    });

  return result;
}

export function groupShowsByAirDates(shows, getEpisodes = _ => _, watchedFn = () => false) {
  const now = new Date().getTime();

  const items = shows.map(show => {
    const report = groupEpisodesByAirDates(getEpisodes(show), watchedFn);
    return { show, report };
  });

  const result = groupBy(items, ({ report }) => {
    if (report.aired.length === 1) {
      const date = new Date(report.aired[0].air_date).getTime();

      if ((now - date) < 1000 * 60 * 60 * 24 * 10) { // gt than 10 days
        return 'hasOneAired';
      }
    }

    if (report.aired.length > 1) {
      return 'hasAired';
    } else if (report.unaired.length > 0) {
      return 'hasUnaired';
    } else {
      return 'empty';
    }
  });

  const cmpDate = (a, b) => new Date(a).getTime() - new Date(b).getTime();

  const sortFn = (type, isFirst) => (a, b) => {
    const aa = a.report[type];
    const bb = b.report[type];

    if (isFirst) {
      return -cmpDate(aa[0].air_date, bb[0].air_date);
    } else {
      return -cmpDate(aa[aa.length - 1].air_date, bb[bb.length - 1].air_date);
    }
  };

  const fn = (type, sortType, isFirst) => {
    result[type] = result[type] || [];
    result[type].sort(sortFn(sortType, isFirst));

    result[type].forEach(report => {
      Object.keys(report.report).forEach(key => {
        if (report.report[key].length > 0) {
          if (key === 'unaired') {
            report.report[key] = groupByAirInterval(report.report[key]);
          } else {
            report.report[key] = groupByEpisodeStreak(report.report[key]);
          }
        }
      });
    });
  };

  fn('hasOneAired', 'aired', false);
  fn('hasAired', 'aired', false);
  fn('hasUnaired', 'unaired', true);
  fn('watched', 'watched', true);

  return result;
}

export function groupShowsByAirDatesFlatten(shows, getEpisodes, watchedFn) {
  const result = groupShowsByAirDates(shows, getEpisodes, watchedFn);
  return [result.hasOneAired, result.hasAired, result.hasUnaired, result.watched].filter(_ => _.length > 0);
}

export function getValue(ep, synonyms) {
  const result = synonyms.find(key => key in ep);
  return result ? ep[result] : null;
}

export function getEpisode(ep) {
  if (Array.isArray(ep) && ep.length > 1) {
    return ep[1];
  } else {
    return getValue(ep, ['episode_number', 'episode', 'number', 'ep']);
  }
}

export function getSeason(ep) {
  if (Array.isArray(ep) && ep.length > 1) {
    return ep[0];
  } else {
    return getValue(ep, ['season_number', 'season', 's']);
  }
}

export function getDate(ep) {
  if (Array.isArray(ep) && ep.length > 2) {
    return ep[2];
  } else {
    return getValue(ep, ['air_date', 'first_aired', 'date']);
  }
}

export function foldConsecutive(xs, fn) {
  return xs.reduce((total, curr, i) => {
    const prevSeries = total[total.length - 1];
    const prev = xs[i - 1];

    if (fn(prev, curr, i)) {
      prevSeries.push(curr);
    } else {
      total.push([curr]);
    }

    return total;
  }, [[]]);
}

export function formatConsecutiveGroup(group, fn) {
  if (group.length === 1) {
    return fn(group[0]);
  } else {
    return `${fn(group[0])} - ${fn(group[group.length - 1])}`;
  }
}

function dateDiff(a, b) {
  return (b - a) / 1000 / 60 / 60 / 24 | 0;
}

function tr(n) {
  return n < 10 ? '0' + n : '' + n;
}
