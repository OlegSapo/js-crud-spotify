// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

class Track {
  static #list = [] //статичне приватне поле для зберігання списку об'єктів Track

  constructor(name, author, image) {
    this.id = Math.floor(1000 + Math.random() * 9000) // створюємо унікальне випадкове ID
    this.name = name
    this.author = author
    this.image = image
  }

  static create(name, author, image) {
    const newTrack = new Track(name, author, image)
    this.#list.push(newTrack)
    return newTrack
  }

  static getList() {
    return this.#list.reverse()
  }

  static getByID(id) {
    return (
      Track.#list.find((track) => track.id === id) || null
    )
  }
}

Track.create(
  'Ticket to the Moon',
  'ELO',
  'https://picsum.photos/100/100',
)

Track.create(
  'Another One Bites The Dust',
  'Queen',
  'https://picsum.photos/100/100',
)

Track.create(
  'The sweet',
  'AC-DC',
  'https://picsum.photos/100/100',
)

Track.create(
  'Наш дом',
  'Машина времени',
  'https://picsum.photos/100/100',
)

Track.create(
  'After dark',
  'Tito & Tarantila',
  'https://picsum.photos/100/100',
)

Track.create(
  'Місто Марії',
  'Океан Ельзи',
  'https://picsum.photos/100/100',
)

// console.log(Track.getList())

class Playlist {
  static #list = []

  constructor(name) {
    this.id = Math.floor(1000 + Math.random() * 9000)
    this.name = name
    this.tracks = []
    this.image = 'https://picsum.photos/200/200'
  }

  static create(name) {
    const newPlaylist = new Playlist(name)
    this.#list.push(newPlaylist)
    return newPlaylist
  }

  static getList() {
    return this.#list.reverse()
  }

  static makeMix(playlist) {
    const allTracks = Track.getList()

    let randomTracks = allTracks
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)

    playlist.tracks.push(...randomTracks)
  }

  static getByID(id) {
    return (
      Playlist.#list.find(
        (playlist) => playlist.id === id,
      ) || null
    )
  }

  deleteTrackById(trackId) {
    this.tracks = this.tracks.filter(
      (track) => track.id !== trackId,
    )
  }

  static findListByValue(name) {
    return this.#list.filter((playlist) =>
      playlist.name
        .toLowerCase()
        .includes(name.toLowerCase()),
    )
  }

  static addTrack(playlist, track) {
    playlist.tracks.push(track)
  }
}

// ================================================================

router.get('/', function (req, res) {
  // початкова сторінка, список плейлистів
  let isPlaylists = false

  let track = Track.create(
    'Song',
    'Author',
    'https://picsum.photos/100/100',
  )
  const playlist = Playlist.create('DefaultPlaylist')
  playlist.tracks.push(track)
  const playlist2 = Playlist.create('DefaultPlaylist2')
  playlist2.tracks.push(track)
  playlist2.tracks.push(track)
  const playlist3 = Playlist.create('DefaultPlaylist3')
  playlist3.tracks.push(track)
  playlist3.tracks.push(track)
  playlist3.tracks.push(track)

  if (Playlist.getList().length !== 0) isPlaylists = true
  // console.log(isPlaylists)

  res.render('spotify-playlists', {
    style: 'spotify-playlists',

    data: {
      playlists: Playlist.getList(),
      isPlaylists: isPlaylists,
    },
  })
})

// ================================================================

router.get('/spotify-choose', function (req, res) {
  //вибір створення плейлиста або микса треків (при натисканні "+" на головній сторінці)

  res.render('spotify-choose', {
    style: 'spotify-choose',
    data: {},
  })
})

// ================================================================

router.get('/spotify-search', function (req, res) {
  //пошук плейлиста або микса треків (при натисканні "лупа" на головній сторінці)
  // console.log(Playlist.getList())
  const value = ''

  const list = Playlist.findListByValue(value)

  res.render('spotify-search', {
    style: 'spotify-search',
    data: {
      list: list.map(({ tracks, ...rest }) => ({
        ...rest,
        amount: tracks.length,
      })),
      value,
    },
  })
})

// ================================================================

