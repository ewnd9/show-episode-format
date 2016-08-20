import test from 'ava';
import 'babel-core/register';
import * as format from './../src/index';

test('format single episode', t => {
  t.is(format.formatEpisode(1, 1), '01x01');
  t.is(format.formatEpisode({ season: 1, episode: 2 }), '01x02');
  t.is(format.formatEpisode({ season: 2, number: 1 }), '02x01');
});

test('format series of episodes', t => {
  const ep = (s, ep) => ({ season: s, episode: ep });
  const episodes = [
    ep(1, 1),
    ep(1, 2),
    ep(1, 3),
    ep(1, 5),
    ep(1, 6),
    ep(2, 1)
  ];

  const result = format.formatSeries(episodes);

  t.is(result.length, 3);
  t.deepEqual(result[0], [ep(1, 1), ep(1, 2), ep(1, 3)]);
  t.deepEqual(result[1], [ep(1, 5), ep(1, 6)]);
  t.deepEqual(result[2], [ep(2, 1)]);
});
