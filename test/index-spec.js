import test from 'ava';
import 'babel-core/register';

import * as format from './../src/index';
import tk from 'timekeeper';

const ep = (s, ep, date) => ({ season: s, episode: ep, date });

const ep1x1 = ep(1, 1, '2016-07-15');
const ep1x2 = ep(1, 2, '2016-07-16');
const ep1x3 = ep(1, 3, '2016-07-17');
const ep1x5 = ep(1, 5, '2016-07-20');
const ep1x6 = ep(1, 6, '2016-07-22');
const ep2x1 = ep(2, 1, '2016-11-15');

test.before(() => {
  const time = new Date(1477799376286);
  tk.freeze(time);
});

test('format single episode', t => {
  t.is(format.formatEpisode(1, 1), '01x01');
  t.is(format.formatEpisode([1, 1]), '01x01');
  t.is(format.formatEpisode({ season: 1, episode: 2 }), '01x02');
  t.is(format.formatEpisode({ season: 2, number: 1 }), '02x01');
});

test('format series of episodes', t => {
  const episodes = [
    ep1x1,
    ep1x2,
    ep1x3,
    ep1x5,
    ep1x6,
    ep2x1
  ];

  const result = format.formatSeries(episodes);

  t.is(result.length, 3);
  t.deepEqual(result[0], [ep1x1, ep1x2, ep1x3]);
  t.deepEqual(result[1], [ep1x5, ep1x6]);
  t.deepEqual(result[2], [ep2x1]);
});

test('group episodes by air dates', t => {
  const episodes = [
    ep1x1,
    ep1x2,
    ep1x3,
    ep1x5,
    ep1x6,
    ep2x1
  ];

  const result = format.groupEpisodesByAirDates(episodes, (_, s, ep) => s === 1 && ep === 1);

  t.deepEqual(result.aired, [ep1x2, ep1x3, ep1x5, ep1x6]);
  t.deepEqual(result.unaired, [ep2x1]);
  t.deepEqual(result.watched, [ep1x1]);
});

test('group by air interval', t => {
  const episodes = [
    ep1x1,
    ep1x2,
    ep1x3,
    ep1x5,
    ep1x6,
    ep2x1
  ];

  const result = format.formatSeriesByAirInterval(episodes);
  t.deepEqual(result[0].episodes, [ep1x1, ep1x2, ep1x3]);
  t.truthy(result[0].interval === 1);

  t.deepEqual(result[1].episodes, [ep1x5, ep1x6]);
  t.truthy(result[1].interval === 2);

  t.deepEqual(result[2].episodes, [ep2x1]);
  t.truthy(result[2].interval === 0);
})

test('group shows by air dates', t => {
  const episodes = [
    ep1x1,
    ep1x2,
    ep1x3,
    ep1x5,
    ep1x6,
    ep2x1
  ];

  const shows = [episodes];
  const result = format.groupShowsByAirDates(shows, _ => _, (_, s, ep) => s === 1 && ep === 1);

  const result0 = result.hasAired[0];
  t.deepEqual(result0.show, episodes);

  t.truthy(result0.report.unaired[0].title === '02x01 in 15 days (2016-11-15)');
  t.truthy(result0.report.watched[0].title === '01x01');

  t.truthy(result0.report.aired.length === 2);

  t.truthy(result0.report.aired[0].title === '01x02 - 01x03 (2)');
  t.truthy(result0.report.aired[1].title === '01x05 - 01x06 (2)');
});