router.post('/spotify-search', function (req, res) {
  //пошук плейлиста або микса треків (при натисканні "лупа" на головній сторінці)
  // console.log(Playlist.getList())
  const value = req.body.value || ''

  const list = Playlist.findListByValue(value)

  res.render('spotify-search', {
    style: 'spotify-search',
    data: {
      list: list.map(({ tracks, ...rest }) => ({
        ...rest,
        amount: tracks.length,
      })),
      value,
    },
  })
})

// ================================================================

router.get('/spotify-create', function (req, res) {
  // створення нового плейліста (GET)
  const isMix = !!req.query.isMix
  // console.log(isMix)

  res.render('spotify-create', {
    style: 'spotify-create',

    data: {
      isMix,
    },
  })
})

// ================================================================

router.post('/spotify-create', function (req, res) {
  // створення нового плейліста (POST)
  // console.log(1, req.body, 2, req.query)

  const isMix = !!req.query.isMix

  const name = req.body.name

  if (!name) {
    return res.render('alert', {
      style: 'alert',

      data: {
        message: 'Помилка',
        info: 'Ведіть назву плейліста',
        link: isMix
          ? `/spotify-create?isMix=${isMix}`
          : `/spotify-create`,
      },
    })
  }

  const playlist = Playlist.create(name)

  if (isMix) {
    Playlist.makeMix(playlist)
  }

  // console.log(playlist)

  res.render('spotify-playlist', {
    style: 'spotify-playlist',

    data: {
      playlistId: playlist.id,
      tracks: playlist.tracks,
      name: playlist.name,
    },
  })
})

// ================================================================

router.get('/spotify-playlist', function (req, res) {
  // відображення "змісту плейліста"
  const id = Number(res.query.id)

  const playlist = Playlist.getById(id)

  if (!playlist) {
    return res.render('alert', {
      style: 'alert',

      data: {
        message: 'Помилка',
        info: 'Такого плейліста не знайдено',
        link: `/`,
      },
    })
  }

  res.render('spotify-playlist', {
    style: 'spotify-playlist',

    data: {
      playlistId: playlist.id,
      tracks: playlist.tracks,
      name: playlist.name,
    },
  })
})

// ================================================================

router.get('/spotify-track-delete', function (req, res) {
  // видалення треку з плейліста
  const playlistId = Number(req.query.playlistId)
  const trackId = Number(req.query.trackId)
  const playlist = Playlist.getByID(playlistId)

  // console.log("playlist do Del", playlist)

  if (!playlist) {
    return res.render('alert', {
      style: 'alert',

      data: {
        message: 'Помилка',
        info: 'Такого плейліста не знайдено',
        link: `/spotify-playlist?id=${playlistId}`,
      },
    })
  }

  playlist.deleteTrackById(trackId)

  // console.log("playlist after Del", playlist)

  res.render('spotify-playlist', {
    style: 'spotify-playlist',

    data: {
      playlistId: playlist.id,
      tracks: playlist.tracks,
      name: playlist.name,
    },
  })
})

// ================================================================

router.get('/spotify-playlist-add', function (req, res) {
  // загальний перелік треків для додавання в плейліст (перехід зі сторінки "змісту плейліста")
  const playlistId = Number(req.query.playlistId)
  const playlist = Playlist.getByID(playlistId)

  // const trackId = Number(req.query.trackId)
  // const track = Track.getByID(trackId)

  // console.log("playlist do add: ", playlist)
  // console.log("new track: ", track)

  // playlist.tracks.push(track)

  // console.log("playlist after add: ", playlist)

  res.render('spotify-playlist-add', {
    style: 'spotify-playlist-add',

    data: {
      playlistId: playlist.id,
      tracks: Track.getList(),
    },
  })
})

// ================================================================

router.get('/spotify-track-add', function (req, res) {
  // додавання треку в плейліст
  const playlistId = Number(req.query.playlistId)
  const playlist = Playlist.getByID(playlistId)

  const trackId = Number(req.query.trackId)
  const track = Track.getByID(trackId)

  // console.log("playlist do add: ", playlist)
  // console.log("new track: ", track)

  // playlist.tracks.push(track)
  Playlist.addTrack(playlist, track)

  // console.log("playlist after add: ", playlist)

  res.render('spotify-playlist', {
    style: 'spotify-playlist',

    data: {
      playlistId: playlist.id,
      tracks: playlist.tracks,
      name: playlist.name,
    },
  })
})

// Підключаємо роутер до бек-енду
module.exports = router
