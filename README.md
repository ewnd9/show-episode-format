# show-episode-format

[![Build Status](https://travis-ci.org/ewnd9/show-episode-format.svg?branch=master)](https://travis-ci.org/ewnd9/show-episode-format)

## Install

```
$ npm install show-episode-format --save
```

## Usage

```js
import * as fmt from 'show-episode-format';

fmt.formatEpisode(1, 1) //=> '01x01'
fmt.formatEpisode({ season: 1, episode: 2 }) //=> '01x02'

fmt.formatEpisodeRelease(1, 4) //=> 's01e04'
fmt.formatEpisodeRelease({ season: 1, episode: 5 }) //=> 's01e05'

const episodes = [
  { season: 1, episode: 1 },
  { season: 1, episode: 2 },

  { season: 1, episode: 4 },
  { season: 1, episode: 5 },
  { season: 1, episode: 6 },

  { season: 2, episode: 1 },
  { season: 2, episode: 2 }
];

fmt.formatSeries(episodes);
/*
[
  [
    { season: 1, episode: 1 },
    { season: 1, episode: 2 }
  ],
  [
    { season: 1, episode: 4 },
    { season: 1, episode: 5 },
    { season: 1, episode: 6 }
  ],
  [
    { season: 2, episode: 1 },
    { season: 2, episode: 2 }
  ]
]
*/
```

## License

MIT © [ewnd9](http://ewnd9.com)
