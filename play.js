'use strict';

const fmt = require('./');

for (const fn in fmt) {
  const oldFn = fmt[fn];

  fmt[fn] = function() {
    const result = oldFn.apply(null, arguments);
    console.log(fn)
    console.log(require('util').inspect(result, { depth: null }));
  }
}

fmt.formatEpisode(1, 1) //=> '01x01'
fmt.formatEpisode({ season: 1, episode: 2 }) //=> '01x02'

fmt.formatEpisodeRelease(1, 4) //=> 's01e04'
fmt.formatEpisodeRelease({ season: 1, episode: 5 }) //=> 's01e05'

fmt.isEqual([1, 1], [1, 1]) //=> true
fmt.isEqual([1, 1], [1, 2]) //=> false

const episodes = [
  { season: 1, episode: 1, date: '2016-07-15' },
  { season: 1, episode: 2, date: '2016-07-16' },

  { season: 1, episode: 4, date: '2016-07-20' },
  { season: 1, episode: 5, date: '2016-07-22' },
  { season: 1, episode: 6, date: '2016-07-24' },

  { season: 2, episode: 1, date: '2016-12-01' },
  { season: 2, episode: 2, date: '2016-12-15' }
];

fmt.formatSeries(episodes);
/*
[ [ { season: 1, episode: 1, date: '2016-07-15' },
    { season: 1, episode: 2, date: '2016-07-16' } ],
  [ { season: 1, episode: 4, date: '2016-07-20' },
    { season: 1, episode: 5, date: '2016-07-22' },
    { season: 1, episode: 6, date: '2016-07-24' } ],
  [ { season: 2, episode: 1, date: '2016-12-01' },
    { season: 2, episode: 2, date: '2016-12-15' } ] ]
*/

fmt.formatSeriesByAirInterval(episodes);
/*
[ { episodes:
     [ { season: 1, episode: 1, date: '2016-07-15' },
       { season: 1, episode: 2, date: '2016-07-16' } ],
    interval: 1 },
  { episodes:
     [ { season: 1, episode: 4, date: '2016-07-20' },
       { season: 1, episode: 5, date: '2016-07-22' },
       { season: 1, episode: 6, date: '2016-07-24' } ],
    interval: 2 },
  { episodes:
     [ { season: 2, episode: 1, date: '2016-12-01' },
       { season: 2, episode: 2, date: '2016-12-15' } ],
    interval: 14 } ]
*/

fmt.groupByEpisodeStreak(episodes);
/*
[ { title: '01x01 - 01x02 (2)',
    episodes:
     [ { season: 1, episode: 1, date: '2016-07-15' },
       { season: 1, episode: 2, date: '2016-07-16' } ],
    hasFile: false },
  { title: '01x04 - 01x06 (3)',
    episodes:
     [ { season: 1, episode: 4, date: '2016-07-20' },
       { season: 1, episode: 5, date: '2016-07-22' },
       { season: 1, episode: 6, date: '2016-07-24' } ],
    hasFile: false },
  { title: '02x01 - 02x02 (2)',
    episodes:
     [ { season: 2, episode: 1, date: '2016-12-01' },
       { season: 2, episode: 2, date: '2016-12-15' } ],
    hasFile: false } ]
*/

fmt.groupByAirInterval(episodes);
/*
[ { episodes:
     [ { season: 1, episode: 1, date: '2016-07-15' },
       { season: 1, episode: 2, date: '2016-07-16' } ],
    interval: 1,
    title: '01x01 - 01x02 (7) every 1 days in -107 days (2016-07-15)',
    hasFile: false },
  { episodes:
     [ { season: 1, episode: 4, date: '2016-07-20' },
       { season: 1, episode: 5, date: '2016-07-22' },
       { season: 1, episode: 6, date: '2016-07-24' } ],
    interval: 2,
    title: '01x04 - 01x06 (7) every 2 days in -102 days (2016-07-20)',
    hasFile: false },
  { episodes:
     [ { season: 2, episode: 1, date: '2016-12-01' },
       { season: 2, episode: 2, date: '2016-12-15' } ],
    interval: 14,
    title: '02x01 - 02x02 (7) every 14 days in 31 days (2016-12-01)',
    hasFile: false } ]
*/

function isWatched(episode, s, ep) {
  return s === 1 && ep === 1;
}

fmt.groupEpisodesByAirDates(episodes, isWatched);
/*
{ aired:
   [ { season: 1, episode: 2, date: '2016-07-16' },
     { season: 1, episode: 4, date: '2016-07-20' },
     { season: 1, episode: 5, date: '2016-07-22' },
     { season: 1, episode: 6, date: '2016-07-24' } ],
  unaired:
   [ { season: 2, episode: 1, date: '2016-12-01' },
     { season: 2, episode: 2, date: '2016-12-15' } ],
  watched: [ { season: 1, episode: 1, date: '2016-07-15' } ],
  hasFile: [] }
*/

fmt.groupShowsByAirDates([episodes], _ => _, isWatched);
/*
{ hasAired:
   [ { show:
        [ { season: 1, episode: 1, date: '2016-07-15' },
          { season: 1, episode: 2, date: '2016-07-16' },
          { season: 1, episode: 4, date: '2016-07-20' },
          { season: 1, episode: 5, date: '2016-07-22' },
          { season: 1, episode: 6, date: '2016-07-24' },
          { season: 2, episode: 1, date: '2016-12-01' },
          { season: 2, episode: 2, date: '2016-12-15' } ],
       report:
        { aired:
           [ { title: '01x02',
               episodes: [ { season: 1, episode: 2, date: '2016-07-16' } ],
               hasFile: false },
             { title: '01x04 - 01x06 (3)',
               episodes:
                [ { season: 1, episode: 4, date: '2016-07-20' },
                  { season: 1, episode: 5, date: '2016-07-22' },
                  { season: 1, episode: 6, date: '2016-07-24' } ],
               hasFile: false } ],
          unaired:
           [ { episodes:
                [ { season: 2, episode: 1, date: '2016-12-01' },
                  { season: 2, episode: 2, date: '2016-12-15' } ],
               interval: 14,
               title: '02x01 - 02x02 (2) every 14 days in 31 days (2016-12-01)',
               hasFile: false } ],
          watched:
           [ { title: '01x01',
               episodes: [ { season: 1, episode: 1, date: '2016-07-15' } ],
               hasFile: false } ],
          hasFile: [] } } ],
  hasOneAired: [],
  hasUnaired: [],
  watched: [] }
*/

fmt.groupShowsByAirDatesFlatten([episodes], _ => _, isWatched);
/*
[ [ { show:
       [ { season: 1, episode: 1, date: '2016-07-15' },
         { season: 1, episode: 2, date: '2016-07-16' },
         { season: 1, episode: 4, date: '2016-07-20' },
         { season: 1, episode: 5, date: '2016-07-22' },
         { season: 1, episode: 6, date: '2016-07-24' },
         { season: 2, episode: 1, date: '2016-12-01' },
         { season: 2, episode: 2, date: '2016-12-15' } ],
      report:
       { aired:
          [ { title: '01x02',
              episodes: [ { season: 1, episode: 2, date: '2016-07-16' } ],
              hasFile: false },
            { title: '01x04 - 01x06 (3)',
              episodes:
               [ { season: 1, episode: 4, date: '2016-07-20' },
                 { season: 1, episode: 5, date: '2016-07-22' },
                 { season: 1, episode: 6, date: '2016-07-24' } ],
              hasFile: false } ],
         unaired:
          [ { episodes:
               [ { season: 2, episode: 1, date: '2016-12-01' },
                 { season: 2, episode: 2, date: '2016-12-15' } ],
              interval: 14,
              title: '02x01 - 02x02 (2) every 14 days in 31 days (2016-12-01)',
              hasFile: false } ],
         watched:
          [ { title: '01x01',
              episodes: [ { season: 1, episode: 1, date: '2016-07-15' } ],
              hasFile: false } ],
         hasFile: [] } } ] ]
*/
